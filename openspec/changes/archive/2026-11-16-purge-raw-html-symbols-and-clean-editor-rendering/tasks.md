# Tasks: 彻底清除富文本原始HTML标签与符号堆叠、统一净空编辑器渲染流

- [x] 1. 改造 `src/components/docs/editor/BlockContextMenu.tsx`：净化右键上下文菜单，废除向正文注入 HTML 标签的逻辑，专注标准加粗/斜体/删除线/代码/清除格式 <!-- id: 1 -->
- [x] 2. 改造 `src/components/docs/editor/BlockItem.tsx`：净化输入流与渲染层，剥除 HTML 残留标签，消除失焦/聚焦切换导致的类名源码裸露与排版抖动 <!-- id: 2 -->
- [x] 3. 改造 `src/components/docs/editor/BlockEditor.tsx`：优化大纲目录提取器，纯化清洗标题中的 Markdown/HTML 标记字符，杜绝侧栏大纲污染 <!-- id: 3 -->
- [x] 4. 执行 SQLite 数据库数据清洗脚本，彻底清除测试笔记中遗留的重复大标题与原始 HTML 标记 <!-- id: 4 -->
- [x] 5. 运行 `npm run check` 与 `cargo test` 静态机检，重新编译并热替换 `SelfWork.exe`，执行 1:1 双向物理核销交付 <!-- id: 5 -->
