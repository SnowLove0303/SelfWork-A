# Tasks: 快速启动全局按钮设计体系与调色板收敛重构

- [x] 1. 顶栏按钮组件三级层级与暗晶体规范重构 <!-- id: 1 -->
  - 在 `src/components/LauncherDashboard.tsx` 中将 `[+ 新建项]` 升级为 Primary 科技青实体高亮按钮
  - 将 `[分类]`、`[多选启动]`、`[全启动]`、`[分屏组合]`、`[>_ 执行报文]` 统一收敛为 Secondary Ghost 暗晶体风格
  - 彻底清除常驻高饱和红绿大底色，锁死 `h-8` 高度与 `rounded-xl`
  - 验证命令：`pnpm --dir "F:/App Location/SelfWork" check`

- [x] 2. 分屏组合卡片质感升级与青蓝晶体统一 <!-- id: 2 -->
  - 将置顶分屏专区的底色与边框从玫瑰粉红调整为深色磨砂晶体
  - 重构套件启动按钮为青蓝渐变微光实体风格，与全局暗色控制台统一
  - 验证命令：`pnpm --dir "F:/App Location/SelfWork" check`

- [x] 3. VS Code 原生差异审核、端到端测试与现场构建热替换 <!-- id: 3 -->
  - 通过 `vscode-review:review_diff_in_vscode` 呈报 UI 变更
  - 运行 `scripts/launcher-e2e-test.mjs` 端到端回归测试
  - 执行 `pnpm tauri build --no-bundle` 构建并热替换上线
  - 验证命令：`pnpm --dir "F:/App Location/SelfWork" check && cargo test --manifest-path "F:/App Location/SelfWork/src-tauri/Cargo.toml"`
