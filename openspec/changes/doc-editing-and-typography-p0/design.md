# Design: Document Editing and Typography Architecture (Phase 1: P0)

## Context
See `proposal.md` for background and user request mapping. SelfWork uses a block-based document editor where each block (`DocBlock`) is rendered as an independent `contentEditable` or specialized container. Content is persisted in SQLite via `docsDb.ts`. To support Notion/Feishu-grade typing experience, this design introduces syntax auto-conversion, color formatting palettes, toggle blocks, and outline/stats synchronizers.

## Goals / Non-Goals

**Goals:**
- 实现 Markdown 语法前缀的实时侦测与瞬时块类型转换。
- 在 `FloatingFormatToolbar` 中引入低饱和度黑曜石玻璃拟态调色盘（文字色 + 底色高亮）。
- 扩展 `BlockType` 契约，新增 `toggle` 折叠块模型及交互动效。
- 在 `BlockEditor` 顶层增加实时字数/阅读时长统计胶囊，增强大纲树点击平滑滚动导航。
- 保证严格符合 `--max-warnings=0` 静态类型零错误，严格保证数据可持久化至 SQLite。

**Non-Goals:**
- 本期（P0）不引入复杂嵌套的多栏排版 (Columns)、LaTeX 公式块与 Mermaid 架构图（留待 P1 期规划）。
- 不破坏现有历史栈 (Undo/Redo) 状态机。

## Decisions

### Decision 1: 基于 DOM Input/KeyDown 拦截实现 Markdown 快捷语法转换
- **Rationale**: 在 `contentEditable` 的 `onInput` 或 `onKeyDown` 阶段，检查当前块内容的前缀字符串。一旦匹配到例如 `# `、`> `、`- ` 等标记，立即调用 `onUpdate('', targetType)` 触发类型转换并清空前缀，既保持 React 单向数据流，又无缝保留光标体验。
- **Alternatives considered**: 全局正则捕获重绘（会导致重渲染时光标跳动，体验生硬）。

### Decision 2: 调色盘采用语义 Token 类名与内联 CSS 变量混合方案
- **Rationale**: 采用 `--sp-color-*` 语义预设（灰、红、橙、黄、绿、青、蓝、紫、粉），通过 `document.execCommand('styleWithCSS', false, 'true')` 或 Range 包装 `<span style="color: ...; background-color: ...">` 实现高保真富文本，在保证跨平台兼容的同时杜绝不可控的脏样式。

### Decision 3: Toggle 折叠块的轻量状态建模
- **Rationale**: 在 `DocBlock.properties` 中扩展 `isCollapsed: boolean` 字段。折叠状态由块独立管理，不破坏既有扁平块序列存储模型，刷新页面后能从 SQLite 准确恢复折叠状态。

## Risks / Trade-offs

- **[选区丢失导致浮动调色盘无法准确着色]** → 使用 `window.getSelection()` 捕获并保存 `Range` 对象，在用户点击调色盘色块时恢复选区并执行格式化。
- **[频繁打字导致字数统计性能损耗]** → 对统计函数引入 300ms 防抖，使用 `useMemo` 或轻量轻量计数器，确保千级字符输入流畅无卡顿。

## Implementation File Map

- `src/types/docs.ts`: 扩展 `BlockType` (新增 `'toggle'`)。
- `src/components/docs/editor/BlockItem.tsx`: 增加 Markdown 语法检测拦截器与 Toggle 块渲染。
- `src/components/docs/editor/FloatingFormatToolbar.tsx`: 嵌入文字色与高亮色双轨调色器。
- `src/components/docs/editor/SlashMenu.tsx`: 注册 `/toggle` 菜单项。
- `src/components/docs/editor/BlockEditor.tsx`: 挂载字数统计指示条与平滑大纲导航。
