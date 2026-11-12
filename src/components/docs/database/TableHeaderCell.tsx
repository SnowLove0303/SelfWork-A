import React, { useState, useRef, useEffect } from 'react';
import { ColumnSchema, ColumnType, SelectOption } from '../../../types/docs.ts';
import {
  Type,
  Hash,
  Tag,
  CheckSquare,
  Calendar,
  Activity,
  MoreHorizontal,
  Trash2,
  Edit2,
  Plus,
} from 'lucide-react';

interface TableHeaderCellProps {
  column: ColumnSchema;
  isFirst: boolean;
  onUpdateColumn: (updated: ColumnSchema) => void;
  onDeleteColumn: (columnId: string) => void;
}

export const getColumnTypeIcon = (type: ColumnType) => {
  switch (type) {
    case 'text':
      return <Type size={14} className="text-slate-400" />;
    case 'number':
      return <Hash size={14} className="text-amber-400" />;
    case 'select':
    case 'multi_select':
      return <Tag size={14} className="text-sky-400" />;
    case 'status':
      return <Activity size={14} className="text-emerald-400" />;
    case 'checkbox':
      return <CheckSquare size={14} className="text-purple-400" />;
    case 'date':
      return <Calendar size={14} className="text-pink-400" />;
    default:
      return <Type size={14} className="text-slate-400" />;
  }
};

export const TableHeaderCell: React.FC<TableHeaderCellProps> = ({
  column,
  isFirst,
  onUpdateColumn,
  onDeleteColumn,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(column.name);
  const [newOptionLabel, setNewOptionLabel] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setIsEditingName(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleNameSave = () => {
    if (nameInput.trim()) {
      onUpdateColumn({ ...column, name: nameInput.trim() });
    }
    setIsEditingName(false);
  };

  const handleTypeChange = (newType: ColumnType) => {
    let options = column.options;
    if ((newType === 'select' || newType === 'status') && (!options || options.length === 0)) {
      options = [
        { id: 'opt_1', label: '选项 1', color: 'sky' },
        { id: 'opt_2', label: '选项 2', color: 'emerald' },
      ];
    }
    onUpdateColumn({ ...column, type: newType, options });
  };

  const handleAddOption = () => {
    if (!newOptionLabel.trim()) return;
    const colors = ['sky', 'emerald', 'amber', 'rose', 'purple', 'slate'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const newOpt: SelectOption = {
      id: 'opt_' + Date.now(),
      label: newOptionLabel.trim(),
      color: randomColor,
    };
    const options = [...(column.options || []), newOpt];
    onUpdateColumn({ ...column, options });
    setNewOptionLabel('');
  };

  const handleDeleteOption = (optId: string) => {
    const options = (column.options || []).filter((o) => o.id !== optId);
    onUpdateColumn({ ...column, options });
  };

  return (
    <div className="relative group/col flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-300 border-r border-white/5 select-none hover:bg-white/[0.03] transition-colors">
      <div className="flex items-center gap-2 truncate">
        {getColumnTypeIcon(column.type)}
        <span className="truncate">{column.name}</span>
      </div>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="opacity-0 group-hover/col:opacity-100 p-1 hover:bg-white/10 rounded transition-all text-slate-400 hover:text-white"
        title="字段配置"
      >
        <MoreHorizontal size={13} />
      </button>

      {/* 字段配置下拉菜单 */}
      {isOpen && (
        <div
          ref={menuRef}
          className="absolute left-2 top-full mt-1 w-64 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-3 z-50 text-slate-200 text-xs animate-in fade-in zoom-in-95 duration-100"
        >
          {/* 列名修改 */}
          <div className="mb-3">
            <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">
              字段名称
            </label>
            {isEditingName ? (
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleNameSave();
                    if (e.key === 'Escape') setIsEditingName(false);
                  }}
                  autoFocus
                  className="flex-1 bg-white/5 border border-white/15 rounded-md px-2 py-1 text-xs text-white focus:outline-none focus:border-sky-500"
                />
                <button
                  onClick={handleNameSave}
                  className="px-2 py-1 bg-sky-500 hover:bg-sky-400 text-white rounded-md text-[11px] font-medium"
                >
                  保存
                </button>
              </div>
            ) : (
              <div
                onClick={() => setIsEditingName(true)}
                className="flex items-center justify-between p-1.5 bg-white/5 hover:bg-white/10 rounded-md cursor-pointer text-slate-200"
              >
                <span>{column.name}</span>
                <Edit2 size={12} className="text-slate-400" />
              </div>
            )}
          </div>

          {/* 属性类型切换 */}
          <div className="mb-3">
            <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">
              数据类型
            </label>
            <div className="grid grid-cols-2 gap-1">
              {[
                { type: 'text', label: '文本', icon: <Type size={12} /> },
                { type: 'number', label: '数字', icon: <Hash size={12} /> },
                { type: 'status', label: '状态', icon: <Activity size={12} /> },
                { type: 'select', label: '单选', icon: <Tag size={12} /> },
                { type: 'checkbox', label: '复选框', icon: <CheckSquare size={12} /> },
                { type: 'date', label: '日期', icon: <Calendar size={12} /> },
              ].map((item) => (
                <button
                  key={item.type}
                  onClick={() => handleTypeChange(item.type as ColumnType)}
                  className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md text-left transition-colors ${
                    column.type === item.type
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                      : 'hover:bg-white/5 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 选项管理 (针对 select 与 status) */}
          {(column.type === 'select' || column.type === 'status') && (
            <div className="mb-3 border-t border-white/5 pt-2">
              <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1.5">
                标签选项
              </label>
              <div className="space-y-1 mb-2 max-h-28 overflow-y-auto">
                {(column.options || []).map((opt) => (
                  <div
                    key={opt.id}
                    className="flex items-center justify-between px-2 py-1 bg-white/5 rounded text-xs"
                  >
                    <span className="truncate">{opt.label}</span>
                    <button
                      onClick={() => handleDeleteOption(opt.id)}
                      className="text-slate-500 hover:text-rose-400 p-0.5"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="新标签名称..."
                  value={newOptionLabel}
                  onChange={(e) => setNewOptionLabel(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddOption()}
                  className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-sky-500"
                />
                <button
                  onClick={handleAddOption}
                  className="p-1 bg-white/10 hover:bg-white/20 text-slate-200 rounded"
                >
                  <Plus size={13} />
                </button>
              </div>
            </div>
          )}

          {/* 删除此列 (第一列主键不允许删除) */}
          {!isFirst && (
            <div className="border-t border-white/5 pt-2">
              <button
                onClick={() => {
                  onDeleteColumn(column.id);
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 rounded-md transition-colors font-medium text-xs"
              >
                <Trash2 size={12} />
                <span>删除此字段</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
