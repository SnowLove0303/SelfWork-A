# Tasks: Docs Table Cross-Cell Range Selection and Rich Text Formatting

## 1. 任务实施概览与执行锁状态

- [x] **Task 1: 实现表格双轨选区状态机 (Single-Cell Focus & Multi-Cell Range Selection)**
  - **因果角色**: [Root State Machine]
  - **关联需求**: REQ-TABLE-SELECT
  - **核心动作**:
    1. 在 `TableBlock.tsx` 引入 `selectedRange` 状态与 `isInSelectedRange(r, c)` 判断器；
    2. 支持 Shift+点击快速选定矩形网格，支持跨单元格鼠标拖拽扩展矩形选区；
    3. 为选区内单元格渲染高质感主题色覆盖层 (`bg-sky-500/15 ring-1 ring-sky-500/40`)；
    4. 监听 `Escape` 键与单击外部，平滑退出多选态。
  - **实测验证**: `cd "F:\App Location\SelfWork" ; pnpm check` 零警告零错误。

- [x] **Task 2: 挂载单元格内划选浮动格式工具条 (`FloatingFormatToolbar`)**
  - **因果角色**: [Text Formatting UI]
  - **关联需求**: REQ-TABLE-FORMAT
  - **核心动作**:
    1. 监听单元格内部 `onMouseUp` 与 `onKeyUp`，检测文本选中范围 (`window.getSelection()`)；
    2. 计算选区屏幕绝对坐标并弹出 `FloatingFormatToolbar`；
    3. 实现 `handleApplyFormat`：支持加粗、斜体、下划线、删除线、行内代码、文字高亮与清除格式；
    4. 保证在取消选区或失焦时工具条平滑隐形。
  - **实测验证**: `cd "F:\App Location\SelfWork" ; pnpm check` 零警告零错误。

- [x] **Task 3: 实现跨选状态下的表格级批量编辑 (清空 / 复制 / 粘贴)**
  - **因果角色**: [Batch Table Operations]
  - **关联需求**: REQ-TABLE-SELECT
  - **核心动作**:
    1. 选区状态下按 `Delete` / `Backspace`：批量清空选中区域内所有单元格内容；
    2. 选区状态下按 `Ctrl+C`：提取选中切片生成 TSV 与 Markdown 表格双格式写入剪贴板；
    3. 支持剪贴板制表符多行文本在单元格内矩阵式粘贴分发；
    4. 右键上下文菜单联动：支持对多选区域批量清空与批量对齐。
  - **实测验证**: `cd "F:\App Location\SelfWork" ; pnpm check` 零警告零错误。

- [x] **Task 4: 支持全场景富文本快捷键与多选单元格批量格式化**
  - **因果角色**: [Keyboard Flow & Batch Formatting]
  - **关联需求**: REQ-TABLE-FORMAT
  - **核心动作**:
    1. 拦截单元格内 `Ctrl+B`、`Ctrl+I`、`Ctrl+U` 快捷键，单选时格式化局部文字；
    2. 在多选选区态下按 `Ctrl+B` / `Ctrl+I` / `Ctrl+U`，自动对选区内所有单元格批量应用富文本格式；
    3. 完善 Markdown 导出与落盘序列化，确保加粗、斜体、代码等富文本标签无损往返。
  - **实测验证**: `cd "F:\App Location\SelfWork" ; pnpm check` 零警告零错误。

- [x] **Task 5: 完整构建、应用热替换、1:1 双向物理核销与发布**
  - **因果角色**: [Build & Verification]
  - **关联需求**: REQ-TABLE-SELECT, REQ-TABLE-FORMAT
  - **核心动作**:
    1. 执行前端与桌面端完整编译 `pnpm tauri build --no-bundle`；
    2. 部署替换 `SelfWork.exe` (v0.1.80) 并验证运行状态；
    3. 沉淀变更记录至 `CHANGELOG.md` 并提交 git。
  - **实测验证**: 真实编译退出码 0，进程稳定启动 (PID: 30288)。
