import React, { useState, useMemo } from 'react';
import { DocPage } from '../../../types/docs.ts';
import { scanBacklinksForPage, BacklinkItem } from '../../../services/backlinks.ts';
import { Link2, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';

interface BacklinksPanelProps {
  pageId: string;
  allPages?: DocPage[];
  onNavigatePage?: (pageId: string) => void;
}

/**
 * 双向反向链接底栏面板 (BacklinksPanel)
 * - 扫描全库对当前页面的引用记录
 * - 展示引用来源、上下文片段与一键穿透跳转
 */
export const BacklinksPanel: React.FC<BacklinksPanelProps> = ({
  pageId,
  allPages = [],
  onNavigatePage,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const backlinks = useMemo<BacklinkItem[]>(() => {
    return scanBacklinksForPage(pageId, allPages);
  }, [pageId, allPages]);

  if (backlinks.length === 0) {
    return null; // 若无反向引用，不占用视觉空间
  }

  const formatRelative = (ts: number) => {
    const diffSec = Math.floor((Date.now() - ts) / 1000);
    if (diffSec < 60) return '刚刚';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)} 分钟前`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} 小时前`;
    return `${Math.floor(diffSec / 86400)} 天前`;
  };

  return (
    <div className="mt-8 pt-4 border-t border-white/[0.06] select-none">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between py-2 px-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 transition-all cursor-pointer group/bl"
      >
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <Link2 size={14} className="text-sky-400 group-hover/bl:scale-110 transition-transform" />
          <span>反向链接 (Backlinks)</span>
          <span className="text-[10px] px-2 py-0.2 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/25 font-mono">
            {backlinks.length} 处引用
          </span>
        </div>

        <button
          type="button"
          className="p-1 text-slate-500 group-hover/bl:text-slate-300 rounded transition-colors"
        >
          {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-3 space-y-2.5 animate-in fade-in duration-150">
          {backlinks.map((item, idx) => (
            <div
              key={`${item.sourcePageId}_${item.blockId}_${idx}`}
              onClick={() => onNavigatePage?.(item.sourcePageId)}
              className="p-3.5 rounded-xl bg-black/30 hover:bg-white/[0.05] border border-white/10 hover:border-sky-500/40 shadow-sm transition-all duration-200 cursor-pointer flex flex-col gap-2 group/item"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base leading-none">{item.sourcePageIcon || '📄'}</span>
                  <span className="text-xs font-medium text-slate-200 group-hover/item:text-white transition-colors">
                    {item.sourcePageTitle}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                  <span>{formatRelative(item.sourceUpdatedAt)}</span>
                  <ArrowRight
                    size={11}
                    className="text-sky-400 opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-0.5 transition-all"
                  />
                </div>
              </div>

              <div className="p-2 rounded-lg bg-black/40 border border-white/[0.04] text-xs text-slate-400 font-normal leading-relaxed line-clamp-2">
                "{item.contextPreview}"
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
