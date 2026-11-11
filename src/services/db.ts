import { TaskItem, MemoItem } from '../types/tasks.ts';
import {
  AppearanceSettings,
  DEFAULT_APPEARANCE_SETTINGS,
} from '../types/settings.ts';
import { INITIAL_TASKS, INITIAL_MEMOS } from '../components/tasks/initialData.ts';
import {
  MindMapNode,
  INITIAL_MINDMAP,
  MindMapPartition,
  MindMapDocument,
  MindMapStorageData,
  DEFAULT_PARTITION_ID,
} from '../types/mindmap.ts';
import {
  LauncherStorageData,
  INITIAL_LAUNCHER_STORAGE,
} from '../types/launcher.ts';

export const TASKS_STORAGE_KEY = 'selfwork_tasks_data';
export const MEMOS_STORAGE_KEY = 'selfwork_memos_data';
export const SETTINGS_STORAGE_KEY = 'selfwork_appearance_settings';
export const TASKS_INIT_KEY = 'selfwork_tasks_initialized';
export const MEMOS_INIT_KEY = 'selfwork_memos_initialized';
export const MINDMAP_STORAGE_KEY = 'selfwork_mindmap_data';
export const MINDMAP_INIT_KEY = 'selfwork_mindmap_initialized';
export const MINDMAP_STORAGE_KEY_V2 = 'selfwork_mindmap_storage_v2';
export const MINDMAP_STORAGE_SETTING_KEY_V2 = 'sw_mindmap_storage_v2';
export const LAUNCHER_STORAGE_KEY_V2 = 'selfwork_launcher_storage_v2';
export const LAUNCHER_STORAGE_SETTING_KEY_V2 = 'sw_launcher_storage_v2';

/**
 * 封装与 Tauri 原生 IPC 通信的底层调用器
 * 在非桌面环境下自动捕获并抛出，由上层优雅降级至浏览器 localStorage
 */
async function tauriInvoke<T>(
  cmd: string,
  args?: Record<string, unknown>,
): Promise<T> {
  const { invoke } = await import('@tauri-apps/api/core');
  return await invoke<T>(cmd, args);
}

// ==================== 待办事项 (Tasks) 服务 ====================

/**
 * 加载全部待办事项
 * 1. 优先检查生命周期初始化标记（tasks_initialized）；
 * 2. 若已初始化，SQLite 返回结果为最高法定事实（即便为空数组 []），绝不再重新播种 INITIAL_TASKS；
 * 3. 若未初始化（首开/历史升级），检查 localStorage 是否有历史记录：
 *    - 若存在历史数据（包括清空后的 []），视为已有使用记录，同步至 SQLite 并锁定初始化标记；
 *    - 仅在完全全新的白纸安装（无任何历史记录且 SQLite 为空）时，播种 INITIAL_TASKS 并锁定初始化标记；
 * 4. Web 降级环境同理。
 */
export async function loadTasks(): Promise<TaskItem[]> {
  try {
    const isInit = await tauriInvoke<string | null>('db_get_setting', {
      key: 'tasks_initialized',
    });

    if (isInit === 'true') {
      const sqliteTasks = await tauriInvoke<TaskItem[]>('db_get_all_tasks');
      return Array.isArray(sqliteTasks) ? sqliteTasks : [];
    }

    // 尚未显式设置 tasks_initialized 标记，检查是历史升级还是全新安装
    const localSaved = localStorage.getItem(TASKS_STORAGE_KEY);
    const localIsInit = localStorage.getItem(TASKS_INIT_KEY);

    if (localIsInit === 'true' && localSaved !== null) {
      try {
        const parsed = JSON.parse(localSaved);
        if (Array.isArray(parsed)) {
          await tauriInvoke('db_save_all_tasks', { tasks: parsed });
          await tauriInvoke('db_set_setting', {
            key: 'tasks_initialized',
            value: 'true',
          });
          return parsed;
        }
      } catch (_e) {
        // ignore
      }
    }

    // 全新安装白纸场景：播种初始数据
    await tauriInvoke('db_save_all_tasks', { tasks: INITIAL_TASKS });
    await tauriInvoke('db_set_setting', {
      key: 'tasks_initialized',
      value: 'true',
    });
    localStorage.setItem(TASKS_INIT_KEY, 'true');
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(INITIAL_TASKS));
    return INITIAL_TASKS;
  } catch (_err) {
    // Web 环境或 IPC 降级
    try {
      const localIsInit = localStorage.getItem(TASKS_INIT_KEY);
      const localSaved = localStorage.getItem(TASKS_STORAGE_KEY);

      if (localIsInit === 'true' && localSaved !== null) {
        const parsed = JSON.parse(localSaved);
        return Array.isArray(parsed) ? parsed : [];
      }

      localStorage.setItem(TASKS_INIT_KEY, 'true');
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(INITIAL_TASKS));
      return INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  }
}

