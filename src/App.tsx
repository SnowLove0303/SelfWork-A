import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar.tsx';
import { Header } from './components/Header.tsx';
import { SlotContainer } from './components/SlotContainer.tsx';
import { ModuleId, WorkbenchKernelStatus } from './types/workbench.ts';

// 动态兼容 Tauri 与 Web 预览环境
async function pingTauriKernel(): Promise<WorkbenchKernelStatus> {
  const t0 = performance.now();
  try {
    const { invoke } = await import('@tauri-apps/api/core');
    const res = await invoke<{
      status: string;
      version: string;
      server_time_ms: number;
      os_family: string;
      arch: string;
    }>('workbench_ping', { client_time_ms: Date.now() });

    const latency = Math.round(performance.now() - t0);
    return {
      status: 'ready',
      version: res.version,
      osFamily: res.os_family,
      arch: res.arch,
      latencyMs: latency,
      serverTime: res.server_time_ms,
    };
  } catch (_err) {
    const latency = Math.round(performance.now() - t0);
    return {
      status: 'fallback_web',
      version: '0.1.0-web',
      osFamily: 'Browser',
      arch: 'wasm/web',
      latencyMs: latency,
      serverTime: Date.now(),
    };
  }
}

export default function App(): React.JSX.Element {
  const [activeModule, setActiveModule] = useState<ModuleId>('launcher');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [kernelStatus, setKernelStatus] = useState<WorkbenchKernelStatus>({
    status: 'connecting',
    version: '...',
    osFamily: '...',
    arch: '...',
    latencyMs: 0,
    serverTime: 0,
  });

  const refreshKernel = useCallback(() => {
    pingTauriKernel().then(setKernelStatus);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  useEffect(() => {
    refreshKernel();
    const timer = setInterval(refreshKernel, 15000);
    return () => clearInterval(timer);
  }, [refreshKernel]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-canvas-subtle text-fg-primary antialiased font-sans select-none">
      {/* 侧边功能栏 */}
      <Sidebar
        activeModule={activeModule}
        onSelectModule={setActiveModule}
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebar}
      />

      {/* 主内容工作区 */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* 顶部状态感知栏 */}
        <Header
          activeModule={activeModule}
          kernelStatus={kernelStatus}
          onRefreshKernel={refreshKernel}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={toggleSidebar}
        />

        {/* 模块插槽画布 */}
        <SlotContainer activeModule={activeModule} />
      </div>
    </div>
  );
}
