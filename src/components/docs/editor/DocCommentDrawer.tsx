import React, { useState, useEffect } from 'react';
import { DocComment } from '../../../types/docs.ts';
import {
  getCommentsForPage,
  addCommentReply,
  toggleResolveComment,
  deleteComment,
} from '../../../services/docComments.ts';
import {
  MessageSquare,
  CheckCircle2,
  Circle,
  Trash2,
  X,
  CornerDownRight,
  Send,
  Quote,
} from 'lucide-react';

interface DocCommentDrawerProps {
  pageId: string;
  isOpen: boolean;
  onClose: () => void;
  activeCommentId?: string | null;
}

export const DocCommentDrawer: React.FC<DocCommentDrawerProps> = ({
  pageId,
  isOpen,
  onClose,
  activeCommentId,
}) => {
  const [comments, setComments] = useState<DocComment[]>([]);
  const [filter, setFilter] = useState<'open' | 'resolved' | 'all'>('open');
  const [replyInputMap, setReplyInputMap] = useState<Record<string, string>>({});

  const reloadComments = () => {
    setComments(getCommentsForPage(pageId));
  };

  useEffect(() => {
    if (isOpen) {
      reloadComments();
    }
  }, [pageId, isOpen]);

  if (!isOpen) return null;

  const filteredComments = comments.filter((c) => {
    if (filter === 'open') return !c.isResolved;
    if (filter === 'resolved') return c.isResolved;
    return true;
  });

  const openCount = comments.filter((c) => !c.isResolved).length;
  const resolvedCount = comments.filter((c) => c.isResolved).length;

  const handleToggleResolve = (commentId: string) => {
    toggleResolveComment(pageId, commentId);
    reloadComments();
  };

  const handleDelete = (commentId: string) => {
    deleteComment(pageId, commentId);
    reloadComments();
  };

  const handleSendReply = (commentId: string) => {
    const text = replyInputMap[commentId]?.trim();
    if (!text) return;
    addCommentReply(pageId, commentId, text);
    setReplyInputMap((prev) => ({ ...prev, [commentId]: '' }));
    reloadComments();
  };

  const formatRelativeTime = (ts: number) => {
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return '刚刚';
    if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`;
    return `${Math.floor(diff / 86400)} 天前`;
  };

  return (
    <div
      className="fixed inset-y-0 right-0 z-50 w-80 bg-[#121620]/95 backdrop-blur-xl border-l border-white/10 shadow-2xl flex flex-col select-none animate-in slide-in-from-right duration-200 text-slate-200"
      onClick={(e) => e.stopPropagation()}
    >
      {/* 顶栏标题与关闭 */}
      <div className="h-12 px-4 border-b border-white/10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare size={16} className="text-sky-400" />
          <span className="font-semibold text-xs text-white">行内批注与评论</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30">
            {openCount} 待办
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition-colors"
          title="关闭批注栏 (Esc)"
        >
          <X size={14} />
        </button>
      </div>

      {/* 筛选切换胶囊 */}
      <div className="p-3 border-b border-white/5 flex gap-1">
        {(
          [
            { id: 'open', label: `待办 (${openCount})` },
            { id: 'resolved', label: `已解决 (${resolvedCount})` },
            { id: 'all', label: `全部 (${comments.length})` },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`flex-1 py-1 rounded-lg text-center text-[11px] font-medium transition-all ${
              filter === tab.id
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 shadow-sm'
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 批注卡片滚动列表 */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
        {filteredComments.length === 0 ? (
          <div className="py-16 text-center text-slate-500 space-y-2">
            <MessageSquare size={24} className="mx-auto opacity-30" />
            <p className="text-xs">暂无此状态的批注</p>
            <p className="text-[11px] text-slate-600">在正文划选任意文字即可添加行内批注</p>
          </div>
        ) : (
          filteredComments.map((comment) => {
            const isTarget = activeCommentId === comment.id;
            return (
              <div
                key={comment.id}
                className={`p-3 rounded-xl border transition-all space-y-2.5 ${
                  comment.isResolved
                    ? 'bg-white/[0.01] border-white/5 opacity-70'
                    : isTarget
                    ? 'bg-sky-500/10 border-sky-500/40 shadow-lg ring-1 ring-sky-500/30'
                    : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                }`}
              >
                {/* 划选引用原文片段 */}
                {comment.highlightedText && (
                  <div className="flex items-start gap-1.5 p-2 rounded-lg bg-yellow-500/[0.07] border-l-2 border-yellow-400/80 text-[11px] text-yellow-200/90 font-mono italic">
                    <Quote size={12} className="text-yellow-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{comment.highlightedText}</span>
                  </div>
                )}

                {/* 批注正文与操作栏 */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[11px] font-medium text-slate-300">
                        {comment.author}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {formatRelativeTime(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed select-text">
                      {comment.content}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleToggleResolve(comment.id)}
                      className={`p-1 rounded transition-colors ${
                        comment.isResolved
                          ? 'text-emerald-400 hover:text-slate-400'
                          : 'text-slate-500 hover:text-emerald-400'
                      }`}
                      title={comment.isResolved ? '重开此批注' : '标为已解决'}
                    >
                      {comment.isResolved ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                    </button>
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                      title="删除批注"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* 探讨回复列表 */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="pl-3 border-l border-white/10 space-y-1.5 mt-2">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="text-xs space-y-0.5">
                        <div className="flex items-center gap-1 text-[10px] text-slate-400">
                          <span className="font-medium text-slate-300">{reply.author}</span>
                          <span>•</span>
                          <span>{formatRelativeTime(reply.createdAt)}</span>
                        </div>
                        <p className="text-slate-300 select-text">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* 快速回复输入行 */}
                {!comment.isResolved && (
                  <div className="flex items-center gap-1 pt-1.5 border-t border-white/5">
                    <CornerDownRight size={11} className="text-slate-500 shrink-0" />
                    <input
                      type="text"
                      value={replyInputMap[comment.id] || ''}
                      onChange={(e) =>
                        setReplyInputMap((prev) => ({
                          ...prev,
                          [comment.id]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSendReply(comment.id);
                        }
                      }}
                      placeholder="回复批注 (Enter 发送)..."
                      className="flex-1 bg-black/40 border border-white/10 rounded-md px-2 py-1 text-[11px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500/50"
                    />
                    <button
                      type="button"
                      onClick={() => handleSendReply(comment.id)}
                      disabled={!replyInputMap[comment.id]?.trim()}
                      className="p-1 text-sky-400 hover:text-sky-300 disabled:opacity-30 transition-colors"
                      title="发送回复"
                    >
                      <Send size={12} />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
