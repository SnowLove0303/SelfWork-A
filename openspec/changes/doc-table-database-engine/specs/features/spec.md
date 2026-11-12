# Specification: 文档与多维表格数据库行为契约

## 1. 数据模型与契约 (Data Models)

- **SHALL-DOC-01 (块级树状数据契约)**:
  - 每一个块（Block）SHALL 具备唯一 `id` (UUID)、`page_id`、`parent_id` (可选父块)、`block_type`、`content` (文本内容)、`properties` (格式属性)、`sort_order` (序号) 及时间戳。
  - 支持的基础块类型 SHALL 包含：`p` (段落), `h1`, `h2`, `h3` (各级标题), `todo` (带复选框的待办), `bullet` (无序列表), `quote` (引用), `code` (代码块), `divider` (分割线), `table` (内嵌表格数据库)。

- **SHALL-DOC-02 (表格数据库与列 Schema 契约)**:
  - 每一个表格数据库（Collection）SHALL 包含 `id`, `name`, `schema_json` (列定义字典)。
  - 列定义字典的每一列 SHALL 包含：`id`, `name`, `type` (`text` | `number` | `select` | `multi_select` | `checkbox` | `date` | `status`), `options` (选项列表，含 id/label/color)。
  - 行记录（Row）SHALL 存储为键值对 JSON，键为列 `id`，值为对应属性值。

## 2. 界面交互与操作契约 (UI & Interaction)

- **SHALL-DOC-03 (块级编辑器斜杠指令与键盘流)**:
  - 在空块中输入 `/` 时，系统 SHALL 弹出悬浮指令面板，支持键盘上下箭头选择并回车插入。
  - 在块内按 `Enter` 键时，系统 SHALL 在当前块下方新建一个同级段落块并自动获取光标。
  - 在空块内按 `Backspace` 键时，系统 SHALL 自动删除当前块并将焦点转移到上一块末尾。

- **SHALL-DOC-04 (多维表格数据库编辑与列管理)**:
  - 表格表头右侧 SHALL 提供 `+ 添加列` 按钮，弹出列配置窗口（名称与类型选择）。
  - 点击表头列名 SHALL 弹出列属性配置菜单（重命名、修改类型、删除列）。
  - 表格底部 SHALL 提供 `+ 新建行` 快捷按钮，点击立即追加一行空白数据。
  - 单元格点击进入行内直接编辑，失焦或回车即时持久化到本地 SQLite。

- **SHALL-DOC-05 (模块集成与对齐)**:
  - 在左侧全局导航侧栏（Sidebar）中新增 `文档数据库 (docs)` 入口。
  - 顶部操作栏高度严格为 `h-[49px]`，与快速启动、待办清单保持水平底线贯穿。
