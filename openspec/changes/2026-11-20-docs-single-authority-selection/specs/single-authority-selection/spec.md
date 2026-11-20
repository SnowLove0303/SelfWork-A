# 规格契约：选区单一权威归一化与消除双重高亮 (Specification)

## 1. 规范概述
本规范确立文档编辑器在文本划选时的唯一权威准则，严格遵循 RFC 2119 规范，彻底消除多重选区并存与高亮叠加。

---

## 2. 行为契约 (RFC 2119)

### 2.1 选区单一权威契约 (Single Authority Invariant)
- 无论用户是在单段内划选还是跨段大面积划选，屏幕上呈现的有效选区 **SHALL** 在任何时刻保持**唯一权威性（Single Source of Truth）**；
- 系统 **SHALL NOT** 允许浏览器原生 `window.getSelection()` 与自定义 `CSS.highlights` 同时对同一段文字或相邻段落进行双重着色；
- 当检测到鼠标开始跨段划选（`currentBlock !== anchorBlock`）时，系统 **SHALL** 立即调用 `window.getSelection()?.removeAllRanges()` 彻底清除原生选区残留，将整个选区渲染通道无缝移交给 `CSS.highlights` 字符 Range；
- 当用户在同一个段落内部划选且未跨越段落边界时，系统 **SHALL** 仅允许单层原生选区工作，严禁额外激活自定义 Highlight 导致色彩重叠。

### 2.2 单层纯净色彩与无重影契约 (Single-Layer Color Purity)
- 被选文字的背景色彩 **SHALL** 保持单层 0.28 透明度的统一天蓝微光（`rgba(56, 189, 248, 0.28)`），严禁两层相同或不同颜色叠加产生高饱和度深斑；
- 被选文字的前景色 **SHALL** 保持清晰锐利的 `#f8fafc`，消除文本因图层复合渲染产生的模糊、发虚或毛边。

### 2.3 零延迟性能与字符精度不变量 (Performance Invariant)
- 选区归一化逻辑 **SHALL** 完全在 `handleGlobalMouseMove` 内部的底层引用中完成，严禁重新引入导致全树渲染的 React `setState`；
- 拖拽过程中的渲染帧率 **SHALL** 维持在 60fps~120fps，字符级精确起止（从落点字符至悬停字符）保持零衰减。

### 2.4 所见即所得复制 (WYSIWYG Clipboard)
- `Ctrl+C` 提取的内容 **SHALL** 精准等于屏幕上唯一可见的那套单层高亮字符切片；
- `Backspace` 与 `Delete` **SHALL** 妥善移除所覆盖字符，并平滑保留未选文字。
