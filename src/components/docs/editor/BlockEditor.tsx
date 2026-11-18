import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { DocPage, DocBlock, BlockType } from '../../../types/docs.ts';
import { BlockItem } from './BlockItem.tsx';
import { BlockToggle } from './BlockToggle.tsx';
import { loadDocBlocks, saveDocBlocks } from '../../../services/docsDb.ts';
import { exportBlocksToMarkdown } from '../../../services/markdownExport.ts';
import {
  FileText,
  ListTree,
  PanelRightClose,
  PanelRightOpen,
  Undo2,
  Redo2,
  Download,
  Image as ImageIcon,
  Trash2,
  X,
  Check,
  Palette,
} from 'lucide-react';

interface BlockEditorProps {
  page: DocPage;
  onUpdatePageTitle: (title: string) => void;
  onUpdatePageIcon?: (icon: string) => void;
  onUpdatePageCover?: (cover: string) => void;
  pages?: DocPage[];
  onNavigatePage?: (pageId: string) => void;
}

const EMOJI_OPTIONS = ['📝', '🚀', '🎯', '💡', '📌', '⚡', '📊', '🔥', '💻', '✨'];

export const PRESET_COVERS = [
  { id: 'space', name: '深空', value: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)' },
  { id: 'aurora', name: '极光', value: 'linear-gradient(135deg, #022c22 0%, #064e3b 50%, #0f766e 100%)' },
  { id: 'sunset', name: '暮落', value: 'linear-gradient(135deg, #450a0a 0%, #7c2d12 50%, #b45309 100%)' },
  { id: 'violet', name: '电紫', value: 'linear-gradient(135deg, #2e1065 0%, #581c87 50%, #7e22ce 100%)' },
  { id: 'midnight', name: '湛夜', value: 'linear-gradient(135deg, #082f49 0%, #0369a1 50%, #0284c7 100%)' },
  { id: 'emerald', name: '林郁', value: 'linear-gradient(135deg, #052e16 0%, #14532d 50%, #166534 100%)' },
  { id: 'neon', name: '绛夜', value: 'linear-gradient(135deg, #4c0519 0%, #831843 50%, #9d174d 100%)' },
  { id: 'obsidian', name: '黑曜', value: 'linear-gradient(135deg, #18181b 0%, #27272a 50%, #3f3f46 100%)' },
];

interface OutlineItem {
  id: string;
  type: BlockType;
  text: string;
}

