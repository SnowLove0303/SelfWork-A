# Tasks: 快速启动卡片文字去噪、新建项按钮统一与组合排版极简

- [x] 1. 顶栏 [+ 新建项] 按钮统一为暗晶体风格 <!-- id: 1 -->
  - 在 `src/components/LauncherDashboard.tsx` 中将 `[+ 新建项]` 调整为与相邻按钮完全一致的 Secondary Ghost 暗晶体
  - 验证命令：`pnpm --dir "F:/App Location/SelfWork" check`

- [x] 2. 组合卡片顶栏移除冗余应用数量文字 <!-- id: 2 -->
  - 在 `src/components/LauncherDashboard.tsx` 中删除组合卡片顶栏散落的 `subItems.length 个应用` 裸露文本
  - 保持模式徽标独立胶囊排版，数量由底栏按钮唯一负责
  - 验证命令：`pnpm --dir "F:/App Location/SelfWork" check`

- [x] 3. 单品卡片全面移除左上角类型文字标签 <!-- id: 3 -->
  - 在 `src/components/LauncherDashboard.tsx` 中移除常规卡片左上角的 `badge.label` 文字徽标
  - 仅在多选模式下显示左侧勾选复选框，常规模式保持左上角纯净留白
  - 验证命令：`pnpm --dir "F:/App Location/SelfWork" check`

- [x] 4. VS Code 原生差异审核、E2E 测试核销、生产构建与现场热替换 <!-- id: 4 -->
  - 通过 `vscode-review:review_diff_in_vscode` 呈报 UI 变更
  - 运行 `scripts/launcher-e2e-test.mjs` 端到端回归测试
  - 运行 `pnpm tauri build --no-bundle` 构建最新生产程序并通过 `replace-and-launch.mjs` 热替换上线
  - 验证命令：`pnpm --dir "F:/App Location/SelfWork" check && cargo test --manifest-path "F:/App Location/SelfWork/src-tauri/Cargo.toml"`
