import React, { useState, useEffect, useRef } from 'react';
import { DocBlock, SyncedBlockProperties } from '../../../types/docs.ts';
import {
  getSyncedBlock,
  saveSyncedBlock,
  generateSyncId,
  listAllSyncedBlocks,
  SyncedBlockData,
} from '../../../services/syncedBlocks.ts';
import { Link2, Copy, Check, Plus, RefreshCw, Trash2, Globe } from 'lucide-react';

interface SyncedBlockProps {
  block: DocBlock;
  onUpdate: (
    content: string,
    blockType: 'synced',
    properties: Record<string, unknown>,
    isStructural: boolean
  ) => void;
  onDelete: () => void;
}

/**
 * 跨文档双向同步引用块 (SyncedBlock)
 * - 全局唯一 syncId，在全库任意文档中引用均保持数据绝对一致
 * - 翡翠晶体微光边框与同步微徽标
 * - 支持一键复制 Sync ID 与跨文档快速绑定
 */
export const SyncedBlock: React.FC<SyncedBlockProps> = ({
  block,
  onUpdate,
  onDelete,
}) => {
  const props = (block.properties || {}) as unknown as SyncedBlockProperties;
  const syncId = props?.syncId;

  const editorRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [showPicker, setShowPicker] = useState(!syncId);
  const [customIdInput, setCustomIdInput] = useState('');
  const [allExisting, setAllExisting] = useState<SyncedBlockData[]>([]);

  // 1. 若存在 syncId，优先从全局仓库加载最新事实数据
  useEffect(() => {
    if (!syncId) {
      setAllExisting(listAllSyncedBlocks());
      return;
    }

    const latest = getSyncedBlock(syncId);
    if (latest && latest.content !== block.content) {
      // 外部其他文档修改了内容，自动拉取最新
      onUpdate(latest.content, 'synced', { ...props, syncId }, false);
      if (editorRef.current && editorRef.current.innerHTML !== latest.content) {
        editorRef.current.innerHTML = latest.content;
      }
    } else if (editorRef.current && editorRef.current.innerHTML !== block.content) {
      editorRef.current.innerHTML = block.content;
    }
  }, [syncId]);

  // 新建全新同步源块
  const handleCreateNew = () => {
    const newId = generateSyncId();
    const initialContent = block.content || '请输入跨文档同步内容...';
    saveSyncedBlock(newId, initialContent);
    onUpdate(
      initialContent,
      'synced',
      {
        ...props,
        syncId: newId,
        isOriginal: true,
      },
      true
    );
    setShowPicker(false);
  };

  // 绑定已有同步块
  const handleBindExisting = (targetId: string) => {
    const target = getSyncedBlock(targetId);
    if (!target) return;

    onUpdate(
      target.content,
      'synced',
      {
        ...props,
        syncId: targetId,
        isOriginal: false,
      },
      true
    );
    setShowPicker(false);
  };

  // 内容输入与全局双向广播
  const handleInput = () => {
    if (!editorRef.current || !syncId) return;
    const newContent = editorRef.current.innerHTML;
    saveSyncedBlock(syncId, newContent);
    onUpdate(newContent, 'synced', { ...props, syncId }, false);
  };

  const handleCopySyncId = () => {
    if (!syncId) return;
    navigator.clipboard.writeText(syncId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 1500);
  };

  // 1. 空状态绑定引导卡片
  if (showPicker || !syncId) {
    return (
      <div className="w-full my-3 p-4 rounded-2xl bg-[#0f1d1e]/80 border border-teal-500/25 shadow-xl select-none">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-300">
            <Link2 size={15} className="text-teal-400" />
            <span>配置跨文档同步块 (Synced Block)</span>
          </div>
          {syncId && (
            <button
              type="button"
              onClick={() => setShowPicker(false)}
              className="text-xs text-slate-500 hover:text-slate-300"
            >
              取消
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <button
            type="button"
            onClick={handleCreateNew}
            className="flex items-center justify-center gap-2 p-3 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 text-teal-200 border border-teal-500/30 text-xs font-medium transition-all hover:scale-[1.01]"
          >
            <Plus size={14} />
            <span>新建同步源块</span>
          </button>

          <div className="flex gap-1.5">
            <input
              type="text"
              value={customIdInput}
              onChange={(e) => setCustomIdInput(e.target.value)}
              placeholder="输入已有 Sync ID..."
              className="flex-1 px-3 py-1.5 bg-black/40 border border-white/10 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500/50 font-mono"
            />
            <button
              type="button"
              onClick={() => handleBindExisting(customIdInput.trim())}
              disabled={!customIdInput.trim()}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium border border-white/10 transition-all disabled:opacity-40"
            >
              绑定
            </button>
          </div>
        </div>

        {allExisting.length > 0 && (
          <div className="pt-3 border-t border-white/5">
            <div className="max-h-32 overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
              {allExisting.map((item) => (
                <div
                  key={item.syncId}
                  onClick={() => handleBindExisting(item.syncId)}
                  className="p-2 rounded-lg bg-black/30 hover:bg-teal-500/10 border border-white/5 hover:border-teal-500/30 transition-all flex items-center justify-between text-xs cursor-pointer group/item"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-mono text-[10px] text-teal-400/80 bg-teal-500/10 px-1.5 py-0.5 rounded">
                      {item.syncId}
                    </span>
                    <span className="truncate text-slate-300 group-hover/item:text-teal-200">
                      {item.content.replace(/<[^>]+>/g, '').slice(0, 30) || '无摘要内容'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 shrink-0">点击嵌入</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-end pt-3 mt-3 border-t border-white/5">
          <button
            type="button"
            onClick={onDelete}
            className="text-[11px] text-slate-500 hover:text-rose-400 flex items-center gap-1 transition-colors"
          >
            <Trash2 size={11} />
            <span>移除同步块</span>
          </button>
        </div>
      </div>
    );
  }

  // 2. 正常呈现与实时同步编辑视图
  return (
    <div className="group/sync relative w-full my-3 rounded-2xl bg-teal-500/[0.02] border border-teal-500/30 hover:border-teal-500/50 transition-colors shadow-sm overflow-hidden select-text">
      {/* 顶栏微光晶体标题栏 */}
      <div className="h-7 px-3 bg-teal-950/40 border-b border-teal-500/20 flex items-center justify-between text-xs select-none">
        <div className="flex items-center gap-1.5">
          <Globe size={12} className="text-teal-400 animate-pulse" />
          <span className="text-[11px] font-semibold text-teal-300">
            跨文档同步块
          </span>
          <span className="font-mono text-[10px] text-teal-400/70 bg-teal-500/10 px-1.5 py-0.2 rounded border border-teal-500/20">
            {syncId}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px]">
          <button
            type="button"
            onClick={handleCopySyncId}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 transition-colors cursor-pointer"
            title="复制 Sync ID 以在其他页面引用"
          >
            {copiedId ? (
              <>
                <Check size={11} className="text-emerald-400" />
                <span className="text-[10px] text-emerald-400">已复制</span>
              </>
            ) : (
              <>
                <Copy size={11} />
                <span className="text-[10px]">复制 ID</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setShowPicker(true)}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-white/10 transition-colors"
            title="重新配置或更换绑定"
          >
            <RefreshCw size={11} />
          </button>
        </div>
      </div>

      {/* 同步块内部可编辑内容区 */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        data-placeholder="在此编辑同步内容，全库所有引用处将即时一致更新..."
        className="p-3.5 outline-none text-slate-200 text-sm leading-relaxed min-h-[2.5rem] empty:before:content-[attr(data-placeholder)] empty:before:text-slate-600 focus:bg-teal-500/[0.04] transition-colors"
      />
    </div>
  );
};
