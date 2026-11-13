# Tasks: 清理文档编辑顶栏冗余按钮落地任务

- [x] 1. 改造 `src/components/docs/editor/BlockEditor.tsx`：彻底移除右上角 `[目录]`、`[标题]`、`[待办]`、`[代码]` 按钮组，清理未使用的图标导入 <!-- id: 1 -->
- [x] 2. 运行 `cargo test` 与 `npm run build` 进行零警告、零错误验证并重新构建 `SelfWork.exe` <!-- id: 2 -->
- [x] 3. 1:1 双向物理核销 REQ-DOC-PURGE-TOOLBAR-01 并呈报用户终审 <!-- id: 3 -->
