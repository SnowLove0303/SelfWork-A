import React, { useState } from 'react';
import {
  StickyNote,
  Plus,
  Pin,
  Copy,
  Check,
  Trash2,
  Palette,
  GripHorizontal,
} from 'lucide-react';
import { MemoItem, MemoTheme } from '../../types/tasks.ts';

interface MemoBoardProps {
  memos: MemoItem[];
  onAddMemo: () => void;
  onUpdateMemo: (id: string, updates: Partial<MemoItem>) => void;
  onDeleteMemo: (id: string) => void;
  onReorderMemos: (newMemos: MemoItem[]) => void;
}

const THEME_CYCLE: MemoTheme[] = ['neutral', 'blue', 'emerald', 'purple', 'amber'];

// 微调冷色调卡片样式映射
function getThemeStyles(theme: MemoTheme) {
  switch (theme) {
    case 'blue':
      return {
        bg: 'bg-sky-500/[0.06] hover:bg-sky-500/[0.09]',
        border: 'border-sky-400/20 hover:border-sky-400/35',
        accent: 'text-sky-400',
        dot: 'bg-sky-400',
      };
    case 'emerald':
      return {
        bg: 'bg-emerald-500/[0.06] hover:bg-emerald-500/[0.09]',
        border: 'border-emerald-400/20 hover:border-emerald-400/35',
        accent: 'text-emerald-400',
        dot: 'bg-emerald-400',
      };
    case 'purple':
      return {
        bg: 'bg-purple-500/[0.06] hover:bg-purple-500/[0.09]',
        border: 'border-purple-400/20 hover:border-purple-400/35',
        accent: 'text-purple-400',
        dot: 'bg-purple-400',
      };
    case 'amber':
      return {
        bg: 'bg-amber-500/[0.06] hover:bg-amber-500/[0.09]',
        border: 'border-amber-400/20 hover:border-amber-400/35',
        accent: 'text-amber-400',
        dot: 'bg-amber-400',
      };
    case 'neutral':
    default:
      return {
        bg: 'bg-white/[0.03] hover:bg-white/[0.05]',
        border: 'border-white/[0.08] hover:border-white/[0.15]',
        accent: 'text-fg-secondary',
        dot: 'bg-fg-muted',
      };
  }
}

