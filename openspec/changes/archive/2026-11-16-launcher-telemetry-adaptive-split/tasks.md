# Tasks: 快速启动执行报文并列协同布局与大盘卡片自适应重排

- [x] 1. 快速启动执行报文重构为并列协同 Flex 布局与卡片网格响应重排 <!-- id: 1 -->
  - 在 `src/components/LauncherDashboard.tsx` 中移除报文面板的 `absolute right-0 top-0 bottom-0 z-30` 浮层属性
  - 将其重构为并列直接子列：`w-[290px] xl:w-[350px] shrink-0 h-full flex flex-col overflow-hidden`
  - 保证主大盘容器具备 `flex-1 min-w-0`，当报文展开时主大盘宽度联动收缩，卡片网格自动重新计算列数，无任何卡片被遮挡
  - 验证命令：`pnpm --dir "F:/App Location/SelfWork" check`

- [x] 2. 顶栏工具链防挤压与自适应保护增强 <!-- id: 2 -->
  - 优化搜索框为自适应宽度 `w-28 sm:w-36 md:w-44 min-w-[70px] shrink`
  - 确保所有动作按钮均配置 `whitespace-nowrap shrink-0` 与紧凑微内边距，文字绝不折行成单字
  - 微调分类侧栏宽度为 `w-44 lg:w-52`，释放主大盘排版空间
  - 验证命令：`pnpm --dir "F:/App Location/SelfWork" check`

- [x] 3. VS Code 原生差异审核、全栈回归机检、安全热替换与单文件 EXE 验证 <!-- id: 3 -->
  - 调用 `vscode-review:review_diff_in_vscode` 逐一提交代码变动供用户在原生两栏 Diff 视图中审核
  - 运行 `pnpm check` 与 `cargo test` 确认全绿（退出码 0）
  - 运行 `pnpm tauri build --no-bundle` 编译最新生产包并通过 `scripts/replace-and-launch.mjs` 安全热替换当前运行的 `SelfWork.exe`
  - 验证命令：`pnpm --dir "F:/App Location/SelfWork" check && cargo test --manifest-path "F:/App Location/SelfWork/src-tauri/Cargo.toml"`
