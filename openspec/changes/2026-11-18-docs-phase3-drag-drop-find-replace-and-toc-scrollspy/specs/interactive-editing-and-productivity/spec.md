# 规范契约：交互编辑与生产力增强 (Interactive Editing & Productivity Spec)

## 1. 全局查找与替换规范 (Find & Replace)
- **SHALL** 当用户按下 `Ctrl + F` 或 `Cmd + F` 时，在正文区域顶部弹出查找替换微工具条；
- **SHALL** 提供输入框实时正则或文本匹配，显示当前匹配项与总匹配项计数 `(current / total)`；
- **SHALL** 支持区分大小写开关切换；
- **SHALL** 支持单次替换当前匹配项与全部批量替换；
- **SHALL** 全部替换操作必须压入 Undo 撤销栈，支持 `Ctrl + Z` 一键恢复。

## 2. 块级拖拽重排规范 (Block Drag & Drop Reordering)
- **SHALL** 所有块类型在悬停时在左侧展示 6 点拖拽抓手手柄 (`GripVertical`)；
- **SHALL** 抓手设置为 `draggable={true}`，拖拽开始时传递 `block.id`；
- **SHALL** 拖拽经过其他块时，根据光标位于该块上半部或下半部，精准呈现顶部或底部蓝色高亮指示线 (`h-0.5 bg-sky-400`)；
- **SHALL** 释放拖拽时，在数组中重排块位置，重新赋予连续递增的 `sortOrder`，并异步持久化保存至本地 SQLite 数据库。

## 3. 文档统计指标规范 (Doc Stats Badge)
- **SHALL** 在编辑器右下角常驻微光暗黑毛玻璃胶囊；
- **SHALL** 准确计算中文字数与英文单词数之和；
- **SHALL** 准确计算总字符数（不含空白）与按 300 字/分钟预估的阅读时长；
- **SHALL** 监听用户划选文字选区，即时显示当前选区字数与字符数。

## 4. 目录大纲智能过滤与 ScrollSpy 规范 (Outline & ScrollSpy)
- **SHALL** 在目录大纲顶部提供「全部」、「仅 H1」、「H1 + H2」过滤切换按钮；
- **SHALL** 监听正文区域滚动事件，计算视口顶部最贴近的标题块 ID 并高亮显示在右侧大纲对应条目上；
- **SHALL** 点击大纲标题平滑滚动至对应锚点。
