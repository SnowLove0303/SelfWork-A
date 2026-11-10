import React, { useState, useEffect } from 'react';
import { PanelLeft } from 'lucide-react';
import { ModuleId, WorkbenchKernelStatus } from '../types/workbench.ts';
import { MODULES } from './Sidebar.tsx';

interface HeaderProps {
  activeModule: ModuleId;
  kernelStatus: WorkbenchKernelStatus;
  onRefreshKernel: () => void;
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  isMaximized?: boolean;
  onToggleMaximize?: (isMax: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeModule,
  kernelStatus,
  onRefreshKernel,
  sidebarCollapsed,
  onToggleSidebar,
  isMaximized: externalIsMaximized,
  onToggleMaximize,
}) => {
  const currentMod = MODULES.find((m) => m.id === activeModule) || MODULES[0];
  const [internalIsMaximized, setInternalIsMaximized] = useState<boolean>(false);

  const isMaximized = externalIsMaximized !== undefined ? externalIsMaximized : internalIsMaximized;

  // 初始与窗口 resize 时同步最大化物理状态
  useEffect(() => {
    let isMounted = true;
    const checkMaximized = async () => {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        const max = await invoke<boolean>('window_is_maximized');
        if (isMounted) {
          setInternalIsMaximized(max);
          onToggleMaximize?.(max);
        }
      } catch (_e) {
        // Web 预览环境静默降级
      }
    };

    checkMaximized();
    window.addEventListener('resize', checkMaximized);
    return () => {
      isMounted = false;
      window.removeEventListener('resize', checkMaximized);
    };
  }, [onToggleMaximize]);

  // 窗口物理拖拽触发函数（Channel A: JS Window API + Channel B: Rust IPC 备用通道）
  const handleStartDragging = async (e: React.MouseEvent) => {
    // 仅响应鼠标主键（左键）按下
    if (e.button !== 0) return;

    // 严密防御：若用户点击了按钮、链接、输入框或其子元素，绝对不触发拖动，保障原有点击交互 100% 独立生效
    const target = e.target as HTMLElement | null;
    if (
      target?.closest('button') ||
      target?.closest('a') ||
      target?.closest('input') ||
      target?.closest('[data-no-drag="true"]')
    ) {
      return;
    }

    // 双击场景让 onDoubleClick 处理最大化/还原，避免和拖拽冲突
    if (e.detail > 1) {
      return;
    }

    try {
      // Channel A: 官方 getCurrentWindow().startDragging()
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      await getCurrentWindow().startDragging();
    } catch (_err) {
      try {
        // Channel B: Rust 备用直通指令
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('window_start_dragging');
      } catch (_e) {
        // Web 预览环境静默降级
      }
    }
  };

  // 窗口原生操作封装
  const handleMinimize = async () => {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('window_minimize');
    } catch (_e) {
      console.log('[Web Fallback] Window minimize requested');
    }
  };

  const handleToggleMaximize = async () => {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      const newMax = await invoke<boolean>('window_toggle_maximize');
      setInternalIsMaximized(newMax);
      onToggleMaximize?.(newMax);
    } catch (_e) {
      console.log('[Web Fallback] Window toggle maximize requested');
    }
  };

  const handleClose = async () => {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('window_close');
    } catch (_e) {
      console.log('[Web Fallback] Window close requested');
    }
  };

  return (
    <header
      data-tauri-drag-region
      onMouseDown={handleStartDragging}
      onDoubleClick={handleToggleMaximize}
      className="flex h-11 w-full items-center justify-between bg-canvas-default/35 backdrop-blur-xl border-b border-border-default px-3 select-none box-border cursor-default"
    >
      {/* 左侧：折叠展开按钮 + 当前模块标题（带拖拽防误触隔离） */}
      <div className="flex items-center gap-2 min-w-0 shrink-0">
        {sidebarCollapsed && onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            title="展开侧边栏"
            className="flex h-6 w-6 items-center justify-center rounded border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/[0.16] text-fg-muted hover:text-fg-primary tactile-btn transition-colors"
          >
            <PanelLeft className="h-3.5 w-3.5" />
          </button>
        )}
        <div className="flex items-center gap-1.5 min-w-0 pointer-events-none">
          <h1 className="text-xs font-semibold text-fg-primary tracking-tight font-mono whitespace-nowrap">
            {currentMod.name}
          </h1>
          <span className="text-[10px] text-fg-muted/40 font-mono hidden sm:inline select-none">
            ·
          </span>
          <span className="text-[11px] text-fg-muted/60 font-mono hidden sm:inline truncate max-w-[140px] select-none">
            {currentMod.shortDesc}
          </span>
        </div>
      </div>

      {/* 中间自适应原生拖拽抓手区域：支持长按拖拽与双击最大化/还原 */}
      <div
        data-tauri-drag-region
        className="flex-1 h-full cursor-default"
      />

      {/* 右侧：状态探测胶囊 + 细线条原生窗口控制按钮组 */}
      <div className="flex items-center gap-2 shrink-0">
        {/* 状态探测胶囊 */}
        <button
          type="button"
          onClick={onRefreshKernel}
          title="点击重新探测连接状态"
          className="flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/[0.16] px-2.5 py-0.5 text-[11px] font-mono text-fg-muted hover:text-fg-secondary tactile-pill transition-colors shrink-0"
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

        {/* 微弱垂直分割线 */}
        <div className="h-3.5 w-px bg-white/[0.08] shrink-0 mx-0.5" />

        {/* 窗口原生控制三按键组 (严格隔离拖拽属性) */}
        <div className="flex items-center gap-0.5 shrink-0" data-no-drag="true">
          {/* 最小化按钮 */}
          <button
            type="button"
            onClick={handleMinimize}
            title="最小化"
            className="flex h-7 w-8 items-center justify-center rounded text-fg-muted hover:text-fg-primary hover:bg-white/[0.08] active:bg-white/[0.12] transition-colors tactile-btn"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 12 12" fill="none">
              <path d="M2 6h8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </button>

          {/* 最大化 / 还原按钮 */}
          <button
            type="button"
            onClick={handleToggleMaximize}
            title={isMaximized ? '向下还原' : '最大化'}
            className="flex h-7 w-8 items-center justify-center rounded text-fg-muted hover:text-fg-primary hover:bg-white/[0.08] active:bg-white/[0.12] transition-colors tactile-btn"
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

          {/* 关闭按钮 */}
          <button
            type="button"
            onClick={handleClose}
            title="关闭"
            className="flex h-7 w-8 items-center justify-center rounded text-fg-muted hover:text-rose-300 hover:bg-rose-500/25 active:bg-rose-500/35 transition-colors tactile-btn"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 12 12" fill="none">
              <path d="M2.5 2.5l7 7M9.5 2.5l-7 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};
