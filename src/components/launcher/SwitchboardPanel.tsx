import React, { useState, useMemo } from 'react';
import {
  Briefcase,
  Rocket,
  Bot,
  MessageCircle,
  Shield,
  CheckSquare,
  Code2,
  Activity,
  Globe,
  Cpu,
  BookOpen,
  Flame,
  ShieldAlert,
  FileSpreadsheet,
  Server,
  Wifi,
  Network,
  Share2,
  MessageSquare,
  Terminal,
  Layers,
  Boxes,
  Monitor,
  Search,
  RefreshCw,
  Play,
  Square,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import { ClusterConfig, ServiceItemConfig } from '../../types/launcher.ts';

interface SwitchboardPanelProps {
  clusters: ClusterConfig[];
  isPolling: boolean;
  onRefreshPorts: () => void;
  onStartService: (item: ServiceItemConfig) => void;
  onStopService: (item: ServiceItemConfig) => void;
  onStartCluster: (cluster: ClusterConfig) => void;
  onStopCluster: (cluster: ClusterConfig) => void;
  onStartAll: () => void;
  onStopAll: () => void;
  onOpenUrl: (url: string) => void;
}

function renderClusterIcon(name: string, className = 'w-4 h-4'): React.JSX.Element {
  switch (name) {
    case 'Briefcase': return <Briefcase className={className} />;
    case 'Rocket': return <Rocket className={className} />;
    case 'Bot': return <Bot className={className} />;
    case 'MessageCircle': return <MessageCircle className={className} />;
    case 'Shield': return <Shield className={className} />;
    case 'CheckSquare': return <CheckSquare className={className} />;
    case 'Code2': return <Code2 className={className} />;
    case 'Activity': return <Activity className={className} />;
    case 'Globe': return <Globe className={className} />;
    case 'Cpu': return <Cpu className={className} />;
    case 'BookOpen': return <BookOpen className={className} />;
    case 'Flame': return <Flame className={className} />;
    case 'ShieldAlert': return <ShieldAlert className={className} />;
    case 'FileSpreadsheet': return <FileSpreadsheet className={className} />;
    case 'Server': return <Server className={className} />;
    case 'Wifi': return <Wifi className={className} />;
    case 'Network': return <Network className={className} />;
    case 'Share2': return <Share2 className={className} />;
    case 'MessageSquare': return <MessageSquare className={className} />;
    case 'Terminal': return <Terminal className={className} />;
    case 'Layers': return <Layers className={className} />;
    case 'Boxes': return <Boxes className={className} />;
    case 'Monitor': return <Monitor className={className} />;
    default: return <Activity className={className} />;
  }
}

export const SwitchboardPanel: React.FC<SwitchboardPanelProps> = ({
  clusters,
  isPolling,
  onRefreshPorts,
  onStartService,
  onStopService,
  onStartCluster,
  onStopCluster,
  onStartAll,
  onStopAll,
  onOpenUrl,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClusterFilter, setSelectedClusterFilter] = useState<string>('all');

  const filteredClusters = useMemo(() => {
    return clusters
      .filter((cluster) => {
        if (selectedClusterFilter !== 'all' && cluster.id !== selectedClusterFilter) {
          return false;
        }
        return true;
      })
      .map((cluster) => {
        if (!searchTerm.trim()) return cluster;
        const term = searchTerm.toLowerCase();
        const matchedItems = cluster.items.filter(
          (item) =>
            item.name.toLowerCase().includes(term) ||
            item.description.toLowerCase().includes(term) ||
            item.commandTarget.toLowerCase().includes(term) ||
            (item.port && item.port.toString().includes(term))
        );
        return {
          ...cluster,
          items: matchedItems,
        };
      })
      .filter((cluster) => cluster.items.length > 0);
  }, [clusters, selectedClusterFilter, searchTerm]);

  // 计算全局运行概况
  const totalServices = clusters.reduce((acc, c) => acc + c.items.length, 0);
  const runningServices = clusters.reduce(
    (acc, c) => acc + c.items.filter((i) => i.status === 'running').length,
    0
  );

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-black/20 select-none">
      {/* 顶部控制操作栏 */}
      <div className="shrink-0 p-3.5 border-b border-white/[0.08] flex flex-col gap-2.5 bg-canvas-default/30 backdrop-blur-md">
        <div className="flex items-center justify-between gap-3">
          {/* 搜索过滤框 */}
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-fg-muted pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="快速检索服务、目标或端口 (如 dsh, :9010, msds)..."
              className="w-full h-8 pl-8 pr-3 text-xs rounded-lg bg-black/40 border border-white/[0.08] text-fg-primary placeholder-fg-muted/60 focus:outline-none focus:border-brand-primary/60 transition-colors"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-fg-muted hover:text-fg-primary"
              >
                ✕
              </button>
            )}
          </div>

          {/* 状态统计与全局操作按钮 */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="px-2 py-1 rounded bg-white/[0.04] border border-white/[0.06] flex items-center gap-1.5 text-[11px] font-mono text-fg-secondary mr-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
              <span>
                {runningServices}/{totalServices} 运行中
              </span>
            </div>

            <button
              type="button"
              onClick={onRefreshPorts}
              disabled={isPolling}
              title="即刻执行全维系统真实巡检"
              className="h-8 px-2.5 rounded-lg border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-fg-secondary hover:text-fg-primary text-xs flex items-center gap-1.5 tactile-btn"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isPolling ? 'animate-spin text-brand-primary' : ''}`} />
              <span className="hidden sm:inline">探查</span>
            </button>

            <button
              type="button"
              onClick={onStartAll}
              title="一键启动全部平台服务"
              className="h-8 px-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 text-xs flex items-center gap-1.5 tactile-btn"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>全启动</span>
            </button>

            <button
              type="button"
              onClick={onStopAll}
              title="一键停止全部平台服务"
              className="h-8 px-2.5 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 text-xs flex items-center gap-1.5 tactile-btn"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>全停止</span>
            </button>
          </div>
        </div>

        {/* 集群快捷筛选标签 */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar text-xs">
          <span className="text-[11px] text-fg-muted shrink-0 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            分类:
          </span>
          {[
            { id: 'all', label: '全部集群' },
            { id: 'apps', label: '常用办公' },
            { id: 'ai-suite', label: 'AI 协同' },
            { id: 'web', label: 'Web 平台' },
            { id: 'lan', label: '局域网' },
            { id: 'feishu', label: '飞书桥接' },
            { id: 'wsl', label: 'WSL 专区' },
          ].map((tab) => {
            const active = selectedClusterFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedClusterFilter(tab.id)}
                className={`px-2 py-0.5 rounded text-[11px] whitespace-nowrap transition-colors ${
                  active
                    ? 'bg-brand-primary/20 text-brand-primary border border-brand-primary/40 font-medium'
                    : 'text-fg-secondary hover:text-fg-primary hover:bg-white/[0.05] border border-transparent'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 集群卡片阵列滚动容器 */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5">
        {filteredClusters.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-fg-muted gap-2 text-xs">
            <Search className="w-8 h-8 opacity-40" />
            <span>未匹配到任何相关服务或集群</span>
          </div>
        ) : (
          filteredClusters.map((cluster) => {
            const clusterRunningCount = cluster.items.filter((i) => i.status === 'running').length;
            const hasTransitioning = cluster.items.some(
              (i) => i.status === 'starting' || i.status === 'stopping'
            );

            return (
              <div
                key={cluster.id}
                className="glass-card rounded-xl border border-white/[0.08] bg-canvas-default/30 overflow-hidden shadow-lg"
              >
                {/* 集群卡片标题与一键总控 */}
                <div className="px-3 py-2 border-b border-white/[0.06] bg-white/[0.02] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-5 h-5 rounded bg-brand-primary/10 border border-brand-primary/20 text-brand-primary flex items-center justify-center shrink-0">
                      {renderClusterIcon(cluster.iconName, 'w-3 h-3')}
                    </div>
                    <span className="text-xs font-semibold text-fg-primary tracking-tight truncate">
                      {cluster.name}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-fg-secondary shrink-0">
                      {clusterRunningCount}/{cluster.items.length}
                    </span>
                  </div>

                  {/* 集群一键启动 / 停止 */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      disabled={hasTransitioning}
                      onClick={() => onStartCluster(cluster)}
                      title={`一键拉起 ${cluster.name}`}
                      className="h-6 px-2 rounded-md text-[11px] border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 tactile-btn flex items-center gap-1 disabled:opacity-50"
                    >
                      <Play className="w-2.5 h-2.5 fill-current" />
                      <span>启动</span>
                    </button>
                    <button
                      type="button"
                      disabled={hasTransitioning}
                      onClick={() => onStopCluster(cluster)}
                      title={`一键关闭 ${cluster.name}`}
                      className="h-6 px-2 rounded-md text-[11px] border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 tactile-btn flex items-center gap-1 disabled:opacity-50"
                    >
                      <Square className="w-2.5 h-2.5 fill-current" />
                      <span>停止</span>
                    </button>
                  </div>
                </div>

                {/* 集群下属服务条目 */}
                <div className="divide-y divide-white/[0.04]">
                  {cluster.items.map((item) => {
                    const isRunning = item.status === 'running';
                    const isTransitioning = item.status === 'starting' || item.status === 'stopping';

                    return (
                      <div
                        key={item.id}
                        title={item.description}
                        className="px-3 py-2 flex items-center justify-between gap-2.5 hover:bg-white/[0.02] transition-colors"
                      >
                        {/* 左侧：图标、名称、端口胶囊、PID 徽章 */}
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div
                            className={`w-6 h-6 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                              isRunning
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                : 'bg-white/[0.03] border-white/[0.06] text-fg-muted'
                            }`}
                          >
                            {renderClusterIcon(item.iconName || 'Activity', 'w-3 h-3')}
                          </div>

                          <span className="text-xs font-medium text-fg-primary truncate">
                            {item.name}
                          </span>

                          {/* 端口胶囊 & 外部跳转 */}
                          {item.port && (
                            <button
                              type="button"
                              onClick={() => item.url && onOpenUrl(item.url)}
                              title={isRunning ? `点击在浏览器打开 ${item.url}` : `服务未运行 (端口 :${item.port})`}
                              className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono border transition-all shrink-0 ${
                                isRunning
                                  ? 'bg-sky-500/15 border-sky-400/40 text-sky-300 hover:bg-sky-500/25 hover:border-sky-300 shadow-[0_0_8px_rgba(56,189,248,0.3)] cursor-pointer'
                                  : 'bg-white/[0.04] border-white/[0.08] text-fg-muted cursor-default'
                              }`}
                            >
                              <span>:{item.port}</span>
                              {isRunning && <ArrowUpRight className="w-2.5 h-2.5" />}
                            </button>
                          )}

                          {/* 真实存活 PID 徽章 */}
                          {isRunning && item.pids && item.pids.length > 0 && (
                            <span
                              title={`真实存活进程 PID: ${item.pids.join(', ')}`}
                              className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.2)] shrink-0"
                            >
                              PID: {item.pids[0]}{item.pids.length > 1 ? `+${item.pids.length - 1}` : ''}
                            </span>
                          )}
                        </div>

                        {/* 右侧：状态指示灯与启停控制开关 */}
                        <div className="flex items-center gap-2.5 shrink-0">
                          {/* 状态呼吸指示灯 */}
                          <div className="flex items-center gap-1.5 font-mono text-[11px]">
                            {item.status === 'running' && (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)] animate-pulse" />
                                <span className="text-emerald-400">运行中</span>
                              </>
                            )}
                            {item.status === 'stopped' && (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                                <span className="text-fg-muted">已停止</span>
                              </>
                            )}
                            {(item.status === 'starting' || item.status === 'stopping') && (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)] animate-ping" />
                                <span className="text-amber-400">
                                  {item.status === 'starting' ? '启动中' : '停止中'}
                                </span>
                              </>
                            )}
                            {item.status === 'error' && (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.9)]" />
                                <span className="text-rose-400">异常</span>
                              </>
                            )}
                          </div>

                          {/* 启停动作切换按钮 */}
                          <button
                            type="button"
                            disabled={isTransitioning}
                            onClick={() => {
                              if (isRunning) {
                                onStopService(item);
                              } else {
                                onStartService(item);
                              }
                            }}
                            title={isRunning ? `停止 ${item.name}` : `启动 ${item.name}`}
                            className={`h-6 px-2 rounded-md text-[11px] border flex items-center gap-1 transition-all tactile-btn disabled:opacity-50 ${
                              isRunning
                                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                            }`}
                          >
                            {isRunning ? (
                              <>
                                <Square className="w-2.5 h-2.5 fill-current" />
                                <span>停止</span>
                              </>
                            ) : (
                              <>
                                <Play className="w-2.5 h-2.5 fill-current" />
                                <span>启动</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
