import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { BlockType } from '../../../types/docs.ts';
import {
  Bold,
  Italic,
  Strikethrough,
  Code as CodeIcon,
  Eraser,
  Copy,
  Scissors,
  Heading1,
  Heading2,
  Heading3,
  Type,
  CheckSquare,
  List,
  Quote,
  Palette,
  Sparkles,
} from 'lucide-react';

export interface BlockContextMenuProps {
  position: { x: number; y: number };
  hasSelection: boolean;
  selectedText: string;
  currentBlockType: BlockType;
  onApplyFormat: (format: 'bold' | 'italic' | 'strike' | 'code' | 'clear') => void;
  onApplyColor: (color: string) => void;
  onApplyHighlight: (highlight: string) => void;
  onTurnInto: (type: BlockType) => void;
  onCopy: () => void;
  onCut: () => void;
  onClose: () => void;
}

const TEXT_COLORS = [
  { id: 'default', label: '默认', bgClass: 'bg-slate-200' },
  { id: 'rose', label: '绯红', bgClass: 'bg-rose-500' },
  { id: 'orange', label: '暖橙', bgClass: 'bg-amber-500' },
  { id: 'yellow', label: '明黄', bgClass: 'bg-yellow-400' },
  { id: 'green', label: '苍翠', bgClass: 'bg-emerald-500' },
  { id: 'sky', label: '晴蓝', bgClass: 'bg-sky-400' },
  { id: 'purple', label: '浅紫', bgClass: 'bg-purple-400' },
];

const HIGHLIGHT_COLORS = [
  { id: 'none', label: '无底色', bgClass: 'bg-slate-700/50 border border-white/20' },
  { id: 'yellow', label: '鹅黄高亮', bgClass: 'bg-yellow-400/80' },
  { id: 'green', label: '薄荷高亮', bgClass: 'bg-emerald-400/80' },
  { id: 'sky', label: '冰蓝高亮', bgClass: 'bg-sky-400/80' },
  { id: 'rose', label: '淡粉高亮', bgClass: 'bg-rose-400/80' },
  { id: 'purple', label: '淡紫高亮', bgClass: 'bg-purple-400/80' },
];

const TURN_INTO_OPTIONS: { type: BlockType; label: string; icon: React.ReactNode }[] = [
  { type: 'p', label: '普通正文', icon: <Type size={13} className="text-slate-400" /> },
  { type: 'h1', label: '一级大标题 (H1)', icon: <Heading1 size={13} className="text-sky-400" /> },
  { type: 'h2', label: '二级小节标题 (H2)', icon: <Heading2 size={13} className="text-emerald-400" /> },
  { type: 'h3', label: '三级重点标题 (H3)', icon: <Heading3 size={13} className="text-amber-400" /> },
  { type: 'todo', label: '待办清单 (To-do)', icon: <CheckSquare size={13} className="text-purple-400" /> },
  { type: 'bullet', label: '项目符号 (Bullet)', icon: <List size={13} className="text-cyan-400" /> },
  { type: 'quote', label: '引用区块 (Quote)', icon: <Quote size={13} className="text-yellow-400" /> },
  { type: 'code', label: '技术代码块 (Code)', icon: <CodeIcon size={13} className="text-rose-400" /> },
];

