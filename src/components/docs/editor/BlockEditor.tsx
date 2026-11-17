import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { DocPage, DocBlock, BlockType } from '../../../types/docs.ts';
import { BlockItem } from './BlockItem.tsx';
import { loadDocBlocks, saveDocBlocks } from '../../../services/docsDb.ts';
import {
  FileText,
  ListTree,
  PanelRightClose,
  PanelRightOpen,
  Undo2,
  Redo2,
} from 'lucide-react';

interface BlockEditorProps {
  page: DocPage;
  onUpdatePageTitle: (title: string) => void;
  onUpdatePageIcon?: (icon: string) => void;
}

const EMOJI_OPTIONS = ['📝', '🚀', '🎯', '💡', '📌', '⚡', '📊', '🔥', '💻', '✨'];

interface OutlineItem {
  id: string;
  type: BlockType;
  text: string;
}

export const BlockEditor: React.FC<BlockEditorProps> = ({
  page,
  onUpdatePageTitle,
  onUpdatePageIcon,
}) => {
  const [blocks, setBlocks] = useState<DocBlock[]>([]);
  const [, setLoading] = useState(true);
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showOutline, setShowOutline] = useState(true);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // 引用最新 blocks 状态，杜绝闭包陈旧问题
  const blocksRef = useRef<DocBlock[]>(blocks);
  blocksRef.current = blocks;

  // 历史栈 (Undo / Redo)
  const undoStackRef = useRef<DocBlock[][]>([]);
  const redoStackRef = useRef<DocBlock[][]>([]);
  const lastTypingTimeRef = useRef<number>(0);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 压入 Undo 栈
  const pushUndo = useCallback((snapshot: DocBlock[]) => {
    undoStackRef.current.push(JSON.parse(JSON.stringify(snapshot)));
    if (undoStackRef.current.length > 50) {
      undoStackRef.current.shift();
    }
    redoStackRef.current = [];
  }, []);

  // 执行撤销 (Ctrl+Z)
  const handleUndo = useCallback(async () => {
    if (undoStackRef.current.length === 0) return;
    const previous = undoStackRef.current.pop()!;
    redoStackRef.current.push(JSON.parse(JSON.stringify(blocksRef.current)));
    setBlocks(previous);
    blocksRef.current = previous;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    await saveDocBlocks(page.id, previous);
  }, [page.id]);

  // 执行重做 (Ctrl+Y / Ctrl+Shift+Z)
  const handleRedo = useCallback(async () => {
    if (redoStackRef.current.length === 0) return;
    const next = redoStackRef.current.pop()!;
    undoStackRef.current.push(JSON.parse(JSON.stringify(blocksRef.current)));
    setBlocks(next);
    blocksRef.current = next;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    await saveDocBlocks(page.id, next);
  }, [page.id]);

  // 全局撤销/重做快捷键监听
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // 当焦点处于普通文本输入框(非文档内容)时，优先允许默认行为
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [handleUndo, handleRedo]);

  // 1. 加载块流
  useEffect(() => {
    let isMounted = true;
    const fetchBlocks = async () => {
      setLoading(true);
      try {
        const fetched = await loadDocBlocks(page.id);
        if (isMounted) {
          if (fetched.length === 0) {
            // 若完全为空，提供默认初始块
            const defaultBlock: DocBlock = {
              id: 'b_' + Date.now(),
              pageId: page.id,
              blockType: 'p',
              content: '',
              sortOrder: 1,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            };
            setBlocks([defaultBlock]);
            blocksRef.current = [defaultBlock];
          } else {
            const sorted = fetched.sort((a, b) => a.sortOrder - b.sortOrder);
            setBlocks(sorted);
            blocksRef.current = sorted;
          }
          undoStackRef.current = [];
          redoStackRef.current = [];
        }
      } catch (err) {
        console.error('Failed to load blocks:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchBlocks();
    return () => {
      isMounted = false;
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveDocBlocks(page.id, blocksRef.current);
      }
    };
  }, [page.id]);

  // 2. 动态自动提取文档标题大纲索引 (纯文本清洗，杜绝 Markdown 与 HTML 符号污染)
  const outlineHeadings = useMemo<OutlineItem[]>(() => {
    return blocks
      .filter((b) => ['h1', 'h2', 'h3'].includes(b.blockType) && b.content.trim() !== '')
      .map((b) => {
        const cleanText = b.content
          .replace(/<[^>]*>/g, '')
          .replace(/\*\*(.*?)\*\*/g, '$1')
          .replace(/\*(.*?)\*/g, '$1')
          .replace(/~~(.*?)~~/g, '$1')
          .replace(/`(.*?)`/g, '$1')
          .trim();
        return {
          id: b.id,
          type: b.blockType,
          text: cleanText || b.content.trim(),
        };
      })
      .filter((item) => item.text !== '');
  }, [blocks]);

  // 3. 点击大纲平滑滚动至对应锚点
  const handleScrollToHeading = (blockId: string) => {
    const el = document.getElementById(`block-${blockId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setFocusedBlockId(blockId);
    }
  };

  // 4. 更新块内容与属性 (支持防抖保存与结构变更入栈)
  const handleUpdateBlock = (
    blockId: string,
    content: string,
    blockType?: BlockType,
    properties?: Record<string, any>,
    isStructural?: boolean
  ) => {
    const now = Date.now();
    const prevBlock = blocksRef.current.find((b) => b.id === blockId);
    const prevContent = prevBlock?.content || '';

    // 快照分词切分准则：结构性变更、初始首字、停顿超800ms或标点符号切分
    const timeDiff = now - lastTypingTimeRef.current;
    const isPunctuation = /[\s，。！？,.!?:;]$/.test(content);
    const hasLengthChange = Math.abs(content.length - prevContent.length) >= 2;

    if (
      isStructural ||
      (prevContent === '' && content !== '') ||
      timeDiff > 800 ||
      (isPunctuation && hasLengthChange && timeDiff > 400)
    ) {
      pushUndo(blocksRef.current);
    }
    lastTypingTimeRef.current = now;

    const nextBlocks = blocksRef.current.map((b) => {
      if (b.id !== blockId) return b;
      return {
        ...b,
        content,
        blockType: blockType !== undefined ? blockType : b.blockType,
        properties: properties !== undefined ? properties : b.properties,
        updatedAt: Date.now(),
      };
    });
    setBlocks(nextBlocks);
    blocksRef.current = nextBlocks;

    // 500ms 防抖保存至底层 SQLite
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveDocBlocks(page.id, nextBlocks);
    }, 500);
  };

  // 5. 在指定块下方插入新块
  const handleInsertBelow = async (currentBlockId: string, blockType: BlockType = 'p') => {
    pushUndo(blocksRef.current);
    const idx = blocksRef.current.findIndex((b) => b.id === currentBlockId);
    const newBlockId = 'b_' + Date.now();
    const newBlock: DocBlock = {
      id: newBlockId,
      pageId: page.id,
      blockType,
      content: '',
      sortOrder: (blocksRef.current[idx]?.sortOrder || 0) + 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const nextBlocks = [...blocksRef.current];
    nextBlocks.splice(idx + 1, 0, newBlock);

    // 重新规整序号
    nextBlocks.forEach((b, i) => {
      b.sortOrder = i + 1;
    });

    setBlocks(nextBlocks);
    blocksRef.current = nextBlocks;
    setFocusedBlockId(newBlockId);
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    await saveDocBlocks(page.id, nextBlocks);
  };

  // 6. 删除块
  const handleDeleteBlock = async (blockId: string) => {
    pushUndo(blocksRef.current);
    if (blocksRef.current.length <= 1) {
      // 保持至少一个空块
      const resetBlock: DocBlock = {
        id: 'b_' + Date.now(),
        pageId: page.id,
        blockType: 'p',
        content: '',
        sortOrder: 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setBlocks([resetBlock]);
      blocksRef.current = [resetBlock];
      setFocusedBlockId(resetBlock.id);
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      await saveDocBlocks(page.id, [resetBlock]);
      return;
    }

    const idx = blocksRef.current.findIndex((b) => b.id === blockId);
    const prevBlock = blocksRef.current[idx - 1] || blocksRef.current[idx + 1];
    const nextBlocks = blocksRef.current.filter((b) => b.id !== blockId);

    setBlocks(nextBlocks);
    blocksRef.current = nextBlocks;
    if (prevBlock) {
      setFocusedBlockId(prevBlock.id);
    }
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    await saveDocBlocks(page.id, nextBlocks);
  };

  // 7. 焦点移动
  const handleFocusPrev = (currentBlockId: string) => {
    const idx = blocksRef.current.findIndex((b) => b.id === currentBlockId);
    if (idx > 0 && blocksRef.current[idx - 1]) {
      setFocusedBlockId(blocksRef.current[idx - 1].id);
    }
  };

  const handleFocusNext = (currentBlockId: string) => {
    const idx = blocksRef.current.findIndex((b) => b.id === currentBlockId);
    if (idx >= 0 && idx < blocksRef.current.length - 1 && blocksRef.current[idx + 1]) {
      setFocusedBlockId(blocksRef.current[idx + 1].id);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0a0d14] text-slate-100 overflow-hidden select-text">
      {/* 顶部状态与面包屑栏 (49px 高度对齐基准线，清理冗余右上角按钮) */}
      <div className="h-[49px] border-b border-white/5 px-6 flex items-center justify-between bg-black/20 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <FileText size={14} className="text-sky-400" />
          <span className="truncate font-medium text-slate-200">{page.title || '无标题文档'}</span>
          <span className="text-slate-600">·</span>
          <span className="text-[11px] text-slate-500">{blocks.length} 个块</span>
        </div>

        {/* 右侧动作栏：撤销/重做快捷入口与大纲控制入口 */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white/[0.03] border border-white/5 rounded-lg p-0.5 select-none">
            <button
              onClick={() => handleUndo()}
              className="p-1 hover:bg-white/10 text-slate-400 hover:text-slate-200 rounded transition-colors"
              title="撤销 (Ctrl+Z)"
            >
              <Undo2 size={13} />
            </button>
            <button
              onClick={() => handleRedo()}
              className="p-1 hover:bg-white/10 text-slate-400 hover:text-slate-200 rounded transition-colors"
              title="重做 (Ctrl+Y / Ctrl+Shift+Z)"
            >
              <Redo2 size={13} />
            </button>
          </div>

          {!showOutline && (
            <button
              onClick={() => setShowOutline(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-400 hover:text-sky-300 bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 rounded-lg transition-colors select-none"
              title="展开目录大纲"
            >
              <PanelRightOpen size={13} className="text-sky-400" />
              <span>目录大纲</span>
              {outlineHeadings.length > 0 && (
                <span className="text-[10px] text-slate-500 font-mono">({outlineHeadings.length})</span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* 主工作区：左侧正文编辑区（标题靠左） + 右侧目录大纲栏（相对向右缩进伴随索引） */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* 页面内容正文区域 (标题与正文靠左主导阅读线) */}
        <div className="flex-1 overflow-y-auto px-8 lg:px-12 py-8 min-w-0 doc-typography">
          <div className="max-w-3xl lg:max-w-4xl space-y-4">
            {/* 文档图标与大标题 (字号精调为优雅收敛的 text-2xl font-semibold) */}
            <div className="space-y-2 mb-6">
              <div className="relative inline-block">
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="text-2xl hover:bg-white/5 p-1.5 rounded-xl transition-colors cursor-pointer select-none"
                  title="更换图标"
                >
                  {page.icon || '📝'}
                </button>

                {showEmojiPicker && (
                  <div className="absolute left-0 top-full mt-1 bg-slate-900 border border-white/10 rounded-xl shadow-2xl p-2 z-50 flex gap-1.5 animate-in fade-in duration-100">
                    {EMOJI_OPTIONS.map((emo) => (
                      <button
                        key={emo}
                        onClick={() => {
                          onUpdatePageIcon?.(emo);
                          setShowEmojiPicker(false);
                        }}
                        className="text-xl p-1.5 hover:bg-white/10 rounded-lg transition-transform hover:scale-110"
                      >
                        {emo}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <input
                ref={titleInputRef}
                type="text"
                value={page.title}
                onChange={(e) => onUpdatePageTitle(e.target.value)}
                placeholder="无标题文档"
                className="w-full text-3xl font-bold text-white bg-transparent border-none outline-none placeholder-slate-600 leading-snug tracking-tight"
              />
            </div>

            {/* 块流渲染 */}
            <div className="space-y-0.5 min-h-[400px]">
              {blocks.map((block, idx) => {
                // 计算有序列表块的连续序号（遇到非 numbered 块重置计数）
                let seqNumber: number | undefined;
                if (block.blockType === 'numbered') {
                  let count = 0;
                  for (let i = idx; i >= 0; i--) {
                    if (blocks[i].blockType === 'numbered') {
                      count++;
                    } else {
                      break;
                    }
                  }
                  seqNumber = count;
                }
                return (
                  <BlockItem
                    key={block.id}
                    block={block}
                    seqNumber={seqNumber}
                    autoFocus={focusedBlockId === block.id}
                    onUpdate={(content, blockType, properties, isStructural) =>
                      handleUpdateBlock(block.id, content, blockType, properties, isStructural)
                    }
                    onDelete={() => handleDeleteBlock(block.id)}
                    onInsertBelow={(bType) => handleInsertBelow(block.id, bType)}
                    onFocusPrev={() => handleFocusPrev(block.id)}
                    onFocusNext={() => handleFocusNext(block.id)}
                  />
                );
              })}
            </div>

            {/* 底部点击空白插入块 */}
            <div
              onClick={() => handleInsertBelow(blocks[blocks.length - 1]?.id || '', 'p')}
              className="py-12 cursor-text flex items-center justify-center text-sm text-slate-500 hover:text-slate-300 transition-colors"
            >
              点击此处添加新段落，或按 '/' 唤出格式菜单...
            </div>
          </div>
        </div>

        {/* 右侧轻量目录大纲栏 (Notion 风格微光胶囊，字号与间距精心收敛) */}
        {showOutline && (
          <div className="w-56 border-l border-white/5 bg-black/10 backdrop-blur-sm p-4 flex flex-col shrink-0 select-none">
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/5">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
                <ListTree size={14} className="text-sky-400" />
                <span>目录大纲</span>
              </div>
              <button
                onClick={() => setShowOutline(false)}
                className="p-1 hover:bg-white/5 text-slate-500 hover:text-slate-300 rounded-md transition-colors"
                title="收起大纲"
              >
                <PanelRightClose size={13} />
              </button>
            </div>

            {outlineHeadings.length === 0 ? (
              <div className="text-[11px] text-slate-600 py-6 text-center italic">
                当前文档暂无标题 (H1/H2/H3)
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                {outlineHeadings.map((heading) => (
                  <button
                    key={heading.id}
                    onClick={() => handleScrollToHeading(heading.id)}
                    className={`w-full text-left truncate rounded-md transition-colors block text-xs py-1 px-1.5 ${
                      heading.type === 'h1'
                        ? 'font-medium text-slate-200 hover:text-white hover:bg-white/5 pl-1.5'
                        : heading.type === 'h2'
                        ? 'text-slate-400 hover:text-slate-200 hover:bg-white/5 pl-4'
                        : 'text-slate-500 hover:text-slate-300 hover:bg-white/5 pl-6 text-[11px]'
                    }`}
                    title={heading.text}
                  >
                    {heading.text}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
