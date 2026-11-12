# Design: 文档与多维表格数据库架构设计

## 1. 架构拓扑与映射关系 (Notion -> SelfWork)

```text
┌────────────────────────────────────────────────────────────────────────┐
│ Notion 原生逆向契约               │ SelfWork 自研物理落地               │
├───────────────────────────────────┼────────────────────────────────────┤
│ block 表 (id, type, properties)   │ doc_blocks 表 (SQLite)             │
│ collection 表 (schema JSON)       │ db_collections 表 (SQLite)         │
│ collection_view 表 (format JSON)  │ db_collection_views 表 (SQLite)    │
│ records 表 (record_value)         │ db_collection_rows 表 (SQLite)     │
│ React + TanStack Table            │ React 19 + TanStack Table / Custom │
│ Pragmatic Drag-and-Drop           │ HTML5 + React 块级流式排版         │
└───────────────────────────────────┴────────────────────────────────────┘
```

## 2. 数据库物理表结构设计 (SQLite via `src-tauri/src/db.rs`)

```sql
-- 1. 文档页面表
CREATE TABLE IF NOT EXISTS doc_pages (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    icon TEXT,
    cover TEXT,
    parent_id TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    is_favorite INTEGER NOT NULL DEFAULT 0,
    is_archived INTEGER NOT NULL DEFAULT 0
);

-- 2. 块级节点表 (Notion Block 结构)
CREATE TABLE IF NOT EXISTS doc_blocks (
    id TEXT PRIMARY KEY,
    page_id TEXT NOT NULL,
    parent_id TEXT,
    block_type TEXT NOT NULL,
    content TEXT NOT NULL,
    properties_json TEXT,
    format_json TEXT,
    sort_order REAL NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY(page_id) REFERENCES doc_pages(id) ON DELETE CASCADE
);

-- 3. 多维表格集合定义表 (Notion Collection)
CREATE TABLE IF NOT EXISTS db_collections (
    id TEXT PRIMARY KEY,
    page_id TEXT,
    name TEXT NOT NULL,
    description TEXT,
    schema_json TEXT NOT NULL, -- 列定义: { [colId]: { name, type, options, width } }
    format_json TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

-- 4. 多维表格视图配置表 (Notion CollectionView)
CREATE TABLE IF NOT EXISTS db_collection_views (
    id TEXT PRIMARY KEY,
    collection_id TEXT NOT NULL,
    view_type TEXT NOT NULL DEFAULT 'table', -- table, board, list
    name TEXT NOT NULL,
    format_json TEXT, -- 列显示状态与宽度排序
    query_json TEXT,  -- 过滤与排序规则
    sort_order INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY(collection_id) REFERENCES db_collections(id) ON DELETE CASCADE
);

-- 5. 多维表格数据行表 (Notion Row Records)
CREATE TABLE IF NOT EXISTS db_collection_rows (
    id TEXT PRIMARY KEY,
    collection_id TEXT NOT NULL,
    cells_json TEXT NOT NULL, -- 单元格键值对: { [colId]: value }
    sort_order REAL NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY(collection_id) REFERENCES db_collections(id) ON DELETE CASCADE
);
```

## 3. 前端组件拓扑

```text
src/components/docs/
├── DocsView.tsx              # 主视图容器 (左侧页面文档树 + 中间/右侧主编辑区)
├── DocsSidebar.tsx           # 文档页面目录树、新建页面、收藏与归档
├── BlockEditor.tsx           # Notion 风格块级富文本页面编辑器
├── BlockItem.tsx             # 单个 Block 渲染与按键调度
├── SlashMenu.tsx             # '/' 命令浮动弹出选择器
└── database/
    ├── TableDatabaseView.tsx # Notion 风格多维表格主画板
    ├── TableHeaderCell.tsx   # 表头列管理、类型切换、重命名弹窗
    ├── TableRowCell.tsx      # 多类型单元格编辑器 (Text, Number, Select Tag, Checkbox)
    └── AddColumnModal.tsx    # 新增字段列模态框
```
