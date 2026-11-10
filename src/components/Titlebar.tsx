import React, { useState, useEffect, useCallback } from 'react';
import { ModuleId } from '../types/workbench.ts';
import { MODULES } from './Sidebar.tsx';

interface TitlebarProps {
  activeModule: ModuleId;
}

export const Titlebar: React.FC<TitlebarProps> = ({ activeModule }) => {
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
      {/* 左侧：纯净品牌文字与模块信息，自然左对齐 */}
      <div className="flex items-center gap-1.5 min-w-0 shrink-0 pointer-events-none">
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
        <span className="text-[10px] text-[#8FA3BF]/60 font-mono hidden md:inline truncate max-w-[200px] select-none">
          {currentMod.shortDesc}
        </span>
      </div>

      {/* 中间：全域自适应硬件级原生拖拽抓手区域 (data-tauri-drag-region 驱动) */}
      <div data-tauri-drag-region className="flex-1 h-full min-w-[20px] cursor-default" />

      {/* 右侧：纯粹极简细线条原生窗口控制按钮组 */}
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
  );
};
