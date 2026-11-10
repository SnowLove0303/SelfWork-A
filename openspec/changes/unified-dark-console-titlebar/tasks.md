# Implementation Tasks: unified-dark-console-titlebar

- [x] **Task 1: Rust 微内核原生窗口控制命令与外壳配置落地** `req: REQ-TITLEBAR-05, REQ-TITLEBAR-06`
  - **1.1** 在 `src-tauri/tauri.conf.json` 中配置 `"decorations": false` 与 `"shadow": true`，彻底消除操作系统默认浅白/黑灰色断层标题栏。
  - **1.2** 在 `src-tauri/src/lib.rs` 中增设原生窗口命令：`window_minimize`、`window_toggle_maximize`、`window_close`、`window_is_maximized` 并注册到 handler，保障窗口操作双通道高可用。
  - **验证命令**：`cargo test --manifest-path "F:/App Location/SelfWork/src-tauri/Cargo.toml"` (已验证：5 passed, 0 failed, 退出码 0)

- [x] **Task 2: 前端统一深色控制台顶栏构建与占位图标移除** `req: REQ-TITLEBAR-01, REQ-TITLEBAR-02, REQ-TITLEBAR-03, REQ-TITLEBAR-04, REQ-TITLEBAR-05`
  - **2.1** 创建 `src/components/Titlebar.tsx`，实现整条贯穿的深色控制台顶栏：
    - 背景色设置为精准微蓝灰深色 `#0D1422`，底部分隔线采用 `rgba(80, 140, 200, 0.15)` 极弱冷调描边；
    - 左上角彻底清除占位小图标，重构纯净品牌文字（主标 `#E6EDF7`）与模块副标（`#8FA3BF`），保证自然留白与基线对齐；
    - 挂载 `data-tauri-drag-region` 驱动原生零延迟硬件级拖拽与双击最大化/还原；
    - 右侧集成内核连接状态探测胶囊与极简细线条窗口控制三按键（关闭按钮 Hover 触发柔和暗红 `hover:bg-rose-500/20 hover:text-rose-300`，日常保持克制）。
  - **2.2** 重构 `src/components/Sidebar.tsx`，剥离顶部冗余的 22px 占位图标与拼缝，保持纯粹模块导航列表与收起按钮。
  - **2.3** 在 `src/App.tsx` 根视口顶层挂载 `Titlebar`，下部无缝连接侧栏与主舞台，重塑完整统一的桌面控制台视觉拓扑。
  - **验证命令**：`pnpm --dir "F:/App Location/SelfWork" check` (已验证：tsc --noEmit 退出码 0)

- [x] **Task 3: 全量工程编译、产物同步与变更沉淀** `req: REQ-TITLEBAR-06`
  - **3.1** 通过 `vscode-review`（`review_diff_in_vscode`）提请用户在 VS Code 原生差异视图中审查所有涉及的变更文件 (已全部检阅通过)。
  - **3.2** 运行 `pnpm check` 与 `cargo test` 确保零错误零警告 (已验证：全绿退出码 0)。
  - **3.3** 杀死运行中进程并运行 `pnpm tauri build --no-bundle` 全量编译发布包 (已验证：发布包构建成功，退出码 0)。
  - **3.4** 复制更新至单文件交付物 `F:\App Location\SelfWork\SelfWork.exe` (已验证：5,597,696 字节更新完成)。
  - **3.5** 在 `CHANGELOG.md` 追加 `[0.1.17]` 发布说明，并执行 Git 提交推送。
  - **验证命令**：
    - `pnpm --dir "F:/App Location/SelfWork" check` (PASS)
    - `cargo test --manifest-path "F:/App Location/SelfWork/src-tauri/Cargo.toml"` (PASS)
    - `Test-Path "F:/App Location/SelfWork/SelfWork.exe"` (PASS)
    - `git -C "F:/App Location/SelfWork" status`
