# Implementation Tasks: Embedded SQLite Database Persistence

## Single-Focus Lock: Task Pipeline

- [ ] **Task 1: Rust 微内核集成 rusqlite 并构建数据库持久化模块 (db.rs)**
  - **因果归属**: [Root Source] 底层存储引擎与事务控制
  - **实现目标**:
    - 在 `src-tauri/Cargo.toml` 中配置 `rusqlite = { version = "0.32", features = ["bundled"] }`；
    - 新建 `src-tauri/src/db.rs`，实现数据库目录自动创建、WAL 模式开启、`tasks` / `memos` / `app_settings` 表初始化；
    - 实现并暴露 `db_get_all_tasks`, `db_save_all_tasks`, `db_get_all_memos`, `db_save_all_memos`, `db_get_setting`, `db_set_setting` IPC 命令；
    - 编写并运行单元测试 `test_database_crud`。
  - **实测验证门禁 [Measured]**:
    - `cargo test --manifest-path "F:/App Location/SelfWork/src-tauri/Cargo.toml"` 退出码 0。

- [ ] **Task 2: 前端持久化服务层与历史数据平滑迁移 (services/db.ts)**
  - **因果归属**: [Root Source] 数据存取适配器
  - **实现目标**:
    - 新建 `src/services/db.ts`，封装与 Tauri 后端数据库 IPC 通信；
    - 实现平滑迁移策略：初次运行若数据库为空但 `localStorage` 存有数据，自动迁入 SQLite；
    - 兼容 Web 降级环境。
  - **实测验证门禁 [Measured]**:
    - `pnpm tsc --noEmit` 静态类型检查退出码 0。

- [ ] **Task 3: 改造 TasksView 与 SettingsView 对接数据库实时存取**
  - **因果归属**: [State Transition] 业务层数据接入
  - **实现目标**:
    - 改造 `src/components/TasksView.tsx`，初始化优先从 SQLite 获取 tasks 与 memos，变更实时入库；
    - 改造 `src/App.tsx` 与 `src/components/SettingsView.tsx`，外观设置变更实时入库；
    - 验证数据增删改即刻写入物理 `selfwork.db`。
  - **实测验证门禁 [Measured]**:
    - `pnpm check` 零错误、零警告退出码 0。
    - `pnpm build` 前端构建退出码 0。

- [ ] **Task 4: 全量构建、单文件 EXE 封包与重启不丢失终审实测**
  - **因果归属**: [Verification & Delivery] 生产交付
  - **实测验证门禁 [Measured]**:
    - `pnpm tauri build --no-bundle` 编译出最新生产态 `SelfWork.exe` 退出码 0。
    - 离线独立运行验证，新增待办、修改便签、关闭软件重新打开，数据 100% 完好复原。
