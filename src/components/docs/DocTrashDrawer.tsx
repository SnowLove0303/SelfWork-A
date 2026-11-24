import React, { useState } from 'react';
import {
  Trash2,
  RotateCcw,
  AlertTriangle,
  X,
  Clock,
  Check,
} from 'lucide-react';
import { DocPage } from '../../types/docs.ts';
import {
  restoreDocPage,
  permanentlyDeleteDocPage,
  emptyDocTrash,
  getTrashRemainingDays,
} from '../../services/docTrash.ts';

interface DocTrashDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  pages: DocPage[];
  onPagesChange: (updatedPages: DocPage[]) => void;
  onNavigatePage: (pageId: string) => void;
}

export const DocTrashDrawer: React.FC<DocTrashDrawerProps> = ({
  isOpen,
  onClose,
  pages,
  onPagesChange,
  onNavigatePage,
}) => {
  const [confirmingPurgeId, setConfirmingPurgeId] = useState<string | null>(null);
  const [confirmingEmptyAll, setConfirmingEmptyAll] = useState(false);

  if (!isOpen) return null;

  const trashPages = pages.filter((p) => p.isDeleted);

  const handleRestore = async (pageId: string) => {
    const updated = await restoreDocPage(pageId);
    onPagesChange(updated);
    onNavigatePage(pageId);
  };

  const handlePurge = async (pageId: string) => {
    const updated = await permanentlyDeleteDocPage(pageId);
    onPagesChange(updated);
    setConfirmingPurgeId(null);
  };

  const handleEmptyAll = async () => {
    const updated = await emptyDocTrash(trashPages);
    onPagesChange(updated);
    setConfirmingEmptyAll(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md h-full bg-[#0d1117] border-l border-white/10 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部标题栏 */}
        <div className="h-12 border-b border-white/10 px-4 flex items-center justify-between shrink-0 bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <Trash2 size={15} className="text-rose-400" />
            <span className="text-xs font-semibold text-slate-200">废纸篓</span>
            <span className="px-1.5 py-0.2 text-[10px] bg-rose-500/20 text-rose-300 rounded font-mono">
              {trashPages.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {trashPages.length > 0 && (
              <>
                {confirmingEmptyAll ? (
                  <div className="flex items-center gap-1.5 bg-rose-500/20 border border-rose-500/40 rounded px-2 py-0.5">
                    <span className="text-[11px] text-rose-300">清空所有？</span>
                    <button
                      onClick={handleEmptyAll}
                      className="p-0.5 text-rose-400 hover:text-white"
                      title="确认清空"
                    >
                      <Check size={12} />
                    </button>
                    <button
                      onClick={() => setConfirmingEmptyAll(false)}
                      className="p-0.5 text-slate-400 hover:text-white"
                      title="取消"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmingEmptyAll(true)}
                    className="text-[11px] text-slate-400 hover:text-rose-400 px-2 py-1 rounded hover:bg-white/5 transition-colors"
                  >
                    清空废纸篓
                  </button>
                )}
              </>
            )}

            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-white/5"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* 保留周期 */}
        <div className="px-4 py-2 border-b border-white/5 bg-black/20 text-[11px] text-slate-500 flex items-center gap-1.5">
          <Clock size={12} className="text-slate-500 shrink-0" />
          <span>保留 30 天</span>
        </div>

        {/* 文档列表 */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {trashPages.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-xs text-slate-600 gap-2">
              <Trash2 size={28} className="text-slate-700" />
              <span>废纸篓为空</span>
            </div>
          ) : (
            trashPages.map((page) => {
              const remainingDays = getTrashRemainingDays(page.deletedAt);
              const isConfirmingPurge = confirmingPurgeId === page.id;

              return (
                <div
                  key={page.id}
                  className="group flex items-center justify-between p-2.5 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
                    <span className="text-sm shrink-0">{page.icon || '📄'}</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium text-slate-200 truncate">
                        {page.title || '未命名笔记'}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-2">
                        <span>
                          {page.deletedAt
                            ? new Date(page.deletedAt).toLocaleDateString()
                            : '已删除'}
                        </span>
                        <span className="text-amber-400/80">
                          剩余 {remainingDays} 天
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleRestore(page.id)}
                      className="flex items-center gap-1 px-2 py-1 text-[11px] text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 rounded transition-colors"
                      title="还原到文档列表"
                    >
                      <RotateCcw size={12} />
                      <span>还原</span>
                    </button>

                    {isConfirmingPurge ? (
                      <div className="flex items-center gap-1 bg-rose-500/20 border border-rose-500/40 rounded px-1.5 py-0.5 ml-1">
                        <AlertTriangle size={11} className="text-rose-400" />
                        <span className="text-[10px] text-rose-300">粉碎？</span>
                        <button
                          onClick={() => handlePurge(page.id)}
                          className="p-0.5 text-rose-400 hover:text-white"
                          title="确认彻底删除"
                        >
                          <Check size={11} />
                        </button>
                        <button
                          onClick={() => setConfirmingPurgeId(null)}
                          className="p-0.5 text-slate-400 hover:text-white"
                          title="取消"
                        >
                          <X size={11} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmingPurgeId(page.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded hover:bg-rose-500/10 transition-colors"
                        title="彻底粉碎"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
