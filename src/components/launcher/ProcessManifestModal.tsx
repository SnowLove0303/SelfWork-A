import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Activity,
  RefreshCw,
  Power,
  Layers,
  Cpu,
  FolderOpen,
  Search,
  Loader2,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { LauncherItem, LauncherCategory } from '../../types/launcher.ts';

export interface ProcessStatusEntry {
  id: string;
  is_running: boolean;
  pids: number[];
  window_handles?: number[];
  instance_count: number;
}

interface ProcessManifestModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: LauncherItem[];
  categories: LauncherCategory[];
  processStatusMap: Record<string, ProcessStatusEntry>;
  terminatingItemIds: Record<string, boolean>;
  isTerminatingAll: boolean;
  onRefresh: () => void;
  onTerminateAll: () => Promise<void>;
  onTerminateItem: (item: LauncherItem) => Promise<void>;
  onTerminateCombo: (combo: LauncherItem) => Promise<void>;
}

type ManifestFilterTab = 'all' | 'combo' | 'item';

export const ProcessManifestModal: React.FC<ProcessManifestModalProps> = ({
  isOpen,
  onClose,
  items,
  categories,
  processStatusMap,
  terminatingItemIds,
  isTerminatingAll,
  onRefresh,
  onTerminateAll,
  onTerminateItem,
  onTerminateCombo,
}) => {
  const [filterTab, setFilterTab] = useState<ManifestFilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmKillAll, setConfirmKillAll] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ESC 关闭弹窗
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // 二次确认超时自动复位 (3.5s)
  useEffect(() => {
    if (!confirmKillAll) return;
    const timer = setTimeout(() => setConfirmKillAll(false), 3500);
    return () => clearTimeout(timer);
  }, [confirmKillAll]);

  useEffect(() => {
    if (!isOpen) {
      setConfirmKillAll(false);
    }
  }, [isOpen]);

  const categoryMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const c of categories) {
      map[c.id] = c.name;
    }
    return map;
  }, [categories]);

  const itemMap = useMemo(() => {
    const map: Record<string, LauncherItem> = {};
    for (const it of items) {
      map[it.id] = it;
    }
    return map;
  }, [items]);

  // 全部运行中的单项（应用 + 文件夹）
  const runningItems = useMemo(() => {
    return items
      .filter(
        (it) =>
          (it.type === 'app' || it.type === 'folder') &&
          processStatusMap[it.id]?.is_running
      )
      .sort((a, b) => {
        const countA = processStatusMap[a.id]?.instance_count || 0;
        const countB = processStatusMap[b.id]?.instance_count || 0;
        return countB - countA || a.name.localeCompare(b.name, 'zh-CN');
      });
  }, [items, processStatusMap]);

  // 全部运行中的组合
  const runningCombos = useMemo(() => {
    return items
      .filter((it) => it.type === 'bundle')
      .map((combo) => {
        const subIds = combo.bundleItemIds || [];
        const subItems = subIds.map((id) => itemMap[id]).filter(Boolean);
        const detectableSubs = subItems.filter(
          (sub) => sub.type === 'app' || sub.type === 'folder'
        );
        const runningSubs = detectableSubs.filter(
          (sub) => processStatusMap[sub.id]?.is_running
        );
        return {
          combo,
          subItems,
          detectableCount: detectableSubs.length,
          runningCount: runningSubs.length,
          isAllRunning:
            detectableSubs.length > 0 && runningSubs.length === detectableSubs.length,
        };
      })
      .filter((entry) => entry.runningCount > 0);
  }, [items, itemMap, processStatusMap]);

  // 搜索过滤
  const filteredCombos = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return runningCombos;
    return runningCombos.filter(
      (entry) =>
        entry.combo.name.toLowerCase().includes(q) ||
        entry.subItems.some((sub) => sub.name.toLowerCase().includes(q))
    );
  }, [runningCombos, searchQuery]);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return runningItems;
    return runningItems.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.target.toLowerCase().includes(q) ||
        (categoryMap[item.categoryId] || '').toLowerCase().includes(q)
    );
  }, [runningItems, searchQuery, categoryMap]);

  if (!isOpen) return null;

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    onRefresh();
    setTimeout(() => setIsRefreshing(false), 450);
  };

  const handleKillAllClick = async () => {
    if (runningItems.length === 0 || isTerminatingAll) return;
    if (!confirmKillAll) {
      setConfirmKillAll(true);
      return;
    }
    setConfirmKillAll(false);
    await onTerminateAll();
  };

  const showCombos = filterTab === 'all' || filterTab === 'combo';
  const showItems = filterTab === 'all' || filterTab === 'item';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[82vh] flex flex-col bg-[#0d111a]/95 border border-white/15 rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.75)] overflow-hidden text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部标题与操作栏 */}
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <h2 className="text-sm font-semibold text-white tracking-tight">
              运行清单
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleManualRefresh}
              className="flex items-center gap-1.5 h-8 px-2.5 rounded-xl text-xs font-medium bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/10 transition-all"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`}
              />
              <span>刷新</span>
            </button>

            <button
              type="button"
              disabled={runningItems.length === 0 || isTerminatingAll}
              onClick={handleKillAllClick}
              className={`flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-medium border transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                confirmKillAll
                  ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-400 shadow-[0_0_16px_rgba(244,63,94,0.45)] animate-pulse'
                  : 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 hover:text-rose-200 border-rose-500/35'
              }`}
            >
              {isTerminatingAll ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : confirmKillAll ? (
                <AlertTriangle className="w-3.5 h-3.5" />
              ) : (
                <Power className="w-3.5 h-3.5" />
              )}
              <span>
                {isTerminatingAll
                  ? '关闭中...'
                  : confirmKillAll
                  ? `确认关闭 (${runningItems.length})`
                  : '全部关闭'}
              </span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 筛选与搜索栏 */}
        <div className="flex items-center justify-between gap-3 px-5 py-2.5 border-b border-white/[0.07] bg-black/20">
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
            <button
              type="button"
              onClick={() => setFilterTab('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                filterTab === 'all'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              全部 ({runningCombos.length + runningItems.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('combo')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                filterTab === 'combo'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              组合 ({runningCombos.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('item')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                filterTab === 'item'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              单项 ({runningItems.length})
            </button>
          </div>

          <div className="relative w-52">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="搜索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 bg-black/40 border border-white/10 rounded-xl pl-8 pr-7 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* 主列表内容区 */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
          {runningItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center mb-3">
                <CheckCircle2 className="w-6 h-6 text-slate-500" />
              </div>
              <p className="text-sm font-medium text-slate-300">
                暂无运行中项目
              </p>
            </div>
          ) : (
            <>
              {/* 1. 运行中的组合 */}
              {showCombos && filteredCombos.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                    <Layers className="w-3.5 h-3.5 text-rose-400" />
                    <span>组合 ({filteredCombos.length})</span>
                  </div>
                  <div className="space-y-2">
                    {filteredCombos.map(
                      ({
                        combo,
                        subItems,
                        detectableCount,
                        runningCount,
                        isAllRunning,
                      }) => {
                        const isKilling = !!terminatingItemIds[combo.id];
                        return (
                          <div
                            key={combo.id}
                            className="p-3 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all flex items-center justify-between gap-3"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span
                                  className={`w-2 h-2 rounded-full shrink-0 ${
                                    isAllRunning
                                      ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                                      : 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]'
                                  }`}
                                />
                                <span className="text-xs font-semibold text-white truncate">
                                  {combo.name}
                                </span>
                                <span
                                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md border ${
                                    isAllRunning
                                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                      : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                                  }`}
                                >
                                  {runningCount}/{detectableCount}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {subItems.map((sub) => {
                                  const subSt = processStatusMap[sub.id];
                                  const subRun = !!subSt?.is_running;
                                  return (
                                    <span
                                      key={sub.id}
                                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] border ${
                                        subRun
                                          ? 'bg-emerald-500/10 text-emerald-200 border-emerald-500/25'
                                          : 'bg-white/[0.02] text-slate-500 border-white/5'
                                      }`}
                                    >
                                      <span
                                        className={`w-1.5 h-1.5 rounded-full ${
                                          subRun ? 'bg-emerald-400' : 'bg-slate-600'
                                        }`}
                                      />
                                      <span>{sub.name}</span>
                                    </span>
                                  );
                                })}
                              </div>
                            </div>

                            <button
                              type="button"
                              disabled={isKilling}
                              onClick={() => onTerminateCombo(combo)}
                              className="flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-medium bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 hover:text-white border border-rose-500/30 transition-all shrink-0 disabled:opacity-50"
                            >
                              {isKilling ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Power className="w-3.5 h-3.5" />
                              )}
                              <span>关闭组合</span>
                            </button>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              )}

              {/* 2. 运行中的单项（应用 + 文件夹） */}
              {showItems && filteredItems.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                    <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                    <span>单项 ({filteredItems.length})</span>
                  </div>
                  <div className="space-y-2">
                    {filteredItems.map((item) => {
                      const isKilling = !!terminatingItemIds[item.id];
                      const catName = categoryMap[item.categoryId] || '默认';

                      return (
                        <div
                          key={item.id}
                          className="p-3 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1" title={`${catName} · ${item.target}`}>
                            <div className="w-8 h-8 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                              {item.icon ? (
                                <img
                                  src={item.icon}
                                  alt={item.name}
                                  className="w-5 h-5 object-contain"
                                />
                              ) : item.type === 'folder' ? (
                                <FolderOpen className="w-4 h-4 text-amber-400" />
                              ) : (
                                <Cpu className="w-4 h-4 text-cyan-400" />
                              )}
                            </div>

                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] shrink-0" />
                              <span className="text-xs font-semibold text-white truncate">
                                {item.name}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            disabled={isKilling}
                            onClick={() => onTerminateItem(item)}
                            className="flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-medium bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 hover:text-white border border-rose-500/30 transition-all shrink-0 disabled:opacity-50"
                          >
                            {isKilling ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Power className="w-3.5 h-3.5" />
                            )}
                            <span>关闭</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {((showCombos && filteredCombos.length === 0) &&
                (showItems && filteredItems.length === 0)) && (
                <div className="py-10 text-center text-xs text-slate-500">
                  无匹配项
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
