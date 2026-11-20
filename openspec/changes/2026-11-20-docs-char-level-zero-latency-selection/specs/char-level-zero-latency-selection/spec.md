# 规格契约：字符级高精选区与零延迟即划即现 (Specification)

## 1. 规范概述
本规范确立文档编辑器在划选大片内容时的字符级精度与零延迟性能准则，严格遵循 RFC 2119 规范。

---

## 2. 行为契约 (RFC 2119)

### 2.1 字符级精准起止契约 (Character-Level Precision)
- 当用户从起始段落内部开始拖拽时，系统 **SHALL** 将选区起始点精确锚定在鼠标点击的具体文本字符（`anchorNode, anchorOffset`），起始字符之前的文本 **SHALL NOT** 被选中；
- 当划选跨越段落进入目标段落时，系统 **SHALL** 使用 `document.caretRangeFromPoint`（或标准 Range 映射）将选区终止点精确锚定在鼠标指针当前的字符位置（`focusNode, focusOffset`）；
- 目标段落中当前字符之后的文字 **SHALL NOT** 被施加任何高亮或选中样式；
- 若划选仅涉及第二行的 1 个字符，系统 **SHALL** 仅高亮该 1 个字符，严禁对整行或整段文字进行粗暴全选。

### 2.2 零延迟与高频跟手性能契约 (Zero-Latency & High-Frequency Follow)
- 在鼠标按住并移动（`mousemove`）的划选过程中，系统 **SHALL NOT** 逐帧调用会导致 React 组件树全量 Re-render 的 `setState`；
- 选区的高亮渲染 **SHALL** 由现代浏览器的 **CSS Custom Highlight API (`CSS.highlights`)** 或原生 Range / Compositor 线程直接承载；
- 划选响应延迟 **SHALL** 小于 16ms（匹配 60Hz~120Hz 原生屏幕刷新率），彻底杜绝“指针在前面跑、高亮在后面追”的丢帧与迟滞现象。

### 2.3 双向流式划选与中间段平滑衔接 (Bidirectional Stream Continuity)
- 用户向后拖拽（从上至下）或向前拖拽（从下至上）时，系统 **SHALL** 自动根据 DOM 树的前后拓扑关系（`compareDocumentPosition`）对称调整选区的 `start` 与 `end`；
- 跨越 3 个及以上段落时，夹在首尾之间的完整段落 **SHALL** 平滑呈现全文字符高亮，与首尾两段的局部切片在视觉上连贯统一；
- 用户在文档任意位置单击时，系统 **SHALL** 立即清除 `CSS.highlights` 高亮，选区瞬时重置。

### 2.4 所见即所得剪贴板与数据契约 (WYSIWYG Clipboard & Data Parity)
- 用户在跨段字符选区状态下按下 `Ctrl+C` / `Cmd+C` 时，系统 **SHALL** 读取当前活跃 Range 的精确文本内容（`range.toString()`），严格只将高亮可见的文字和必要的段落换行写入剪贴板；
- 用户按下 `Backspace` 或 `Delete` 键时，系统 **SHALL** 精准删除当前 Range 所覆盖的字符，并保留未选文字的排版结构。
