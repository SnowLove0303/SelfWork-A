import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Rocket,
  Plus,
  Search,
  Trash2,
  Edit2,
  Play,
  FolderPlus,
  Folder,
  FolderOpen,
  Terminal,
  Globe,
  Cpu,
  X,
  Check,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Zap,
  CheckSquare,
  Layers,
  Monitor,
  LayoutGrid,
  Columns,
  Rows,
  AppWindow,
  Square,
  Loader2,
  Activity,
} from 'lucide-react';
import {
  LauncherItem,
  LauncherCategory,
  LauncherStorageData,
  LauncherItemType,
  DEFAULT_LAUNCHER_CATEGORY_ID,
  TelemetryLogEntry,
  TelemetryLogLevel,
  WindowTilingLayout,
  WindowSlotConfig,
  WindowLayoutConfig,
  SystemMonitorInfo,
} from '../types/launcher.ts';
import { TelemetryPanel } from './launcher/TelemetryPanel.tsx';
import { ProcessManifestModal } from './launcher/ProcessManifestModal.tsx';
import {
  loadLauncherStorage,
  saveLauncherStorage,
  createDefaultLauncherStorage,
  LAUNCHER_STORAGE_KEY_V2,
} from '../services/db.ts';

// 格式化当前时间为 HH:mm:ss.SSS
function formatTimestamp(): string {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  const ms = String(now.getMilliseconds()).padStart(3, '0');
  return `${hh}:${mm}:${ss}.${ms}`;
}

// 渲染启动项类型专属小徽章
function renderTypeBadge(type: LauncherItemType) {
  switch (type) {
    case 'bundle':
      return {
        label: '组合',
        className: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
        Icon: Layers,
      };
    case 'app':
      return {
        label: '应用',
        className: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
        Icon: Cpu,
      };
    case 'script':
      return {
        label: '脚本',
        className: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
        Icon: Terminal,
      };
    case 'url':
      return {
        label: '网页',
        className: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        Icon: Globe,
      };
    case 'folder':
    default:
      return {
        label: '目录',
        className: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
        Icon: FolderOpen,
      };
  }
}

// ==================== 屏幕分屏布局预设契约 (Window Snap Tiling Presets) ====================

interface LayoutPresetDef {
  id: WindowTilingLayout;
  name: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  slots: { slotId: string; name: string; xRatio: number; yRatio: number; wRatio: number; hRatio: number }[];
}

const LAYOUT_PRESETS: LayoutPresetDef[] = [
  {
    id: 'grid-4',
    name: '田字四分屏',
    desc: '2×2 铺满 (适合4个窗口)',
    icon: LayoutGrid,
    slots: [
      { slotId: 'slot-tl', name: '左上象限 (Top-Left)', xRatio: 0, yRatio: 0, wRatio: 0.5, hRatio: 0.5 },
      { slotId: 'slot-tr', name: '右上象限 (Top-Right)', xRatio: 0.5, yRatio: 0, wRatio: 0.5, hRatio: 0.5 },
      { slotId: 'slot-bl', name: '左下象限 (Bottom-Left)', xRatio: 0, yRatio: 0.5, wRatio: 0.5, hRatio: 0.5 },
      { slotId: 'slot-br', name: '右下象限 (Bottom-Right)', xRatio: 0.5, yRatio: 0.5, wRatio: 0.5, hRatio: 0.5 },
    ],
  },
  {
    id: 'split-h',
    name: '左右双分屏',
    desc: '左右 1:1 对等排布',
    icon: Columns,
    slots: [
      { slotId: 'slot-l', name: '左半屏 (Left)', xRatio: 0, yRatio: 0, wRatio: 0.5, hRatio: 1.0 },
      { slotId: 'slot-r', name: '右半屏 (Right)', xRatio: 0.5, yRatio: 0, wRatio: 0.5, hRatio: 1.0 },
    ],
  },
  {
    id: 'split-v',
    name: '上下双分屏',
    desc: '上下 1:1 对等排布',
    icon: Rows,
    slots: [
      { slotId: 'slot-t', name: '上半屏 (Top)', xRatio: 0, yRatio: 0, wRatio: 1.0, hRatio: 0.5 },
      { slotId: 'slot-b', name: '下半屏 (Bottom)', xRatio: 0, yRatio: 0.5, wRatio: 1.0, hRatio: 0.5 },
    ],
  },
  {
    id: 'main-aside-3',
    name: '主辅三分屏',
    desc: '左主 60% / 右辅上下 40%',
    icon: Monitor,
    slots: [
      { slotId: 'slot-m', name: '左侧主屏 (60%)', xRatio: 0, yRatio: 0, wRatio: 0.6, hRatio: 1.0 },
      { slotId: 'slot-at', name: '右上辅屏', xRatio: 0.6, yRatio: 0, wRatio: 0.4, hRatio: 0.5 },
      { slotId: 'slot-ab', name: '右下辅屏', xRatio: 0.6, yRatio: 0.5, wRatio: 0.4, hRatio: 0.5 },
    ],
  },
];

export const LauncherDashboard: React.FC = () => {
  // 1. 本地快速缓存优先秒开
  const [storage, setStorage] = useState<LauncherStorageData>(() => {
    try {
      const cached = localStorage.getItem(LAUNCHER_STORAGE_KEY_V2);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && Array.isArray(parsed.categories) && Array.isArray(parsed.items)) {
          return parsed as LauncherStorageData;
        }
      }
    } catch {
      // ignore
    }
    return createDefaultLauncherStorage();
  });

  const [activeCategoryId, setActiveCategoryId] = useState<string>(
    storage.activeCategoryId || DEFAULT_LAUNCHER_CATEGORY_ID
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isHydrated, setIsHydrated] = useState(false);

  // 即时自由多选批量启动状态
  const [isSelectMode, setIsSelectMode] = useState<boolean>(false);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

  // 分区创建与重命名状态
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [renamingCategoryId, setRenamingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');

  // 启动项创建与编辑弹窗状态
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LauncherItem | null>(null);
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<LauncherItemType>('app');
  const [formTarget, setFormTarget] = useState('');
  const [formArgs, setFormArgs] = useState('');
  const [formWorkingDir, setFormWorkingDir] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategoryId, setFormCategoryId] = useState(activeCategoryId);
  const [formBundleItemIds, setFormBundleItemIds] = useState<string[]>([]);

  // 组合专属创建与编辑模态框状态
  const [isComboModalOpen, setIsComboModalOpen] = useState(false);
  const [editingComboItem, setEditingComboItem] = useState<LauncherItem | null>(null);
  const [comboFormName, setComboFormName] = useState('');
  const [comboFormCategoryId, setComboFormCategoryId] = useState(activeCategoryId);
  const [comboFormItemIds, setComboFormItemIds] = useState<string[]>([]);
  const [comboItemSearch, setComboItemSearch] = useState('');

  // 屏幕分屏布局编排状态 (Window Snap Tiling)
  const [comboLayoutEnabled, setComboLayoutEnabled] = useState(false);
  const [comboLayoutType, setComboLayoutType] = useState<WindowTilingLayout>('grid-4');
  const [comboSlotAssignments, setComboSlotAssignments] = useState<Record<string, string>>({});
  const [comboTargetMonitorIndex, setComboTargetMonitorIndex] = useState<number>(0);

  // 系统多屏幕感知与多选定向投放状态 (Multi-Monitor Detection)
  const [systemMonitors, setSystemMonitors] = useState<SystemMonitorInfo[]>([]);
  const [multiSelectMonitorIndex, setMultiSelectMonitorIndex] = useState<number>(0);

  // 辅助函数：根据选定布局自动依序分配槽位
  const autoAssignSlots = useCallback((layoutType: WindowTilingLayout, itemIds: string[]) => {
    const preset = LAYOUT_PRESETS.find((p) => p.id === layoutType) || LAYOUT_PRESETS[0];
    const assignments: Record<string, string> = {};
    preset.slots.forEach((slot, idx) => {
      assignments[slot.slotId] = itemIds[idx] || '';
    });
    return assignments;
  }, []);

  // 卡片操作菜单与执行状态反馈
  // 进程运行状态数据契约 (REQ-1 ~ REQ-5)
