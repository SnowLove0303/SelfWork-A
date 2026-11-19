import React, { useState, useEffect, useMemo } from 'react';
import { DocBlock, DocReadingMetrics } from '../../../types/docs.ts';
import {
  FileText,
  Clock,
  BarChart3,
  ChevronUp,
  ChevronDown,
  X,
  Code2,
  Table as TableIcon,
  Film,
  Sparkles,
} from 'lucide-react';

interface DocStatsBadgeProps {
  blocks: DocBlock[];
}

/**
 * 实时字数、字符数与全景细粒度阅读指标分析透视
 * - 底部紧凑收敛暗黑微光磨砂胶囊
 * - 点击唤出全景透视卡片 (中文、英文、代码行、多媒体、双速阅读时长)
 */
export const DocStatsBadge: React.FC<DocStatsBadgeProps> = ({ blocks }) => {
  const [selectedStats, setSelectedStats] = useState<{ words: number; chars: number } | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // 监听选区
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

  // Esc 关闭弹窗
  useEffect(() => {
    if (!showModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowModal(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showModal]);

  // 全量多维指标计算
  const metrics = useMemo<DocReadingMetrics>(() => {
    let fullText = '';
    let codeLines = 0;
    let imageCount = 0;
    let tableCount = 0;

    blocks.forEach((b) => {
      if (b.blockType === 'code') {
        const lines = (b.content || '').split('\n').length;
        codeLines += Math.max(1, lines);
      } else if (b.blockType === 'image') {
        imageCount++;
      } else if (b.blockType === 'table') {
        tableCount++;
      }

      const pure = (b.content || '').replace(/<[^>]+>/g, ' ');
      fullText += pure + ' ';
    });

    const chineseChars = fullText.match(/[\u4e00-\u9fa5]/g)?.length || 0;
    const englishWords = fullText.match(/[a-zA-Z0-9_-]+/g)?.length || 0;
    const totalWords = chineseChars + englishWords;

    // 默读速度约 350 字/分，朗读速度约 180 字/分
    const estimatedSilentReadMinutes = Math.max(1, Math.ceil(totalWords / 350));
    const estimatedSpeechMinutes = Math.max(1, Math.ceil(totalWords / 180));

    return {
      totalWords,
      chineseChars,
      englishWords,
      codeLines,
      imageCount,
      tableCount,
      estimatedSilentReadMinutes,
      estimatedSpeechMinutes,
    };
  }, [blocks]);

  return (
    <>
      <div className="fixed bottom-4 right-6 z-40 select-none">
        <div
          onClick={() => setShowModal(true)}
          className="bg-slate-900/90 backdrop-blur-md border border-white/10 hover:border-sky-500/30 rounded-full px-3 py-1.5 shadow-xl shadow-black/50 transition-all flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer group/badge"
          title="点击查看全景阅读与统计透视"
        >
          {selectedStats ? (
            <div className="flex items-center gap-1.5 text-sky-400 font-medium animate-in fade-in">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
              <span>选区 {selectedStats.words} 词</span>
              <span className="text-slate-500 font-normal">({selectedStats.chars} 字符)</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-slate-300 group-hover/badge:text-sky-300 transition-colors">
                <FileText size={12} className="text-sky-400" />
                <span className="font-medium text-white">{metrics.totalWords}</span>
                <span className="text-[11px] text-slate-400">字</span>
              </div>

              <div className="w-px h-3 bg-white/15" />

              <div className="flex items-center gap-1 text-slate-400">
                <Clock size={12} className="text-amber-400/90" />
                <span>{metrics.estimatedSilentReadMinutes} 分钟</span>
              </div>

              {isExpanded && (
                <>
                  <div className="w-px h-3 bg-white/15" />
                  <div className="flex items-center gap-1 text-slate-400">
                    <BarChart3 size={12} className="text-emerald-400" />
                    <span>{metrics.chineseChars} 中文</span>
                  </div>
                  <div className="text-[11px] text-slate-500">· {blocks.length} 块</div>
                </>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="p-0.5 hover:bg-white/10 text-slate-400 hover:text-slate-200 rounded transition-colors"
            title={isExpanded ? '收起简报' : '展开简报'}
          >
            {isExpanded ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
          </button>
        </div>
      </div>

      {/* 全景细粒度阅读指标透视弹窗 */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150 select-none"
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-md bg-[#111622] border border-white/10 rounded-2xl shadow-2xl p-5 space-y-4 animate-in zoom-in-95 duration-150 text-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 顶栏 */}
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
                  <BarChart3 size={15} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">文档阅读指标透视</h3>
                  <p className="text-[10px] text-slate-400">实时字数、结构密度与朗读预估</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            {/* 核心字数指标卡片 */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <div className="text-[11px] text-slate-400">总字数 (Words)</div>
                <div className="text-xl font-bold text-white font-mono">{metrics.totalWords}</div>
                <div className="text-[10px] text-slate-500 flex gap-2">
                  <span>中文: {metrics.chineseChars}</span>
                  <span>英文: {metrics.englishWords}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <div className="text-[11px] text-slate-400">预计阅读时长</div>
                <div className="text-xl font-bold text-amber-300 font-mono">
                  {metrics.estimatedSilentReadMinutes} <span className="text-xs font-normal">分钟</span>
                </div>
                <div className="text-[10px] text-slate-500">
                  朗读演讲: 约 {metrics.estimatedSpeechMinutes} 分钟
                </div>
              </div>
            </div>

            {/* 内容结构密度透视 */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Sparkles size={13} className="text-sky-400" />
                <span>结构组成密度</span>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
                  <div className="text-sm font-bold text-slate-200 font-mono">{blocks.length}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">总块数</div>
                </div>
                <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
                  <div className="text-sm font-bold text-sky-400 font-mono">{metrics.codeLines}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 flex items-center justify-center gap-0.5">
                    <Code2 size={10} />
                    <span>代码行</span>
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
                  <div className="text-sm font-bold text-indigo-400 font-mono">{metrics.tableCount}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 flex items-center justify-center gap-0.5">
                    <TableIcon size={10} />
                    <span>表格</span>
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
                  <div className="text-sm font-bold text-pink-400 font-mono">{metrics.imageCount}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 flex items-center justify-center gap-0.5">
                    <Film size={10} />
                    <span>媒体</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 提示底栏 */}
            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
              <span>默读按 350 字/分 · 朗读按 180 字/分计算</span>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-3 py-1 bg-white/10 hover:bg-white/15 text-slate-200 rounded-lg transition-colors text-xs"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
