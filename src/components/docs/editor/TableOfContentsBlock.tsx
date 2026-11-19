import React, { useMemo } from 'react';
import { DocBlock } from '../../../types/docs.ts';
import { ListTree, Trash2 } from 'lucide-react';

interface TableOfContentsBlockProps {
  allBlocks: DocBlock[];
  onScrollToHeading?: (headingId: string) => void;
  onDelete: () => void;
}

/**
 * 正文内嵌动态目录卡片 (TableOfContentsBlock)
 * - 实时提取当前文档全量 H1/H2/H3 标题并分级缩进呈现
 * - 支持点按平滑定位锚点
 */
export const TableOfContentsBlock: React.FC<TableOfContentsBlockProps> = ({
  allBlocks,
  onScrollToHeading,
  onDelete,
}) => {
  const headings = useMemo(() => {
    return allBlocks
      .filter((b) => ['h1', 'h2', 'h3'].includes(b.blockType) && b.content.trim() !== '')
      .map((b) => ({
        id: b.id,
        type: b.blockType,
        text: b.content
          .replace(/<[^>]*>/g, '')
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .trim(),
      }))
      .filter((h) => h.text !== '');
  }, [allBlocks]);

  return (
    <div className="my-3.5 rounded-2xl bg-[#0c1017] border border-white/10 shadow-xl p-4 select-none group/toc animate-in fade-in duration-150">
      <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
          <ListTree size={15} className="text-sky-400" />
          <span>目录大纲 (TOC)</span>
          <span className="text-[10px] text-slate-500 font-mono">
            ({headings.length} 章节)
          </span>
        </div>

        <button
          type="button"
          onClick={onDelete}
          className="p-1 hover:bg-white/10 text-slate-500 hover:text-rose-400 rounded-lg transition-colors"
          title="删除目录卡片"
        >
          <Trash2 size={12} />
        </button>
      </div>

      {headings.length === 0 ? (
        <div className="py-4 text-center text-xs text-slate-500 italic">
          当前文档暂无各级标题 (H1/H2/H3)<br />
          在正文中添加标题后，此处将自动生成动态大纲
        </div>
      ) : (
        <div className="space-y-1">
          {headings.map((h) => (
            <button
              key={h.id}
              type="button"
              onClick={() => onScrollToHeading?.(h.id)}
              className={`w-full text-left truncate rounded-lg py-1 px-2 transition-all block text-xs hover:bg-white/[0.06] cursor-pointer ${
                h.type === 'h1'
                  ? 'font-medium text-slate-200 hover:text-sky-300 pl-2'
                  : h.type === 'h2'
                  ? 'text-slate-400 hover:text-sky-300 pl-6 text-[11.5px]'
                  : 'text-slate-500 hover:text-sky-300 pl-10 text-[11px]'
              }`}
              title={h.text}
            >
              <span className="opacity-40 mr-1.5 font-mono">
                {h.type === 'h1' ? '#' : h.type === 'h2' ? '##' : '###'}
              </span>
              <span>{h.text}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
