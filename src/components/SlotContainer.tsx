import React from 'react';
import { ModuleId } from '../types/workbench.ts';
import { MODULES } from './Sidebar.tsx';

interface SlotContainerProps {
  activeModule: ModuleId;
}

export const SlotContainer: React.FC<SlotContainerProps> = ({ activeModule }) => {
  const currentMod = MODULES.find((m) => m.id === activeModule) || MODULES[0];

  return (
    <main className="flex-1 bg-canvas-subtle p-6 overflow-hidden">
      {/* 纯净主舞台：无任何假大空卡片与占位说明，真实留白等待后续功能写入 */}
      <div className="h-full w-full rounded-xl border border-border-subtle bg-canvas-default/30 flex flex-col items-center justify-center">
        <span className="text-2xl font-semibold tracking-tight text-fg-muted/40 font-mono">
          {currentMod.name}
        </span>
      </div>
    </main>
  );
};
