import { TaskItem, MemoItem } from '../types/tasks.ts';
import {
  AppearanceSettings,
  DEFAULT_APPEARANCE_SETTINGS,
} from '../types/settings.ts';
import { INITIAL_TASKS, INITIAL_MEMOS } from '../components/tasks/initialData.ts';
import { MindMapNode, INITIAL_MINDMAP } from '../types/mindmap.ts';

export const TASKS_STORAGE_KEY = 'selfwork_tasks_data';
export const MEMOS_STORAGE_KEY = 'selfwork_memos_data';
export const SETTINGS_STORAGE_KEY = 'selfwork_appearance_settings';
export const TASKS_INIT_KEY = 'selfwork_tasks_initialized';
export const MEMOS_INIT_KEY = 'selfwork_memos_initialized';
export const MINDMAP_STORAGE_KEY = 'selfwork_mindmap_data';
export const MINDMAP_INIT_KEY = 'selfwork_mindmap_initialized';

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
    const legacyRaw = localStorage.getItem(TASKS_STORAGE_KEY);
    const sqliteTasks = await tauriInvoke<TaskItem[]>('db_get_all_tasks');

    if (Array.isArray(sqliteTasks) && sqliteTasks.length > 0) {
      // 数据库中已有数据，直接固化初始化标记
      await tauriInvoke('db_set_setting', {
        key: 'tasks_initialized',
        value: 'true',
      });
      localStorage.setItem(TASKS_INIT_KEY, 'true');
      return sqliteTasks;
    }

    if (legacyRaw !== null) {
      // 历史缓存存在（说明用户此前已使用过，哪怕已被用户清空为 []）
      try {
        const legacyTasks = JSON.parse(legacyRaw);
        if (Array.isArray(legacyTasks) && legacyTasks.length > 0) {
          await saveTasks(legacyTasks);
          await tauriInvoke('db_set_setting', {
            key: 'tasks_initialized',
            value: 'true',
          });
          localStorage.setItem(TASKS_INIT_KEY, 'true');
          return legacyTasks;
        }
      } catch {
        // ignore
      }
      // 用户清空后的空态历史，直接锁定初始化标记并维持空态
      await tauriInvoke('db_set_setting', {
        key: 'tasks_initialized',
        value: 'true',
      });
      localStorage.setItem(TASKS_INIT_KEY, 'true');
      return [];
    }

    // 真正白纸首次安装：播种 INITIAL_TASKS 并永久锁定标记
    await saveTasks(INITIAL_TASKS);
    await tauriInvoke('db_set_setting', {
      key: 'tasks_initialized',
      value: 'true',
    });
    localStorage.setItem(TASKS_INIT_KEY, 'true');
    return INITIAL_TASKS;
  } catch (_err) {
    // Web 浏览器或桌面 IPC 异常降级
    try {
      const isInitWeb = localStorage.getItem(TASKS_INIT_KEY) === 'true';
      const saved = localStorage.getItem(TASKS_STORAGE_KEY);
      if (isInitWeb) {
        if (saved !== null) {
          const parsed = JSON.parse(saved);
          return Array.isArray(parsed) ? parsed : [];
        }
        return [];
      }
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          localStorage.setItem(TASKS_INIT_KEY, 'true');
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    localStorage.setItem(TASKS_INIT_KEY, 'true');
    return INITIAL_TASKS;
  }
}

/**
 * 权威持久化待办事项集合至 SQLite 物理数据库与本地缓存
 */
export async function saveTasks(tasks: TaskItem[]): Promise<void> {
  // 1. 同步更新本地快速读取缓存
  try {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  } catch (_e) {
    // ignore
  }

  // 2. 物理落盘至 SQLite 事务
  try {
    await tauriInvoke('db_save_all_tasks', { tasks });
  } catch (_err) {
    // ignore
  }
}

// ==================== 灵感便签 (Memos) 服务 ====================

