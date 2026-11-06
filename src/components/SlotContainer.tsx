import React from 'react';
import { ModuleId } from '../types/workbench.ts';
import { MODULES } from './Sidebar.tsx';

interface SlotContainerProps {
  activeModule: ModuleId;
}

export const SlotContainer: React.FC<SlotContainerProps> = ({ activeModule }) => {
  const currentMod = MODULES.find((m) => m.id === activeModule) || MODULES[0];

  return (
    <main className="flex-1 bg-canvas-subtle p-3.5 overflow-hidden box-border">
      {/* 纯净主舞台：与顶栏底边、侧栏右边无缝咬合，内嵌 1px 精准细线统一画板 */}
      <div className="h-full w-full rounded-lg bg-canvas-default/70 border border-border-default shadow-[0_1px_3px_rgba(0,0,0,0.3),_0_6px_20px_rgba(0,0,0,0.4)] flex flex-col items-center justify-center relative overflow-hidden box-border">
        {/* 背景微弱环境暗光晕，增强景深 */}
        <div className="absolute inset-0 bg-radial-gradient from-white/[0.02] to-transparent pointer-events-none" />
        
        <span className="text-xl font-semibold tracking-tight text-fg-muted/30 font-mono drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] select-none">
          {currentMod.name}
        </span>
      </div>
    </main>
  );
};
