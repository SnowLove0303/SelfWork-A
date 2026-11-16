# Tasks: 快速启动执行报文防挤压与左侧边栏版本信息彻底清除

- [x] 1. 快速启动执行报文默认收起与右侧悬浮抽屉防挤压改造 <!-- id: 1 -->
  - 在 `src/components/LauncherDashboard.tsx` 将 `isTelemetryOpen` 默认值设为 `false`
  - 将报文面板渲染节点重构为 `absolute right-0 top-0 bottom-0 z-30` 悬浮抽屉，具备高斯模糊背景与深邃投影，彻底消除排版回流与按钮挤压
  - 验证命令：`pnpm --dir "F:/App Location/SelfWork" check`

- [x] 2. 左侧主导航栏底部版本号与分割线彻底清除 <!-- id: 2 -->
  - 在 `src/components/Sidebar.tsx` 中移除 `v0.1.0-alpha` 文本容器与 `border-t` 横线
  - 验证命令：`pnpm --dir "F:/App Location/SelfWork" check`

- [x] 3. VS Code 原生差异审核、全栈回归机检与单文件 EXE 生产构建 <!-- id: 3 -->
  - 调用 `vscode-review:review_diff_in_vscode` 逐一提交代码变动供用户在原生 Diff 视图中把控
  - 运行 `pnpm check` 与 `cargo test` 确认零错误零警告
  - 运行 `pnpm tauri build --no-bundle` 编译生成最新 100% 离线脱机 `SelfWork.exe` 桌面端并热替换启动
  - 验证命令：`pnpm --dir "F:/App Location/SelfWork" check && cargo test --manifest-path "F:/App Location/SelfWork/src-tauri/Cargo.toml"`
