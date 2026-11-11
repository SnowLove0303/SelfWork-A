import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Plus,
  Search,
  Folder,
  FolderPlus,
  Trash2,
  Edit2,
  MoreVertical,
  Clock,
  Layers,
  FolderInput,
  Network,
  X,
  Check,
} from 'lucide-react';
import {
  MindMapPartition,
  MindMapDocument,
  MindMapNode,
} from '../../types/mindmap.ts';

interface MindMapPartitionViewProps {
  partitions: MindMapPartition[];
  documents: MindMapDocument[];
  activePartitionId: string;
  onSelectPartition: (id: string) => void;
  onCreatePartition: (name: string) => void;
  onRenamePartition: (id: string, newName: string) => void;
  onDeletePartition: (id: string) => void;
  onCreateDocument: (partitionId: string) => void;
  onOpenDocument: (id: string) => void;
  onRenameDocument: (id: string, newTitle: string) => void;
  onDeleteDocument: (id: string) => void;
  onMoveDocumentPartition: (docId: string, targetPartitionId: string) => void;
}

// 计算单份思维导图的总节点数
function countNodes(node: MindMapNode): number {
  let count = 1;
  if (node.children) {
    for (const child of node.children) {
      count += countNodes(child);
    }
  }
  return count;
}

// 格式化友好时间提示
function formatTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  if (diff < 60000) return '刚刚';
  if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`;
  const date = new Date(timestamp);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

export const MindMapPartitionView: React.FC<MindMapPartitionViewProps> = ({
  partitions,
  documents,
  activePartitionId,
  onSelectPartition,
  onCreatePartition,
  onRenamePartition,
  onDeletePartition,
  onCreateDocument,
  onOpenDocument,
  onRenameDocument,
  onDeleteDocument,
  onMoveDocumentPartition,
}) => {
  // 搜索关键字
  const [searchQuery, setSearchQuery] = useState('');

  // 分区创建与重命名状态
  const [isCreatingPartition, setIsCreatingPartition] = useState(false);
  const [newPartitionName, setNewPartitionName] = useState('');
  const [renamingPartitionId, setRenamingPartitionId] = useState<string | null>(null);
  const [editingPartitionName, setEditingPartitionName] = useState('');

  // 导图卡片重命名与菜单状态
  const [renamingDocId, setRenamingDocId] = useState<string | null>(null);
  const [editingDocTitle, setEditingDocTitle] = useState('');
  const [activeMenuDocId, setActiveMenuDocId] = useState<string | null>(null);
  const [movingDocId, setMovingDocId] = useState<string | null>(null);

  const partitionInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCreatingPartition && partitionInputRef.current) {
      partitionInputRef.current.focus();
    }
  }, [isCreatingPartition]);

  useEffect(() => {
    if (renamingDocId && docInputRef.current) {
      docInputRef.current.focus();
      docInputRef.current.select();
    }
  }, [renamingDocId]);

  // 计算每个分区所含文档数
  const partitionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of partitions) {
      counts[p.id] = 0;
    }
    for (const doc of documents) {
      if (counts[doc.partitionId] !== undefined) {
        counts[doc.partitionId] += 1;
      }
    }
    return counts;
  }, [partitions, documents]);

  // 过滤当前分区下的文档
  const currentDocs = useMemo(() => {
    return documents
      .filter((doc) => doc.partitionId === activePartitionId)
      .filter((doc) => {
        if (!searchQuery.trim()) return true;
        return doc.title.toLowerCase().includes(searchQuery.trim().toLowerCase());
      })
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [documents, activePartitionId, searchQuery]);

  const activePartition = useMemo(() => {
    return partitions.find((p) => p.id === activePartitionId) || partitions[0];
  }, [partitions, activePartitionId]);

  // 处理分区提交创建
  const handleConfirmCreatePartition = () => {
    const trimmed = newPartitionName.trim();
    if (trimmed) {
      onCreatePartition(trimmed);
      setNewPartitionName('');
      setIsCreatingPartition(false);
    }
  };

  // 处理分区重命名提交
  const handleConfirmRenamePartition = (id: string) => {
    const trimmed = editingPartitionName.trim();
    if (trimmed) {
      onRenamePartition(id, trimmed);
    }
    setRenamingPartitionId(null);
  };

  // 处理导图重命名提交
  const handleConfirmRenameDoc = (id: string) => {
    const trimmed = editingDocTitle.trim();
    if (trimmed) {
      onRenameDocument(id, trimmed);
    }
    setRenamingDocId(null);
  };

  return (
    <div className="flex h-full w-full bg-transparent text-slate-200 select-none overflow-hidden min-w-0">
      {/* ================= 左侧分区管理侧栏 ================= */}
      <div className="w-60 flex-shrink-0 flex flex-col border-r border-white/[0.08] bg-black/20 backdrop-blur-md min-w-0">
        {/* 侧栏顶标：高度严格对齐 h-[49px]，基准线零落差贯穿 */}
        <div className="h-[49px] px-3.5 flex items-center justify-between border-b border-white/[0.08] bg-white/[0.01] shrink-0 min-w-0">
          <div className="flex items-center gap-2 shrink-0">
            <Layers className="w-4 h-4 text-cyan-400 shrink-0" />
            <h2 className="text-xs font-semibold text-fg-primary tracking-tight font-mono shrink-0 whitespace-nowrap">
              分区管理
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              setIsCreatingPartition(true);
              setNewPartitionName('');
            }}
            title="新建分区"
            className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary border border-brand-primary/30 transition-colors tactile-btn shrink-0 whitespace-nowrap"
          >
            <FolderPlus className="w-3.5 h-3.5 shrink-0" />
            <span>分区</span>
          </button>
        </div>

        {/* 分区创建输入框 */}
        {isCreatingPartition && (
          <div className="px-3 pt-2.5">
            <div className="flex items-center gap-1 p-1 rounded-lg bg-black/40 border border-cyan-500/40">
              <input
                ref={partitionInputRef}
                type="text"
                placeholder="分区名称..."
                value={newPartitionName}
                onChange={(e) => setNewPartitionName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleConfirmCreatePartition();
                  if (e.key === 'Escape') setIsCreatingPartition(false);
                }}
                className="w-full bg-transparent px-2 py-0.5 text-xs text-slate-100 placeholder-slate-500 outline-none"
              />
              <button
                onClick={handleConfirmCreatePartition}
                className="p-1 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/20 rounded"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsCreatingPartition(false)}
                className="p-1 text-slate-400 hover:text-slate-300 hover:bg-white/10 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* 分区列表：L3 分类层级规范 */}
        <div className="flex-1 overflow-y-auto px-2 py-2.5 space-y-1">
          {partitions.map((partition) => {
            const isActive = partition.id === activePartitionId;
            const count = partitionCounts[partition.id] || 0;
            const isRenaming = renamingPartitionId === partition.id;

            return (
              <div
                key={partition.id}
                onClick={() => onSelectPartition(partition.id)}
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
                      value={editingPartitionName}
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => setEditingPartitionName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleConfirmRenamePartition(partition.id);
                        if (e.key === 'Escape') setRenamingPartitionId(null);
                      }}
                      onBlur={() => handleConfirmRenamePartition(partition.id)}
                      className="bg-black/50 border border-cyan-500/50 rounded px-1.5 py-0.5 text-xs text-slate-100 outline-none w-28"
                    />
                  ) : (
                    <span className="truncate">{partition.name}</span>
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

                  {!partition.isDefault && (
                    <div
                      className="hidden group-hover:flex items-center gap-0.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => {
                          setRenamingPartitionId(partition.id);
                          setEditingPartitionName(partition.name);
                        }}
                        title="重命名分区"
                        className="p-1 hover:text-cyan-300 hover:bg-white/10 rounded"
                      >
                        <Edit2 className="w-3 h-3 text-slate-400" />
                      </button>
                      <button
                        onClick={() => onDeletePartition(partition.id)}
                        title="删除分区"
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

      {/* ================= 右侧导图卡片大盘 ================= */}
      <div className="flex-1 flex flex-col min-w-0 bg-transparent overflow-hidden">
        {/* 顶部工具栏：高度严格对齐 h-[49px]，基准底线与左栏 100% 贯穿对齐 */}
        <div className="h-[49px] px-4 flex items-center justify-between border-b border-white/[0.08] bg-white/[0.01] shrink-0 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <h2 className="text-xs font-semibold text-fg-primary tracking-tight font-mono shrink-0 whitespace-nowrap">
              {activePartition?.name || '思维导图'}
            </h2>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-white/[0.06] text-fg-muted border border-white/[0.06] shrink-0 whitespace-nowrap">
              {currentDocs.length} 篇导图
            </span>
          </div>

          {/* 搜索框：内嵌紧凑形态 */}
          <div className="relative w-56 shrink-0">
            <Search className="w-3.5 h-3.5 text-fg-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="搜索当前分区导图..."
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
        </div>

        {/* 导图卡片网格容器：收敛至与 Tasks 一致的精细呼吸间距 (p-4 gap-4) */}
        <div className="flex-1 overflow-y-auto p-4 min-w-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4">
            {/* 首卡：+ 新建导图 */}
            <div
              onClick={() => onCreateDocument(activePartitionId)}
              className="group relative flex flex-col items-center justify-center h-44 rounded-xl border-2 border-dashed border-white/15 hover:border-cyan-500/50 bg-white/[0.02] hover:bg-cyan-500/[0.06] cursor-pointer transition-all duration-200 shadow-sm hover:shadow-[0_0_18px_rgba(6,182,212,0.15)]"
            >
              <div className="p-3 rounded-full bg-cyan-500/15 text-cyan-400 group-hover:scale-110 group-hover:bg-cyan-500/25 transition-all duration-200 shadow-[0_0_14px_rgba(6,182,212,0.2)]">
                <Plus className="w-5 h-5" />
              </div>
              <span className="mt-2.5 text-xs font-medium text-slate-300 group-hover:text-cyan-300 transition-colors">
                新建导图
              </span>
              <span className="mt-0.5 text-[10px] text-slate-500 font-mono group-hover:text-slate-400 transition-colors">
                创建空白导图并进入画布
              </span>
            </div>

            {/* 已有思维导图卡片 */}
            {currentDocs.map((doc) => {
              const nodeTotal = countNodes(doc.root);
              const isRenaming = renamingDocId === doc.id;
              const isMenuOpen = activeMenuDocId === doc.id;
              const isMoving = movingDocId === doc.id;

              return (
                <div
                  key={doc.id}
                  onClick={() => onOpenDocument(doc.id)}
                  className="group relative flex flex-col h-44 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] hover:border-cyan-500/40 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-[0_6px_20px_rgba(0,0,0,0.4)] overflow-hidden"
                >
                  {/* 导图微缩结构示意预览区 */}
                  <div className="flex-1 flex items-center justify-center bg-black/20 relative border-b border-white/[0.06] group-hover:bg-black/10 transition-colors">
                    <div className="flex items-center gap-2 opacity-65 group-hover:opacity-100 transition-opacity">
                      {/* 中心主题微缩块 */}
                      <div className="px-2 py-0.5 rounded-md bg-cyan-500/20 border border-cyan-500/40 text-[10px] text-cyan-300 font-semibold shadow-[0_0_8px_rgba(6,182,212,0.2)]">
                        {doc.root.title || '中心主题'}
                      </div>
                      {/* 分支连线微缩 */}
                      <div className="w-2.5 h-px bg-cyan-500/40" />
                      <div className="flex flex-col gap-1">
                        <div className="w-8 h-1.5 rounded bg-white/10 border border-white/10" />
                        <div className="w-6 h-1.5 rounded bg-white/10 border border-white/10" />
                      </div>
                    </div>
                  </div>

                  {/* 卡片信息底栏：L4/L5 字阶标准 */}
                  <div className="p-3 flex flex-col justify-between bg-black/25">
                    <div className="flex items-center justify-between gap-2">
                      {isRenaming ? (
                        <input
                          ref={docInputRef}
                          type="text"
                          value={editingDocTitle}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => setEditingDocTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleConfirmRenameDoc(doc.id);
                            if (e.key === 'Escape') setRenamingDocId(null);
                          }}
                          onBlur={() => handleConfirmRenameDoc(doc.id)}
                          className="bg-black/50 border border-cyan-500/50 rounded px-1.5 py-0.5 text-xs text-slate-100 outline-none w-full"
                        />
                      ) : (
                        <h3 className="text-xs font-medium text-slate-200 group-hover:text-cyan-300 truncate transition-colors">
                          {doc.title}
                        </h3>
                      )}

                      {/* 卡片菜单操作 */}
                      <div
                        className="relative flex-shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() =>
                            setActiveMenuDocId(isMenuOpen ? null : doc.id)
                          }
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>

                        {/* 下拉菜单浮层 */}
                        {isMenuOpen && (
                          <div className="absolute right-0 bottom-full mb-1 w-32 rounded-xl bg-slate-950/95 border border-white/10 shadow-2xl py-1 z-30 backdrop-blur-xl">
                            <button
                              onClick={() => {
                                setRenamingDocId(doc.id);
                                setEditingDocTitle(doc.title);
                                setActiveMenuDocId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-300 hover:text-cyan-300 hover:bg-white/5"
                            >
                              <Edit2 className="w-3 h-3" />
                              <span>重命名</span>
                            </button>
                            <button
                              onClick={() => {
                                setMovingDocId(doc.id);
                                setActiveMenuDocId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-300 hover:text-cyan-300 hover:bg-white/5"
                            >
                              <FolderInput className="w-3 h-3" />
                              <span>移动分区</span>
                            </button>
                            <div className="h-px bg-white/5 my-1" />
                            <button
                              onClick={() => {
                                onDeleteDocument(doc.id);
                                setActiveMenuDocId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>删除导图</span>
                            </button>
                          </div>
                        )}

                        {/* 移动分区弹层 */}
                        {isMoving && (
                          <div className="absolute right-0 bottom-full mb-1 w-40 rounded-xl bg-slate-950/95 border border-white/10 shadow-2xl py-1 z-30 backdrop-blur-xl">
                            <div className="px-3 py-1 text-[10px] text-slate-500 border-b border-white/5">
                              移动至目标分区
                            </div>
                            {partitions.map((targetP) => (
                              <button
                                key={targetP.id}
                                disabled={targetP.id === doc.partitionId}
                                onClick={() => {
                                  onMoveDocumentPartition(doc.id, targetP.id);
                                  setMovingDocId(null);
                                }}
                                className={`w-full flex items-center justify-between px-3 py-1.5 text-xs ${
                                  targetP.id === doc.partitionId
                                    ? 'text-slate-600 cursor-not-allowed'
                                    : 'text-slate-300 hover:text-cyan-300 hover:bg-white/5'
                                }`}
                              >
                                <span className="truncate">{targetP.name}</span>
                                {targetP.id === doc.partitionId && (
                                  <span className="text-[10px] text-slate-600">当前</span>
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 卡片状态：L5 辅助微文案标准 */}
                    <div className="flex items-center justify-between mt-1.5 text-[10px] text-slate-500 font-mono">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatTime(doc.updatedAt)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Network className="w-3 h-3" />
                        <span>{nodeTotal} 节点</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
