# Proposal: Document Editing and Typography Enhancements (Phase 1: P0)

## Why
SelfWork 个人工作台的文档模块目前已具备基础块编辑器、浮动工具栏与大纲抽屉，但缺乏高频写作时所需的 Markdown 快捷输入心流、精细的文字与背景强调色、层级折叠块（Toggle Block）以及实时的字数统计与大纲联动导航。本提案作为文档排版增强的第一期（P0 阶段），旨在对齐 Notion 与飞书文档的核心编辑体验，全面释放用户的写作与排版效率。

## What Changes
- **Markdown 极速键入语法自动转换**：行首键入 `# `、`## `、`### `、`> `、`- `、`1. `、`[] `、`---` 自动转换为对应标题、引用、列表、待办或分割线块，实现纯键盘心流输入。
- **文本颜色与背景高亮调色盘**：浮动格式工具栏扩展 9 阶专业语义配色方案（文字颜色 + 背景高亮色），支持一键涂色与格式清除。
- **Toggle 折叠列表块**：扩展块类型模型新增 `toggle` 类型，支持左侧展开/收起三角箭头交互，展开后容纳子内容，状态自动持久化。
- **悬浮大纲目录与实时统计**：大纲目录与文档结构实时双向联动，支持平滑滚动定位与聚焦；增加实时中文字数、英文单词数、字符数与预估阅读时长统计。

### Spec-Kit 需求物理对账矩阵 (RTM 1:1)
| 需求编号 | 实施模块 | 变更要点 | 验收依据 [Measured] |
| :--- | :--- | :--- | :--- |
| **REQ-01** | Markdown 极速键入自转换 | 输入 `# `、`> `、`- `、`1. `、`[] ` 等语法即时转换块类型并清除前缀 | 键盘输入事件触发状态机转换，退出码 0 |
| **REQ-02** | 文本颜色与高亮底色调色盘 | 浮动工具栏扩展文字颜色与背景高亮调色盘，支持涂色与清除 | 富文本格式化标签注入，无冗余脏 DOM，退出码 0 |
| **REQ-03** | 折叠列表/折叠块 (Toggle Block) | 新增 `toggle` 块级类型，提供三角展开/折叠交互与状态持久化 | 折叠状态流转与数据持久化，退出码 0 |
| **REQ-04** | 悬浮大纲目录与实时统计 | 随标题动态生成目录树、平滑滚动定位；实时统计中英文字数与阅读时长 | 大纲节点精准映射与统计防抖更新，退出码 0 |

## Capabilities

### New Capabilities
- `doc-typography`: 现代化富文本排版与键盘心流输入增强能力，包括 Markdown 快捷语法转换、调色盘、Toggle 折叠块及悬浮大纲字数统计。

### Modified Capabilities
*(无已存在的 capabilities 变更)*

## Impact
- **前端受影响组件**：
  - `src/types/docs.ts` (扩展 `BlockType` 与格式属性契约)
  - `src/components/docs/editor/BlockItem.tsx` (注入 Markdown 语法快捷侦听、Toggle 块渲染)
  - `src/components/docs/editor/FloatingFormatToolbar.tsx` (扩展调色盘与高亮器)
  - `src/components/docs/editor/SlashMenu.tsx` (增加 Toggle 块选项)
  - `src/components/docs/editor/BlockEditor.tsx` (集成字数统计器与大纲联动)
- **后端数据库**：兼容现有 SQLite JSON 块存储，无需破坏性迁移。
