# Tasks: 报文控制栏防溢出、顶栏呼吸空间重构、冗余文本剔除与文档表格 Swarm 派发

- [x] 1. 报文顶栏防溢出收敛与底栏调试废话彻底清除 <!-- id: 1 -->
  - 在 `src/components/launcher/TelemetryPanel.tsx` 中优化顶栏排版，确保包括 `✕` 按钮在内的控制组 100% 居于容器内部，距右边框保持 $\ge 10\text{px}$ 呼吸边距
  - 彻底删除底部的 `POWERSHELL IPC DAEMON READY UTF-8 / CREATE_NO_WINDOW` 状态栏容器与文字
  - 验证命令：`pnpm --dir "F:/App Location/SelfWork" check`

- [x] 2. 快速启动顶栏按钮间距与内外边界呼吸空间重构 <!-- id: 2 -->
  - 在 `src/components/LauncherDashboard.tsx` 将顶栏外层内衬调整为 `px-4 md:px-5`
  - 将操作按键间隙由 `gap-1.5` 优化为 `gap-2 sm:gap-2.5`，按键内衬增润为 `px-2.5 sm:px-3 py-1.5`，消除紧贴感
  - 验证命令：`pnpm --dir "F:/App Location/SelfWork" check`

- [x] 3. 初始化并挂载文档表格专属 Swarm Worker <!-- id: 3 -->
  - 调用 `swarm` 工具，注册专职智能体 `docs-table-worker`
  - 注入明确权责工作简报，建立全栈文档表格演进的独立上下文
  - 验证命令：调用 `swarm` action `status` 验证该 worker 处于就绪状态

- [x] 4. VS Code 原生差异审核、全栈回归机检、安全热替换与单文件 EXE 验证 <!-- id: 4 -->
  - 调用 `vscode-review:review_diff_in_vscode` 逐一提交代码变动供用户在原生两栏 Diff 视图中审核
  - 运行 `pnpm check` 与 `cargo test` 确认全绿（退出码 0）
  - 运行 `pnpm tauri build --no-bundle` 编译最新生产包并通过 `scripts/replace-and-launch.mjs` 安全热替换当前运行的 `SelfWork.exe`
  - 验证命令：`pnpm --dir "F:/App Location/SelfWork" check && cargo test --manifest-path "F:/App Location/SelfWork/src-tauri/Cargo.toml"`
