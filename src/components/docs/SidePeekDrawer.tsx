import React, { useState } from 'react';
import {
  DbCollection,
  DbCollectionRow,
  DocPage,
  ColumnSchema,
  ColumnType,
} from '../../types/docs.ts';
import { TableRowCell } from './database/TableRowCell.tsx';
import { BlockEditor } from './editor/BlockEditor.tsx';
import { getColumnTypeIcon } from './database/TableHeaderCell.tsx';
import { AddColumnModal } from './database/AddColumnModal.tsx';
import {
  X,
  Maximize2,
  Minimize2,
  Trash2,
  Plus,
  SlidersHorizontal,
} from 'lucide-react';

interface SidePeekDrawerProps {
  collection: DbCollection;
  row: DbCollectionRow;
  isMaximized: boolean;
  onToggleMaximize: () => void;
  onClose: () => void;
  onUpdateCell: (rowId: string, colId: string, val: any) => void;
  onDeleteRow: (rowId: string) => void;
  onAddColumn: (name: string, type: ColumnType) => void;
}

export const SidePeekDrawer: React.FC<SidePeekDrawerProps> = ({
  collection,
  row,
  isMaximized,
  onToggleMaximize,
  onClose,
  onUpdateCell,
  onDeleteRow,
  onAddColumn,
}) => {
  const [isAddColOpen, setIsAddColOpen] = useState(false);
  const [pageIcon, setPageIcon] = useState('📄');

  // 获取该行第一列标题或默认文本
  const titleCol = Object.values(collection.schema)[0];
  const rowTitle = (titleCol && row.cells[titleCol.id]) ? String(row.cells[titleCol.id]) : '无标题';

  // 虚拟包装一个 DocPage 对象供正文 BlockEditor 消费
  const virtualPage: DocPage = {
    id: row.id,
    title: rowTitle,
    icon: pageIcon,
    collectionId: collection.id,
    isFavorite: false,
    isArchived: false,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };

  const handleTitleChange = (newTitle: string) => {
    if (titleCol) {
      onUpdateCell(row.id, titleCol.id, newTitle);
    }
  };

  const columns: ColumnSchema[] = Object.values(collection.schema);

  return (
    <div
      className={`h-full border-l border-white/10 bg-[#0c101a]/95 backdrop-blur-2xl flex flex-col transition-all duration-200 z-30 select-text overflow-hidden shadow-2xl ${
        isMaximized ? 'w-full' : 'w-[780px] max-w-[85vw] shrink-0'
      }`}
    >
      {/* 顶部操作条 (49px 高度对齐基准线) */}
      <div className="h-[49px] border-b border-white/5 px-4 flex items-center justify-between bg-black/20 shrink-0 select-none">
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            title="关闭侧边预览 (Esc)"
          >
            <X size={15} />
          </button>
          <button
            onClick={onToggleMaximize}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            title={isMaximized ? '还原分栏' : '放大为全屏'}
          >
            {isMaximized ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-500 font-mono">
            {collection.name} · 行详情
          </span>
          <button
            onClick={() => onDeleteRow(row.id)}
            className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-white/10 transition-colors"
            title="删除此行页面"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* 抽屉滚动内容区域 */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {/* 大标题 */}
        <div className="space-y-2">
          <div className="text-2xl select-none cursor-pointer" title="点击更换图标">
            {pageIcon}
          </div>
          <input
            type="text"
            value={rowTitle}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="无标题"
            className="w-full text-2xl font-bold text-white bg-transparent border-none outline-none placeholder-slate-600 leading-snug"
          />
        </div>

        {/* 多维属性面板 (Notion Properties Panel) */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 select-none">
            <span className="flex items-center gap-1.5">
              <SlidersHorizontal size={12} className="text-sky-400" />
              <span>页面属性清单</span>
            </span>
            <button
              onClick={() => setIsAddColOpen(true)}
              className="flex items-center gap-1 text-slate-500 hover:text-sky-400 text-[11px] transition-colors"
              title="添加新属性字段"
            >
              <Plus size={12} />
              <span>添加属性</span>
            </button>
          </div>

          <div className="divide-y divide-white/[0.03]">
            {columns.map((col) => (
              <div
                key={col.id}
                className="grid grid-cols-[130px_1fr] items-center py-1.5 gap-2 group hover:bg-white/[0.02] rounded px-1.5 transition-colors"
              >
                {/* 属性名与图标 */}
                <div className="flex items-center gap-1.5 text-xs text-slate-400 truncate select-none">
                  {getColumnTypeIcon(col.type)}
                  <span className="truncate">{col.name}</span>
                </div>

                {/* 属性可编辑单元格 */}
                <div className="h-7 flex items-center min-w-0">
                  <TableRowCell
                    column={col}
                    value={row.cells[col.id]}
                    onChange={(val) => onUpdateCell(row.id, col.id, val)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 分割线 */}
        <div className="h-px bg-white/10" />

        {/* 块级富文本正文编辑器 (Notion Block Content) */}
        <div className="min-h-[300px]">
          <BlockEditor
            page={virtualPage}
            onUpdatePageTitle={handleTitleChange}
            onUpdatePageIcon={(icon) => setPageIcon(icon)}
          />
        </div>
      </div>

      {/* 添加新属性弹窗 */}
      <AddColumnModal
        isOpen={isAddColOpen}
        onClose={() => setIsAddColOpen(false)}
        onAdd={onAddColumn}
      />
    </div>
  );
};
