# Tasks: 待办白线移除与笔记排版重构落地任务

- [x] 1. 调整 `src/components/tasks/TasksPanel.tsx`：移除快捷录入条底部的白色边框线，实现待办清单一体化无痕过渡 <!-- id: 1 -->
- [x] 2. 重构 `src/components/docs/editor/BlockEditor.tsx`：收敛大标题字号至 `text-2xl font-semibold`，调整视口排版为正文标题靠左主导、目录大纲右侧伴随相对缩进 <!-- id: 2 -->
- [x] 3. 运行 `cargo test` 与 `npm run build` 进行零警告、零错误验证并重新构建 `SelfWork.exe` <!-- id: 3 -->
- [x] 4. 1:1 双向物理核销 REQ-TODO-BORDER-01 ~ REQ-DOC-OUTLINE-LAYOUT-03 并呈报用户终审 <!-- id: 4 -->
