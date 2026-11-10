# Implementation Tasks: tasks-and-memos-drag-reorder

- [x] **Task 1: 待办清单拖拽重排功能实现** `req: REQ-DRAG-01, REQ-DRAG-03, REQ-DRAG-04`
  - **1.1** 修改 `src/components/tasks/TasksPanel.tsx`：
    - 引入 HTML5 拖拽事件（`onDragStart`, `onDragOver`, `onDragEnter`, `onDragLeave`, `onDrop`, `onDragEnd`）；
    - 为每个待办项左侧增设精致 `GripVertical` 拖拽把手图标（带 `cursor-grab active:cursor-grabbing`）；
    - 实现拖拽中透明度与目标落点高亮指示反馈；
    - 严格隔离复选框、优先级圆点、删除等交互控件，防误触防吞没；
    - 在组件 Props 中新增 `onReorderTasks: (newTasks: TaskItem[]) => void` 回调。
  - **1.2** 修改 `src/components/TasksView.tsx`：
    - 接入 `onReorderTasks` 并更新 `tasks` 状态，触发自动 300ms 防抖持久化至 SQLite 数据库。
  - **验证命令**：`pnpm --dir "F:/App Location/SelfWork" check`

- [x] **Task 2: 灵感便签卡片拖拽重排功能实现** `req: REQ-DRAG-02, REQ-DRAG-03, REQ-DRAG-04`
  - **2.1** 修改 `src/components/tasks/MemoBoard.tsx`：
    - 为每张便签卡片操作栏增设拖拽抓手或卡片级拖拽监听；
    - 严格隔离 `input` 标题输入框、`textarea` 正文编辑框、置顶按钮、调色盘与删除按钮；
    - 挂载拖拽目标反馈样式与重排算法；
    - 在组件 Props 中新增 `onReorderMemos: (newMemos: MemoItem[]) => void` 回调。
  - **2.2** 修改 `src/components/TasksView.tsx`：
    - 接入 `onReorderMemos` 并更新 `memos` 状态，触发自动 300ms 防抖持久化至 SQLite 数据库。
  - **验证命令**：`pnpm --dir "F:/App Location/SelfWork" check`

- [x] **Task 3: 全量工程编译、产物同步与变更沉淀** `req: REQ-DRAG-05`
  - **3.1** 通过 `vscode-review`（`review_diff_in_vscode`）提请用户在 VS Code 原生差异视图中审查所有涉及的变更文件。
  - **3.2** 运行 `pnpm check` 与 `cargo test` 确保零错误零警告。
  - **3.3** 杀死运行中进程并运行 `pnpm tauri build --no-bundle` 全量编译发布包。
  - **3.4** 复制更新至单文件交付物 `F:\App Location\SelfWork\SelfWork.exe`。
  - **3.5** 在 `CHANGELOG.md` 追加 `[0.1.19]` 发布说明，并执行 Git 提交推送。
  - **验证命令**：
    - `pnpm --dir "F:/App Location/SelfWork" check`
    - `cargo test --manifest-path "F:/App Location/SelfWork/src-tauri/Cargo.toml"`
    - `Test-Path "F:/App Location/SelfWork/SelfWork.exe"`
    - `git -C "F:/App Location/SelfWork" status`
