import React from 'react';
import { Activity, ShieldCheck, Terminal } from 'lucide-react';
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
    <header className="flex h-14 w-full items-center justify-between border-b border-border-subtle bg-canvas-default px-5 select-none">
      {/* 左侧模块标题与定位 */}
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-semibold text-fg-primary tracking-tight">
          {currentMod.name}
        </h1>
        <span className="text-xs text-fg-muted font-mono">/</span>
        <span className="text-xs text-fg-secondary">
          {currentMod.shortDesc}
        </span>
      </div>

      {/* 右侧微内核指标与状态感知 */}
      <div className="flex items-center gap-4">
        {/* IPC 心跳状态 */}
        <button
          type="button"
          onClick={onRefreshKernel}
          title="点击重新测试 IPC 心跳"
          className="flex items-center gap-2 rounded-md bg-canvas-elevated px-2.5 py-1 text-xs font-mono transition-colors hover:bg-canvas-elevated/80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-primary"
        >
          <span
            className={`h-2 w-2 rounded-full ${
              kernelStatus.status === 'ready'
                ? 'bg-emerald-500 animate-pulse'
                : kernelStatus.status === 'fallback_web'
                ? 'bg-amber-500'
                : 'bg-rose-500'
            }`}
          />
          <span className="text-fg-secondary">
            {kernelStatus.status === 'ready'
              ? `IPC: ${kernelStatus.latencyMs}ms`
              : kernelStatus.status === 'fallback_web'
              ? 'Web Preview'
              : 'Connecting...'}
          </span>
          <Activity className="h-3 w-3 text-fg-muted" />
        </button>

        {/* 架构信息徽章 */}
        <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-fg-muted border-l border-border-subtle pl-3">
          <Terminal className="h-3 w-3" />
          <span>{kernelStatus.osFamily}/{kernelStatus.arch}</span>
          <span className="text-border-emphasis">·</span>
          <span>v{kernelStatus.version}</span>
        </div>

        {/* 轨道规范状态 */}
        <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-400/90 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded">
          <ShieldCheck className="h-3 w-3" />
          <span>Ps-openspec</span>
        </div>
      </div>
    </header>
  );
};
