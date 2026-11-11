# Tasks: 思维导图背景与视觉调性统一对齐

- [x] Task 1: 统一一级页面 `MindMapPartitionView.tsx` 背景色与卡片晶体毛玻璃质感
  - 根节点使用 `bg-transparent`，透出工作台主画板与底层流光。
  - 左侧分区侧栏使用 `bg-black/15 border-white/[0.06] backdrop-blur-md`。
  - 顶部搜索栏与工具条使用 `bg-black/10 border-white/[0.06]`。
  - 导图卡片网格与新建导图卡片使用 `bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.08]`，对齐 Tasks/Memos 设计。
  - 接入 VS Code 差异检阅 (`vscode-review:review_diff_in_vscode`)。
  - 验证命令: `pnpm --dir "F:/App Location/SelfWork" check`。

- [x] Task 2: 统一二级画布页面 `MindMapView.tsx` 画布背景与悬浮药丸视觉质感
  - 移除二级画布视口的 `bg-slate-950` 实心底色，改为 `bg-transparent`。
  - 左上角 `[ ← 返回分区 ]` 悬浮药丸统一使用 `bg-black/45 backdrop-blur-md border-white/10 shadow-lg`，与左下角快捷键状态条材质完全一致。
  - 接入 VS Code 差异检阅 (`vscode-review:review_diff_in_vscode`)。
  - 验证命令: `pnpm --dir "F:/App Location/SelfWork" check`。

- [x] Task 3: 机械全检、二进制重新构建与端到端触觉验证
  - 运行 `pnpm --dir "F:/App Location/SelfWork" check` (0 errors, 0 warnings)。
  - 运行 `cargo test --manifest-path "F:/App Location/SelfWork/src-tauri/Cargo.toml"` (5/5 pass)。
  - 运行 `pnpm --dir "F:/App Location/SelfWork" tauri build --no-bundle` 生成最新桌面二进制 `SelfWork.exe`。
  - 验证运行视觉统一性，提交 Git 记录并沉淀 CHANGELOG。
