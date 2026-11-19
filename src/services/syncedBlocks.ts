/**
 * 跨文档双向同步块服务 (SyncedBlockService)
 * - 管理全局 Sync ID 唯一内容仓库
 * - 在多篇文档中被引用时保持数据绝对一致
 */

export interface SyncedBlockData {
  syncId: string;
  content: string;
  title?: string;
  updatedAt: number;
}

const STORAGE_PREFIX = 'selfwork_synced_block_';
const INDEX_KEY = 'selfwork_synced_blocks_index';

function getIndex(): string[] {
  try {
    const raw = localStorage.getItem(INDEX_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveIndex(ids: string[]): void {
  try {
    localStorage.setItem(INDEX_KEY, JSON.stringify(Array.from(new Set(ids))));
  } catch {
    // 忽略异常
  }
}

/**
 * 生成简短优雅的 Sync ID (如 sync_abc123)
 */
export function generateSyncId(): string {
  const rand = Math.random().toString(36).substring(2, 8);
  const time = Date.now().toString(36).slice(-4);
  return `sync_${rand}${time}`;
}

/**
 * 根据 syncId 读取同步块数据
 */
export function getSyncedBlock(syncId: string): SyncedBlockData | null {
  if (!syncId) return null;
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${syncId}`);
    if (!raw) return null;
    return JSON.parse(raw) as SyncedBlockData;
  } catch {
    return null;
  }
}

/**
 * 保存或更新同步块数据，并同步更新全局索引
 */
export function saveSyncedBlock(
  syncId: string,
  content: string,
  title?: string
): SyncedBlockData {
  const data: SyncedBlockData = {
    syncId,
    content,
    title,
    updatedAt: Date.now(),
  };

  try {
    localStorage.setItem(`${STORAGE_PREFIX}${syncId}`, JSON.stringify(data));
    const index = getIndex();
    if (!index.includes(syncId)) {
      index.push(syncId);
      saveIndex(index);
    }
  } catch {
    // 忽略存储超限异常
  }

  return data;
}

/**
 * 获取系统中已创建的所有同步块摘要列表
 */
export function listAllSyncedBlocks(): SyncedBlockData[] {
  const index = getIndex();
  const list: SyncedBlockData[] = [];
  index.forEach((id) => {
    const item = getSyncedBlock(id);
    if (item) list.push(item);
  });
  return list.sort((a, b) => b.updatedAt - a.updatedAt);
}
