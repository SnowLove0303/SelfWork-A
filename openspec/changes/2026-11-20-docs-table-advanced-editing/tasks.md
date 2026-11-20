# Tasks: Docs Advanced Table Editing Engine

## 1. 任务清单与单焦点执行锁 (Single-Focus Lock)

- [x] **Task 1: 在 `TableBlock.tsx` 扩充对齐状态与核心编辑函数**
  - **因果归属**: `[Core Logic]`
  - **拟变文件**: `src/components/docs/editor/TableBlock.tsx`
  - **执行内容**:
    - 实现 `insertRow(rIdx, 'above' | 'below')`；
    - 实现 `insertCol(cIdx, 'left' | 'right')`；
    - 引入 `columnAlignments` 状态与 `toggleAlignment(cIdx)`；
    - 实现 `clearRow(rIdx)` 与 `clearCol(cIdx)`；
    - 升级 `handleCopyMarkdown` 支持 GFM 对齐语法（`:---`、`:---:`、`---:`）。
  - **实测验证命令**:
    - `pnpm check` (passed, exit code 0)

- [x] **Task 2: 在 `TableBlock.tsx` 渲染层集成微交互手柄与键盘流增强**
  - **因果归属**: `[UI & Ergonomics]`
  - **拟变文件**: `src/components/docs/editor/TableBlock.tsx`
  - **执行内容**:
    - 表头挂载对齐图标按钮与插入列微按钮；
    - 行侧栏挂载上下插入行微按钮与清空行按钮；
    - 单元格键盘流拦截：`Enter` 同列下移（末行自动加行），`Shift+Enter` 换行 `<br>`，`Tab` 顺序跳格；
    - 通过 `review_diff_in_vscode` 呈报 Diff 检阅。
  - **实测验证命令**:
    - `pnpm check` (passed, exit code 0)

- [x] **Task 3: 在 `markdownExport.ts` 同步支持表格列对齐语法**
  - **因果归属**: `[Export Layer]`
  - **拟变文件**: `src/services/markdownExport.ts`
  - **执行内容**:
    - 物理导出 Markdown 时读取 `block.properties.columnAlignments`；
    - 输出精准的 GFM 对齐标记（`:---`、`:---:`、`---:`）；
    - 通过 `review_diff_in_vscode` 呈报 Diff 检阅。
  - **实测验证命令**:
    - `pnpm check` (passed, exit code 0)

- [x] **Task 4: 完整编译与应用热替换拉起 (v0.1.78)**
  - **因果归属**: `[Build & Release]`
  - **拟变文件**: `CHANGELOG.md`
  - **执行内容**:
    - 执行 `pnpm tauri build --no-bundle`；
    - 热替换拉起最新 `SelfWork.exe`；
    - 实测表格插入行列、对齐调节与键盘流畅流。
  - **实测验证命令**:
    - `Get-Process SelfWork` (PID: 28600 running)
