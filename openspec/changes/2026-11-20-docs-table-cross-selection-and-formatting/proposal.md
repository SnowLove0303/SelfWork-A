# Change: Docs Table Cross-Cell Range Selection and Rich Text Formatting Engine

## Why

用户提出了关于表格深水区交互的极其深刻、关键且直接触及工业级体验核心的问题：
> “首先，表格的跨行跨列选中逻辑都要优化，表格内的文本格式编辑怎么办”
> “执行，核心是，要综合考虑 跨行扩列选中情况下的表格编辑+文本编辑 的问题”

经过 **5-Whys 深度根因穿透**，查明本质：
1. **单格文本编辑 vs 跨格范围选区的冲突与割裂**：
   - 现有的表格单元格各为独立的 `contentEditable`，缺乏顶层的二维坐标范围选区状态机（Range Selection State Machine）；
   - 当用户试图拖动多选单元格时，原生 DOM 选区会造成文本跨格撕裂；且在多选状态下，没有承接批量清空、批量复制（TSV/Markdown）、矩阵粘贴等表格级编辑操作。
2. **表格内文本富文本编辑能力缺失**：
   - 单元格内没有挂载富文本浮动工具条（`FloatingFormatToolbar`），快捷键（`Ctrl+B`、`Ctrl+I` 等）未在表格上下文做针对性拦截与命令执行；
   - 用户在跨行跨列选中多个单元格时，无法一键对选区内文字批量加粗、斜体或清除格式。

## What Changes

1. **统一二维坐标选区状态机 (Unified Grid Range Selection Machine)**：
   - 引入 `selectedRange: { start: { rIdx, cIdx }, end: { rIdx, cIdx } } | null`；
   - 显式区分 **单单元格内文本光标编辑态** 与 **跨行跨列单元格矩形区域选中态**；
   - 跨格拖拽、Shift+点击或 Shift+方向键触发矩形选区，高亮展示半透明主题色覆盖层 (`bg-sky-500/15 ring-1 ring-sky-500/40`)；
   - `Escape` 键或单击单格平滑退出多选态。
2. **跨选状态下的表格级批量编辑能力 (Batch Grid Editing)**：
   - **批量清空**：多选态下按 `Delete` / `Backspace`，一键清空选中区域内全部单元格文本；
   - **矩阵复制**：多选态下按 `Ctrl+C`，按网格结构生成制表符分隔（TSV）与 GFM Markdown 表格复制到剪贴板；
   - **矩阵粘贴**：在单元格内粘贴多行多列文本时，按制表符与换行符自动切分并矩阵式填充至后续单元格；
   - **右键上下文菜单选区联动**：多选态下右键智能展示 `清空选中的 N 个单元格`、`删除选中的行/列`。
3. **单元格内划选浮动格式工具条 (Floating Bubble Formatting)**：
   - 在单元格内选中文本时光标上方浮现高质感 `FloatingFormatToolbar`；
   - 支持加粗、斜体、下划线、删除线、行内代码、文字高亮与格式清除。
4. **表格全场景富文本快捷键与批量格式化 (Rich-Text Hotkeys & Batch Formatting)**：
   - 在单格内选中文本按 `Ctrl+B` / `Ctrl+I` / `Ctrl+U` 执行局部格式化；
   - 在跨行跨列多选态下按 `Ctrl+B` / `Ctrl+I` / `Ctrl+U`，自动对**所选范围内所有单元格内容**执行批量加粗/斜体/下划线！
5. **Markdown 导出与落盘无损转换**：
   - 单元格内部富文本标签（`<strong>`、`<em>`、`<u>`、`<code>`、`<del>`）在复制 MD 与物理文件落盘时 100% 映射为合法的 Markdown 标记。
