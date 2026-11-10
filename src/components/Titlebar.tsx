import React, { useState, useEffect, useCallback } from 'react';
import { PanelLeft } from 'lucide-react';
import { ModuleId, WorkbenchKernelStatus } from '../types/workbench.ts';
import { MODULES } from './Sidebar.tsx';

interface TitlebarProps {
  activeModule: ModuleId;
  kernelStatus: WorkbenchKernelStatus;
  onRefreshKernel: () => void;
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export const Titlebar: React.FC<TitlebarProps> = ({
  activeModule,
  kernelStatus,
  onRefreshKernel,
  sidebarCollapsed,
  onToggleSidebar,
}) => {
  const currentMod = MODULES.find((m) => m.id === activeModule) || MODULES[0];
  const [isMaximized, setIsMaximized] = useState<boolean>(false);

  // 初始化与窗口尺寸变更时同步最大化物理状态
  useEffect(() => {
    let isMounted = true;
    const syncMaximizedState = async () => {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        const max = await invoke<boolean>('window_is_maximized');
        if (isMounted) setIsMaximized(max);
      } catch (_e) {
        // Web 预览环境静默降级
      }
    };

    syncMaximizedState();
    window.addEventListener('resize', syncMaximizedState);
    return () => {
      isMounted = false;
      window.removeEventListener('resize', syncMaximizedState);
    };
  }, []);