interface LauncherProcessStatus {
  id: string;
  is_running: boolean;
  pids: number[];
  instance_count: number;
}

  // 卡片操作菜单与执行状态反馈
  const [activeMenuDocId, setActiveMenuDocId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [runningItemIds, setRunningItemIds] = useState<Record<string, boolean>>({});
  const [processStatusMap, setProcessStatusMap] = useState<Record<string, LauncherProcessStatus>>({});
  const [terminatingItemIds, setTerminatingItemIds] = useState<Record<string, boolean>>({});
  const [isManifestOpen, setIsManifestOpen] = useState<boolean>(false);
  const [isTerminatingAll, setIsTerminatingAll] = useState<boolean>(false);

  // 执行报文终端控制台状态 (REQ-01 & REQ-02)
  const [isTelemetryOpen, setIsTelemetryOpen] = useState<boolean>(false);
  const [logs, setLogs] = useState<TelemetryLogEntry[]>([
    {
      id: 'init-1',
      timestamp: formatTimestamp(),
      target: '系统',
      level: 'info',
      message: '快速启动执行报文终端已就绪，实时指令响应与脚本输出将在此呈现...',
    },
  ]);
  const logCounterRef = useRef<number>(2);

  // 追加结构化报文
  const appendLog = useCallback((target: string, level: TelemetryLogLevel, message: string) => {
    const entry: TelemetryLogEntry = {
      id: `log-${Date.now()}-${logCounterRef.current++}`,
      timestamp: formatTimestamp(),
      target,
      level,
      message,
    };
    setLogs((prev) => [...prev, entry]);
  }, []);

  // 清空报文
  const handleClearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  // 从 SQLite 异步水合加载
  useEffect(() => {
    let isMounted = true;
    loadLauncherStorage().then((loaded) => {
      if (isMounted) {
        setStorage(loaded);
        setActiveCategoryId(loaded.activeCategoryId || DEFAULT_LAUNCHER_CATEGORY_ID);
        setIsHydrated(true);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // 实时探测系统物理多显示器拓扑 (REQ-MULTIMONITOR-01)
  useEffect(() => {
    let isMounted = true;
    const fetchMonitors = async () => {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        const list = await invoke<SystemMonitorInfo[]>('get_system_monitors');
        if (isMounted && list && list.length > 0) {
          setSystemMonitors(list);
          const primaryIdx = list.findIndex((m) => m.isPrimary);
          if (primaryIdx >= 0) {
            setMultiSelectMonitorIndex(primaryIdx);
            setComboTargetMonitorIndex(primaryIdx);
          }
        }
      } catch {
        // Tauri 环境未就绪
      }
    };
    fetchMonitors();
    return () => {
      isMounted = false;
    };
  }, []);

  // 自动防抖持久化 (300ms)
  useEffect(() => {
    if (!isHydrated) return;
    const timer = setTimeout(() => {
      saveLauncherStorage({
        ...storage,
        activeCategoryId,
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [storage, activeCategoryId, isHydrated]);

  // 自动为未缓存图标的本地 app 项异步提取原生高清图标并就地持久化
  useEffect(() => {
    let isMounted = true;
    const itemsNeedingIcon = storage.items.filter(
      (item) => item.type === 'app' && !item.icon && item.target.trim()
    );
    if (itemsNeedingIcon.length === 0) return;

    const fetchIcons = async () => {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        const iconUpdates: Record<string, string> = {};

        for (const item of itemsNeedingIcon) {
          try {
            const iconDataUrl = await invoke<string>('get_app_icon', {
              target: item.target,
            });
            if (iconDataUrl && iconDataUrl.startsWith('data:image/')) {
              iconUpdates[item.id] = iconDataUrl;
            }
          } catch {
            // 文件不存在或暂不可提取
          }
        }

        if (isMounted && Object.keys(iconUpdates).length > 0) {
          setStorage((prev) => ({
            ...prev,
            items: prev.items.map((it) =>
              iconUpdates[it.id] ? { ...it, icon: iconUpdates[it.id] } : it
            ),
          }));
        }
      } catch {
        // Tauri 环境未就绪
      }
    };

    fetchIcons();
    return () => {
      isMounted = false;
    };
  }, [storage.items]);

  // 自动淡出提示消息 (3.5秒)
  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 3500);
    return () => clearTimeout(timer);
  }, [feedback]);

  // 计算每个分类包含的项目总数
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of storage.categories) {
      counts[c.id] = 0;
    }
    for (const item of storage.items) {
      if (counts[item.categoryId] !== undefined) {
        counts[item.categoryId] += 1;
      }
    }
    return counts;
  }, [storage.categories, storage.items]);

  // 当前激活的分类对象
  const activeCategory = useMemo(() => {
    return (
      storage.categories.find((c) => c.id === activeCategoryId) ||
      storage.categories[0]
    );
  }, [storage.categories, activeCategoryId]);

  // 过滤当前展示的启动项列表
  const currentItems = useMemo(() => {
    return storage.items
      .filter((item) => item.categoryId === activeCategoryId)
      .filter((item) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.target.toLowerCase().includes(q) ||
          (item.description && item.description.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [storage.items, activeCategoryId, searchQuery]);

  // 派生分屏组合套件列表与常规单品列表 (单拎显示重构)
  const comboSuites = useMemo(() => {
    return currentItems.filter((item) => item.type === 'bundle');
  }, [currentItems]);

  const standardItems = useMemo(() => {
    return currentItems.filter((item) => item.type !== 'bundle');
  }, [currentItems]);

  // 可用于组成 Bundle 套件的全部候选子项 (排除 bundle 自身以防死循环)
  const candidateBundleItems = useMemo(() => {
    return storage.items.filter(
      (item) => item.type !== 'bundle' && item.id !== editingItem?.id
    );
  }, [storage.items, editingItem]);

  // 可用于组成 Combo 组合的全部基础项 (排除 bundle 自身以防死循环)
  const candidateComboItems = useMemo(() => {
    return storage.items.filter(
      (item) => item.type !== 'bundle' && item.id !== editingComboItem?.id
    );
  }, [storage.items, editingComboItem]);

  // 候选项目带搜索过滤
  const filteredCandidateComboItems = useMemo(() => {
    if (!comboItemSearch.trim()) return candidateComboItems;
    const q = comboItemSearch.toLowerCase();
    return candidateComboItems.filter(
      (item) => item.name.toLowerCase().includes(q) || item.target.toLowerCase().includes(q)
    );
  }, [candidateComboItems, comboItemSearch]);

  // ==================== 启动调度核心逻辑 ====================

  const handleLaunchItem = useCallback(
    async (item: LauncherItem): Promise<boolean> => {
      setRunningItemIds((prev) => ({ ...prev, [item.id]: true }));
      const t0 = performance.now();
      try {
        const { invoke } = await import('@tauri-apps/api/core');

        // 1. 如果是 Bundle 复合套件：依次唤起绑定的全部子项
        if (item.type === 'bundle') {
          const subItemIds = item.bundleItemIds || [];
          const subItems = storage.items.filter((it) => subItemIds.includes(it.id));
          if (subItems.length === 0) {
            appendLog(item.name, 'error', `组合【${item.name}】尚未配置或未找到关联子项`);
            setFeedback({
              type: 'error',
              message: `【${item.name}】组合尚未配置或未找到关联子项`,
            });
            return false;
          }

          appendLog(
            item.name,
            'info',
            `正在启动组合【${item.name}】共 ${subItems.length} 个项目: ${subItems.map((s) => s.name).join(', ')}...`
          );
          setFeedback({
            type: 'success',
            message: `正在启动【${item.name}】组合共 ${subItems.length} 个项目: ${subItems.map((s) => s.name).join(', ')}...`,
          });

          for (let i = 0; i < subItems.length; i++) {
            const sub = subItems[i];
            await handleLaunchItem(sub);
            if (i < subItems.length - 1) {
              await new Promise((r) => setTimeout(r, 150));
            }
          }

          // 如果该组合启用了屏幕窗口分屏编排，执行精确象限停靠
          if (item.windowLayout?.enabled && item.windowLayout.slots && item.windowLayout.slots.length > 0) {
            appendLog(
              item.name,
              'info',
              `正在对【${item.name}】进行屏幕分屏编排 (${item.windowLayout.layout})...`
            );
            // 短暂延时 350ms 确保各子窗口进程和 Explorer 句柄已被系统就绪创建
            await new Promise((r) => setTimeout(r, 350));
            const specs = item.windowLayout.slots
              .map((slot) => {
                const targetItem = subItems.find((s) => s.id === slot.targetItemId);
                if (!targetItem) return null;
                return {
                  item_id: targetItem.id,
                  item_name: targetItem.name,
                  target: targetItem.target,
                  x_ratio: slot.xRatio,
                  y_ratio: slot.yRatio,
                  w_ratio: slot.wRatio,
                  h_ratio: slot.hRatio,
                };
              })
              .filter(Boolean);

            if (specs.length > 0) {
              try {
                const targetMon = systemMonitors.find(
                  (m) => m.index === item.windowLayout?.targetMonitorIndex
                );
                const monDesc = targetMon ? targetMon.name : '主显示器';
                const placedCount = await invoke<number>('arrange_combo_windows', {
                  specs,
                  targetMonitorIndex: item.windowLayout?.targetMonitorIndex,
                });
                appendLog(
                  item.name,
                  'success',
                  `屏幕窗口编排完成: 成功停靠 ${placedCount}/${specs.length} 个窗口至 ${monDesc}`
                );
              } catch (layoutErr: any) {
                appendLog(item.name, 'warn', `窗口编排提示: ${layoutErr?.message || layoutErr}`);
              }
            }
          }

          const duration = Math.round(performance.now() - t0);
          appendLog(
            item.name,
            'success',
            `【${item.name}】组合已全部唤起成功 (共 ${subItems.length} 项，总耗时 ${duration}ms)`
          );
          setFeedback({
            type: 'success',
            message: `【${item.name}】组合已全部唤起成功 (共 ${subItems.length} 项)`,
          });
          return true;
        }

        // 2. 如果是脚本
        if (item.type === 'script') {
          const unquotedTarget = item.target.trim().replace(/^"(.*)"$/, '$1').trim();
          const lowerTarget = unquotedTarget.toLowerCase();
          const isBatOrCmd = lowerTarget.endsWith('.bat') || lowerTarget.endsWith('.cmd');
          const isPs1File = lowerTarget.endsWith('.ps1');
          const scriptType = isBatOrCmd ? 'bat' : 'powershell';
          const effectiveWorkingDir =
            item.workingDir?.trim() ||
            (isBatOrCmd || isPs1File
              ? unquotedTarget.replace(/[\\/][^\\/]+$/, '')
              : undefined);

          appendLog(
            item.name,
            'info',
            `下发 ${isBatOrCmd ? 'CMD 批处理' : 'PowerShell'} 脚本指令:\n${unquotedTarget}${effectiveWorkingDir ? `\n[工作目录]: ${effectiveWorkingDir}` : ''}`
          );

          const output = await invoke<string>('execute_custom_script', {
            scriptType,
            scriptContent: unquotedTarget,
            workingDir: effectiveWorkingDir || undefined,
          });

          const duration = Math.round(performance.now() - t0);
          appendLog(
            item.name,
            'success',
            `脚本执行成功 (耗时 ${duration}ms):\n${output}`
          );
          setFeedback({
            type: 'success',
            message: `脚本执行成功: ${item.name}`,
          });
          return true;
        }

        // 3. 应用程序、快捷方式、网页或目录
        appendLog(
          item.name,
          'info',
          `下发启动目标: ${item.target}${item.args ? ` [参数]: ${item.args}` : ''}`
        );
        await invoke<string>('launch_custom_target', {
          target: item.target,
          args: item.args || undefined,
          workingDir: item.workingDir || undefined,
        });

        const duration = Math.round(performance.now() - t0);
        const actionVerb = item.type === 'folder' ? '打开文件夹' : '拉起';
        appendLog(
          item.name,
          'success',
          `已成功${actionVerb}: ${item.name} (耗时 ${duration}ms)`
        );
        setFeedback({
          type: 'success',
          message: `已成功${actionVerb}: ${item.name}`,
        });
        return true;
      } catch (err: unknown) {
        const duration = Math.round(performance.now() - t0);
        const errMsg = err instanceof Error ? err.message : String(err);
        appendLog(
          item.name,
          'error',
          `启动失败 (耗时 ${duration}ms):\n${errMsg}`
        );
        setFeedback({
          type: 'error',
          message: `启动失败: ${errMsg}`,
        });
        return false;
      } finally {
        setRunningItemIds((prev) => ({ ...prev, [item.id]: false }));
        setTimeout(() => {
          refreshProcessStatus();
        }, 800);
      }
    },
    [storage.items, appendLog]
  );

  // 快速启动项实时后台进程快照巡检
  const refreshProcessStatus = useCallback(async () => {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      const targets = storage.items
        .filter((it) => it.type === 'app' && it.target.trim())
        .map((it) => ({
          id: it.id,
          target: it.target,
          item_type: it.type,
        }));

      if (targets.length === 0) {
        setProcessStatusMap({});
        return;
      }

      const statusMap = await invoke<Record<string, LauncherProcessStatus>>(
        'detect_launcher_processes',
        { items: targets }
      );
      setProcessStatusMap(statusMap || {});
    } catch (err) {
      console.warn('Process detection cycle failed:', err);
    }
  }, [storage.items]);

  // 前台聚焦低功耗轻量节流轮询 (2.5s)
  useEffect(() => {
    refreshProcessStatus();
    const interval = setInterval(() => {
      if (!document.hidden) {
        refreshProcessStatus();
      }
    }, 2500);

    const handleFocus = () => {
      refreshProcessStatus();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [refreshProcessStatus]);

  // 终止单项进程
  const handleTerminateProcess = useCallback(
    async (item: LauncherItem, e?: React.MouseEvent) => {
      if (e) {
        e.stopPropagation();
      }
      const status = processStatusMap[item.id];
      if (!status || !status.is_running || status.pids.length === 0) {
        return;
      }

      setTerminatingItemIds((prev) => ({ ...prev, [item.id]: true }));
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        const count = await invoke<number>('terminate_launcher_processes', {
          pids: status.pids,
        });
        appendLog(item.name, 'warn', `已安全终止进程 (共关闭 ${count} 个实例)`);
        setFeedback({
          type: 'success',
          message: `已关闭【${item.name}】(${count} 个进程实例)`,
        });
        setTimeout(refreshProcessStatus, 300);
      } catch (err: any) {
        appendLog(item.name, 'error', `终止进程失败: ${err?.message || err}`);
        setFeedback({
          type: 'error',
          message: `关闭失败: ${err?.message || err}`,
        });
      } finally {
        setTerminatingItemIds((prev) => ({ ...prev, [item.id]: false }));
      }
    },
    [processStatusMap, appendLog, refreshProcessStatus]
  );

  // 终止组合套件关联的所有进程
  const handleTerminateComboSuite = useCallback(
    async (combo: LauncherItem, e?: React.MouseEvent) => {
      if (e) {
        e.stopPropagation();
      }
      const subItemIds = combo.bundleItemIds || [];
      const pidsToKill: number[] = [];
      for (const subId of subItemIds) {
        const st = processStatusMap[subId];
        if (st && st.is_running) {
          pidsToKill.push(...st.pids);
        }
      }

      if (pidsToKill.length === 0) {
        return;
      }

      setTerminatingItemIds((prev) => ({ ...prev, [combo.id]: true }));
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        const count = await invoke<number>('terminate_launcher_processes', {
          pids: pidsToKill,
        });
        appendLog(combo.name, 'warn', `已批量终止组合套件关联进程 (共关闭 ${count} 个实例)`);
        setFeedback({
          type: 'success',
          message: `已关闭组合套件【${combo.name}】涉及的 ${count} 个进程`,
        });
        setTimeout(refreshProcessStatus, 300);
      } catch (err: any) {
        appendLog(combo.name, 'error', `终止组合进程失败: ${err?.message || err}`);
        setFeedback({
          type: 'error',
          message: `关闭组合失败: ${err?.message || err}`,
        });
      } finally {
        setTerminatingItemIds((prev) => ({ ...prev, [combo.id]: false }));
      }
    },
    [processStatusMap, appendLog, refreshProcessStatus]
  );

  // 一键全部关闭所有正在运行的白名单启动项进程
  const handleTerminateAllProcesses = useCallback(async () => {
    const pidSet = new Set<number>();
    for (const st of Object.values(processStatusMap)) {
      if (st?.is_running) {
        for (const pid of st.pids) {
          pidSet.add(pid);
        }
      }
    }
    const allPids = Array.from(pidSet);
    if (allPids.length === 0) return;

    setIsTerminatingAll(true);
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      const count = await invoke<number>('terminate_launcher_processes', {
        pids: allPids,
      });
      appendLog('进程清单', 'warn', `已执行一键全部关闭，共安全终止 ${count} 个白名单进程实例`);
      setFeedback({
        type: 'success',
        message: `已一键关闭全部快速启动进程（共终止 ${count} 个实例）`,
      });
      setTimeout(refreshProcessStatus, 300);
    } catch (err: any) {
      appendLog('进程清单', 'error', `一键全部关闭失败: ${err?.message || err}`);
      setFeedback({
        type: 'error',
        message: `一键全部关闭失败: ${err?.message || err}`,
      });
    } finally {
      setIsTerminatingAll(false);
    }
  }, [processStatusMap, appendLog, refreshProcessStatus]);

  // 精确终止多开应用中的单个指定 PID
  const handleTerminateSinglePid = useCallback(
    async (item: LauncherItem, pid: number) => {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        const count = await invoke<number>('terminate_launcher_processes', {
          pids: [pid],
        });
        appendLog(item.name, 'warn', `已精确终止单个实例 PID=${pid} (关闭数=${count})`);
        setFeedback({
          type: 'success',
          message: `已关闭【${item.name}】实例 (PID: ${pid})`,
        });
        setTimeout(refreshProcessStatus, 300);
      } catch (err: any) {
        appendLog(item.name, 'error', `终止 PID=${pid} 失败: ${err?.message || err}`);
        setFeedback({
          type: 'error',
          message: `关闭 PID ${pid} 失败: ${err?.message || err}`,
        });
      }
    },
    [appendLog, refreshProcessStatus]
  );

  // 计算全局运行中的纳入应用总数
  const totalRunningAppsCount = useMemo(() => {
    return storage.items.filter(
      (it) => it.type === 'app' && processStatusMap[it.id]?.is_running
    ).length;
  }, [storage.items, processStatusMap]);

  // 一键全启动 (当前分类全部项目)
  const handleBatchLaunchAll = useCallback(async () => {
    if (currentItems.length === 0) return;
    appendLog(
      activeCategory.name,
      'info',
      `正在一键唤起【${activeCategory.name}】分类下全部 ${currentItems.length} 个项目...`
    );
    setFeedback({
      type: 'success',
      message: `正在一键唤起【${activeCategory.name}】分类下全部 ${currentItems.length} 个项目...`,
    });
    for (const item of currentItems) {
      await handleLaunchItem(item);
      await new Promise((r) => setTimeout(r, 150));
    }
    appendLog(
      activeCategory.name,
      'success',
      `【${activeCategory.name}】分类下 ${currentItems.length} 个项目批次调度完成`
    );
  }, [currentItems, activeCategory, handleLaunchItem, appendLog]);

  // 启动多选模式下勾选的所选项
  const handleLaunchSelected = useCallback(async () => {
    const selectedItems = currentItems.filter((i) => selectedItemIds.includes(i.id));
    if (selectedItems.length === 0) return;
    appendLog(
      '多选启动',
      'info',
      `正在启动勾选的 ${selectedItems.length} 个项目: ${selectedItems.map((s) => s.name).join(', ')}...`
    );
    setFeedback({
      type: 'success',
      message: `正在启动勾选的 ${selectedItems.length} 个项目...`,
    });
    for (const item of selectedItems) {
      await handleLaunchItem(item);
      await new Promise((r) => setTimeout(r, 150));
    }
    appendLog(
      '多选启动',
      'success',
      `勾选的 ${selectedItems.length} 个项目批次调度完成`
    );
  }, [currentItems, selectedItemIds, handleLaunchItem, appendLog]);

  // 多选即时分屏平铺启动 (免预先保存直接四分屏/双分屏/三分屏)
  const handleLaunchSelectedWithTiling = useCallback(async () => {
    const selectedItems = currentItems.filter((i) => selectedItemIds.includes(i.id));
    if (selectedItems.length < 2) return;

    const layoutType: WindowTilingLayout =
      selectedItems.length === 4 ? 'grid-4' : selectedItems.length === 2 ? 'split-h' : 'main-aside-3';
    const preset = LAYOUT_PRESETS.find((p) => p.id === layoutType) || LAYOUT_PRESETS[0];

    appendLog(
      '分屏调度',
      'info',
      `正在以【${preset.name}】模式启动所选 ${selectedItems.length} 个项目并自动吸附平铺: ${selectedItems.map((s) => s.name).join(', ')}...`
    );
    setFeedback({
      type: 'success',
      message: `正在以【${preset.name}】启动所选 ${selectedItems.length} 项并自动吸附平铺...`,
    });

    for (let i = 0; i < selectedItems.length; i++) {
      await handleLaunchItem(selectedItems[i]);
      if (i < selectedItems.length - 1) {
        await new Promise((r) => setTimeout(r, 150));
      }
    }

    // 等待 350ms 后调用原生 arrange_combo_windows
    await new Promise((r) => setTimeout(r, 350));
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      const targetMon = systemMonitors.find((m) => m.index === multiSelectMonitorIndex);
      const monDesc = targetMon ? targetMon.name : '当前屏幕';

      const specs = preset.slots
        .slice(0, selectedItems.length)
        .map((slot, idx) => ({
          item_id: selectedItems[idx].id,
          item_name: selectedItems[idx].name,
          target: selectedItems[idx].target,
          x_ratio: slot.xRatio,
          y_ratio: slot.yRatio,
          w_ratio: slot.wRatio,
          h_ratio: slot.hRatio,
        }));

      const placedCount = await invoke<number>('arrange_combo_windows', {
        specs,
        targetMonitorIndex: multiSelectMonitorIndex,
      });
      appendLog(
        '分屏调度',
        'success',
        `分屏编排完成: 成功停靠 ${placedCount}/${specs.length} 个窗口至 ${monDesc}`
      );
      setFeedback({
        type: 'success',
        message: `【${preset.name}】无缝平铺完成 (成功停靠至 ${monDesc})`,
      });
    } catch (err: any) {
      appendLog('分屏调度', 'warn', `分屏编排提示: ${err?.message || err}`);
    }

    setIsSelectMode(false);
    setSelectedItemIds([]);
  }, [currentItems, selectedItemIds, handleLaunchItem, appendLog]);

  // 多选切换勾选
  const handleToggleSelectItem = (id: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // 全选 / 取消全选
  const handleSelectAll = () => {
    if (selectedItemIds.length === currentItems.length) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(currentItems.map((i) => i.id));
    }
  };

  // ==================== 分类增删改 ====================

  const handleConfirmCreateCategory = () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    const newCatId = `cat-${Date.now()}`;
    const newCat: LauncherCategory = {
      id: newCatId,
      name: trimmed,
      createdAt: Date.now(),
    };
    setStorage((prev) => ({
      ...prev,
      categories: [...prev.categories, newCat],
      activeCategoryId: newCatId,
    }));
    setActiveCategoryId(newCatId);
    setNewCategoryName('');
    setIsCreatingCategory(false);
  };

  const handleConfirmRenameCategory = (id: string) => {
    const trimmed = editingCategoryName.trim();
    if (!trimmed) {
      setRenamingCategoryId(null);
      return;
    }
    setStorage((prev) => ({
      ...prev,
      categories: prev.categories.map((c) =>
        c.id === id ? { ...c, name: trimmed } : c
      ),
    }));
    setRenamingCategoryId(null);
    setEditingCategoryName('');
  };

  const handleDeleteCategory = (id: string) => {
    const cat = storage.categories.find((c) => c.id === id);
    if (!cat) return;
    if (cat.isDefault) {
      alert('系统默认分类不可删除！');
      return;
    }
    const defaultCat =
      storage.categories.find((c) => c.isDefault)?.id ||
      DEFAULT_LAUNCHER_CATEGORY_ID;

    setStorage((prev) => {
      const updatedItems = prev.items.map((i) =>
        i.categoryId === id ? { ...i, categoryId: defaultCat } : i
      );
      return {
        ...prev,
        categories: prev.categories.filter((c) => c.id !== id),
        items: updatedItems,
        activeCategoryId: prev.activeCategoryId === id ? defaultCat : prev.activeCategoryId,
      };
    });

    if (activeCategoryId === id) {
      setActiveCategoryId(defaultCat);
    }
  };

  // ==================== 启动项增删改查 ====================

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormName('');
    setFormType('app');
    setFormTarget('');
    setFormArgs('');
    setFormWorkingDir('');
    setFormDescription('');
    setFormCategoryId(activeCategoryId);
    setFormBundleItemIds([]);
    setIsItemModalOpen(true);
  };

  const handleOpenEditModal = (item: LauncherItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormType(item.type);
    setFormTarget(item.target);
    setFormArgs(item.args || '');
    setFormWorkingDir(item.workingDir || '');
    setFormDescription(item.description || '');
    setFormCategoryId(item.categoryId);
    setFormBundleItemIds(item.bundleItemIds || []);
    setIsItemModalOpen(true);
  };

  // 打开组合创建模态框 (支持传入预设选中的子项 ID 列表)
  const handleOpenCreateComboModal = (initialItemIds: string[] = []) => {
    setEditingComboItem(null);
    setComboFormName('');
    setComboFormCategoryId(activeCategoryId);
    setComboFormItemIds(initialItemIds);
    setComboItemSearch('');
    const defaultLayout: WindowTilingLayout =
      initialItemIds.length >= 4 ? 'grid-4' : initialItemIds.length === 2 ? 'split-h' : 'grid-4';
    setComboLayoutEnabled(initialItemIds.length >= 2);
    setComboLayoutType(defaultLayout);
    setComboSlotAssignments(autoAssignSlots(defaultLayout, initialItemIds));
    const primIdx = systemMonitors.findIndex((m) => m.isPrimary);
    setComboTargetMonitorIndex(primIdx >= 0 ? primIdx : 0);
    setIsComboModalOpen(true);
  };

  // 打开现有组合编辑模态框
  const handleOpenEditComboModal = (item: LauncherItem) => {
    setEditingComboItem(item);
    setComboFormName(item.name);
    setComboFormCategoryId(item.categoryId);
    const itemIds = item.bundleItemIds || [];
    setComboFormItemIds(itemIds);
    setComboItemSearch('');
    if (item.windowLayout?.enabled) {
      setComboLayoutEnabled(true);
      setComboLayoutType(item.windowLayout.layout);
      setComboTargetMonitorIndex(item.windowLayout.targetMonitorIndex ?? 0);
      const assignments: Record<string, string> = {};
      item.windowLayout.slots.forEach((s) => {
        assignments[s.slotId] = s.targetItemId;
      });
      setComboSlotAssignments(assignments);
    } else {
      setComboLayoutEnabled(false);
      setComboLayoutType('grid-4');
      setComboTargetMonitorIndex(0);
      setComboSlotAssignments(autoAssignSlots('grid-4', itemIds));
    }
    setIsComboModalOpen(true);
  };

  // 组合保存逻辑
  const handleSaveCombo = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = comboFormName.trim();
    if (!trimmedName) {
      alert('请输入组合名称！');
      return;
    }
    if (comboFormItemIds.length === 0) {
      alert('请至少勾选一个包含在组合中的应用或脚本！');
      return;
    }

    const now = Date.now();
    const curPreset = LAYOUT_PRESETS.find((p) => p.id === comboLayoutType) || LAYOUT_PRESETS[0];
    const slotsConfig: WindowSlotConfig[] = curPreset.slots
      .map((slot) => ({
        slotId: slot.slotId,
        name: slot.name,
        targetItemId: comboSlotAssignments[slot.slotId] || '',
        xRatio: slot.xRatio,
        yRatio: slot.yRatio,
        wRatio: slot.wRatio,
        hRatio: slot.hRatio,
      }))
      .filter((slot) => slot.targetItemId && comboFormItemIds.includes(slot.targetItemId));

    const windowLayoutConfig: WindowLayoutConfig | undefined = comboLayoutEnabled
      ? {
          enabled: slotsConfig.length > 0,
          layout: comboLayoutType,
          slots: slotsConfig,
          targetMonitorIndex: comboTargetMonitorIndex,
        }
      : undefined;

    if (editingComboItem) {
      // 更新现有组合
      setStorage((prev) => ({
        ...prev,
        items: prev.items.map((i) =>
          i.id === editingComboItem.id
            ? {
                ...i,
                name: trimmedName,
                type: 'bundle',
                target: '启动组合套件',
                categoryId: comboFormCategoryId,
                bundleItemIds: comboFormItemIds,
                windowLayout: windowLayoutConfig,
                updatedAt: now,
              }
            : i
        ),
      }));
      setFeedback({
        type: 'success',
        message: `组合【${trimmedName}】更新成功 (包含 ${comboFormItemIds.length} 项)`,
      });
    } else {
      // 新建组合
      const newComboItem: LauncherItem = {
        id: `combo-${now}-${Math.random().toString(36).slice(2, 6)}`,
        categoryId: comboFormCategoryId || activeCategoryId,
        name: trimmedName,
        type: 'bundle',
        target: '启动组合套件',
        bundleItemIds: comboFormItemIds,
        windowLayout: windowLayoutConfig,
        createdAt: now,
        updatedAt: now,
      };
      setStorage((prev) => ({
        ...prev,
        items: [newComboItem, ...prev.items],
      }));
      setFeedback({
        type: 'success',
        message: `组合【${trimmedName}】创建成功 (包含 ${comboFormItemIds.length} 项)`,
      });
    }

    setIsComboModalOpen(false);
    setEditingComboItem(null);
    if (isSelectMode) {
      setIsSelectMode(false);
      setSelectedItemIds([]);
    }
  };

  // 智能拉起 Windows 系统资源管理器选择文件或目录 (REQ-LAUNCHER-NATIVE-PICKER-01)
  const handlePickFile = async () => {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      const isFolder = formType === 'folder';
      const pickedPath = await invoke<string | null>('pick_launcher_file', {
        isFolder,
      });

      if (!pickedPath) return;

      // 规范化路径：统一使用标准反斜杠，并去除首尾空白与包裹的双引号
      const cleanPath = pickedPath.trim().replace(/^"(.*)"$/, '$1').replace(/\//g, '\\');
      setFormTarget(cleanPath);

      // 智能提取文件名或目录名作为推荐默认名称
      const pathSegments = cleanPath.split('\\').filter(Boolean);
      const baseName = pathSegments.pop() || '';
      const dotIndex = baseName.lastIndexOf('.');
      const pureName = isFolder
        ? baseName
        : dotIndex > 0
        ? baseName.slice(0, dotIndex)
        : baseName;

      if (!formName.trim()) {
        setFormName(pureName);
      }

      // 依据类型与扩展名智能自动纠偏类型
      if (isFolder) {
        setFormType('folder');
      } else {
        const ext = dotIndex > 0 ? baseName.slice(dotIndex + 1).toLowerCase() : '';
        if (['exe', 'lnk'].includes(ext)) {
          setFormType('app');
        } else if (['bat', 'cmd', 'ps1'].includes(ext)) {
          setFormType('script');
        }
      }
    } catch (err) {
      console.error('Failed to pick launcher file:', err);
    }
  };

  const handleSaveItem = async () => {
    const trimmedName = formName.trim();
    let trimmedTarget = formTarget.trim();

    if (!trimmedName) {
      alert('请填写启动项名称！');
      return;
    }

    if (formType !== 'bundle' && !trimmedTarget) {
      alert('请填写目标路径、网址或脚本指令！');
      return;
    }

    // 针对本地文件、可执行程序与文件夹，统一规范化路径：剥离首尾多余双引号并将正斜杠转换为 Windows 标准反斜杠
    const strippedScriptCandidate = trimmedTarget.replace(/^"(.*)"$/, '$1').trim();
    const isScriptFileTarget =
      formType === 'script' &&
      /\.(bat|cmd|ps1)$/i.test(strippedScriptCandidate);

    if (formType === 'app' || formType === 'folder' || isScriptFileTarget) {
      trimmedTarget = strippedScriptCandidate.replace(/\//g, '\\');
    }

    let effectiveWorkingDir = formWorkingDir.trim();
    if (!effectiveWorkingDir && isScriptFileTarget) {
      const parentDir = trimmedTarget.replace(/[\\/][^\\/]+$/, '');
      if (parentDir && parentDir !== trimmedTarget) {
        effectiveWorkingDir = parentDir;
      }
    }

    if (formType === 'bundle' && formBundleItemIds.length === 0) {
      alert('请至少勾选一个包含在捆绑套件中的应用或脚本！');
      return;
    }

    const now = Date.now();
    let targetIcon = editingItem?.icon;

    // 若修改了目标且为应用，尝试提取新图标
    if (formType === 'app' && (!targetIcon || editingItem?.target !== trimmedTarget)) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        const iconDataUrl = await invoke<string>('get_app_icon', {
          target: trimmedTarget,
        });
        if (iconDataUrl && iconDataUrl.startsWith('data:image/')) {
          targetIcon = iconDataUrl;
        }
      } catch (_e) {
        // ignore
      }
    }

    if (editingItem) {
      // 更新现有项
      setStorage((prev) => ({
        ...prev,
        items: prev.items.map((i) =>
          i.id === editingItem.id
            ? {
                ...i,
                name: trimmedName,
                type: formType,
                target: formType === 'bundle' ? '捆绑启动组合' : trimmedTarget,
                args: formArgs.trim() || undefined,
                workingDir: effectiveWorkingDir || undefined,
                description: formDescription.trim() || undefined,
                categoryId: formCategoryId,
                icon: targetIcon,
                bundleItemIds: formType === 'bundle' ? formBundleItemIds : undefined,
                updatedAt: now,
              }
            : i
        ),
      }));
    } else {
      // 新建项
      const newItem: LauncherItem = {
        id: `item-${now}-${Math.random().toString(36).slice(2, 6)}`,
        categoryId: formCategoryId || activeCategoryId,
        name: trimmedName,
        type: formType,
        target: formType === 'bundle' ? '捆绑启动组合' : trimmedTarget,
        args: formArgs.trim() || undefined,
        workingDir: effectiveWorkingDir || undefined,
        description: formDescription.trim() || undefined,
        icon: targetIcon,
        bundleItemIds: formType === 'bundle' ? formBundleItemIds : undefined,
        createdAt: now,
        updatedAt: now,
      };

      setStorage((prev) => ({
        ...prev,
        items: [newItem, ...prev.items],
      }));
    }

    setIsItemModalOpen(false);
  };

  const handleDeleteItem = (id: string) => {
    setStorage((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.id !== id),
    }));
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-transparent select-none relative">
      {/* ================= 左侧分类管理侧栏 ================= */}
      <div className="w-44 lg:w-52 border-r border-white/[0.08] bg-black/20 backdrop-blur-md flex flex-col shrink-0">
        {/* 侧栏顶标：高度严格对齐 h-[49px]，基准线与思维导图/待办清单 100% 贯穿对齐 */}
        <div className="h-[49px] px-3.5 flex items-center justify-between border-b border-white/[0.08] bg-white/[0.01] shrink-0 min-w-0">
          <div className="flex items-center gap-2 shrink-0">
            <Rocket className="w-4 h-4 text-brand-primary shrink-0" />
            <h2 className="text-xs font-semibold text-fg-primary tracking-tight font-mono shrink-0 whitespace-nowrap">
              快速启动
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              setIsCreatingCategory(true);
              setNewCategoryName('');
            }}
            title="新建启动分类"
            className="flex items-center gap-1 h-7 px-2 rounded-lg text-xs font-medium bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/10 hover:border-cyan-500/30 transition-all tactile-btn shrink-0 whitespace-nowrap"
          >
            <FolderPlus className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
            <span>分类</span>
          </button>
        </div>

        {/* 分类创建输入框 */}
        {isCreatingCategory && (
          <div className="px-3 pt-2.5">
            <div className="flex items-center gap-1 p-1 rounded-lg bg-black/40 border border-brand-primary/40">
              <input
                type="text"
                autoFocus
                placeholder="分类名称..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleConfirmCreateCategory();
                  if (e.key === 'Escape') setIsCreatingCategory(false);
                }}
                className="w-full bg-transparent px-2 py-0.5 text-xs text-slate-100 placeholder-slate-500 outline-none"
              />
              <button
                onClick={handleConfirmCreateCategory}
                className="p-1 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/20 rounded"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsCreatingCategory(false)}
                className="p-1 text-slate-400 hover:text-slate-300 hover:bg-white/10 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* 分类列表：L3 分类层级规范 */}
        <div className="flex-1 overflow-y-auto px-2 py-2.5 space-y-1">
          {storage.categories.map((cat) => {
            const isActive = cat.id === activeCategoryId;
            const count = categoryCounts[cat.id] || 0;
            const isRenaming = renamingCategoryId === cat.id;

            return (
              <div
                key={cat.id}
                onClick={() => {
                  setActiveCategoryId(cat.id);
                  if (isSelectMode) setSelectedItemIds([]);
                }}
                className={`group relative flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/35 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <Folder
                    className={`w-3.5 h-3.5 flex-shrink-0 ${
                      isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-400'
                    }`}
                  />
                  {isRenaming ? (
                    <input
                      type="text"
                      value={editingCategoryName}
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => setEditingCategoryName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleConfirmRenameCategory(cat.id);
                        if (e.key === 'Escape') setRenamingCategoryId(null);
                      }}
                      onBlur={() => handleConfirmRenameCategory(cat.id)}
                      className="bg-black/50 border border-cyan-500/50 rounded px-1.5 py-0.5 text-xs text-slate-100 outline-none w-28"
                    />
                  ) : (
                    <span className="truncate">{cat.name}</span>
                  )}
                </div>

                {/* 数量标记：L2 统计徽标规范 */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-white/[0.06] text-slate-400 border border-white/[0.06]">
                    {count}
                  </span>
                  {!cat.isDefault && (
                    <div
                      className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => {
                          setRenamingCategoryId(cat.id);
                          setEditingCategoryName(cat.name);
                        }}
                        title="重命名分类"
                        className="p-1 hover:text-cyan-300 hover:bg-white/10 rounded"
                      >
                        <Edit2 className="w-3 h-3 text-slate-400" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        title="删除分类"
                        className="p-1 hover:text-rose-400 hover:bg-white/10 rounded"
                      >
                        <Trash2 className="w-3 h-3 text-slate-400" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= 右侧启动项卡片大盘 ================= */}
      <div className="flex-1 flex flex-col min-w-0 bg-transparent overflow-hidden">
        {/* 顶部工具栏：高度严格对齐 h-[49px]，具备舒展呼吸感与充裕外内衬 */}
        <div className="h-[49px] px-4 md:px-5 flex items-center justify-between border-b border-white/[0.08] bg-white/[0.01] shrink-0 min-w-0 gap-3">
          {/* 左侧：常规分类信息 vs 多选控制状态 */}
          {isSelectMode ? (
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono shadow-[0_0_12px_rgba(6,182,212,0.2)]">
                <CheckSquare className="w-3.5 h-3.5" />
                <span>已选 {selectedItemIds.length} 项</span>
              </span>
              <button
                type="button"
                onClick={handleSelectAll}
                className="px-2 py-1 rounded text-xs text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
              >
                {selectedItemIds.length === currentItems.length ? '取消全选' : '全选本类'}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 min-w-0 shrink">
              <h2 className="text-xs font-semibold text-fg-primary tracking-tight font-mono truncate whitespace-nowrap">
                {activeCategory?.name || '默认工具'}
              </h2>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-white/[0.06] text-fg-muted border border-white/[0.06] shrink-0 whitespace-nowrap">
                {currentItems.length} 项
              </span>
            </div>
          )}

          {/* 右侧动作区：动态切换常规与多选操作，各按键与边界保留充分呼吸空间 */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 overflow-x-auto no-scrollbar py-0.5">
            {isSelectMode ? (
              <>
                {/* 多选模式下：一键保存为新组合通道 */}
                <button
                  type="button"
                  disabled={selectedItemIds.length === 0}
                  onClick={() => handleOpenCreateComboModal(selectedItemIds)}
                  title="将当前已勾选的项目保存为一个新组合并配置分屏"
                  className={`flex items-center gap-1.5 h-8 px-2.5 rounded-xl text-xs font-medium transition-all tactile-btn shrink-0 ${
                    selectedItemIds.length > 0
                      ? 'bg-white/[0.04] hover:bg-white/[0.08] text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                      : 'bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
                  <span>保存为组合</span>
                </button>

                {/* 当勾选 2~4 项时，直接显示「即时分屏平铺启动」按钮与多屏投递选择 */}
                {selectedItemIds.length >= 2 && selectedItemIds.length <= 4 && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={handleLaunchSelectedWithTiling}
                      title="立即以分屏平铺方式启动所选项并自动无缝吸附指定屏幕"
                      className="flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 border border-cyan-400 shadow-[0_0_14px_rgba(6,182,212,0.3)] transition-all tactile-btn shrink-0"
                    >
                      <Monitor className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        {selectedItemIds.length === 4
                          ? '田字四分屏启动 (4)'
                          : selectedItemIds.length === 2
                          ? '左右双分屏启动 (2)'
                          : '主辅三分屏启动 (3)'}
                      </span>
                    </button>

                    {systemMonitors.length > 1 && (
                      <div className="flex items-center gap-1 bg-black/40 px-2 h-8 rounded-xl border border-white/10 shrink-0">
                        <span className="text-[10px] text-slate-400">投放在:</span>
                        {systemMonitors.map((mon) => (
                          <button
                            key={mon.index}
                            type="button"
                            onClick={() => setMultiSelectMonitorIndex(mon.index)}
                            className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono transition-all ${
                              multiSelectMonitorIndex === mon.index
                                ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-500/50 font-semibold shadow-sm'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {mon.isPrimary ? `屏幕${mon.index + 1}(主)` : `屏幕${mon.index + 1}(副)`}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  disabled={selectedItemIds.length === 0}
                  onClick={handleLaunchSelected}
                  title="立即同时唤醒选中的应用或脚本"
                  className={`flex items-center gap-1.5 h-8 px-2.5 rounded-xl text-xs font-medium transition-all tactile-btn shrink-0 ${
                    selectedItemIds.length > 0
                      ? 'bg-white/[0.04] hover:bg-white/[0.08] text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                      : 'bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 fill-current shrink-0 text-emerald-400" />
                  <span>常规启动 ({selectedItemIds.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsSelectMode(false);
                    setSelectedItemIds([]);
                  }}
                  className="flex items-center gap-1 h-8 px-2.5 rounded-xl text-xs text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-white/10 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>退出</span>
                </button>
              </>
            ) : (
              <>
                {/* 搜索框：内嵌紧凑形态 */}
                <div className="relative w-28 sm:w-36 md:w-44 min-w-[70px] shrink">
                  <Search className="w-3.5 h-3.5 text-fg-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="搜索名称或指令..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-8 bg-black/40 border border-white/10 rounded-xl pl-8 pr-7 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-all font-sans shadow-inner"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-slate-500 hover:text-slate-300 rounded"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* 自由多选启动按钮 (Secondary Ghost 暗晶体) */}
                {currentItems.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsSelectMode(true);
                      setSelectedItemIds([]);
                    }}
                    title="自由勾选任意多个应用或脚本同时启动或四分屏"
                    className="flex items-center gap-1.5 h-8 px-2.5 rounded-xl text-xs font-medium bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/10 hover:border-cyan-500/30 transition-all tactile-btn shrink-0 whitespace-nowrap"
                  >
                    <CheckSquare className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
                    <span>多选启动</span>
                  </button>
                )}

                {/* 一键全启动按钮 (Secondary Ghost 暗晶体) */}
                {currentItems.length > 0 && (
                  <button
                    type="button"
                    onClick={handleBatchLaunchAll}
                    title="一键启动当前分类下全部项目"
                    className="flex items-center gap-1.5 h-8 px-2.5 rounded-xl text-xs font-medium bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/10 hover:border-emerald-500/30 transition-all tactile-btn shrink-0 whitespace-nowrap"
                  >
                    <Zap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>全启动</span>
                  </button>
                )}

                {/* 显式独立的新建组合/分屏按钮 (Secondary Ghost 暗晶体) */}
                <button
                  type="button"
                  onClick={() => handleOpenCreateComboModal()}
                  title="创建多项目组合套餐并编排屏幕分屏位置"
                  className="flex items-center gap-1.5 h-8 px-2.5 rounded-xl text-xs font-medium bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/10 hover:border-cyan-500/30 transition-all tactile-btn shrink-0 whitespace-nowrap"
                >
                  <Monitor className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
                  <span>分屏组合</span>
                </button>

                {/* 添加单项启动项按钮 (Secondary Ghost 统一暗晶体规范) */}
                <button
                  type="button"
                  onClick={handleOpenAddModal}
                  className="flex items-center gap-1.5 h-8 px-2.5 rounded-xl text-xs font-medium bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/10 hover:border-cyan-500/30 transition-all tactile-btn shrink-0 whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
                  <span>新建项</span>
                </button>

                {/* 全进程状态清单入口按钮 (Secondary Ghost 暗晶体) */}
                <button
                  type="button"
                  onClick={() => {
                    refreshProcessStatus();
                    setIsManifestOpen(true);
                  }}
                  title="查看所有纳入快速启动项的运行进程清单，支持一键全部关闭或关闭指定应用/组合"
                  className={`flex items-center gap-1.5 h-8 px-2.5 rounded-xl text-xs font-medium transition-all tactile-btn shrink-0 whitespace-nowrap border ${
                    totalRunningAppsCount > 0
                      ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-200 border-emerald-500/35 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                      : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border-white/10 hover:border-white/20'
                  }`}
                >
                  <span className="relative flex items-center justify-center">
                    <Activity className={`w-3.5 h-3.5 shrink-0 ${totalRunningAppsCount > 0 ? 'text-emerald-400' : 'text-slate-400'}`} />
                    {totalRunningAppsCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping opacity-75" />
                    )}
                  </span>
                  <span>进程清单</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                    totalRunningAppsCount > 0
                      ? 'bg-emerald-500/25 text-emerald-300'
                      : 'bg-white/[0.08] text-slate-400'
                  }`}>
                    {totalRunningAppsCount}
                  </span>
                </button>

                {/* 专职执行报文控制台切换按钮 (Secondary Ghost 暗晶体) */}
                <button
                  type="button"
                  onClick={() => setIsTelemetryOpen((prev) => !prev)}
                  title={isTelemetryOpen ? '收起执行报文面板' : '展开执行报文面板'}
                  className={`flex items-center gap-1.5 h-8 px-2.5 rounded-xl text-xs font-medium transition-all tactile-btn shrink-0 whitespace-nowrap border ${
                    isTelemetryOpen
                      ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                      : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border-white/10 hover:border-white/20'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                  <span>执行报文</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-white/[0.08] text-slate-400">
                    {logs.length}
                  </span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* 动态执行提示 Toast */}
        {feedback && (
          <div
            className={`px-4 py-2 text-xs flex items-center gap-2 shrink-0 transition-all ${
              feedback.type === 'success'
                ? 'bg-emerald-500/15 border-b border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/15 border-b border-rose-500/30 text-rose-300'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <span className="truncate">{feedback.message}</span>
          </div>
        )}

        {/* 启动项主容器：分屏组合套件置顶专区 + 常规快速启动项晶体网格 */}
        <div className="flex-1 overflow-y-auto p-4 min-w-0 space-y-6">
          {/* ================= 置顶专区：屏幕分屏与工作流套件 (单拎专区展示) ================= */}
          {comboSuites.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-slate-200">
                    屏幕分屏与工作流套件 ({comboSuites.length})
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
                {comboSuites.map((combo) => {
                  const isRunning = runningItemIds[combo.id];
                  const isMenuOpen = activeMenuDocId === combo.id;
                  const isSelected = selectedItemIds.includes(combo.id);
                  const subItems = (combo.bundleItemIds || [])
                    .map((subId) => storage.items.find((it) => it.id === subId))
                    .filter(Boolean) as LauncherItem[];
                  const runningSubCount = subItems.filter((sIt) => processStatusMap[sIt.id]?.is_running).length;
                  const isComboAllRunning = subItems.length > 0 && runningSubCount === subItems.length;
                  const isComboAnyRunning = runningSubCount > 0;
                  const isComboTerminating = terminatingItemIds[combo.id];

                  return (
                    <div
                      key={combo.id}
                      onClick={() => {
                        if (isSelectMode) {
                          handleToggleSelectItem(combo.id);
                        }
                      }}
                      className={`group relative rounded-2xl border transition-all duration-200 p-4 select-none flex flex-col justify-between ${
                        isSelectMode && isSelected
                          ? 'border-cyan-500/60 bg-cyan-500/10 shadow-[0_0_18px_rgba(6,182,212,0.25)]'
                          : 'border-white/[0.08] bg-white/[0.025] hover:bg-white/[0.05] hover:border-cyan-500/40 shadow-sm hover:shadow-[0_8px_24px_rgba(0,0,0,0.45)]'
                      }`}
                    >
                      {/* 顶栏：套件标题 + 目标屏幕与布局徽标 + 操作菜单 */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500/15 to-indigo-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-300 shrink-0 shadow-sm">
                            <Layers className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-xs font-semibold text-slate-100 truncate group-hover:text-cyan-200 transition-colors">
                              {combo.name}
                            </h3>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {combo.windowLayout?.enabled ? (
                                <span className="flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded border border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
                                  <Monitor className="w-2.5 h-2.5 text-cyan-400 shrink-0" />
                                  <span>
                                    {typeof combo.windowLayout.targetMonitorIndex === 'number'
                                      ? `屏幕 ${combo.windowLayout.targetMonitorIndex + 1} · `
                                      : ''}
                                    {combo.windowLayout.layout === 'grid-4'
                                      ? '四分屏'
                                      : combo.windowLayout.layout === 'split-h'
                                      ? '左右双分屏'
                                      : combo.windowLayout.layout === 'split-v'
                                      ? '上下双分屏'
                                      : '三分屏'}
                                  </span>
                                </span>
                              ) : (
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-slate-400">
                                  常规顺序唤起
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* 多选模式复选框 / 操作菜单 */}
                        {isSelectMode ? (
                          <div
                            className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all shrink-0 mt-1 ${
                              isSelected
                                ? 'bg-cyan-500 border-cyan-400 text-black shadow-sm'
                                : 'border-white/20 bg-black/40 group-hover:border-cyan-400/60'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                            {/* 组合套件聚合进程运行状态与一键关闭 */}
                            {isComboAnyRunning && (
                              <div className="flex items-center gap-1">
                                <span
                                  className={`text-[10px] px-1.5 py-0.5 rounded-full border flex items-center gap-1 font-medium ${
                                    isComboAllRunning
                                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                                      : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                                  }`}
                                  title={
                                    isComboAllRunning
                                      ? `组合子项全部正在运行 (${runningSubCount}/${subItems.length})`
                                      : `组合子项部分正在运行 (${runningSubCount}/${subItems.length})`
                                  }
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      isComboAllRunning ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                                    }`}
                                  />
                                  <span>
                                    {isComboAllRunning ? '运行中' : `${runningSubCount}/${subItems.length}`}
                                  </span>
                                </span>

                                <button
                                  type="button"
                                  onClick={(e) => handleTerminateComboSuite(combo, e)}
                                  title={`关闭组合涉及的所有进程 (${runningSubCount} 项)`}
                                  className="w-5 h-5 rounded-md hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 flex items-center justify-center transition-colors cursor-pointer"
                                >
                                  {isComboTerminating ? (
                                    <Loader2 className="w-3 h-3 animate-spin text-rose-400" />
                                  ) : (
                                    <Square className="w-2.5 h-2.5 fill-current" />
                                  )}
                                </button>
                              </div>
                            )}

                            <div className="relative shrink-0">
                              <button
                                type="button"
                                onClick={() => setActiveMenuDocId(isMenuOpen ? null : combo.id)}
                                title="设置与更多"
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/10 transition-colors"
                              >
                                <MoreVertical className="w-3.5 h-3.5" />
                              </button>
                              {isMenuOpen && (
                                <div className="absolute right-0 top-full mt-1 w-32 rounded-xl bg-slate-950/95 border border-white/10 shadow-2xl py-1 z-30 backdrop-blur-xl">
                                  {isComboAnyRunning && (
                                    <>
                                      <button
                                        onClick={() => {
                                          handleTerminateComboSuite(combo);
                                          setActiveMenuDocId(null);
                                        }}
                                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10"
                                      >
                                        <Square className="w-3 h-3 fill-current" />
                                        <span>关闭全部进程 ({runningSubCount})</span>
                                      </button>
                                      <div className="h-px bg-white/5 my-1" />
                                    </>
                                  )}
                                  <button
                                    onClick={() => {
                                      handleOpenEditComboModal(combo);
                                      setActiveMenuDocId(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-300 hover:text-cyan-300 hover:bg-white/5"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                    <span>编辑组合</span>
                                  </button>
                                  <div className="h-px bg-white/5 my-1" />
                                  <button
                                    onClick={() => {
                                      handleDeleteItem(combo.id);
                                      setActiveMenuDocId(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    <span>删除</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 中栏：包含应用预览胶囊微缩标签流 */}
                      <div className="bg-black/25 rounded-xl p-2 mb-3 border border-white/5 min-h-[38px] flex flex-wrap items-center gap-1.5">
                        {subItems.length > 0 ? (
                          subItems.map((sItem) => {
                            const sStatus = processStatusMap[sItem.id];
                            const isSubTerminating = terminatingItemIds[sItem.id];
                            return (
                              <div
                                key={sItem.id}
                                title={sItem.target || sItem.name}
                                className={`group/sub flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[10px] transition-colors ${
                                  sStatus?.is_running
                                    ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-200'
                                    : 'bg-white/[0.04] border-white/10 text-slate-300'
                                }`}
                              >
                                {sItem.icon && sItem.icon.startsWith('data:image/') ? (
                                  <img src={sItem.icon} alt="" className="w-3 h-3 object-contain rounded" />
                                ) : (
                                  <AppWindow className="w-2.5 h-2.5 text-slate-400" />
                                )}
                                <span className="truncate max-w-[90px]">{sItem.name}</span>
                                {sStatus?.is_running && (
                                  <button
                                    type="button"
                                    title={`关闭【${sItem.name}】进程`}
                                    onClick={(e) => handleTerminateProcess(sItem, e)}
                                    className="w-3.5 h-3.5 rounded hover:bg-rose-500/30 text-emerald-400 hover:text-rose-300 flex items-center justify-center transition-all cursor-pointer ml-0.5"
                                  >
                                    {isSubTerminating ? (
                                      <Loader2 className="w-2 h-2 animate-spin text-rose-400" />
                                    ) : (
                                      <>
                                        <span className="group-hover/sub:hidden w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                        <X className="hidden group-hover/sub:inline w-2.5 h-2.5 stroke-[2.5]" />
                                      </>
                                    )}
                                  </button>
                                )}
                              </div>
                            );
                          })
                        ) : (
                          <span className="text-[10px] text-slate-500">尚未配置任何子应用</span>
                        )}
                      </div>

                      {/* 底栏：宽幅一键启动与平铺操作按钮 (微光实体) */}
                      {!isSelectMode ? (
                        <button
                          type="button"
                          disabled={isRunning}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLaunchItem(combo);
                          }}
                          className={`w-full h-8 rounded-xl flex items-center justify-center gap-1.5 text-xs font-semibold transition-all ${
                            isRunning
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 cursor-wait animate-pulse'
                              : 'bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/35 hover:border-cyan-500/55 shadow-sm hover:shadow-[0_0_14px_rgba(6,182,212,0.25)]'
                          }`}
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>
                            {isRunning ? '正在唤起并布局...' : `启动套件并平铺 (${subItems.length}项)`}
                          </span>
                        </button>
                      ) : (
                        <div className="h-8 flex items-center justify-center text-xs text-slate-400">
                          {isSelected ? '已选中套件' : '点击勾选'}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= 常规单品快速启动项大盘网格 ================= */}
          <div className="space-y-2">
            {comboSuites.length > 0 && (
              <div className="flex items-center gap-2 pt-1 text-xs font-semibold text-slate-400">
                <span>快速启动项 ({standardItems.length})</span>
              </div>
            )}

            <div
              className="grid gap-3.5"
              style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(136px, 1fr))' }}
            >
              {/* 首卡：+ 添加快速启动项 (多选模式下隐藏) */}
              {!isSelectMode && (
                <div
                  onClick={handleOpenAddModal}
                  className="group relative flex flex-col items-center justify-center h-36 rounded-2xl border-2 border-dashed border-white/15 hover:border-cyan-500/50 bg-white/[0.02] hover:bg-cyan-500/[0.06] cursor-pointer transition-all duration-200 shadow-sm hover:shadow-[0_0_18px_rgba(6,182,212,0.15)]"
                >
                  <div className="p-2.5 rounded-full bg-cyan-500/15 text-cyan-400 group-hover:scale-110 group-hover:bg-cyan-500/25 transition-all duration-200 shadow-[0_0_14px_rgba(6,182,212,0.2)]">
                    <Plus className="w-4 h-4" />
                  </div>
                  <span className="mt-2 text-xs font-medium text-slate-300 group-hover:text-cyan-300 transition-colors">
                    添加启动项
                  </span>
                </div>
              )}

              {/* 常规单品启动项卡片列表 (无 bundle 挤压，恢复纯粹单品卡片排版) */}
              {standardItems.map((item) => {
                const badge = renderTypeBadge(item.type);
                const isRunning = runningItemIds[item.id];
                const procStatus = processStatusMap[item.id];
                const isTerminating = terminatingItemIds[item.id];
                const isMenuOpen = activeMenuDocId === item.id;
                const isSelected = selectedItemIds.includes(item.id);

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (isSelectMode) {
                        handleToggleSelectItem(item.id);
                      } else {
                        handleLaunchItem(item);
                      }
                    }}
                    title={item.name}
                    className={`group relative flex flex-col justify-between h-36 rounded-2xl border cursor-pointer transition-all duration-200 p-3 overflow-hidden select-none ${
                      isSelectMode && isSelected
                        ? 'border-cyan-500/60 bg-cyan-500/10 shadow-[0_0_18px_rgba(6,182,212,0.25)]'
                        : 'border-white/[0.08] bg-white/[0.025] hover:bg-white/[0.06] hover:border-cyan-500/40 shadow-sm hover:shadow-[0_8px_24px_rgba(0,0,0,0.45)]'
                    }`}
                  >
                    {/* 顶栏：多选复选框与下拉设置菜单 (彻底取消类型文字标签，纯粹极简留白) */}
                    <div className="flex items-center justify-between gap-1.5 h-4">
                      {isSelectMode ? (
                        <div
                          className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                            isSelected
                              ? 'bg-cyan-500 border-cyan-400 text-black shadow-sm'
                              : 'border-white/20 bg-black/40 group-hover:border-cyan-400/60'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      ) : (
                        <div />
                      )}

                      {!isSelectMode && (
                        <div
                          className="relative flex-shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setActiveMenuDocId(isMenuOpen ? null : item.id)
                            }
                            title="设置与更多"
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>

                          {/* 下拉菜单浮层 */}
                          {isMenuOpen && (
                            <div className="absolute right-0 top-full mt-1 w-32 rounded-xl bg-slate-950/95 border border-white/10 shadow-2xl py-1 z-30 backdrop-blur-xl">
                              {procStatus?.is_running && (
                                <>
                                  <button
                                    onClick={() => {
                                      handleTerminateProcess(item);
                                      setActiveMenuDocId(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10"
                                  >
                                    <Square className="w-3 h-3 fill-current" />
                                    <span>结束运行 ({procStatus.instance_count})</span>
                                  </button>
                                  <div className="h-px bg-white/5 my-1" />
                                </>
                              )}
                              <button
                                onClick={() => {
                                  handleOpenEditModal(item);
                                  setActiveMenuDocId(null);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-300 hover:text-cyan-300 hover:bg-white/5"
                              >
                                <Edit2 className="w-3 h-3" />
                                <span>编辑设置</span>
                              </button>
                              <div className="h-px bg-white/5 my-1" />
                              <button
                                onClick={() => {
                                  handleDeleteItem(item.id);
                                  setActiveMenuDocId(null);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>删除</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* 核心视觉焦点：40x40 高清原生图标 + 应用名称 */}
                    <div className="my-auto flex flex-col items-center justify-center min-w-0">
                      <div className="w-10 h-10 flex items-center justify-center shrink-0 relative">
                        {item.icon && item.icon.startsWith('data:image/') ? (
                          <img
                            src={item.icon}
                            alt={item.name}
                            className="w-10 h-10 object-contain rounded-xl drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform duration-200"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:bg-cyan-500/15 group-hover:border-cyan-500/30 transition-all duration-200 shadow-inner">
                            <badge.Icon className="w-5 h-5" />
                          </div>
                        )}

                        {/* 进程运行指示灯与悬停一键关闭微角标 */}
                        {procStatus?.is_running && !isSelectMode && (
                          <div
                            onClick={(e) => handleTerminateProcess(item, e)}
                            title={`正在运行 (${procStatus.instance_count} 个实例) - 点击终止进程`}
                            className="group/proc absolute -top-1.5 -right-1.5 z-20 cursor-pointer"
                          >
                            {/* 默认常驻态：精致祖母绿微光指示点 (多开时显示数量) */}
                            <div className="flex group-hover/proc:hidden items-center justify-center min-w-[14px] h-[14px] px-0.5 rounded-full bg-emerald-500 border border-[#0d1117] shadow-[0_0_8px_rgba(16,185,129,0.9)] animate-in fade-in zoom-in-75 duration-150">
                              {procStatus.instance_count > 1 ? (
                                <span className="text-[9px] font-mono font-bold text-black leading-none px-0.5">
                                  {procStatus.instance_count}
                                </span>
                              ) : (
                                <span className="w-1.5 h-1.5 rounded-full bg-white/90" />
                              )}
                            </div>
                            {/* 悬停态：高对比红色小叉号关闭按钮 */}
                            <div className="hidden group-hover/proc:flex items-center justify-center w-[16px] h-[16px] rounded-full bg-rose-500 text-white shadow-[0_0_10px_rgba(244,63,94,0.9)] hover:scale-110 active:scale-95 transition-all">
                              {isTerminating ? (
                                <Loader2 className="w-2.5 h-2.5 animate-spin" />
                              ) : (
                                <X className="w-2.5 h-2.5 stroke-[3]" />
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <h3 className="mt-2 text-xs font-semibold truncate max-w-full text-center tracking-tight px-1 transition-colors text-slate-200 group-hover:text-cyan-300">
                        {item.name}
                      </h3>
                    </div>

                    {/* 极简底栏交互：悬浮微光与运行响应 */}
                    <div className="h-5 flex items-center justify-center text-[10px] text-slate-500 font-mono">
                      {isRunning ? (
                        <span className="flex items-center gap-1 text-cyan-400 font-medium animate-pulse">
                          <Play className="w-2.5 h-2.5 fill-current" />
                          <span>唤起中...</span>
                        </span>
                      ) : isSelectMode ? (
                        <span className="text-slate-400 font-sans">
                          {isSelected ? '已选中' : '点击选择'}
                        </span>
                      ) : (
                        <span className="opacity-0 group-hover:opacity-100 text-slate-400 transition-opacity">
                          点击快速启动
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ================= 右侧专职执行报文并列协同面板 (REQ-TELEMETRY-NON-OVERLAY-01) ================= */}
      {/* ==================== 全进程状态清单面板 ==================== */}
      <ProcessManifestModal
        isOpen={isManifestOpen}
        onClose={() => setIsManifestOpen(false)}
        items={storage.items}
        categories={storage.categories}
        processStatusMap={processStatusMap}
        terminatingItemIds={terminatingItemIds}
        isTerminatingAll={isTerminatingAll}
        onRefresh={refreshProcessStatus}
        onTerminateAll={handleTerminateAllProcesses}
        onTerminateItem={(item) => handleTerminateProcess(item)}
        onTerminateCombo={(combo) => handleTerminateComboSuite(combo)}
        onTerminateSinglePid={handleTerminateSinglePid}
        onLaunchItem={handleLaunchItem}
      />

      {isTelemetryOpen && (
        <div className="w-[310px] xl:w-[370px] shrink-0 h-full flex flex-col overflow-hidden animate-in slide-in-from-right-4 duration-150">
          <TelemetryPanel
            logs={logs}
            onClearLogs={handleClearLogs}
            onClose={() => setIsTelemetryOpen(false)}
          />
        </div>
      )}

      {/* ================= 专属启动组合创建与编辑模态框 (REQ-COMBO-01 & REK-COMBO-02) ================= */}
      {isComboModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-slate-950/95 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-300">
                  <Layers className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-slate-100">
                  {editingComboItem ? '编辑启动组合' : '创建启动组合'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsComboModalOpen(false);
                  setEditingComboItem(null);
                }}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCombo} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">组合名称 *</label>
                <input
                  type="text"
                  required
                  placeholder="例如：每日办公全套、开发调试环境、会议演示套件..."
                  value={comboFormName}
                  onChange={(e) => setComboFormName(e.target.value)}
                  className="w-full h-8 bg-black/40 border border-white/10 rounded-lg px-2.5 text-slate-100 outline-none focus:border-rose-500/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">归属分类</label>
                <select
                  value={comboFormCategoryId}
                  onChange={(e) => setComboFormCategoryId(e.target.value)}
                  className="w-full h-8 bg-black/40 border border-white/10 rounded-lg px-2 text-slate-200 outline-none focus:border-rose-500/50"
                >
                  {storage.categories.map((c) => (
                    <option key={c.id} value={c.id} className="bg-slate-900 text-slate-100">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between text-slate-400 mb-1.5 font-medium">
                  <span>
                    选择包含的应用与脚本 ({comboFormItemIds.length} / {candidateComboItems.length} 项) *
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (comboFormItemIds.length === candidateComboItems.length) {
                        setComboFormItemIds([]);
                      } else {
                        setComboFormItemIds(candidateComboItems.map((i) => i.id));
                      }
                    }}
                    className="text-[11px] text-rose-400 hover:text-rose-300 hover:underline"
                  >
                    {comboFormItemIds.length === candidateComboItems.length ? '清空' : '全选'}
                  </button>
                </div>

                {/* 候选项目快捷搜索过滤 */}
                {candidateComboItems.length > 5 && (
                  <div className="relative mb-2">
                    <Search className="w-3 h-3 text-slate-500 absolute left-2 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="过滤候选应用或脚本..."
                      value={comboItemSearch}
                      onChange={(e) => setComboItemSearch(e.target.value)}
                      className="w-full h-7 bg-black/40 border border-white/10 rounded-lg pl-7 pr-2 text-[11px] text-slate-200 placeholder-slate-500 outline-none focus:border-rose-500/40"
                    />
                  </div>
                )}

                {/* 成员穿梭多选列表 */}
                <div className="max-h-56 overflow-y-auto rounded-xl border border-white/10 bg-black/30 p-2 space-y-1">
                  {candidateComboItems.length === 0 ? (
                    <div className="py-6 text-center text-slate-500 text-xs">
                      暂无基础启动项，请先添加应用或脚本
                    </div>
                  ) : filteredCandidateComboItems.length === 0 ? (
                    <div className="py-4 text-center text-slate-500 text-xs">
                      未匹配到包含 “{comboItemSearch}” 的项目
                    </div>
                  ) : (
                    filteredCandidateComboItems.map((cItem) => {
                      const isChecked = comboFormItemIds.includes(cItem.id);
                      const cBadge = renderTypeBadge(cItem.type);
                      return (
                        <div
                          key={cItem.id}
                          onClick={() => {
                            setComboFormItemIds((prev) =>
                              prev.includes(cItem.id)
                                ? prev.filter((id) => id !== cItem.id)
                                : [...prev, cItem.id]
                            );
                          }}
                          className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                            isChecked
                              ? 'bg-rose-500/15 border border-rose-500/35 text-slate-100'
                              : 'hover:bg-white/5 border border-transparent text-slate-400'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                                isChecked
                                  ? 'bg-rose-500 border-rose-400 text-white'
                                  : 'border-white/20 bg-black/40'
                              }`}
                            >
                              {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <div className="w-5 h-5 flex items-center justify-center shrink-0">
                              {cItem.icon && cItem.icon.startsWith('data:image/') ? (
                                <img
                                  src={cItem.icon}
                                  alt={cItem.name}
                                  className="w-5 h-5 object-contain rounded"
                                />
                              ) : (
                                <cBadge.Icon className="w-3.5 h-3.5 text-slate-400" />
                              )}
                            </div>
                            <span className="text-xs font-medium truncate">{cItem.name}</span>
                          </div>
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${cBadge.className}`}
                          >
                            {cBadge.label}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* 屏幕窗口分屏编排配置 (Window Snap Tiling) */}
              <div className="rounded-xl border border-white/10 bg-slate-900/60 p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-cyan-400" />
                    <div>
                      <span className="text-xs font-semibold text-slate-200">
                        屏幕窗口分屏编排
                      </span>
                    </div>
                  </div>
                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={comboLayoutEnabled}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setComboLayoutEnabled(checked);
                        if (checked && Object.keys(comboSlotAssignments).length === 0) {
                          setComboSlotAssignments(autoAssignSlots(comboLayoutType, comboFormItemIds));
                        }
                      }}
                      className="sr-only"
                    />
                    <div
                      className={`w-8 h-4 rounded-full transition-colors relative ${
                        comboLayoutEnabled ? 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.4)]' : 'bg-slate-700'
                      }`}
                    >
                      <div
                        className={`w-3.5 h-3.5 rounded-full bg-white absolute top-[1px] transition-transform ${
                          comboLayoutEnabled ? 'translate-x-4' : 'translate-x-0.5'
                        }`}
                      />
                    </div>
                    <span className="text-[11px] text-slate-300">
                      {comboLayoutEnabled ? '已启用' : '未启用'}
                    </span>
                  </label>
                </div>

                {comboLayoutEnabled && (
                  <div className="space-y-3 pt-2 border-t border-white/5">
                    {/* 多显示器目标定向选择器 (检测到系统有多个屏幕时自动呈现) */}
                    {systemMonitors.length > 1 && (
                      <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-black/40 border border-white/5">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <Monitor className="w-3.5 h-3.5 text-cyan-400" />
                          <span className="text-[11px] font-medium">目标投放屏幕:</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {systemMonitors.map((mon) => {
                            const isChosen = comboTargetMonitorIndex === mon.index;
                            return (
                              <button
                                key={mon.index}
                                type="button"
                                onClick={() => setComboTargetMonitorIndex(mon.index)}
                                className={`px-2.5 py-1 rounded-md text-[11px] font-mono border transition-all ${
                                  isChosen
                                    ? 'bg-cyan-500/20 text-cyan-200 border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.25)] font-semibold'
                                    : 'bg-white/5 text-slate-400 border-white/10 hover:text-slate-200 hover:bg-white/10'
                                }`}
                              >
                                {mon.isPrimary ? `屏幕 ${mon.index + 1} (主屏)` : `屏幕 ${mon.index + 1} (副屏)`}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* 预设分屏样式选择卡片 */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {LAYOUT_PRESETS.map((preset) => {
                        const isPresetActive = comboLayoutType === preset.id;
                        const PresetIcon = preset.icon;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => {
                              setComboLayoutType(preset.id);
                              setComboSlotAssignments(autoAssignSlots(preset.id, comboFormItemIds));
                            }}
                            className={`p-2 rounded-lg border text-left transition-all flex flex-col justify-between ${
                              isPresetActive
                                ? 'border-cyan-500/60 bg-cyan-500/15 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                                : 'border-white/10 bg-black/30 hover:border-white/20 hover:bg-white/5'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <PresetIcon
                                className={`w-4 h-4 ${
                                  isPresetActive ? 'text-cyan-400' : 'text-slate-400'
                                }`}
                              />
                              {isPresetActive && (
                                <Check className="w-3 h-3 text-cyan-400 stroke-[3]" />
                              )}
                            </div>
                            <div>
                              <div
                                className={`text-[11px] font-medium ${
                                  isPresetActive ? 'text-cyan-200' : 'text-slate-300'
                                }`}
                              >
                                {preset.name}
                              </div>
                              <div className="text-[9px] text-slate-500 truncate">
                                {preset.desc}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* 象限槽位与子启动项绑定列表 */}
                    <div className="space-y-1.5 bg-black/40 rounded-lg p-2.5 border border-white/5">
                      <div className="text-[11px] font-medium text-slate-400 mb-1 flex items-center justify-between">
                        <span>象限绑定</span>
                        <button
                          type="button"
                          onClick={() => {
                            setComboSlotAssignments(autoAssignSlots(comboLayoutType, comboFormItemIds));
                          }}
                          className="text-[10px] text-cyan-400 hover:text-cyan-300 hover:underline"
                        >
                          自动依序填入
                        </button>
                      </div>

                      {(() => {
                        const curPreset =
                          LAYOUT_PRESETS.find((p) => p.id === comboLayoutType) || LAYOUT_PRESETS[0];
                        const selectedSubItems = storage.items.filter((it) =>
                          comboFormItemIds.includes(it.id)
                        );

                        return curPreset.slots.map((slot) => {
                          const currentBoundId = comboSlotAssignments[slot.slotId] || '';
                          return (
                            <div
                              key={slot.slotId}
                              className="flex items-center justify-between gap-2 py-1 text-xs"
                            >
                              <div className="flex items-center gap-1.5 w-40 shrink-0 text-slate-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                                <span className="font-mono text-[11px] truncate">{slot.name}</span>
                              </div>
                              <select
                                value={currentBoundId}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setComboSlotAssignments((prev) => ({
                                    ...prev,
                                    [slot.slotId]: val,
                                  }));
                                }}
                                className="flex-1 h-7 bg-slate-900 border border-white/10 rounded px-2 text-[11px] text-slate-200 outline-none focus:border-cyan-500/50"
                              >
                                <option value="">-- 未分配 (保持默认位置) --</option>
                                {selectedSubItems.map((s) => (
                                  <option key={s.id} value={s.id}>
                                    {s.name} ({s.type})
                                  </option>
                                ))}
                              </select>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setIsComboModalOpen(false);
                    setEditingComboItem(null);
                  }}
                  className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg font-semibold bg-rose-500/25 hover:bg-rose-500/35 text-rose-200 border border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.25)] transition-all tactile-btn"
                >
                  {editingComboItem ? '保存组合修改' : '确认创建组合'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= 常规单项启动项新增/编辑模态框 ================= */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-950/95 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-semibold text-slate-100">
                {editingItem ? '编辑启动项设置' : '添加新的启动项'}
              </h3>
              <button
                onClick={() => setIsItemModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* 启动类型选择器 */}
              <div>
                <label className="block text-slate-400 mb-1 font-medium">类型 *</label>
                <div className="grid grid-cols-5 gap-1 bg-black/30 p-1 rounded-lg border border-white/[0.06]">
                  {(['app', 'url', 'folder', 'script', 'bundle'] as LauncherItemType[]).map((t) => {
                    const b = renderTypeBadge(t);
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => {
                          if (t === 'bundle') {
                            setIsItemModalOpen(false);
                            handleOpenCreateComboModal();
                          } else {
                            setFormType(t);
                          }
                        }}
                        className={`py-1 rounded text-xs flex items-center justify-center gap-1 transition-all ${
                          formType === t
                            ? 'bg-white/15 text-slate-100 font-semibold shadow-sm'
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        <b.Icon className="w-3 h-3" />
                        <span>{b.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 动态录入区：针对网页仅需 URL 与名称；针对本地程序/文件夹提供一键拉起资源管理器 */}
              {formType === 'url' ? (
                <>
                  {/* 目标网址 */}
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">目标网址 (URL) *</label>
                    <input
                      type="text"
                      placeholder="例如: https://github.com 或 https://www.bilibili.com"
                      value={formTarget}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormTarget(val);
                        if (!formName.trim() && val.includes('://')) {
                          try {
                            const urlObj = new URL(val);
                            const host = urlObj.hostname.replace(/^www\./, '');
                            const domainMain = host.split('.')[0];
                            if (domainMain) {
                              setFormName(domainMain.charAt(0).toUpperCase() + domainMain.slice(1));
                            }
                          } catch {
                            // ignore
                          }
                        }
                      }}
                      className="w-full h-8 px-3 rounded-lg bg-black/40 border border-white/10 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 font-mono"
                    />
                  </div>

                  {/* 网页名称 */}
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">网页名称 *</label>
                    <input
                      type="text"
                      placeholder="例如: GitHub / 百度 / 内网系统"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full h-8 px-3 rounded-lg bg-black/40 border border-white/10 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                </>
              ) : formType === 'bundle' ? (
                <div>
                  <label className="block text-slate-400 mb-1 font-medium flex items-center justify-between">
                    <span>组合包含的应用与脚本 ({formBundleItemIds.length} 项) *</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (formBundleItemIds.length === candidateBundleItems.length) {
                          setFormBundleItemIds([]);
                        } else {
                          setFormBundleItemIds(candidateBundleItems.map((i) => i.id));
                        }
                      }}
                      className="text-[10px] text-cyan-400 hover:underline"
                    >
                      {formBundleItemIds.length === candidateBundleItems.length ? '清空' : '全选'}
                    </button>
                  </label>
                  <div className="max-h-48 overflow-y-auto rounded-lg border border-white/10 bg-black/30 p-2 space-y-1">
                    {candidateBundleItems.length === 0 ? (
                      <div className="py-4 text-center text-slate-500 text-[11px]">
                        暂无可用应用或脚本，请先添加基础应用
                      </div>
                    ) : (
                      candidateBundleItems.map((cItem) => {
                        const isChecked = formBundleItemIds.includes(cItem.id);
                        const cBadge = renderTypeBadge(cItem.type);
                        return (
                          <div
                            key={cItem.id}
                            onClick={() => {
                              setFormBundleItemIds((prev) =>
                                prev.includes(cItem.id)
                                  ? prev.filter((id) => id !== cItem.id)
                                  : [...prev, cItem.id]
                              );
                            }}
                            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${
                              isChecked
                                ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-200'
                                : 'hover:bg-white/5 border border-transparent text-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div
                                className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                                  isChecked
                                    ? 'bg-cyan-500 border-cyan-400 text-black'
                                    : 'border-white/20 bg-black/40'
                                }`}
                              >
                                {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                              </div>
                              {cItem.icon ? (
                                <img
                                  src={cItem.icon}
                                  alt={cItem.name}
                                  className="w-4 h-4 object-contain rounded shrink-0"
                                />
                              ) : (
                                <cBadge.Icon className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                              )}
                              <span className="truncate text-xs font-medium">{cItem.name}</span>
                            </div>
                            <span
                              className={`text-[9px] font-mono px-1 py-0.2 rounded border shrink-0 ${cBadge.className}`}
                            >
                              {cBadge.label}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              ) : (
                <>
                  {/* 目标物理路径 + 一键唤起资源管理器按钮 (REQ-LAUNCHER-NATIVE-PICKER-01) */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-slate-400 font-medium">
                        {formType === 'script'
                          ? '脚本文件或指令 *'
                          : formType === 'folder'
                          ? '文件夹路径 *'
                          : '应用程序路径 / .lnk 快捷方式 *'}
                      </label>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder={
                          formType === 'folder'
                            ? '点击右侧按钮选择文件夹，或输入绝对路径...'
                            : formType === 'script'
                            ? '点击右侧选择脚本文件，或输入指令...'
                            : '点击右侧选择程序或快捷方式 (.exe / .lnk)...'
                        }
                        value={formTarget}
                        onChange={(e) => setFormTarget(e.target.value)}
                        className="flex-1 h-8 px-3 rounded-lg bg-black/40 border border-white/10 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 min-w-0 font-mono text-[11.5px]"
                      />
                      <button
                        type="button"
                        onClick={handlePickFile}
                        className="px-3 h-8 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 text-xs font-medium transition-all tactile-btn shrink-0 whitespace-nowrap shadow-[0_0_10px_rgba(6,182,212,0.1)]"
                        title={formType === 'folder' ? '打开 Windows 资源管理器选择文件夹' : '打开 Windows 资源管理器选择文件'}
                      >
                        <FolderOpen className="w-3.5 h-3.5 shrink-0" />
                        <span>浏览选择</span>
                      </button>
                    </div>
                  </div>

                  {/* 启动项名称 */}
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">名称 *</label>
                    <input
                      type="text"
                      placeholder="例如: 微信 / 飞书 / 命令行工具"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full h-8 px-3 rounded-lg bg-black/40 border border-white/10 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                </>
              )}

              {/* 所属分类 */}
              <div>
                <label className="block text-slate-400 mb-1 font-medium">所属分类</label>
                <select
                  value={formCategoryId}
                  onChange={(e) => setFormCategoryId(e.target.value)}
                  className="w-full h-8 px-2.5 rounded-lg bg-black/40 border border-white/10 text-slate-100 focus:outline-none focus:border-cyan-500/50"
                >
                  {storage.categories.map((c) => (
                    <option key={c.id} value={c.id} className="bg-slate-900 text-slate-200">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 高级选项 (启动参数 / 工作目录 / 辅助描述) - 默认折叠收拢，不打扰新手 */}
              {(formType === 'app' || formType === 'script') && (
                <details className="group pt-1 border-t border-white/[0.06]">
                  <summary className="cursor-pointer text-[11px] text-slate-400 hover:text-slate-200 select-none flex items-center justify-between py-1 transition-colors">
                    <span className="flex items-center gap-1.5">
                      <span>高级选项 (启动参数 / 工作目录)</span>
                      {(formArgs || formWorkingDir || formDescription) && (
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      )}
                    </span>
                    <span className="text-[10px] text-slate-500 group-open:rotate-180 transition-transform">▼</span>
                  </summary>

                  <div className="space-y-3 pt-2 text-xs">
                    <div>
                      <label className="block text-slate-400 mb-1 font-medium">启动参数 (可选)</label>
                      <input
                        type="text"
                        placeholder="例如: --profile default 或 -v"
                        value={formArgs}
                        onChange={(e) => setFormArgs(e.target.value)}
                        className="w-full h-8 px-3 rounded-lg bg-black/40 border border-white/10 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1 font-medium">
                        工作目录 (可选)
                      </label>
                      <input
                        type="text"
                        placeholder="例如: D:\\APP\\weixin"
                        value={formWorkingDir}
                        onChange={(e) => setFormWorkingDir(e.target.value)}
                        className="w-full h-8 px-3 rounded-lg bg-black/40 border border-white/10 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1 font-medium">辅助描述 (可选)</label>
                      <input
                        type="text"
                        placeholder="简短说明用途"
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        className="w-full h-8 px-3 rounded-lg bg-black/40 border border-white/10 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50"
                      />
                    </div>
                  </div>
                </details>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsItemModalOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSaveItem}
                className="px-4 py-1.5 rounded-lg text-xs font-medium bg-brand-primary text-black hover:bg-brand-primary/90 transition-colors shadow-sm"
              >
                {editingItem ? '保存设置' : '确认添加'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
