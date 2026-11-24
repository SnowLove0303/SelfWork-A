# Tasks: 修复目录子路径漏检并清除冗余数字徽章

- [x] **Task 1: Rust 后端实现目录最长前缀子路径归属匹配 (`launcher:folder-longest-prefix`)**
  - **实测验证**: `cargo check` 零警告零错误。
- [x] **Task 2: 清理 `ProcessManifestModal.tsx` 标题重复徽章与行内 `×N` 徽章 (`ui:manifest-debloat`)**
  - **实测验证**: `pnpm check` Exit 0。
- [x] **Task 3: 清理 `LauncherDashboard.tsx` 卡片右上角数字并全量构建部署 (`ui:card-debloat-release`)**
  - **实测验证**: `pnpm tauri build --no-bundle` Exit 0，进程存活，Git 提交。
