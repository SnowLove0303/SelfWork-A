import React, { useState, useEffect, useRef } from 'react';
import { TaskItem, MemoItem, TaskPriority } from '../types/tasks.ts';
import { INITIAL_TASKS, INITIAL_MEMOS } from './tasks/initialData.ts';
import { TasksPanel } from './tasks/TasksPanel.tsx';
import { MemoBoard } from './tasks/MemoBoard.tsx';

const TASKS_STORAGE_KEY = 'selfwork_tasks_data';
const MEMOS_STORAGE_KEY = 'selfwork_memos_data';

export const TasksView: React.FC = () => {
  // 1. 初始化待办数据 (Local-First: 本地存储优先，缺失时种子填充)
  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    try {
      const saved = localStorage.getItem(TASKS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // 容错降级
    }
    return INITIAL_TASKS;
  });

  // 2. 初始化便签数据
  const [memos, setMemos] = useState<MemoItem[]>(() => {
    try {
      const saved = localStorage.getItem(MEMOS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // 容错降级
    }
    return INITIAL_MEMOS;
  });

  const isInitialTasksMount = useRef(true);
  const isInitialMemosMount = useRef(true);

  // 自动防抖持久化待办数据 (300ms)
  useEffect(() => {
    if (isInitialTasksMount.current) {
      isInitialTasksMount.current = false;
      return;
    }
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
      } catch (err) {
        console.error('Failed to persist tasks:', err);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [tasks]);

  // 自动防抖持久化便签数据 (300ms)
  useEffect(() => {
    if (isInitialMemosMount.current) {
      isInitialMemosMount.current = false;
      return;
    }
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(MEMOS_STORAGE_KEY, JSON.stringify(memos));
      } catch (err) {
        console.error('Failed to persist memos:', err);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [memos]);

  // ==================== 待办操作管线 ====================

  const handleAddTask = (title: string, isToday = false) => {
    const newTask: TaskItem = {
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title,
      status: 'todo',
      priority: 'p2',
      isToday,
      createdAt: Date.now(),
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleToggleStatus = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const nextStatus = t.status === 'done' ? 'todo' : 'done';
        return {
          ...t,
          status: nextStatus,
          completedAt: nextStatus === 'done' ? Date.now() : undefined,
        };
      })
    );
  };

  const handleCyclePriority = (id: string) => {
    const cycleMap: Record<TaskPriority, TaskPriority> = {
      p1: 'p2',
      p2: 'p3',
      p3: 'p1',
    };
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, priority: cycleMap[t.priority] } : t))
    );
  };

  const handleToggleToday = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isToday: !t.isToday } : t))
    );
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleClearCompleted = () => {
    setTasks((prev) => prev.filter((t) => t.status !== 'done'));
  };

  // ==================== 便签操作管线 ====================

  const handleAddMemo = () => {
    const newMemo: MemoItem = {
      id: `memo-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: '',
      content: '',
      isPinned: false,
      theme: 'neutral',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setMemos((prev) => [newMemo, ...prev]);
  };

  const handleUpdateMemo = (id: string, updates: Partial<MemoItem>) => {
    setMemos((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates, updatedAt: Date.now() } : m))
    );
  };

  const handleDeleteMemo = (id: string) => {
    setMemos((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <div className="flex-1 flex h-full w-full overflow-hidden">
      {/* 左侧 58%：GTD 待办清单工作台 */}
      <div className="w-[58%] h-full flex flex-col min-w-0">
        <TasksPanel
          tasks={tasks}
          onAddTask={handleAddTask}
          onToggleStatus={handleToggleStatus}
          onCyclePriority={handleCyclePriority}
          onToggleToday={handleToggleToday}
          onDeleteTask={handleDeleteTask}
          onClearCompleted={handleClearCompleted}
        />
      </div>

      {/* 右侧 42%：灵感便签墙 */}
      <div className="w-[42%] h-full flex flex-col min-w-0">
        <MemoBoard
          memos={memos}
          onAddMemo={handleAddMemo}
          onUpdateMemo={handleUpdateMemo}
          onDeleteMemo={handleDeleteMemo}
        />
      </div>
    </div>
  );
};
