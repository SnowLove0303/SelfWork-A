import React, { useEffect, useRef } from 'react';
import { DocPage } from '../../../types/docs.ts';
import { ArrowRight } from 'lucide-react';

interface PageMentionMenuProps {
  pages: DocPage[];
  query: string;
  position: { top: number; left: number };
  selectedIndex: number;
  setSelectedIndex: (idx: number) => void;
  onSelectPage: (page: DocPage) => void;
  onClose: () => void;
}

export const PageMentionMenu: React.FC<PageMentionMenuProps> = ({
  pages,
  query,
  position,
  selectedIndex,
  setSelectedIndex,
  onSelectPage,
  onClose,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // 过滤匹配文档（根据 query 模糊匹配）
  const filteredPages = pages.filter((p) => {
    if (!query) return true;
    return p.title.toLowerCase().includes(query.toLowerCase());
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
      className="fixed z-50 w-72 bg-slate-900/95 backdrop-blur-xl border border-sky-500/30 rounded-xl shadow-2xl p-1.5 text-slate-200 animate-in fade-in zoom-in-95 duration-100 max-h-64 overflow-y-auto"
    >
      <div className="px-2.5 py-1 text-[10px] font-semibold text-sky-400 uppercase tracking-wider flex items-center justify-between border-b border-white/[0.06] mb-1">
        <span>链接到工作区文档</span>
        <span className="text-[9px] text-slate-500 font-normal">输入回车选定</span>
      </div>

      {filteredPages.length === 0 ? (
        <div className="py-3 px-2 text-center text-xs text-slate-500">
          未找到匹配标题的文档
        </div>
      ) : (
        <div className="space-y-0.5">
          {filteredPages.map((page, idx) => (
            <button
              key={page.id}
              onClick={() => onSelectPage(page)}
              onMouseEnter={() => setSelectedIndex(idx)}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                selectedIndex === idx
                  ? 'bg-sky-500/20 text-white'
                  : 'hover:bg-white/5 text-slate-300'
              }`}
            >
              <span className="text-base shrink-0 select-none">
                {page.icon || '📄'}
              </span>
              <div className="flex-1 truncate">
                <div className="text-xs font-medium truncate">
                  {page.title || '无标题文档'}
                </div>
              </div>
              <ArrowRight
                size={11}
                className={`opacity-0 ${selectedIndex === idx ? 'opacity-100 text-sky-400' : ''}`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
