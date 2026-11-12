import React, { useState, useRef, useEffect } from 'react';
import { ColumnSchema } from '../../../types/docs.ts';
import { Check, ChevronDown, Plus } from 'lucide-react';

interface TableRowCellProps {
  column: ColumnSchema;
  value: any;
  onChange: (val: any) => void;
  isPrimary?: boolean;
}

const COLOR_MAP: Record<string, string> = {
  sky: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  emerald: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  amber: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  rose: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  purple: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  slate: 'bg-slate-700/40 text-slate-300 border-slate-600/30',
};

export const TableRowCell: React.FC<TableRowCellProps> = ({
  column,
  value,
  onChange,
  isPrimary,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localVal, setLocalVal] = useState(value ?? '');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalVal(value ?? '');
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  // 1. 复选框类型 (Checkbox)
  if (column.type === 'checkbox') {
    const isChecked = Boolean(value);
    return (
      <div className="flex items-center justify-center w-full h-full px-2">
        <button
          onClick={() => onChange(!isChecked)}
          className={`w-4 h-4 rounded flex items-center justify-center transition-all ${
            isChecked
              ? 'bg-purple-500 text-white shadow-sm shadow-purple-500/30'
              : 'border border-white/20 hover:border-white/40 bg-white/5'
          }`}
        >
          {isChecked && <Check size={12} strokeWidth={3} />}
        </button>
      </div>
    );
  }

  // 2. 单选标签与状态类型 (Select / Status)
  if (column.type === 'select' || column.type === 'status') {
    const options = column.options || [];
    const selectedOpt = options.find((o) => o.id === value || o.label === value);

    return (
      <div className="relative w-full h-full flex items-center px-3" ref={dropdownRef}>
        {selectedOpt ? (
          <div
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium border cursor-pointer hover:brightness-110 transition-all ${
              COLOR_MAP[selectedOpt.color] || COLOR_MAP.slate
            }`}
          >
            <span>{selectedOpt.label}</span>
            <ChevronDown size={11} className="opacity-60" />
          </div>
        ) : (
          <div
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="text-xs text-slate-500 hover:text-slate-300 cursor-pointer flex items-center gap-1"
          >
            <Plus size={12} />
            <span>选择</span>
          </div>
        )}

        {isDropdownOpen && (
          <div className="absolute left-2 top-full mt-1 w-44 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
            <div className="space-y-0.5 max-h-48 overflow-y-auto">
              {options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    onChange(opt.id);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-xs transition-colors ${
                    value === opt.id
                      ? 'bg-white/10 text-white font-medium'
                      : 'hover:bg-white/5 text-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block px-1.5 py-0.5 rounded border text-[11px] ${
                      COLOR_MAP[opt.color] || COLOR_MAP.slate
                    }`}
                  >
                    {opt.label}
                  </span>
                  {value === opt.id && <Check size={12} className="text-sky-400" />}
                </button>
              ))}
              {options.length === 0 && (
                <div className="text-[11px] text-slate-500 text-center py-2">
                  无可用选项，请在表头添加
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // 3. 日期类型 (Date)
  if (column.type === 'date') {
    return (
      <div className="w-full h-full flex items-center px-2">
        <input
          type="date"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="bg-transparent text-xs text-slate-200 border-none focus:outline-none focus:bg-white/5 rounded px-1 py-0.5 w-full [color-scheme:dark]"
        />
      </div>
    );
  }

  // 4. 数字类型 (Number)
  if (column.type === 'number') {
    const handleCommit = () => {
      setIsEditing(false);
      const parsed = parseFloat(localVal);
      onChange(isNaN(parsed) ? null : parsed);
    };

    if (isEditing) {
      return (
        <input
          ref={inputRef}
          type="number"
          value={localVal}
          onChange={(e) => setLocalVal(e.target.value)}
          onBlur={handleCommit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleCommit();
            if (e.key === 'Escape') {
              setLocalVal(value ?? '');
              setIsEditing(false);
            }
          }}
          className="w-full h-full px-3 py-1 bg-sky-500/10 border border-sky-500/40 rounded-none text-xs text-white focus:outline-none"
        />
      );
    }

    return (
      <div
        onClick={() => setIsEditing(true)}
        className="w-full h-full flex items-center px-3 text-xs text-slate-300 cursor-text hover:bg-white/[0.02] truncate"
      >
        {value !== null && value !== undefined && value !== '' ? (
          <span className="font-mono">{value}</span>
        ) : (
          <span className="text-slate-600 select-none">空</span>
        )}
      </div>
    );
  }

  // 5. 默认普通文本类型 (Text)
  const handleTextCommit = () => {
    setIsEditing(false);
    onChange(localVal);
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={localVal}
        onChange={(e) => setLocalVal(e.target.value)}
        onBlur={handleTextCommit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleTextCommit();
          if (e.key === 'Escape') {
            setLocalVal(value ?? '');
            setIsEditing(false);
          }
        }}
        className="w-full h-full px-3 py-1 bg-sky-500/10 border border-sky-500/40 rounded-none text-xs text-white focus:outline-none"
      />
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className={`w-full h-full flex items-center px-3 text-xs cursor-text hover:bg-white/[0.02] truncate ${
        isPrimary ? 'font-medium text-slate-100' : 'text-slate-300'
      }`}
    >
      {value ? (
        <span className="truncate">{String(value)}</span>
      ) : (
        <span className="text-slate-600 select-none">空</span>
      )}
    </div>
  );
};
