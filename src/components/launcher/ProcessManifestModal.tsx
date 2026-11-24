import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Activity,
  RefreshCw,
  Power,
  Layers,
  Cpu,
  Search,
  ChevronDown,
  ChevronRight,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Play,
} from 'lucide-react';
import { LauncherItem, LauncherCategory } from '../../types/launcher.ts';

export interface ProcessStatusEntry {
  id: string;
  is_running: boolean;
  pids: number[];
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
  onTerminateSinglePid: (item: LauncherItem, pid: number) => Promise<void>;
  onLaunchItem?: (item: LauncherItem) => Promise<boolean>;
}

type ManifestFilterTab = 'all' | 'combo' | 'app';

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
  onTerminateSinglePid,
  onLaunchItem,
}) => {
  const [filterTab, setFilterTab] = useState<ManifestFilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmKillAll, setConfirmKillAll] = useState(false);
  const [expandedAppIds, setExpandedAppIds] = useState<Record<string, boolean>>({});
  const [killingPidMap, setKillingPidMap] = useState<Record<number, boolean>>({});
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

  // 弹窗关闭时重置确认态
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

  // 全部运行中的单品应用
  const runningApps = useMemo(() => {
    return items
      .filter((it) => it.type === 'app' && processStatusMap[it.id]?.is_running)
      .sort((a, b) => {
        const countA = processStatusMap[a.id]?.instance_count || 0;
        const countB = processStatusMap[b.id]?.instance_count || 0;
        return countB - countA || a.name.localeCompare(b.name, 'zh-CN');
      });
  }, [items, processStatusMap]);

  // 全部运行中（含部分运行/全部运行）的组合套件
  const runningCombos = useMemo(() => {
    return items
      .filter((it) => it.type === 'bundle')
      .map((combo) => {
        const subIds = combo.bundleItemIds || [];
        const subItems = subIds.map((id) => itemMap[id]).filter(Boolean);
        const detectableSubs = subItems.filter((sub) => sub.type === 'app');
        const runningSubs = detectableSubs.filter(
          (sub) => processStatusMap[sub.id]?.is_running
        );
        const totalPids = runningSubs.reduce(
          (sum, sub) => sum + (processStatusMap[sub.id]?.pids.length || 0),
          0
        );
        return {
          combo,
          subItems,
          detectableCount: detectableSubs.length,
          runningCount: runningSubs.length,
          totalPids,
          isAllRunning:
            detectableSubs.length > 0 && runningSubs.length === detectableSubs.length,
        };
      })
      .filter((entry) => entry.runningCount > 0);
  }, [items, itemMap, processStatusMap]);

  // 全局去重后的活跃 PID 总数
  const totalUniquePids = useMemo(() => {
    const set = new Set<number>();
    for (const app of runningApps) {
      const st = processStatusMap[app.id];
      if (st?.is_running) {
        for (const pid of st.pids) {
          set.add(pid);
        }
      }
    }
    return set.size;
  }, [runningApps, processStatusMap]);

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

  const filteredApps = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return runningApps;
    return runningApps.filter(
      (app) =>
        app.name.toLowerCase().includes(q) ||
        app.target.toLowerCase().includes(q) ||
        (categoryMap[app.categoryId] || '').toLowerCase().includes(q)
    );
  }, [runningApps, searchQuery, categoryMap]);

  if (!isOpen) return null;

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    onRefresh();
    setTimeout(() => setIsRefreshing(false), 450);
  };

  const handleKillAllClick = async () => {
    if (totalUniquePids === 0 || isTerminatingAll) return;
    if (!confirmKillAll) {
      setConfirmKillAll(true);
      return;
    }
    setConfirmKillAll(false);
    await onTerminateAll();
  };

  const handleKillSinglePid = async (item: LauncherItem, pid: number) => {
    setKillingPidMap((prev) => ({ ...prev, [pid]: true }));
    try {
      await onTerminateSinglePid(item, pid);
    } finally {
      setKillingPidMap((prev) => ({ ...prev, [pid]: false }));
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedAppIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const showCombos = filterTab === 'all' || filterTab === 'combo';
  const showApps = filterTab === 'all' || filterTab === 'app';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl max-h-[82vh] flex flex-col bg-[#0d111a]/95 border border-white/15 rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.75)] overflow-hidden text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部标题与全局一键控制栏 */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Activity className="w-4.5 h-4.5 text-emerald-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-white tracking-tight">
                  全进程状态清单
                </h2>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-slate-300">
                  {runningApps.length} 应用 · {totalUniquePids} 进程
                </span>
                {runningCombos.length > 0 && (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300">
                    {runningCombos.length} 组合活跃
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                仅监控并管理已纳入快速启动的白名单进程，支持一键全清或定向关闭
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* 手动刷新 */}
            <button
              type="button"
              onClick={handleManualRefresh}
              title="立即刷新进程快照"
              className="flex items-center gap-1.5 h-8 px-2.5 rounded-xl text-xs font-medium bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/10 transition-all"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`}
              />
              <span>刷新</span>
            </button>

            {/* 一键全部关闭（带二次确认防误触） */}
            <button
              type="button"
              disabled={totalUniquePids === 0 || isTerminatingAll}
              onClick={handleKillAllClick}
              title="安全结束所有纳入快速启动项的正在运行进程"
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
                  ? '正在关闭...'
                  : confirmKillAll
                  ? `确认关闭全部 (${totalUniquePids})?`
                  : '一键全部关闭'}
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
              全部 ({runningCombos.length + runningApps.length})
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
              组合套件 ({runningCombos.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('app')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                filterTab === 'app'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              单品应用 ({runningApps.length})
            </button>
          </div>

          <div className="relative w-60">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="筛选运行中的应用或组合..."
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
          {totalUniquePids === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center mb-3">
                <CheckCircle2 className="w-6 h-6 text-slate-500" />
              </div>
              <p className="text-sm font-medium text-slate-300">
                当前暂无运行中的快速启动项进程
              </p>
              <p className="text-xs text-slate-500 mt-1">
                通过快速启动拉起本地应用或组合套件后，这里将实时呈现进程清单与关闭控制
              </p>
            </div>
          ) : (
            <>
              {/* 1. 运行中的组合套件区 */}
              {showCombos && filteredCombos.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                    <Layers className="w-3.5 h-3.5 text-rose-400" />
                    <span>运行中的组合套件 ({filteredCombos.length})</span>
                  </div>
                  <div className="space-y-2">
                    {filteredCombos.map(
                      ({
                        combo,
                        subItems,
                        detectableCount,
                        runningCount,
                        totalPids,
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
                                  {isAllRunning ? '全部运行' : '部分运行'} {runningCount}/
                                  {detectableCount}
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono">
                                  共 {totalPids} 个进程
                                </span>
                              </div>
                              {/* 子项胶囊 */}
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
                                      {subRun && (subSt?.instance_count || 0) > 1 && (
                                        <span className="text-[9px] font-mono opacity-80">
                                          ×{subSt.instance_count}
                                        </span>
                                      )}
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

              {/* 2. 运行中的单品应用区 */}
              {showApps && filteredApps.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                    <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                    <span>运行中的单品应用 ({filteredApps.length})</span>
                  </div>
                  <div className="space-y-2">
                    {filteredApps.map((app) => {
                      const st = processStatusMap[app.id];
                      const pids = st?.pids || [];
                      const isExpanded = !!expandedAppIds[app.id];
                      const isKilling = !!terminatingItemIds[app.id];
                      const catName = categoryMap[app.categoryId] || '默认';

                      return (
                        <div
                          key={app.id}
                          className="rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all overflow-hidden"
                        >
                          <div className="p-3 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <button
                                type="button"
                                onClick={() => toggleExpand(app.id)}
                                title="展开/收起独立 PID 明细"
                                className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
                              >
                                {isExpanded ? (
                                  <ChevronDown className="w-3.5 h-3.5" />
                                ) : (
                                  <ChevronRight className="w-3.5 h-3.5" />
                                )}
                              </button>

                              <div className="w-8 h-8 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                                {app.icon ? (
                                  <img
                                    src={app.icon}
                                    alt={app.name}
                                    className="w-5 h-5 object-contain"
                                  />
                                ) : (
                                  <Cpu className="w-4 h-4 text-cyan-400" />
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] shrink-0" />
                                  <span className="text-xs font-semibold text-white truncate">
                                    {app.name}
                                  </span>
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/[0.06] text-slate-400 border border-white/10">
                                    {catName}
                                  </span>
                                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                    {pids.length} 实例
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-500 font-mono truncate mt-0.5">
                                  {app.target}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {onLaunchItem && (
                                <button
                                  type="button"
                                  onClick={() => onLaunchItem(app)}
                                  title="再多开一个实例"
                                  className="flex items-center gap-1 h-8 px-2.5 rounded-xl text-xs font-medium bg-white/[0.04] hover:bg-cyan-500/15 text-slate-300 hover:text-cyan-300 border border-white/10 hover:border-cyan-500/30 transition-all"
                                >
                                  <Play className="w-3 h-3" />
                                  <span>多开</span>
                                </button>
                              )}
                              <button
                                type="button"
                                disabled={isKilling}
                                onClick={() => onTerminateItem(app)}
                                className="flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-medium bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 hover:text-white border border-rose-500/30 transition-all disabled:opacity-50"
                              >
                                {isKilling ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Power className="w-3.5 h-3.5" />
                                )}
                                <span>关闭</span>
                              </button>
                            </div>
                          </div>

                          {/* 展开独立 PID 精准控制区 */}
                          {isExpanded && (
                            <div className="px-4 py-2.5 bg-black/30 border-t border-white/[0.06] flex flex-wrap items-center gap-2">
                              <span className="text-[11px] text-slate-400 mr-1">
                                活跃 PID:
                              </span>
                              {pids.map((pid) => {
                                const isPidKilling = !!killingPidMap[pid];
                                return (
                                  <span
                                    key={pid}
                                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/[0.05] border border-white/10 text-[11px] font-mono text-slate-300"
                                  >
                                    <span>PID {pid}</span>
                                    <button
                                      type="button"
                                      disabled={isPidKilling}
                                      onClick={() => handleKillSinglePid(app, pid)}
                                      title={`仅结束 PID ${pid}`}
                                      className="w-4 h-4 rounded-full bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white flex items-center justify-center transition-colors disabled:opacity-40"
                                    >
                                      {isPidKilling ? (
                                        <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                      ) : (
                                        <X className="w-2.5 h-2.5" />
                                      )}
                                    </button>
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 搜索无匹配提示 */}
              {((showCombos && filteredCombos.length === 0) &&
                (showApps && filteredApps.length === 0)) && (
                <div className="py-10 text-center text-xs text-slate-500">
                  未找到匹配“{searchQuery}”的运行中应用或组合
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
