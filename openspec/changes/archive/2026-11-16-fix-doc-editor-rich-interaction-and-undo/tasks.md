# Tasks: 文档编辑功能深度重构——排版所见即所得、Ctrl+Z 历史回退与光标稳定治理

- [x] 1. 行内持久化 ContentEditable 容器重构与零星号富文本排版 <!-- id: 1 -->
  - 在 `src/components/docs/editor/BlockItem.tsx` 中彻底废除 `div` 与 `textarea` 频繁切换模式
  - 采用持久挂载的 `contentEditable` 元素，所见即所得呈现加粗、斜体、删除线与行内代码
  - 原生绑定 `Ctrl+B`、`Ctrl+I` 快捷键，消除裸露的 Markdown 星号
  - 划选右键菜单排版调用 `document.execCommand` 并精确保留选区与光标，解决光标乱跳
  - 验证命令：`pnpm --dir "F:/App Location/SelfWork" check`

- [x] 2. 全生命周期 Undo/Redo 历史管理栈与撤销系统 <!-- id: 2 -->
  - 在 `src/components/docs/editor/BlockEditor.tsx` 中构建 `undoStack` 与 `redoStack`
  - 监听全局与块级 `Ctrl+Z` 与 `Ctrl+Y` / `Ctrl+Shift+Z`，支持连续撤销/重做
  - 覆盖文字输入快照、格式化、块类型转换、块新建与删除
  - 验证命令：`pnpm --dir "F:/App Location/SelfWork" check`

- [x] 3. 智能防抖持久化与用户交互全场景加固 <!-- id: 3 -->
  - 在 `BlockEditor.tsx` 中为 `saveDocBlocks` 引入 500ms 智能防抖合并，杜绝并发竞争与卡顿
  - 深度核验回车派生块、退格降级与合并块、Tab 缩进、斜杠 `/` 菜单与待办复选框打勾
  - 编写并运行自动化富文本编辑交互验证套件
  - 验证命令：`pnpm --dir "F:/App Location/SelfWork" check`

- [x] 4. VS Code 原生差异审核、端到端测试与现场构建热替换 <!-- id: 4 -->
  - 通过 `vscode-review:review_diff_in_vscode` 呈报代码变更供双向审核确认
  - 运行 `pnpm tauri build --no-bundle` 构建生产版本并通过 `replace-and-launch.mjs` 热替换上线
  - 验证命令：`pnpm --dir "F:/App Location/SelfWork" check && cargo test --manifest-path "F:/App Location/SelfWork/src-tauri/Cargo.toml"`
