# Design: 待办清单无痕过渡与笔记排版重构技术方案

## 1. 架构与布局演进方案

### 1.1 待办清单录入栏边界消除
在 `src/components/tasks/TasksPanel.tsx` 中：
- 原代码：`<div className="p-2.5 px-3.5 border-b border-border-subtle/50 bg-white/[0.005] shrink-0 min-w-0">`
- 优化后：`<div className="p-2.5 px-3.5 bg-white/[0.005] shrink-0 min-w-0">`，彻底移除下划线 `border-b border-border-subtle/50`，维持统一暗黑磨砂背景。

### 1.2 笔记主标题字号梯度收敛
在 `src/components/docs/editor/BlockEditor.tsx` 中：
- 原代码：`text-3xl font-bold` (30px，粗体，略显笨拙突兀)
- 优化后：`text-2xl font-semibold tracking-tight leading-snug` (24px，半粗体，紧致优雅)，与 H1 标题块（`text-xl font-semibold`）形成严谨递进的黄金比例排版层级。

### 1.3 文档编辑区与大纲目录右侧伴随式排布
在 `src/components/docs/editor/BlockEditor.tsx` 中：
- **顺序调整**：主视口采用 `flex-1 flex overflow-hidden min-h-0`。先渲染正文主编辑区，后渲染大纲目录栏。
- **正文靠左基准**：正文主滚动区设为 `flex-1 overflow-y-auto px-8 lg:px-12 py-8 min-w-0`，内部版心 `max-w-3xl lg:max-w-4xl space-y-4`。笔记图标与主标题直接自左侧基准线起始展开，形成清晰直接的第一阅读重心。
- **大纲向右相对缩进**：目录大纲栏作为右侧伴随轨（`w-56 lg:w-64 border-l border-white/5 bg-black/10 flex flex-col shrink-0 overflow-y-auto p-4`），位于正文右侧，自然呈现“笔记标题靠左，目录大纲向右缩进”的专业知识库布局；支持点击平滑锚点定位以及顶部 `[目录]` 按钮随时切换收展。

## 2. 依赖与因果拓扑
- 改动完全处于表现层排版与视觉样式，不变更 SQLite 数据结构或 Tauri 原生后端逻辑。
- 零新增外部依赖，完全复用 Tailwind CSS 实用类与原有 Lucide 图标。