  // 窗口操作封装 (优先调用 Rust 微内核指令，降级调用 Tauri API)
  const handleMinimize = useCallback(async () => {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('window_minimize');
    } catch (_e) {
      try {
        const { getCurrentWindow } = await import('@tauri-apps/api/window');
        await getCurrentWindow().minimize();
      } catch (_err) {
        console.log('[Web Fallback] Window minimize requested');
      }
    }
  }, []);

  const handleToggleMaximize = useCallback(async () => {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      const newMax = await invoke<boolean>('window_toggle_maximize');
      setIsMaximized(newMax);
    } catch (_e) {
      try {
        const { getCurrentWindow } = await import('@tauri-apps/api/window');
        await getCurrentWindow().toggleMaximize();
        const max = await getCurrentWindow().isMaximized();
        setIsMaximized(max);
      } catch (_err) {
        console.log('[Web Fallback] Window toggle maximize requested');
      }
    }
  }, []);

  const handleClose = useCallback(async () => {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('window_close');
    } catch (_e) {
      try {
        const { getCurrentWindow } = await import('@tauri-apps/api/window');
        await getCurrentWindow().close();
      } catch (_err) {
        console.log('[Web Fallback] Window close requested');
      }
    }
  }, []);

  return (
    <div
      data-tauri-drag-region
      onDoubleClick={handleToggleMaximize}
      className="flex h-[38px] w-full items-center justify-between bg-[#0D1422] border-b border-[rgba(80,140,200,0.15)] px-3 select-none box-border cursor-default z-50 shrink-0"
    >
      {/* 左侧：无占位小图标，纯净品牌文字与模块信息重构对齐 */}
      <div className="flex items-center gap-2 min-w-0 shrink-0 pointer-events-none">
        {onToggleSidebar && (
          <button
            type="button"
            data-tauri-no-drag="true"
            onClick={onToggleSidebar}
            title={sidebarCollapsed ? '展开侧边栏' : '收起侧边栏'}
            className="pointer-events-auto flex h-6 w-6 items-center justify-center rounded border border-[rgba(80,140,200,0.18)] bg-[rgba(80,140,200,0.06)] hover:bg-[rgba(80,140,200,0.14)] hover:border-[rgba(80,140,200,0.28)] text-[#8FA3BF] hover:text-[#E6EDF7] tactile-btn transition-colors"
          >
            <PanelLeft className="h-3.5 w-3.5" />
          </button>
        )}

        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-xs font-semibold text-[#E6EDF7] font-mono tracking-tight whitespace-nowrap">
            SW工作台
          </span>
          <span className="text-[10px] text-[#8FA3BF]/50 font-mono select-none">
            /
          </span>
          <span className="text-[11px] font-medium text-[#8FA3BF] font-mono whitespace-nowrap">
            {currentMod.name}
          </span>
          <span className="text-[10px] text-[#8FA3BF]/40 font-mono hidden md:inline select-none">
            ·
          </span>
          <span className="text-[10px] text-[#8FA3BF]/60 font-mono hidden md:inline truncate max-w-[180px] select-none">
            {currentMod.shortDesc}
          </span>
        </div>
      </div>

      {/* 中间：自适应硬件级原生拖拽抓手区域 (data-tauri-drag-region 驱动) */}
      <div data-tauri-drag-region className="flex-1 h-full min-w-[20px] cursor-default" />

      {/* 右侧：状态探测胶囊 + 细线条原生窗口控制按钮组 */}
      <div className="flex items-center gap-2 shrink-0">
        {/* 状态探测胶囊 */}
        <button
          type="button"
          data-tauri-no-drag="true"
          onClick={onRefreshKernel}
          title="点击重新探测连接状态"
          className="flex items-center gap-1.5 rounded-full border border-[rgba(80,140,200,0.18)] bg-[rgba(80,140,200,0.06)] hover:bg-[rgba(80,140,200,0.14)] hover:border-[rgba(80,140,200,0.28)] px-2.5 py-0.5 text-[10.5px] font-mono text-[#8FA3BF] hover:text-[#E6EDF7] tactile-pill transition-colors shrink-0"
        >
          <span
            className={`h-1.5 w-1.5 rounded-full transition-colors ${
              kernelStatus.status === 'ready'
                ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                : kernelStatus.status === 'fallback_web'
                ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]'
                : 'bg-rose-400 shadow-[0_0_8px_rgba(248,113,113,0.8)]'
            }`}
          />
          <span>{kernelStatus.status === 'ready' ? 'Desktop' : 'Web Preview'}</span>
        </button>

        {/* 微弱冷色垂直分割线 */}
        <div className="h-3.5 w-px bg-[rgba(80,140,200,0.2)] shrink-0 mx-0.5" />

        {/* 窗口控制按钮组 */}
        <div className="flex items-center gap-0.5 shrink-0" data-tauri-no-drag="true">
          {/* 最小化 */}
          <button
            type="button"
            data-tauri-no-drag="true"
            onClick={handleMinimize}
            title="最小化"
            className="flex h-6 w-7 items-center justify-center rounded text-[#8FA3BF] hover:text-[#E6EDF7] hover:bg-[rgba(80,140,200,0.12)] active:bg-[rgba(80,140,200,0.2)] transition-colors tactile-btn"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 12 12" fill="none">
              <path d="M2 6h8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </button>

          {/* 最大化 / 还原 */}
          <button
            type="button"
            data-tauri-no-drag="true"
            onClick={handleToggleMaximize}
            title={isMaximized ? '向下还原' : '最大化'}
            className="flex h-6 w-7 items-center justify-center rounded text-[#8FA3BF] hover:text-[#E6EDF7] hover:bg-[rgba(80,140,200,0.12)] active:bg-[rgba(80,140,200,0.2)] transition-colors tactile-btn"
          >
            {isMaximized ? (
              <svg className="w-3.5 h-3.5" viewBox="0 0 12 12" fill="none">
                <rect x="4" y="2" width="6" height="6" rx="0.5" stroke="currentColor" strokeWidth="1.1" />
                <path d="M2 4.5v5a0.5 0.5 0 0 0 0.5 0.5h5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" viewBox="0 0 12 12" fill="none">
                <rect x="2" y="2" width="8" height="8" rx="0.5" stroke="currentColor" strokeWidth="1.2" />
              </svg>
            )}
          </button>

          {/* 关闭 (克制暗调，Hover 柔和暗红) */}
          <button
            type="button"
            data-tauri-no-drag="true"
            onClick={handleClose}
            title="关闭"
            className="flex h-6 w-7 items-center justify-center rounded text-[#8FA3BF] hover:text-rose-300 hover:bg-rose-500/20 active:bg-rose-500/30 transition-colors tactile-btn"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 12 12" fill="none">
              <path d="M2.5 2.5l7 7M9.5 2.5l-7 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
