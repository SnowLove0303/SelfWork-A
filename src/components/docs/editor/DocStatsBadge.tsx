import React, { useState, useEffect, useMemo } from 'react';
import { DocBlock } from '../../../types/docs.ts';
import { FileText, Clock, BarChart3, ChevronUp, ChevronDown } from 'lucide-react';

interface DocStatsBadgeProps {
  blocks: DocBlock[];
}

/**
 * 实时字数、字符数与阅读时长统计微光胶囊
 * - 支持全局统计与划选选区即时联动
 * - 紧凑收敛的暗黑微光磨砂玻璃胶囊设计
 */
export const DocStatsBadge: React.FC<DocStatsBadgeProps> = ({ blocks }) => {
  const [selectedStats, setSelectedStats] = useState<{ words: number; chars: number } | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // 监听划选区域的 selectionchange 事件
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || !selection.toString().trim()) {
        setSelectedStats(null);
        return;
      }

      const text = selection.toString();
      const chineseChars = text.match(/[\u4e00-\u9fa5]/g)?.length || 0;
      const englishWords = text.match(/[a-zA-Z0-9_-]+/g)?.length || 0;
      const words = chineseChars + englishWords;
      const chars = text.replace(/\s+/g, '').length;

      setSelectedStats({ words, chars });
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, []);

  // 计算全文总字数、字符数与阅读时长
  const stats = useMemo(() => {
    let fullText = '';
    blocks.forEach((b) => {
      // 过滤 HTML 标签与空白
      const pure = b.content.replace(/<[^>]+>/g, ' ');
      fullText += pure + ' ';
    });

    const chineseChars = fullText.match(/[\u4e00-\u9fa5]/g)?.length || 0;
    const englishWords = fullText.match(/[a-zA-Z0-9_-]+/g)?.length || 0;
    const words = chineseChars + englishWords;
    const chars = fullText.replace(/\s+/g, '').length;
    // 平均阅读速度约 300 字/分钟，最少 1 分钟
    const readingTime = Math.max(1, Math.ceil(words / 300));

    return {
      totalBlocks: blocks.length,
      words,
      chars,
      readingTime,
    };
  }, [blocks]);

  return (
    <div className="fixed bottom-4 right-6 z-40 select-none">
      <div className="bg-slate-900/85 backdrop-blur-md border border-white/10 hover:border-white/20 rounded-full px-3 py-1.5 shadow-xl shadow-black/50 transition-all flex items-center gap-2.5 text-xs text-slate-300">
        {selectedStats ? (
          // 选区选中状态：高亮提示当前选区字数
          <div className="flex items-center gap-1.5 text-sky-400 font-medium animate-in fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
            <span>选区 {selectedStats.words} 词</span>
            <span className="text-slate-500 font-normal">({selectedStats.chars} 字符)</span>
          </div>
        ) : (
          // 全局统计
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-slate-300">
              <FileText size={12} className="text-sky-400" />
              <span className="font-medium text-white">{stats.words}</span>
              <span className="text-[11px] text-slate-400">字</span>
            </div>

            <div className="w-px h-3 bg-white/15" />

            <div className="flex items-center gap-1 text-slate-400">
              <Clock size={12} className="text-amber-400/90" />
              <span>{stats.readingTime} 分钟</span>
            </div>

            {isExpanded && (
              <>
                <div className="w-px h-3 bg-white/15" />
                <div className="flex items-center gap-1 text-slate-400">
                  <BarChart3 size={12} className="text-emerald-400" />
                  <span>{stats.chars} 字符</span>
                </div>
                <div className="text-[11px] text-slate-500">· {stats.totalBlocks} 块</div>
              </>
            )}
          </div>
        )}

        {/* 展开/收起详情切换 */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-0.5 hover:bg-white/10 text-slate-400 hover:text-slate-200 rounded transition-colors"
          title={isExpanded ? '收起详情' : '展开字符数与块数'}
        >
          {isExpanded ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
        </button>
      </div>
    </div>
  );
};
