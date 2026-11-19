import React, { useState, useEffect } from 'react';
import { DocBlock, DocSnapshot } from '../../../types/docs.ts';
import { loadDocSnapshots, saveDocSnapshot, deleteDocSnapshot } from '../../../services/docHistory.ts';
import { History, Clock, RotateCcw, Trash2, Plus, X, Eye } from 'lucide-react';

interface DocHistoryDrawerProps {
  pageId: string;
  currentBlocks: DocBlock[];
  onRestoreSnapshot: (blocks: DocBlock[]) => void;
  onPreviewSnapshot?: (snapshot: DocSnapshot | null) => void;
  onClose: () => void;
}

/**
 * 文档历史版本与快照时间轴抽屉 (DocHistoryDrawer)
 * - 倒序展示文档快照历史记录
 * - 支持手动打快照、实时只读预览与一键安全回滚
 */
export const DocHistoryDrawer: React.FC<DocHistoryDrawerProps> = ({
  pageId,
  currentBlocks,
  onRestoreSnapshot,
  onPreviewSnapshot,
  onClose,
}) => {
  const [snapshots, setSnapshots] = useState<DocSnapshot[]>([]);
  const [previewingId, setPreviewingId] = useState<string | null>(null);

  useEffect(() => {
    setSnapshots(loadDocSnapshots(pageId));
  }, [pageId]);

  const handleCreateManualSnapshot = () => {
    saveDocSnapshot(pageId, currentBlocks, '手动快照');
    setSnapshots(loadDocSnapshots(pageId));
  };

  const handleDelete = (snapshotId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteDocSnapshot(pageId, snapshotId);
    setSnapshots(loadDocSnapshots(pageId));
    if (previewingId === snapshotId) {
      setPreviewingId(null);
      onPreviewSnapshot?.(null);
    }
  };

  const handleTogglePreview = (snapshot: DocSnapshot) => {
    if (previewingId === snapshot.id) {
      setPreviewingId(null);
      onPreviewSnapshot?.(null);
    } else {
      setPreviewingId(snapshot.id);
      onPreviewSnapshot?.(snapshot);
    }
  };

  const handleRestore = (snapshot: DocSnapshot, e: React.MouseEvent) => {
    e.stopPropagation();
    // 恢复前为当前状态保存一次防御性自动快照
    saveDocSnapshot(pageId, currentBlocks, '恢复前自动备份');
    onRestoreSnapshot(snapshot.blocks);
    setPreviewingId(null);
    onPreviewSnapshot?.(null);
    setSnapshots(loadDocSnapshots(pageId));
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  const formatRelative = (ts: number) => {
    const diffSec = Math.floor((Date.now() - ts) / 1000);
    if (diffSec < 60) return '刚刚';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)} 分钟前`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} 小时前`;
    return `${Math.floor(diffSec / 86400)} 天前`;
  };

  return (
    <div className="w-80 border-l border-white/10 bg-[#0c1017]/95 backdrop-blur-xl flex flex-col shrink-0 select-none z-30 shadow-2xl">
      {/* 头部标题与关闭 */}
      <div className="h-[49px] px-4 border-b border-white/10 flex items-center justify-between bg-black/20">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
          <History size={15} className="text-sky-400" />
          <span>版本历史与快照</span>
          <span className="text-[10px] text-slate-500 font-mono">({snapshots.length})</span>
        </div>
        <button
          onClick={() => {
            onPreviewSnapshot?.(null);
            onClose();
          }}
          className="p-1 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition-colors"
          title="关闭抽屉"
        >
          <X size={14} />
        </button>
      </div>

      {/* 手动打快照操作栏 */}
      <div className="p-3 border-b border-white/5 bg-white/[0.02]">
        <button
          onClick={handleCreateManualSnapshot}
          className="w-full py-1.5 px-3 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 hover:text-sky-200 text-xs font-medium border border-sky-500/30 flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
        >
          <Plus size={13} />
          <span>创建当前版本快照</span>
        </button>
      </div>

      {/* 快照时间轴列表 */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar">
        {snapshots.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 italic">
            暂无历史快照记录<br />
            文档保存或手动创建后将在此呈现
          </div>
        ) : (
          snapshots.map((snap) => {
            const isPreviewing = previewingId === snap.id;
            return (
              <div
                key={snap.id}
                onClick={() => handleTogglePreview(snap)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  isPreviewing
                    ? 'bg-sky-500/15 border-sky-500/50 shadow-lg shadow-sky-500/10 ring-1 ring-sky-500/30'
                    : 'bg-black/30 hover:bg-white/[0.05] border-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-200">
                    <Clock size={12} className={isPreviewing ? 'text-sky-400' : 'text-slate-400'} />
                    <span>{formatRelative(snap.timestamp)}</span>
                    {snap.label && (
                      <span className="text-[10px] px-1.5 py-0.2 bg-white/10 rounded text-slate-400">
                        {snap.label}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => handleDelete(snap.id, e)}
                    className="p-1 hover:bg-white/10 text-slate-500 hover:text-rose-400 rounded transition-colors"
                    title="删除此快照"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>

                <div className="text-[11px] text-slate-400 font-mono mb-2">
                  {formatTime(snap.timestamp)}
                </div>

                <div className="flex items-center justify-between pt-1.5 border-t border-white/[0.04] text-[11px] text-slate-400">
                  <span className="text-slate-500">
                    {snap.blockCount} 块 · {snap.wordCount} 字
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTogglePreview(snap);
                      }}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors flex items-center gap-1 ${
                        isPreviewing
                          ? 'bg-sky-400 text-slate-950'
                          : 'bg-white/5 hover:bg-white/10 text-slate-300'
                      }`}
                    >
                      <Eye size={10} />
                      <span>{isPreviewing ? '正在预览' : '预览'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleRestore(snap, e)}
                      className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 transition-colors flex items-center gap-1"
                      title="回滚恢复到此版本"
                    >
                      <RotateCcw size={10} />
                      <span>恢复</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
