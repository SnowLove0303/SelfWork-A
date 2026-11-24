# Tasks: 纳入文件夹运行检测关闭并极简化运行清单

- [x] **Task 1: Rust 后端扩展文件夹窗口探测与安全关闭指令 (`launcher:folder-detect-close`)**
  - **实测验证**: `cargo test` 零警告零错误。
- [x] **Task 2: 简化 `ProcessManifestModal.tsx` 去除技术表述与多开功能 (`ui:manifest-simplify`)**
  - **实测验证**: `pnpm check` Exit 0。
- [x] **Task 3: 接入 `LauncherDashboard.tsx` 文件夹状态与关闭联动并全量构建部署 (`launcher:folder-ui-release`)**
  - **实测验证**: `pnpm tauri build --no-bundle` Exit 0，进程存活，Git 提交。
