import React, { useState, useEffect } from 'react';
import { TaskItem, MemoItem, TaskPriority, TaskStatus } from '../types/tasks.ts';
import { INITIAL_TASKS, INITIAL_MEMOS } from './tasks/initialData.ts';
import { TasksPanel } from './tasks/TasksPanel.tsx';
import { MemoBoard } from './tasks/MemoBoard.tsx';
import {
  loadTasks,
  saveTasks,
  loadMemos,
  saveMemos,
  TASKS_STORAGE_KEY,
  MEMOS_STORAGE_KEY,
  TASKS_INIT_KEY,
  MEMOS_INIT_KEY,
} from '../services/db.ts';

export const TasksView: React.FC = () => {
  // 1. 初始化待办数据(优先本地同步缓存消除白屏与等待)
  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    try {
      const isInit = localStorage.getItem(TASKS_INIT_KEY);
      const saved = localStorage.getItem(TASKS_STORAGE_KEY);
      if (isInit === 'true' && saved !== null) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
      }
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

  // 2. 初始化便签数据(优先本地同步缓存消除白屏与等待)
  const [memos, setMemos] = useState<MemoItem[]>(() => {
    try {
      const isInit = localStorage.getItem(MEMOS_INIT_KEY);
      const saved = localStorage.getItem(MEMOS_STORAGE_KEY);
      if (isInit === 'true' && saved !== null) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
      }
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

  // 水合状态保护锁：只有底层 SQLite 数据加载完成后，才允许自动防抖持久化
  const [isHydrated, setIsHydrated] = useState(false);

  // 挂载时通过 SQLite 数据库权威水合(含历史数据自动平滑迁移)
  useEffect(() => {
    let isMounted = true;
    Promise.all([loadTasks(), loadMemos()]).then(([fetchedTasks, fetchedMemos]) => {
      if (isMounted) {
        setTasks(fetchedTasks);
        setMemos(fetchedMemos);
        setIsHydrated(true);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // 自动防抖持久化待办数据至 SQLite (300ms) - 仅在水合就绪后生效
  useEffect(() => {
    if (!isHydrated) return;
    const timer = setTimeout(() => {
      saveTasks(tasks);
    }, 300);
    return () => clearTimeout(timer);
  }, [tasks, isHydrated]);

  // 自动防抖持久化便签数据至 SQLite (300ms) - 仅在水合就绪后生效
  useEffect(() => {
    if (!isHydrated) return;
    const timer = setTimeout(() => {
      saveMemos(memos);
    }, 300);
    return () => clearTimeout(timer);
  }, [memos, isHydrated]);

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
    setTasks((prev) => {
      const next = [newTask, ...prev];
      saveTasks(next);
      return next;
    });
  };

  const handleToggleStatus = (id: string) => {
    setTasks((prev) => {
      const next: TaskItem[] = prev.map((t) => {
        if (t.id !== id) return t;
        const nextStatus: TaskStatus = t.status === 'done' ? 'todo' : 'done';
        return {
          ...t,
          status: nextStatus,
          completedAt: nextStatus === 'done' ? Date.now() : undefined,
        };
      });
      saveTasks(next);
      return next;
    });
  };

  const handleCyclePriority = (id: string) => {
    const cycleMap: Record<TaskPriority, TaskPriority> = {
      p1: 'p2',
      p2: 'p3',
      p3: 'p1',
    };
    setTasks((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, priority: cycleMap[t.priority] } : t));
      saveTasks(next);
      return next;
    });
  };

  const handleToggleToday = (id: string) => {
    setTasks((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, isToday: !t.isToday } : t));
      saveTasks(next);
      return next;
    });
  };

  // 即时原子提交：删除操作跳过防抖，直接同步物理落盘
  const handleDeleteTask = (id: string) => {
    setTasks((prev) => {
      const next = prev.filter((t) => t.id !== id);
      saveTasks(next);
      return next;
    });
  };

  // 即时原子提交：清空操作跳过防抖，直接同步物理落盘
  const handleClearCompleted = () => {
    setTasks((prev) => {
      const next = prev.filter((t) => t.status !== 'done');
      saveTasks(next);
      return next;
    });
  };

  // 拖拽换位管线：待办清单重排并原子落盘持久化
  const handleReorderTasks = (newTasks: TaskItem[]) => {
    setTasks(newTasks);
    saveTasks(newTasks);
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
    setMemos((prev) => {
      const next = [newMemo, ...prev];
      saveMemos(next);
      return next;
    });
  };

  const handleUpdateMemo = (id: string, updates: Partial<MemoItem>) => {
    setMemos((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates, updatedAt: Date.now() } : m))
    );
  };

  // 即时原子提交：删除便签跳过防抖，直接同步物理落盘
  const handleDeleteMemo = (id: string) => {
    setMemos((prev) => {
      const next = prev.filter((m) => m.id !== id);
      saveMemos(next);
      return next;
    });
  };

  // 拖拽换位管线：便签卡片重排并原子落盘持久化
  const handleReorderMemos = (newMemos: MemoItem[]) => {
    setMemos(newMemos);
    saveMemos(newMemos);
  };

  return (
    <div className="flex-1 flex h-full w-full overflow-hidden min-w-0">
      {/* 左侧 58%：GTD 待办清单工作台 (设置最小安全宽度 380px，支持弹性自适应伸缩) */}
      <div className="w-[58%] min-w-[380px] flex-1 h-full flex flex-col min-w-0">
        <TasksPanel
          tasks={tasks}
          onAddTask={handleAddTask}
          onToggleStatus={handleToggleStatus}
          onCyclePriority={handleCyclePriority}
          onToggleToday={handleToggleToday}
          onDeleteTask={handleDeleteTask}
          onClearCompleted={handleClearCompleted}
          onReorderTasks={handleReorderTasks}
        />
      </div>

      {/* 右侧 42%：灵感便签墙 (设置最小安全宽度 280px) */}
      <div className="w-[42%] min-w-[280px] h-full flex flex-col min-w-0">
        <MemoBoard
          memos={memos}
          onAddMemo={handleAddMemo}
          onUpdateMemo={handleUpdateMemo}
          onDeleteMemo={handleDeleteMemo}
          onReorderMemos={handleReorderMemos}
        />
      </div>
    </div>
  );
};