// 格式化相对时间
function formatMemoTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}小时前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}天前`;
  const date = new Date(timestamp);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export const MemoBoard: React.FC<MemoBoardProps> = ({
  memos,
  onAddMemo,
  onUpdateMemo,
  onDeleteMemo,
  onReorderMemos,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [draggedMemoId, setDraggedMemoId] = useState<string | null>(null);
  const [dropTargetMemoId, setDropTargetMemoId] = useState<string | null>(null);

  // 置顶项优先排在前列展示，组内保持数组物理顺序
  const sortedMemos = [...memos].sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));

  // 复制便签内容到系统剪贴板
  const handleCopy = async (memo: MemoItem) => {
    const textToCopy = memo.title ? `${memo.title}\n\n${memo.content}` : memo.content;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedId(memo.id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      // 容错降级
      const textarea = document.createElement('textarea');
      textarea.value = textToCopy;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedId(memo.id);
      setTimeout(() => setCopiedId(null), 1500);
    }
  };

  // 切换便签主题
  const handleCycleTheme = (memo: MemoItem) => {
    const currentIndex = THEME_CYCLE.indexOf(memo.theme);
    const nextTheme = THEME_CYCLE[(currentIndex + 1) % THEME_CYCLE.length];
    onUpdateMemo(memo.id, { theme: nextTheme, updatedAt: Date.now() });
  };

  // 拖拽换位逻辑
  const handleDropMemo = (targetMemoId: string) => {
    if (!draggedMemoId || draggedMemoId === targetMemoId) return;
    const fromIndex = sortedMemos.findIndex((m) => m.id === draggedMemoId);
    const toIndex = sortedMemos.findIndex((m) => m.id === targetMemoId);
    if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return;

    const nextSorted = [...sortedMemos];
    const [moved] = nextSorted.splice(fromIndex, 1);
    // 跨越置顶区/非置顶区时自适应同步置顶属性
    const targetItem = sortedMemos[toIndex];
    const updatedMoved = { ...moved, isPinned: targetItem.isPinned, updatedAt: Date.now() };
    nextSorted.splice(toIndex, 0, updatedMoved);
    onReorderMemos(nextSorted);
    setDraggedMemoId(null);
    setDropTargetMemoId(null);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-transparent select-none min-w-0">
      {/* 顶部标题与操作栏 */}
      <div className="h-[49px] px-3.5 flex items-center justify-between border-b border-border-subtle bg-white/[0.01] shrink-0 min-w-0">
        <div className="flex items-center gap-2 shrink-0">
          <StickyNote className="w-4 h-4 text-amber-400 shrink-0" />
          <h2 className="text-xs font-semibold text-fg-primary tracking-tight font-mono shrink-0 whitespace-nowrap">
            灵感便签
          </h2>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/[0.06] text-fg-muted font-mono border border-white/[0.06] shrink-0 whitespace-nowrap">
            {memos.length} 条
          </span>
        </div>

        <button
          type="button"
          onClick={onAddMemo}
          className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary border border-brand-primary/30 transition-colors tactile-btn shrink-0 whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5 shrink-0" />
          <span>便签</span>
        </button>
      </div>

      {/* 便签卡片区 */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3 min-w-0">
        {sortedMemos.length === 0 ? (
          <div className="h-44 flex flex-col items-center justify-center text-center">
            <span className="text-xs text-fg-muted/50 font-mono shrink-0 whitespace-nowrap">
              暂无灵感便签，点击右上角 + 便签 记录
            </span>
          </div>
        ) : (
          sortedMemos.map((memo) => {
            const themeStyle = getThemeStyles(memo.theme);
            const isCopied = copiedId === memo.id;
            const isDragging = draggedMemoId === memo.id;
            const isDropTarget = dropTargetMemoId === memo.id;

            return (
              <div
                key={memo.id}
                draggable
                onDragStart={(e) => {
                  // 如果点击的是输入框、文本域或按钮，不触发卡片拖拽
                  if ((e.target as HTMLElement).closest('button, input, textarea')) {
                    e.preventDefault();
                    return;
                  }
                  e.dataTransfer.effectAllowed = 'move';
                  e.dataTransfer.setData('text/plain', memo.id);
                  setDraggedMemoId(memo.id);
                }}
                onDragEnd={() => {
                  setDraggedMemoId(null);
                  setDropTargetMemoId(null);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                }}
                onDragEnter={(e) => {
                  e.preventDefault();
                  if (draggedMemoId && draggedMemoId !== memo.id) {
                    setDropTargetMemoId(memo.id);
                  }
                }}
                onDragLeave={(e) => {
                  if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                  if (dropTargetMemoId === memo.id) {
                    setDropTargetMemoId(null);
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  handleDropMemo(memo.id);
                }}
                className={`group relative rounded-xl p-3 border transition-all duration-150 shadow-[0_2px_12px_rgba(0,0,0,0.25)] flex flex-col gap-2 min-w-0 cursor-grab active:cursor-grabbing ${
                  themeStyle.bg
                } ${
                  isDragging
                    ? 'opacity-30 scale-[0.98] border-dashed border-sky-400/60'
                    : isDropTarget
                    ? 'ring-2 ring-sky-400/70 border-sky-400 shadow-[0_0_16px_rgba(56,189,248,0.25)]'
                    : themeStyle.border
                }`}
              >
                {/* 顶部卡片操作栏 (悬停优雅浮现) */}
                <div className="flex items-center justify-between gap-1 text-fg-muted min-w-0">
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* 置顶指示与切换 */}
                    <button
                      type="button"
                      draggable={false}
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={() =>
                        onUpdateMemo(memo.id, {
                          isPinned: !memo.isPinned,
                          updatedAt: Date.now(),
                        })
                      }
                      title={memo.isPinned ? '取消置顶' : '置顶便签'}
                      className={`p-1 rounded transition-colors tactile-btn shrink-0 cursor-pointer ${
                        memo.isPinned
                          ? 'text-amber-400 bg-amber-400/10'
                          : 'hover:text-fg-primary opacity-0 group-hover:opacity-100 hover:bg-white/[0.06]'
                      }`}
                    >
                      <Pin className={`w-3.5 h-3.5 shrink-0 ${memo.isPinned ? 'fill-amber-400' : ''}`} />
                    </button>

                    {/* 主题微光圆点指示 (点击循环切换) */}
                    <button
                      type="button"
                      draggable={false}
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={() => handleCycleTheme(memo)}
                      title="切换微冷色调"
                      className="p-1 rounded opacity-0 group-hover:opacity-100 hover:text-fg-primary hover:bg-white/[0.06] transition-all tactile-btn flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <Palette className="w-3.5 h-3.5 shrink-0" />
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${themeStyle.dot}`} />
                    </button>
                  </div>

                  {/* 中间拖拽抓手 */}
                  <div
                    title="按住拖拽调整便签顺序"
                    className="flex-1 h-5 flex items-center justify-center cursor-grab active:cursor-grabbing opacity-25 group-hover:opacity-80 hover:!opacity-100 transition-opacity"
                  >
                    <GripHorizontal className="w-3.5 h-3 shrink-0 text-fg-muted" />
                  </div>

                  {/* 复制与删除 */}
                  <div className="flex items-center gap-1 shrink-0">
                    {/* 复制按钮 */}
                    <button
                      type="button"
                      draggable={false}
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={() => handleCopy(memo)}
                      title={isCopied ? '已复制到剪贴板' : '复制便签文本'}
                      className={`p-1 rounded transition-all tactile-btn relative shrink-0 cursor-pointer ${
                        isCopied
                          ? 'text-emerald-400 bg-emerald-500/20 opacity-100'
                          : 'opacity-0 group-hover:opacity-100 hover:text-fg-primary hover:bg-white/[0.06]'
                      }`}
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 shrink-0" /> : <Copy className="w-3.5 h-3.5 shrink-0" />}
                    </button>

                    {/* 删除按钮 */}
                    <button
                      type="button"
                      draggable={false}
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={() => onDeleteMemo(memo.id)}
                      title="删除便签"
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-500/20 hover:text-rose-400 transition-all tactile-btn shrink-0 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 shrink-0" />
                    </button>
                  </div>
                </div>

                {/* 便签标题输入框 (可选) */}
                <input
                  type="text"
                  draggable={false}
                  onMouseDown={(e) => e.stopPropagation()}
                  value={memo.title || ''}
                  placeholder="标题 (可选)..."
                  onChange={(e) =>
                    onUpdateMemo(memo.id, {
                      title: e.target.value,
                      updatedAt: Date.now(),
                    })
                  }
                  className="bg-transparent border-none text-xs font-semibold text-fg-primary placeholder:text-fg-muted/40 focus:outline-none focus:ring-0 p-0 min-w-0 cursor-text"
                />

                {/* 便签正文多行文本区 (自动高度/舒适阅读) */}
                <textarea
                  rows={Math.max(3, Math.min(10, (memo.content.split('\n').length || 1) + 1))}
                  draggable={false}
                  onMouseDown={(e) => e.stopPropagation()}
                  value={memo.content}
                  placeholder="随时记录灵感、命令、备忘..."
                  onChange={(e) =>
                    onUpdateMemo(memo.id, {
                      content: e.target.value,
                      updatedAt: Date.now(),
                    })
                  }
                  className="bg-transparent border-none text-[12px] leading-relaxed text-fg-secondary focus:text-fg-primary placeholder:text-fg-muted/40 focus:outline-none focus:ring-0 p-0 resize-y font-mono min-w-0 break-words cursor-text"
                />

                {/* 底部更新时间微标 */}
                <div className="flex items-center justify-end text-[10px] text-fg-muted/50 font-mono select-none">
                  <span>{formatMemoTime(memo.updatedAt)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
