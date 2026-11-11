import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
} from 'lucide-react';
import {
  LauncherItem,
  LauncherCategory,
  LauncherStorageData,
  LauncherItemType,
  DEFAULT_LAUNCHER_CATEGORY_ID,
} from '../types/launcher.ts';
import {
  loadLauncherStorage,
  saveLauncherStorage,
  createDefaultLauncherStorage,
  LAUNCHER_STORAGE_KEY_V2,
} from '../services/db.ts';

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

  // 卡片操作菜单与执行状态反馈
  const [activeMenuDocId, setActiveMenuDocId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [runningItemIds, setRunningItemIds] = useState<Record<string, boolean>>({});

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
      let hasUpdates = false;
      const updatedItems = [...storage.items];

      for (const item of itemsNeedingIcon) {
        try {
          const { invoke } = await import('@tauri-apps/api/core');
          const iconDataUrl = await invoke<string>('get_app_icon', {
            target: item.target.trim(),
          });
          if (iconDataUrl && iconDataUrl.startsWith('data:image/')) {
            const idx = updatedItems.findIndex((it) => it.id === item.id);
            if (idx >= 0) {
              updatedItems[idx] = { ...updatedItems[idx], icon: iconDataUrl };
              hasUpdates = true;
            }
          }
        } catch (_e) {
          // 提取失败忽略，平滑回退语义图标
        }
      }

      if (hasUpdates && isMounted) {
        setStorage((prev) => {
          const next = { ...prev, items: updatedItems };
          saveLauncherStorage(next);
          return next;
        });
      }
    };

    fetchIcons();
    return () => {
      isMounted = false;
    };
  }, [storage.items]);

  // 提示反馈自动清除
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

  // 可用于组成 Bundle 套件的全部候选子项 (排除 bundle 自身以防死循环)
  const candidateBundleItems = useMemo(() => {
    return storage.items.filter(
      (item) => item.type !== 'bundle' && item.id !== editingItem?.id
    );
  }, [storage.items, editingItem]);

  // ==================== 启动调度核心逻辑 ====================

  const handleLaunchItem = useCallback(
    async (item: LauncherItem): Promise<boolean> => {
      setRunningItemIds((prev) => ({ ...prev, [item.id]: true }));
      try {
        const { invoke } = await import('@tauri-apps/api/core');

        // 1. 如果是 Bundle 复合套件：依次唤起绑定的全部子项
        if (item.type === 'bundle') {
          const subItemIds = item.bundleItemIds || [];
          const subItems = storage.items.filter((it) => subItemIds.includes(it.id));
          if (subItems.length === 0) {
            setFeedback({
              type: 'error',
              message: `【${item.name}】组合尚未配置或未找到关联子项`,
            });
            return false;
          }
          setFeedback({
            type: 'success',
            message: `正在并发唤起【${item.name}】套件共 ${subItems.length} 个项目...`,
          });
          for (const sub of subItems) {
            await handleLaunchItem(sub);
            await new Promise((r) => setTimeout(r, 150));
          }
          return true;
        }

        // 2. 如果是脚本
        if (item.type === 'script') {
          const output = await invoke<string>('execute_custom_script', {
            scriptType: 'powershell',
            scriptContent: item.target,
            workingDir: item.workingDir || undefined,
          });
          setFeedback({
            type: 'success',
            message: `脚本执行成功: ${item.name} (${output.slice(0, 30)}${output.length > 30 ? '...' : ''})`,
          });
          return true;
        }

        // 3. 应用程序、快捷方式、网页或目录
        await invoke<string>('launch_custom_target', {
          target: item.target,
          args: item.args || undefined,
          workingDir: item.workingDir || undefined,
        });
        setFeedback({
          type: 'success',
          message: `已成功拉起: ${item.name}`,
        });
        return true;
      } catch (err: unknown) {
        setFeedback({
          type: 'error',
          message: `启动失败: ${err instanceof Error ? err.message : String(err)}`,
        });
        return false;
      } finally {
        setRunningItemIds((prev) => ({ ...prev, [item.id]: false }));
      }
    },
    [storage.items]
  );

  // 一键全启动 (当前分类全部项目)
  const handleBatchLaunchAll = useCallback(async () => {
    if (currentItems.length === 0) return;
    setFeedback({
      type: 'success',
      message: `正在拉起【${activeCategory?.name}】全套 ${currentItems.length} 个启动项...`,
    });

    for (const item of currentItems) {
      await handleLaunchItem(item);
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
  }, [currentItems, activeCategory, handleLaunchItem]);

  // ==================== 即时多选批量启动交互 ====================

  const handleToggleSelectItem = (id: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedItemIds.length === currentItems.length) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(currentItems.map((i) => i.id));
    }
  };

  const handleLaunchSelected = async () => {
    if (selectedItemIds.length === 0) return;
    const itemsToLaunch = storage.items.filter((i) => selectedItemIds.includes(i.id));
    setFeedback({
      type: 'success',
      message: `正在依次唤起所勾选的 ${itemsToLaunch.length} 个应用与脚本...`,
    });

    for (const item of itemsToLaunch) {
      await handleLaunchItem(item);
      await new Promise((resolve) => setTimeout(resolve, 150));
    }

    setIsSelectMode(false);
    setSelectedItemIds([]);
  };

  // ==================== 分类操作 ====================

  const handleConfirmCreateCategory = () => {
    const trimmed = newCategoryName.trim();
    if (trimmed) {
      const newId = `cat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const newCat: LauncherCategory = {
        id: newId,
        name: trimmed,
        createdAt: Date.now(),
      };
      setStorage((prev) => ({
        ...prev,
        categories: [...prev.categories, newCat],
        activeCategoryId: newId,
      }));
      setActiveCategoryId(newId);
      setNewCategoryName('');
      setIsCreatingCategory(false);
    }
  };

  const handleConfirmRenameCategory = (id: string) => {
    const trimmed = editingCategoryName.trim();
    if (trimmed) {
      setStorage((prev) => ({
        ...prev,
        categories: prev.categories.map((c) =>
          c.id === id ? { ...c, name: trimmed } : c
        ),
      }));
    }
    setRenamingCategoryId(null);
  };

  const handleDeleteCategory = (id: string) => {
    if (storage.categories.length <= 1) {
      alert('至少需要保留一个分类！');
      return;
    }
    const defaultCat =
      storage.categories.find((c) => c.isDefault)?.id ||
      storage.categories.find((c) => c.id !== id)?.id ||
      DEFAULT_LAUNCHER_CATEGORY_ID;

    setStorage((prev) => {
      // 被删除分类的启动项平移到默认分类
      const updatedItems = prev.items.map((item) =>
        item.categoryId === id ? { ...item, categoryId: defaultCat } : item
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

  const handleSaveItem = async () => {
    const trimmedName = formName.trim();
    const trimmedTarget = formTarget.trim();

    if (!trimmedName) {
      alert('请填写启动项名称！');
      return;
    }

    if (formType !== 'bundle' && !trimmedTarget) {
      alert('请填写目标路径、网址或脚本指令！');
      return;
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
                workingDir: formWorkingDir.trim() || undefined,
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
        workingDir: formWorkingDir.trim() || undefined,
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
    <div className="flex h-full w-full bg-transparent text-slate-200 select-none overflow-hidden min-w-0">
      {/* ================= 左侧分类管理侧栏 (固定 w-64 黄金宽度) ================= */}
      <div className="w-64 flex-shrink-0 flex flex-col border-r border-white/[0.08] bg-black/20 backdrop-blur-md min-w-0">
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
            className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary border border-brand-primary/30 transition-colors tactile-btn shrink-0 whitespace-nowrap"
          >
            <FolderPlus className="w-3.5 h-3.5 shrink-0" />
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
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono border ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30 font-semibold'
                        : 'bg-white/[0.06] text-fg-muted border-white/[0.06] group-hover:text-slate-300'
                    }`}
                  >
                    {count}
                  </span>

                  {!cat.isDefault && (
                    <div
                      className="hidden group-hover:flex items-center gap-0.5"
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
        {/* 顶部工具栏：高度严格对齐 h-[49px]，基准底线与左栏 100% 贯穿对齐 */}
        <div className="h-[49px] px-4 flex items-center justify-between border-b border-white/[0.08] bg-white/[0.01] shrink-0 min-w-0">
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
            <div className="flex items-center gap-2 min-w-0">
              <h2 className="text-xs font-semibold text-fg-primary tracking-tight font-mono shrink-0 whitespace-nowrap">
                {activeCategory?.name || '默认工具'}
              </h2>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-white/[0.06] text-fg-muted border border-white/[0.06] shrink-0 whitespace-nowrap">
                {currentItems.length} 项
              </span>
            </div>
          )}

          {/* 右侧动作区：动态切换常规与多选操作 */}
          <div className="flex items-center gap-2.5 shrink-0">
            {isSelectMode ? (
              <>
                <button
                  type="button"
                  disabled={selectedItemIds.length === 0}
                  onClick={handleLaunchSelected}
                  title="立即同时唤醒选中的应用或脚本"
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all tactile-btn shrink-0 ${
                    selectedItemIds.length > 0
                      ? 'bg-emerald-500/25 hover:bg-emerald-500/35 text-emerald-300 border border-emerald-500/40 shadow-[0_0_14px_rgba(16,185,129,0.25)]'
                      : 'bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 fill-current shrink-0" />
                  <span>启动所选项 ({selectedItemIds.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsSelectMode(false);
                    setSelectedItemIds([]);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-white/10 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>退出</span>
                </button>
              </>
            ) : (
              <>
                {/* 搜索框：内嵌紧凑形态 */}
                <div className="relative w-48 shrink-0">
                  <Search className="w-3.5 h-3.5 text-fg-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="搜索名称或指令..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-7 bg-black/30 border border-white/10 rounded-lg pl-8 pr-7 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-all font-sans"
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

                {/* 自由多选启动按钮 */}
                {currentItems.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsSelectMode(true);
                      setSelectedItemIds([]);
                    }}
                    title="自由勾选任意多个应用或脚本同时启动"
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition-colors tactile-btn shrink-0 whitespace-nowrap"
                  >
                    <CheckSquare className="w-3.5 h-3.5 shrink-0" />
                    <span>多选启动</span>
                  </button>
                )}

                {/* 一键全启动按钮 */}
                {currentItems.length > 0 && (
                  <button
                    type="button"
                    onClick={handleBatchLaunchAll}
                    title="一键启动当前分类下全部项目"
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 transition-colors tactile-btn shrink-0 whitespace-nowrap"
                  >
                    <Zap className="w-3.5 h-3.5 fill-current shrink-0" />
                    <span>全启动</span>
                  </button>
                )}

                {/* 添加启动项按钮 */}
                <button
                  type="button"
                  onClick={handleOpenAddModal}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary border border-brand-primary/30 transition-colors tactile-btn shrink-0 whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5 shrink-0" />
                  <span>新建项</span>
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
                ? 'bg-emerald-500/15 text-emerald-300 border-b border-emerald-500/30'
                : 'bg-rose-500/15 text-rose-300 border-b border-rose-500/30'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            )}
            <span className="truncate">{feedback.message}</span>
          </div>
        )}

        {/* 启动项卡片大盘网格 (自适应多列晶体网格) */}
        <div className="flex-1 overflow-y-auto p-4 min-w-0">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3.5">
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

            {/* 启动项卡片列表 */}
            {currentItems.map((item) => {
              const badge = renderTypeBadge(item.type);
              const isRunning = runningItemIds[item.id];
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
                  {/* 顶栏：多选复选框 / 类型 Badge 与下拉设置菜单 */}
                  <div className="flex items-center justify-between gap-1.5">
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
                      <span
                        className={`flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.2 rounded border ${badge.className}`}
                      >
                        <badge.Icon className="w-2.5 h-2.5" />
                        <span>
                          {item.type === 'bundle'
                            ? `组合·${item.bundleItemIds?.length || 0}`
                            : badge.label}
                        </span>
                      </span>
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

                  {/* 核心视觉焦点：40x40 高清原生图标 + 应用名称 (完全纯净化，0暴露长路径与多余描述) */}
                  <div className="my-auto flex flex-col items-center justify-center min-w-0">
                    <div className="w-10 h-10 flex items-center justify-center shrink-0">
                      {item.type === 'bundle' ? (
                        <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-300 group-hover:scale-110 group-hover:bg-rose-500/25 transition-all duration-200 shadow-[0_0_12px_rgba(244,63,94,0.2)]">
                          <Layers className="w-5 h-5" />
                        </div>
                      ) : item.icon && item.icon.startsWith('data:image/') ? (
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
                    </div>

                    <h3 className="mt-2 text-xs font-semibold text-slate-200 group-hover:text-cyan-300 truncate max-w-full text-center tracking-tight px-1 transition-colors">
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
                        {item.type === 'bundle' ? '点击启动全套' : '点击快速启动'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ================= 启动项设置与编辑模态框 (收敛展示底层物理路径与参数) ================= */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-950/95 border border-white/10 shadow-2xl p-5 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-semibold text-slate-100 font-mono">
                {editingItem ? '启动项设置' : '添加快速启动项'}
              </h3>
              <button
                type="button"
                onClick={() => setIsItemModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              {/* 名称 */}
              <div>
                <label className="block text-slate-400 mb-1 font-medium">名称 *</label>
                <input
                  type="text"
                  placeholder="例如: 日常办公套餐 / 微信 / 飞书"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full h-8 px-3 rounded-lg bg-black/40 border border-white/10 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              {/* 启动类型选择器 */}
              <div>
                <label className="block text-slate-400 mb-1 font-medium">类型 *</label>
                <div className="grid grid-cols-5 gap-1 bg-black/30 p-1 rounded-lg border border-white/[0.06]">
                  {(['app', 'bundle', 'script', 'url', 'folder'] as LauncherItemType[]).map((t) => {
                    const b = renderTypeBadge(t);
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setFormType(t)}
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

              {/* 动态内容区：如果是 bundle 类型，展示包含子项复选列表；否则展示目标路径 */}
              {formType === 'bundle' ? (
                <div>
                  <label className="block text-slate-400 mb-1 font-medium flex items-center justify-between">
                    <span>捆绑包含的应用与脚本 ({formBundleItemIds.length} 项) *</span>
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
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">
                    {formType === 'script'
                      ? 'PowerShell 脚本指令 *'
                      : formType === 'url'
                      ? '目标网址 (URL) *'
                      : formType === 'folder'
                      ? '文件夹绝对路径 *'
                      : '应用程序路径 / .lnk 快捷方式 / 命令 *'}
                  </label>
                  {formType === 'script' ? (
                    <textarea
                      rows={3}
                      placeholder="例如: pnpm dev 或 Get-Process"
                      value={formTarget}
                      onChange={(e) => setFormTarget(e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-black/40 border border-white/10 text-slate-100 font-mono text-xs placeholder-slate-600 focus:outline-none focus:border-cyan-500/50"
                    />
                  ) : (
                    <input
                      type="text"
                      placeholder={
                        formType === 'url'
                          ? '例如: https://github.com'
                          : formType === 'folder'
                          ? '例如: D:\\Project 或 C:\\Users'
                          : '例如: D:\\APP\\weixin\\Weixin.exe 或 calc.exe'
                      }
                      value={formTarget}
                      onChange={(e) => setFormTarget(e.target.value)}
                      className="w-full h-8 px-3 rounded-lg bg-black/40 border border-white/10 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50"
                    />
                  )}
                  {formType === 'app' && (
                    <p className="mt-1 text-[10px] text-slate-500">
                      支持可执行文件 (.exe)、桌面快捷方式 (.lnk) 或系统命令，系统将自动提取原生图标。
                    </p>
                  )}
                </div>
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

              {/* 启动参数 (仅应用与脚本可选) */}
              {(formType === 'app' || formType === 'script') && (
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">启动参数 (可选)</label>
                  <input
                    type="text"
                    placeholder="例如: --profile default 或 -v"
                    value={formArgs}
                    onChange={(e) => setFormArgs(e.target.value)}
                    className="w-full h-8 px-3 rounded-lg bg-black/40 border border-white/10 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
              )}

              {/* 工作目录 (仅应用与脚本可选) */}
              {(formType === 'app' || formType === 'script') && (
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">工作目录 (可选，默认自动推导为应用所在目录)</label>
                  <input
                    type="text"
                    placeholder="例如: D:\\APP\\weixin"
                    value={formWorkingDir}
                    onChange={(e) => setFormWorkingDir(e.target.value)}
                    className="w-full h-8 px-3 rounded-lg bg-black/40 border border-white/10 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
              )}

              {/* 描述 */}
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
