# Proposal: 复刻 Notion 经典分区管理、行即页面、Side Peek 侧边抽屉与嵌套数据库系统

## 1. 业务背景与问题驱动
通过对本地官方 Notion 桌面端（`notion.db` 与 `resources/app.asar`）进行物理逆向剖析，结合用户提供的真实界面截图，确立了 Notion 区别于常规文档/表格系统的三大核心底层公理：
1. **一切皆 Block 与行即页面 (Row-as-Page Axiom)**：数据库中的每一行记录绝非简单的平铺文本，其实质是一个完整的、拥有独立 UUID 的文档页面 (`DocPage`)，拥有自己绑定的属性集和正文富文本块；
2. **Side Peek 侧边预览抽屉 (Split View Inspection)**：点击表格任一行时，左侧表格保持全貌，右侧即刻滑出该行专属的独立页面抽屉，顶部展现多维字段属性卡片，下方承接沉浸式块级富文本编辑，修改即时双向同步；
3. **工作区分区层级治理 (Partitions & Sections Hierarchy)**：左侧导航树通过「私人 (Private)」、「最爱 (Favorites)」、「自定义工作区 (Workspaces)」分区进行物理归类，且支持数据库与子文档的无限递归嵌套（Sub-Databases & Sub-Pages）。

## 2. 1:1 需求对账矩阵注入 (Spec-Kit RTM Alignment)
- **REQ-NOT-01**: 工作区多分区层级治理（私人、最爱、自定义分区，折叠展开、增删改查）
- **REQ-NOT-02**: 数据库与页面无限递归嵌套（支持文档内嵌入子数据库，数据库行内嵌入子页面/子表）
- **REQ-NOT-03**: 行即页面与双向多维属性绑定（每行映射为一个完整页面，顶部属性卡片与表单元格双向联动）
- **REQ-NOT-04**: Notion 经典侧边预览抽屉 (Side Peek)（点击行右侧滑出抽屉，左侧表格保持，沉浸式编辑正文与属性）
- **REQ-NOT-05**: 多维表格多视图 Tab 栏与工具流（多 Tab 视图切换、搜索、过滤、蓝色 `+ 新建 ⌄` 按钮）
- **REQ-NOT-06**: Notion 像素级经典视觉美学与微交互复刻（灰阶排版、经典属性图标 `Aa`/`#`/`⊙`/`≡`、49px 高度对齐）

## 3. 验收标准与交付物
1. 后端 SQLite 新增 `doc_partitions` 分区表，并在 `doc_pages` 与 `db_collections` 中增加 `partition_id` 与 `parent_id` 关联字段；
2. 前端实现 `SidePeekDrawer` 侧边抽屉组件，点击数据表行即时滑出并支持编辑标题、属性、正文；
3. 左侧侧栏升级为 Notion 风格的 `PartitionSidebar`，包含「私人」、「最爱」、「自定义区」与折叠控制；
4. 数据表上方提供多视图 Tab 栏与蓝色 `+ 新建 ⌄` 按钮；
5. `cargo test` 单测全绿通过（退出码 0），`npm run build` 前端构建零警告零错误。
