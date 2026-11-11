import React from 'react';
import {
  Rocket,
  CheckSquare,
  GitFork,
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
              className="p-1 rounded text-fg-muted hover:text-fg-primary hover:bg-white/[0.06] transition-colors tactile-btn"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="w-full flex items-center justify-between">
            <span className="text-[11px] font-semibold text-fg-primary tracking-wide uppercase font-mono">
              导航
            </span>
            <button
              type="button"
              onClick={onToggleCollapse}
              title="折叠侧边栏"
              className="p-1 rounded text-fg-muted hover:text-fg-primary hover:bg-white/[0.06] transition-colors tactile-btn"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* 模块选择区 */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto no-scrollbar">
        {MODULES.map((item) => {
          const isActive = activeModule === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectModule(item.id)}
              className={`w-full group flex items-center rounded-lg transition-all duration-150 tactile-btn ${
                collapsed ? 'justify-center p-2' : 'px-2.5 py-1.5'
              } ${
                isActive
                  ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/30 shadow-[0_0_12px_rgba(56,189,248,0.15)] font-medium'
                  : 'text-fg-muted hover:text-fg-secondary hover:bg-white/[0.04] border border-transparent'
              }`}
              title={collapsed ? `${item.name} - ${item.shortDesc}` : undefined}
            >
              <span className={`shrink-0 ${isActive ? 'text-brand-primary' : 'text-fg-muted group-hover:text-fg-secondary'}`}>
                {renderIcon(item.iconName, 'w-4 h-4')}
              </span>
              {!collapsed && (
                <div className="ml-2.5 text-left truncate flex-1 min-w-0">
                  <div className="text-xs tracking-tight truncate leading-tight font-sans">
                    {item.name}
                  </div>
                  <div className="text-[10px] text-fg-muted/70 truncate leading-tight mt-0.5">
                    {item.shortDesc}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* 底部保留紧凑品牌 S-W Logo */}
      <div className="p-2 border-t border-border-default flex items-center justify-center shrink-0">
        <BrandLogo size={collapsed ? 20 : 22} />
      </div>
    </aside>
  );
};
