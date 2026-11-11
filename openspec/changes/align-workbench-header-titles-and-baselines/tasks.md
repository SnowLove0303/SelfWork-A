# Tasks: 对齐待办清单与思维导图顶栏标题坐标与全局水平基准线

- [x] Task 1: 重构 `TasksPanel.tsx` 顶栏结构以匹配全局 `h-[49px]` 基准
  - 将原复合结构拆解为标准的 `h-[49px] px-3.5` 顶标头行与次级快捷录入条。
  - 保证图标、标题文字、统计徽标与状态过滤胶囊在 49px 高度内完美居中。
  - 接入 VS Code 差异检阅 (`vscode-review:review_diff_in_vscode`)。
  - 验证命令: `pnpm --dir "F:/App Location/SelfWork" check`。

- [x] Task 2: 跨模块对比校验与空间坐标零抖动端到端确认
  - 运行 `pnpm --dir "F:/App Location/SelfWork" check` (0 errors, 0 warnings)。
  - 运行 `cargo test --manifest-path "F:/App Location/SelfWork/src-tauri/Cargo.toml"` (5/5 pass)。
  - 重新打包产出 `SelfWork.exe` 并启动测试切页视觉效果。
  - 沉淀 `CHANGELOG.md`，执行 Git 提交并推送。
