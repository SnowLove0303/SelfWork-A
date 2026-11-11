import React from 'react';
import { ModuleId } from '../types/workbench.ts';
import { AppearanceSettings } from '../types/settings.ts';
import { LauncherDashboard } from './LauncherDashboard.tsx';
import { TasksView } from './TasksView.tsx';
import { MindMapView } from './MindMapView.tsx';

interface SlotContainerProps {
  activeModule: ModuleId;
  settings: AppearanceSettings;
}

export const SlotContainer: React.FC<SlotContainerProps> = ({
  activeModule,
  settings,
}) => {
  return (
    <main className="flex-1 bg-transparent p-3.5 overflow-hidden box-border min-w-0">
      {/* 纯净主舞台：支持透明度与高斯模糊动态绑定的晶体画板 */}
      <div
        style={{
          backgroundColor: `rgba(12, 16, 26, ${settings.opacity})`,
          backdropFilter: `blur(${settings.blur}px)`,
          WebkitBackdropFilter: `blur(${settings.blur}px)`,
        }}
        className="h-full w-full rounded-xl border border-white/[0.10] shadow-[0_4px_30px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.15)] flex flex-col relative overflow-hidden box-border transition-colors duration-150 min-w-0"
      >
        {/* 如果 scope === 'stage' 且配置了自定义背景，在画板卡片内部渲染壁纸与防眩遮罩 */}
        {settings.scope === 'stage' && settings.type !== 'fluid' && settings.imageUrl && (
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            <img
              src={settings.imageUrl}
              alt="主画板背景"
              className="h-full w-full object-cover"
            />
            {/* 深色防眩遮罩 */}
            <div
              style={{
                backgroundColor: `rgba(0, 0, 0, ${settings.overlayDarkness})`,
              }}
              className="absolute inset-0 transition-colors duration-150"
            />
          </div>
        )}

        {/* 内部微弱环境流光漫射（在预设流光模式或未配置图片时展示） */}
        {(settings.type === 'fluid' || !settings.imageUrl) && (
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            <div className="absolute inset-0 bg-radial-gradient from-white/[0.04] to-transparent" />
            <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-sky-400/[0.04] blur-3xl animate-fluid-a" />
            <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-white/[0.03] blur-3xl animate-fluid-b" />
          </div>
        )}

        {/* 内容展示区：根据激活模块渲染对应视图并应用 180ms 硬件加速平滑切页动效 */}
        <div
          key={activeModule}
          className="animate-view-fade relative z-10 flex-1 flex flex-col h-full w-full overflow-hidden min-w-0"
        >
          {activeModule === 'launcher' ? (
            <LauncherDashboard />
          ) : activeModule === 'mindmap' ? (
            <MindMapView />
          ) : (
            <TasksView />
          )}
        </div>
      </div>
    </main>
  );
};
