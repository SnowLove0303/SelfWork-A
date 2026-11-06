import React from 'react';
import { ModuleId } from '../types/workbench.ts';
import { MODULES } from './Sidebar.tsx';

interface SlotContainerProps {
  activeModule: ModuleId;
}

export const SlotContainer: React.FC<SlotContainerProps> = ({ activeModule }) => {
  const currentMod = MODULES.find((m) => m.id === activeModule) || MODULES[0];

  return (
    <main className="flex-1 bg-canvas-subtle p-4 overflow-hidden">
      {/* 纯净主舞台：物理级立体微切削边缘，顶部高光 + 下凹柔和投影 */}
      <div className="h-full w-full rounded-lg bg-canvas-default/70 chiseled-card flex flex-col items-center justify-center relative overflow-hidden">
        {/* 背景微弱环境暗光晕，增强景深 */}
        <div className="absolute inset-0 bg-radial-gradient from-white/[0.02] to-transparent pointer-events-none" />
        
        <span className="text-xl font-semibold tracking-tight text-fg-muted/30 font-mono drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] select-none">
          {currentMod.name}
        </span>
      </div>
    </main>
  );
};
