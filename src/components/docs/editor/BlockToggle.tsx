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
 * 现代轻量多级折叠列表块 (BlockToggle)
 * - 标题行：平滑旋转箭头 (▶/▼) + 可编辑摘要标题 (block.content)
 * - 子内容区：展开时具有微光层级指示竖线与多段文本输入 (block.properties.children)
 * - 支持键盘快捷流：Enter 展开并聚焦，Backspace 空标题降级
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

  // 聚焦管理
  useEffect(() => {
    if (autoFocus && summaryRef.current) {
      summaryRef.current.focus();
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(summaryRef.current);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [autoFocus]);

  // 同步 DOM 内容
  useEffect(() => {
    if (childrenRef.current && childrenRef.current.innerHTML !== childrenContent) {
      childrenRef.current.innerHTML = childrenContent;
    }
  }, [childrenContent]);

  useEffect(() => {
    if (summaryRef.current && summaryRef.current.innerHTML !== block.content) {
      summaryRef.current.innerHTML = block.content;
    }
  }, [block.content]);

  const toggleOpen = () => {
    onUpdate(block.content, 'toggle', { ...(block.properties || {}), isOpen: !isOpen }, true);
  };

  const handleSummaryInput = () => {
    const innerText = summaryRef.current?.innerHTML ?? '';
    onUpdate(innerText, 'toggle', { ...(block.properties || {}), isOpen }, false);
  };

  const handleChildrenInput = () => {
    const innerText = childrenRef.current?.innerHTML ?? '';
    onUpdate(block.content, 'toggle', { ...(block.properties || {}), isOpen, children: innerText }, false);
  };

  const handleSummaryKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!isOpen) {
        // 若折叠，回车自动展开并聚焦
        onUpdate(block.content, 'toggle', { ...(block.properties || {}), isOpen: true }, true);
        setTimeout(() => {
          childrenRef.current?.focus();
        }, 50);
      } else {
        // 若已展开，回车聚焦子内容
        childrenRef.current?.focus();
      }
      return;
    }
    if (e.key === 'Backspace') {
      const content = summaryRef.current?.innerText ?? '';
      if (content === '' || content === '\n') {
        e.preventDefault();
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
      if (isOpen && childrenRef.current) {
        e.preventDefault();
        childrenRef.current.focus();
      } else {
        e.preventDefault();
        onFocusNext();
      }
    }
    if (e.key === 'Delete' && (summaryRef.current?.innerText ?? '') === '') {
      e.preventDefault();
      onDelete();
    }
  };

  const handleChildrenKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // 在子内容末尾按 Enter，在折叠块下方插入新段落
      onInsertBelow('p');
    }
    if (e.key === 'ArrowUp') {
      const sel = window.getSelection();
      if (sel && sel.anchorOffset === 0) {
        e.preventDefault();
        summaryRef.current?.focus();
      }
    }
  };

  return (
    <div
      className="group/toggle flex flex-col w-full my-0.5 rounded-lg transition-colors"
    >
      {/* 标题摘要行 */}
      <div className="flex items-start gap-1.5 min-h-[1.75rem] py-0.5">
        <button
          type="button"
          onClick={toggleOpen}
          className="mt-[3px] shrink-0 p-0.5 text-slate-400 hover:text-sky-300 hover:bg-sky-500/10 rounded-md transition-all select-none"
          title={isOpen ? '点击收起' : '点击展开'}
        >
          <ChevronRight
            size={15}
            className={`transition-transform duration-200 text-slate-400 group-hover/toggle:text-sky-400 ${
              isOpen ? 'rotate-90 text-sky-400' : 'rotate-0'
            }`}
          />
        </button>

        <div
          ref={summaryRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleSummaryInput}
          onKeyDown={handleSummaryKeyDown}
          data-placeholder="折叠列表标题 (按回车展开)..."
          className="flex-1 outline-none font-medium text-slate-200 leading-relaxed break-words min-h-[1.4rem] empty:before:content-[attr(data-placeholder)] empty:before:text-slate-600"
        />
      </div>

      {/* 展开子内容容器 */}
      {isOpen && (
        <div className="ml-5 pl-3.5 my-1 border-l-2 border-sky-500/30 hover:border-sky-500/60 transition-colors">
          <div
            ref={childrenRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleChildrenInput}
            onKeyDown={handleChildrenKeyDown}
            data-placeholder="在此输入折叠详细内容..."
            className="outline-none text-slate-300 text-sm leading-relaxed break-words min-h-[1.5rem] empty:before:content-[attr(data-placeholder)] empty:before:text-slate-600"
          />
        </div>
      )}
    </div>
  );
};
