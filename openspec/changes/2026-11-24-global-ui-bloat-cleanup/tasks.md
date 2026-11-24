# Tasks: 全工作台各功能模块非必要说明全面去噪

- [x] **Task 1: 清理 `ProcessManifestModal.tsx` 冗余路径、标签与引导语 (`ui:clean-manifest`)**
  - **实测验证**: `pnpm check` Exit 0。
- [x] **Task 2: 清理 `LauncherDashboard.tsx` 冗余副标题与弹窗说明 (`ui:clean-launcher`)**
  - **实测验证**: `pnpm check` Exit 0。
- [x] **Task 3: 清理文档与多维表格模块 7 处冗余说明 (`ui:clean-docs`)**
  - **实测验证**: `pnpm check` Exit 0。
- [x] **Task 4: 清理思维导图模块冗余说明并完成全量构建部署 (`ui:clean-release`)**
  - **实测验证**: `pnpm tauri build --no-bundle` Exit 0，进程存活，Git 提交。
