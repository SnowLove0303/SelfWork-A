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
  { id: 'launcher', name: '快速启动', shortDesc: '本地应用进程调度', iconName: 'Rocket', category: 'workspace' },
  { id: 'tasks', name: '待办看板', shortDesc: 'GTD 状态机流转', iconName: 'CheckSquare', category: 'workspace' },
  { id: 'notes', name: '块级笔记', shortDesc: 'Notion 风格知识库', iconName: 'FileText', category: 'knowledge' },
  { id: 'mindmap', name: '思维导图', shortDesc: 'Xmind 风格节点发散', iconName: 'Network', category: 'knowledge' },
  { id: 'mcp', name: 'MCP 协议', shortDesc: 'Client/Server 双工总线', iconName: 'Cpu', category: 'system' },
  { id: 'ai', name: 'AI 自动化', shortDesc: '多模型智能体引擎', iconName: 'Bot', category: 'system' },
  { id: 'settings', name: '系统设置', shortDesc: '工作台参数与关于', iconName: 'Settings', category: 'system' },
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
        collapsed ? 'w-16' : 'w-56'
      }`}
    >
      {/* 顶部 Brand 区域 */}
      <div className="flex h-14 items-center justify-between px-3 border-b border-border-subtle">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-primary text-white font-bold font-mono text-sm shadow-sm">
            SW
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-fg-primary truncate tracking-tight">SelfWork</span>
              <span className="text-[10px] font-mono text-fg-muted tracking-wider uppercase">Workbench</span>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={onToggleCollapse}
          title={collapsed ? '展开侧栏' : '收起侧栏'}
          className="flex h-6 w-6 items-center justify-center rounded text-fg-muted hover:text-fg-primary hover:bg-canvas-elevated transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-primary"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* 模块导航清单 */}
      <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
        {MODULES.map((mod) => {
          const isActive = activeModule === mod.id;
          return (
            <button
              key={mod.id}
              type="button"
              onClick={() => onSelectModule(mod.id)}
              title={collapsed ? `${mod.name} - ${mod.shortDesc}` : undefined}
              className={`group flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-xs font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary ${
                isActive
                  ? 'bg-brand-primary/15 text-brand-hover dark:text-sky-400 font-semibold shadow-xs'
                  : 'text-fg-secondary hover:bg-canvas-elevated hover:text-fg-primary active:scale-[0.98]'
              }`}
            >
              <div
                className={`flex h-5 w-5 shrink-0 items-center justify-center transition-colors ${
                  isActive ? 'text-sky-400' : 'text-fg-muted group-hover:text-fg-primary'
                }`}
              >
                {renderIcon(mod.iconName, 'h-4 w-4')}
              </div>
              {!collapsed && (
                <div className="flex flex-1 items-center justify-between min-w-0">
                  <span className="truncate">{mod.name}</span>
                  <span className="text-[9px] font-mono text-fg-muted uppercase opacity-70">
                    {mod.category === 'workspace' ? 'MOD' : mod.category === 'knowledge' ? 'DOC' : 'SYS'}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* 底部微内核标识 */}
      <div className="p-3 border-t border-border-subtle">
        <div className="flex items-center gap-2 text-[11px] font-mono text-fg-muted">
          <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0"></span>
          {!collapsed && <span className="truncate">Tauri v2 · MicroKernel</span>}
        </div>
      </div>
    </aside>
  );
};
