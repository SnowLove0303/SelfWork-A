import { TaskItem, MemoItem } from '../../types/tasks.ts';

export const INITIAL_TASKS: TaskItem[] = [
  {
    id: 'task-init-1',
    title: '部署并巡检本地内核端口与服务集群',
    status: 'todo',
    priority: 'p1',
    isToday: true,
    createdAt: Date.now() - 3600000 * 3,
  },
  {
    id: 'task-init-2',
    title: '调优待办清单与便签双栏协同交互',
    status: 'in_progress',
    priority: 'p2',
    isToday: true,
    createdAt: Date.now() - 3600000 * 2,
  },
  {
    id: 'task-init-3',
    title: '验证离线单文件 EXE 封包与秒开响应',
    status: 'todo',
    priority: 'p3',
    isToday: false,
    createdAt: Date.now() - 3600000,
  },
  {
    id: 'task-init-4',
    title: '校准黑灰白极简材质与亚克力暗黑透视',
    status: 'done',
    priority: 'p2',
    isToday: false,
    createdAt: Date.now() - 3600000 * 5,
    completedAt: Date.now() - 1800000,
  },
];

export const INITIAL_MEMOS: MemoItem[] = [
  {
    id: 'memo-init-1',
    title: 'Local-First 架构准则',
    content: '全量数据安全持久化于本地存储，免外部服务依赖，随开随用，离线 100% 稳定运行。',
    isPinned: true,
    theme: 'blue',
    createdAt: Date.now() - 7200000,
    updatedAt: Date.now() - 7200000,
  },
  {
    id: 'memo-init-2',
    title: '极速操作技巧',
    content: '• 单行输入框按 Enter 键秒建待办\n• 点击左侧圆点循环切换优先级（红 / 黄 / 绿）\n• 便签卡片悬停可置顶、换色、复制与删除',
    isPinned: false,
    theme: 'neutral',
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now() - 3600000,
  },
  {
    id: 'memo-init-3',
    title: '常用编译指令',
    content: 'cargo test --manifest-path src-tauri/Cargo.toml\npnpm tauri build --no-bundle',
    isPinned: false,
    theme: 'emerald',
    createdAt: Date.now() - 1800000,
    updatedAt: Date.now() - 1800000,
  },
];
