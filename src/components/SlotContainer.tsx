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
      {/* 纯净主舞台：深邃磨砂亚克力画板，顶部物理高光 + 悬浮景深阴影 */}
      <div className="h-full w-full rounded-xl bg-canvas-default/60 backdrop-blur-xl border border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.12)] flex flex-col items-center justify-center relative overflow-hidden box-border">
        {/* 背景微弱环境暗光晕与柔和漫射，增强深邃景深 */}
        <div className="absolute inset-0 bg-radial-gradient from-white/[0.03] to-transparent pointer-events-none" />
        <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-brand-primary/[0.03] blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-white/[0.02] blur-3xl pointer-events-none" />
        
        <span className="text-xl font-semibold tracking-tight text-fg-muted/40 font-mono drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] select-none">
          {currentMod.name}
        </span>
      </div>
    </main>
  );
};
