// ==================== 通用跨设备启动器数据契约 ====================

export type LauncherItemType = 'app' | 'script' | 'url' | 'folder';

export interface LauncherItem {
  id: string;
  categoryId: string;
  name: string;
  type: LauncherItemType;
  target: string; // 应用程序路径、文件夹路径、网址或脚本命令
  args?: string; // 启动参数 (可选)
  workingDir?: string; // 工作目录 (可选)
  description?: string; // 辅助说明 (可选)
  iconName?: string; // 图标名称 (可选)
  createdAt: number;
  updatedAt: number;
}

export interface LauncherCategory {
  id: string;
  name: string;
  description?: string;
  iconName?: string;
  createdAt: number;
  isDefault?: boolean;
}

export interface LauncherStorageData {
  categories: LauncherCategory[];
  items: LauncherItem[];
  activeCategoryId: string;
}

export const DEFAULT_LAUNCHER_CATEGORY_ID = 'cat-tools';

// 跨设备 100% 安全通用的 Windows 原生默认预设
export const INITIAL_LAUNCHER_STORAGE: LauncherStorageData = {
  categories: [
    {
      id: 'cat-tools',
      name: '系统常用工具',
      description: 'Windows 基础效率组件与终端',
      iconName: 'Boxes',
      createdAt: 1700000000000,
      isDefault: true,
    },
    {
      id: 'cat-web',
      name: '常用网页直达',
      description: '高效开发、搜索与协作站点',
      iconName: 'Globe',
      createdAt: 1700000001000,
    },
    {
      id: 'cat-scripts',
      name: '脚本与运维',
      description: '一键批处理与系统诊断指令',
      iconName: 'Terminal',
      createdAt: 1700000002000,
    },
  ],
  items: [
    {
      id: 'item-calc',
      categoryId: 'cat-tools',
      name: '计算器',
      type: 'app',
      target: 'calc.exe',
      description: 'Windows 快速数学运算工具',
      iconName: 'Cpu',
      createdAt: 1700000000000,
      updatedAt: 1700000000000,
    },
    {
      id: 'item-notepad',
      categoryId: 'cat-tools',
      name: '记事本',
      type: 'app',
      target: 'notepad.exe',
      description: '轻量文本草稿记录',
      iconName: 'Edit2',
      createdAt: 1700000000000,
      updatedAt: 1700000000000,
    },
    {
      id: 'item-cmd',
      categoryId: 'cat-tools',
      name: '命令提示符',
      type: 'app',
      target: 'cmd.exe',
      description: 'Windows 原生命令行控制台',
      iconName: 'Terminal',
      createdAt: 1700000000000,
      updatedAt: 1700000000000,
    },
    {
      id: 'item-github',
      categoryId: 'cat-web',
      name: 'GitHub',
      type: 'url',
      target: 'https://github.com',
      description: '代码托管与全球开源协同',
      iconName: 'Globe',
      createdAt: 1700000001000,
      updatedAt: 1700000001000,
    },
    {
      id: 'item-ping',
      categoryId: 'cat-scripts',
      name: '网络外网连通测试',
      type: 'script',
      target: 'Test-Connection -ComputerName 223.5.5.5 -Count 2 | Select-Object Address, ResponseTime',
      description: '测试阿里 DNS 节点延迟 (PowerShell)',
      iconName: 'Wifi',
      createdAt: 1700000002000,
      updatedAt: 1700000002000,
    },
    {
      id: 'item-sysinfo',
      categoryId: 'cat-scripts',
      name: '查看系统型号与内核',
      type: 'script',
      target: 'Get-CimInstance Win32_OperatingSystem | Select-Object Caption, Version, OSArchitecture',
      description: '获取本机 Windows 详细构建版本',
      iconName: 'Monitor',
      createdAt: 1700000002000,
      updatedAt: 1700000002000,
    },
  ],
  activeCategoryId: 'cat-tools',
};

// ==================== 向前兼容保留模型 ====================
export type ClusterId = string;
export type ServiceStatus = 'running' | 'stopped' | 'starting' | 'stopping' | 'error' | 'unknown';
export type TelemetryLogLevel = 'info' | 'success' | 'warn' | 'error';

export interface ServiceItemConfig {
  id: string;
  name: string;
  cluster: ClusterId;
  description: string;
  commandTarget: string;
  port?: number;
  url?: string;
  processNames?: string[];
  pids?: number[];
  status: ServiceStatus;
  iconName?: string;
}

export interface ClusterConfig {
  id: ClusterId;
  name: string;
  description: string;
  iconName: string;
  batchTarget: string;
  items: ServiceItemConfig[];
}

export interface SystemHealthSnapshot {
  ports: Record<number, boolean>;
  processes: Record<string, number[]>;
  duration_ms: number;
}

export interface TelemetryLogEntry {
  id: string;
  timestamp: string;
  target: string;
  level: TelemetryLogLevel;
  message: string;
}
