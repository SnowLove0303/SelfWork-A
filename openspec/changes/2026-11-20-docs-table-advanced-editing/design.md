# Design: Docs Advanced Table Editing Engine Architecture

## 1. 架构拓扑 (Architecture Topology)

```mermaid
flowchart TD
    subgraph UI_Header["TableBlock 顶部控制条与胶囊栏"]
        SpecBadge["数据表格规格指示 (N 列 × M 行)"]
        HeaderToggle["首行表头切换 (hasHeaderRow)"]
        CopyMDBtn["复制 MD (含 GFM 对齐语法)"]
        GlobalAddCol["右侧追加新列"]
        GlobalAddRow["底部追加新行"]
    end

    subgraph Table_Canvas["表格二维呈现与交互网格"]
        ColGroup["colgroup (动态 columnWidths 像素锁)"]
        TableHeader["表头控制区: 左右插入列、对齐切换、删除列、宽度拖拽手柄"]
        TableCell["单元格实体: contentEditable、键盘流拦截 (Enter/Shift+Enter/Tab)"]
        RowActions["行操作侧栏: 上下插入行、清空行、删除行"]
    end

    subgraph Service_Export["底层服务与导出层"]
        MarkdownExporter["markdownExport.ts (支持 :---, :---:, ---:)"]
        HealingService["docHealingService.ts (自愈与竖线保护)"]
    end

    UI_Header --> Table_Canvas
    Table_Canvas --> Service_Export
```

## 2. 状态结构设计

在 `DocBlock.properties` 中扩展：
```ts
interface TableBlockProperties {
  rows: string[][];
  hasHeaderRow?: boolean;
  columnWidths?: number[];
  columnAlignments?: ('left' | 'center' | 'right')[];
}
```

## 3. 关键交互逻辑实现方案

### 3.1 任意插入行
```ts
const insertRow = (targetIdx: number, position: 'above' | 'below') => {
  const insertAt = position === 'above' ? targetIdx : targetIdx + 1;
  const newRow = Array(colCount).fill('');
  const nextRows = [...rows.slice(0, insertAt), newRow, ...rows.slice(insertAt)];
  updateRows(nextRows);
};
```

### 3.2 任意插入列
```ts
const insertCol = (targetIdx: number, position: 'left' | 'right') => {
  const insertAt = position === 'left' ? targetIdx : targetIdx + 1;
  const nextRows = rows.map((r, rIdx) => {
    const defaultVal = rIdx === 0 && hasHeaderRow ? `列 ${colCount + 1}` : '';
    return [...r.slice(0, insertAt), defaultVal, ...r.slice(insertAt)];
  });
  const nextWidths = [...localWidths.slice(0, insertAt), defaultColWidth, ...localWidths.slice(insertAt)];
  const nextAligns = [...alignments.slice(0, insertAt), 'left' as const, ...alignments.slice(insertAt)];
  setLocalWidths(nextWidths);
  updateRows(nextRows, nextWidths, nextAligns);
};
```

### 3.3 列对齐切换与 GFM Markdown 输出
```ts
const toggleAlignment = (cIdx: number) => {
  const current = alignments[cIdx] || 'left';
  const nextMap: Record<string, 'left' | 'center' | 'right'> = {
    left: 'center',
    center: 'right',
    right: 'left',
  };
  const next = nextMap[current] || 'left';
  const updated = [...alignments];
  updated[cIdx] = next;
  updateRows(rows, localWidths, updated);
};
```
在导出 Markdown 时：
```ts
const getAlignMarker = (align?: string) => {
  if (align === 'center') return ':---:';
  if (align === 'right') return '---:';
  return ':---';
};
```
