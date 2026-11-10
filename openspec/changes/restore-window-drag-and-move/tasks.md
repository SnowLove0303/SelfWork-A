# Implementation Tasks: restore-window-drag-and-move

## Single-Focus Lock: Task Pipeline

- [x] **Task 1: 创建 Tauri v2 Capabilities 权限配置与 Rust 备用拖拽命令 (src-tauri/capabilities/default.json, src-tauri/src/lib.rs)**
  - **因果归属**: [Root Source] 权限沙箱解锁与内核拖拽指令
  - **实现目标**:
    - 创建 `src-tauri/capabilities/default.json` 并授予 `core:window:allow-start-dragging` 等必要窗口权限；
    - 在 `src-tauri/src/lib.rs` 中增补 `window_start_dragging` 命令并注册到 Handler；
    - 运行 `cargo test` 确保编译通过与测试全绿。
  - **实测验证门禁 [Measured]**:
    - `cargo test --manifest-path "F:/App Location/SelfWork/src-tauri/Cargo.toml"` 全部 5 项测试通过，退出码 0。

- [x] **Task 2: Header 与 Sidebar Brand 接入全域 onMouseDown 拖拽双冗余流 (src/components/Header.tsx, src/components/Sidebar.tsx)**
  - **因果归属**: [State Transition & UI] 前端顶栏事件捕获与防冲突裁决
  - **实现目标**:
    - 在 `Header.tsx` 顶栏容器挂载 `handleMouseDown` 事件，智能识别非按钮目标并调用 `startDragging()`；
    - 在 `Sidebar.tsx` 顶端 Brand 区域同样挂载 `handleMouseDown` 拖拽支持；
    - 确保侧栏折叠按钮、状态胶囊、窗口控制三按键独立响应，点击零吞没；
    - 保留双击最大化/还原切换。
  - **实测验证门禁 [Measured]**:
    - `pnpm check` 零警告零错误退出码 0；
    - `pnpm build` 打包完全通过，退出码 0。

- [x] **Task 3: 全量构建、单文件封包交付与真实拖拽验证 (SelfWork.exe)**
  - **因果归属**: [Verification & Delivery] 生产封包与版本演进
  - **实现目标**:
    - 执行 `cargo test` 确保底层 5 项测试全绿，退出码 0；
    - 执行 `pnpm tauri build --no-bundle` 编译生成最新 Release 单文件可执行程序；
    - 覆盖并生成根目录 `SelfWork.exe`；
    - 更新 `CHANGELOG.md` 记录 `[0.1.14]` 修复。
  - **实测验证门禁 [Measured]**:
    - `cargo test` 5/5 项全绿，退出码 0；
    - `pnpm tauri build --no-bundle` 退出码 0；
    - 根目录单文件可执行程序 `SelfWork.exe` 交付就绪。
