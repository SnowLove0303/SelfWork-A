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
  Heading,
  Heading1,
  Heading2,
  Heading3,
  Type,
  CheckSquare,
  List,
  Quote,
  Palette,
  Sparkles,
  ChevronRight,
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
  const submenuRef = useRef<HTMLDivElement>(null);
  const [stylePos, setStylePos] = useState({ top: position.y, left: position.x });

  // 二级子弹窗状态 (用于 H1/H2/H3 标题收拢)
  const [headingSubmenuOpen, setHeadingSubmenuOpen] = useState(false);
  const [submenuPos, setSubmenuPos] = useState({ top: 0, left: 0 });
  const closeSubmenuTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. 视窗碰撞检测自适应防溢出算法 (主菜单)
  useEffect(() => {
    const padding = 12;
    const menuWidth = 288; // w-72 = 18rem = 288px
    const menuHeight = 350;

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
      const target = e.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        (!submenuRef.current || !submenuRef.current.contains(target))
      ) {
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
      if (closeSubmenuTimerRef.current) clearTimeout(closeSubmenuTimerRef.current);
    };
  }, [onClose]);

  // 打开标题二级子菜单并计算自适应防溢出坐标
  const handleOpenHeadingSubmenu = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (closeSubmenuTimerRef.current) {
      clearTimeout(closeSubmenuTimerRef.current);
      closeSubmenuTimerRef.current = null;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const submenuWidth = 195;
    const submenuHeight = 135;
    const padding = 12;

    let left = rect.right + 4;
    let top = rect.top - 4;

    // 若右侧超出视窗，自动向左翻转
    if (left + submenuWidth > window.innerWidth - padding) {
      left = Math.max(padding, rect.left - submenuWidth - 4);
    }
    // 若底部超出视窗，向上靠齐
    if (top + submenuHeight > window.innerHeight - padding) {
      top = Math.max(padding, window.innerHeight - submenuHeight - padding);
    }
    setSubmenuPos({ top, left });
    setHeadingSubmenuOpen(true);
  };

  const handleScheduleCloseSubmenu = () => {
    closeSubmenuTimerRef.current = setTimeout(() => {
      setHeadingSubmenuOpen(false);
    }, 150);
  };

  const handleCancelCloseSubmenu = () => {
    if (closeSubmenuTimerRef.current) {
      clearTimeout(closeSubmenuTimerRef.current);
      closeSubmenuTimerRef.current = null;
    }
  };

  const handleSelectHeading = (type: 'h1' | 'h2' | 'h3') => {
    onTurnInto(type);
    setHeadingSubmenuOpen(false);
    onClose();
  };

  // 使用 React Portal 直接注入 document.body，彻底逃脱任何父容器的 backdrop-filter 与 overflow 裁剪
  return createPortal(
    <>
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

        {/* 3. 块级转换 (Turn into...) 包含标题二级子弹窗聚合 */}
        <div className="pt-1 border-t border-white/5">
          <div className="text-[10px] uppercase font-mono tracking-wider text-slate-500 mb-1 px-1">
            转换为... (Turn into)
          </div>
          <div className="space-y-0.5 pr-0.5">
            {/* 普通正文 */}
            <button
              onClick={() => onTurnInto('p')}
              onMouseEnter={() => setHeadingSubmenuOpen(false)}
              className="w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center gap-2 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            >
              <Type size={13} className="text-slate-400" />
              <span>普通正文</span>
            </button>

            {/* 标题聚合项 (二级子弹窗入口) */}
            <button
              onMouseEnter={handleOpenHeadingSubmenu}
              onMouseLeave={handleScheduleCloseSubmenu}
              onClick={handleOpenHeadingSubmenu}
              className={`w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                headingSubmenuOpen
                  ? 'bg-sky-500/20 text-sky-200'
                  : 'hover:bg-white/10 text-slate-300 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <Heading size={13} className="text-sky-400" />
                <span>标题 (Headings)</span>
              </div>
              <ChevronRight size={13} className="text-slate-500 group-hover:text-slate-300" />
            </button>

            {/* 待办清单 */}
            <button
              onClick={() => onTurnInto('todo')}
              onMouseEnter={() => setHeadingSubmenuOpen(false)}
              className="w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center gap-2 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            >
              <CheckSquare size={13} className="text-purple-400" />
              <span>待办清单 (To-do)</span>
            </button>

            {/* 项目符号 */}
            <button
              onClick={() => onTurnInto('bullet')}
              onMouseEnter={() => setHeadingSubmenuOpen(false)}
              className="w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center gap-2 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            >
              <List size={13} className="text-cyan-400" />
              <span>项目符号 (Bullet)</span>
            </button>

            {/* 引用区块 */}
            <button
              onClick={() => onTurnInto('quote')}
              onMouseEnter={() => setHeadingSubmenuOpen(false)}
              className="w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center gap-2 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            >
              <Quote size={13} className="text-yellow-400" />
              <span>引用区块 (Quote)</span>
            </button>

            {/* 代码块 */}
            <button
              onClick={() => onTurnInto('code')}
              onMouseEnter={() => setHeadingSubmenuOpen(false)}
              className="w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center gap-2 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            >
              <CodeIcon size={13} className="text-rose-400" />
              <span>技术代码块 (Code)</span>
            </button>
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
      </div>

      {/* 5. 标题二级子弹窗 (Headings Submenu) */}
      {headingSubmenuOpen && (
        <div
          ref={submenuRef}
          style={{
            position: 'fixed',
            top: `${submenuPos.top}px`,
            left: `${submenuPos.left}px`,
            zIndex: 1000000,
          }}
          onMouseEnter={handleCancelCloseSubmenu}
          onMouseLeave={handleScheduleCloseSubmenu}
          onContextMenu={(e) => e.preventDefault()}
          className="w-48 bg-[#0c101a]/98 backdrop-blur-2xl border border-white/20 rounded-xl shadow-2xl p-1.5 text-slate-200 select-none animate-in fade-in zoom-in-95 duration-75 space-y-0.5 pointer-events-auto"
        >
          <div className="text-[10px] uppercase font-mono tracking-wider text-slate-500 px-2 py-0.5">
            选择标题层级
          </div>
          <button
            onClick={() => handleSelectHeading('h1')}
            className="w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center justify-between hover:bg-white/10 text-slate-300 hover:text-white transition-colors group"
          >
            <div className="flex items-center gap-2">
              <Heading1 size={13} className="text-sky-400" />
              <span className="font-semibold text-white">一级标题</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">H1</span>
          </button>
          <button
            onClick={() => handleSelectHeading('h2')}
            className="w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center justify-between hover:bg-white/10 text-slate-300 hover:text-white transition-colors group"
          >
            <div className="flex items-center gap-2">
              <Heading2 size={13} className="text-emerald-400" />
              <span className="font-medium text-slate-200">二级小节</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">H2</span>
          </button>
          <button
            onClick={() => handleSelectHeading('h3')}
            className="w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center justify-between hover:bg-white/10 text-slate-300 hover:text-white transition-colors group"
          >
            <div className="flex items-center gap-2">
              <Heading3 size={13} className="text-amber-400" />
              <span className="text-slate-300">三级重点</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">H3</span>
          </button>
        </div>
      )}
    </>,
    document.body
  );
};
