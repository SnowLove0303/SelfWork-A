# Tasks: 快速启动卡片排版防乱、多屏幕实时检测与无缝分屏吸附

- [x] 1. 多显示器检测与目标屏幕定向类型契约扩展 <!-- id: 1 -->
  - 在 `src/types/launcher.ts` 中新增 `SystemMonitorInfo` 契约
  - 在 `WindowLayoutConfig` 中扩展可选 `targetMonitorIndex?: number`
  - 验证命令：`pnpm --dir "F:/App Location/SelfWork" check`

- [x] 2. Rust 后端 `get_system_monitors` 与多屏幕/无缝 DWM 补偿平铺指令实现 <!-- id: 2 -->
  - 在 `src-tauri/src/lib.rs` 中新增 `get_system_monitors` 命令
  - 在 `arrange_combo_windows` 中支持 `target_monitor_index: Option<usize>`
  - 在象限绝对坐标计算中引入 DWM 边缘贴合 7px 补偿，消除相邻窗口大缝隙
  - 增加专属单元测试
  - 验证命令：`cargo test --manifest-path "F:/App Location/SelfWork/src-tauri/Cargo.toml"`

- [x] 3. 组合卡片排版防乱治理与前端多屏幕选择 UI 联动 <!-- id: 3 -->
  - 重构 `src/components/LauncherDashboard.tsx` 组合卡片顶栏徽标布局，杜绝字符竖排折行错乱
  - 在组合创建/编辑弹窗及多选分屏工具栏中增加「目标屏幕」选择胶囊/下拉框
  - 启动分屏时携带选中的目标屏幕索引至后端
  - 验证命令：`pnpm --dir "F:/App Location/SelfWork" check`

- [x] 4. VS Code 原生差异审核、E2E 测试核销、生产构建与现场热替换 <!-- id: 4 -->
  - 通过 `vscode-review:review_diff_in_vscode` 提交代码变动审查
  - 扩展 `scripts/launcher-e2e-test.mjs` 测试多屏配置往返持久化
  - 运行 `pnpm tauri build --no-bundle` 构建生产包并热替换启动
  - 验证命令：`pnpm --dir "F:/App Location/SelfWork" check && cargo test --manifest-path "F:/App Location/SelfWork/src-tauri/Cargo.toml"`
