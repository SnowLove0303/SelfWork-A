export type ModuleId =
  | 'launcher'
  | 'tasks'
  | 'notes'
  | 'mindmap'
  | 'mcp'
  | 'ai'
  | 'settings';

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
