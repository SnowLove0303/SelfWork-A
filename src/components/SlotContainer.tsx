import React from 'react';
import {
  Rocket,
  CheckSquare,
  FileText,
  Network,
  Cpu,
  Bot,
  Settings,
  Layers,
  Sparkles,
} from 'lucide-react';
import { ModuleId } from '../types/workbench.ts';
import { MODULES } from './Sidebar.tsx';

interface SlotContainerProps {
  activeModule: ModuleId;
}

interface FeatureSpec {
  status: string;
  role: string;
  invariants: string[];
  protocol: string;
}

const FEATURE_SPECS: Record<ModuleId, FeatureSpec> = {
  launcher: {
    status: '候选特性池 (DRAFT / CANDIDATE)',
    role: '外部程序调度与跨进程管道',
    invariants: ['Rust 原生 std::process 进程沙箱', '零命令注入与白名单校验', 'PID 状态感知与退出码回传'],
    protocol: 'IPC: invoke("launch_executable", { path, args })',
  },
  tasks: {
    status: '候选特性池 (DRAFT / CANDIDATE)',
    role: '个人 GTD 显式状态机流转',
    invariants: ['Todo -> InProgress -> Blocked -> Done', '单焦点锁约束与非阻塞流转', '本地 SQLite / Markdown 存储'],
    protocol: 'Local Statechart + EventBus Tasks Dispatcher',
  },
  notes: {
    status: '候选特性池 (DRAFT / CANDIDATE)',
    role: 'Notion 风格块级原子知识库',
    invariants: ['Block-based 原子状态机', 'Markdown 纯文本无损双向映射', '本地文件夹目录即数据源 (Local-First)'],
    protocol: 'Block Editor Engine + Markdown Sync Pipeline',
  },
  mindmap: {
    status: '候选特性池 (DRAFT / CANDIDATE)',
    role: 'Xmind 风格矢量脑暴与大纲同构',
    invariants: ['树状与网状图拓扑解耦', 'Canvas/SVG 矢量平移缩放渲染', '节点列表与大纲树无损互转'],
    protocol: 'Vector Graph Topology + Lossless Outline Converter',
  },
  mcp: {
    status: '候选特性池 (DRAFT / CANDIDATE)',
    role: 'Model Context Protocol 协议总线',
    invariants: ['双工 Client & Server 架构', '标准 JSON-RPC 2.0 (stdio / SSE)', '只读 Resource 与授权 Tool 隔离'],
    protocol: '@modelcontextprotocol/sdk + Stdio Channel',
  },
  ai: {
    status: '候选特性池 (DRAFT / CANDIDATE)',
    role: '统一多模型网关与自动化执行',
    invariants: ['兼容 OpenAI / Claude / Gemini / Ollama', '只读上下文注入管道', 'Tool-Call 显式人工确认门禁'],
    protocol: 'Multi-Provider Streaming Gateway + Context Ingestion',
  },
  settings: {
    status: '核心平台配置 (CORE)',
    role: '工作台全局参数与存储路径维护',
    invariants: ['本地工作目录: F:\\App Location\\SelfWork', '受管宪法: AGENTS.md + ARCHITECTURE.md', '远端仓库: SnowLove0303/SelfWork-A'],
    protocol: 'Tauri FileSystem + OpenSpec Config Pipeline',
  },
};

const getModuleIcon = (id: ModuleId): React.JSX.Element => {
  const cls = 'h-5 w-5';
  switch (id) {
    case 'launcher': return <Rocket className={cls} />;
    case 'tasks': return <CheckSquare className={cls} />;
    case 'notes': return <FileText className={cls} />;
    case 'mindmap': return <Network className={cls} />;
    case 'mcp': return <Cpu className={cls} />;
    case 'ai': return <Bot className={cls} />;
    case 'settings': return <Settings className={cls} />;
  }
};

export const SlotContainer: React.FC<SlotContainerProps> = ({ activeModule }) => {
  const currentMod = MODULES.find((m) => m.id === activeModule) || MODULES[0];
  const spec = FEATURE_SPECS[activeModule];

  return (
    <main className="flex-1 overflow-y-auto bg-canvas-subtle p-6 select-text">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* 顶部插槽卡片 */}
        <section className="rounded-xl border border-border-default bg-canvas-default p-6 shadow-xs">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-canvas-elevated text-brand-primary border border-border-subtle">
                {getModuleIcon(activeModule)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-fg-primary tracking-tight">
                    {currentMod.name} 插槽
                  </h2>
                  <span className="rounded-full bg-sky-950/60 border border-sky-800/50 px-2 py-0.5 text-[10px] font-mono font-medium text-sky-400">
                    {spec.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-fg-secondary">
                  {spec.role}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-mono text-fg-muted bg-canvas-subtle px-2.5 py-1 rounded border border-border-subtle">
              <Layers className="h-3.5 w-3.5" />
              <span>Slot ID: {activeModule}</span>
            </div>
          </div>

          {/* 架构契约与不变量矩阵 */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg bg-canvas-subtle p-4 border border-border-subtle">
              <span className="text-[11px] font-mono uppercase tracking-wider text-fg-muted">
                架构不变量与安全守则 (Invariants)
              </span>
              <ul className="mt-2 space-y-1.5">
                {spec.invariants.map((inv, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-xs text-fg-secondary">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-primary shrink-0" />
                    <span>{inv}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg bg-canvas-subtle p-4 border border-border-subtle flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-fg-muted">
                  通信协议与调度接口 (Protocol)
                </span>
                <p className="mt-2 text-xs font-mono text-sky-400/90 break-all bg-canvas-elevated/60 p-2 rounded border border-border-subtle">
                  {spec.protocol}
                </p>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-[11px] text-fg-muted">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>模块独立解耦 · 随时可按需开启开发流水线</span>
              </div>
            </div>
          </div>
        </section>

        {/* 占位工作台画板 (Ready Canvas) */}
        <section className="rounded-xl border border-dashed border-border-emphasis bg-canvas-default/40 p-12 text-center">
          <div className="mx-auto flex max-w-sm flex-col items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-canvas-elevated text-fg-muted">
              {getModuleIcon(activeModule)}
            </div>
            <h3 className="mt-3 text-sm font-medium text-fg-primary">
              [{currentMod.name}] 微内核插槽已就绪
            </h3>
            <p className="mt-1 text-xs text-fg-secondary">
              遵循“暂不开发”原则，此模块仅预留架构接口与生命周期挂载点。当您发出明确开发指令时，即可启动独立增量变更。
            </p>
          </div>
        </section>
      </div>
    </main>
  );
};
