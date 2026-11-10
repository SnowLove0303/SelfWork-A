# Implementation Tasks: clean-native-titlebar-remove-duplicate-logo-and-title

- [x] **Task 1: Win32 原生标题栏图文清空与 DWM 沉浸式暗色属性注入** `req: REQ-CLEAN-TOP-1, REQ-CLEAN-TOP-2`
  - **1.1** 在 `src-tauri/Cargo.toml` 中为 `windows-sys` 追加 `"Win32_UI_WindowsAndMessaging"` 特性依赖。
  - **1.2** 在 `src-tauri/tauri.conf.json` 中将主窗口的 `"title"` 字段改为空字符串 `""`。
  - **1.3** 在 `src-tauri/src/lib.rs` 的 `.setup` 生命周期中，获取窗口 HWND：
    - 调用 `SendMessageW(hwnd, WM_SETICON, ICON_SMALL, 0)` 与 `SendMessageW(hwnd, WM_SETICON, ICON_BIG, 0)` 剔除图标句柄；
    - 取得 `GetWindowLongPtrW(hwnd, GWL_EXSTYLE)` 并注入 `WS_EX_DLGMODALFRAME` 样式；
    - 调用 `SetWindowPos(hwnd, ..., SWP_FRAMECHANGED)` 强制 DWM 重绘非客户区；
    - 保持已有 DWM 沉浸式暗色属性（`DWMWA_USE_IMMERSIVE_DARK_MODE` 20 与 19）完好。
  - **验证命令**：`cargo test --manifest-path "F:/App Location/SelfWork/src-tauri/Cargo.toml"` (已验证：5 passed, 0 failed, 退出码 0)

- [x] **Task 2: 代码检阅与全量双环境工程构建编译** `req: REQ-CLEAN-TOP-4`
  - **2.1** 通过 `vscode-review`（`review_diff_in_vscode`）提请用户在 VS Code 原生差异比对视图中审查 `Cargo.toml`, `tauri.conf.json`, `lib.rs` 的每一行代码变更。
  - **2.2** 运行前端静态检查：`pnpm check`，确保零错误零警告 (已验证：tsc --noEmit 退出码 0)。
  - **2.3** 杀死可能正在运行的 `SelfWork.exe` 进程。
  - **2.4** 运行 Rust + Tauri 单文件构建：`pnpm tauri build --no-bundle` (已验证：release 构建成功，退出码 0)。
  - **2.5** 将构建产物 `src-tauri/target/release/selfwork-desktop.exe` 覆盖同步更新至根目录单文件交付物 `F:\App Location\SelfWork\SelfWork.exe` (已验证：5,579,264 字节同步完成)。
  - **验证命令**：
    - `pnpm --dir "F:/App Location/SelfWork" check` (PASS)
    - `cargo test --manifest-path "F:/App Location/SelfWork/src-tauri/Cargo.toml"` (PASS)
    - `Test-Path "F:/App Location/SelfWork/SelfWork.exe"` (PASS)

- [x] **Task 3: 变更记录更新与 Git 提交推送** `req: REQ-CLEAN-TOP-3, REQ-CLEAN-TOP-4`
  - **3.1** 更新 `CHANGELOG.md`，追加 `[0.1.16]` 版本发布记录（注明清空原生标题栏图文杂质、保留纯净深黑拖拽条、品牌标识单点独家呈现）。
  - **3.2** 提请用户在 VS Code 中审查 `CHANGELOG.md` 的变更 (已通过 review_diff_in_vscode 检阅完成)。
  - **3.3** 提交 Git 并推送到远程仓库 `origin/main`。
  - **验证命令**：`git -C "F:/App Location/SelfWork" status`
