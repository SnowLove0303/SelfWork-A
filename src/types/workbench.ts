export type ModuleId = 'launcher' | 'tasks' | 'mindmap';

export interface ModuleItem {
  id: ModuleId;
  name: string;
  shortDesc: string;
  iconName: string;
  category: 'workspace' | 'knowledge' | 'system';
}

export interface WorkbenchKernelStatus {
  status: 'ready' | 'connecting' | 'fallback_web';
  version: string;
  osFamily: string;
  arch: string;
  latencyMs: number;
  serverTime: number;
}
