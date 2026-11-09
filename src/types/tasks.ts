export type TaskPriority = 'p1' | 'p2' | 'p3'; // p1: 高 (红), p2: 中 (黄), p3: 低 (绿)
export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface TaskItem {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  isToday?: boolean;
  dueDate?: string; // YYYY-MM-DD
  createdAt: number; // Unix timestamp ms
  completedAt?: number;
}

export type MemoTheme = 'neutral' | 'blue' | 'emerald' | 'purple' | 'amber';

export interface MemoItem {
  id: string;
  title?: string;
  content: string;
  isPinned: boolean;
  theme: MemoTheme;
  createdAt: number;
  updatedAt: number;
}

export type TaskFilterTab = 'all' | 'today' | 'pending' | 'done';
