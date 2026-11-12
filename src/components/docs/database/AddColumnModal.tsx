import React, { useState } from 'react';
import { ColumnType } from '../../../types/docs.ts';
import { Type, Hash, Tag, Activity, CheckSquare, Calendar, X } from 'lucide-react';

interface AddColumnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, type: ColumnType) => void;
}

export const AddColumnModal: React.FC<AddColumnModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<ColumnType>('text');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd(name.trim(), type);
    setName('');
    setType('text');
    onClose();
  };

  const TYPES: Array<{ type: ColumnType; label: string; desc: string; icon: React.ReactNode }> = [
    { type: 'text', label: '文本', desc: '纯文本段落或字符串', icon: <Type size={14} className="text-slate-400" /> },
    { type: 'number', label: '数字', desc: '数值、金额或百分比', icon: <Hash size={14} className="text-amber-400" /> },
    { type: 'status', label: '进度状态', desc: '待处理、进行中、已完成', icon: <Activity size={14} className="text-emerald-400" /> },
    { type: 'select', label: '单选标签', desc: '自定义单选颜色标签', icon: <Tag size={14} className="text-sky-400" /> },
    { type: 'checkbox', label: '复选框', desc: '布尔值勾选框', icon: <CheckSquare size={14} className="text-purple-400" /> },
    { type: 'date', label: '日期', desc: '年月日时间戳', icon: <Calendar size={14} className="text-pink-400" /> },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-sm shadow-2xl p-5 text-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">添加新字段</h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
          >
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 font-medium block mb-1.5">字段名称</label>
            <input
              type="text"
              placeholder="例如：优先级、负责人、估时..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 font-medium block mb-1.5">数据类型</label>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {TYPES.map((t) => (
                <div
                  key={t.type}
                  onClick={() => setType(t.type)}
                  className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-all ${
                    type === t.type
                      ? 'bg-sky-500/10 border-sky-500/40 text-white'
                      : 'bg-white/[0.02] border-white/5 text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <div className="p-1.5 rounded-lg bg-white/5">{t.icon}</div>
                  <div className="flex-1 truncate">
                    <div className="text-xs font-medium">{t.label}</div>
                    <div className="text-[11px] text-slate-500 truncate">{t.desc}</div>
                  </div>
                  {type === t.type && (
                    <div className="w-2 h-2 rounded-full bg-sky-400 shadow-sm shadow-sky-400/50" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-white/5 rounded-lg"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-4 py-1.5 text-xs font-medium bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white rounded-lg shadow-sm shadow-sky-500/20"
            >
              确认添加
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
