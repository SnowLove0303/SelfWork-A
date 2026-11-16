# Tasks: 快速启动组合智能分屏编排与窗口位置自动吸附 (Window Snap Tiling)

- [x] 1. 数据模型与类型契约扩展 <!-- id: 1 -->
  - 在 `src/types/launcher.ts` 中定义 `WindowTilingLayout`、`WindowSlotConfig`、`WindowLayoutConfig`
  - 在 `LauncherItem` 中扩展可选 `windowLayout?: WindowLayoutConfig`
  - 验证命令：`pnpm --dir "F:/App Location/SelfWork" check`

- [x] 2. Rust 原生多窗口工作区尺寸获取与自动吸附平铺指令实现 <!-- id: 2 -->
  - 在 `src-tauri/src/lib.rs` 中新增 `arrange_combo_windows(specs: Vec<WindowPlacementSpec>)` 命令
  - 结合 `SystemParametersInfoW(SPI_GETWORKAREA)` 动态计算屏幕工作区像素坐标
  - 针对资源管理器与应用程序窗口进行句柄匹配并调用 `SetWindowPos` 实现吸附平铺
  - 增加专属单元测试
  - 验证命令：`cargo test --manifest-path "F:/App Location/SelfWork/src-tauri/Cargo.toml"`

- [x] 3. 组合模态框可视化分屏编排 UI 与启动调度联动 <!-- id: 3 -->
  - 在 `src/components/LauncherDashboard.tsx` 组合弹窗中新增【🖥️ 屏幕窗口布局编排】选择器与象限槽位指定面板
  - 在组合启动调度管线中联动触发 `arrange_combo_windows`
  - 验证命令：`pnpm --dir "F:/App Location/SelfWork" check`

- [x] 4. VS Code 原生差异审核、E2E 真实测试、生产构建与现场核销 <!-- id: 4 -->
  - 调用 `vscode-review:review_diff_in_vscode` 逐一提交代码变动供用户在原生两栏 Diff 视图中把控
  - 扩展 `scripts/launcher-e2e-test.mjs` 覆盖四分屏数据结构与落盘验证
  - 运行 `pnpm tauri build --no-bundle` 编译最新生产包并热替换启动
  - 验证命令：`pnpm --dir "F:/App Location/SelfWork" check && cargo test --manifest-path "F:/App Location/SelfWork/src-tauri/Cargo.toml"`
