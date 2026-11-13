# Tasks: 数据库笔记抽屉加宽与目录大纲自由折叠落地任务

- [x] 1. 改造 `src/components/docs/SidePeekDrawer.tsx`：适度放宽非最大化状态下的基础宽度为 780px（最大 85vw），保持放大还原与响应式弹性 <!-- id: 1 -->
- [x] 2. 改造 `src/components/docs/editor/BlockEditor.tsx`：开放 `showOutline` 状态切换，在大纲栏顶部提供收起按钮，并在顶栏右侧提供展开按钮与标题计数 <!-- id: 2 -->
- [x] 3. 运行 `npm run check` 与 `cargo test` 进行静态机检与零告警零错误验证，重新编译 `SelfWork.exe` <!-- id: 3 -->
- [x] 4. 1:1 双向物理核销 REQ-DOCS-DB-SIDEPEEK-WIDTH-01 与 REQ-DOCS-OUTLINE-COLLAPSIBLE-02 并在 VS Code Diff 确认后呈报用户终审 <!-- id: 4 -->
