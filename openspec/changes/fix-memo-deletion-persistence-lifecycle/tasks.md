# Implementation Tasks: 修复便签删除持久化与首发初始化生命周期

## Single-Focus Lock: Task Pipeline

- [x] **Task 1: 前端持久化服务重构生命周期初始化标记与空态保留 (src/services/db.ts)**
  - **因果归属**: [Root Source] 数据生命周期与权威源逻辑
  - **实现目标**:
    - 在 `src/services/db.ts` 中重构 `loadMemos()` 与 `loadTasks()`；
    - 基于 `db_get_setting('memos_initialized')` 与 `db_get_setting('tasks_initialized')` 显式判定；
    - 已初始化状态下，即使数据库返回空数组 `[]`，也严格以此为权威状态返回，绝不重新播种 `INITIAL_MEMOS` / `INITIAL_TASKS`；
    - 仅在首次开机未初始化时执行一次播种，并原子写入标记 `db_set_setting('memos_initialized', 'true')`；
    - 同步更新 Web 降级模式下的 localStorage 初始化标记。
  - **实测验证门禁 [Measured]**:
    - `pnpm check` 零错误、零警告退出码 0。
    - VS Code Diff 原生检阅已确认。

- [x] **Task 2: TasksView 消除挂载水合竞态与删除即时原子提交 (src/components/TasksView.tsx)**
  - **因果归属**: [State Transition] 界面交互与防抖安全锁
  - **实现目标**:
    - 引入 `isHydrated` 水合保护锁，未完成底层读取前严禁自动保存；
    - 在 `handleDeleteMemo`、`handleDeleteTask` 与 `handleClearCompleted` 中，状态变更时立即触发底层持久化 `saveMemos` / `saveTasks`，消除关窗丢失漏洞；
    - 初始状态初始化逻辑适配 `memos_initialized` 标记，避免初始渲染闪烁默认便签。
  - **实测验证门禁 [Measured]**:
    - `pnpm check` 零警告零错误退出码 0。
    - VS Code Diff 原生检阅已确认。

- [x] **Task 3: Rust 底层增补空集删除与初始化生命周期单元测试 (src-tauri/src/db.rs)**
  - **因果归属**: [Verifier & Root Source] 底层不变量验证
  - **实现目标**:
    - 在 `src-tauri/src/db.rs` 的单元测试中增补“首发播种 -> 全量删除为 0 条 -> 初始化标记持久化 -> 模拟重启再次读取依然为 0 条”的回归测试用例；
    - 确保底层引擎零缺陷。
  - **实测验证门禁 [Measured]**:
    - `cargo test --manifest-path "F:/App Location/SelfWork/src-tauri/Cargo.toml"` 全部 5 个测试通过，退出码 0。
    - VS Code Diff 原生检阅已确认。

- [x] **Task 4: 全量构建与端到端冷重启删除验证 (SelfWork.exe)**
  - **因果归属**: [Verification & Delivery] 生产封包与终审
  - **实现目标**:
    - 执行 `pnpm tauri build --no-bundle` 生成最新单文件 EXE；
    - 覆盖并生成根目录 `SelfWork.exe`（大小 5,545,472 字节，时间戳 15:26:29）；
    - 运行端到端 Python 自动化闭环测试（新增便签保持 -> 删空便签 -> 冷重启进程），验证 0 记录严格保持，默认便签 0 恢复。
  - **实测验证门禁 [Measured]**:
    - `pnpm tauri build --no-bundle` 生产编译退出码 0；
    - 端到端冷重启闭环测试退出码 0（`SUCCESS: Zero memos invariant strictly preserved across reboot! No default memos resurfacing!`）。
