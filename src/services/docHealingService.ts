import { DocBlock } from '../types/docs.ts';

/**
 * 判断某个 Block 是否为外部（如 Notion 网页复制）产生的扁平汇总残屑段落
 */
export function isNotionFlatSummaryBlock(
  block: { blockType?: string; content?: string }
): boolean {
  if (block.blockType && block.blockType !== 'p') {
    return false;
  }
  const content = (block.content || '').trim();
  if (!content) return false;

  // 1. 匹配标准首尾带竖线且包含重复词组的扁平汇总行
  if (content.startsWith('|') && content.endsWith('|')) {
    // 检查是否包含多组连续重复的列名或数据（如 "运算 | 运算"、"Python 写法 | Python 写法"）
    const doubledPattern = /([^|\s]{2,})\s*\|\s*\1\s*\|/g;
    const matches = content.match(doubledPattern);
    if (matches && matches.length >= 2) {
      return true;
    }
    // 检查是否包含表格特征串且字段过度堆叠
    if (
      content.length > 80 &&
      content.includes('运算') &&
      content.includes('Python 写法') &&
      content.includes('结果')
    ) {
      return true;
    }
  }

  // 2. 匹配没有包裹在标准表格中的大段表格摘要文本
  if (
    content.includes('数据表格') &&
    content.includes('首行表头') &&
    content.includes('复制 MD')
  ) {
    return true;
  }

  return false;
}

/**
 * 修复与自愈表格二维数据：消除双倍克隆列并合并因竖线转义被切碎的单元格
 */
export function healTableRows(rawRows: string[][]): string[][] {
  if (!rawRows || !Array.isArray(rawRows) || rawRows.length === 0) {
    return rawRows;
  }

  const header = rawRows[0];
  if (!Array.isArray(header) || header.length === 0) {
    return rawRows;
  }

  // 1. 检测表头是否为双倍克隆 (如: ["运算","运算","Python 写法","Python 写法","结果","结果"])
  let isDoubled = header.length >= 4 && header.length % 2 === 0;
  if (isDoubled) {
    for (let i = 0; i < header.length; i += 2) {
      const colA = (header[i] || '').trim();
      const colB = (header[i + 1] || '').trim();
      if (colA !== colB) {
        isDoubled = false;
        break;
      }
    }
  }

  let cleanedRows = rawRows;
  if (isDoubled) {
    cleanedRows = rawRows.map((r) => r.filter((_, idx) => idx % 2 === 0));
  }

  const targetHeader = cleanedRows[0];
  const targetColCount = targetHeader.length;

  // 2. 遍历各行，修复因转义竖线被错误拆分的单元格并对齐列数
  return cleanedRows.map((row, rowIdx) => {
    if (rowIdx === 0) {
      return row.map((c) => (c || '').trim());
    }

    const mergedRow: string[] = [];
    for (let c = 0; c < row.length; c++) {
      let cell = (row[c] || '').trim();

      // 如果当前单元格以反斜杠结尾（如 "A \" 或 "A \\"），且下一个单元格存在，说明是被误切的转义竖线
      if (
        (cell.endsWith('\\') || cell.endsWith('\\\\')) &&
        c + 1 < row.length
      ) {
        const nextCell = (row[c + 1] || '').trim();
        const base = cell.replace(/\\+$/, '').trim();
        mergedRow.push(`${base} \\| ${nextCell}`);
        c++; // 跳过下一个碎片单元格
      } else {
        mergedRow.push(cell);
      }
    }

    // 若由于克隆导致合并后仍然有多余的重复项，且长度超过表头，进行双倍折叠处理
    if (mergedRow.length === targetColCount * 2) {
      let canFold = true;
      for (let i = 0; i < mergedRow.length; i += 2) {
        if (mergedRow[i] !== mergedRow[i + 1]) {
          canFold = false;
          break;
        }
      }
      if (canFold) {
        return mergedRow.filter((_, idx) => idx % 2 === 0);
      }
    }

    // 对齐到表头列数
    while (mergedRow.length < targetColCount) {
      mergedRow.push('');
    }
    return mergedRow.slice(0, targetColCount);
  });
}

/**
 * 对整篇文档的 Blocks 运行深度自愈
 */
export function healDocumentBlocks(blocks: DocBlock[]): {
  healedBlocks: DocBlock[];
  hasChanged: boolean;
} {
  let hasChanged = false;
  const healed: DocBlock[] = [];

  for (const block of blocks) {
    // 1. 过滤 Notion 扁平汇总残屑段落
    if (isNotionFlatSummaryBlock(block)) {
      hasChanged = true;
      continue;
    }

    // 2. 表格块运行时自愈
    if (block.blockType === 'table' && block.properties?.rows) {
      const rawRows = block.properties.rows as string[][];
      const normalizedRows = healTableRows(rawRows);

      // 比对是否有结构变化
      const rawJson = JSON.stringify(rawRows);
      const healedJson = JSON.stringify(normalizedRows);

      if (rawJson !== healedJson) {
        hasChanged = true;
        healed.push({
          ...block,
          properties: {
            ...block.properties,
            rows: normalizedRows,
          },
        });
        continue;
      }
    }

    healed.push(block);
  }

  return { healedBlocks: healed, hasChanged };
}
