import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code as CodeIcon,
  Eraser,
  Link,
} from 'lucide-react';

export interface FloatingFormatToolbarProps {
  position: { top: number; left: number };
  onApplyFormat: (
    format: 'bold' | 'italic' | 'strike' | 'underline' | 'code' | 'clear'
  ) => void;
  onApplyLink?: (url: string) => void;
  onApplyHighlight?: (color: string) => void;
  onClose: () => void;
}

const HIGHLIGHT_COLORS = [
  { color: '#FFD93D40', label: '黄' },
  { color: '#FF6B6B40', label: '红' },
  { color: '#6BCB7740', label: '绿' },
  { color: '#4F87FF40', label: '蓝' },
  { color: '#C77DFF40', label: '紫' },
  { color: '#FF9A3C40', label: '橙' },
];

export const FloatingFormatToolbar: React.FC<FloatingFormatToolbarProps> = ({
  position,
  onApplyFormat,
  onApplyLink,
  onApplyHighlight,
  onClose,
}) => {
  const toolbarRef = useRef<HTMLDivElement>(null);
  const linkInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<'default' | 'link' | 'highlight'>('default');
  const [linkUrl, setLinkUrl] = useState('');

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
        if (mode !== 'default') {
          setMode('default');
          setLinkUrl('');
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, mode]);

  // 自动聚焦链接输入框
  useEffect(() => {
    if (mode === 'link') {
      setTimeout(() => linkInputRef.current?.focus(), 20);
    }
  }, [mode]);

  // 自适应防视窗顶部溢出
  const top = Math.max(12, position.top);
  const left = Math.max(12, Math.min(position.left, window.innerWidth - 320));

  const handleLinkConfirm = () => {
    const url = linkUrl.trim();
    if (url && onApplyLink) {
      const finalUrl = url.startsWith('http') ? url : `https://${url}`;
      onApplyLink(finalUrl);
    }
    setMode('default');
    setLinkUrl('');
  };

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
      {/* 链接输入框展开模式 */}
      {mode === 'link' ? (
        <div className="flex items-center gap-1 px-1">
          <Link size={12} className="text-sky-400 shrink-0" />
          <input
            ref={linkInputRef}
            type="text"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleLinkConfirm();
              } else if (e.key === 'Escape') {
                e.preventDefault();
                setMode('default');
                setLinkUrl('');
              }
            }}
            placeholder="https://..."
            style={{ width: 200 }}
            className="bg-white/10 border border-white/20 rounded-lg px-2 py-0.5 text-xs text-white placeholder-slate-500 outline-none focus:border-sky-400/60"
          />
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleLinkConfirm}
            className="px-2 py-0.5 rounded-lg bg-sky-500/30 hover:bg-sky-500/50 text-sky-200 text-xs transition-colors"
          >
            确认
          </button>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => { setMode('default'); setLinkUrl(''); }}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 transition-colors text-xs"
          >
            ✕
          </button>
        </div>
      ) : mode === 'highlight' ? (
        /* 高亮色板展开模式 */
        <div className="flex items-center gap-1 px-1">
          <span className="text-[10px] text-slate-400 mr-0.5">高亮</span>
          {HIGHLIGHT_COLORS.map(({ color, label }) => (
            <button
              key={color}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onApplyHighlight?.(color);
                setMode('default');
              }}
              title={label}
              className="w-5 h-5 rounded-md border border-white/20 hover:scale-110 transition-transform"
              style={{ backgroundColor: color.length === 9 ? color : color }}
            />
          ))}
          {/* 清除高亮 */}
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              onApplyHighlight?.('');
              setMode('default');
            }}
            title="清除高亮"
            className="w-5 h-5 rounded-md border border-white/20 hover:scale-110 transition-transform bg-transparent flex items-center justify-center text-slate-400 text-[10px]"
          >
            ✕
          </button>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setMode('default')}
            className="p-0.5 rounded-lg hover:bg-white/10 text-slate-400 ml-0.5 transition-colors"
          >
            <Eraser size={11} />
          </button>
        </div>
      ) : (
        /* 默认工具栏模式 */
        <>
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

          <div className="w-px h-3.5 bg-white/10 mx-0.5" />

          {/* 🔗 链接按钮 */}
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setMode('link')}
            className="p-1.5 rounded-lg hover:bg-sky-500/20 text-slate-300 hover:text-sky-300 transition-colors"
            title="插入链接"
          >
            <Link size={13} />
          </button>

          {/* A 高亮按钮（带下划色条） */}
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setMode('highlight')}
            className="p-1.5 rounded-lg hover:bg-yellow-500/20 text-yellow-300 hover:text-yellow-200 transition-colors relative"
            title="文字高亮"
          >
            <span className="text-[13px] font-bold leading-none">A</span>
            <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-3 h-0.5 rounded-full bg-yellow-400" />
          </button>

          <div className="w-px h-3.5 bg-white/10 mx-0.5" />

          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onApplyFormat('clear')}
            className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition-colors"
            title="清除格式"
          >
            <Eraser size={13} />
          </button>
        </>
      )}
    </div>,
    document.body
  );
};
