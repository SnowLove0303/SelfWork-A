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
      className={`relative flex flex-col border-r border-border-subtle bg-canvas-default transition-all duration-200 select-none ${
        collapsed ? 'w-12' : 'w-40'
      }`}
    >
      {/* 顶部 Brand 区域 */}
      <div className="flex h-11 items-center justify-between px-2.5 border-b border-border-subtle">
        <div className="flex items-center gap-1.5 overflow-hidden">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-brand-primary text-white font-bold font-mono text-[11px]">
            SW
          </div>
          {!collapsed && (
            <span className="text-xs font-semibold text-fg-primary truncate tracking-tight">
              SelfWork
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onToggleCollapse}
          title={collapsed ? '展开侧栏' : '收起侧栏'}
          className="flex h-5 w-5 items-center justify-center rounded text-fg-muted hover:text-fg-primary hover:bg-canvas-elevated transition-colors"
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      </div>

      {/* 模块导航清单 */}
      <nav className="flex-1 space-y-0.5 p-1.5 overflow-y-auto">
        {MODULES.map((mod) => {
          const isActive = activeModule === mod.id;
          return (
            <button
              key={mod.id}
              type="button"
              onClick={() => onSelectModule(mod.id)}
              title={collapsed ? mod.name : undefined}
              className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors ${
                isActive
                  ? 'bg-canvas-elevated text-fg-primary font-medium'
                  : 'text-fg-secondary hover:bg-canvas-elevated/60 hover:text-fg-primary'
              }`}
            >
              <div className={`shrink-0 ${isActive ? 'text-brand-primary' : 'text-fg-muted'}`}>
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
