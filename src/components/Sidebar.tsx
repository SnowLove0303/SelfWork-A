import React from 'react';
import {
  Rocket,
  CheckSquare,
  GitFork,
  FileText,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { ModuleId, ModuleItem } from '../types/workbench.ts';
import appIcon from '../assets/app-icon.png';

interface SidebarProps {
  activeModule: ModuleId;
  onSelectModule: (id: ModuleId) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const MODULES: ModuleItem[] = [
  { id: 'launcher', name: '快速启动', shortDesc: '本地应用调度', iconName: 'Rocket', category: 'workspace' },
  { id: 'tasks', name: '待办清单', shortDesc: '任务管理', iconName: 'CheckSquare', category: 'workspace' },
  { id: 'mindmap', name: '思维导图', shortDesc: '灵感脑图构思', iconName: 'GitFork', category: 'workspace' },
  { id: 'docs', name: '文档表格', shortDesc: '知识库与多维表', iconName: 'FileText', category: 'workspace' },
];

/**
 * 用户专属流体发光 S-W 品牌 Logo (保留导出供独立插槽调用)
 */
export const BrandLogo: React.FC<{ size?: number; className?: string }> = ({ size = 22, className = '' }) => (
  <div
    style={{ width: size, height: size }}
    className={`relative shrink-0 overflow-hidden rounded-[5px] shadow-[inset_0_1px_0_rgba(255,255,255,0.2),_0_2px_4px_rgba(0,0,0,0.5)] border border-white/[0.08] flex items-center justify-center transition-all ${className}`}
  >
    <img src={appIcon} alt="SW工作台" className="h-full w-full object-cover select-none pointer-events-none" />
  </div>
);

const renderIcon = (name: string, className: string): React.JSX.Element => {
  switch (name) {
    case 'Rocket': return <Rocket className={className} />;
    case 'CheckSquare': return <CheckSquare className={className} />;
    case 'GitFork': return <GitFork className={className} />;
    case 'FileText': return <FileText className={className} />;
    default: return <Rocket className={className} />;
  }
};

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  onSelectModule,
  collapsed,
  onToggleCollapse,
}) => {
  return (
    <aside
      className={`relative z-10 flex flex-col bg-canvas-default/35 backdrop-blur-xl border-r border-border-default transition-all duration-200 ease-in-out select-none overflow-x-hidden ${
        collapsed ? 'w-12' : 'w-40'
      }`}
    >
      {/* 侧栏顶端区域：无占位小图标，纯粹导航状态标识与折叠切换交互 */}
      <div className="flex h-9 items-center border-b border-border-default px-2.5 overflow-hidden box-border bg-transparent select-none">
        {collapsed ? (
          <div className="w-full flex items-center justify-center">
            <button
              type="button"
              onClick={onToggleCollapse}
              title="展开侧边栏"
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-fg-muted hover:text-fg-primary hover:bg-white/[0.08] tactile-btn transition-colors duration-150"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div className="w-full flex items-center justify-between min-w-0">
            <span className="text-[10px] font-mono tracking-wider text-[#8FA3BF]/70 font-semibold uppercase truncate">
              导航
            </span>
            <button
              type="button"
              onClick={onToggleCollapse}
              title="收起侧边栏"
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-fg-muted hover:text-fg-primary hover:bg-white/[0.08] tactile-btn transition-colors duration-150"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* 模块导航清单：图标绝对定宽，文字通过 max-width 与 opacity 柔性渐隐，彻底杜绝闪烁跳字与按压抖动 */}
      <nav className="flex-1 space-y-1 p-1.5 overflow-y-auto overflow-x-hidden">
        {MODULES.map((mod) => {
          const isActive = activeModule === mod.id;
          return (
            <button
              key={mod.id}
              type="button"
              onClick={() => onSelectModule(mod.id)}
              title={collapsed ? mod.name : undefined}
              className={`group relative flex w-full items-center rounded-md px-2 py-1.5 text-xs tactile-btn overflow-hidden ${
                collapsed ? 'justify-center gap-0' : 'gap-2'
              } ${
                isActive
                  ? 'tactile-btn-active text-fg-primary font-medium'
                  : 'text-fg-secondary hover:text-fg-primary hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08]'
              }`}
            >
              {/* 激活指示流光柱：微呼吸流光特效 */}
              {isActive && (
                <span className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full bg-gradient-to-b from-sky-400 via-cyan-300 to-indigo-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
              )}
              <span className={`shrink-0 transition-transform duration-150 ${isActive ? 'scale-105 text-sky-400' : ''}`}>
                {renderIcon(mod.iconName, 'h-4 w-4')}
              </span>
              <span
                className={`truncate font-mono transition-all duration-200 ease-in-out ${
                  collapsed
                    ? 'opacity-0 max-w-0 pointer-events-none'
                    : 'opacity-100 max-w-[100px]'
                }`}
              >
                {mod.name}
              </span>
            </button>
          );
        })}
      </nav>

      {/* 底部微弱版本状态标识 */}
      <div className="p-2 border-t border-border-default/40 flex items-center justify-center">
        <span
          className={`text-[9px] font-mono text-fg-muted/40 transition-all duration-200 overflow-hidden whitespace-nowrap ${
            collapsed ? 'opacity-0 max-w-0' : 'opacity-100 max-w-full'
          }`}
        >
          v0.1.0-alpha
        </span>
      </div>
    </aside>
  );
};
