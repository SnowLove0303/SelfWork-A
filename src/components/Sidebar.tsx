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
      {/* 顶部 Brand 区域 (立体切削底线) */}
      <div className="flex h-11 items-center justify-between px-2.5 chiseled-border-b">
        <div className="flex items-center gap-1.5 overflow-hidden">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-brand-primary text-white font-bold font-mono text-[11px] shadow-[inset_0_1px_0_rgba(255,255,255,0.3),_0_1px_3px_rgba(0,0,0,0.5)]">
            SW
          </div>
          {!collapsed && (
            <span className="text-xs font-semibold text-fg-primary tracking-tight">
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

      {/* 模块导航清单 (立体按钮凹凸质感) */}
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