/**
 * 持久化保存待办事项 (立即写 SQLite 与 localStorage)
 */
export async function saveTasks(tasks: TaskItem[]): Promise<void> {
  try {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    localStorage.setItem(TASKS_INIT_KEY, 'true');
  } catch (_e) {
    // ignore
  }

  try {
    await tauriInvoke('db_save_all_tasks', { tasks });
    await tauriInvoke('db_set_setting', {
      key: 'tasks_initialized',
      value: 'true',
    });
  } catch (_err) {
    // ignore
  }
}

// ==================== 便签 (Memos) 服务 ====================

/**
 * 加载全部便签
 */
export async function loadMemos(): Promise<MemoItem[]> {
  try {
    const isInit = await tauriInvoke<string | null>('db_get_setting', {
      key: 'memos_initialized',
    });

    if (isInit === 'true') {
      const sqliteMemos = await tauriInvoke<MemoItem[]>('db_get_all_memos');
      return Array.isArray(sqliteMemos) ? sqliteMemos : [];
    }

    const localSaved = localStorage.getItem(MEMOS_STORAGE_KEY);
    const localIsInit = localStorage.getItem(MEMOS_INIT_KEY);

    if (localIsInit === 'true' && localSaved !== null) {
      try {
        const parsed = JSON.parse(localSaved);
        if (Array.isArray(parsed)) {
          await tauriInvoke('db_save_all_memos', { memos: parsed });
          await tauriInvoke('db_set_setting', {
            key: 'memos_initialized',
            value: 'true',
          });
          return parsed;
        }
      } catch (_e) {
        // ignore
      }
    }

    // 全新安装白纸场景
    await tauriInvoke('db_save_all_memos', { memos: INITIAL_MEMOS });
    await tauriInvoke('db_set_setting', {
      key: 'memos_initialized',
      value: 'true',
    });
    localStorage.setItem(MEMOS_INIT_KEY, 'true');
    localStorage.setItem(MEMOS_STORAGE_KEY, JSON.stringify(INITIAL_MEMOS));
    return INITIAL_MEMOS;
  } catch (_err) {
    try {
      const localIsInit = localStorage.getItem(MEMOS_INIT_KEY);
      const localSaved = localStorage.getItem(MEMOS_STORAGE_KEY);

      if (localIsInit === 'true' && localSaved !== null) {
        const parsed = JSON.parse(localSaved);
        return Array.isArray(parsed) ? parsed : [];
      }

      localStorage.setItem(MEMOS_INIT_KEY, 'true');
      localStorage.setItem(MEMOS_STORAGE_KEY, JSON.stringify(INITIAL_MEMOS));
      return INITIAL_MEMOS;
    } catch {
      return INITIAL_MEMOS;
    }
  }
}

/**
 * 持久化保存便签
 */
export async function saveMemos(memos: MemoItem[]): Promise<void> {
  try {
    localStorage.setItem(MEMOS_STORAGE_KEY, JSON.stringify(memos));
    localStorage.setItem(MEMOS_INIT_KEY, 'true');
  } catch (_e) {
    // ignore
  }

  try {
    await tauriInvoke('db_save_all_memos', { memos });
    await tauriInvoke('db_set_setting', {
      key: 'memos_initialized',
      value: 'true',
    });
  } catch (_err) {
    // ignore
  }
}

// ==================== 外观设置 (Settings) 服务 ====================

/**
 * 加载个性化外观设置
 */
export async function loadAppearanceSettings(): Promise<AppearanceSettings> {
  try {
    const raw = await tauriInvoke<string | null>('db_get_setting', {
      key: 'appearance',
    });
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_APPEARANCE_SETTINGS, ...parsed };
    }
  } catch (_err) {
    // ignore
  }

  try {
    const cached = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      return { ...DEFAULT_APPEARANCE_SETTINGS, ...parsed };
    }
  } catch (_e) {
    // ignore
  }

  return DEFAULT_APPEARANCE_SETTINGS;
}

