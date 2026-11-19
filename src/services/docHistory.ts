import { DocBlock, DocSnapshot } from '../types/docs.ts';

const DOC_SNAPSHOTS_PREFIX = 'selfwork_doc_snapshots_';
const MAX_SNAPSHOTS_PER_PAGE = 25;

/**
 * 加载目标文档的历史快照列表 (按时间倒序)
 */
export function loadDocSnapshots(pageId: string): DocSnapshot[] {
  try {
    const raw = localStorage.getItem(`${DOC_SNAPSHOTS_PREFIX}${pageId}`);
    if (!raw) return [];
    const list: DocSnapshot[] = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch (err) {
    console.warn('[DocHistory] Failed to load snapshots', err);
    return [];
  }
}

/**
 * 为文档保存新的历史快照
 */
export function saveDocSnapshot(
  pageId: string,
  blocks: DocBlock[],
  label?: string
): DocSnapshot {
  const now = Date.now();
  let fullText = '';
  blocks.forEach((b) => {
    fullText += b.content.replace(/<[^>]+>/g, ' ') + ' ';
  });
  const chineseChars = fullText.match(/[\u4e00-\u9fa5]/g)?.length || 0;
  const englishWords = fullText.match(/[a-zA-Z0-9_-]+/g)?.length || 0;
  const wordCount = chineseChars + englishWords;
  const charCount = fullText.replace(/\s+/g, '').length;

  const newSnapshot: DocSnapshot = {
    id: `snap_${now}_${Math.random().toString(36).substring(2, 6)}`,
    pageId,
    timestamp: now,
    label,
    blockCount: blocks.length,
    wordCount,
    charCount,
    blocks: JSON.parse(JSON.stringify(blocks)),
  };

  const existing = loadDocSnapshots(pageId);
  // 防抖过滤：如果上一次快照在 15 秒内且内容块数/字数完全一致，则更新时间戳即可
  if (
    existing.length > 0 &&
    now - existing[0].timestamp < 15000 &&
    existing[0].wordCount === wordCount &&
    existing[0].blockCount === blocks.length
  ) {
    existing[0].timestamp = now;
    localStorage.setItem(`${DOC_SNAPSHOTS_PREFIX}${pageId}`, JSON.stringify(existing));
    return existing[0];
  }

  const updated = [newSnapshot, ...existing].slice(0, MAX_SNAPSHOTS_PER_PAGE);
  localStorage.setItem(`${DOC_SNAPSHOTS_PREFIX}${pageId}`, JSON.stringify(updated));
  return newSnapshot;
}

/**
 * 删除特定历史快照
 */
export function deleteDocSnapshot(pageId: string, snapshotId: string): void {
  const existing = loadDocSnapshots(pageId);
  const updated = existing.filter((s) => s.id !== snapshotId);
  localStorage.setItem(`${DOC_SNAPSHOTS_PREFIX}${pageId}`, JSON.stringify(updated));
}
