import React, { useState, useEffect } from 'react';
import { DocPage, DbCollection, DocPartition } from '../types/docs.ts';
import {
  loadDocPartitions,
  saveDocPartition,
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
  FileText,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Search,
  Star,
  Share2,
  Table,
  Home,
  MessageSquare,
  Sparkles,
  Link2,
} from 'lucide-react';

export const DocsView: React.FC = () => {
  const [partitions, setPartitions] = useState<DocPartition[]>([]);
  const [pages, setPages] = useState<DocPage[]>([]);
  const [collections, setCollections] = useState<DbCollection[]>([]);
  const [activeType, setActiveType] = useState<'page' | 'collection'>('collection');
  const [activeId, setActiveId] = useState<string>('col_plm_survey');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [loading, setLoading] = useState(true);

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
          // 默认选中 PLM 流程调研数据库或首个页面
          const plmCol = loadedCols.find((c) => c.id === 'col_plm_survey');
          if (plmCol) {
            setActiveType('collection');
            setActiveId(plmCol.id);
          } else if (loadedCols.length > 0) {
            setActiveType('collection');
            setActiveId(loadedCols[0].id);
          } else if (loadedPages.length > 0) {
            setActiveType('page');
            setActiveId(loadedPages[0].id);
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

  // 2. 在指定分区新建页面
  const handleCreatePageInPartition = async (partitionId: string = 'part_private') => {
    const newPage: DocPage = {
      id: 'page_' + Date.now(),
      partitionId,
      title: '未命名文档',
      icon: '📄',
      isFavorite: partitionId === 'part_favorite',
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

  // 3. 在指定分区新建多维表格
  const handleCreateCollectionInPartition = async (partitionId: string = 'part_private') => {
    const newCol: DbCollection = {
      id: 'col_' + Date.now(),
      partitionId,
      name: '未命名多维数据表',
      description: '点击表头配置字段属性与视图',
      schema: { ...INITIAL_COLLECTION_SCHEMA },
      views: [{ id: 'v_' + Date.now(), name: '全部记录', type: 'table' }],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const nextCols = [newCol, ...collections];
    setCollections(nextCols);
    setActiveType('collection');
    setActiveId(newCol.id);
    await saveDbCollection(newCol);
  };

  // 4. 删除页面
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

  // 5. 删除多维表格
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

  // 6. 更新文档标题
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

  // 7. 更新文档图标
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

  // 8. 更新多维表格对象
  const handleUpdateCollection = (updatedCol: DbCollection) => {
    setCollections((prev) =>
      prev.map((c) => (c.id === updatedCol.id ? updatedCol : c))
    );
  };

  const selectedPage = pages.find((p) => p.id === activeId);
  const selectedCollection = collections.find((c) => c.id === activeId);

  // 面包屑标题提取
  const currentTitle =
    activeType === 'collection'
      ? selectedCollection?.name || '多维表格'
      : selectedPage?.title || '文档页面';

  return (
    <div className="flex-1 flex h-full w-full bg-[#080b11] text-slate-100 overflow-hidden select-none">
      {/* 左侧 Notion 风格分区导航树侧栏 (Partitions Navigation Sidebar) */}
      <div
        className={`border-r border-white/5 bg-[#0a0d14]/90 backdrop-blur-xl flex flex-col shrink-0 transition-all duration-200 relative ${
          sidebarCollapsed ? 'w-10' : 'w-60'
        }`}
      >
        {/* 侧栏顶端快捷检索栏 (49px 高度对齐基准线) */}
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

        {/* 侧栏内容区 */}
        {!sidebarCollapsed && (
          <div className="flex-1 overflow-y-auto p-2 space-y-4 text-xs">
            {/* Notion 快捷功能入口 (主页、新对话、外部代理) */}
            <div className="space-y-0.5 border-b border-white/5 pb-2 text-slate-400">
              <div className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/5 cursor-pointer text-slate-300">
                <Home size={13} className="text-slate-400" />
                <span>主页</span>
              </div>
              <div className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/5 cursor-pointer text-slate-400 hover:text-slate-200">
                <MessageSquare size={13} />
                <span>新对话</span>
              </div>
              <div className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/5 cursor-pointer text-slate-400 hover:text-slate-200">
                <Sparkles size={13} className="text-amber-400" />
                <span>外部代理</span>
              </div>
            </div>

            {/* 分区 1：私人 (Private) */}
            <div>
              <div className="flex items-center justify-between px-2 py-1 text-[11px] font-semibold text-slate-400 hover:text-slate-200 cursor-pointer group">
                <div
                  className="flex items-center gap-1 flex-1"
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
                    onClick={() => handleCreatePageInPartition('part_private')}
                    className="p-0.5 text-slate-400 hover:text-white rounded"
                    title="在私人分区新建页面"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>

              {!partitions.find((p) => p.id === 'part_private')?.isCollapsed && (
                <div className="space-y-0.5 mt-0.5 pl-1.5">
                  {/* 多维表格列表 */}
                  {collections
                    .filter((c) => c.partitionId === 'part_private' || !c.partitionId)
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
                          <button
                            onClick={(e) => handleDeleteCollection(e, c.id)}
                            className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-500 hover:text-rose-400 rounded transition-all"
                            title="删除多维表格"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      );
                    })}

                  {/* 文档页面列表 */}
                  {pages
                    .filter((p) => p.partitionId === 'part_private' || !p.partitionId)
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
                            <span className="text-xs shrink-0">{p.icon || '📑'}</span>
                            <span className="truncate">{p.title || '未命名文档'}</span>
                          </div>
                          <button
                            onClick={(e) => handleDeletePage(e, p.id)}
                            className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-500 hover:text-rose-400 rounded transition-all"
                            title="删除文档"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* 分区 2：最爱 (Favorites) */}
            <div>
              <div className="flex items-center justify-between px-2 py-1 text-[11px] font-semibold text-slate-400 hover:text-slate-200 cursor-pointer group">
                <div
                  className="flex items-center gap-1 flex-1"
                  onClick={() => handleTogglePartition('part_favorite')}
                >
                  <ChevronDown
                    size={12}
                    className={`text-slate-500 transition-transform ${
                      partitions.find((p) => p.id === 'part_favorite')?.isCollapsed
                        ? '-rotate-90'
                        : ''
                    }`}
                  />
                  <span>最爱</span>
                </div>
              </div>

              {!partitions.find((p) => p.id === 'part_favorite')?.isCollapsed && (
                <div className="space-y-0.5 mt-0.5 pl-1.5">
                  {pages
                    .filter((p) => p.partitionId === 'part_favorite' || p.isFavorite)
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
                            <span className="truncate">{p.title}</span>
                          </div>
                          <Star size={11} className="text-amber-400 shrink-0 fill-amber-400/20" />
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* 分区 3：团队协作区 / 工作空间 (Workspace) */}
            <div>
              <div className="flex items-center justify-between px-2 py-1 text-[11px] font-semibold text-slate-400 hover:text-slate-200 cursor-pointer group">
                <div
                  className="flex items-center gap-1 flex-1"
                  onClick={() => handleTogglePartition('part_workspace')}
                >
                  <ChevronDown
                    size={12}
                    className={`text-slate-500 transition-transform ${
                      partitions.find((p) => p.id === 'part_workspace')?.isCollapsed
                        ? '-rotate-90'
                        : ''
                    }`}
                  />
                  <span>团队协作区</span>
                </div>
              </div>

              {!partitions.find((p) => p.id === 'part_workspace')?.isCollapsed && (
                <div className="space-y-0.5 mt-0.5 pl-1.5">
                  <div className="flex items-center gap-1.5 px-2 py-1.5 text-slate-400 hover:bg-white/5 rounded cursor-pointer">
                    <Home size={12} className="text-emerald-400" />
                    <span className="truncate">Jr Forever 的工作空间 总部</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 折叠模式下的简单图标按钮列 */}
        {sidebarCollapsed && (
          <div className="flex-1 py-3 flex flex-col items-center gap-2">
            <button
              onClick={() => handleCreatePageInPartition('part_private')}
              className="p-2 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition-colors"
              title="新建文档"
            >
              <FileText size={16} />
            </button>
            <button
              onClick={() => handleCreateCollectionInPartition('part_private')}
              className="p-2 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition-colors"
              title="新建多维表格"
            >
              <Table size={16} />
            </button>
          </div>
        )}
      </div>

      {/* 右侧主工作区 (带有面包屑导航与 49px 高度对齐) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* 面包屑与顶部导航栏 (49px 高度对齐基准线，对齐 Notion 截图 1 & 2) */}
        <div className="h-[49px] border-b border-white/5 px-6 flex items-center justify-between bg-black/25 shrink-0 select-none">
          {/* 面包屑路径 */}
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span className="text-slate-500">私人 /</span>
            <span className="font-semibold text-white truncate max-w-sm">
              {currentTitle}
            </span>
          </div>

          {/* 右侧操作按钮 */}
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              上次编辑 刚刚
            </span>
            <button
              className="flex items-center gap-1 px-2 py-1 hover:bg-white/10 text-slate-300 rounded transition-colors"
              title="共享"
            >
              <Share2 size={13} />
              <span>共享</span>
            </button>
            <button
              className="p-1 hover:bg-white/10 text-slate-400 hover:text-white rounded transition-colors"
              title="复制链接"
            >
              <Link2 size={13} />
            </button>
            <button
              className="p-1 hover:bg-white/10 text-slate-400 hover:text-amber-400 rounded transition-colors"
              title="收藏"
            >
              <Star size={13} />
            </button>
          </div>
        </div>

        {/* 主视口渲染 */}
        <div className="flex-1 overflow-hidden min-w-0">
          {loading ? (
            <div className="flex-1 h-full flex items-center justify-center text-xs text-slate-500">
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
            <div className="flex-1 h-full flex flex-col items-center justify-center gap-3 text-slate-500 text-xs">
              <Table size={32} className="opacity-40" />
              <span>选择左侧导航开始编辑</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
