# Implementation Tasks: native-dark-titlebar-and-dwm-immersive

## Single-Focus Lock: Task Pipeline

- [x] **Task 1: Tauri 恢复窗口装饰与注入 DWM 沉浸式深色模式 (src-tauri/Cargo.toml, src-tauri/tauri.conf.json, src-tauri/src/lib.rs)**
  - **因果归属**: [Root Source] 窗口外壳物理属性与 DWM 沉浸式暗黑注入
  - **实现目标**:
    - 在 `src-tauri/Cargo.toml` 中为 `windows-sys` 开启 `"Win32_Graphics_Dwm"` 特性；
    - 在 `src-tauri/tauri.conf.json` 中配置 `"decorations": true` 与 `"theme": "Dark"`；
    - 在 `src-tauri/src/lib.rs` 的 `.setup` 钩子中针对主窗口 HWND 执行 `DwmSetWindowAttribute`（常量 20 与 19），强行开启深色标题栏；
    - 运行 `cargo test` 确保底层编译通过与单元测试全绿。
  - **实测验证门禁 [Measured]**:
    - `cargo test --manifest-path "F:/App Location/SelfWork/src-tauri/Cargo.toml"` 全部 5 项测试通过，退出码 0。

- [x] **Task 2: 前端顶栏与侧栏去重净化 (src/components/Header.tsx, src/components/Sidebar.tsx, src/App.tsx)**
  - **因果归属**: [UI Cleanup] 剔除重复自定义按键与冗余模拟事件
  - **实现目标**:
    - 在 `Header.tsx` 中剔除自定义最小化、最大化、关闭三按键与分割线，避免与系统标题栏产生“双套按键”冗余；
    - 剔除 `Header.tsx` 与 `Sidebar.tsx` 中冗余的 `handleStartDragging` 软件模拟拖拽代码与相关属性；
    - 简化 `App.tsx` 根视口样式与最大化状态传参；
    - 保持顶栏对模块标题（快速启动/待办清单）与状态胶囊的纯粹呈现。
  - **实测验证门禁 [Measured]**:
    - `pnpm check` 零警告零错误退出码 0；
    - `pnpm build` 打包完全通过，退出码 0。

- [x] **Task 3: 全量构建与单文件 EXE 封包交付 (SelfWork.exe)**
  - **因果归属**: [Verification & Delivery] 生产封包与版本演进
  - **实现目标**:
    - 执行 `cargo test` 确保底层测试全绿，退出码 0；
    - 执行 `pnpm tauri build --no-bundle` 编译生成最新 Release 单文件可执行程序；
    - 覆盖并生成根目录 `SelfWork.exe`；
    - 更新 `CHANGELOG.md` 记录 `[0.1.15]` 版本演进。
  - **实测验证门禁 [Measured]**:
    - `cargo test` 5/5 项全绿，退出码 0；
    - `pnpm tauri build --no-bundle` 退出码 0；
    - 根目录单文件可执行程序 `SelfWork.exe` 交付就绪。
