import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SwitchboardPanel } from './launcher/SwitchboardPanel.tsx';
import { TelemetryPanel } from './launcher/TelemetryPanel.tsx';
import {
  ClusterConfig,
  ServiceItemConfig,
  ServiceStatus,
  SystemHealthSnapshot,
  TelemetryLogEntry,
  TelemetryLogLevel,
} from '../types/launcher.ts';
import {
  INITIAL_CLUSTERS,
  MONITORED_PORTS,
  MONITORED_PROCESS_NAMES,
} from './launcher/launcherData.ts';

// 格式化当前时间为 HH:mm:ss.SSS
function formatTimestamp(): string {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  const ms = String(now.getMilliseconds()).padStart(3, '0');
  return `${hh}:${mm}:${ss}.${ms}`;
}

export const LauncherDashboard: React.FC = () => {
  const [clusters, setClusters] = useState<ClusterConfig[]>(INITIAL_CLUSTERS);
  const [logs, setLogs] = useState<TelemetryLogEntry[]>([
    {
      id: 'init-1',
      timestamp: formatTimestamp(),
      target: 'system',
      level: 'info',
      message: '快速启动仪表盘与执行报文控制台已就绪，正在进行首轮全维真实巡检...',
    },
  ]);
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const logCounterRef = useRef<number>(2);
  const isInitialProbeRef = useRef<boolean>(true);

  // 追加结构化报文
  const appendLog = useCallback((target: string, level: TelemetryLogLevel, message: string) => {
    const entry: TelemetryLogEntry = {
      id: `log-${Date.now()}-${logCounterRef.current++}`,
      timestamp: formatTimestamp(),
      target,
      level,
      message,
    };
    setLogs((prev) => [...prev, entry]);
  }, []);

  // 执行全维系统真实巡检并同步服务状态 (包含 Windows Toolhelp 进程扫描与 TCP 端口探测)
  const pollHealth = useCallback(
    async (isManual = false) => {
      setIsPolling(true);
      if (isManual) {
        appendLog('inspect', 'info', '正在执行全维系统真实巡检 (原生进程枚举 + 端口并发探测)...');
      }

      try {
        const { invoke } = await import('@tauri-apps/api/core');
        const snapshot = await invoke<SystemHealthSnapshot>('inspect_system_health', {
          payload: {
            ports: MONITORED_PORTS,
            process_names: MONITORED_PROCESS_NAMES,
          },
        });

        const externalChanges: Array<{ name: string; status: ServiceStatus }> = [];
        const activeItemsSummary: string[] = [];
        let totalMonitored = 0;
        let activeCount = 0;

        setClusters((prevClusters) =>
          prevClusters.map((cluster) => ({
            ...cluster,
            items: cluster.items.map((item) => {
              const hasProcessCheck = item.processNames && item.processNames.length > 0;
              const hasPortCheck = item.port !== undefined;

              if (!hasProcessCheck && !hasPortCheck) {
                return item;
              }

              totalMonitored++;

              // 收集匹配的所有真实 PID
              const matchedPids: number[] = [];
              if (hasProcessCheck && item.processNames) {
                for (const name of item.processNames) {
                  const pids = snapshot.processes[name.toLowerCase()];
                  if (pids && pids.length > 0) {
                    matchedPids.push(...pids);
                  }
                }
              }

              const isPortOpen = item.port ? Boolean(snapshot.ports[item.port]) : false;
              // 判定双重见证存活
              const isActive = (hasProcessCheck && matchedPids.length > 0) || (hasPortCheck && isPortOpen);

              // 处于正在启动/停止过渡期时，若尚未检测到活跃则保持过渡状态，避免开关抖动
              let nextStatus: ServiceStatus;
              if (isActive) {
                nextStatus = 'running';
              } else if (item.status === 'starting' || item.status === 'stopping') {
                nextStatus = item.status;
              } else {
                nextStatus = 'stopped';
              }

              if (nextStatus === 'running') {
                activeCount++;
                const details: string[] = [];
                if (matchedPids.length > 0) {
                  details.push(`PID: ${matchedPids.join(',')}`);
                }
                if (item.port && isPortOpen) {
                  details.push(`:${item.port}`);
                }
                activeItemsSummary.push(
                  `${item.name}${details.length > 0 ? ` (${details.join(', ')})` : ''}`
                );
              }

              // 检测外部运行状态变动（非初次加载且非手动巡检，且旧新状态均为稳定态）
              if (
                !isInitialProbeRef.current &&
                !isManual &&
                item.status !== nextStatus &&
                (item.status === 'running' || item.status === 'stopped') &&
                (nextStatus === 'running' || nextStatus === 'stopped')
              ) {
                externalChanges.push({ name: item.name, status: nextStatus });
              }

              return {
                ...item,
                status: nextStatus,
                pids: matchedPids,
              };
            }),
          }))
        );

        isInitialProbeRef.current = false;

        if (isManual) {
          appendLog(
            'inspect',
            'success',
            `巡检完成：探测到 ${activeCount}/${totalMonitored} 个服务活跃存活` +
              (activeItemsSummary.length > 0
                ? `\n存活明细: ${activeItemsSummary.join(' | ')}`
                : ' (未探测到活跃外部服务)')
          );
        } else if (externalChanges.length > 0) {
          const lines = externalChanges
            .map((c) => `• 服务 [${c.name}] 外部状态变更为: ${c.status === 'running' ? '运行中 (PID探测)' : '已停止'}`)
            .join('\n');
          appendLog('daemon', 'info', `感知到外部服务状态自主变更:\n${lines}`);
        }
      } catch (err: unknown) {
        if (isManual) {
          const errMsg = typeof err === 'string' ? err : String(err);
          appendLog('inspect', 'warn', `真实巡检探测受阻 (Web环境降级或端口拒绝): ${errMsg}`);
        }
      } finally {
        setIsPolling(false);
      }
    },
    [appendLog]
  );

  // 挂载初次真实巡检 + 每 3 秒后台低开销静默感知
  useEffect(() => {
    pollHealth(false);
    const timer = setInterval(() => {
      pollHealth(false);
    }, 3000);
    return () => clearInterval(timer);
  }, [pollHealth]);

  // 调用后端执行启动/停止操作
  const dispatchCommand = useCallback(
    async (
      action: 'start' | 'stop',
      target: string,
      itemIds?: string[]
    ) => {
      if (itemIds && itemIds.length > 0) {
        const nextStatus: ServiceStatus = action === 'start' ? 'starting' : 'stopping';
        setClusters((prev) =>
          prev.map((c) => ({
            ...c,
            items: c.items.map((i) =>
              itemIds.includes(i.id) ? { ...i, status: nextStatus } : i
            ),
          }))
        );
      }

      appendLog(
        target,
        'info',
        `正在下发启动器指令: Workflow-Launcher.ps1 ${action} ${target}...`
      );

      const t0 = performance.now();
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        const output = await invoke<string>('run_launcher_command', {
          action,
          target,
        });

        const duration = Math.round(performance.now() - t0);
        appendLog(
          target,
          'success',
          `指令执行完成 (耗时 ${duration}ms):\n${output}`
        );

        // 如果是无端口且无进程关联的纯脚本应用，在启动/停止完成后显式置位
        if (itemIds && itemIds.length > 0) {
          const finalStatus = action === 'start' ? 'running' : 'stopped';
          setClusters((prev) =>
            prev.map((c) => ({
              ...c,
              items: c.items.map((i) => {
                if (
                  itemIds.includes(i.id) &&
                  !i.port &&
                  (!i.processNames || i.processNames.length === 0)
                ) {
                  return { ...i, status: finalStatus };
                }
                return i;
              }),
            }))
          );
        }

        // 即刻刷新以获取真实外部服务与进程状态
        setTimeout(() => pollHealth(false), 600);
      } catch (err: unknown) {
        const duration = Math.round(performance.now() - t0);
        const errMsg = typeof err === 'string' ? err : String(err);
        appendLog(
          target,
          'error',
          `指令执行失败 (耗时 ${duration}ms):\n${errMsg}`
        );

        // 回滚过渡状态
        if (itemIds && itemIds.length > 0) {
          setClusters((prev) =>
            prev.map((c) => ({
              ...c,
              items: c.items.map((i) =>
                itemIds.includes(i.id) ? { ...i, status: 'error' } : i
              ),
            }))
          );
        }
        setTimeout(() => pollHealth(false), 500);
      }
    },
    [appendLog, pollHealth]
  );

  // 单个服务项启停
  const handleStartService = useCallback(
    (item: ServiceItemConfig) => {
      dispatchCommand('start', item.commandTarget, [item.id]);
    },
    [dispatchCommand]
  );

  const handleStopService = useCallback(
    (item: ServiceItemConfig) => {
      dispatchCommand('stop', item.commandTarget, [item.id]);
    },
    [dispatchCommand]
  );

  // 集群一键启停
  const handleStartCluster = useCallback(
    (cluster: ClusterConfig) => {
      const allItemIds = cluster.items.map((i) => i.id);
      dispatchCommand('start', cluster.batchTarget, allItemIds);
    },
    [dispatchCommand]
  );

  const handleStopCluster = useCallback(
    (cluster: ClusterConfig) => {
      const allItemIds = cluster.items.map((i) => i.id);
      dispatchCommand('stop', cluster.batchTarget, allItemIds);
    },
    [dispatchCommand]
  );

  // 全局启停
  const handleStartAll = useCallback(() => {
    const allItemIds = clusters.flatMap((c) => c.items.map((i) => i.id));
    dispatchCommand('start', 'all', allItemIds);
  }, [clusters, dispatchCommand]);

  const handleStopAll = useCallback(() => {
    const allItemIds = clusters.flatMap((c) => c.items.map((i) => i.id));
    dispatchCommand('stop', 'all', allItemIds);
  }, [clusters, dispatchCommand]);

  // 打开外部浏览器 URL
  const handleOpenUrl = useCallback(
    async (url: string) => {
      appendLog('browser', 'info', `正在请求在系统默认浏览器中打开: ${url}`);
      try {
        const { open } = await import('@tauri-apps/plugin-shell');
        await open(url);
      } catch (_e) {
        window.open(url, '_blank');
      }
    },
    [appendLog]
  );

  // 清空报文
  const handleClearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  return (
    <div className="flex-1 flex flex-row h-full w-full overflow-hidden min-w-0">
      {/* 左侧 55%：仪表盘开关阵列 (设置最小安全宽度 380px，支持弹性自适应伸缩) */}
      <div className="w-[55%] min-w-[380px] flex-1 h-full flex flex-col overflow-hidden">
        <SwitchboardPanel
          clusters={clusters}
          isPolling={isPolling}
          onRefreshPorts={() => pollHealth(true)}
          onStartService={handleStartService}
          onStopService={handleStopService}
          onStartCluster={handleStartCluster}
          onStopCluster={handleStopCluster}
          onStartAll={handleStartAll}
          onStopAll={handleStopAll}
          onOpenUrl={handleOpenUrl}
        />
      </div>

      {/* 右侧 45%：执行报文控制台 (设置最小安全宽度 300px) */}
      <div className="w-[45%] min-w-[300px] h-full flex flex-col overflow-hidden">
        <TelemetryPanel logs={logs} onClearLogs={handleClearLogs} />
      </div>
    </div>
  );
};
