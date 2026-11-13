# Tasks: 纯净分区架构、子分区治理与笔记数据库落地

- [x] 1. 彻底净化 `src/components/DocsView.tsx` 并重构三大总模块交互（移除假功能，实现子分区树、笔记数据库创建与独立笔记创建） <!-- id: 1 -->
- [x] 2. 扩充 `src/types/docs.ts` 与 `src-tauri/src/db.rs`：支持 `DocPartition.parentId` 与 `DbCollection.isFavorite`，实现子分区递归树与收藏聚合模型 <!-- id: 2 -->
- [x] 3. 在 `src/services/docsDb.ts` 中重构种子数据与分区服务：默认提供「私人」、「最近」、「收藏」三大核心总模块 <!-- id: 3 -->
- [x] 4. 升级 `DocsView.tsx` 侧栏交互：在「私人」下支持动态新建/重命名/删除子分区，在子分区内分别创建「笔记数据库」与「独立笔记」 <!-- id: 4 -->
- [x] 5. 实现「最近」自动时间线追踪与「收藏」标星聚合联动功能 <!-- id: 5 -->
- [x] 6. 运行 `cargo test` 与 `npm run build` 进行零警告、零错误验证并打包更新 `SelfWork.exe` <!-- id: 6 -->
- [-] 7. 逐条对账 REQ-CLN-01 ~ REQ-NOTE-05，呈报用户终审 <!-- id: 7 -->
