import React from 'react';
import { ModuleId } from '../types/workbench.ts';
import { MODULES } from './Sidebar.tsx';

interface SlotContainerProps {
  activeModule: ModuleId;
}

export const SlotContainer: React.FC<SlotContainerProps> = ({ activeModule }) => {
  const currentMod = MODULES.find((m) => m.id === activeModule) || MODULES[0];

  return (
    <main className="flex-1 bg-transparent p-3.5 overflow-hidden box-border">
      {/* 纯净主舞台：高透水晶磨砂亚克力画板，顶部流光微反光 + 晶莹景深 */}
      <div className="h-full w-full rounded-xl bg-canvas-default/25 backdrop-blur-2xl border border-white/[0.10] shadow-[0_4px_30px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.15)] flex flex-col items-center justify-center relative overflow-hidden box-border">
        {/* 内部微光流溢景深：跟随动画缓慢呼吸漂移 */}
        <div className="absolute inset-0 bg-radial-gradient from-white/[0.04] to-transparent pointer-events-none" />
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-sky-400/[0.04] blur-3xl pointer-events-none animate-fluid-a" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-white/[0.03] blur-3xl pointer-events-none animate-fluid-b" />
        
        <span className="text-xl font-semibold tracking-tight text-fg-muted/40 font-mono drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] select-none">
          {currentMod.name}
        </span>
      </div>
    </main>
  );
};
