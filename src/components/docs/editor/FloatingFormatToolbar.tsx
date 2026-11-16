import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code as CodeIcon,
  Eraser,
} from 'lucide-react';

export interface FloatingFormatToolbarProps {
  position: { top: number; left: number };
  onApplyFormat: (
    format: 'bold' | 'italic' | 'strike' | 'underline' | 'code' | 'clear'
  ) => void;
  onClose: () => void;
}

export const FloatingFormatToolbar: React.FC<FloatingFormatToolbarProps> = ({
  position,
  onApplyFormat,
  onClose,
}) => {
  const toolbarRef = useRef<HTMLDivElement>(null);

  // 1. 点击外部自动关闭
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        toolbarRef.current &&
        !toolbarRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // 自适应防视窗顶部溢出
  const top = Math.max(12, position.top);
  const left = Math.max(12, Math.min(position.left, window.innerWidth - 260));

  return createPortal(
    <div
      ref={toolbarRef}
      style={{
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        zIndex: 999999,
      }}
      className="flex items-center gap-0.5 bg-[#0c101a]/95 backdrop-blur-2xl border border-white/20 rounded-xl shadow-2xl p-1 text-slate-200 select-none animate-in fade-in zoom-in-95 duration-100"
    >
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onApplyFormat('bold')}
        className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
        title="加粗 (Ctrl+B)"
      >
        <Bold size={13} />
      </button>

      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onApplyFormat('italic')}
        className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
        title="斜体 (Ctrl+I)"
      >
        <Italic size={13} />
      </button>

      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onApplyFormat('underline')}
        className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
        title="下划线 (Ctrl+U)"
      >
        <Underline size={13} />
      </button>

      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onApplyFormat('strike')}
        className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
        title="删除线"
      >
        <Strikethrough size={13} />
      </button>

      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onApplyFormat('code')}
        className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
        title="行内代码"
      >
        <CodeIcon size={13} />
      </button>

      <div className="w-px h-3.5 bg-white/10 mx-1" />

      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onApplyFormat('clear')}
        className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition-colors"
        title="清除格式"
      >
        <Eraser size={13} />
      </button>
    </div>,
    document.body
  );
};
