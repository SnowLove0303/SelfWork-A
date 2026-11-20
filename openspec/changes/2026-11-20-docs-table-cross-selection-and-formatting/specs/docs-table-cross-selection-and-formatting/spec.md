# Specification: Docs Table Cross-Cell Range Selection and Rich Text Formatting

## ADDED Requirements

### Requirement: Grid Range Selection State Machine
表格组件 SHALL 维护显式的二维矩形范围选区状态 `selectedRange`。当用户按住 Shift 键点击目标单元格，或从一个单元格拖拽至另一单元格时，系统 SHALL 计算并激活以 `[minR, minC]` 至 `[maxR, maxC]` 为边界的矩形选区。选区内所有单元格 MUST 呈现统一的高亮状态。按下 `Escape` 键或单击单格时，系统 MUST 立即清空多选选区。

#### Scenario: 跨行跨列矩形框选
- GIVEN 用户处于第 1 行第 1 列单元格
- WHEN 用户按住 Shift 键并点击第 2 行第 3 列单元格
- THEN 系统将从 (0,0) 至 (1,2) 的全部 6 个单元格标记为选中高亮状态。

### Requirement: Batch Table Operations in Multi-Cell Selection
当处于跨行跨列多选状态时，系统 SHALL 支持表格级与单元格级的批量操作。按下 `Delete` 或 `Backspace` 键，系统 SHALL 批量清空选区内所有单元格的内容而不改变表格结构。按下 `Ctrl+C` 键，系统 SHALL 将选区内的二维数据以 TSV 和 Markdown 表格双格式写入剪贴板。

#### Scenario: 批量清空多选单元格
- GIVEN 用户多选了 4 个包含数据的单元格
- WHEN 用户按下 `Delete` 键
- THEN 选中的 4 个单元格内容全部被清空，表格行列结构保持不变。

### Requirement: Cell Floating Format Toolbar
当用户在单个单元格内部选中文本时，系统 SHALL 在该文本选区上方浮现 `FloatingFormatToolbar` 浮动工具条，提供加粗、斜体、下划线、删除线、行内代码、文字高亮及格式清除按钮。点击相应按钮系统 MUST 立即将格式应用至选中文本。取消文本选区后工具条 MUST 自动隐形。

#### Scenario: 选中文本弹出格式工具条并加粗
- GIVEN 用户在单元格内输入了文本 "Hello World"
- WHEN 用户使用鼠标选中 "World"
- THEN 在选区上方浮现格式工具条，点击加粗按钮后 "World" 变为加粗形态。

### Requirement: Rich Text Hotkeys and Batch Cell Formatting
在单格文本编辑态下，按下 `Ctrl+B`、`Ctrl+I`、`Ctrl+U` 时，系统 SHALL 将对应富文本格式应用至当前选中文本。在跨行跨列多选状态下按下上述快捷键时，系统 SHALL 对选中区域内的所有单元格文本批量执行格式化操作。

#### Scenario: 快捷键批量加粗所选单元格
- GIVEN 用户矩形选中了第 1 行的全部 3 个表头单元格
- WHEN 用户按下 `Ctrl+B` 快捷键
- THEN 选中的 3 个单元格内所有文字均批量应用加粗样式。
