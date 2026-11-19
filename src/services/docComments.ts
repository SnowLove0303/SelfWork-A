import { DocComment, DocCommentReply } from '../types/docs.ts';

const STORAGE_PREFIX = 'selfwork_doc_comments_';

function getStorageKey(pageId: string): string {
  return `${STORAGE_PREFIX}${pageId}`;
}

export function getCommentsForPage(pageId: string): DocComment[] {
  if (!pageId) return [];
  try {
    const raw = localStorage.getItem(getStorageKey(pageId));
    return raw ? (JSON.parse(raw) as DocComment[]) : [];
  } catch {
    return [];
  }
}

export function saveCommentsForPage(pageId: string, comments: DocComment[]): void {
  if (!pageId) return;
  try {
    localStorage.setItem(getStorageKey(pageId), JSON.stringify(comments));
  } catch {
    // 忽略异常
  }
}

export function addComment(
  pageId: string,
  highlightedText: string,
  content: string,
  author = '当前用户',
  blockId?: string
): DocComment {
  const comments = getCommentsForPage(pageId);
  const newComment: DocComment = {
    id: `comment_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    pageId,
    blockId,
    highlightedText,
    content,
    author,
    createdAt: Date.now(),
    isResolved: false,
    replies: [],
  };

  comments.unshift(newComment);
  saveCommentsForPage(pageId, comments);
  return newComment;
}

export function toggleResolveComment(pageId: string, commentId: string): boolean {
  const comments = getCommentsForPage(pageId);
  const comment = comments.find((c) => c.id === commentId);
  if (!comment) return false;

  comment.isResolved = !comment.isResolved;
  saveCommentsForPage(pageId, comments);
  return comment.isResolved;
}

export function addCommentReply(
  pageId: string,
  commentId: string,
  content: string,
  author = '当前用户'
): DocCommentReply | null {
  const comments = getCommentsForPage(pageId);
  const comment = comments.find((c) => c.id === commentId);
  if (!comment) return null;

  const reply: DocCommentReply = {
    id: `reply_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    author,
    content,
    createdAt: Date.now(),
  };

  if (!comment.replies) comment.replies = [];
  comment.replies.push(reply);
  saveCommentsForPage(pageId, comments);
  return reply;
}

export function deleteComment(pageId: string, commentId: string): void {
  const comments = getCommentsForPage(pageId);
  const filtered = comments.filter((c) => c.id !== commentId);
  saveCommentsForPage(pageId, filtered);
}
