import React from 'react';
import {
  Rocket,
  CheckSquare,
  FileText,
  Network,
  Cpu,
  Bot,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { ModuleId, ModuleItem } from '../types/workbench.ts';

interface SidebarProps {
  activeModule: ModuleId;
  onSelectModule: (id: ModuleId) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const MODULES: ModuleItem[] = [
  { id: 'launcher', name: '快速启动', shortDesc: '本地应用调度', iconName: 'Rocket', category: 'workspace' },
  { id: 'tasks', name: '待办清单', shortDesc: '任务管理', iconName: 'CheckSquare', category: 'workspace' },
  { id: 'notes', name: '块级笔记', shortDesc: '个人知识库', iconName: 'FileText', category: 'knowledge' },
  { id: 'mindmap', name: '思维导图', shortDesc: '思维画布', iconName: 'Network', category: 'knowledge' },
  { id: 'mcp', name: 'MCP 协议', shortDesc: '接口协议', iconName: 'Cpu', category: 'system' },
  { id: 'ai', name: 'AI 助手', shortDesc: '自动化行为', iconName: 'Bot', category: 'system' },
  { id: 'settings', name: '设置', shortDesc: '工作台设置', iconName: 'Settings', category: 'system' },
];

/**
 * 专业几何 S-W 连续能量拓扑 Logo (参考 Linear / Raycast 现代极简设计语言)
 * 将 S 的流向轨迹与 W 的双峰结构融合为单一单线折叠图腾
 */
export const BrandLogo: React.FC<{ size?: number; className?: string }> = ({ size = 22, className = '' }) => (
  <div
    style={{ width: size, height: size }}
    className={`relative shrink-0 rounded-[5px] bg-gradient-to-b from-[#1b2537] to-[#0c121d] p-[2.5px] shadow-[inset_0_1px_0_rgba(255,255,255,0.18),_0_1px_3px_rgba(0,0,0,0.6)] border border-white/[0.08] flex items-center justify-center transition-all ${className}`}
  >
    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
      <defs>
        <linearGradient id="sw-brand-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
      </defs>
      {/* 几何 S-W 一体化单线拓扑 */}
      <path
        d="M 18.5 5.5 H 8.5 C 6.5 5.5 5.2 6.8 5.2 8.5 C 5.2 10.2 6.5 11.2 8.5 11.2 H 14.5 C 15.5 11.2 16.2 11.8 15.8 12.8 L 13.8 18.5 L 11.2 13.5 L 8.8 18.5 L 6.5 14"
        stroke="url(#sw-brand-grad)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </div>
);

const renderIcon = (name: string, className: string): React.JSX.Element => {
  switch (name) {
    case 'Rocket': return <Rocket className={className} />;
    case 'CheckSquare': return <CheckSquare className={className} />;
    case 'FileText': return <FileText className={className} />;
    case 'Network': return <Network className={className} />;
    case 'Cpu': return <Cpu className={className} />;
    case 'Bot': return <Bot className={className} />;
    case 'Settings': return <Settings className={className} />;
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
      className={`relative flex flex-col bg-canvas-default chiseled-border-r transition-all duration-200 select-none ${
        collapsed ? 'w-12' : 'w-40'
      }`}
    >
      {/* 顶部 Brand 区域 (搭载高质感专业 BrandLogo) */}
      <div className="flex h-11 items-center justify-between px-2.5 chiseled-border-b">
        <div className="flex items-center gap-2 overflow-hidden">
          <BrandLogo size={22} />
          {!collapsed && (
            <span className="text-xs font-semibold text-fg-primary tracking-tight font-mono">
              SelfWork
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onToggleCollapse}
          title={collapsed ? '展开侧栏' : '收起侧栏'}
          className="flex h-5 w-5 items-center justify-center rounded text-fg-muted hover:text-fg-primary hover:bg-canvas-elevated hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-all"
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      </div>

      {/* 模块导航清单 */}
      <nav className="flex-1 space-y-1 p-1.5 overflow-y-auto">
        {MODULES.map((mod) => {
          const isActive = activeModule === mod.id;
          return (
            <button
              key={mod.id}
              type="button"
              onClick={() => onSelectModule(mod.id)}
              title={collapsed ? mod.name : undefined}
              className={`group relative flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-all duration-150 ${
                isActive
                  ? 'bg-canvas-elevated text-fg-primary font-medium border border-white/[0.08] chiseled-btn-active'
                  : 'text-fg-secondary hover:bg-canvas-elevated/40 hover:text-fg-primary border border-transparent hover:border-white/[0.04]'
              }`}
            >
              {/* 激活指示线 */}
              {isActive && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-brand-primary shadow-[0_0_6px_rgba(2,132,199,0.8)]" />
              )}
              <div className={`shrink-0 transition-colors ${isActive ? 'text-brand-primary' : 'text-fg-muted group-hover:text-fg-primary'}`}>
                {renderIcon(mod.iconName, 'h-3.5 w-3.5')}
              </div>
              {!collapsed && (
                <span className="truncate text-left text-[12px]">{mod.name}</span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
