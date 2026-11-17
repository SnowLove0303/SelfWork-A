import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code as CodeIcon,
  Eraser,
  Palette,
  Highlighter,
} from 'lucide-react';

export interface FloatingFormatToolbarProps {
  position: { top: number; left: number };
  onApplyFormat: (
    format: 'bold' | 'italic' | 'strike' | 'underline' | 'code' | 'clear' | 'color' | 'highlight',
    colorValue?: string
  ) => void;
  onClose: () => void;
}

export const PALETTE_COLORS = [
  { id: 'default', name: '默认', textColor: 'inherit', bgColor: 'transparent' },
  { id: 'gray', name: '沉稳灰', textColor: '#94a3b8', bgColor: 'rgba(148, 163, 184, 0.2)' },
  { id: 'red', name: '告警红', textColor: '#f87171', bgColor: 'rgba(239, 68, 68, 0.2)' },
  { id: 'orange', name: '活力橙', textColor: '#fb923c', bgColor: 'rgba(249, 115, 22, 0.2)' },
  { id: 'yellow', name: '荧光黄', textColor: '#facc15', bgColor: 'rgba(234, 179, 8, 0.2)' },
  { id: 'green', name: '翡翠绿', textColor: '#4ade80', bgColor: 'rgba(34, 197, 94, 0.2)' },
  { id: 'cyan', name: '脉冲青', textColor: '#22d3ee', bgColor: 'rgba(6, 182, 212, 0.2)' },
  { id: 'blue', name: '科技蓝', textColor: '#60a5fa', bgColor: 'rgba(59, 130, 246, 0.2)' },
  { id: 'purple', name: '霓虹紫', textColor: '#c084fc', bgColor: 'rgba(168, 85, 247, 0.2)' },
  { id: 'pink', name: '樱花粉', textColor: '#f472b6', bgColor: 'rgba(236, 72, 153, 0.2)' },
] as const;

export const FloatingFormatToolbar: React.FC<FloatingFormatToolbarProps> = ({
  position,
  onApplyFormat,
  onClose,
}) => {
  const toolbarRef = useRef<HTMLDivElement>(null);
  const colorPopupRef = useRef<HTMLDivElement>(null);
  const [colorPopupType, setColorPopupType] = useState<'text' | 'highlight' | null>(null);

  // 1. 点击外部自动关闭
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        toolbarRef.current &&
        !toolbarRef.current.contains(target) &&
        (!colorPopupRef.current || !colorPopupRef.current.contains(target))
      ) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (colorPopupType) {
          setColorPopupType(null);
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
  }, [onClose, colorPopupType]);

  // 自适应防视窗顶部溢出
  const top = Math.max(12, position.top);
  const left = Math.max(12, Math.min(position.left, window.innerWidth - 320));

  return createPortal(
    <div
      ref={toolbarRef}
      style={{
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        zIndex: 999999,
      }}
      className="relative flex items-center gap-0.5 bg-[#0c101a]/95 backdrop-blur-2xl border border-white/20 rounded-xl shadow-2xl p-1 text-slate-200 select-none animate-in fade-in zoom-in-95 duration-100"
    >
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          setColorPopupType(null);
          onApplyFormat('bold');
        }}
        className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
        title="加粗 (Ctrl+B)"
      >
        <Bold size={13} />
      </button>

      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          setColorPopupType(null);
          onApplyFormat('italic');
        }}
        className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
        title="斜体 (Ctrl+I)"
      >
        <Italic size={13} />
      </button>

      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          setColorPopupType(null);
          onApplyFormat('underline');
        }}
        className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
        title="下划线 (Ctrl+U)"
      >
        <Underline size={13} />
      </button>

      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          setColorPopupType(null);
          onApplyFormat('strike');
        }}
        className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
        title="删除线"
      >
        <Strikethrough size={13} />
      </button>

      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          setColorPopupType(null);
          onApplyFormat('code');
        }}
        className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
        title="行内代码"
      >
        <CodeIcon size={13} />
      </button>

      <div className="w-px h-3.5 bg-white/10 mx-1" />

      {/* 文字颜色选择触发器 */}
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setColorPopupType((prev) => (prev === 'text' ? null : 'text'))}
        className={`p-1.5 rounded-lg transition-colors ${
          colorPopupType === 'text'
            ? 'bg-sky-500/30 text-sky-300'
            : 'hover:bg-white/10 text-slate-300 hover:text-white'
        }`}
        title="文字颜色调色盘"
      >
        <Palette size={13} />
      </button>

      {/* 背景高亮荧光笔触发器 */}
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setColorPopupType((prev) => (prev === 'highlight' ? null : 'highlight'))}
        className={`p-1.5 rounded-lg transition-colors ${
          colorPopupType === 'highlight'
            ? 'bg-amber-500/30 text-amber-300'
            : 'hover:bg-white/10 text-slate-300 hover:text-white'
        }`}
        title="文字背景高亮 (荧光笔)"
      >
        <Highlighter size={13} />
      </button>

      <div className="w-px h-3.5 bg-white/10 mx-1" />

      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          setColorPopupType(null);
          onApplyFormat('clear');
        }}
        className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition-colors"
        title="清除所有格式与颜色"
      >
        <Eraser size={13} />
      </button>

      {/* 色彩下拉弹窗 */}
      {colorPopupType && (
        <div
          ref={colorPopupRef}
          style={{
            position: 'absolute',
            top: '100%',
            left: colorPopupType === 'text' ? '120px' : '150px',
            marginTop: '6px',
            zIndex: 1000000,
          }}
          className="w-48 bg-[#0c101a]/98 backdrop-blur-2xl border border-white/20 rounded-xl shadow-2xl p-2 select-none animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 px-1.5 pb-1.5 mb-1 border-b border-white/10 flex items-center justify-between">
            <span>{colorPopupType === 'text' ? '选择文字颜色' : '选择高亮底色'}</span>
          </div>

          <div className="grid grid-cols-2 gap-1 max-h-48 overflow-y-auto pr-0.5 custom-scrollbar">
            {PALETTE_COLORS.map((c) => (
              <button
                key={c.id}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  if (colorPopupType === 'text') {
                    if (c.id === 'default') {
                      onApplyFormat('clear');
                    } else {
                      onApplyFormat('color', c.textColor);
                    }
                  } else {
                    if (c.id === 'default') {
                      onApplyFormat('clear');
                    } else {
                      onApplyFormat('highlight', c.bgColor);
                    }
                  }
                  setColorPopupType(null);
                }}
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs hover:bg-white/10 transition-colors text-left"
              >
                <span
                  className="w-3 h-3 rounded-full border border-white/20 flex-shrink-0"
                  style={{
                    backgroundColor: colorPopupType === 'text' ? (c.id === 'default' ? '#ffffff' : c.textColor) : (c.id === 'default' ? 'transparent' : c.bgColor),
                  }}
                />
                <span className="truncate text-slate-300 text-[11px]">{c.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>,
    document.body
  );
};
