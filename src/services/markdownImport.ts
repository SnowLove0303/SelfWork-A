import { DocBlock } from '../types/docs.ts';

export interface ParsedMarkdownResult {
  title: string;
  blocks: DocBlock[];
}

/**
 * 将单个 Markdown 文件内容解析为 SelfWork 结构化 DocBlock 流与页面标题
 */
export function parseMarkdownToBlocks(
  content: string,
  pageId: string,
  fallbackTitle: string
): ParsedMarkdownResult {
  const lines = content.split(/\r?\n/);
  const blocks: DocBlock[] = [];
  let detectedTitle = '';

  let inCodeBlock = false;
  let codeLang = '';
  let codeLines: string[] = [];

  let inTable = false;
  let tableRows: string[][] = [];

  const flushCodeBlock = () => {
    if (inCodeBlock) {
      blocks.push({
        id: `blk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        pageId,
        blockType: 'code',
        content: '',
        properties: {
          language: codeLang || 'plaintext',
          code: codeLines.join('\n'),
        },
        sortOrder: blocks.length,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      inCodeBlock = false;
      codeLang = '';
      codeLines = [];
    }
  };

  const flushTable = () => {
    if (inTable && tableRows.length > 0) {
      blocks.push({
        id: `blk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        pageId,
        blockType: 'table',
        content: '',
        properties: {
          rows: tableRows,
          hasHeaderRow: true,
        },
        sortOrder: blocks.length,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      inTable = false;
      tableRows = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // 1. 处理代码块围栏 (```)
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        flushCodeBlock();
      } else {
        flushTable();
        inCodeBlock = true;
        codeLang = trimmed.substring(3).trim().toLowerCase();
        codeLines = [];
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(rawLine);
      continue;
    }

    // 2. 处理表格行 (| ... |)
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      // 忽略 Markdown 表格分割线行 (|---|---|)
      if (/^\|[\s\-:|]+\|$/.test(trimmed)) {
        continue;
      }
      const cells = trimmed
        .slice(1, -1)
        .split('|')
        .map((c) => c.trim());
      inTable = true;
      tableRows.push(cells);
      continue;
    } else {
      flushTable();
    }

    // 忽略空白行
    if (!trimmed) {
      continue;
    }

    // 3. 标题识别 (#, ##, ###)
    if (trimmed.startsWith('# ')) {
      const headingText = trimmed.substring(2).trim();
      if (!detectedTitle) {
        detectedTitle = headingText;
      }
      blocks.push({
        id: `blk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        pageId,
        blockType: 'h1',
        content: headingText,
        sortOrder: blocks.length,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      continue;
    }

    if (trimmed.startsWith('## ')) {
      blocks.push({
        id: `blk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        pageId,
        blockType: 'h2',
        content: trimmed.substring(3).trim(),
        sortOrder: blocks.length,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      continue;
    }

    if (trimmed.startsWith('### ') || trimmed.startsWith('#### ')) {
      const text = trimmed.replace(/^#+\s*/, '').trim();
      blocks.push({
        id: `blk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        pageId,
        blockType: 'h3',
        content: text,
        sortOrder: blocks.length,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      continue;
    }

    // 4. 任务清单待办 (- [ ] 或 - [x])
    const todoMatch = trimmed.match(/^-\s*\[([ xX])\]\s*(.*)$/);
    if (todoMatch) {
      const isChecked = todoMatch[1].toLowerCase() === 'x';
      blocks.push({
        id: `blk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        pageId,
        blockType: 'todo',
        content: todoMatch[2].trim(),
        properties: { checked: isChecked },
        sortOrder: blocks.length,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      continue;
    }

    // 5. 无序列表 (- 或 *)
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      blocks.push({
        id: `blk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        pageId,
        blockType: 'bullet',
        content: trimmed.substring(2).trim(),
        sortOrder: blocks.length,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      continue;
    }

    // 6. 有序列表 (1. 2. 3.)
    const numMatch = trimmed.match(/^\d+\.\s*(.*)$/);
    if (numMatch) {
      blocks.push({
        id: `blk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        pageId,
        blockType: 'numbered',
        content: numMatch[1].trim(),
        sortOrder: blocks.length,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      continue;
    }

    // 7. 引用块 (> )
    if (trimmed.startsWith('>')) {
      blocks.push({
        id: `blk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        pageId,
        blockType: 'quote',
        content: trimmed.replace(/^>\s*/, '').trim(),
        sortOrder: blocks.length,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      continue;
    }

    // 8. 分割线 (--- 或 ***)
    if (/^(\-{3,}|\*{3,})$/.test(trimmed)) {
      blocks.push({
        id: `blk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        pageId,
        blockType: 'divider',
        content: '',
        sortOrder: blocks.length,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      continue;
    }

    // 9. 普通段落 (p)
    blocks.push({
      id: `blk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      pageId,
      blockType: 'p',
      content: trimmed,
      sortOrder: blocks.length,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  }

  flushCodeBlock();
  flushTable();

  // 如果没有块，则留一个默认空白段落
  if (blocks.length === 0) {
    blocks.push({
      id: `blk_${Date.now()}_default`,
      pageId,
      blockType: 'p',
      content: '',
      sortOrder: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  }

  return {
    title: detectedTitle || fallbackTitle,
    blocks,
  };
}
