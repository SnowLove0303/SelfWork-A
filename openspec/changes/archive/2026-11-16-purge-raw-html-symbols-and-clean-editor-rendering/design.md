# Design: 彻底清除富文本原始HTML标签与符号堆叠、统一净空编辑器渲染流

## 1. 架构目标与核心原则
1. **消除代码污染 (Zero HTML Leakage)**：
   - 彻底废除向 `block.content` 注入 `<span class="text-rose-400">` 和 `<mark class="...">` 的错误做法。
   - 块内容只承载自然的纯文本与标准 Markdown 内联标记（`**加粗**`、`*斜体*`、`~~删除线~~`、`` `行内代码` ``）。
   - 右键菜单聚焦于这 4 种最常用、最稳定的标准 Markdown 格式与清除格式，不再向文本注入冗长前端类名代码。
2. **纯文本大纲索引 (Clean Outline Extraction)**：
   - 在 `BlockEditor.tsx` 的 `outlineHeadings` 提取逻辑中，增加 `stripMarkdownAndHtml(text)` 纯化函数，把 `**标题**` 或其他标记清洗成最纯净的文本，供右侧大纲导航渲染。
3. **顶层标题与正文层级去重 (Canonical Title Boundary)**：
   - 页面大标题（`page.title`）负责文档总命名，文档正文块不再冗余插入重复的 `h1` 大标题。
4. **数据清洗与自愈 (Database Sanitization)**：
   - 清理 SQLite 数据库中的测试笔记，剥除所有历史遗留的 HTML 标签和重复大标题。

## 2. 详细改造设计

### 2.1 `BlockContextMenu.tsx` 改造
- 移除复杂的颜色和高亮注入逻辑，保留清晰直观的快捷操作：
  - 加粗 (Bold) `**`
  - 斜体 (Italic) `*`
  - 删除线 (Strike) `~~`
  - 行内代码 (Code) `` ` ``
  - 清除格式 (Clear formatting)
  - 转换块类型 (Turn into: 段落, 标题 1/2/3, 待办, 列表, 引用, 代码)
  - 剪切 / 复制
- 保持二级标题子弹窗优雅展开，不触碰任何坐标与 Portal 计算。

### 2.2 `BlockItem.tsx` 改造
- 移除脆弱的失焦 HTML 渲染切块，统一由轻量级文本渲染处理；
- 过滤掉输入或粘贴内容中可能混入的 `<span ...>` 或 `<mark ...>` 标签，自动将其剥除恢复为纯净文本；
- 保持行首 Markdown 速记（`# `, `## `, `### `, `[] `, `- `, `> `, `---`）与键盘流行为不受影响。

### 2.3 `BlockEditor.tsx` 改造
- 提取大纲时使用正则表达式清洗：
  ```ts
  const cleanText = b.content
    .replace(/<[^>]*>/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/~~(.*?)~~/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .trim();
  ```
  保证目录大纲纯粹干净。

### 2.4 数据清洗脚本
- 运行更新脚本，将现存测试页面整理为整洁、易读、无符号噪音的样例文档。