export const BlockContextMenu: React.FC<BlockContextMenuProps> = ({
  position,
  hasSelection,
  onApplyFormat,
  onApplyColor,
  onApplyHighlight,
  onTurnInto,
  onCopy,
  onCut,
  onClose,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [stylePos, setStylePos] = useState({ top: position.y, left: position.x });

  // 1. 视窗碰撞检测自适应防溢出算法
  useEffect(() => {
    const padding = 12;
    const menuWidth = 288; // w-72 = 18rem = 288px
    const menuHeight = 360;

    let left = position.x;
    let top = position.y;

    if (left + menuWidth > window.innerWidth - padding) {
      left = Math.max(padding, window.innerWidth - menuWidth - padding);
    }
    if (top + menuHeight > window.innerHeight - padding) {
      top = Math.max(padding, top - menuHeight);
    }
    setStylePos({ top, left });
  }, [position]);

  // 2. 点击外部与 Esc 键自动关闭 (增加 50ms 延迟挂载与右键忽略)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    const handleOutsideClick = (e: MouseEvent) => {
      if (e.button === 2) return;
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    timer = setTimeout(() => {
      window.addEventListener('mousedown', handleOutsideClick);
      window.addEventListener('keydown', handleKeyDown);
    }, 50);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // 使用 React Portal 直接注入 document.body，彻底逃脱任何父容器的 backdrop-filter 与 overflow 裁剪
  return createPortal(
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        top: `${stylePos.top}px`,
        left: `${stylePos.left}px`,
        zIndex: 999999,
      }}
      onContextMenu={(e) => e.preventDefault()}
      className="w-72 bg-[#0c101a]/98 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl p-2.5 text-slate-200 select-none animate-in fade-in zoom-in-95 duration-100 space-y-2.5 pointer-events-auto"
    >
      {/* 1. 行内排版工具行 (仅在有选区时重点高亮) */}
      <div>
        <div className="text-[10px] uppercase font-mono tracking-wider text-slate-500 mb-1 px-1">
          {hasSelection ? '选区排版格式' : '快捷排版'}
        </div>
        <div className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/5">
          <button
            onClick={() => onApplyFormat('bold')}
            className="flex-1 py-1 px-1.5 flex items-center justify-center rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            title="加粗 (Ctrl+B)"
          >
            <Bold size={13} />
          </button>
          <button
            onClick={() => onApplyFormat('italic')}
            className="flex-1 py-1 px-1.5 flex items-center justify-center rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            title="斜体 (Ctrl+I)"
          >
            <Italic size={13} />
          </button>
          <button
            onClick={() => onApplyFormat('strike')}
            className="flex-1 py-1 px-1.5 flex items-center justify-center rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            title="删除线"
          >
            <Strikethrough size={13} />
          </button>
          <button
            onClick={() => onApplyFormat('code')}
            className="flex-1 py-1 px-1.5 flex items-center justify-center rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            title="行内代码"
          >
            <CodeIcon size={13} />
          </button>
          <div className="w-px h-3.5 bg-white/10 mx-0.5" />
          <button
            onClick={() => onApplyFormat('clear')}
            className="flex-1 py-1 px-1.5 flex items-center justify-center rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition-colors"
            title="清除所有格式"
          >
            <Eraser size={13} />
          </button>
        </div>
      </div>

      {/* 2. 字体色盘与荧光高亮色盘 */}
      <div className="space-y-1.5 pt-1 border-t border-white/5">
        <div className="flex items-center justify-between text-[10px] uppercase font-mono tracking-wider text-slate-500 px-1">
          <span className="flex items-center gap-1">
            <Palette size={11} className="text-sky-400" />
            <span>文字颜色</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-1">
          {TEXT_COLORS.map((c) => (
            <button
              key={c.id}
              onClick={() => onApplyColor(c.id)}
              className="group relative p-0.5 rounded-full hover:scale-110 transition-transform"
              title={`文字色: ${c.label}`}
            >
              <div className={`w-4 h-4 rounded-full ${c.bgClass} shadow-sm`} />
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between text-[10px] uppercase font-mono tracking-wider text-slate-500 px-1 pt-1">
          <span className="flex items-center gap-1">
            <Sparkles size={11} className="text-amber-400" />
            <span>荧光高亮底色</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-1">
          {HIGHLIGHT_COLORS.map((h) => (
            <button
              key={h.id}
              onClick={() => onApplyHighlight(h.id)}
              className="group relative p-0.5 rounded-md hover:scale-110 transition-transform"
              title={`荧光笔: ${h.label}`}
            >
              <div className={`w-4 h-4 rounded ${h.bgClass} shadow-sm`} />
            </button>
          ))}
        </div>
      </div>

      {/* 3. 块级转换 (Turn into...) */}
      <div className="pt-1 border-t border-white/5">
        <div className="text-[10px] uppercase font-mono tracking-wider text-slate-500 mb-1 px-1">
          转换为... (Turn into)
        </div>
        <div className="max-h-36 overflow-y-auto space-y-0.5 pr-0.5 scrollbar-thin">
          {TURN_INTO_OPTIONS.map((opt) => (
            <button
              key={opt.type}
              onClick={() => onTurnInto(opt.type)}
              className="w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center gap-2 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            >
              {opt.icon}
              <span className="truncate">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. 剪贴板动作 */}
      {hasSelection && (
        <div className="pt-1 border-t border-white/5 flex items-center gap-1 text-[11px] text-slate-400">
          <button
            onClick={onCopy}
            className="flex-1 py-1 px-2 rounded-lg hover:bg-white/10 flex items-center justify-center gap-1.5 hover:text-white transition-colors"
            title="复制选中文本"
          >
            <Copy size={12} />
            <span>复制</span>
          </button>
          <button
            onClick={onCut}
            className="flex-1 py-1 px-2 rounded-lg hover:bg-white/10 flex items-center justify-center gap-1.5 hover:text-white transition-colors"
            title="剪切选中文本"
          >
            <Scissors size={12} />
            <span>剪切</span>
          </button>
        </div>
      )}
    </div>,
    document.body
  );
};
