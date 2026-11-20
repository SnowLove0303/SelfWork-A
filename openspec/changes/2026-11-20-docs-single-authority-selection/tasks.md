# 任务分解与执行清单 (Tasks)

- [x] Task 1: 建立单块与跨段选区权威互斥机制 (`BlockEditor.tsx`)
  - [x] 1.1 在跨段划选触发时立即执行 `window.getSelection()?.removeAllRanges()` 清除原生选区残留
  - [x] 1.2 在单块内划选时确保 `CSS.highlights` 彻底清除，消除双重叠色
  - [x] 1.3 移除 `BlockItem.tsx` 中可能存在的任何残留行级/块级高亮类名
  - [x] 1.4 通过 `vscode-review` 提交代码检阅并通过 `pnpm check`（退出码 0）

- [x] Task 2: 单元测试、生产构建与热替换部署发布 (v0.1.73)
  - [x] 2.1 运行 Rust 单元测试 `cargo test` 确保 14/14 全绿
  - [x] 2.2 运行生产构建 `pnpm tauri build --no-bundle`
  - [x] 2.3 替换 `SelfWork.exe` 并交互拉起前台验证
  - [x] 2.4 更新 `CHANGELOG.md` 记录 `[0.1.73]` 并推送到 GitHub `main` 分支
