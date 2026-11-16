# Tasks: 快速启动分屏组合单拎专区展示与宽幅卡片重构

- [x] 1. 大盘项目派生与置顶分屏专区分栏重构 <!-- id: 1 -->
  - 在 `src/components/LauncherDashboard.tsx` 中将 `currentItems` 拆分为 `comboSuites` 与 `standardItems`
  - 新增【🖥️ 屏幕分屏与工作流套件】置顶专区容器，支持自适应隐藏与多列自适应网格
  - 验证命令：`pnpm --dir "F:/App Location/SelfWork" check`

- [x] 2. 宽幅复合组合卡片组件排版与全要素呈现 <!-- id: 2 -->
  - 实现自适应宽卡片：顶栏标题与分屏徽标、中栏成员微标签流、底栏一键平铺启动按钮
  - 彻底消除重叠挤压与文字截断
  - 支持快捷菜单与启动调度联动
  - 验证命令：`pnpm --dir "F:/App Location/SelfWork" check`

- [x] 3. VS Code 原生差异审核、E2E 测试核销、生产构建与现场热替换 <!-- id: 3 -->
  - 通过 `vscode-review:review_diff_in_vscode` 提交变动供用户在 VS Code 原生 Diff Editor 中审核
  - 运行 `scripts/launcher-e2e-test.mjs` 端到端回归测试
  - 运行 `pnpm tauri build --no-bundle` 构建最新生产包并通过 `replace-and-launch.mjs` 热替换上线
  - 验证命令：`pnpm --dir "F:/App Location/SelfWork" check && cargo test --manifest-path "F:/App Location/SelfWork/src-tauri/Cargo.toml"`
