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
    <header className="flex h-12 w-full items-center justify-between border-b border-border-subtle bg-canvas-default px-5 select-none">
      <div className="flex items-center gap-2">
        <h1 className="text-sm font-medium text-fg-primary">
          {currentMod.name}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onRefreshKernel}
          className="flex items-center gap-1.5 rounded px-2 py-1 text-[11px] font-mono text-fg-muted hover:text-fg-secondary hover:bg-canvas-elevated transition-colors"
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              kernelStatus.status === 'ready'
                ? 'bg-emerald-500'
                : kernelStatus.status === 'fallback_web'
                ? 'bg-amber-500'
                : 'bg-rose-500'
            }`}
          />
          <span>{kernelStatus.status === 'ready' ? 'Desktop' : 'Web Preview'}</span>
        </button>
      </div>
    </header>
  );
};
