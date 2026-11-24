# Tasks: UI 非必要说明清理与 UI 技能强制绑定下沉

- [x] **Task 1: 清理 `ProcessManifestModal.tsx` 冗余说明文案 (`ui:text-economy`)**
  - **实测验证**: `pnpm check` Exit 0。
- [x] **Task 2: 在 `AGENTS.md` 下沉 UI 技能强制绑定条款 (`ui:governance-lock`)**
  - **实测验证**: `AGENTS.md` 包含完整条款。
- [x] **Task 3: 全量构建、热替换部署与 Git 提交 (`ui:release`)**
  - **实测验证**: `pnpm tauri build --no-bundle` Exit 0，进程存活。
