# Tasks: 文档与多维表格数据库构建

- [x] 1. 在 `src/types/workbench.ts` 与 `src/types/docs.ts` 定义完整的 Block、Collection、Schema 与 Table 数据契约 <!-- id: 1 -->
- [x] 2. 在 `src-tauri/src/db.rs` 中初始化 SQLite 物理存储表 (`doc_pages`, `doc_blocks`, `db_collections`, `db_collection_rows`) 并暴露 IPC CRUD 命令 <!-- id: 2 -->
- [x] 3. 构建多维表格数据库核心组件 `TableDatabaseView`（动态列 Schema 管理、多类型单元格编辑、快速新增行与持久化） <!-- id: 3 -->
- [x] 4. 构建块级富文本页面编辑器 `BlockEditor`（段落、各级标题、待办、斜杠菜单 `/` 调度与键盘快捷切换） <!-- id: 4 -->
- [x] 5. 在全局导航与 `SlotContainer` 中集成 `DocsView` 模块，验证 49px 基准对齐与视觉一致性 <!-- id: 5 -->
- [x] 6. 运行 `cargo test` 与 `npm run build` 进行零警告、零错误编译验证并打包发布 <!-- id: 6 -->
- [-] 7. 逐条对账 REQ-DOC-01 ~ REQ-DOC-05，呈报用户终审 <!-- id: 7 -->
