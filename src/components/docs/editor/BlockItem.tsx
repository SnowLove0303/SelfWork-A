import React, { useRef, useEffect, useState } from 'react';
import { DocBlock, BlockType } from '../../../types/docs.ts';
import { SlashMenu, SLASH_MENU_ITEMS } from './SlashMenu.tsx';
import { BlockContextMenu } from './BlockContextMenu.tsx';
import {
  Plus,
  Trash2,
  Check,
  Table,
} from 'lucide-react';

interface BlockItemProps {
  block: DocBlock;
  onUpdate: (content: string, blockType?: BlockType, properties?: Record<string, any>) => void;
  onDelete: () => void;
  onInsertBelow: (blockType?: BlockType) => void;
  onFocusPrev: () => void;
  onFocusNext: () => void;
  autoFocus?: boolean;
}

export const BlockItem: React.FC<BlockItemProps> = ({
  block,
  onUpdate,
  onDelete,
  onInsertBelow,
  onFocusPrev,
  onFocusNext,
  autoFocus,
}) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [slashMenuOpen, setSlashMenuOpen] = useState(false);
  const [slashMenuPos, setSlashMenuPos] = useState({ top: 0, left: 0 });
  const [slashSelectedIndex, setSlashSelectedIndex] = useState(0);

  // 划选右键弹窗状态
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });
  const [savedSelection, setSavedSelection] = useState<{ start: number; end: number; text: string }>({
    start: 0,
    end: 0,
    text: '',
  });

  // 动态自动撑高高度
  const adjustHeight = () => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [block.content, block.blockType]);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
      const len = inputRef.current.value.length;
      inputRef.current.setSelectionRange(len, len);
    }
  }, [autoFocus]);

  // 处理文本输入
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;

    // 检测斜杠指令唤起
    if (val.endsWith('/')) {
      if (inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect();
        setSlashMenuPos({
          top: rect.bottom + 4,
          left: Math.max(16, rect.left),
        });
        setSlashMenuOpen(true);
        setSlashSelectedIndex(0);
      }
    } else if (slashMenuOpen && !val.includes('/')) {
      setSlashMenuOpen(false);
    }

    onUpdate(val);
  };

  // 右键上下文菜单捕获
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    const textarea = inputRef.current;
    let start = 0;
    let end = 0;
    let text = '';
    if (textarea) {
      start = textarea.selectionStart;
      end = textarea.selectionEnd;
      text = textarea.value.slice(start, end);
    }
    setSavedSelection({ start, end, text });
    setContextMenuPos({ x: e.clientX, y: e.clientY });
    setContextMenuOpen(true);
  };

  // 选区文字排版应用
  const handleApplyFormat = (format: 'bold' | 'italic' | 'strike' | 'code' | 'clear') => {
    const { start, end, text } = savedSelection;
    if (start === end || !text) {
      setContextMenuOpen(false);
      return;
    }
    const before = block.content.slice(0, start);
    const after = block.content.slice(end);
    let newContent = block.content;

    if (format === 'clear') {
      const cleaned = text
        .replace(/^\*\*|\*\*$/g, '')
        .replace(/^\*|\*$/g, '')
        .replace(/^~~|~~$/g, '')
        .replace(/^`|`$/g, '')
        .replace(/<[^>]*>/g, '');
      newContent = before + cleaned + after;
    } else {
      let wrap = '';
      if (format === 'bold') wrap = '**';
      else if (format === 'italic') wrap = '*';
      else if (format === 'strike') wrap = '~~';
      else if (format === 'code') wrap = '`';

      if (text.startsWith(wrap) && text.endsWith(wrap) && text.length >= wrap.length * 2) {
        const unwrapped = text.slice(wrap.length, text.length - wrap.length);
        newContent = before + unwrapped + after;
      } else {
        newContent = before + wrap + text + wrap + after;
      }
    }

    onUpdate(newContent);
    setContextMenuOpen(false);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  // 字体颜色应用
  const handleApplyColor = (colorId: string) => {
    const { start, end, text } = savedSelection;
    if (start === end || !text) {
      setContextMenuOpen(false);
      return;
    }
    const before = block.content.slice(0, start);
    const after = block.content.slice(end);
    let newContent = block.content;

    if (colorId === 'default') {
      const cleaned = text.replace(/<span class="text-[^"]+">([\s\S]*?)<\/span>/g, '$1');
      newContent = before + cleaned + after;
    } else {
      const colorClassMap: Record<string, string> = {
        rose: 'text-rose-400',
        orange: 'text-amber-500',
        yellow: 'text-yellow-300',
        green: 'text-emerald-400',
        sky: 'text-sky-400',
        purple: 'text-purple-400',
      };
      const cls = colorClassMap[colorId] || 'text-slate-100';
      newContent = before + `<span class="${cls}">${text}</span>` + after;
    }

    onUpdate(newContent);
    setContextMenuOpen(false);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  // 荧光笔高亮应用
  const handleApplyHighlight = (highlightId: string) => {
    const { start, end, text } = savedSelection;
    if (start === end || !text) {
      setContextMenuOpen(false);
      return;
    }
    const before = block.content.slice(0, start);
    const after = block.content.slice(end);
    let newContent = block.content;

    if (highlightId === 'none') {
      const cleaned = text.replace(/<mark class="[^"]+">([\s\S]*?)<\/mark>/g, '$1');
      newContent = before + cleaned + after;
    } else {
      const bgMap: Record<string, string> = {
        yellow: 'bg-yellow-400/20 text-yellow-200 border-b border-yellow-400/60 px-1 py-0.5 rounded',
        green: 'bg-emerald-400/20 text-emerald-200 border-b border-emerald-400/60 px-1 py-0.5 rounded',
        sky: 'bg-sky-400/20 text-sky-200 border-b border-sky-400/60 px-1 py-0.5 rounded',
        rose: 'bg-rose-400/20 text-rose-200 border-b border-rose-400/60 px-1 py-0.5 rounded',
        purple: 'bg-purple-400/20 text-purple-200 border-b border-purple-400/60 px-1 py-0.5 rounded',
      };
      const cls = bgMap[highlightId] || '';
      newContent = before + `<mark class="${cls}">${text}</mark>` + after;
    }

    onUpdate(newContent);
    setContextMenuOpen(false);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  // 块类型转换 (Turn into)
  const handleTurnInto = (newType: BlockType) => {
    onUpdate(block.content, newType);
    setContextMenuOpen(false);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  // 剪贴板动作
  const handleCopy = () => {
    if (savedSelection.text) {
      navigator.clipboard.writeText(savedSelection.text);
    }
    setContextMenuOpen(false);
  };

  const handleCut = () => {
    const { start, end, text } = savedSelection;
    if (text) {
      navigator.clipboard.writeText(text);
      const before = block.content.slice(0, start);
      const after = block.content.slice(end);
      onUpdate(before + after);
    }
    setContextMenuOpen(false);
  };

  // 键盘快捷流
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // 1. 斜杠菜单开启状态下的导航
    if (slashMenuOpen) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSlashSelectedIndex((prev) => (prev + 1) % SLASH_MENU_ITEMS.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSlashSelectedIndex((prev) => (prev - 1 + SLASH_MENU_ITEMS.length) % SLASH_MENU_ITEMS.length);
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        const selected = SLASH_MENU_ITEMS[slashSelectedIndex];
        if (selected) {
          handleSelectBlockType(selected.type);
        }
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setSlashMenuOpen(false);
        return;
      }
    }

    // 2. 普通回车：派生新块
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // 在当前块下方插入新段落
      onInsertBelow('p');
      return;
    }

    // 3. 空块退格：熔断回退
    if (e.key === 'Backspace' && block.content === '') {
      e.preventDefault();
      if (block.blockType !== 'p') {
        onUpdate('', 'p');
      } else {
        onDelete();
      }
      return;
    }

    // 4. 上下箭头跨块移动对焦
    if (e.key === 'ArrowUp' && inputRef.current?.selectionStart === 0) {
      e.preventDefault();
      onFocusPrev();
      return;
    }
    if (e.key === 'ArrowDown' && inputRef.current?.selectionStart === block.content.length) {
      e.preventDefault();
      onFocusNext();
      return;
    }
  };

  // 选择斜杠菜单中的类型
  const handleSelectBlockType = (newType: BlockType) => {
    setSlashMenuOpen(false);
    const cleaned = block.content.replace(/\/$/, '');
    onUpdate(cleaned, newType);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  // 待办复选框打勾切换
  const handleToggleTodo = () => {
    const isChecked = Boolean(block.properties?.checked);
    onUpdate(block.content, block.blockType, { ...block.properties, checked: !isChecked });
  };

  // 获取不同块类型的特定样式类
  const getBlockStyle = () => {
    switch (block.blockType) {
      case 'h1':
        return 'text-2xl font-bold text-white leading-tight placeholder-slate-600';
      case 'h2':
        return 'text-xl font-semibold text-slate-100 leading-snug placeholder-slate-600';
      case 'h3':
        return 'text-base font-semibold text-slate-200 leading-snug placeholder-slate-600';
      case 'quote':
        return 'italic text-slate-300 text-sm leading-relaxed';
      case 'code':
        return 'font-mono text-xs text-rose-300 leading-relaxed';
      default:
        return 'text-sm text-slate-200 leading-relaxed placeholder-slate-600';
    }
  };

  // 分隔线特殊渲染
  if (block.blockType === 'divider') {
    return (
      <div id={`block-${block.id}`} className="group relative flex items-center py-2 my-1">
        <div className="absolute -left-8 top-1 flex items-center justify-end pr-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 select-none">
          <button
            onClick={onDelete}
            className="p-0.5 hover:bg-white/10 text-slate-500 hover:text-rose-400 rounded"
            title="删除分隔线"
          >
            <Trash2 size={12} />
          </button>
        </div>
        <div className="flex-1 h-px bg-white/10" />
      </div>
    );
  }

  // 表格嵌入卡片特殊渲染
  if (block.blockType === 'table') {
    return (
      <div id={`block-${block.id}`} className="group relative flex items-start py-2 my-1">
        <div className="absolute -left-8 top-2 flex items-center justify-end pr-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 select-none">
          <button
            onClick={onDelete}
            className="p-0.5 hover:bg-white/10 text-slate-500 hover:text-rose-400 rounded"
            title="删除此块"
          >
            <Trash2 size={12} />
          </button>
        </div>
        <div className="flex-1 p-3 bg-white/[0.02] border border-white/10 rounded-xl flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
            <Table size={18} />
          </div>
          <div>
            <div className="text-xs font-semibold text-white">多维表格数据库视图</div>
            <div className="text-[11px] text-slate-500">点击左侧切换为独立全功能表格编辑</div>
          </div>
        </div>
      </div>
    );
  }

  const isChecked = Boolean(block.properties?.checked);

  return (
    <div
      id={`block-${block.id}`}
      onContextMenu={handleContextMenu}
      className="group relative flex items-start py-0.5 my-0.5"
    >
      {/* 悬浮操作侧柄：外挂绝对定位，绝对不占用正文水平流，实现正文起点与标题 100% 垂直向左对齐 */}
      <div className="absolute -left-8 top-1 flex items-center justify-end pr-1 opacity-0 group-hover:opacity-100 transition-opacity select-none z-10">
        <button
          onClick={() => onInsertBelow('p')}
          className="p-0.5 hover:bg-white/10 text-slate-500 hover:text-slate-300 rounded"
          title="在下方插入块"
        >
          <Plus size={12} />
        </button>
        <button
          onClick={onDelete}
          className="p-0.5 hover:bg-white/10 text-slate-500 hover:text-rose-400 rounded"
          title="删除块"
        >
          <Trash2 size={12} />
        </button>
      </div>

      {/* 待办方框 */}
      {block.blockType === 'todo' && (
        <div className="pt-1.5 pr-2 shrink-0">
          <button
            onClick={handleToggleTodo}
            className={`w-4 h-4 rounded flex items-center justify-center transition-all ${
              isChecked
                ? 'bg-purple-500 text-white shadow-sm shadow-purple-500/30'
                : 'border border-white/20 hover:border-white/40 bg-white/5'
            }`}
          >
            {isChecked && <Check size={12} strokeWidth={3} />}
          </button>
        </div>
      )}

      {/* 无序列表圆点 */}
      {block.blockType === 'bullet' && (
        <div className="pt-2 pr-2.5 shrink-0 select-none">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
        </div>
      )}

      {/* 引用区块左竖线包装 */}
      {block.blockType === 'quote' && (
        <div className="w-1 self-stretch bg-sky-500/40 rounded-full mr-3 shrink-0 my-0.5" />
      )}

      {/* 代码块背景容器包装 */}
      <div
        className={`flex-1 min-w-0 ${
          block.blockType === 'code'
            ? 'p-3 bg-slate-950/80 border border-white/10 rounded-xl my-1 shadow-inner'
            : ''
        }`}
      >
        <textarea
          ref={inputRef}
          value={block.content}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={
            block.blockType === 'h1'
              ? '一级标题...'
              : block.blockType === 'h2'
              ? '二级标题...'
              : block.blockType === 'h3'
              ? '三级标题...'
              : block.blockType === 'code'
              ? '// 粘贴或输入代码...'
              : "输入文本，或按 '/' 唤出菜单..."
          }
          rows={1}
          className={`w-full bg-transparent resize-none border-none outline-none overflow-hidden ${getBlockStyle()} ${
            isChecked && block.blockType === 'todo' ? 'line-through text-slate-500' : ''
          }`}
        />
      </div>

      {/* 斜杠指令菜单 */}
      {slashMenuOpen && (
        <SlashMenu
          position={slashMenuPos}
          selectedIndex={slashSelectedIndex}
          setSelectedIndex={setSlashSelectedIndex}
          onSelect={handleSelectBlockType}
          onClose={() => setSlashMenuOpen(false)}
        />
      )}

      {/* 划选右键定制调整弹窗 */}
      {contextMenuOpen && (
        <BlockContextMenu
          position={contextMenuPos}
          hasSelection={Boolean(savedSelection.text)}
          selectedText={savedSelection.text}
          currentBlockType={block.blockType}
          onApplyFormat={handleApplyFormat}
          onApplyColor={handleApplyColor}
          onApplyHighlight={handleApplyHighlight}
          onTurnInto={handleTurnInto}
          onCopy={handleCopy}
          onCut={handleCut}
          onClose={() => setContextMenuOpen(false)}
        />
      )}
    </div>
  );
};