export const BlockEditor: React.FC<BlockEditorProps> = ({
  page,
  onUpdatePageTitle,
  onUpdatePageIcon,
  onUpdatePageCover,
  pages,
  onNavigatePage,
}) => {
  const [blocks, setBlocks] = useState<DocBlock[]>([]);
  const [, setLoading] = useState(true);
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const [customCoverUrl, setCustomCoverUrl] = useState('');
  const [showOutline, setShowOutline] = useState(true);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // 当封面选择器打开时，同步已有自定义图片链接
  useEffect(() => {
    if (showCoverPicker) {
      if (page.cover && !page.cover.startsWith('linear-gradient')) {
        setCustomCoverUrl(page.cover);
      } else {
        setCustomCoverUrl('');
      }
    }
  }, [showCoverPicker, page.cover]);

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

  // 导出为 Markdown（降级至剪贴板，不依赖 Tauri dialog/fs 插件）
  const handleExportMarkdown = useCallback(async () => {
    const md = exportBlocksToMarkdown(page.title, page.icon, blocksRef.current);
    try {
      await navigator.clipboard.writeText(md);
      alert(`Markdown 已复制到剪贴板（${blocksRef.current.length} 个块）`);
    } catch {
      console.error('[Export] 复制到剪贴板失败', md);
    }
  }, [page.title, page.icon]);

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
            <button
              onClick={handleExportMarkdown}
              className="p-1 hover:bg-white/10 text-slate-400 hover:text-slate-200 rounded transition-colors"
              title="导出为 Markdown (.md)"
            >
              <Download size={13} />
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
        {/* 页面内容正文区域 (包含顶部沉浸式大封面条带及正文流) */}
        <div className="flex-1 overflow-y-auto min-w-0 doc-typography custom-scrollbar">
          {/* 若 page.cover 存在：在页面正文滚动区最顶端渲染 h-40 的大封面条带 */}
          {page.cover && (
            <div className="relative w-full h-40 group select-none overflow-hidden shrink-0">
              {page.cover.startsWith('linear-gradient') ? (
                <div
                  className="w-full h-full transition-all duration-300"
                  style={{ background: page.cover }}
                />
              ) : (
                <img
                  src={page.cover}
                  alt="页面封面"
                  className="w-full h-full object-cover transition-all duration-300"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              )}
              {/* 悬停在封面右上角显示轻量半透明胶囊操作组：「更换封面」与「移除封面」 */}
              <div className="absolute top-3 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg p-1 text-xs text-slate-200 shadow-lg">
                <button
                  onClick={() => setShowCoverPicker(true)}
                  className="px-2 py-1 hover:bg-white/10 hover:text-white rounded flex items-center gap-1.5 transition-colors"
                  title="更换封面"
                >
                  <ImageIcon size={13} className="text-sky-400" />
                  <span>更换封面</span>
                </button>
                <button
                  onClick={() => onUpdatePageCover?.('')}
                  className="px-2 py-1 hover:bg-white/10 hover:text-red-300 rounded flex items-center gap-1.5 transition-colors"
                  title="移除封面"
                >
                  <Trash2 size={13} className="text-red-400" />
                  <span>移除封面</span>
                </button>
              </div>
            </div>
          )}

          <div className={`px-8 lg:px-12 ${page.cover ? 'pb-48 pt-0' : 'pt-8 pb-48'}`}>
            <div className="max-w-3xl lg:max-w-4xl space-y-4">
              {/* 文档图标与大标题 (若有 cover，Emoji 使用 -mt-7 ml-8 浮空重叠在封面上) */}
              <div className="space-y-2 mb-6 group/header">
                <div className="flex items-center gap-2">
                  <div className={`relative inline-block ${page.cover ? '-mt-7 ml-8' : ''} z-10`}>
                    <button
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className={`text-2xl p-1.5 rounded-xl transition-all cursor-pointer select-none ${
                        page.cover
                          ? 'bg-[#0a0d14]/90 backdrop-blur border border-white/10 shadow-lg hover:bg-white/10'
                          : 'hover:bg-white/5'
                      }`}
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

                  {/* 若 page.cover 不存在：标题区域上方或悬停时，在更换图标按钮旁边提供极其隐蔽优雅的「🖼️ 添加封面」按钮 */}
                  {!page.cover && (
                    <button
                      onClick={() => {
                        onUpdatePageCover?.(PRESET_COVERS[0].value);
                        setShowCoverPicker(true);
                      }}
                      className="opacity-0 group-hover/header:opacity-100 transition-opacity text-xs text-slate-400 hover:text-slate-200 hover:bg-white/5 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 select-none"
                      title="添加页面封面"
                    >
                      <span>🖼️</span>
                      <span>添加封面</span>
                    </button>
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
                {/* 标题与正文黄金过渡层 */}
                <div className="mt-4 mb-2 border-b border-white/[0.04]" />
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
                if (block.blockType === 'toggle') {
                  return (
                    <BlockToggle
                      key={block.id}
                      block={block}
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
                    pages={pages}
                    onNavigatePage={onNavigatePage}
                  />
                );
              })}
            </div>

            {/* 底部打字机留白与点击空白插入块 */}
            <div
              onClick={() => handleInsertBelow(blocks[blocks.length - 1]?.id || '', 'p')}
              className="py-10 mt-6 cursor-text flex items-center justify-center text-xs font-mono text-slate-600 hover:text-slate-400 transition-colors border border-dashed border-transparent hover:border-white/10 rounded-xl select-none"
            >
              + 点击此处添加新段落，或按 '/' 唤出快捷菜单...
            </div>
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

      {/* 封面选择器弹窗 (CoverPicker) */}
      {showCoverPicker && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px] animate-in fade-in duration-150"
          onClick={() => setShowCoverPicker(false)}
        >
          <div
            className="bg-[#12161f] border border-white/10 rounded-2xl shadow-2xl p-5 w-full max-w-md space-y-4 select-none animate-in zoom-in-95 duration-150 text-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-200">
                <Palette size={16} className="text-sky-400" />
                <span>选择封面壁纸</span>
              </div>
              <button
                onClick={() => setShowCoverPicker(false)}
                className="p-1 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition-colors"
                title="关闭"
              >
                <X size={15} />
              </button>
            </div>

            {/* 8 款预设渐变壁纸 */}
            <div>
              <div className="text-xs text-slate-400 mb-2 font-medium">渐变壁纸</div>
              <div className="grid grid-cols-4 gap-2.5">
                {PRESET_COVERS.map((preset) => {
                  const isSelected = page.cover === preset.value;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => {
                        onUpdatePageCover?.(preset.value);
                      }}
                      className={`group relative h-14 rounded-xl overflow-hidden border transition-all duration-200 flex items-end p-1.5 text-left ${
                        isSelected
                          ? 'border-sky-400 ring-2 ring-sky-400/30 scale-105'
                          : 'border-white/10 hover:border-white/30 hover:scale-[1.03]'
                      }`}
                      style={{ background: preset.value }}
                      title={preset.name}
                    >
                      <span className="text-[11px] font-medium text-white/90 drop-shadow-md truncate">
                        {preset.name}
                      </span>
                      {isSelected && (
                        <span className="absolute top-1 right-1 bg-sky-500 text-white rounded-full p-0.5 shadow">
                          <Check size={10} strokeWidth={3} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 自定义图片 URL */}
            <div className="pt-2 border-t border-white/5">
              <div className="text-xs text-slate-400 mb-2 font-medium">自定义图片 URL</div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (customCoverUrl.trim()) {
                    onUpdatePageCover?.(customCoverUrl.trim());
                    setShowCoverPicker(false);
                  }
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="url"
                  value={customCoverUrl}
                  onChange={(e) => setCustomCoverUrl(e.target.value)}
                  placeholder="输入图片网络链接 (https://...)"
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-sky-500 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!customCoverUrl.trim()}
                  className="px-3.5 py-2 bg-sky-500 hover:bg-sky-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-medium rounded-xl transition-colors shrink-0 shadow-sm"
                >
                  应用
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
