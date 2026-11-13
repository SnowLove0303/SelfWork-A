import React, { useState, useEffect, useRef, useMemo } from 'react';
import { DocPage, DocBlock, BlockType } from '../../../types/docs.ts';
import { BlockItem } from './BlockItem.tsx';
import { loadDocBlocks, saveDocBlocks } from '../../../services/docsDb.ts';
import {
  FileText,
  ListTree,
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
  const [showOutline] = useState(true);
  const titleInputRef = useRef<HTMLInputElement>(null);

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
          } else {
            setBlocks(fetched.sort((a, b) => a.sortOrder - b.sortOrder));
          }
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
    };
  }, [page.id]);

  // 2. 动态自动提取文档标题大纲索引 (Notion / 飞书风格)
  const outlineHeadings = useMemo<OutlineItem[]>(() => {
    return blocks
      .filter((b) => ['h1', 'h2', 'h3'].includes(b.blockType) && b.content.trim() !== '')
      .map((b) => ({
        id: b.id,
        type: b.blockType,
        text: b.content.trim(),
      }));
  }, [blocks]);

  // 3. 点击大纲平滑滚动至对应锚点
  const handleScrollToHeading = (blockId: string) => {
    const el = document.getElementById(`block-${blockId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setFocusedBlockId(blockId);
    }
  };

  // 4. 更新块内容与属性
  const handleUpdateBlock = async (
    blockId: string,
    content: string,
    blockType?: BlockType,
    properties?: Record<string, any>
  ) => {
    const nextBlocks = blocks.map((b) => {
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
    await saveDocBlocks(page.id, nextBlocks);
  };

  // 5. 在指定块下方插入新块
  const handleInsertBelow = async (currentBlockId: string, blockType: BlockType = 'p') => {
    const idx = blocks.findIndex((b) => b.id === currentBlockId);
    const newBlockId = 'b_' + Date.now();
    const newBlock: DocBlock = {
      id: newBlockId,
      pageId: page.id,
      blockType,
      content: '',
      sortOrder: (blocks[idx]?.sortOrder || 0) + 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const nextBlocks = [...blocks];
    nextBlocks.splice(idx + 1, 0, newBlock);

    // 重新规整序号
    nextBlocks.forEach((b, i) => {
      b.sortOrder = i + 1;
    });

    setBlocks(nextBlocks);
    setFocusedBlockId(newBlockId);
    await saveDocBlocks(page.id, nextBlocks);
  };

  // 6. 删除块
  const handleDeleteBlock = async (blockId: string) => {
    if (blocks.length <= 1) {
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
      setFocusedBlockId(resetBlock.id);
      await saveDocBlocks(page.id, [resetBlock]);
      return;
    }

    const idx = blocks.findIndex((b) => b.id === blockId);
    const prevBlock = blocks[idx - 1] || blocks[idx + 1];
    const nextBlocks = blocks.filter((b) => b.id !== blockId);

    setBlocks(nextBlocks);
    if (prevBlock) {
      setFocusedBlockId(prevBlock.id);
    }
    await saveDocBlocks(page.id, nextBlocks);
  };

  // 7. 焦点移动
  const handleFocusPrev = (currentBlockId: string) => {
    const idx = blocks.findIndex((b) => b.id === currentBlockId);
    if (idx > 0 && blocks[idx - 1]) {
      setFocusedBlockId(blocks[idx - 1].id);
    }
  };

  const handleFocusNext = (currentBlockId: string) => {
    const idx = blocks.findIndex((b) => b.id === currentBlockId);
    if (idx >= 0 && idx < blocks.length - 1 && blocks[idx + 1]) {
      setFocusedBlockId(blocks[idx + 1].id);
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
      </div>

      {/* 主工作区：左侧正文编辑区（标题靠左） + 右侧目录大纲栏（相对向右缩进伴随索引） */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* 页面内容正文区域 (标题与正文靠左主导阅读线) */}
        <div className="flex-1 overflow-y-auto px-8 lg:px-12 py-8 min-w-0">
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
                className="w-full text-2xl font-semibold text-white bg-transparent border-none outline-none placeholder-slate-600 leading-snug tracking-tight"
              />
            </div>

            {/* 块流渲染 */}
            <div className="space-y-0.5 min-h-[400px]">
              {blocks.map((block) => (
                <BlockItem
                  key={block.id}
                  block={block}
                  autoFocus={focusedBlockId === block.id}
                  onUpdate={(content, blockType, properties) =>
                    handleUpdateBlock(block.id, content, blockType, properties)
                  }
                  onDelete={() => handleDeleteBlock(block.id)}
                  onInsertBelow={(bType) => handleInsertBelow(block.id, bType)}
                  onFocusPrev={() => handleFocusPrev(block.id)}
                  onFocusNext={() => handleFocusNext(block.id)}
                />
              ))}
            </div>

            {/* 底部点击空白插入块 */}
            <div
              onClick={() => handleInsertBelow(blocks[blocks.length - 1]?.id || '', 'p')}
              className="py-12 cursor-text flex items-center justify-center text-xs text-slate-600 hover:text-slate-400 transition-colors"
            >
              <span>+ 点击空白处继续输入</span>
            </div>
          </div>
        </div>

        {/* 右侧大纲目录栏 (相对向右缩进排布，作为右侧伴随式索引栏) */}
        {showOutline && (
          <div className="w-56 lg:w-64 border-l border-white/5 bg-black/10 flex flex-col shrink-0 overflow-y-auto p-4 select-none animate-in fade-in duration-150">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium pb-3 border-b border-white/5 mb-3">
              <div className="flex items-center gap-1.5">
                <ListTree size={14} className="text-sky-400" />
                <span className="text-slate-200 font-semibold tracking-wide">目录大纲</span>
                <span className="text-[11px] text-slate-500 font-mono">({outlineHeadings.length})</span>
              </div>
            </div>

            {outlineHeadings.length === 0 ? (
              <div className="text-[11px] text-slate-600 italic py-2 leading-relaxed">
                暂无标题内容
              </div>
            ) : (
              <div className="space-y-1">
                {outlineHeadings.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleScrollToHeading(item.id)}
                    className={`w-full text-left text-xs py-1.5 px-2 rounded hover:bg-white/5 transition-colors truncate block flex items-center gap-1.5 ${
                      item.type === 'h1'
                        ? 'text-slate-200 font-medium'
                        : item.type === 'h2'
                        ? 'text-slate-400 pl-4 text-[11px]'
                        : 'text-slate-500 pl-7 text-[11px]'
                    }`}
                    title={item.text}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        item.type === 'h1'
                          ? 'bg-sky-400'
                          : item.type === 'h2'
                          ? 'bg-indigo-400/70'
                          : 'bg-slate-500/50'
                      }`}
                    />
                    <span className="truncate">{item.text}</span>
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
