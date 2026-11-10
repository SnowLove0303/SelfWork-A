import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar.tsx';
import { Header } from './components/Header.tsx';
import { SlotContainer } from './components/SlotContainer.tsx';
import { ModuleId, WorkbenchKernelStatus } from './types/workbench.ts';
import {
  AppearanceSettings,
  DEFAULT_APPEARANCE_SETTINGS,
} from './types/settings.ts';
import {
  loadAppearanceSettings,
  saveAppearanceSettings,
  SETTINGS_STORAGE_KEY,
} from './services/db.ts';

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
  // 视口感知初始态：若窗口宽度小于 1080px 则默认收起侧栏，释放主舞台视野
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(
    () => typeof window !== 'undefined' && window.innerWidth < 1080
  );
  const [kernelStatus, setKernelStatus] = useState<WorkbenchKernelStatus>({
    status: 'connecting',
    version: '...',
    osFamily: '...',
    arch: '...',
    latencyMs: 0,
    serverTime: 0,
  });

  // 监听窗口尺寸动态变化，跨越 1080px 临界阈值时自动平滑联动侧栏
  useEffect(() => {
    let prevWidth = window.innerWidth;
    const handleResize = () => {
      const curWidth = window.innerWidth;
      if (curWidth < 1080 && prevWidth >= 1080) {
        setSidebarCollapsed(true);
      } else if (curWidth >= 1200 && prevWidth < 1080) {
        setSidebarCollapsed(false);
      }
      prevWidth = curWidth;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 外观与背景设置：初始化尝试从本地同步缓存瞬时恢复
  const [appearanceSettings, setAppearanceSettings] =
    useState<AppearanceSettings>(() => {
      try {
        const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (saved) {
          return { ...DEFAULT_APPEARANCE_SETTINGS, ...JSON.parse(saved) };
        }
      } catch (_e) {
        // 本地读取异常则降级为默认值
      }
      return DEFAULT_APPEARANCE_SETTINGS;
    });

  // 挂载时通过 SQLite 数据库权威水合外观配置
  useEffect(() => {
    let isMounted = true;
    loadAppearanceSettings().then((loaded) => {
      if (isMounted) {
        setAppearanceSettings(loaded);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const updateAppearanceSettings = useCallback(
    (newSettings: AppearanceSettings) => {
      setAppearanceSettings(newSettings);
      saveAppearanceSettings(newSettings);
    },
    [],
  );

  const resetAppearanceSettings = useCallback(() => {
    setAppearanceSettings(DEFAULT_APPEARANCE_SETTINGS);
    saveAppearanceSettings(DEFAULT_APPEARANCE_SETTINGS);
  }, []);

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
    <div className="relative flex h-screen w-screen overflow-hidden bg-canvas-subtle text-fg-primary antialiased font-sans select-none min-w-0">
      {/* 当 scope === 'window' 且有自定义壁纸时，在根视口渲染底层全景壁纸与防眩遮罩 */}
      {appearanceSettings.scope === 'window' &&
      appearanceSettings.type !== 'fluid' &&
      appearanceSettings.imageUrl ? (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <img
            src={appearanceSettings.imageUrl}
            alt="全视口背景"
            className="h-full w-full object-cover"
          />
          <div
            style={{
              backgroundColor: `rgba(0, 0, 0, ${appearanceSettings.overlayDarkness})`,
            }}
            className="absolute inset-0 transition-colors duration-150"
          />
        </div>
      ) : (
        /* 底层动态流光发生器：在透明玻璃后方缓缓漂移折射 */
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute -top-[15%] left-[10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-sky-500/10 via-cyan-400/8 to-transparent blur-[100px] animate-fluid-a" />
          <div className="absolute -bottom-[20%] right-[15%] w-[600px] h-[600px] rounded-full bg-gradient-to-tl from-indigo-500/10 via-white/5 to-transparent blur-[120px] animate-fluid-b" />
          <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-sky-400/[0.03] to-transparent pointer-events-none" />
        </div>
      )}

      {/* 侧边功能栏 */}
      <Sidebar
        activeModule={activeModule}
        onSelectModule={setActiveModule}
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebar}
      />

      {/* 主内容工作区 */}
      <div className="relative z-10 flex flex-1 flex-col overflow-hidden min-w-0">
        {/* 顶部状态感知栏 */}
        <Header
          activeModule={activeModule}
          kernelStatus={kernelStatus}
          onRefreshKernel={refreshKernel}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={toggleSidebar}
        />

        {/* 模块插槽画布 */}
        <SlotContainer
          activeModule={activeModule}
          settings={appearanceSettings}
          onUpdateSettings={updateAppearanceSettings}
          onResetSettings={resetAppearanceSettings}
        />
      </div>
    </div>
  );
}
