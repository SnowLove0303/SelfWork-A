# Tasks: 启动器原生可靠唤起、图标动态提取与极简纯净化开发任务清单

- [x] Task 1: Rust 后端进程唤起与图标提取 IPC 彻底升级
  - 重构 `src-tauri/src/lib.rs` 中的 `launch_custom_target`：
    - 对 `.exe` 本地程序采用 `std::process::Command` 直起并自动推导父目录为 `working_dir`；
    - 对 `.lnk` 快捷方式、文件夹及 URL 采用 Windows 原生 Shell 通道可靠唤起；
  - 增补 `get_app_icon(target: String)` IPC 命令，支持从 `.exe` / `.lnk` 提取 PNG Base64 Data URL；
  - 注册新命令至 Tauri `invoke_handler`，更新并补充 Rust 单元测试；
  - 接入 VS Code 差异检阅 (`vscode-review:review_diff_in_vscode`)；
  - 验证命令: `cargo test --manifest-path "F:/App Location/SelfWork/src-tauri/Cargo.toml"`。

- [x] Task 2: 前端启动项模型增补图标契约与自动提取持久化管线
  - 在 `src/types/launcher.ts` 中为 `LauncherItem` 增补 `icon?: string`；
  - 在 `src/components/LauncherDashboard.tsx` 实现图标异步懒提取与自动回写 SQLite 持久化管线；
  - 接入 VS Code 差异检阅 (`vscode-review:review_diff_in_vscode`)；
  - 验证命令: `pnpm --dir "F:/App Location/SelfWork" check`。

- [x] Task 3: 启动项晶体卡片极简纯净化重塑
  - 重构 `src/components/LauncherDashboard.tsx` 卡片渲染结构：
    - 彻底移除卡片上暴露的长物理路径文本与冗余说明文本；
    - 核心呈现 40x40 真实应用原生图标（带平滑圆角与辉光）与清晰应用名称；
    - 卡片高度收敛优化，交互悬浮微光更通透；
    - 物理路径与参数收敛在“编辑启动项”模态框中完整呈现；
  - 接入 VS Code 差异检阅 (`vscode-review:review_diff_in_vscode`)；
  - 验证命令: `pnpm --dir "F:/App Location/SelfWork" check`。

- [x] Task 4: 双端编译打包、实测启动与发布沉淀
  - 运行全量机检（`pnpm check` 零警告零错误，`cargo test` 100% 通过）；
  - 打包生成最新的 `SelfWork.exe` 桌面端单文件程序并调起实测（点击微信、飞书等验证真实打开，检查图标呈现与极简卡片）；
  - 更新 `CHANGELOG.md` 并提交推送到 GitHub 远程仓库。
