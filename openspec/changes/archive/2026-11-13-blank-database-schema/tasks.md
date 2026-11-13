# Tasks: 彻底清除新建数据库的预设业务字段

- [x] 1. 彻底清除 `src/services/docsDb.ts` 中的 `PLM_COLLECTION_SCHEMA` 业务字段字典，替换为纯净单列 `DEFAULT_BLANK_COLLECTION_SCHEMA` <!-- id: 1 -->
- [x] 2. 更新 `src/components/DocsView.tsx`，新建数据库时仅绑定通用单主列 <!-- id: 2 -->
- [x] 3. 运行 `cargo test` 与 `npm run build` 进行零警告、零错误验证并重新构建 `SelfWork.exe` <!-- id: 3 -->
- [x] 4. 逐条对账 REQ-SCHEMA-01 ~ REQ-SCHEMA-02，呈报用户终审 <!-- id: 4 -->
