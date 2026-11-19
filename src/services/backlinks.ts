import { DocPage, DocBlock } from '../types/docs.ts';

export interface BacklinkItem {
  sourcePageId: string;
  sourcePageTitle: string;
  sourcePageIcon?: string;
  sourceUpdatedAt: number;
  blockId: string;
  contextPreview: string;
}

/**
 * 扫描全工作区所有文档，提取引用当前页面的反向链接列表
 */
export function scanBacklinksForPage(
  targetPageId: string,
  allPages: DocPage[]
): BacklinkItem[] {
  if (!targetPageId || !Array.isArray(allPages)) return [];
  const results: BacklinkItem[] = [];
  const otherPages = allPages.filter((p) => p.id !== targetPageId);

  for (const page of otherPages) {
    try {
      const raw = localStorage.getItem(`selfwork_doc_blocks_${page.id}`);
      if (!raw) continue;
      const blocks: DocBlock[] = JSON.parse(raw);
      if (!Array.isArray(blocks)) continue;

      for (const block of blocks) {
        if (!block.content) continue;
        const hasRef =
          block.content.includes(`#/page/${targetPageId}`) ||
          (block.content.includes('data-page-link="true"') &&
            block.content.includes(targetPageId));

        if (hasRef) {
          // 清洗 HTML 标签，生成通顺文本预览
          const cleanText = block.content
            .replace(/<[^>]+>/g, ' ')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/\s+/g, ' ')
            .trim();

          results.push({
            sourcePageId: page.id,
            sourcePageTitle: page.title || '无标题文档',
            sourcePageIcon: page.icon || '📄',
            sourceUpdatedAt: page.updatedAt || block.updatedAt || Date.now(),
            blockId: block.id,
            contextPreview: cleanText.slice(0, 140) || '引用链接段落',
          });
        }
      }
    } catch (err) {
      console.warn(`[Backlinks] Failed to scan page ${page.id}:`, err);
    }
  }

  // 按最近更新时间倒序排列
  return results.sort((a, b) => b.sourceUpdatedAt - a.sourceUpdatedAt);
}