/**
 * 加载全部灵感便签
 * 遵循与 loadTasks 严格一致的权威生命周期不变量
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

    const legacyRaw = localStorage.getItem(MEMOS_STORAGE_KEY);
    const sqliteMemos = await tauriInvoke<MemoItem[]>('db_get_all_memos');

    if (Array.isArray(sqliteMemos) && sqliteMemos.length > 0) {
      await tauriInvoke('db_set_setting', {
        key: 'memos_initialized',
        value: 'true',
      });
      localStorage.setItem(MEMOS_INIT_KEY, 'true');
      return sqliteMemos;
    }

    if (legacyRaw !== null) {
      try {
        const legacyMemos = JSON.parse(legacyRaw);
        if (Array.isArray(legacyMemos) && legacyMemos.length > 0) {
          await saveMemos(legacyMemos);
          await tauriInvoke('db_set_setting', {
            key: 'memos_initialized',
            value: 'true',
          });
          localStorage.setItem(MEMOS_INIT_KEY, 'true');
          return legacyMemos;
        }
      } catch {
        // ignore
      }
      await tauriInvoke('db_set_setting', {
        key: 'memos_initialized',
        value: 'true',
      });
      localStorage.setItem(MEMOS_INIT_KEY, 'true');
      return [];
    }

    // 真正白纸首次安装：播种 INITIAL_MEMOS 并永久锁定标记
    await saveMemos(INITIAL_MEMOS);
    await tauriInvoke('db_set_setting', {
      key: 'memos_initialized',
      value: 'true',
    });
    localStorage.setItem(MEMOS_INIT_KEY, 'true');
    return INITIAL_MEMOS;
  } catch (_err) {
    try {
      const isInitWeb = localStorage.getItem(MEMOS_INIT_KEY) === 'true';
      const saved = localStorage.getItem(MEMOS_STORAGE_KEY);
      if (isInitWeb) {
        if (saved !== null) {
          const parsed = JSON.parse(saved);
          return Array.isArray(parsed) ? parsed : [];
        }
        return [];
      }
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          localStorage.setItem(MEMOS_INIT_KEY, 'true');
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    localStorage.setItem(MEMOS_INIT_KEY, 'true');
    return INITIAL_MEMOS;
  }
}

/**
 * 权威持久化便签集合至 SQLite 物理数据库与本地缓存
 */
export async function saveMemos(memos: MemoItem[]): Promise<void> {
  try {
    localStorage.setItem(MEMOS_STORAGE_KEY, JSON.stringify(memos));
  } catch (_e) {
    // ignore
  }

  try {
    await tauriInvoke('db_save_all_memos', { memos });
  } catch (_err) {
    // ignore
  }
}

// ==================== 外观设置 (Appearance Settings) 服务 ====================

/**
 * 加载外观配置
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

    // 检查缓存
    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const merged = { ...DEFAULT_APPEARANCE_SETTINGS, ...parsed };
        await saveAppearanceSettings(merged);
        return merged;
      } catch {
        // ignore
      }
    }

    // 写入默认设置
    await saveAppearanceSettings(DEFAULT_APPEARANCE_SETTINGS);
    return DEFAULT_APPEARANCE_SETTINGS;
  } catch (_err) {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_APPEARANCE_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {
      // ignore
    }
    return DEFAULT_APPEARANCE_SETTINGS;
  }
}

/**
 * 持久化外观设置至 SQLite 物理数据库与本地缓存
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

// ==================== 思维导图 (MindMap) 服务 ====================

/**
 * 加载思维导图数据
 * 优先从 SQLite 读取，若未初始化则播种 INITIAL_MINDMAP，支持 localStorage 快速冷开
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
          await saveMindMap(parsed);
          return parsed as MindMapNode;
        }
      } catch {
        // ignore
      }
    }

    // 默认白纸首次初始化
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
 * 持久化思维导图数据至 SQLite 与本地缓存
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

// 统一语义别名导出
export const dbLoadTasks = loadTasks;
export const dbSaveTasks = saveTasks;
export const dbLoadMemos = loadMemos;
export const dbSaveMemos = saveMemos;
export const dbLoadSettings = loadAppearanceSettings;
export const dbSaveSettings = saveAppearanceSettings;
export const dbLoadMindMap = loadMindMap;
export const dbSaveMindMap = saveMindMap;
