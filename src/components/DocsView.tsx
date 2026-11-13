import React, { useState, useEffect, useMemo } from 'react';
import { DocPage, DbCollection, DocPartition } from '../types/docs.ts';
import {
  loadDocPartitions,
  saveDocPartition,
  deleteDocPartition,
  createSubPartition,
  loadDocPages,
  saveDocPage,
  deleteDocPage,
  loadDbCollections,
  saveDbCollection,
  deleteDbCollection,
  INITIAL_COLLECTION_SCHEMA,
} from '../services/docsDb.ts';
import { BlockEditor } from './docs/editor/BlockEditor.tsx';
import { TableDatabaseView } from './docs/database/TableDatabaseView.tsx';
import {
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Search,
  Star,
  Table,
  Folder,
  FolderPlus,
  Database,
  Edit2,
  Check,
  X,
} from 'lucide-react';

export const DocsView: React.FC = () => {
  const [partitions, setPartitions] = useState<DocPartition[]>([]);
  const [pages, setPages] = useState<DocPage[]>([]);
  const [collections, setCollections] = useState<DbCollection[]>([]);
  const [activeType, setActiveType] = useState<'page' | 'collection'>('page');
  const [activeId, setActiveId] = useState<string>('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // 子分区新建与重命名状态
  const [isCreatingSubPart, setIsCreatingSubPart] = useState(false);
  const [newSubPartName, setNewSubPartName] = useState('');
  const [editingPartId, setEditingPartId] = useState<string | null>(null);
  const [editingPartName, setEditingPartName] = useState('');

  // 初始化加载分区、文档与多维表数据
  useEffect(() => {
    let isMounted = true;
    const initData = async () => {
      setLoading(true);
      try {
        const [loadedParts, loadedPages, loadedCols] = await Promise.all([
          loadDocPartitions(),
          loadDocPages(),
          loadDbCollections(),
        ]);
        if (isMounted) {
          setPartitions(loadedParts);
          setPages(loadedPages);
          setCollections(loadedCols);
          if (loadedPages.length > 0) {
            setActiveType('page');
            setActiveId(loadedPages[0].id);
          } else if (loadedCols.length > 0) {
            setActiveType('collection');
            setActiveId(loadedCols[0].id);
          } else {
            setActiveId('');
          }
        }
      } catch (err) {
        console.error('Failed to init docs data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    initData();
    return () => {
      isMounted = false;
    };
  }, []);

  // 1. 折叠/展开分区
  const handleTogglePartition = async (partId: string) => {
    const updated = partitions.map((p) => {
      if (p.id !== partId) return p;
      return { ...p, isCollapsed: !p.isCollapsed };
    });
    setPartitions(updated);
    const target = updated.find((p) => p.id === partId);
    if (target) {
      await saveDocPartition(target);
    }
  };

  // 2. 在「私人」根模块下创建新子分区
  const handleCreateSubPartitionSubmit = async () => {
    const name = newSubPartName.trim() || '未命名分区';
    const sub = await createSubPartition('part_private', name);
    setPartitions((prev) => [...prev, sub]);
    setIsCreatingSubPart(false);
    setNewSubPartName('');
  };

  // 3. 重命名子分区
  const handleRenamePartitionSubmit = async (partId: string) => {
    const name = editingPartName.trim();
    if (!name) {
      setEditingPartId(null);
      return;
    }
    const target = partitions.find((p) => p.id === partId);
    if (target) {
      const updated = { ...target, name, updatedAt: Date.now() };
      setPartitions((prev) => prev.map((p) => (p.id === partId ? updated : p)));
      await saveDocPartition(updated);
    }
    setEditingPartId(null);
  };

  // 4. 删除子分区
  const handleDeleteSubPartition = async (e: React.MouseEvent, partId: string) => {
    e.stopPropagation();
    const updatedPages = pages.map((p) =>
      p.partitionId === partId ? { ...p, partitionId: 'part_private' } : p
    );
    const updatedCols = collections.map((c) =>
      c.partitionId === partId ? { ...c, partitionId: 'part_private' } : c
    );
    setPages(updatedPages);
    setCollections(updatedCols);
    setPartitions((prev) => prev.filter((p) => p.id !== partId));
    await deleteDocPartition(partId);

    pages
      .filter((p) => p.partitionId === partId)
      .forEach((p) => saveDocPage({ ...p, partitionId: 'part_private' }));
    collections
      .filter((c) => c.partitionId === partId)
      .forEach((c) => saveDbCollection({ ...c, partitionId: 'part_private' }));
  };

  // 5. 在指定分区新建独立笔记
  const handleCreatePageInPartition = async (partitionId: string = 'part_private') => {
    const newPage: DocPage = {
      id: 'page_' + Date.now(),
      partitionId,
      title: '未命名笔记',
      icon: '📄',
      isFavorite: false,
      isArchived: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const nextPages = [newPage, ...pages];
    setPages(nextPages);
    setActiveType('page');
    setActiveId(newPage.id);
    await saveDocPage(newPage);
  };

  // 6. 在指定分区新建笔记数据库
  const handleCreateCollectionInPartition = async (partitionId: string = 'part_private') => {
    const newCol: DbCollection = {
      id: 'col_' + Date.now(),
      partitionId,
      name: '未命名笔记数据库',
      schema: { ...INITIAL_COLLECTION_SCHEMA },
      views: [{ id: 'v_' + Date.now(), name: '所有笔记', type: 'table' }],
      isFavorite: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const nextCols = [newCol, ...collections];
    setCollections(nextCols);
    setActiveType('collection');
    setActiveId(newCol.id);
    await saveDbCollection(newCol);
  };

  // 7. 删除页面
  const handleDeletePage = async (e: React.MouseEvent, pageId: string) => {
    e.stopPropagation();
    const nextPages = pages.filter((p) => p.id !== pageId);
    setPages(nextPages);
    if (activeId === pageId) {
      if (nextPages.length > 0) {
        setActiveId(nextPages[0].id);
      } else if (collections.length > 0) {
        setActiveType('collection');
        setActiveId(collections[0].id);
      } else {
        setActiveId('');
      }
    }
    await deleteDocPage(pageId);
  };

  // 8. 删除笔记数据库
  const handleDeleteCollection = async (e: React.MouseEvent, colId: string) => {
    e.stopPropagation();
    const nextCols = collections.filter((c) => c.id !== colId);
    setCollections(nextCols);
    if (activeId === colId) {
      if (nextCols.length > 0) {
        setActiveId(nextCols[0].id);
      } else if (pages.length > 0) {
        setActiveType('page');
        setActiveId(pages[0].id);
      } else {
        setActiveId('');
      }
    }
    await deleteDbCollection(colId);
  };

  // 9. 更新文档标题
  const handleUpdatePageTitle = async (newTitle: string) => {
    const nextPages = pages.map((p) => {
      if (p.id !== activeId) return p;
      return { ...p, title: newTitle, updatedAt: Date.now() };
    });
    setPages(nextPages);
    const target = nextPages.find((p) => p.id === activeId);
    if (target) {
      await saveDocPage(target);
    }
  };

  // 10. 更新文档图标
  const handleUpdatePageIcon = async (newIcon: string) => {
    const nextPages = pages.map((p) => {
      if (p.id !== activeId) return p;
      return { ...p, icon: newIcon, updatedAt: Date.now() };
    });
    setPages(nextPages);
    const target = nextPages.find((p) => p.id === activeId);
    if (target) {
      await saveDocPage(target);
    }
  };

  // 11. 更新多维表格对象
  const handleUpdateCollection = (updatedCol: DbCollection) => {
    setCollections((prev) =>
      prev.map((c) => (c.id === updatedCol.id ? updatedCol : c))
    );
  };

  // 12. 切换当前条目收藏
  const handleToggleCurrentFavorite = async () => {
    if (!activeId) return;
    if (activeType === 'page') {
      const target = pages.find((p) => p.id === activeId);
      if (!target) return;
      const updated = { ...target, isFavorite: !target.isFavorite, updatedAt: Date.now() };
      setPages((prev) => prev.map((p) => (p.id === activeId ? updated : p)));
      await saveDocPage(updated);
    } else {
      const target = collections.find((c) => c.id === activeId);
      if (!target) return;
      const updated = { ...target, isFavorite: !target.isFavorite, updatedAt: Date.now() };
      setCollections((prev) => prev.map((c) => (c.id === activeId ? updated : c)));
      await saveDbCollection(updated);
    }
  };

  // 13. 快捷切换单个条目收藏
  const handleToggleItemFavorite = async (e: React.MouseEvent, type: 'page' | 'collection', id: string) => {
    e.stopPropagation();
    if (type === 'page') {
      const target = pages.find((p) => p.id === id);
      if (!target) return;
      const updated = { ...target, isFavorite: !target.isFavorite, updatedAt: Date.now() };
      setPages((prev) => prev.map((p) => (p.id === id ? updated : p)));
      await saveDocPage(updated);
    } else {
      const target = collections.find((c) => c.id === id);
      if (!target) return;
      const updated = { ...target, isFavorite: !target.isFavorite, updatedAt: Date.now() };
      setCollections((prev) => prev.map((c) => (c.id === id ? updated : c)));
      await saveDbCollection(updated);
    }
  };

  const selectedPage = pages.find((p) => p.id === activeId);
  const selectedCollection = collections.find((c) => c.id === activeId);

  const isCurrentFavorite =
    activeType === 'page'
      ? Boolean(selectedPage?.isFavorite)
      : Boolean(selectedCollection?.isFavorite);

  // 子分区
  const subPartitions = useMemo(() => {
    return partitions.filter((p) => p.parentId === 'part_private' || (p.parentId && p.parentId !== null));
  }, [partitions]);

  // 最近
  const recentItems = useMemo(() => {
    const pItems = pages.map((p) => ({
      id: p.id,
      title: p.title || '未命名笔记',
      icon: p.icon || '📄',
      type: 'page' as const,
      updatedAt: p.updatedAt,
      isFavorite: p.isFavorite,
    }));
    const cItems = collections.map((c) => ({
      id: c.id,
      title: c.name || '未命名数据库',
      icon: '📊',
      type: 'collection' as const,
      updatedAt: c.updatedAt,
      isFavorite: Boolean(c.isFavorite),
    }));
    const combined = [...pItems, ...cItems].sort((a, b) => b.updatedAt - a.updatedAt);
    if (!searchFilter.trim()) return combined.slice(0, 10);
    const filter = searchFilter.toLowerCase();
    return combined.filter((i) => i.title.toLowerCase().includes(filter)).slice(0, 10);
  }, [pages, collections, searchFilter]);

  // 收藏
  const favoriteItems = useMemo(() => {
    const pItems = pages
      .filter((p) => p.isFavorite)
      .map((p) => ({
        id: p.id,
        title: p.title || '未命名笔记',
        icon: p.icon || '📄',
        type: 'page' as const,
        updatedAt: p.updatedAt,
      }));
    const cItems = collections
      .filter((c) => c.isFavorite)
      .map((c) => ({
        id: c.id,
        title: c.name || '未命名数据库',
        icon: '📊',
        type: 'collection' as const,
        updatedAt: c.updatedAt,
      }));
    return [...pItems, ...cItems].sort((a, b) => b.updatedAt - a.updatedAt);
  }, [pages, collections]);

  // 面包屑
  const breadcrumbPath = useMemo(() => {
    if (!selectedPage && !selectedCollection) {
      return '';
    }
    const currentPartId =
      activeType === 'collection' ? selectedCollection?.partitionId : selectedPage?.partitionId;
    const title =
      activeType === 'collection'
        ? selectedCollection?.name || '笔记数据库'
        : selectedPage?.title || '笔记';

    if (!currentPartId || currentPartId === 'part_private') {
      return `私人 / ${title}`;
    }
    const sub = subPartitions.find((p) => p.id === currentPartId);
    if (sub) {
      return `私人 / ${sub.name} / ${title}`;
    }
    return `私人 / ${title}`;
  }, [activeType, selectedPage, selectedCollection, subPartitions]);

  return (
    <div className="flex-1 flex h-full w-full bg-[#080b11] text-slate-100 overflow-hidden select-none">
      {/* 左侧 Notion 风格纯净三分区侧栏 */}
      <div
        className={`border-r border-white/5 bg-[#0a0d14]/90 backdrop-blur-xl flex flex-col shrink-0 transition-all duration-200 relative ${
          sidebarCollapsed ? 'w-10' : 'w-60'
        }`}
      >
        {/* 侧栏顶端检索栏 */}
        <div className="h-[49px] border-b border-white/5 px-3 flex items-center justify-between shrink-0">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2 flex-1 mr-2">
              <div className="relative flex-1">
                <Search
                  size={12}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  type="text"
                  placeholder="搜索或询问 Ctrl+K"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-md pl-7 pr-2 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500/50"
                />
              </div>
            </div>
          )}

          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1 text-slate-500 hover:text-slate-300 rounded hover:bg-white/5 transition-colors shrink-0"
            title={sidebarCollapsed ? '展开侧栏' : '折叠侧栏'}
          >
            {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* 侧栏分区列表 (遵循少字原则：绝无多余文本说明) */}
        {!sidebarCollapsed && (
          <div className="flex-1 overflow-y-auto p-2 space-y-3 text-xs">
            {/* 1. 私人 (Private) */}
            <div>
              <div className="flex items-center justify-between px-2 py-1 text-[11px] font-semibold text-slate-400 hover:text-slate-200 cursor-pointer group rounded hover:bg-white/5">
                <div
                  className="flex items-center gap-1.5 flex-1"
                  onClick={() => handleTogglePartition('part_private')}
                >
                  <ChevronDown
                    size={12}
                    className={`text-slate-500 transition-transform ${
                      partitions.find((p) => p.id === 'part_private')?.isCollapsed
                        ? '-rotate-90'
                        : ''
                    }`}
                  />
                  <span>私人</span>
                </div>
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setIsCreatingSubPart(true)}
                    className="p-0.5 text-slate-400 hover:text-sky-400 rounded hover:bg-white/10"
                    title="新建子分区"
                  >
                    <FolderPlus size={12} />
                  </button>
                  <button
                    onClick={() => handleCreateCollectionInPartition('part_private')}
                    className="p-0.5 text-slate-400 hover:text-sky-400 rounded hover:bg-white/10"
                    title="新建数据库"
                  >
                    <Database size={12} />
                  </button>
                  <button
                    onClick={() => handleCreatePageInPartition('part_private')}
                    className="p-0.5 text-slate-400 hover:text-white rounded hover:bg-white/10"
                    title="新建笔记"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>

              {!partitions.find((p) => p.id === 'part_private')?.isCollapsed && (
                <div className="space-y-0.5 mt-0.5 pl-1">
                  {/* 新建子分区输入框 */}
                  {isCreatingSubPart && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-white/5 rounded border border-sky-500/30 my-1">
                      <Folder size={12} className="text-sky-400 shrink-0" />
                      <input
                        type="text"
                        autoFocus
                        placeholder="分区名称..."
                        value={newSubPartName}
                        onChange={(e) => setNewSubPartName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleCreateSubPartitionSubmit();
                          if (e.key === 'Escape') setIsCreatingSubPart(false);
                        }}
                        className="flex-1 bg-transparent border-none text-xs text-white focus:outline-none"
                      />
                      <button
                        onClick={handleCreateSubPartitionSubmit}
                        className="p-0.5 text-emerald-400 hover:text-emerald-300"
                      >
                        <Check size={11} />
                      </button>
                      <button
                        onClick={() => setIsCreatingSubPart(false)}
                        className="p-0.5 text-slate-400 hover:text-slate-300"
                      >
                        <X size={11} />
                      </button>
                    </div>
                  )}

                  {/* 子分区列表 */}
                  {subPartitions.map((sub) => {
                    const isCollapsed = sub.isCollapsed;
                    const isEditing = editingPartId === sub.id;
                    const subPages = pages.filter((p) => p.partitionId === sub.id);
                    const subCols = collections.filter((c) => c.partitionId === sub.id);

                    return (
                      <div key={sub.id} className="rounded overflow-hidden my-0.5">
                        <div className="flex items-center justify-between px-2 py-1 text-[11px] text-slate-300 hover:bg-white/5 cursor-pointer group">
                          <div
                            className="flex items-center gap-1.5 flex-1 min-w-0"
                            onClick={() => handleTogglePartition(sub.id)}
                          >
                            <ChevronDown
                              size={11}
                              className={`text-slate-500 transition-transform ${
                                isCollapsed ? '-rotate-90' : ''
                              }`}
                            />
                            <Folder size={12} className="text-amber-400/80 shrink-0" />
                            {isEditing ? (
                              <input
                                type="text"
                                autoFocus
                                value={editingPartName}
                                onChange={(e) => setEditingPartName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleRenamePartitionSubmit(sub.id);
                                  if (e.key === 'Escape') setEditingPartId(null);
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-black/50 border border-white/20 rounded px-1 py-0.5 text-xs text-white w-24 focus:outline-none"
                              />
                            ) : (
                              <span
                                className="truncate text-slate-300"
                                onDoubleClick={(e) => {
                                  e.stopPropagation();
                                  setEditingPartId(sub.id);
                                  setEditingPartName(sub.name);
                                }}
                              >
                                {sub.name}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCreateCollectionInPartition(sub.id);
                              }}
                              className="p-0.5 text-slate-400 hover:text-sky-400 rounded"
                              title="新建数据库"
                            >
                              <Database size={11} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCreatePageInPartition(sub.id);
                              }}
                              className="p-0.5 text-slate-400 hover:text-white rounded"
                              title="新建笔记"
                            >
                              <Plus size={11} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingPartId(sub.id);
                                setEditingPartName(sub.name);
                              }}
                              className="p-0.5 text-slate-400 hover:text-slate-200 rounded"
                              title="重命名"
                            >
                              <Edit2 size={10} />
                            </button>
                            <button
                              onClick={(e) => handleDeleteSubPartition(e, sub.id)}
                              className="p-0.5 text-slate-400 hover:text-rose-400 rounded"
                              title="删除分区"
                            >
                              <Trash2 size={10} />
                            </button>
                          </div>
                        </div>

                        {!isCollapsed && (
                          <div className="pl-4 space-y-0.5">
                            {subCols.map((c) => {
                              const isActive = activeType === 'collection' && activeId === c.id;
                              return (
                                <div
                                  key={c.id}
                                  onClick={() => {
                                    setActiveType('collection');
                                    setActiveId(c.id);
                                  }}
                                  className={`group flex items-center justify-between px-2 py-1 rounded cursor-pointer transition-colors ${
                                    isActive
                                      ? 'bg-sky-500/15 text-white font-medium border border-sky-500/30'
                                      : 'hover:bg-white/5 text-slate-300'
                                  }`}
                                >
                                  <div className="flex items-center gap-1.5 truncate">
                                    <Table size={12} className="text-sky-400 shrink-0" />
                                    <span className="truncate">{c.name}</span>
                                  </div>
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={(e) => handleToggleItemFavorite(e, 'collection', c.id)}
                                      className={`p-0.5 ${c.isFavorite ? 'text-amber-400' : 'text-slate-500 hover:text-amber-400'}`}
                                    >
                                      <Star size={10} className={c.isFavorite ? 'fill-amber-400' : ''} />
                                    </button>
                                    <button
                                      onClick={(e) => handleDeleteCollection(e, c.id)}
                                      className="p-0.5 text-slate-500 hover:text-rose-400 rounded"
                                    >
                                      <Trash2 size={10} />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}

                            {subPages.map((p) => {
                              const isActive = activeType === 'page' && activeId === p.id;
                              return (
                                <div
                                  key={p.id}
                                  onClick={() => {
                                    setActiveType('page');
                                    setActiveId(p.id);
                                  }}
                                  className={`group flex items-center justify-between px-2 py-1 rounded cursor-pointer transition-colors ${
                                    isActive
                                      ? 'bg-sky-500/15 text-white font-medium border border-sky-500/30'
                                      : 'hover:bg-white/5 text-slate-300'
                                  }`}
                                >
                                  <div className="flex items-center gap-1.5 truncate">
                                    <span className="text-xs shrink-0">{p.icon || '📄'}</span>
                                    <span className="truncate">{p.title || '未命名笔记'}</span>
                                  </div>
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={(e) => handleToggleItemFavorite(e, 'page', p.id)}
                                      className={`p-0.5 ${p.isFavorite ? 'text-amber-400' : 'text-slate-500 hover:text-amber-400'}`}
                                    >
                                      <Star size={10} className={p.isFavorite ? 'fill-amber-400' : ''} />
                                    </button>
                                    <button
                                      onClick={(e) => handleDeletePage(e, p.id)}
                                      className="p-0.5 text-slate-500 hover:text-rose-400 rounded"
                                    >
                                      <Trash2 size={10} />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* 私人直接根目录项 */}
                  {collections
                    .filter((c) => !c.partitionId || c.partitionId === 'part_private')
                    .map((c) => {
                      const isActive = activeType === 'collection' && activeId === c.id;
                      return (
                        <div
                          key={c.id}
                          onClick={() => {
                            setActiveType('collection');
                            setActiveId(c.id);
                          }}
                          className={`group flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer transition-colors ${
                            isActive
                              ? 'bg-sky-500/15 text-white font-medium border border-sky-500/30'
                              : 'hover:bg-white/5 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <Table size={13} className="text-sky-400 shrink-0" />
                            <span className="truncate">{c.name}</span>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => handleToggleItemFavorite(e, 'collection', c.id)}
                              className={`p-0.5 ${c.isFavorite ? 'text-amber-400' : 'text-slate-500 hover:text-amber-400'}`}
                            >
                              <Star size={11} className={c.isFavorite ? 'fill-amber-400' : ''} />
                            </button>
                            <button
                              onClick={(e) => handleDeleteCollection(e, c.id)}
                              className="p-0.5 text-slate-500 hover:text-rose-400 rounded"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                  {pages
                    .filter((p) => !p.partitionId || p.partitionId === 'part_private')
                    .map((p) => {
                      const isActive = activeType === 'page' && activeId === p.id;
                      return (
                        <div
                          key={p.id}
                          onClick={() => {
                            setActiveType('page');
                            setActiveId(p.id);
                          }}
                          className={`group flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer transition-colors ${
                            isActive
                              ? 'bg-sky-500/15 text-white font-medium border border-sky-500/30'
                              : 'hover:bg-white/5 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="text-xs shrink-0">{p.icon || '📄'}</span>
                            <span className="truncate">{p.title || '未命名笔记'}</span>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => handleToggleItemFavorite(e, 'page', p.id)}
                              className={`p-0.5 ${p.isFavorite ? 'text-amber-400' : 'text-slate-500 hover:text-amber-400'}`}
                            >
                              <Star size={11} className={p.isFavorite ? 'fill-amber-400' : ''} />
                            </button>
                            <button
                              onClick={(e) => handleDeletePage(e, p.id)}
                              className="p-0.5 text-slate-500 hover:text-rose-400 rounded"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* 2. 最近 (Recent) - 纯净无多余文字 */}
            <div>
              <div
                className="flex items-center justify-between px-2 py-1 text-[11px] font-semibold text-slate-400 hover:text-slate-200 cursor-pointer group rounded hover:bg-white/5"
                onClick={() => handleTogglePartition('part_recent')}
              >
                <div className="flex items-center gap-1.5 flex-1">
                  <ChevronDown
                    size={12}
                    className={`text-slate-500 transition-transform ${
                      partitions.find((p) => p.id === 'part_recent')?.isCollapsed
                        ? '-rotate-90'
                        : ''
                    }`}
                  />
                  <span>最近</span>
                </div>
              </div>

              {!partitions.find((p) => p.id === 'part_recent')?.isCollapsed && recentItems.length > 0 && (
                <div className="space-y-0.5 mt-0.5 pl-1.5">
                  {recentItems.map((item) => {
                    const isActive = activeType === item.type && activeId === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          setActiveType(item.type);
                          setActiveId(item.id);
                        }}
                        className={`group flex items-center justify-between px-2 py-1 rounded cursor-pointer transition-colors ${
                          isActive
                            ? 'bg-sky-500/15 text-white font-medium border border-sky-500/30'
                            : 'hover:bg-white/5 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 truncate min-w-0">
                          {item.type === 'collection' ? (
                            <Table size={12} className="text-sky-400 shrink-0" />
                          ) : (
                            <span className="text-xs shrink-0">{item.icon}</span>
                          )}
                          <span className="truncate">{item.title}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. 收藏 (Favorites) - 纯净无多余文字 */}
            <div>
              <div
                className="flex items-center justify-between px-2 py-1 text-[11px] font-semibold text-slate-400 hover:text-slate-200 cursor-pointer group rounded hover:bg-white/5"
                onClick={() => handleTogglePartition('part_favorite')}
              >
                <div className="flex items-center gap-1.5 flex-1">
                  <ChevronDown
                    size={12}
                    className={`text-slate-500 transition-transform ${
                      partitions.find((p) => p.id === 'part_favorite')?.isCollapsed
                        ? '-rotate-90'
                        : ''
                    }`}
                  />
                  <span>收藏</span>
                </div>
              </div>

              {!partitions.find((p) => p.id === 'part_favorite')?.isCollapsed && favoriteItems.length > 0 && (
                <div className="space-y-0.5 mt-0.5 pl-1.5">
                  {favoriteItems.map((item) => {
                    const isActive = activeType === item.type && activeId === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          setActiveType(item.type);
                          setActiveId(item.id);
                        }}
                        className={`group flex items-center justify-between px-2 py-1 rounded cursor-pointer transition-colors ${
                          isActive
                            ? 'bg-sky-500/15 text-white font-medium border border-sky-500/30'
                            : 'hover:bg-white/5 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 truncate min-w-0">
                          {item.type === 'collection' ? (
                            <Table size={12} className="text-sky-400 shrink-0" />
                          ) : (
                            <span className="text-xs shrink-0">{item.icon}</span>
                          )}
                          <span className="truncate">{item.title}</span>
                        </div>
                        <button
                          onClick={(e) => handleToggleItemFavorite(e, item.type, item.id)}
                          className="p-0.5 text-amber-400 hover:text-slate-400"
                        >
                          <Star size={10} className="fill-amber-400" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 折叠模式 */}
        {sidebarCollapsed && (
          <div className="flex-1 py-3 flex flex-col items-center gap-2">
            <button
              onClick={() => handleCreatePageInPartition('part_private')}
              className="p-2 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition-colors"
              title="新建笔记"
            >
              <Plus size={16} />
            </button>
            <button
              onClick={() => handleCreateCollectionInPartition('part_private')}
              className="p-2 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition-colors"
              title="新建数据库"
            >
              <Table size={16} />
            </button>
          </div>
        )}
      </div>

      {/* 右侧主工作区 (极简留白，绝无任何 AI-Slop 说明卡片) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* 面包屑与顶部导航栏 */}
        <div className="h-[49px] border-b border-white/5 px-6 flex items-center justify-between bg-black/25 shrink-0 select-none">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            {breadcrumbPath && (
              <span className="font-medium text-slate-200 truncate max-w-md">
                {breadcrumbPath}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            {activeId && (
              <button
                onClick={handleToggleCurrentFavorite}
                className={`p-1.5 rounded transition-colors ${
                  isCurrentFavorite
                    ? 'text-amber-400'
                    : 'hover:bg-white/5 text-slate-400 hover:text-slate-200'
                }`}
                title={isCurrentFavorite ? '取消收藏' : '收藏'}
              >
                <Star
                  size={14}
                  className={isCurrentFavorite ? 'fill-amber-400' : ''}
                />
              </button>
            )}
          </div>
        </div>

        {/* 主视口渲染 (严格落实少字原则：空状态纯粹留白，无任何废话文本卡片) */}
        <div className="flex-1 overflow-hidden min-w-0">
          {loading ? (
            <div className="flex-1 h-full flex items-center justify-center text-xs text-slate-600">
              加载中...
            </div>
          ) : activeType === 'page' && selectedPage ? (
            <BlockEditor
              page={selectedPage}
              onUpdatePageTitle={handleUpdatePageTitle}
              onUpdatePageIcon={handleUpdatePageIcon}
            />
          ) : activeType === 'collection' && selectedCollection ? (
            <TableDatabaseView
              collection={selectedCollection}
              onUpdateCollection={handleUpdateCollection}
            />
          ) : (
            /* 纯粹极简留白：彻底移除 AI 说明卡片、多余废话段落与大按钮，直接静默留白 */
            <div
              className="flex-1 h-full cursor-text"
              onClick={() => handleCreatePageInPartition('part_private')}
            />
          )}
        </div>
      </div>
    </div>
  );
};
