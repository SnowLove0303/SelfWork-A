# Design: Docs Table Cross-Cell Range Selection and Rich Text Formatting

## 1. 架构拓扑 (Architecture Topology)

```mermaid
flowchart TD
    subgraph Table_Event_Coordinator["表格交互总线 (Table Interaction Coordinator)"]
        MouseInput["鼠标事件: 单击 / 双击 / 拖拽 / Shift+点击"]
        KeyInput["键盘事件: Delete / Ctrl+C / Ctrl+V / Ctrl+B / Esc"]
    end

    subgraph State_Machine["双轨选区状态机 (Dual-Track Selection State Machine)"]
        Mode_Single["Mode A: 单单元格文本聚焦编辑态\n(activeCell: {r, c}, selectedRange: null)"]
        Mode_Range["Mode B: 跨行跨列区域选中态\n(selectedRange: {start, end})"]
    end

    subgraph Formatting_Engine["富文本编辑与格式化引擎"]
        FloatingBar["FloatingFormatToolbar (选中文本气泡菜单)"]
        ExecCommand["富文本应用 (bold / italic / underline / code)"]
        BatchApply["批量单元格富文本应用 (所选矩形网格批量环绕)"]
    end

    subgraph Data_Sync["数据同步与输出"]
        ClipboardSync["剪贴板多通道 (TSV 制表符 / Markdown 表格)"]
        MarkdownExport["Markdown 无损转义与物理落盘"]
    end

    MouseInput --> State_Machine
    KeyInput --> State_Machine
    Mode_Single -->|划选局部文字| FloatingBar
    FloatingBar --> ExecCommand
    Mode_Range -->|Ctrl+B / 批量命令| BatchApply
    Mode_Range -->|Delete / Backspace| Table_Event_Coordinator
    Mode_Range -->|Ctrl+C / Ctrl+V| ClipboardSync
    ExecCommand --> MarkdownExport
    BatchApply --> MarkdownExport
```

## 2. 双轨选区状态机状态转换 (State Transitions)

1. **进入 Mode A (单单元格编辑)**:
   - 单击某一单元格：`activeCell = { rIdx, cIdx }`，`selectedRange = null`。
   - 单元格内聚焦，光标处于文本中。
   - 鼠标划选文本：触发 `checkSelection()`，计算选区坐标 `getBoundingClientRect()` 并渲染 `FloatingFormatToolbar`。
2. **进入 Mode B (跨行跨列多选)**:
   - 方式 1：按住 Shift 单击另一单元格 `(r2, c2)` -> `selectedRange = { start: activeCell, end: { rIdx: r2, cIdx: c2 } }`。
   - 方式 2：在单元格边框/外沿按住鼠标拖拽至其他单元格 -> 动态更新 `selectedRange.end`。
   - 规范化矩形区域：
     ```ts
     const minR = Math.min(range.start.rIdx, range.end.rIdx);
     const maxR = Math.max(range.start.rIdx, range.end.rIdx);
     const minC = Math.min(range.start.cIdx, range.end.cIdx);
     const maxC = Math.max(range.start.cIdx, range.end.cIdx);
     ```
   - 处于 `[minR..maxR, minC..maxC]` 的单元格获得选区高亮样式。
3. **从 Mode B 回退到 Mode A**:
   - 单击任意单元格：多选清空，聚焦该单元格。
   - 按 `Escape`：多选清空，保持当前格聚焦。

## 3. 跨选状态下的表格编辑与文本编辑协同

1. **表格级编辑 (Table Batch Editing)**:
   - `Delete` / `Backspace`:
     ```ts
     const next = rows.map((row, r) =>
       row.map((cell, c) => (isInRange(r, c) ? '' : cell))
     );
     updateRows(next);
     ```
   - `Ctrl+C`:
     提取选区二维切片，组装为制表符分隔 TSV 格式（Excel 兼容）与标准 Markdown 表格写入剪贴板。
2. **文本级批量编辑 (Text Batch Formatting)**:
   - 在多选态下按下 `Ctrl+B` (加粗)、`Ctrl+I` (斜体)、`Ctrl+U` (下划线):
     遍历选区内每个单元格内容，若已包含对应标签则剥除，否则包裹 `<strong>` / `<em>` / `<u>`。
3. **右键上下文菜单联动**:
   - 若 `selectedRange` 存在，上下文菜单顶部显示 `已选中 ${(maxR-minR+1)*(maxC-minC+1)} 个单元格`，提供批量清空与批量对齐操作。
