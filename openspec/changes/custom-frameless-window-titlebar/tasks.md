# Implementation Tasks: custom-frameless-window-titlebar

## Single-Focus Lock: Task Pipeline

- [x] **Task 1: Tauri 窗口无边框配置与 Rust 窗口操作命令 (src-tauri/tauri.conf.json, src-tauri/src/lib.rs)**
  - **因果归属**: [Root Source] 窗口物理属性与系统级操作通道
  - **实现目标**:
    - 在 `src-tauri/tauri.conf.json` 中配置 `"decorations": false`；
    - 在 `src-tauri/src/lib.rs` 中编写 `window_minimize`, `window_toggle_maximize`, `window_close`, `window_is_maximized` 4 项官方窗口 IPC 命令并注入 Handler；
    - 编写 Rust 自动化单元测试验证指令契约。
  - **实测验证门禁 [Measured]**:
    - `cargo test` 全部 5 项测试通过，退出码 0。

- [x] **Task 2: 顶部导航重构为一体化自定义标题栏 (src/components/Header.tsx)**
  - **因果归属**: [State Transition & Routing] 顶栏自定义几何结构与交互控件
  - **实现目标**:
    - 在 `Header.tsx` 右上角构建自定义窗口三按键（最小化、最大化/还原、关闭），配合 1.2px 精准描边 SVG 细线条；
    - 绑定低对比度默认态、柔和浅白悬停态与克制柔和暗红关闭态；
    - 顶栏空白区域挂载 `data-tauri-drag-region` 拖拽与双击最大化/还原交互；
    - 状态胶囊与窗口控制按钮严格隔离拖拽属性，确保点击零吞没。
  - **实测验证门禁 [Measured]**:
    - `pnpm check` 零警告零错误退出码 0。

- [x] **Task 3: 侧栏顶端与视口边界微调联动 (src/components/Sidebar.tsx, src/App.tsx)**
  - **因果归属**: [Layout & Boundary] 视口轮廓与侧栏拖拽支持
  - **实现目标**:
    - 侧栏 Brand 顶端区域挂载 `data-tauri-drag-region`，与顶栏形成连续拖拽抓手；
    - `App.tsx` 根视口在非最大化时注入 1px 细微边界轮廓（`border border-white/[0.08]`），最大化时无缝贴边（`border-0`）；
    - 监听窗口 resize 事件动态同步最大化状态。
  - **实测验证门禁 [Measured]**:
    - `pnpm check` 零警告零错误退出码 0；
    - `pnpm build` 打包完全通过，退出码 0。

- [x] **Task 4: 全量构建与无边框桌面程序交付 (SelfWork.exe)**
  - **因果归属**: [Verification & Delivery] 生产封包
  - **实现目标**:
    - 执行 `cargo test` 确保底层 5 项测试全部通过，退出码 0；
    - 执行 `pnpm tauri build --no-bundle` 生成最新单文件 EXE；
    - 覆盖并生成根目录 `SelfWork.exe`；
    - 验证无浅色 Windows 原生标题栏，深色一体化自然衔接，拖拽缩放均正常工作。
  - **实测验证门禁 [Measured]**:
    - `cargo test` 全部测试通过，退出码 0；
    - `pnpm tauri build --no-bundle` 退出码 0；
    - `SelfWork.exe` 单文件（5.5MB）完成覆盖交付。
