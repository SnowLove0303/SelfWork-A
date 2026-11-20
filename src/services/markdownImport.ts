import { DocBlock } from '../types/docs.ts';
import { healTableRows, isNotionFlatSummaryBlock } from './docHealingService.ts';

export interface ParsedMarkdownResult {
  title: string;
  icon?: string;
  blocks: DocBlock[];
}

/**
 * 前置语义净化器：剥离外部平台（如 Notion 网页复制）的外壳、面包屑、代码块控制栏与表格操作条噪点
 */
export function sanitizeImportText(rawText: string): {
  text: string;
  detectedTitle?: string;
  detectedIcon?: string;
} {
  let text = rawText.replace(/\r\n/g, '\n');
  let detectedIcon = '';
  let detectedTitle = '';

  // 1. 匹配并清洗 Notion 网页复制产生的顶栏外壳与元数据
  // 形式：(废纸篓...)?(私人|工作区)? / title·1399 个块目录大纲(190)🐍🖼️添加封面
  const headerRegex =
    /^(?:废纸篓\s*)?(?:私人|工作区|空间)?\s*[\/／]\s*([\s\S]*?·\s*\d+\s*个块|[\s\S]*?)(?:目录大纲\s*\(\d+\))?([\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}])?(?:🖼️)?(?:添加封面|添加图标|添加评论)?([\s\S]*)$/u;
  const headerMatch = text.match(headerRegex);

  if (
    headerMatch &&
    (text.startsWith('废纸篓') || /^(?:私人|工作区|空间)?\s*[\/／]/.test(text))
  ) {
    let rawTitle = (headerMatch[1] || '')
      .replace(/·\s*\d+\s*个块/g, '')
      .trim();
    if (headerMatch[2]) {
      detectedIcon = headerMatch[2];
    }
    // 连续重复标题去重 (e.g. TitleTitle)
    const halfLen = Math.floor(rawTitle.length / 2);
    for (let len = halfLen; len >= 3; len--) {
      const part1 = rawTitle.slice(0, len);
      const part2 = rawTitle.slice(len, len * 2);
      if (part1 === part2) {
        rawTitle = part1;
        break;
      }
    }
    detectedTitle = rawTitle.trim();
    text = (headerMatch[3] || '').trim();
  }

  // 2. 清除孤立的 Notion 按钮与外壳残屑行
  text = text.replace(
    /^\s*(?:·\s*\d+\s*个块|目录大纲\s*\(\d+\)|添加封面|添加图标|添加评论|移至废纸篓)\s*$/gm,
    ''
  );

  // 3. 清理表格操作条噪点（如：数据表格2 列 × 5 行首行表头复制 MD加列加行）
  text = text.replace(
    /数据表格\s*\d+\s*列\s*×\s*\d+\s*行(?:\s*首行表头)?(?:\s*复制\s*MD)?(?:\s*加列)?(?:\s*加行)?/g,
    '\n'
  );

  // 4. 清理代码块 Header 噪点与按钮（如：Python不换行行号复制123456# ...）
  text = text.replace(
    /(?:([a-zA-Z0-9_#+]+)\s*)?(?:不换行|换行)?\s*(?:行号)?\s*复制\s*\d+(?:\r?\n|(?=[#"'\/<{\[\w\s]))/g,
    (_, lang) => {
      const codeLang = lang ? lang.toLowerCase() : 'python';
      return `\n\`\`\`${codeLang}\n`;
    }
  );

  // 5. 清除输出代码后紧随的行号残屑（例如 \n3注意 -> \n注意）
  text = text.replace(/\n\d+(?=[\u4e00-\u9fa5])/g, '\n');

  // 6. 清除 Notion 网页复制产生的扁平汇总长行（避免作为段落插入）
  text = text
    .split('\n')
    .filter((line) => !isNotionFlatSummaryBlock({ blockType: 'p', content: line }))
    .join('\n');

  return { text: text.trim(), detectedTitle, detectedIcon };
}

/**
 * 健壮切分 Markdown 表格行：采用负向后行断言，保护单元格内转义竖线 \|
 */
export function splitTableRow(line: string): string[] {
  const inner = line.trim().replace(/^\|/, '').replace(/\|$/, '');
  const rawCells = inner.split(/(?<!\\)\|/);
  return rawCells.map((c) => c.replace(/\\\|/g, '|').trim());
}

/**
 * 表格行规整与防克隆去重：对齐列数并消除重复克隆列
 */
export function normalizeTableRows(rows: string[][]): string[][] {
  return healTableRows(rows);
}

/**
 * 将单个 Markdown 文件或粘贴文本内容解析为 SelfWork 结构化 DocBlock 流与页面元数据
 */
export function parseMarkdownToBlocks(
  content: string,
  pageId: string,
  fallbackTitle: string
): ParsedMarkdownResult {
  const sanitized = sanitizeImportText(content);
  const lines = sanitized.text.split(/\r?\n/);
  const blocks: DocBlock[] = [];
  let detectedTitle = sanitized.detectedTitle || '';

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
          code: codeLines.join('\n').trim(),
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
      const normalized = normalizeTableRows(tableRows);
      blocks.push({
        id: `blk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        pageId,
        blockType: 'table',
        content: '',
        properties: {
          rows: normalized,
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
      // 检查代码块首行是否带有多余的 Notion 工具条噪点
      const cleanLine = rawLine.replace(
        /^(?:[a-zA-Z0-9_#+]+)?\s*(?:不换行|换行)?\s*(?:行号)?\s*复制\s*\d+\s*/,
        ''
      );

      // 检查是否代码输出与随后的中文段落粘连在一起
      const codeProseMatch = cleanLine.match(
        /^([\s\S]*?[\]\}\)"'])\s*([\u4e00-\u9fa5][\s\S]*)$/
      );
      if (codeProseMatch) {
        codeLines.push(codeProseMatch[1]);
        flushCodeBlock();
        // 将后半截中文直接作为普通段落入流
        blocks.push({
          id: `blk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          pageId,
          blockType: 'p',
          content: codeProseMatch[2].trim(),
          sortOrder: blocks.length,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        continue;
      }

      codeLines.push(cleanLine);
      continue;
    }

    // 2. 处理表格行 (| ... |)
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      // 忽略 Markdown 表格分割线行 (|---|---|)
      if (/^\|[\s\-:|]+\|$/.test(trimmed)) {
        continue;
      }
      const cells = splitTableRow(trimmed);
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
    icon: sanitized.detectedIcon || undefined,
    blocks,
  };
}
