# Specs: 文档编辑器所见即所得排版与交互历史回退体系

## ADDED Requirements

### Requirement: REQ-DOC-FORMAT-01 文本排版所见即所得与快捷键支持
编辑器 SHALL 支持行内实时排版呈现。WHEN 用户选中文本并触发加粗、斜体、删除线或代码格式（通过浮动工具栏或快捷键 `Ctrl+B`、`Ctrl+I`）时，系统 SHALL 立即更新选中文本的视觉样式，且 SHALL NOT 在编辑器中向用户呈现原始 `*`、`**` 或 Markdown 标记符号。

#### Scenario: 划选文本并应用加粗
- GIVEN 文档中包含一段文本“项目开发计划”
- WHEN 用户划选“开发”二字并按下 `Ctrl+B` 或点击加粗按钮
- THEN “开发”二字以加粗（`font-bold`）高保真显示，周围不包含任何 `*` 符号，光标/选区保持在“开发”二字上。

### Requirement: REQ-DOC-UNDO-02 全生命周期历史撤回与重做系统
系统 SHALL 维护完整的编辑器操作历史栈。WHEN 用户按下 `Ctrl+Z` 时，系统 SHALL 依次撤回上一次的编辑操作（包括文字输入快照、格式应用、块新建、块删除与块类型切换）；WHEN 用户按下 `Ctrl+Y` 或 `Ctrl+Shift+Z` 时，系统 SHALL 依次重做已撤销的操作。

#### Scenario: 连续输入与格式化后的撤销
- GIVEN 用户在一个块中输入了文本并应用了加粗格式
- WHEN 用户按下 `Ctrl+Z`
- THEN 加粗格式被撤销，文字恢复常规字重；再次按下 `Ctrl+Z`，输入的文本逐步恢复上一状态。

### Requirement: REQ-DOC-CURSOR-03 光标与选区绝对稳定性保证
系统在处理块聚焦、失焦、格式化及键盘导航时，SHALL 严密保全光标与选区位置。系统 SHALL NOT 在编辑过程中发生未经用户操作的光标瞬移至末尾或丢失选区。

#### Scenario: 段落中间排版不跳光标
- GIVEN 用户在段落中间划选了 3 个字符
- WHEN 用户通过右键菜单或快捷键应用斜体格式
- THEN 选区依然保持在原 3 个字符上，光标不跳至段落最后一行。

### Requirement: REQ-DOC-INTERACT-04 智能防抖持久化与用户全流程交互
系统在用户连续敲击键盘输入内容时，SHALL 立即更新内存状态（0ms），并将后台 SQLite 持久化写入动作进行 500ms 智能防抖合并。系统 SHALL 确保在回车新建块、退格降级与合并块、Tab 缩进及斜杠 `/` 菜单呼出时保持无缝响应。

#### Scenario: 快速打字与后台自动保存
- GIVEN 用户连续快速输入长段落文本
- WHEN 用户停止输入达到 500ms
- THEN 系统在后台静默将最新块内容持久化写入 SQLite，界面无任何卡顿。
