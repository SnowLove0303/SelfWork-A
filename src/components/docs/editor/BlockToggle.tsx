import React, { useRef, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { DocBlock, BlockType } from '../../../types/docs.ts';

interface BlockToggleProps {
  block: DocBlock;
  autoFocus?: boolean;
  onUpdate: (
    content: string,
    blockType: BlockType,
    properties: Record<string, unknown>,
    isStructural: boolean
  ) => void;
  onDelete: () => void;
  onInsertBelow: (blockType: BlockType) => void;
  onFocusPrev: () => void;
  onFocusNext: () => void;
}

/**
 * Toggle 折叠块：
 *   - 标题行（▶/▼ 箭头 + 可编辑 summary，来自 block.content）
 *   - 点击箭头或在 summary 上按 Enter 切换展开/折叠
 *   - 展开时显示子内容区（properties.children as string）
 *   - 子内容与 summary 均持久化至 block.properties
 */
export const BlockToggle: React.FC<BlockToggleProps> = ({
  block,
  autoFocus = false,
  onUpdate,
  onDelete,
  onInsertBelow,
  onFocusPrev,
  onFocusNext,
}) => {
  const summaryRef = useRef<HTMLDivElement>(null);
  const childrenRef = useRef<HTMLDivElement>(null);

  const isOpen = block.properties?.isOpen === true;
  const childrenContent = (block.properties?.children as string) || '';

  // autoFocus 支持
  useEffect(() => {
    if (autoFocus && summaryRef.current) {
      summaryRef.current.focus();
      // 将光标移至末尾
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(summaryRef.current);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [autoFocus]);

  // 同步子内容 DOM（受控内容）
  useEffect(() => {
    if (childrenRef.current && childrenRef.current.innerHTML !== childrenContent) {
      childrenRef.current.innerHTML = childrenContent;
    }
  }, [childrenContent]);

  // 同步 summary DOM（受控内容）
  useEffect(() => {
    if (summaryRef.current && summaryRef.current.innerHTML !== block.content) {
      summaryRef.current.innerHTML = block.content;
    }
  }, [block.content]);

  const toggleOpen = () => {
    onUpdate(block.content, 'toggle', { ...block.properties, isOpen: !isOpen }, true);
  };

  const handleSummaryInput = () => {
    const innerText = summaryRef.current?.innerHTML ?? '';
    onUpdate(innerText, 'toggle', { ...(block.properties ?? {}), isOpen }, false);
  };

  const handleChildrenInput = () => {
    const innerText = childrenRef.current?.innerHTML ?? '';
    onUpdate(block.content, 'toggle', { ...(block.properties ?? {}), isOpen, children: innerText }, false);
  };

  const handleSummaryKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Enter 切换展开状态
      toggleOpen();
      return;
    }
    if (e.key === 'Backspace') {
      const content = summaryRef.current?.innerText ?? '';
      if (content === '') {
        e.preventDefault();
        // 降级为 p 块
        onUpdate('', 'p', {}, true);
        return;
      }
    }
    if (e.key === 'ArrowUp') {
      const sel = window.getSelection();
      if (sel && sel.anchorOffset === 0) {
        e.preventDefault();
        onFocusPrev();
      }
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      onFocusNext();
    }
    if (e.key === 'Delete' && (summaryRef.current?.innerText ?? '') === '') {
      e.preventDefault();
      onDelete();
    }
  };

  const handleChildrenKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onInsertBelow('p');
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      summaryRef.current?.focus();
    }
  };

  return (
    <div
      id={`block-${block.id}`}
      className="group relative flex flex-col"
    >
      {/* 标题行 */}
      <div className="flex items-start gap-1 min-h-[1.6rem]">
        {/* 折叠箭头 */}
        <button
          onClick={toggleOpen}
          className="mt-[3px] shrink-0 p-0.5 text-slate-500 hover:text-slate-200 hover:bg-white/10 rounded transition-all duration-150 select-none"
          title={isOpen ? '点击折叠' : '点击展开'}
        >
          <ChevronRight
            size={14}
            className={`transition-transform duration-150 ${isOpen ? 'rotate-90' : 'rotate-0'}`}
          />
        </button>

        {/* Summary 可编辑区 */}
        <div
          ref={summaryRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleSummaryInput}
          onKeyDown={handleSummaryKeyDown}
          data-placeholder="折叠块标题..."
          className="flex-1 outline-none font-semibold text-slate-200 leading-relaxed break-words min-h-[1.4rem] empty:before:content-[attr(data-placeholder)] empty:before:text-slate-600"
        />
      </div>

      {/* 子内容区（展开时显示） */}
      {isOpen && (
        <div className="ml-5 mt-1 pl-3 border-l border-white/10">
          <div
            ref={childrenRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleChildrenInput}
            onKeyDown={handleChildrenKeyDown}
            data-placeholder="在此输入内容..."
            className="outline-none text-slate-400 leading-relaxed break-words min-h-[1.4rem] empty:before:content-[attr(data-placeholder)] empty:before:text-slate-600"
          />
        </div>
      )}
    </div>
  );
};
