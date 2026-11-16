# Tasks: 快速启动网页 URL 直达目标协议判定与错误拦截修复

- [x] 1. Rust 后端目标路径协议解耦与 URL 放行修复 <!-- id: 1 -->
  - 在 `src-tauri/src/lib.rs` 的 `launch_custom_target` 中拆分 `is_url` 与 `is_local_disk_path`
  - 彻底解除网络链接误触发本地磁盘物理路径存在性拦截的问题
  - 验证命令：`cargo test --manifest-path "F:/App Location/SelfWork/src-tauri/Cargo.toml"`

- [x] 2. 单元测试与端到端测试覆盖加固 <!-- id: 2 -->
  - 在 `src-tauri/src/lib.rs` 中新增针对 URL 启动不误报磁盘不存在的单元测试 `test_launch_custom_target_url_bypass_disk_check`
  - 运行 `scripts/launcher-e2e-test.mjs` 全套回归测试
  - 验证命令：`cargo test --manifest-path "F:/App Location/SelfWork/src-tauri/Cargo.toml"`

- [x] 3. VS Code 原生差异审核、生产版本编译构建与现场热替换 <!-- id: 3 -->
  - 通过 `vscode-review:review_diff_in_vscode` 呈报 Rust 代码变动供审核
  - 运行 `pnpm tauri build --no-bundle` 构建最新生产程序
  - 执行 `replace-and-launch.mjs` 热替换上线并测试网页直达卡片
  - 验证命令：`pnpm --dir "F:/App Location/SelfWork" check`
