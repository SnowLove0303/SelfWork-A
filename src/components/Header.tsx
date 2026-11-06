import React from 'react';
import { ModuleId, WorkbenchKernelStatus } from '../types/workbench.ts';
import { MODULES } from './Sidebar.tsx';

interface HeaderProps {
  activeModule: ModuleId;
  kernelStatus: WorkbenchKernelStatus;
  onRefreshKernel: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeModule,
  kernelStatus,
  onRefreshKernel,
}) => {
  const currentMod = MODULES.find((m) => m.id === activeModule) || MODULES[0];

  return (
    <header className="flex h-11 w-full items-center justify-between bg-canvas-default chiseled-border-b px-4 select-none">
      <div className="flex items-center gap-2">
        <h1 className="text-xs font-semibold text-fg-primary tracking-tight">
          {currentMod.name}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onRefreshKernel}
          title="点击重新探测连接状态"
          className="flex items-center gap-1.5 rounded-md border border-white/[0.06] bg-canvas-elevated/80 px-2 py-0.5 text-[11px] font-mono text-fg-muted shadow-[inset_0_1px_0_rgba(255,255,255,0.08),_0_1px_2px_rgba(0,0,0,0.3)] hover:text-fg-secondary hover:border-white/[0.12] active:shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] transition-all"
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              kernelStatus.status === 'ready'
                ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]'
                : kernelStatus.status === 'fallback_web'
                ? 'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.8)]'
                : 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.8)]'
            }`}
          />
          <span>{kernelStatus.status === 'ready' ? 'Desktop' : 'Web Preview'}</span>
        </button>
      </div>
    </header>
  );
};
