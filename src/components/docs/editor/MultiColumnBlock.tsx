import React, { useRef } from 'react';
import { DocBlock, ColumnsBlockProperties, ColumnItem } from '../../../types/docs.ts';
import { Columns2, Columns3, Trash2 } from 'lucide-react';

interface MultiColumnBlockProps {
  block: DocBlock;
  onUpdate: (
    content: string,
    blockType?: DocBlock['blockType'],
    properties?: Record<string, any>,
    isStructural?: boolean
  ) => void;
  onDelete: () => void;
}

/**
 * 多栏排版布局卡片 (MultiColumnBlock)
 * - 支持 2 栏 (1:1) 与 3 栏 (1:1:1) 自由切换
 * - 各栏独立富文本编辑，支持小屏响应式优雅折叠
 */
export const MultiColumnBlock: React.FC<MultiColumnBlockProps> = ({
  block,
  onUpdate,
  onDelete,
}) => {
  const props = (block.properties as unknown as ColumnsBlockProperties) || {};
  const columnCount = props.columnCount === 3 ? 3 : 2;

  // 初始化或补齐栏目项
  const rawColumns = Array.isArray(props.columns) ? props.columns : [];
  const columns: ColumnItem[] = [];
  for (let i = 0; i < columnCount; i++) {
    columns.push(
      rawColumns[i] || {
        id: `col_${block.id}_${i + 1}`,
        content: '',
      }
    );
  }

  const handleToggleColumnCount = (count: 2 | 3) => {
    let nextCols: ColumnItem[] = [...columns];
    if (count === 3 && nextCols.length < 3) {
      nextCols.push({ id: `col_${block.id}_3`, content: '' });
    } else if (count === 2 && nextCols.length > 2) {
      nextCols = nextCols.slice(0, 2);
    }
    onUpdate(
      block.content,
      'columns',
      {
        ...block.properties,
        columnCount: count,
        columns: nextCols,
      },
      true
    );
  };

  const handleColumnInput = (index: number, newHtml: string) => {
    const nextCols = [...columns];
    nextCols[index] = {
      ...nextCols[index],
      content: newHtml,
    };
    onUpdate(
      block.content,
      'columns',
      {
        ...block.properties,
        columnCount,
        columns: nextCols,
      },
      false
    );
  };

  return (
    <div className="my-3.5 rounded-2xl bg-[#0d1117] border border-white/[0.08] shadow-xl overflow-hidden group/columns select-text">
      {/* 顶部控制栏 (34px 高度) */}
      <div className="h-[34px] px-3.5 bg-black/40 border-b border-white/[0.06] flex items-center justify-between select-none">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          {columnCount === 2 ? (
            <Columns2 size={13} className="text-sky-400" />
          ) : (
            <Columns3 size={13} className="text-sky-400" />
          )}
          <span className="font-medium text-slate-300">多栏排版</span>
          <span className="text-[11px] text-slate-500">({columnCount} 栏布局)</span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* 2栏/3栏切换胶囊 */}
          <div className="flex items-center bg-white/[0.04] p-0.5 rounded-lg border border-white/5 text-[10px]">
            <button
              type="button"
              onClick={() => handleToggleColumnCount(2)}
              className={`px-2 py-0.5 rounded transition-colors ${
                columnCount === 2
                  ? 'bg-sky-500/20 text-sky-300 font-medium'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              双栏 (1:1)
            </button>
            <button
              type="button"
              onClick={() => handleToggleColumnCount(3)}
              className={`px-2 py-0.5 rounded transition-colors ${
                columnCount === 3
                  ? 'bg-sky-500/20 text-sky-300 font-medium'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              三栏 (1:1:1)
            </button>
          </div>

          <div className="w-px h-3 bg-white/10 mx-0.5" />

          <button
            type="button"
            onClick={onDelete}
            className="p-1 hover:bg-white/10 text-slate-500 hover:text-rose-400 rounded transition-colors"
            title="删除多栏块"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* 多栏内容排版区域 */}
      <div
        className={`p-3.5 grid gap-3.5 ${
          columnCount === 3
            ? 'grid-cols-1 md:grid-cols-3'
            : 'grid-cols-1 md:grid-cols-2'
        }`}
      >
        {columns.map((col, idx) => (
          <ColumnItemEditor
            key={col.id || `col_${idx}`}
            index={idx}
            initialContent={col.content}
            onChange={(html) => handleColumnInput(idx, html)}
          />
        ))}
      </div>
    </div>
  );
};

interface ColumnItemEditorProps {
  index: number;
  initialContent: string;
  onChange: (html: string) => void;
}

const ColumnItemEditor: React.FC<ColumnItemEditorProps> = ({
  index,
  initialContent,
  onChange,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);

  return (
    <div className="p-3 rounded-xl bg-black/30 border border-white/[0.06] hover:border-white/15 focus-within:border-sky-500/40 focus-within:ring-1 focus-within:ring-sky-500/20 transition-all flex flex-col min-h-[6.5rem]">
      <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-white/[0.04] text-[10px] text-slate-500 select-none">
        <span>第 {index + 1} 栏</span>
      </div>
      <div
        ref={editorRef}
        contentEditable={true}
        suppressContentEditableWarning={true}
        dangerouslySetInnerHTML={{ __html: initialContent }}
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        data-placeholder={`第 ${index + 1} 栏内容...`}
        className="flex-1 outline-none text-sm text-slate-200 leading-relaxed min-h-[3rem] cursor-text break-words empty:before:content-[attr(data-placeholder)] empty:before:text-slate-600"
      />
    </div>
  );
};
