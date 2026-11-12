import React, { useState, useEffect } from 'react';
import { DocPage, DbCollection } from '../types/docs.ts';
import {
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
  Database,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
} from 'lucide-react';

export const DocsView: React.FC = () => {
  const [pages, setPages] = useState<DocPage[]>([]);
  const [collections, setCollections] = useState<DbCollection[]>([]);
  const [activeType, setActiveType] = useState<'page' | 'collection'>('page');
  const [activeId, setActiveId] = useState<string>('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);

  // 初始化加载文档与数据表
  useEffect(() => {
    let isMounted = true;
    const initData = async () => {
      setLoading(true);
      try {
        const [loadedPages, loadedCols] = await Promise.all([
          loadDocPages(),
          loadDbCollections(),
        ]);
        if (isMounted) {
          setPages(loadedPages);
          setCollections(loadedCols);
          if (loadedPages.length > 0) {
            setActiveType('page');
            setActiveId(loadedPages[0].id);
          } else if (loadedCols.length > 0) {
            setActiveType('collection');
            setActiveId(loadedCols[0].id);
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

  // 1. 新建文档页面
  const handleCreatePage = async () => {
    const newPage: DocPage = {
      id: 'page_' + Date.now(),
      title: '未命名文档',
      icon: '📝',
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

  // 2. 新建多维表格
  const handleCreateCollection = async () => {
    const newCol: DbCollection = {
      id: 'col_' + Date.now(),
      name: '未命名多维数据表',
      description: '点击表头配置字段属性',
      schema: { ...INITIAL_COLLECTION_SCHEMA },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const nextCols = [newCol, ...collections];
    setCollections(nextCols);
    setActiveType('collection');
    setActiveId(newCol.id);
    await saveDbCollection(newCol);
  };

  // 3. 删除页面
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

  // 4. 删除表格
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

  // 5. 更新文档标题
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

  // 6. 更新文档图标
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

  // 7. 更新多维表格对象
  const handleUpdateCollection = (updatedCol: DbCollection) => {
    setCollections((prev) =>
      prev.map((c) => (c.id === updatedCol.id ? updatedCol : c))
    );
  };

  const selectedPage = pages.find((p) => p.id === activeId);
  const selectedCollection = collections.find((c) => c.id === activeId);

  return (
    <div className="flex-1 flex h-full w-full bg-[#080b11] text-slate-100 overflow-hidden select-none">
      {/* 左侧文档树与多维表格导航侧栏 */}
      <div
        className={`border-r border-white/5 bg-black/25 flex flex-col shrink-0 transition-all duration-200 relative ${
          sidebarCollapsed ? 'w-10' : 'w-56'
        }`}
      >
        {/* 侧栏顶端 (49px 高度对齐基准线) */}
        <div className="h-[49px] border-b border-white/5 px-3 flex items-center justify-between shrink-0">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <FolderOpen size={15} className="text-sky-400" />
              <span className="text-xs font-semibold text-white tracking-wide">
                知识库与数据表
              </span>
            </div>
          )}

          <div className="flex items-center gap-1">
            {!sidebarCollapsed && (
              <div className="flex items-center gap-1">
                <button
                  onClick={handleCreatePage}
                  className="p-1 hover:bg-white/10 text-slate-400 hover:text-white rounded"
                  title="新建文档"
                >
                  <FileText size={13} />
                </button>
                <button
                  onClick={handleCreateCollection}
                  className="p-1 hover:bg-white/10 text-slate-400 hover:text-white rounded"
                  title="新建多维表格"
                >
                  <Database size={13} />
                </button>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1 text-slate-500 hover:text-slate-300 rounded hover:bg-white/5 transition-colors"
              title={sidebarCollapsed ? '展开目录' : '折叠目录'}
            >
              {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
          </div>
        </div>

        {/* 目录内容列表 */}
        {!sidebarCollapsed && (
          <div className="flex-1 overflow-y-auto p-2 space-y-4">
            {/* 文档分类 */}
            <div>
              <div className="flex items-center justify-between px-2 py-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                <span>文档页面</span>
                <button
                  onClick={handleCreatePage}
                  className="hover:text-slate-300 p-0.5"
                  title="新建文档"
                >
                  <Plus size={12} />
                </button>
              </div>
              <div className="space-y-0.5 mt-1">
                {pages.map((p) => {
                  const isActive = activeType === 'page' && activeId === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        setActiveType('page');
                        setActiveId(p.id);
                      }}
                      className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                        isActive
                          ? 'bg-sky-500/15 text-white font-medium border border-sky-500/30'
                          : 'hover:bg-white/5 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-sm shrink-0">{p.icon || '📝'}</span>
                        <span className="truncate">{p.title || '无标题文档'}</span>
                      </div>
                      <button
                        onClick={(e) => handleDeletePage(e, p.id)}
                        className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-500 hover:text-rose-400 rounded transition-all"
                        title="删除文档"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 多维表格分类 */}
            <div>
              <div className="flex items-center justify-between px-2 py-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                <span>多维表格数据库</span>
                <button
                  onClick={handleCreateCollection}
                  className="hover:text-slate-300 p-0.5"
                  title="新建多维表格"
                >
                  <Plus size={12} />
                </button>
              </div>
              <div className="space-y-0.5 mt-1">
                {collections.map((c) => {
                  const isActive = activeType === 'collection' && activeId === c.id;
                  return (
                    <div
                      key={c.id}
                      onClick={() => {
                        setActiveType('collection');
                        setActiveId(c.id);
                      }}
                      className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                        isActive
                          ? 'bg-sky-500/15 text-white font-medium border border-sky-500/30'
                          : 'hover:bg-white/5 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Database size={13} className="text-indigo-400 shrink-0" />
                        <span className="truncate">{c.name}</span>
                      </div>
                      <button
                        onClick={(e) => handleDeleteCollection(e, c.id)}
                        className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-500 hover:text-rose-400 rounded transition-all"
                        title="删除表格"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 折叠模式下的简单图标按钮列 */}
        {sidebarCollapsed && (
          <div className="flex-1 py-3 flex flex-col items-center gap-2">
            <button
              onClick={handleCreatePage}
              className="p-2 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition-colors"
              title="新建文档"
            >
              <FileText size={16} />
            </button>
            <button
              onClick={handleCreateCollection}
              className="p-2 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition-colors"
              title="新建多维表格"
            >
              <Database size={16} />
            </button>
          </div>
        )}
      </div>

      {/* 右侧主工作区 */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {loading ? (
          <div className="flex-1 flex items-center justify-center text-xs text-slate-500">
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
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-500 text-xs">
            <FolderOpen size={32} className="opacity-40" />
            <span>选择或新建一个文档或多维表格开始工作</span>
            <div className="flex gap-2">
              <button
                onClick={handleCreatePage}
                className="px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-white rounded-lg font-medium"
              >
                新建文档
              </button>
              <button
                onClick={handleCreateCollection}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/15 text-slate-200 rounded-lg font-medium"
              >
                新建多维表格
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
