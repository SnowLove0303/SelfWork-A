# Specification: Notion/Feishu/Word Grade Table Interaction & Border Engineering

## ADDED Requirements

### Requirement: Border Geometry and Clean Grid
表格容器与单元格 SHALL NOT 包含任何非数据性质的操作占位列（如透明 `td` 操作列）。表格容器与单元格 MUST 采用 `border-collapse: collapse` 架构，所有单元格统一应用 `1px solid rgba(255, 255, 255, 0.08)` 边框。单元格垂直分割线在表头行与各数据行之间 MUST 严格共线对齐，绝对不允许出现任何断点、毛刺或亚像素错位。

#### Scenario: 表格网格线完全闭合无断点
- GIVEN 文档中包含一个 3 列 × 5 行的数据表格
- WHEN 表格渲染在屏幕上时
- THEN 表格最右侧单元格边框闭合，每行单元格的垂直线完全对齐，不存在任何断点或多余操作列占位。

### Requirement: Notion and Feishu Hover Inserters
当用户鼠标悬停在两列垂直边框分界区域或两行水平边框分界区域时，系统 SHALL 浮现轻量、居中的圆形 `+` 吸附手柄（尺寸 16px × 16px）。点击该手柄时，系统 SHALL 分别在两列之间插入新列或在两行之间插入新行。鼠标移开后吸附手柄 MUST 立即平滑隐形。

#### Scenario: 悬停分界线插入行列
- GIVEN 用户鼠标移动到表头两列交界垂直线处
- WHEN 鼠标悬停在该区域
- THEN 居中浮现带有 `+` 的 16px 圆形微手柄，点击后在两列之间成功插入一列，且鼠标移开后微手柄自动隐藏。

### Requirement: Context Menu for Cells and Headers
在表格内任意单元格或表头右键时，系统 SHALL 阻止浏览器默认右键菜单，在光标位置弹出定制的紧凑暗黑毛玻璃上下文菜单，包含对齐选项、行操作（上下插入/清空/删除）、列操作（左右插入/清空/删除）及整表操作。点击外部或按 Esc 键 MUST 立即关闭菜单。

#### Scenario: 右键弹出上下文菜单并执行操作
- GIVEN 用户在任意表格单元格上右键点击
- WHEN 右键事件触发
- THEN 阻止原生浏览器菜单，在鼠标指针位置弹出暗黑毛玻璃上下文菜单，支持快速修改对齐方式或删除/插入行。

### Requirement: Word Keyboard Navigation
在单元格内按 `Enter`（未按 Shift），系统 SHALL 下移同列聚焦下一行单元格；若已在最后一行，SHALL 自动在底部新增一行并聚焦。在单元格内按 `Shift + Enter`，系统 SHALL 在单元格内正常换行。`Tab` 与 `Shift + Tab` 保持正逆向单元格跳跃。

#### Scenario: 快捷键流畅录入
- GIVEN 用户光标处于最后一行第一个单元格中
- WHEN 用户按下 `Enter` 键
- THEN 系统在表格底部自动追加新行，并将光标移动至新行的第一个单元格。
