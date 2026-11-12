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
  Database,
  SlidersHorizontal,
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

  // 搜索过滤
  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return rows;
    const q = searchQuery.toLowerCase().trim();
    return rows.filter((row) => {
      return Object.values(row.cells).some((val) => {
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(q);
      });
    });
  }, [rows, searchQuery]);

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

  // 2. 新增数据行
  const handleAddRow = async () => {
    const newRowId = 'row_' + Date.now();
    const newRow: DbCollectionRow = {
      id: newRowId,
      collectionId: collection.id,
      cells: {},
      sortOrder: (rows[rows.length - 1]?.sortOrder || 0) + 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const nextRows = [...rows, newRow];
    setRows(nextRows);
    await saveDbCollectionRow(newRow);
  };

  // 3. 删除数据行
  const handleDeleteRow = async (rowId: string) => {
    const nextRows = rows.filter((r) => r.id !== rowId);
    setRows(nextRows);
    await deleteDbCollectionRow(collection.id, rowId);
  };

  // 4. 更新列属性 (名称/类型/选项)
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

    // 同步清空各行中该列的数据
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

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0a0d14] text-slate-100 overflow-hidden select-none">
      {/* 顶部工具栏 (49px 高度对齐基准线) */}
      <div className="h-[49px] border-b border-white/5 px-4 flex items-center justify-between bg-black/20 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-sky-500/10 text-sky-400 rounded-lg border border-sky-500/20">
            <Database size={15} />
          </div>
          <div>
            <h2 className="text-xs font-semibold text-white tracking-wide">
              {collection.name}
            </h2>
          </div>
          <span className="text-[11px] text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">
            {rows.length} 条记录
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* 实时搜索 */}
          <div className="relative">
            <Search
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              type="text"
              placeholder="搜索表格内容..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-44 bg-white/5 border border-white/10 rounded-lg pl-8 pr-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-all focus:w-56"
            />
          </div>

          {/* 添加字段按钮 */}
          <button
            onClick={() => setIsAddColModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg text-xs font-medium border border-white/5 transition-colors"
          >
            <SlidersHorizontal size={13} />
            <span>添加字段</span>
          </button>

          {/* 新建记录 */}
          <button
            onClick={handleAddRow}
            className="flex items-center gap-1.5 px-3 py-1 bg-sky-500 hover:bg-sky-400 text-white rounded-lg text-xs font-medium shadow-sm shadow-sky-500/20 transition-colors"
          >
            <Plus size={13} />
            <span>新建记录</span>
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
                  style={{ minWidth: col.width || 150, width: col.width || 150 }}
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
              {/* 表头末尾添加列按钮 */}
              <th className="w-12 px-2 py-1 text-center border-r border-white/5">
                <button
                  onClick={() => setIsAddColModalOpen(true)}
                  className="p-1 hover:bg-white/10 text-slate-500 hover:text-slate-300 rounded transition-colors"
                  title="添加新列"
                >
                  <Plus size={14} />
                </button>
              </th>
              {/* 占位剩余宽度 */}
              <th className="flex-1" />
            </tr>
          </thead>

          {/* 表体 */}
          <tbody>
            {filteredRows.map((row, rowIdx) => (
              <tr
                key={row.id}
                className="group border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors h-9"
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

                {/* 单元格渲染 */}
                {columns.map((col, colIdx) => (
                  <td
                    key={col.id}
                    className="p-0 border-r border-white/5 h-9 overflow-hidden"
                  >
                    <TableRowCell
                      column={col}
                      value={row.cells[col.id]}
                      onChange={(val) => handleCellChange(row.id, col.id, val)}
                      isPrimary={colIdx === 0}
                    />
                  </td>
                ))}

                {/* 空白占位 */}
                <td className="border-r border-white/5" />
                <td />
              </tr>
            ))}

            {/* 快速新增行按钮 */}
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
            <Database size={24} className="opacity-40" />
            <span>暂无记录，点击上方“新建记录”开始录入</span>
          </div>
        )}
      </div>

      {/* 底部汇总统计 (Footer) */}
      <div className="h-7 border-t border-white/5 px-4 flex items-center justify-between text-[11px] text-slate-500 bg-black/20 shrink-0">
        <div>总计 {rows.length} 项</div>
        <div className="flex items-center gap-3">
          <span>SelfWork Table Engine v1.0</span>
        </div>
      </div>

      {/* 添加新列模态框 */}
      <AddColumnModal
        isOpen={isAddColModalOpen}
        onClose={() => setIsAddColModalOpen(false)}
        onAdd={handleAddColumn}
      />
    </div>
  );
};
