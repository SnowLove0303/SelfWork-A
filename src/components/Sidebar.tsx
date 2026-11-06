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
  { id: 'notes', name: '块级笔记', shortDesc: '个人知识库', iconName: 'FileText', category: 'knowledge' },
  { id: 'mindmap', name: '思维导图', shortDesc: '思维画布', iconName: 'Network', category: 'knowledge' },
  { id: 'mcp', name: 'MCP 协议', shortDesc: '接口协议', iconName: 'Cpu', category: 'system' },
  { id: 'ai', name: 'AI 助手', shortDesc: '自动化行为', iconName: 'Bot', category: 'system' },
  { id: 'settings', name: '设置', shortDesc: '工作台设置', iconName: 'Settings', category: 'system' },
];

/**
 * 用户专属流体发光 S-W 品牌 Logo
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
      className={`relative flex flex-col bg-canvas-default/80 backdrop-blur-md border-r border-border-default transition-all duration-200 ease-in-out select-none overflow-x-hidden ${
        collapsed ? 'w-12' : 'w-40'
      }`}
    >
      {/* 顶部 Brand 区域：Logo 与标题无缝平滑过渡，严格基准高度 h-11 与单边框规范 */}
      <div className="flex h-11 items-center border-b border-border-default px-2.5 overflow-hidden box-border bg-transparent">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <BrandLogo size={22} className="shrink-0" />
          <span
            className={`text-xs font-semibold text-fg-primary tracking-tight font-mono whitespace-nowrap overflow-hidden transition-all duration-200 ease-in-out ${
              collapsed
                ? 'opacity-0 max-w-0 pointer-events-none'
                : 'opacity-100 max-w-[80px]'
            }`}
          >
            SW工作台
          </span>
        </div>
        
        {/* 展开状态下的收起按钮：触觉微交互与毛玻璃微反光 */}
        <button
          type="button"
          onClick={onToggleCollapse}
          title="收起侧栏"
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded text-fg-muted hover:text-fg-primary hover:bg-white/[0.08] tactile-btn transition-all duration-150 ${
            collapsed ? 'opacity-0 pointer-events-none scale-75' : 'opacity-100 scale-100'
          }`}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* 模块导航清单：图标绝对定宽，文字通过 max-width 与 opacity 柔性渐隐，彻底杜绝闪烁跳字 */}
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
                  : 'text-fg-secondary hover:text-fg-primary hover:bg-white/[0.05] border border-transparent hover:border-white/[0.06]'
              }`}
            >
              {/* 激活指示光柱 */}
              {isActive && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-brand-primary shadow-[0_0_8px_rgba(56,189,248,0.9)]" />
              )}
              
              {/* 图标容器：固定居中，绝不随文字移动 */}
              <div className={`shrink-0 flex items-center justify-center transition-colors ${
                isActive ? 'text-brand-primary' : 'text-fg-muted group-hover:text-fg-primary'
              }`}>
                {renderIcon(mod.iconName, 'h-3.5 w-3.5')}
              </div>

              {/* 导航文字：通过 max-width 和 opacity 与 200ms 侧栏过渡绝对同步，绝无闪烁跳跃 */}
              <span
                className={`text-left text-[12px] whitespace-nowrap overflow-hidden transition-all duration-200 ease-in-out ${
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
    </aside>
  );
};
