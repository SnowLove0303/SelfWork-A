export type ClusterId = 'apps' | 'ai-suite' | 'web' | 'lan' | 'feishu' | 'wsl';

export type ServiceStatus = 'running' | 'stopped' | 'starting' | 'stopping' | 'error' | 'unknown';

export interface ServiceItemConfig {
  id: string;
  name: string;
  cluster: ClusterId;
  description: string;
  commandTarget: string; // e.g. "apps", "dsh", "msds"
  port?: number;
  url?: string;
  processNames?: string[]; // e.g. ['weixin.exe', 'wechat.exe']
  pids?: number[]; // Detected active PIDs
  status: ServiceStatus;
  iconName?: string;
}

export interface HealthInspectionPayload {
  ports: number[];
  process_names: string[];
}

export interface SystemHealthSnapshot {
  ports: Record<number, boolean>;
  processes: Record<string, number[]>; // lowercase_name -> [PIDs]
  duration_ms: number;
}

export interface ClusterConfig {
  id: ClusterId;
  name: string;
  description: string;
  iconName: string;
  batchTarget: string;
  items: ServiceItemConfig[];
}

export type TelemetryLogLevel = 'info' | 'success' | 'warn' | 'error';

export interface TelemetryLogEntry {
  id: string;
  timestamp: string;
  target: string;
  level: TelemetryLogLevel;
  message: string;
}
