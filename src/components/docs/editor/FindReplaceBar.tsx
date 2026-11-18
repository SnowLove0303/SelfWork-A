import React, { useRef, useEffect, useState } from 'react';
import {
  Search,
  ChevronUp,
  ChevronDown,
  X,
  Replace as ReplaceIcon,
  CaseSensitive,
} from 'lucide-react';

interface FindReplaceBarProps {
  isOpen: boolean;
  onClose: () => void;
  findQuery: string;
  setFindQuery: (q: string) => void;
  replaceQuery: string;
  setReplaceQuery: (r: string) => void;
  caseSensitive: boolean;
  setCaseSensitive: (cs: boolean) => void;
  currentMatch: number;
  totalMatches: number;
  onFindNext: () => void;
  onFindPrev: () => void;
  onReplaceCurrent: () => void;
  onReplaceAll: () => void;
}

export const FindReplaceBar: React.FC<FindReplaceBarProps> = ({
  isOpen,
  onClose,
  findQuery,
  setFindQuery,
  replaceQuery,
  setReplaceQuery,
  caseSensitive,
  setCaseSensitive,
  currentMatch,
  totalMatches,
  onFindNext,
  onFindPrev,
  onReplaceCurrent,
  onReplaceAll,
}) => {
  const [showReplace, setShowReplace] = useState(false);
  const findInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        findInputRef.current?.focus();
        findInputRef.current?.select();
      }, 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="absolute top-3 right-6 z-40 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-2 flex flex-col gap-1.5 w-[360px] text-xs text-slate-200 animate-in fade-in slide-in-from-top-2 duration-150 select-none">
      {/* 查找主行 */}
      <div className="flex items-center gap-1.5 bg-black/40 border border-white/10 rounded-lg px-2 py-1 focus-within:border-sky-500/50 transition-colors">
        <button
          type="button"
          onClick={() => setShowReplace(!showReplace)}
          className={`p-1 rounded transition-colors cursor-pointer ${
            showReplace
              ? 'bg-sky-500/20 text-sky-300'
              : 'hover:bg-white/10 text-slate-400 hover:text-slate-200'
          }`}
          title={showReplace ? '收起替换面板' : '展开替换面板'}
        >
          <ReplaceIcon size={13} />
        </button>

        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <Search size={12} className="text-slate-500 shrink-0" />
          <input
            ref={findInputRef}
            type="text"
            value={findQuery}
            onChange={(e) => setFindQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (e.shiftKey) {
                  onFindPrev();
                } else {
                  onFindNext();
                }
              } else if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
              }
            }}
            placeholder="查找文档内容..."
            className="w-full bg-transparent border-none outline-none text-xs text-slate-100 placeholder-slate-500 leading-normal"
          />
        </div>

        {/* 匹配项计数指示 */}
        <span className="text-[10px] font-mono text-slate-400 shrink-0 tabular-nums px-1">
          {totalMatches > 0 ? `${currentMatch + 1}/${totalMatches}` : '无匹配'}
        </span>

        {/* 区分大小写切换 */}
        <button
          type="button"
          onClick={() => setCaseSensitive(!caseSensitive)}
          className={`p-1 rounded transition-colors cursor-pointer ${
            caseSensitive
              ? 'bg-sky-500/20 text-sky-300 font-bold'
              : 'hover:bg-white/10 text-slate-400 hover:text-slate-200'
          }`}
          title={caseSensitive ? '区分大小写 (已开启)' : '区分大小写 (已关闭)'}
        >
          <CaseSensitive size={13} />
        </button>

        {/* 上一个 */}
        <button
          type="button"
          disabled={totalMatches === 0}
          onClick={onFindPrev}
          className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          title="上一个匹配 (Shift+Enter)"
        >
          <ChevronUp size={13} />
        </button>

        {/* 下一个 */}
        <button
          type="button"
          disabled={totalMatches === 0}
          onClick={onFindNext}
          className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          title="下一个匹配 (Enter)"
        >
          <ChevronDown size={13} />
        </button>

        {/* 关闭按钮 */}
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer ml-0.5"
          title="关闭 (Esc)"
        >
          <X size={13} />
        </button>
      </div>

      {/* 替换展开行 */}
      {showReplace && (
        <div className="flex items-center gap-1.5 pt-0.5 animate-in fade-in duration-100">
          <div className="flex items-center flex-1 min-w-0 bg-black/40 border border-white/10 rounded-lg px-2.5 py-1 focus-within:border-sky-500/50 transition-colors">
            <input
              type="text"
              value={replaceQuery}
              onChange={(e) => setReplaceQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onReplaceCurrent();
                } else if (e.key === 'Escape') {
                  e.preventDefault();
                  onClose();
                }
              }}
              placeholder="替换为..."
              className="w-full bg-transparent border-none outline-none text-xs text-slate-100 placeholder-slate-500 leading-normal"
            />
          </div>

          <button
            type="button"
            disabled={totalMatches === 0}
            onClick={onReplaceCurrent}
            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-medium transition-colors cursor-pointer disabled:opacity-30 disabled:pointer-events-none shrink-0"
            title="替换当前匹配项"
          >
            替换
          </button>

          <button
            type="button"
            disabled={totalMatches === 0}
            onClick={onReplaceAll}
            className="px-2.5 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 hover:text-sky-200 border border-sky-500/30 text-xs font-medium transition-colors cursor-pointer disabled:opacity-30 disabled:pointer-events-none shrink-0"
            title="全部替换"
          >
            全部
          </button>
        </div>
      )}
    </div>
  );
};
