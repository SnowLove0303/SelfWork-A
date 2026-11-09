import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SwitchboardPanel } from './launcher/SwitchboardPanel.tsx';
import { TelemetryPanel } from './launcher/TelemetryPanel.tsx';
import {
  ClusterConfig,
  ServiceItemConfig,
  TelemetryLogEntry,
  TelemetryLogLevel,
} from '../types/launcher.ts';
import { INITIAL_CLUSTERS, MONITORED_PORTS } from './launcher/launcherData.ts';

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
      message: '快速启动仪表盘与执行报文控制台已就绪，正在进行首轮端口探查...',
    },
  ]);
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const logCounterRef = useRef<number>(2);

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

  // 执行端口探查并同步服务状态
  const pollPorts = useCallback(async () => {
    setIsPolling(true);
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      const portMap = await invoke<Record<number, boolean>>('check_service_ports', {
        ports: MONITORED_PORTS,
      });

      setClusters((prevClusters) =>
        prevClusters.map((cluster) => ({
          ...cluster,
          items: cluster.items.map((item) => {
            // 如果该服务项配置了端口，以端口的实际打开状态为权威依据
            if (item.port && portMap[item.port] !== undefined) {
              const isOpen = portMap[item.port];
              return {
                ...item,
                status: isOpen ? 'running' : 'stopped',
              };
            }
            return item;
          }),
        }))
      );
    } catch (_err) {
      // 浏览器 Web 预览环境降级
    } finally {
      setIsPolling(false);
    }
  }, []);

  // 挂载定时轮询 (每 4 秒轮询一次)
  useEffect(() => {
    pollPorts();
    const interval = setInterval(pollPorts, 4000);
    return () => clearInterval(interval);
  }, [pollPorts]);

  // 调用 Rust IPC 执行启动器指令
  const dispatchCommand = useCallback(
    async (action: string, target: string, itemIds?: string[]) => {
      // 设置关联服务项为过渡状态
      if (itemIds && itemIds.length > 0) {
        const nextStatus = action === 'start' ? 'starting' : 'stopping';
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

        // 如果是无端口的普通应用，在启动/停止完成后显式置位
        if (itemIds && itemIds.length > 0) {
          const finalStatus = action === 'start' ? 'running' : 'stopped';
          setClusters((prev) =>
            prev.map((c) => ({
              ...c,
              items: c.items.map((i) => {
                if (itemIds.includes(i.id) && !i.port) {
                  return { ...i, status: finalStatus };
                }
                return i;
              }),
            }))
          );
        }

        // 即刻刷新端口以获取真实外部服务状态
        setTimeout(pollPorts, 600);
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
        setTimeout(pollPorts, 500);
      }
    },
    [appendLog, pollPorts]
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
    <div className="flex-1 flex flex-row h-full w-full overflow-hidden">
      {/* 左侧 55%：仪表盘开关阵列 */}
      <div className="w-[55%] h-full flex flex-col overflow-hidden">
        <SwitchboardPanel
          clusters={clusters}
          isPolling={isPolling}
          onRefreshPorts={pollPorts}
          onStartService={handleStartService}
          onStopService={handleStopService}
          onStartCluster={handleStartCluster}
          onStopCluster={handleStopCluster}
          onStartAll={handleStartAll}
          onStopAll={handleStopAll}
          onOpenUrl={handleOpenUrl}
        />
      </div>

      {/* 右侧 45%：执行报文控制台 */}
      <div className="w-[45%] h-full flex flex-col overflow-hidden">
        <TelemetryPanel logs={logs} onClearLogs={handleClearLogs} />
      </div>
    </div>
  );
};
