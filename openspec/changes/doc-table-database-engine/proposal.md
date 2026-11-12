# Proposal: 文档与多维表格数据库引擎 (doc-table-database-engine)

## 1. 业务动机与背景
用户提出明确需求：“通过逆向Notion.exe ,我们需要开始构建文档/表格数据库与文档/表格功能”。
通过对本地已安装的 Notion 桌面端客户端（`notion.db` SQLite 数据库及 `resources/app.asar` 核心模块）的逆向工程剖析，我们直接提取并解析了 Notion 的核心架构资产：
- 块级树状数据模型 (`block`: id, type, properties, content, parent_id, format)
- 多维表格集合数据模型 (`collection`: id, schema, format) 与视图模型 (`collection_view`: id, type, format, query2)
- TanStack 表格引擎与 SQLite 本地持久化交互机制

基于这一工业级标准图纸，我们在 SelfWork 桌面端中构建自研原生的**文档与多维表格数据库**（Block Document & Table Database Engine）。

## 2. 1:1 需求物理对账矩阵 (RTM)

| 需求编号 | 原始需求条款 | 场景故事 (User Story) | 详细功能契约 (RFC 2119) | 验收指标 |
| :--- | :--- | :--- | :--- | :--- |
| **REQ-DOC-01** | Notion.exe 核心文档与表格数据模型逆向萃取 | 架构师提取 Notion 工业级 Block/Collection/Schema 物理契约。 | 系统 SHALL 逆向解析 Notion 的 Block, Collection, Schema 与 CollectionView 数据模型并沉淀为契约规范。 | 产出结构化文档与 Schema 映射规范。 |
| **REQ-DOC-02** | 底层关系型/块级数据库持久化层构建 (SQLite) | 离线环境下文档页面、块树状结构、表格字段与记录行即时存入 SQLite。 | 系统 SHALL 在 `src-tauri/src/db.rs` 中创建 `doc_pages`, `doc_blocks`, `db_collections`, `db_collection_views`, `db_collection_rows` 表并实现原子 CRUD。 | 数据库表结构健全，支持文档与表格毫秒级水合与落盘。 |
| **REQ-DOC-03** | Notion 级多维表格数据库 (Table/Database) 核心功能构建 | 用户能新建多维表格、添加/修改字段类型（文本/数字/标签/复选框/日期/状态）、行内直接编辑。 | 系统 SHALL 提供高性能表格视图，支持列动态管理、多类型单元格编辑与行快速新增。 | 可自由新增行列与编辑单元格，数据脱机持久化。 |
| **REQ-DOC-04** | 块级 (Block-based) 富文本页面文档功能构建 | 用户输入 `/` 弹出命令菜单插入标题/待办/列表/引用/代码块，支持回车换行与退格删除。 | 系统 SHALL 提供块级原子节点编辑器，支持 Slash (`/`) 菜单与键盘流导航。 | 输入 `/` 弹出菜单，支持多种常见块类型插入与编辑。 |
| **REQ-DOC-05** | SelfWork 统一工作台导航体系集成与界面体验对齐 | 用户在左侧导航栏一键切换至“文档知识库”模块，遵循全局暗黑磨砂玻璃与 49px 基准对齐。 | 系统 SHALL 在 `workbench.ts` 扩充 `docs` 模块，并在主导航与画板中平滑挂载。 | 导航栏呈现全新模块，基准底线与思维导图/快速启动 100% 对齐。 |