/**
 * 持久化保存个性化外观设置
 */
export async function saveAppearanceSettings(
  settings: AppearanceSettings,
): Promise<void> {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (_e) {
    // ignore
  }

  try {
    await tauriInvoke('db_set_setting', {
      key: 'appearance',
      value: JSON.stringify(settings),
    });
  } catch (_err) {
    // ignore
  }
}

// ==================== 思维导图多分区架构 (MindMap V2) 服务 ====================

export function createDefaultMindMapStorage(): MindMapStorageData {
  const defaultPartition: MindMapPartition = {
    id: DEFAULT_PARTITION_ID,
    name: '默认分区',
    createdAt: Date.now(),
    isDefault: true,
  };

  const initialDocument: MindMapDocument = {
    id: 'default-mindmap-doc-1',
    partitionId: DEFAULT_PARTITION_ID,
    title: '工作台核心架构导图',
    root: JSON.parse(JSON.stringify(INITIAL_MINDMAP)),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  return {
    partitions: [defaultPartition],
    documents: [initialDocument],
    activePartitionId: DEFAULT_PARTITION_ID,
    activeDocumentId: initialDocument.id,
  };
}

/**
 * 迁移单份导图旧数据为 V2 多分区多导图格式
 */
function migrateLegacyMindMap(legacyRoot: MindMapNode): MindMapStorageData {
  const base = createDefaultMindMapStorage();
  base.documents[0].title = legacyRoot.title || '我的思维导图';
  base.documents[0].root = legacyRoot;
  return base;
}

/**
 * 异步加载思维导图存储数据 (V2 多分区)
 */
export async function loadMindMapStorage(): Promise<MindMapStorageData> {
  try {
    const rawV2 = await tauriInvoke<string | null>('db_get_setting', {
      key: MINDMAP_STORAGE_SETTING_KEY_V2,
    });
    if (rawV2) {
      const parsed = JSON.parse(rawV2);
      if (
        parsed &&
        Array.isArray(parsed.partitions) &&
        Array.isArray(parsed.documents) &&
        parsed.partitions.length > 0
      ) {
        try {
          localStorage.setItem(MINDMAP_STORAGE_KEY_V2, rawV2);
        } catch (_e) {
          // ignore
        }
        return parsed as MindMapStorageData;
      }
    }
  } catch (_err) {
    // ignore
  }

  try {
    const cachedV2 = localStorage.getItem(MINDMAP_STORAGE_KEY_V2);
    if (cachedV2) {
      const parsed = JSON.parse(cachedV2);
      if (
        parsed &&
        Array.isArray(parsed.partitions) &&
        Array.isArray(parsed.documents) &&
        parsed.partitions.length > 0
      ) {
        saveMindMapStorage(parsed);
        return parsed as MindMapStorageData;
      }
    }
  } catch (_e) {
    // ignore
  }

  try {
    const legacyRaw = await tauriInvoke<string | null>('db_get_setting', {
      key: 'mindmap',
    });
    if (legacyRaw) {
      const legacyParsed = JSON.parse(legacyRaw);
      if (legacyParsed && typeof legacyParsed === 'object' && legacyParsed.id) {
        const migrated = migrateLegacyMindMap(legacyParsed as MindMapNode);
        await saveMindMapStorage(migrated);
        return migrated;
      }
    }
  } catch (_e) {
    // ignore
  }

  try {
    const cachedLegacy = localStorage.getItem(MINDMAP_STORAGE_KEY);
    if (cachedLegacy) {
      const legacyParsed = JSON.parse(cachedLegacy);
      if (legacyParsed && typeof legacyParsed === 'object' && legacyParsed.id) {
        const migrated = migrateLegacyMindMap(legacyParsed as MindMapNode);
        await saveMindMapStorage(migrated);
        return migrated;
      }
    }
  } catch (_e) {
    // ignore
  }

  const defaultStorage = createDefaultMindMapStorage();
  await saveMindMapStorage(defaultStorage);
  return defaultStorage;
}

/**
 * 异步保存思维导图存储数据 (V2 多分区)
 */
export async function saveMindMapStorage(
  storage: MindMapStorageData,
): Promise<void> {
  const json = JSON.stringify(storage);
  try {
    localStorage.setItem(MINDMAP_STORAGE_KEY_V2, json);
  } catch (_e) {
    // ignore
  }

  try {
    await tauriInvoke('db_set_setting', {
      key: MINDMAP_STORAGE_SETTING_KEY_V2,
      value: json,
    });
  } catch (_err) {
    // ignore
  }
}

/**
 * 加载思维导图数据（兼容旧版单一导图读取）
 */
export async function loadMindMap(): Promise<MindMapNode> {
  try {
    const raw = await tauriInvoke<string | null>('db_get_setting', {
      key: 'mindmap',
    });
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && parsed.id) {
        return parsed as MindMapNode;
      }
    }

    const cached = localStorage.getItem(MINDMAP_STORAGE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === 'object' && parsed.id) {
          await tauriInvoke('db_set_setting', {
            key: 'mindmap',
            value: cached,
          });
          return parsed as MindMapNode;
        }
      } catch {
        // ignore
      }
    }

    await saveMindMap(INITIAL_MINDMAP);
    return INITIAL_MINDMAP;
  } catch (_err) {
    try {
      const cached = localStorage.getItem(MINDMAP_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === 'object' && parsed.id) {
          return parsed as MindMapNode;
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_MINDMAP;
  }
}

/**
 * 持久化思维导图数据（兼容旧版单一导图写入）
 */
export async function saveMindMap(root: MindMapNode): Promise<void> {
  try {
    localStorage.setItem(MINDMAP_STORAGE_KEY, JSON.stringify(root));
  } catch (_e) {
    // ignore
  }

  try {
    await tauriInvoke('db_set_setting', {
      key: 'mindmap',
      value: JSON.stringify(root),
    });
  } catch (_err) {
    // ignore
  }
}

// ==================== 通用快速启动器 (Launcher V2) 服务 ====================

export function createDefaultLauncherStorage(): LauncherStorageData {
  return JSON.parse(JSON.stringify(INITIAL_LAUNCHER_STORAGE));
}

/**
 * 异步加载启动器存储数据 (优先 SQLite，降级 localStorage)
 */
export async function loadLauncherStorage(): Promise<LauncherStorageData> {
  try {
    const raw = await tauriInvoke<string | null>('db_get_setting', {
      key: LAUNCHER_STORAGE_SETTING_KEY_V2,
    });
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.categories) && Array.isArray(parsed.items)) {
        try {
          localStorage.setItem(LAUNCHER_STORAGE_KEY_V2, raw);
        } catch (_e) {
          // ignore
        }
        return parsed as LauncherStorageData;
      }
    }
  } catch (_err) {
    // ignore
  }

  try {
    const cached = localStorage.getItem(LAUNCHER_STORAGE_KEY_V2);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && Array.isArray(parsed.categories) && Array.isArray(parsed.items)) {
        saveLauncherStorage(parsed);
        return parsed as LauncherStorageData;
      }
    }
  } catch (_e) {
    // ignore
  }

  const defaultStorage = createDefaultLauncherStorage();
  await saveLauncherStorage(defaultStorage);
  return defaultStorage;
}

/**
 * 异步持久化启动器存储数据 (双写缓存与 SQLite)
 */
export async function saveLauncherStorage(data: LauncherStorageData): Promise<void> {
  const json = JSON.stringify(data);
  try {
    localStorage.setItem(LAUNCHER_STORAGE_KEY_V2, json);
  } catch (_e) {
    // ignore
  }

  try {
    await tauriInvoke('db_set_setting', {
      key: LAUNCHER_STORAGE_SETTING_KEY_V2,
      value: json,
    });
  } catch (_err) {
    // ignore
  }
}

// 统一语义别名导出
export const dbLoadTasks = loadTasks;
export const dbSaveTasks = saveTasks;
export const dbLoadMemos = loadMemos;
export const dbSaveMemos = saveMemos;
export const dbLoadSettings = loadAppearanceSettings;
export const dbSaveSettings = saveAppearanceSettings;
export const dbLoadMindMap = loadMindMap;
export const dbSaveMindMap = saveMindMap;
export const dbLoadMindMapStorage = loadMindMapStorage;
export const dbSaveMindMapStorage = saveMindMapStorage;
export const dbLoadLauncherStorage = loadLauncherStorage;
export const dbSaveLauncherStorage = saveLauncherStorage;
