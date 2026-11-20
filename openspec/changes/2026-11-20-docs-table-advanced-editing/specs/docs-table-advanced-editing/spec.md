# Specification: Docs Advanced Table Editing Engine

## 1. 规范概述 (Overview)

本规范遵循 RFC 2119 关键词（SHALL, SHALL NOT, MUST, SHOULD），确立 SelfWork 文档模块在表格块（`TableBlock.tsx`）上的高级编辑交互、数据拓扑与键盘流契约。

## 2. 核心行为契约 (Behavioral Contracts)

### 2.1 任意位置插入行列契约 (Arbitrary Insertion Contract)
1. 系统 **SHALL** 支持在当前行上方插入新行（`insertRowAbove`）与在当前行下方插入新行（`insertRowBelow`）。新行单元格默认填充为空字符串，长度 **MUST** 与当前表头列数绝对一致。
2. 系统 **SHALL** 支持在当前列左侧插入新列（`insertColLeft`）与在当前列右侧插入新列（`insertColRight`）。
3. 插入新列时，列宽数组 `columnWidths` 与对齐数组 `columnAlignments` **MUST** 在对应索引位置同步插入默认值（默认宽度 160px，默认对齐 `'left'`）。

### 2.2 列对齐与 Markdown 输出契约 (Column Alignment Contract)
1. 表格每一列 **SHALL** 拥有独立的对齐属性，取值为 `'left'`、`'center'`、`'right'` 中的一种，缺省值 **MUST** 为 `'left'`。
2. 表头控制项 **SHALL** 提供对齐循环切换交互（`Left -> Center -> Right -> Left`）。
3. 当复制为 Markdown 表格或物理导出落盘时，分割线行 **MUST** 依据对齐属性输出合法的 GFM 语法：
   - `'left'` $\rightarrow$ `:---`
   - `'center'` $\rightarrow$ `:---:`
   - `'right'` $\rightarrow$ `---:`

### 2.3 单元格键盘人机工程契约 (Keyboard Navigation Contract)
1. 在单元格内按下 `Enter` 且未按 `Shift` 时，系统 **SHALL** 阻止默认回车行为，并将光标移动至同列下一行的单元格；若当前已处于最后一行，系统 **SHALL** 自动在底部插入新行并将焦点移动至该新单元格。
2. 在单元格内按下 `Shift + Enter` 时，系统 **SHALL** 在当前单元格内部插入 `<br>` 换行符。
3. 按下 `Tab` 时跳转下一单元格，按下 `Shift + Tab` 时跳转上一单元格。

### 2.4 行列辅助快捷操作契约 (Contextual Actions Contract)
1. 系统 **SHALL** 支持清空指定行（`clearRow`）与清空指定列（`clearCol`），将所有目标单元格置空，但保留行与列的物理结构。
2. 现有单行删除（`handleDeleteRow`）与单列删除（`handleDeleteCol`）在总行数/总列数等于 1 时 **SHALL NOT** 允许删除，防止表格结构塌陷。
