# 技术设计：阶段 4 块级流转、模板库与历史版本

## 1. 架构拓扑与交互模型

```mermaid
flowchart TD
    User["用户操作"] --> Templates["点击预置模板"]
    User --> Snapshot["版本历史抽屉"]
    User --> MultiCol["/columns 多栏排版"]
    User --> ExportMenu["导出菜单"]

    Templates --> TmplService["docTemplates.ts\n4大工业级标准模板"]
    TmplService --> BlockStream["BlockEditor.tsx\n原子替换 blocks 注入"]

    Snapshot --> HistService["docHistory.ts\n快照存储与只读回滚"]
    HistService --> DrawerUI["DocHistoryDrawer.tsx\n时间轴预览与还原"]

    MultiCol --> ColComp["MultiColumnBlock.tsx\n2栏/3栏等宽卡片与响应式折叠"]
    ColComp --> BlockItemCol["BlockItem.tsx 通用侧柄与拖拽"]

    ExportMenu --> ExpMD["既有 Markdown 导出"]
    ExportMenu --> ExpHTML["htmlExport.ts\n独立内嵌 CSS HTML 导出"]
    ExportMenu --> ExpPrint["window.print()\nglobals.css @media print 纯净打印"]
```

## 2. 数据模型设计

### 2.1 多栏块数据结构
```ts
export interface ColumnsBlockProperties {
  columnCount: 2 | 3;
  columns: Array<{
    id: string;
    content: string;
  }>;
}
```

### 2.2 快照数据结构
```ts
export interface DocSnapshot {
  id: string;
  pageId: string;
  timestamp: number;
  label?: string;
  blockCount: number;
  wordCount: number;
  charCount: number;
  blocks: DocBlock[];
}
```

## 3. 打印与 PDF 导出设计
在 `src/styles/globals.css` 中注入：
```css
@media print {
  /* 隐藏所有界面导航与编辑器辅助控件 */
  .no-print,
  aside,
  header,
  nav,
  .doc-titlebar,
  .outline-panel,
  .doc-stats-badge,
  .find-replace-bar,
  .group:hover .opacity-100,
  button {
    display: none !important;
  }

  body, html, #root {
    background: #ffffff !important;
    color: #111827 !important;
    overflow: visible !important;
    height: auto !important;
  }

  .doc-typography {
    max-width: 100% !important;
    padding: 0 !important;
    margin: 0 !important;
  }
}
```
保证在打印对话框（选择“另存为 PDF”）时，排版极其整洁、典雅，达到出版级文档标准。
