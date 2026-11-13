# Tasks: Notion 分区管理、行即页面、Side Peek 侧边抽屉与多维数据库全功能落地

- [x] 1. 在 `src/types/docs.ts` 中扩充 `DocPartition`、`SidePeekState` 及嵌套子数据库数据契约 <!-- id: 1 -->
- [x] 2. 在 `src-tauri/src/db.rs` 中初始化 `doc_partitions` 表并扩展分区 CRUD 与父子级联查询 IPC 命令 <!-- id: 2 -->
- [x] 3. 构建 Notion 风格 `SidePeekDrawer` 侧边抽屉组件（大标题、动态属性卡片面板、块编辑器正文与全屏放大） <!-- id: 3 -->
- [x] 4. 升级 `TableDatabaseView`：支持行点击唤起 Side Peek 抽屉、双栏平滑分屏、多视图 Tab 栏与蓝色 `+ 新建 ⌄` 按钮 <!-- id: 4 -->
- [x] 5. 升级 `DocsView` 侧栏为 Notion 经典分区管理树（私人、最爱、项目分区，折叠展开与无限层级嵌套） <!-- id: 5 -->
- [-] 6. 运行 `cargo test` 与 `npm run build` 确保零告警零错误编译并打包发布最新 `SelfWork.exe` <!-- id: 6 -->
- [ ] 7. 逐条对账 REQ-NOT-01 ~ REQ-NOT-06，呈报用户终审 <!-- id: 7 -->
