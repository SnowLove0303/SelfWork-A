import React, { useState, useEffect, useRef } from 'react';
import { DocPage, DocBlock, BlockType } from '../../../types/docs.ts';
import { BlockItem } from './BlockItem.tsx';
import { loadDocBlocks, saveDocBlocks } from '../../../services/docsDb.ts';
import {
  FileText,
  Heading1,
  CheckSquare,
  Code,
} from 'lucide-react';

interface BlockEditorProps {
  page: DocPage;
  onUpdatePageTitle: (title: string) => void;
  onUpdatePageIcon?: (icon: string) => void;
}

const EMOJI_OPTIONS = ['📝', '🚀', '🎯', '💡', '📌', '⚡', '📊', '🔥', '💻', '✨'];

export const BlockEditor: React.FC<BlockEditorProps> = ({
  page,
  onUpdatePageTitle,
  onUpdatePageIcon,
}) => {
  const [blocks, setBlocks] = useState<DocBlock[]>([]);
  const [, setLoading] = useState(true);
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
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

  // 2. 更新块内容与属性
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

  // 3. 在指定块下方插入新块
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

  // 4. 删除块
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

  // 5. 焦点移动
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
      {/* 顶部状态与快速插块工具栏 (49px 高度对齐基准线) */}
      <div className="h-[49px] border-b border-white/5 px-6 flex items-center justify-between bg-black/20 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <FileText size={14} className="text-sky-400" />
          <span className="truncate font-medium text-slate-200">{page.title || '无标题文档'}</span>
          <span className="text-slate-600">·</span>
          <span className="text-[11px] text-slate-500">{blocks.length} 个块</span>
        </div>

        {/* 快速快捷插入条 */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleInsertBelow(blocks[blocks.length - 1]?.id || '', 'h1')}
            className="flex items-center gap-1 px-2 py-1 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded text-xs transition-colors"
            title="插入一级标题"
          >
            <Heading1 size={13} />
            <span>标题</span>
          </button>
          <button
            onClick={() => handleInsertBelow(blocks[blocks.length - 1]?.id || '', 'todo')}
            className="flex items-center gap-1 px-2 py-1 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded text-xs transition-colors"
            title="插入待办清单"
          >
            <CheckSquare size={13} />
            <span>待办</span>
          </button>
          <button
            onClick={() => handleInsertBelow(blocks[blocks.length - 1]?.id || '', 'code')}
            className="flex items-center gap-1 px-2 py-1 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded text-xs transition-colors"
            title="插入代码块"
          >
            <Code size={13} />
            <span>代码</span>
          </button>
        </div>
      </div>

      {/* 页面内容区域 (居中优雅版心) */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-3xl mx-auto space-y-4">
          {/* 文档图标与大标题 */}
          <div className="space-y-3 mb-6">
            <div className="relative inline-block">
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="text-3xl hover:bg-white/5 p-2 rounded-xl transition-colors cursor-pointer select-none"
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
              className="w-full text-3xl font-bold text-white bg-transparent border-none outline-none placeholder-slate-600 leading-tight"
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
    </div>
  );
};
