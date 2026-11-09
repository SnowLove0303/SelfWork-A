# Implementation Tasks: Tasks & Sticky Notes Dual-Column Workspace

## Single-Focus Lock: Task Pipeline

- [x] **Task 1: 定义待办与便签数据模型及本地持久化引擎**
  - **因果归属**: [Root Source] 数据结构与 Local-First 存储
  - **实现目标**:
    - 在 `src/types/tasks.ts` 中定义 `TaskItem`、`TaskPriority`、`MemoItem`、`MemoTheme` 及其过滤类型；
    - 在 `src/components/tasks/initialData.ts` 中准备自明、干净的初始样例数据；
    - 实现本地存储安全存取（`localStorage` 自动防抖同步）。
  - **实测验证门禁 [Measured]**:
    - `pnpm tsc --noEmit` 静态类型检查退出码 0。

- [x] **Task 2: 开发左侧 GTD 极速待办工作台 (TasksPanel)**
  - **因果归属**: [State Transition] 任务交互组件
  - **实现目标**:
    - 创建 `src/components/tasks/TasksPanel.tsx`；
    - 实现单行回车秒建输入框、复选框点击划线归档动画；
    - 实现高/中/低优先级微光圆点循环切换；
    - 实现【全部 / 今日 / 待办 / 已完成】极简胶囊过滤与一键清理已完成。
  - **实测验证门禁 [Measured]**:
    - `pnpm check` 零错误、零警告退出码 0。

- [x] **Task 3: 开发右侧灵感便签墙 (MemoBoard) 与主看板装配 (TasksView)**
  - **因果归属**: [State Transition] 便签交互与舞台集成
  - **实现目标**:
    - 创建 `src/components/tasks/MemoBoard.tsx`，支持卡片新增、就地自动折行编辑、置顶优先排序、暗色晶体色调切换与一键复制反馈；
    - 创建主装配看板 `src/components/TasksView.tsx`（58% / 42% 左右分栏），在 `src/components/SlotContainer.tsx` 中当 `activeModule === 'tasks'` 时挂载；
    - 验证透明度、毛玻璃、自定义壁纸在便签与待办界面的透视效果。
  - **实测验证门禁 [Measured]**:
    - `pnpm check` 退出码 0。
    - `pnpm build` 前端打包退出码 0。

- [x] **Task 4: 全量构建、单文件 EXE 封包与终审验收**
  - **因果归属**: [Verification & Delivery] 生产交付
  - **实测验证门禁 [Measured]**:
    - `cargo test --manifest-path "F:/App Location/SelfWork/src-tauri/Cargo.toml"` 退出码 0 (3 tests passed)。
    - `pnpm tauri build --no-bundle` 编译出最新生产态 `SelfWork.exe` 退出码 0 (4.45 MB)。
    - 离线独立运行验证，待办清单流畅增删勾选，便签卡片随心记录复制。
