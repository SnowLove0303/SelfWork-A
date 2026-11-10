import React, { useState, useMemo, KeyboardEvent } from 'react';
import {
  Check,
  Plus,
  Trash2,
  Calendar,
  CheckCircle2,
  ListTodo,
  GripVertical,
} from 'lucide-react';
import { TaskItem, TaskPriority, TaskFilterTab } from '../../types/tasks.ts';

interface TasksPanelProps {
  tasks: TaskItem[];
  onAddTask: (title: string, isToday?: boolean) => void;
  onToggleStatus: (id: string) => void;
  onCyclePriority: (id: string) => void;
  onToggleToday: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onClearCompleted: () => void;
  onReorderTasks: (newTasks: TaskItem[]) => void;
}

const FILTER_TABS: Array<{ id: TaskFilterTab; label: string }> = [
  { id: 'all', label: '全部' },
  { id: 'today', label: '今日' },
  { id: 'pending', label: '待办' },
  { id: 'done', label: '已完成' },
];

export const TasksPanel: React.FC<TasksPanelProps> = ({
  tasks,
  onAddTask,
  onToggleStatus,
  onCyclePriority,
  onToggleToday,
  onDeleteTask,
  onClearCompleted,
  onReorderTasks,
}) => {
  const [inputText, setInputText] = useState<string>('');
  const [activeTab, setActiveTab] = useState<TaskFilterTab>('all');
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dropTargetTaskId, setDropTargetTaskId] = useState<string | null>(null);

  // 键盘回车秒建
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const trimmed = inputText.trim();
      if (!trimmed) return;
      onAddTask(trimmed, activeTab === 'today');
      setInputText('');
    }
  };

  // 状态计数统计
  const counts = useMemo(() => {
    const total = tasks.length;
    const today = tasks.filter((t) => t.isToday || t.status === 'in_progress').length;
    const pending = tasks.filter((t) => t.status === 'todo' || t.status === 'in_progress').length;
    const done = tasks.filter((t) => t.status === 'done').length;
    return { all: total, today, pending, done };
  }, [tasks]);

  // 过滤后的任务集
  const filteredTasks = useMemo(() => {
    return tasks.filter((item) => {
      if (activeTab === 'today') {
        return item.isToday || item.status === 'in_progress';
      }
      if (activeTab === 'pending') {
        return item.status === 'todo' || item.status === 'in_progress';
      }
      if (activeTab === 'done') {
        return item.status === 'done';
      }
      return true;
    });
  }, [tasks, activeTab]);

  // 获取优先级微光小圆点样式
  const getPriorityDot = (p: TaskPriority) => {
    switch (p) {
      case 'p1':
        return {
          title: '高优先级 (点击切换)',
          className: 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.6)] ring-1 ring-rose-400/30 shrink-0',
        };
      case 'p2':
        return {
          title: '中优先级 (点击切换)',
          className: 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.6)] ring-1 ring-amber-300/30 shrink-0',
        };
      case 'p3':
      default:
        return {
          title: '低优先级 (点击切换)',
          className: 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)] ring-1 ring-emerald-300/30 shrink-0',
        };
    }
  };

  // 拖拽换位逻辑
  const handleDropTask = (targetTaskId: string) => {
    if (!draggedTaskId || draggedTaskId === targetTaskId) return;
    const fromIndex = tasks.findIndex((t) => t.id === draggedTaskId);
    const toIndex = tasks.findIndex((t) => t.id === targetTaskId);
    if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return;

    const nextTasks = [...tasks];
    const [moved] = nextTasks.splice(fromIndex, 1);
    nextTasks.splice(toIndex, 0, moved);
    onReorderTasks(nextTasks);
    setDraggedTaskId(null);
    setDropTargetTaskId(null);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-transparent border-r border-border-default select-none min-w-0">
      {/* 顶部标题与过滤控制栏 */}
      <div className="p-3.5 pb-2.5 space-y-3 shrink-0 border-b border-border-subtle bg-white/[0.01]">
        {/* 标题与统计概览 */}
        <div className="flex items-center justify-between gap-2 flex-wrap min-w-0">
          <div className="flex items-center gap-2 shrink-0">
            <ListTodo className="w-4 h-4 text-brand-primary shrink-0" />
            <h2 className="text-xs font-semibold text-fg-primary tracking-tight font-mono shrink-0 whitespace-nowrap">
              待办清单
            </h2>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/[0.06] text-fg-muted font-mono border border-white/[0.06] shrink-0 whitespace-nowrap">
              {counts.pending} 待办 / {counts.all} 全部
            </span>
          </div>

          {/* 状态过滤胶囊 */}
          <div className="flex items-center gap-1 bg-black/25 p-0.5 rounded-lg border border-white/[0.06] shrink-0 overflow-x-auto no-scrollbar">
            {FILTER_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              const count = counts[tab.id];
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-medium transition-colors tactile-btn shrink-0 whitespace-nowrap ${
                    isActive
                      ? 'bg-white/[0.12] text-fg-primary shadow-sm border border-white/[0.10]'
                      : 'text-fg-muted hover:text-fg-secondary hover:bg-white/[0.04] border border-transparent'
                  }`}
                >
                  <span className="shrink-0">{tab.label}</span>
                  <span
                    className={`text-[9px] px-1 py-0.1 rounded-full font-mono shrink-0 ${
                      isActive ? 'bg-brand-primary/20 text-brand-primary' : 'bg-white/[0.05] text-fg-muted'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 快速单行录入框 (回车秒建) */}
        <div className="relative flex items-center min-w-0">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="+ 快速添加待办任务，按 Enter 键保存..."
            className="w-full h-9 pl-3 pr-9 rounded-lg bg-black/30 border border-white/[0.08] text-xs text-fg-primary placeholder:text-fg-muted/60 focus:outline-none focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/40 focus:bg-black/40 transition-all font-sans min-w-0"
          />
          <button
            type="button"
            onClick={() => {
              const trimmed = inputText.trim();
              if (trimmed) {
                onAddTask(trimmed, activeTab === 'today');
                setInputText('');
              }
            }}
            disabled={!inputText.trim()}
            title="添加任务 (Enter)"
            className="absolute right-1.5 w-6 h-6 flex items-center justify-center rounded bg-white/[0.06] hover:bg-brand-primary hover:text-black text-fg-muted disabled:opacity-20 disabled:pointer-events-none transition-colors tactile-btn shrink-0"
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
          </button>
        </div>
      </div>

      {/* 待办列表内容区 */}
      <div className="flex-1 overflow-y-auto px-3.5 py-2.5 space-y-1.5 min-w-0">
        {filteredTasks.length === 0 ? (
          <div className="h-44 flex flex-col items-center justify-center text-center">
            <span className="text-xs text-fg-muted/50 font-mono shrink-0 whitespace-nowrap">
              暂无匹配待办事项
            </span>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isDone = task.status === 'done';
            const dot = getPriorityDot(task.priority);
            const isDragging = draggedTaskId === task.id;
            const isDropTarget = dropTargetTaskId === task.id;

            return (
              <div
                key={task.id}
                draggable
                onDragStart={(e) => {
                  // 如果点击的是特定操作按钮，不触发卡片拖拽
                  if ((e.target as HTMLElement).closest('button')) {
                    e.preventDefault();
                    return;
                  }
                  e.dataTransfer.effectAllowed = 'move';
                  e.dataTransfer.setData('text/plain', task.id);
                  setDraggedTaskId(task.id);
                }}
                onDragEnd={() => {
                  setDraggedTaskId(null);
                  setDropTargetTaskId(null);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                }}
                onDragEnter={(e) => {
                  e.preventDefault();
                  if (draggedTaskId && draggedTaskId !== task.id) {
                    setDropTargetTaskId(task.id);
                  }
                }}
                onDragLeave={(e) => {
                  if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                  if (dropTargetTaskId === task.id) {
                    setDropTargetTaskId(null);
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  handleDropTask(task.id);
                }}
                className={`group h-10 px-2.5 rounded-lg border transition-all flex items-center gap-2 min-w-0 cursor-grab active:cursor-grabbing ${
                  isDragging
                    ? 'opacity-30 scale-[0.99] border-dashed border-sky-400/60 bg-sky-500/[0.04]'
                    : isDropTarget
                    ? 'border-sky-400 bg-sky-500/[0.12] shadow-[0_0_12px_rgba(56,189,248,0.25)]'
                    : isDone
                    ? 'bg-white/[0.01] border-white/[0.03] opacity-55'
                    : 'bg-white/[0.03] hover:bg-white/[0.05] border-white/[0.06] hover:border-white/[0.12] shadow-[0_1px_4px_rgba(0,0,0,0.2)]'
                }`}
              >
                {/* 拖拽抓手图标 */}
                <div
                  title="按住拖拽调整顺序"
                  className="opacity-30 group-hover:opacity-80 hover:!opacity-100 p-0.5 -ml-1 text-fg-muted hover:text-fg-primary cursor-grab active:cursor-grabbing transition-opacity shrink-0"
                >
                  <GripVertical className="w-3.5 h-3.5 shrink-0" />
                </div>

                {/* 触觉复选框 */}
                <button
                  type="button"
                  draggable={false}
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={() => onToggleStatus(task.id)}
                  title={isDone ? '标记为未完成' : '标记为已完成'}
                  className={`w-4 h-4 rounded shrink-0 flex items-center justify-center transition-all tactile-btn cursor-pointer ${
                    isDone
                      ? 'bg-brand-primary/80 border border-brand-primary text-black'
                      : 'border border-white/[0.25] hover:border-brand-primary/70 bg-black/30'
                  }`}
                >
                  {isDone && <Check className="w-3 h-3 stroke-[2.5] shrink-0" />}
                </button>

                {/* 优先级微光圆点 (点击切换) */}
                <button
                  type="button"
                  draggable={false}
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={() => onCyclePriority(task.id)}
                  title={dot.title}
                  className="p-1 -m-1 rounded hover:bg-white/[0.08] transition-colors shrink-0 cursor-pointer"
                >
                  <span className={`block w-2 h-2 rounded-full transition-all ${dot.className}`} />
                </button>

                {/* 任务标题 */}
                <span
                  onClick={() => onToggleStatus(task.id)}
                  className={`flex-1 text-xs truncate select-none transition-colors min-w-0 ${
                    isDone
                      ? 'line-through text-fg-muted/70 font-normal'
                      : 'text-fg-primary font-medium'
                  }`}
                >
                  {task.title}
                </span>

                {/* 今日胶囊小标签 (点击切换今日归属) */}
                <button
                  type="button"
                  draggable={false}
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={() => onToggleToday(task.id)}
                  title={task.isToday ? '移出今日安排' : '设为今日待办'}
                  className={`text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 transition-colors tactile-btn shrink-0 whitespace-nowrap cursor-pointer ${
                    task.isToday
                      ? 'bg-amber-400/15 text-amber-300 border border-amber-400/25'
                      : 'opacity-0 group-hover:opacity-100 text-fg-muted hover:text-fg-secondary bg-white/[0.04]'
                  }`}
                >
                  <Calendar className="w-2.5 h-2.5 shrink-0" />
                  <span>今日</span>
                </button>

                {/* 删除按钮 (悬停优雅浮现) */}
                <button
                  type="button"
                  draggable={false}
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={() => onDeleteTask(task.id)}
                  title="删除任务"
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-500/20 hover:text-rose-400 text-fg-muted transition-all tactile-btn shrink-0 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 shrink-0" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* 底部极简状态与清理栏 */}
      <div className="h-10 px-3.5 flex items-center justify-between border-t border-border-subtle bg-white/[0.01] shrink-0 text-[11px] text-fg-muted min-w-0">
        <span className="font-mono shrink-0 whitespace-nowrap">
          {counts.done > 0 ? `已完成 ${counts.done} 项` : '专注当下待办'}
        </span>

        {counts.done > 0 && (
          <button
            type="button"
            onClick={onClearCompleted}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] text-fg-muted hover:text-rose-300 hover:bg-rose-500/10 transition-colors tactile-btn shrink-0 whitespace-nowrap"
          >
            <CheckCircle2 className="w-3 h-3 shrink-0" />
            <span>一键清理已完成</span>
          </button>
        )}
      </div>
    </div>
  );
};
