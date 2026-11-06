import React from 'react';
import { PanelLeft } from 'lucide-react';
import { ModuleId, WorkbenchKernelStatus } from '../types/workbench.ts';
import { MODULES } from './Sidebar.tsx';

interface HeaderProps {
  activeModule: ModuleId;
  kernelStatus: WorkbenchKernelStatus;
  onRefreshKernel: () => void;
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeModule,
  kernelStatus,
  onRefreshKernel,
  sidebarCollapsed,
  onToggleSidebar,
}) => {
  const currentMod = MODULES.find((m) => m.id === activeModule) || MODULES[0];

  return (
    <header className="flex h-11 w-full items-center justify-between bg-canvas-default/35 backdrop-blur-xl border-b border-border-default px-4 select-none box-border">
      <div className="flex items-center gap-2.5">
        {/* 当侧栏折叠时，顶栏左侧显式提供快捷展开按钮：毛玻璃方块与微触觉光效 */}
        {sidebarCollapsed && onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            title="展开侧边栏"
            className="flex h-6 w-6 items-center justify-center rounded border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/[0.16] text-fg-muted hover:text-fg-primary tactile-btn transition-colors mr-1"
          >
            <PanelLeft className="h-3.5 w-3.5" />
          </button>
        )}
        <h1 className="text-xs font-semibold text-fg-primary tracking-tight">
          {currentMod.name}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {/* 状态探测胶囊：微触觉高透毛玻璃胶囊，点击零抖动 */}
        <button
          type="button"
          onClick={onRefreshKernel}
          title="点击重新探测连接状态"
          className="flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/[0.16] px-2.5 py-0.5 text-[11px] font-mono text-fg-muted hover:text-fg-secondary tactile-pill transition-colors"
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
      </div>
    </header>
  );
};
