import React, { useState, useEffect, useMemo } from 'react';
import {
  DbCollection,
  DbCollectionRow,
  ColumnSchema,
  ColumnType,
} from '../../../types/docs.ts';
import { TableHeaderCell } from './TableHeaderCell.tsx';
import { TableRowCell } from './TableRowCell.tsx';
import { AddColumnModal } from './AddColumnModal.tsx';
import { SidePeekDrawer } from '../SidePeekDrawer.tsx';
import {
  loadDbCollectionRows,
  saveDbCollectionRow,
  deleteDbCollectionRow,
  saveDbCollection,
} from '../../../services/docsDb.ts';
import {
  Plus,
  Search,
  Trash2,
  SlidersHorizontal,
  Table,
  ChevronDown,
  ArrowUpRight,
} from 'lucide-react';

interface TableDatabaseViewProps {
  collection: DbCollection;
  onUpdateCollection?: (col: DbCollection) => void;
}

export const TableDatabaseView: React.FC<TableDatabaseViewProps> = ({
  collection,
  onUpdateCollection,
}) => {
  const [rows, setRows] = useState<DbCollectionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddColModalOpen, setIsAddColModalOpen] = useState(false);
  const [activeRowId, setActiveRowId] = useState<string | null>(null);
  const [isSidePeekMaximized, setIsSidePeekMaximized] = useState(false);
  const [activeViewId, setActiveViewId] = useState<string>(
    collection.views?.[0]?.id || 'v1'
  );

  // 加载数据行
  useEffect(() => {
    let isMounted = true;
    const fetchRows = async () => {
      setLoading(true);
      try {
        const fetched = await loadDbCollectionRows(collection.id);
        if (isMounted) {
          setRows(fetched.sort((a, b) => a.sortOrder - b.sortOrder));
        }
      } catch (err) {
        console.error('Failed to load collection rows:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchRows();
    return () => {
      isMounted = false;
    };
  }, [collection.id]);

  // 列顺序解析
  const columns: ColumnSchema[] = useMemo(() => {
    return Object.values(collection.schema);
  }, [collection.schema]);

  // 多视图 Tab 定义
  const views = useMemo(() => {
    return (
      collection.views || [
        { id: 'v1', name: '全景调研表', type: 'table' as const },
      ]
    );
  }, [collection.views]);

  // 搜索与视图过滤
  const filteredRows = useMemo(() => {
    let result = rows;

    // 按当前视图进行模块过滤 (支持 U2, U3, U1 视图 Tab 过滤)
    const currentView = views.find((v) => v.id === activeViewId);
    if (currentView) {
      if (currentView.name.includes('U2')) {
        result = result.filter(
          (r) => r.cells.col_module === 'opt_u2' || !r.cells.col_module
        );
      } else if (currentView.name.includes('U3')) {
        result = result.filter(
          (r) => r.cells.col_module === 'opt_u3' || !r.cells.col_module
        );
      } else if (currentView.name.includes('U1')) {
        result = result.filter(
          (r) => r.cells.col_module === 'opt_u1' || !r.cells.col_module
        );
      }
    }

    if (!searchQuery.trim()) return result;
    const q = searchQuery.toLowerCase().trim();
    return result.filter((row) => {
      return Object.values(row.cells).some((val) => {
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(q);
      });
    });
  }, [rows, searchQuery, activeViewId, views]);

  // 1. 单元格修改并原子持久化
  const handleCellChange = async (rowId: string, colId: string, newVal: any) => {
    const updatedRows = rows.map((r) => {
      if (r.id !== rowId) return r;
      return {
        ...r,
        cells: {
          ...r.cells,
          [colId]: newVal,
        },
        updatedAt: Date.now(),
      };
    });
    setRows(updatedRows);

    const targetRow = updatedRows.find((r) => r.id === rowId);
    if (targetRow) {
      await saveDbCollectionRow(targetRow);
    }
  };

  // 2. 新增数据行并自动打开 Side Peek
  const handleAddRow = async () => {
    const newRowId = 'row_' + Date.now();
    const titleCol = columns[0];
    const initialCells: Record<string, any> = {};
    if (titleCol) {
      initialCells[titleCol.id] = '未命名记录';
    }
    const newRow: DbCollectionRow = {
      id: newRowId,
      collectionId: collection.id,
      cells: initialCells,
      sortOrder: (rows[rows.length - 1]?.sortOrder || 0) + 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const nextRows = [...rows, newRow];
    setRows(nextRows);
    setActiveRowId(newRowId);
    await saveDbCollectionRow(newRow);
  };

  // 3. 删除数据行
  const handleDeleteRow = async (rowId: string) => {
    const nextRows = rows.filter((r) => r.id !== rowId);
    setRows(nextRows);
    if (activeRowId === rowId) {
      setActiveRowId(null);
    }
    await deleteDbCollectionRow(collection.id, rowId);
  };

  // 4. 更新列属性
  const handleUpdateColumn = async (updatedCol: ColumnSchema) => {
    const nextSchema = {
      ...collection.schema,
      [updatedCol.id]: updatedCol,
    };
    const nextCollection: DbCollection = {
      ...collection,
      schema: nextSchema,
      updatedAt: Date.now(),
    };
    onUpdateCollection?.(nextCollection);
    await saveDbCollection(nextCollection);
  };

  // 5. 删除字段列
  const handleDeleteColumn = async (colId: string) => {
    const nextSchema = { ...collection.schema };
    delete nextSchema[colId];

    const nextRows = rows.map((r) => {
      const nextCells = { ...r.cells };
      delete nextCells[colId];
      return { ...r, cells: nextCells };
    });
    setRows(nextRows);

    const nextCollection: DbCollection = {
      ...collection,
      schema: nextSchema,
      updatedAt: Date.now(),
    };
    onUpdateCollection?.(nextCollection);
    await saveDbCollection(nextCollection);

    for (const r of nextRows) {
      await saveDbCollectionRow(r);
    }
  };

  // 6. 添加新字段列
  const handleAddColumn = async (name: string, type: ColumnType) => {
    const colId = 'col_' + Date.now().toString(36);
    let options = undefined;
    if (type === 'select' || type === 'status') {
      options = [
        { id: 'opt_1', label: '进行中', color: 'sky' },
        { id: 'opt_2', label: '已完成', color: 'emerald' },
      ];
    }
    const newCol: ColumnSchema = {
      id: colId,
      name,
      type,
      width: 150,
      options,
    };
    const nextSchema = {
      ...collection.schema,
      [colId]: newCol,
    };
    const nextCollection: DbCollection = {
      ...collection,
      schema: nextSchema,
      updatedAt: Date.now(),
    };
    onUpdateCollection?.(nextCollection);
    await saveDbCollection(nextCollection);
  };

  const selectedRow = rows.find((r) => r.id === activeRowId);

  return (
    <div className="flex-1 flex h-full w-full bg-[#080b11] text-slate-100 overflow-hidden select-none">
      {/* 左侧表格主体 (在 Side Peek 打开时自适应缩放) */}
      <div
        className={`flex-1 flex flex-col h-full min-w-0 overflow-hidden transition-all duration-200 ${
          selectedRow && !isSidePeekMaximized ? 'opacity-95' : ''
        }`}
      >
        {/* 顶部多视图 Tab 栏与 Notion 经典工具栏 (49px 高度对齐基准线) */}
        <div className="h-[49px] border-b border-white/5 px-4 flex items-center justify-between bg-black/20 backdrop-blur-md shrink-0">
          {/* 左侧：多视图 Tab 标签切换 */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {views.map((v) => {
              const isActive = activeViewId === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => setActiveViewId(v.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
                    isActive
                      ? 'bg-white/10 text-white border border-white/15 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <Table size={13} className="text-sky-400" />
                  <span>{v.name}</span>
                </button>
              );
            })}
          </div>

          {/* 右侧：搜索、过滤与 Notion 纯蓝「+ 新建 ⌄」主按钮 */}
          <div className="flex items-center gap-2 shrink-0">
            {/* 实时搜索 */}
            <div className="relative">
              <Search
                size={13}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                type="text"
                placeholder="搜索问题或属性..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-36 bg-white/5 border border-white/10 rounded-lg pl-8 pr-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-all focus:w-48"
              />
            </div>

            <button
              onClick={() => setIsAddColModalOpen(true)}
              className="p-1.5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg border border-white/5 transition-colors"
              title="添加属性字段"
            >
              <SlidersHorizontal size={13} />
            </button>

            {/* Notion 经典纯蓝「+ 新建 ⌄」主按钮 */}
            <button
              onClick={handleAddRow}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#2383e2] hover:bg-[#1d74c9] text-white rounded-md text-xs font-medium shadow-sm shadow-blue-500/25 transition-all active:scale-95"
            >
              <Plus size={13} strokeWidth={2.5} />
              <span>新建</span>
              <ChevronDown size={12} className="opacity-70 ml-0.5" />
            </button>
          </div>
        </div>

        {/* 表格容器 */}
        <div className="flex-1 overflow-auto bg-slate-950/40">
          <table className="w-full border-collapse text-left border-b border-white/5">
            {/* 表头 */}
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5 sticky top-0 z-20 backdrop-blur-md">
                <th className="w-10 px-2 py-2 text-center text-[11px] text-slate-500 border-r border-white/5 font-mono select-none">
                  #
                </th>
                {columns.map((col, idx) => (
                  <th
                    key={col.id}
                    style={{ minWidth: col.width || 140, width: col.width || 140 }}
                    className="p-0 border-r border-white/5"
                  >
                    <TableHeaderCell
                      column={col}
                      isFirst={idx === 0}
                      onUpdateColumn={handleUpdateColumn}
                      onDeleteColumn={handleDeleteColumn}
                    />
                  </th>
                ))}
                <th className="w-10 px-2 py-1 text-center border-r border-white/5">
                  <button
                    onClick={() => setIsAddColModalOpen(true)}
                    className="p-1 hover:bg-white/10 text-slate-500 hover:text-slate-300 rounded transition-colors"
                    title="添加新列"
                  >
                    <Plus size={14} />
                  </button>
                </th>
                <th className="flex-1" />
              </tr>
            </thead>

            {/* 表体 */}
            <tbody>
              {filteredRows.map((row, rowIdx) => {
                const isRowActive = activeRowId === row.id;
                return (
                  <tr
                    key={row.id}
                    className={`group border-b border-white/[0.04] transition-colors h-9 ${
                      isRowActive
                        ? 'bg-sky-500/[0.08]'
                        : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    {/* 序号与删除按钮 */}
                    <td className="w-10 px-2 text-center border-r border-white/5 relative">
                      <span className="text-[11px] text-slate-600 font-mono group-hover:hidden select-none">
                        {rowIdx + 1}
                      </span>
                      <button
                        onClick={() => handleDeleteRow(row.id)}
                        className="hidden group-hover:flex items-center justify-center w-full text-slate-500 hover:text-rose-400 transition-colors"
                        title="删除此行"
                      >
                        <Trash2 size={12} />
                      </button>
                    </td>

                    {/* 单元格渲染 (第一列增加 Notion 风格「打开」预览胶囊) */}
                    {columns.map((col, colIdx) => (
                      <td
                        key={col.id}
                        className="p-0 border-r border-white/5 h-9 overflow-hidden relative"
                      >
                        <div className="flex items-center h-full w-full group/cell">
                          {colIdx === 0 && (
                            <button
                              onClick={() => setActiveRowId(row.id)}
                              className="opacity-0 group-hover/cell:opacity-100 flex items-center gap-0.5 px-1.5 py-0.5 bg-white/10 hover:bg-white/20 text-slate-200 rounded text-[10px] ml-1.5 transition-all shrink-0"
                              title="在侧边预览抽屉打开 (Side Peek)"
                            >
                              <span>打开</span>
                              <ArrowUpRight size={10} />
                            </button>
                          )}
                          <div className="flex-1 h-full min-w-0">
                            <TableRowCell
                              column={col}
                              value={row.cells[col.id]}
                              onChange={(val) => handleCellChange(row.id, col.id, val)}
                              isPrimary={colIdx === 0}
                            />
                          </div>
                        </div>
                      </td>
                    ))}

                    <td className="border-r border-white/5" />
                    <td />
                  </tr>
                );
              })}

              {/* 底部快速新增行 */}
              <tr
                onClick={handleAddRow}
                className="border-b border-white/[0.04] hover:bg-white/[0.03] cursor-pointer transition-colors h-8 text-slate-500 hover:text-slate-300"
              >
                <td className="w-10 px-2 text-center border-r border-white/5">
                  <Plus size={12} className="mx-auto" />
                </td>
                <td colSpan={columns.length + 2} className="px-3 text-xs">
                  + 新增记录
                </td>
              </tr>
            </tbody>
          </table>

          {/* 空数据提示 */}
          {!loading && filteredRows.length === 0 && (
            <div className="py-16 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-2">
              <Table size={24} className="opacity-40" />
              <span>当前视图暂无匹配记录，点击右上角蓝色「+ 新建」录入</span>
            </div>
          )}
        </div>

        {/* 底部汇总统计 (Footer) */}
        <div className="h-7 border-t border-white/5 px-4 flex items-center justify-between text-[11px] text-slate-500 bg-black/20 shrink-0">
          <div>共计 {filteredRows.length} 项记录</div>
          <div className="flex items-center gap-3">
            <span>Notion Table & Side Peek Engine</span>
          </div>
        </div>
      </div>

      {/* 右侧 Notion 经典 Side Peek 侧边预览抽屉 */}
      {selectedRow && (
        <SidePeekDrawer
          collection={collection}
          row={selectedRow}
          isMaximized={isSidePeekMaximized}
          onToggleMaximize={() => setIsSidePeekMaximized(!isSidePeekMaximized)}
          onClose={() => {
            setActiveRowId(null);
            setIsSidePeekMaximized(false);
          }}
          onUpdateCell={handleCellChange}
          onDeleteRow={handleDeleteRow}
          onAddColumn={handleAddColumn}
        />
      )}

      {/* 添加新列模态框 */}
      <AddColumnModal
        isOpen={isAddColModalOpen}
        onClose={() => setIsAddColModalOpen(false)}
        onAdd={handleAddColumn}
      />
    </div>
  );
};
