use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct TaskItem {
    pub id: String,
    pub title: String,
    pub status: String,
    pub priority: String,
    #[serde(default)]
    pub is_today: Option<bool>,
    pub due_date: Option<String>,
    pub created_at: i64,
    pub completed_at: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct DocPartitionItem {
    pub id: String,
    pub name: String,
    pub partition_type: String, // "private" | "favorite" | "workspace"
    pub sort_order: f64,
    pub is_collapsed: bool,
    pub created_at: i64,
    pub updated_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct DocPageItem {
    pub partition_id: Option<String>,
    pub collection_id: Option<String>,
    pub properties_json: Option<String>,
    pub id: String,
    pub title: String,
    pub icon: Option<String>,
    pub cover: Option<String>,
    pub parent_id: Option<String>,
    pub is_favorite: bool,
    pub is_archived: bool,
    pub created_at: i64,
    pub updated_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct DocBlockItem {
    pub id: String,
    pub page_id: String,
    pub parent_id: Option<String>,
    pub block_type: String,
    pub content: String,
    pub properties_json: Option<String>,
    pub format_json: Option<String>,
    pub sort_order: f64,
    pub created_at: i64,
    pub updated_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct DbCollectionItem {
    pub id: String,
    pub page_id: Option<String>,
    pub partition_id: Option<String>,
    pub name: String,
    pub description: Option<String>,
    pub schema_json: String,
    pub format_json: Option<String>,
    pub created_at: i64,
    pub updated_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct DbCollectionRowItem {
    pub id: String,
    pub collection_id: String,
    pub cells_json: String,
    pub sort_order: f64,
    pub created_at: i64,
    pub updated_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct MemoItem {
    pub id: String,
    pub title: Option<String>,
    pub content: String,
    pub is_pinned: bool,
    pub theme: String,
    pub created_at: i64,
    pub updated_at: i64,
}

/// 解析物理数据库落盘路径：%APPDATA%\SelfWork\selfwork.db
pub fn get_db_path() -> PathBuf {
    let base_dir = std::env::var("APPDATA")
        .map(PathBuf::from)
        .unwrap_or_else(|_| {
            std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."))
        });
    let dir = base_dir.join("SelfWork");
    if let Err(e) = std::fs::create_dir_all(&dir) {
        eprintln!("[SelfWork DB] 创建数据目录失败 ({}): {}", dir.display(), e);
    }
    dir.join("selfwork.db")
}

/// 初始化 SQLite 表结构与 WAL 日志模式
pub fn init_db_schema(conn: &Connection) -> Result<(), rusqlite::Error> {
    conn.execute_batch(
        "PRAGMA journal_mode=WAL;
         PRAGMA synchronous=NORMAL;
         CREATE TABLE IF NOT EXISTS tasks (
             id TEXT PRIMARY KEY,
             title TEXT NOT NULL,
             status TEXT NOT NULL,
             priority TEXT NOT NULL,
             is_today INTEGER NOT NULL DEFAULT 0,
             due_date TEXT,
             created_at INTEGER NOT NULL,
             completed_at INTEGER
         );
         CREATE TABLE IF NOT EXISTS memos (
             id TEXT PRIMARY KEY,
             title TEXT,
             content TEXT NOT NULL,
             is_pinned INTEGER NOT NULL DEFAULT 0,
             theme TEXT NOT NULL DEFAULT 'neutral',
             created_at INTEGER NOT NULL,
             updated_at INTEGER NOT NULL
         );
         CREATE TABLE IF NOT EXISTS app_settings (
             key TEXT PRIMARY KEY,
             value TEXT NOT NULL,
             updated_at INTEGER NOT NULL
         );
         CREATE TABLE IF NOT EXISTS doc_partitions (
             id TEXT PRIMARY KEY,
             name TEXT NOT NULL,
             partition_type TEXT NOT NULL,
             sort_order REAL NOT NULL,
             is_collapsed INTEGER NOT NULL DEFAULT 0,
             created_at INTEGER NOT NULL,
             updated_at INTEGER NOT NULL
         );
         CREATE TABLE IF NOT EXISTS doc_pages (
             id TEXT PRIMARY KEY,
             title TEXT NOT NULL,
             icon TEXT,
             cover TEXT,
             parent_id TEXT,
             partition_id TEXT DEFAULT 'private',
             collection_id TEXT,
             properties_json TEXT,
             created_at INTEGER NOT NULL,
             updated_at INTEGER NOT NULL,
             is_favorite INTEGER NOT NULL DEFAULT 0,
             is_archived INTEGER NOT NULL DEFAULT 0
         );
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
             updated_at INTEGER NOT NULL
         );
         CREATE TABLE IF NOT EXISTS db_collections (
             id TEXT PRIMARY KEY,
             page_id TEXT,
             partition_id TEXT DEFAULT 'private',
             name TEXT NOT NULL,
             description TEXT,
             schema_json TEXT NOT NULL,
             format_json TEXT,
             created_at INTEGER NOT NULL,
             updated_at INTEGER NOT NULL
         );
         CREATE TABLE IF NOT EXISTS db_collection_rows (
             id TEXT PRIMARY KEY,
             collection_id TEXT NOT NULL,
             cells_json TEXT NOT NULL,
             sort_order REAL NOT NULL,
             created_at INTEGER NOT NULL,
             updated_at INTEGER NOT NULL
         );",
    )?;
    // 增量字段迁移兼容
    let _ = conn.execute("ALTER TABLE doc_pages ADD COLUMN partition_id TEXT DEFAULT 'private';", []);
    let _ = conn.execute("ALTER TABLE doc_pages ADD COLUMN collection_id TEXT;", []);
    let _ = conn.execute("ALTER TABLE doc_pages ADD COLUMN properties_json TEXT;", []);
    let _ = conn.execute("ALTER TABLE db_collections ADD COLUMN partition_id TEXT DEFAULT 'private';", []);
    Ok(())
}

/// 打开指定物理路径的 SQLite 数据库并确保 Schema 最新
pub fn open_and_init_db(path: &Path) -> Result<Connection, rusqlite::Error> {
    let conn = Connection::open(path)?;
    init_db_schema(&conn)?;
    Ok(conn)
}

/// 打开默认落盘路径连接
pub fn get_db_connection() -> Result<Connection, String> {
    let path = get_db_path();
    open_and_init_db(&path).map_err(|e| format!("打开数据库失败 ({}): {}", path.display(), e))
}

// ==================== 待办事项 (Tasks) CRUD ====================

pub fn query_all_tasks(conn: &Connection) -> Result<Vec<TaskItem>, rusqlite::Error> {
    let mut stmt = conn.prepare(
        "SELECT id, title, status, priority, is_today, due_date, created_at, completed_at
         FROM tasks
         ORDER BY rowid ASC",
    )?;

    let task_iter = stmt.query_map([], |row| {
        let is_today_int: i64 = row.get(4)?;
        Ok(TaskItem {
            id: row.get(0)?,
            title: row.get(1)?,
            status: row.get(2)?,
            priority: row.get(3)?,
            is_today: Some(is_today_int != 0),
            due_date: row.get(5)?,
            created_at: row.get(6)?,
            completed_at: row.get(7)?,
        })
    })?;

    let mut tasks = Vec::new();
    for task in task_iter {
        tasks.push(task?);
    }
    Ok(tasks)
}

pub fn save_all_tasks_atomic(
    conn: &mut Connection,
    tasks: &[TaskItem],
) -> Result<(), rusqlite::Error> {
    let tx = conn.transaction()?;
    tx.execute("DELETE FROM tasks;", [])?;
    {
        let mut stmt = tx.prepare(
            "INSERT INTO tasks (id, title, status, priority, is_today, due_date, created_at, completed_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
        )?;
        for t in tasks {
            let is_today_int: i64 = if t.is_today.unwrap_or(false) { 1 } else { 0 };
            stmt.execute(params![
                t.id,
                t.title,
                t.status,
                t.priority,
                is_today_int,
                t.due_date,
                t.created_at,
                t.completed_at
            ])?;
        }
    }
    tx.commit()?;
    Ok(())
}

// ==================== 灵感便签 (Memos) CRUD ====================

pub fn query_all_memos(conn: &Connection) -> Result<Vec<MemoItem>, rusqlite::Error> {
    let mut stmt = conn.prepare(
        "SELECT id, title, content, is_pinned, theme, created_at, updated_at
         FROM memos
         ORDER BY rowid ASC",
    )?;

    let memo_iter = stmt.query_map([], |row| {
        let is_pinned_int: i64 = row.get(3)?;
        Ok(MemoItem {
            id: row.get(0)?,
            title: row.get(1)?,
            content: row.get(2)?,
            is_pinned: is_pinned_int != 0,
            theme: row.get(4)?,
            created_at: row.get(5)?,
            updated_at: row.get(6)?,
        })
    })?;

    let mut memos = Vec::new();
    for memo in memo_iter {
        memos.push(memo?);
    }
    Ok(memos)
}

pub fn save_all_memos_atomic(
    conn: &mut Connection,
    memos: &[MemoItem],
) -> Result<(), rusqlite::Error> {
    let tx = conn.transaction()?;
    tx.execute("DELETE FROM memos;", [])?;
    {
        let mut stmt = tx.prepare(
            "INSERT INTO memos (id, title, content, is_pinned, theme, created_at, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        )?;
        for m in memos {
            let is_pinned_int: i64 = if m.is_pinned { 1 } else { 0 };
            stmt.execute(params![
                m.id,
                m.title,
                m.content,
                is_pinned_int,
                m.theme,
                m.created_at,
                m.updated_at
            ])?;
        }
    }
    tx.commit()?;
    Ok(())
}

// ==================== 应用全局设置 (Settings) CRUD ====================

pub fn query_setting(conn: &Connection, key: &str) -> Result<Option<String>, rusqlite::Error> {
    let mut stmt = conn.prepare("SELECT value FROM app_settings WHERE key = ?1 LIMIT 1")?;
    let mut rows = stmt.query(params![key])?;
    if let Some(row) = rows.next()? {
        let val: String = row.get(0)?;
        Ok(Some(val))
    } else {
        Ok(None)
    }
}

pub fn save_setting(conn: &Connection, key: &str, value: &str) -> Result<(), rusqlite::Error> {
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis() as i64;
    conn.execute(
        "INSERT INTO app_settings (key, value, updated_at)
         VALUES (?1, ?2, ?3)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at;",
        params![key, value, now],
    )?;
    Ok(())
}

// ==================== 分区管理 (Partitions) CRUD ====================

pub fn query_all_doc_partitions(conn: &Connection) -> Result<Vec<DocPartitionItem>, rusqlite::Error> {
    let mut stmt = conn.prepare(
        "SELECT id, name, partition_type, sort_order, is_collapsed, created_at, updated_at
         FROM doc_partitions
         ORDER BY sort_order ASC, created_at ASC",
    )?;
    let p_iter = stmt.query_map([], |row| {
        let is_col_int: i64 = row.get(4)?;
        Ok(DocPartitionItem {
            id: row.get(0)?,
            name: row.get(1)?,
            partition_type: row.get(2)?,
            sort_order: row.get(3)?,
            is_collapsed: is_col_int != 0,
            created_at: row.get(5)?,
            updated_at: row.get(6)?,
        })
    })?;
    let mut partitions = Vec::new();
    for p in p_iter {
        partitions.push(p?);
    }
    Ok(partitions)
}

pub fn save_doc_partition_atomic(conn: &Connection, p: &DocPartitionItem) -> Result<(), rusqlite::Error> {
    let is_col: i64 = if p.is_collapsed { 1 } else { 0 };
    conn.execute(
        "INSERT INTO doc_partitions (id, name, partition_type, sort_order, is_collapsed, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
         ON CONFLICT(id) DO UPDATE SET
            name = excluded.name,
            partition_type = excluded.partition_type,
            sort_order = excluded.sort_order,
            is_collapsed = excluded.is_collapsed,
            updated_at = excluded.updated_at;",
        params![p.id, p.name, p.partition_type, p.sort_order, is_col, p.created_at, p.updated_at],
    )?;
    Ok(())
}

pub fn delete_doc_partition_atomic(conn: &Connection, id: &str) -> Result<(), rusqlite::Error> {
    conn.execute("DELETE FROM doc_partitions WHERE id = ?1;", params![id])?;
    Ok(())
}

// ==================== 文档页面 (DocPages) CRUD ====================

pub fn query_all_doc_pages(conn: &Connection) -> Result<Vec<DocPageItem>, rusqlite::Error> {
    let mut stmt = conn.prepare(
        "SELECT id, title, icon, cover, parent_id, is_favorite, is_archived, created_at, updated_at, partition_id, collection_id, properties_json
         FROM doc_pages
         ORDER BY updated_at DESC",
    )?;
    let page_iter = stmt.query_map([], |row| {
        let is_fav_int: i64 = row.get(5)?;
        let is_arc_int: i64 = row.get(6)?;
        Ok(DocPageItem {
            id: row.get(0)?,
            title: row.get(1)?,
            icon: row.get(2)?,
            cover: row.get(3)?,
            parent_id: row.get(4)?,
            is_favorite: is_fav_int != 0,
            is_archived: is_arc_int != 0,
            created_at: row.get(7)?,
            updated_at: row.get(8)?,
            partition_id: row.get(9)?,
            collection_id: row.get(10)?,
            properties_json: row.get(11)?,
        })
    })?;
    let mut pages = Vec::new();
    for p in page_iter {
        pages.push(p?);
    }
    Ok(pages)
}

pub fn save_doc_page_atomic(conn: &Connection, page: &DocPageItem) -> Result<(), rusqlite::Error> {
    let is_fav: i64 = if page.is_favorite { 1 } else { 0 };
    let is_arc: i64 = if page.is_archived { 1 } else { 0 };
    conn.execute(
        "INSERT INTO doc_pages (id, title, icon, cover, parent_id, is_favorite, is_archived, created_at, updated_at, partition_id, collection_id, properties_json)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)
         ON CONFLICT(id) DO UPDATE SET
            title = excluded.title,
            icon = excluded.icon,
            cover = excluded.cover,
            parent_id = excluded.parent_id,
            is_favorite = excluded.is_favorite,
            is_archived = excluded.is_archived,
            updated_at = excluded.updated_at,
            partition_id = excluded.partition_id,
            collection_id = excluded.collection_id,
            properties_json = excluded.properties_json;",
        params![page.id, page.title, page.icon, page.cover, page.parent_id, is_fav, is_arc, page.created_at, page.updated_at, page.partition_id, page.collection_id, page.properties_json],
    )?;
    Ok(())
}

pub fn delete_doc_page_atomic(conn: &Connection, id: &str) -> Result<(), rusqlite::Error> {
    conn.execute("DELETE FROM doc_blocks WHERE page_id = ?1;", params![id])?;
    conn.execute("DELETE FROM doc_pages WHERE id = ?1;", params![id])?;
    Ok(())
}

// ==================== 块级节点 (DocBlocks) CRUD ====================

pub fn query_blocks_for_page(conn: &Connection, page_id: &str) -> Result<Vec<DocBlockItem>, rusqlite::Error> {
    let mut stmt = conn.prepare(
        "SELECT id, page_id, parent_id, block_type, content, properties_json, format_json, sort_order, created_at, updated_at
         FROM doc_blocks
         WHERE page_id = ?1
         ORDER BY sort_order ASC, rowid ASC",
    )?;
    let block_iter = stmt.query_map(params![page_id], |row| {
        Ok(DocBlockItem {
            id: row.get(0)?,
            page_id: row.get(1)?,
            parent_id: row.get(2)?,
            block_type: row.get(3)?,
            content: row.get(4)?,
            properties_json: row.get(5)?,
            format_json: row.get(6)?,
            sort_order: row.get(7)?,
            created_at: row.get(8)?,
            updated_at: row.get(9)?,
        })
    })?;
    let mut blocks = Vec::new();
    for b in block_iter {
        blocks.push(b?);
    }
    Ok(blocks)
}

pub fn save_all_blocks_for_page_atomic(conn: &mut Connection, page_id: &str, blocks: &[DocBlockItem]) -> Result<(), rusqlite::Error> {
    let tx = conn.transaction()?;
    tx.execute("DELETE FROM doc_blocks WHERE page_id = ?1;", params![page_id])?;
    {
        let mut stmt = tx.prepare(
            "INSERT INTO doc_blocks (id, page_id, parent_id, block_type, content, properties_json, format_json, sort_order, created_at, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
        )?;
        for b in blocks {
            stmt.execute(params![
                b.id,
                b.page_id,
                b.parent_id,
                b.block_type,
                b.content,
                b.properties_json,
                b.format_json,
                b.sort_order,
                b.created_at,
                b.updated_at
            ])?;
        }
    }
    tx.commit()?;
    Ok(())
}

// ==================== 多维表格集合 (Collections) CRUD ====================

pub fn query_all_collections(conn: &Connection) -> Result<Vec<DbCollectionItem>, rusqlite::Error> {
    let mut stmt = conn.prepare(
        "SELECT id, page_id, name, description, schema_json, format_json, created_at, updated_at, partition_id
         FROM db_collections
         ORDER BY updated_at DESC",
    )?;
    let col_iter = stmt.query_map([], |row| {
        Ok(DbCollectionItem {
            id: row.get(0)?,
            page_id: row.get(1)?,
            name: row.get(2)?,
            description: row.get(3)?,
            schema_json: row.get(4)?,
            format_json: row.get(5)?,
            created_at: row.get(6)?,
            updated_at: row.get(7)?,
            partition_id: row.get(8)?,
        })
    })?;
    let mut cols = Vec::new();
    for c in col_iter {
        cols.push(c?);
    }
    Ok(cols)
}

pub fn save_collection_atomic(conn: &Connection, col: &DbCollectionItem) -> Result<(), rusqlite::Error> {
    conn.execute(
        "INSERT INTO db_collections (id, page_id, name, description, schema_json, format_json, created_at, updated_at, partition_id)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)
         ON CONFLICT(id) DO UPDATE SET
            page_id = excluded.page_id,
            name = excluded.name,
            description = excluded.description,
            schema_json = excluded.schema_json,
            format_json = excluded.format_json,
            updated_at = excluded.updated_at,
            partition_id = excluded.partition_id;",
        params![col.id, col.page_id, col.name, col.description, col.schema_json, col.format_json, col.created_at, col.updated_at, col.partition_id],
    )?;
    Ok(())
}

pub fn delete_collection_atomic(conn: &Connection, id: &str) -> Result<(), rusqlite::Error> {
    conn.execute("DELETE FROM db_collection_rows WHERE collection_id = ?1;", params![id])?;
    conn.execute("DELETE FROM db_collections WHERE id = ?1;", params![id])?;
    Ok(())
}

// ==================== 多维表格记录行 (Collection Rows) CRUD ====================

pub fn query_rows_for_collection(conn: &Connection, col_id: &str) -> Result<Vec<DbCollectionRowItem>, rusqlite::Error> {
    let mut stmt = conn.prepare(
        "SELECT id, collection_id, cells_json, sort_order, created_at, updated_at
         FROM db_collection_rows
         WHERE collection_id = ?1
         ORDER BY sort_order ASC, rowid ASC",
    )?;
    let row_iter = stmt.query_map(params![col_id], |row| {
        Ok(DbCollectionRowItem {
            id: row.get(0)?,
            collection_id: row.get(1)?,
            cells_json: row.get(2)?,
            sort_order: row.get(3)?,
            created_at: row.get(4)?,
            updated_at: row.get(5)?,
        })
    })?;
    let mut rows = Vec::new();
    for r in row_iter {
        rows.push(r?);
    }
    Ok(rows)
}

pub fn save_collection_row_atomic(conn: &Connection, r: &DbCollectionRowItem) -> Result<(), rusqlite::Error> {
    conn.execute(
        "INSERT INTO db_collection_rows (id, collection_id, cells_json, sort_order, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6)
         ON CONFLICT(id) DO UPDATE SET
            cells_json = excluded.cells_json,
            sort_order = excluded.sort_order,
            updated_at = excluded.updated_at;",
        params![r.id, r.collection_id, r.cells_json, r.sort_order, r.created_at, r.updated_at],
    )?;
    Ok(())
}

pub fn delete_collection_row_atomic(conn: &Connection, id: &str) -> Result<(), rusqlite::Error> {
    conn.execute("DELETE FROM db_collection_rows WHERE id = ?1;", params![id])?;
    Ok(())
}

// ==================== Tauri 异步 IPC 命令封装 ====================

#[tauri::command]
pub async fn db_get_all_tasks() -> Result<Vec<TaskItem>, String> {
    tauri::async_runtime::spawn_blocking(|| {
        let conn = get_db_connection()?;
        query_all_tasks(&conn).map_err(|e| format!("查询待办事项失败: {}", e))
    })
    .await
    .map_err(|e| format!("执行异步任务失败: {}", e))?
}

#[tauri::command]
pub async fn db_save_all_tasks(tasks: Vec<TaskItem>) -> Result<(), String> {
    tauri::async_runtime::spawn_blocking(move || {
        let mut conn = get_db_connection()?;
        save_all_tasks_atomic(&mut conn, &tasks).map_err(|e| format!("持久化待办事项失败: {}", e))
    })
    .await
    .map_err(|e| format!("执行异步任务失败: {}", e))?
}

#[tauri::command]
pub async fn db_get_all_memos() -> Result<Vec<MemoItem>, String> {
    tauri::async_runtime::spawn_blocking(|| {
        let conn = get_db_connection()?;
        query_all_memos(&conn).map_err(|e| format!("查询便签失败: {}", e))
    })
    .await
    .map_err(|e| format!("执行异步任务失败: {}", e))?
}

#[tauri::command]
pub async fn db_save_all_memos(memos: Vec<MemoItem>) -> Result<(), String> {
    tauri::async_runtime::spawn_blocking(move || {
        let mut conn = get_db_connection()?;
        save_all_memos_atomic(&mut conn, &memos).map_err(|e| format!("持久化便签失败: {}", e))
    })
    .await
    .map_err(|e| format!("执行异步任务失败: {}", e))?
}

#[tauri::command]
pub async fn db_get_setting(key: String) -> Result<Option<String>, String> {
    tauri::async_runtime::spawn_blocking(move || {
        let conn = get_db_connection()?;
        query_setting(&conn, &key).map_err(|e| format!("查询配置项 [{}] 失败: {}", key, e))
    })
    .await
    .map_err(|e| format!("执行异步任务失败: {}", e))?
}

#[tauri::command]
pub async fn db_set_setting(key: String, value: String) -> Result<(), String> {
    tauri::async_runtime::spawn_blocking(move || {
        let conn = get_db_connection()?;
        save_setting(&conn, &key, &value).map_err(|e| format!("更新配置项 [{}] 失败: {}", key, e))
    })
    .await
    .map_err(|e| format!("执行异步任务失败: {}", e))?
}


#[tauri::command]
pub async fn db_get_all_partitions() -> Result<Vec<DocPartitionItem>, String> {
    tauri::async_runtime::spawn_blocking(|| {
        let conn = get_db_connection()?;
        query_all_doc_partitions(&conn).map_err(|e| format!("查询分区失败: {}", e))
    })
    .await
    .map_err(|e| format!("执行异步任务失败: {}", e))?
}

#[tauri::command]
pub async fn db_save_partition(partition: DocPartitionItem) -> Result<(), String> {
    tauri::async_runtime::spawn_blocking(move || {
        let conn = get_db_connection()?;
        save_doc_partition_atomic(&conn, &partition).map_err(|e| format!("保存分区失败: {}", e))
    })
    .await
    .map_err(|e| format!("执行异步任务失败: {}", e))?
}

#[tauri::command]
pub async fn db_delete_partition(id: String) -> Result<(), String> {
    tauri::async_runtime::spawn_blocking(move || {
        let conn = get_db_connection()?;
        delete_doc_partition_atomic(&conn, &id).map_err(|e| format!("删除分区失败: {}", e))
    })
    .await
    .map_err(|e| format!("执行异步任务失败: {}", e))?
}

#[tauri::command]
pub async fn db_get_all_pages() -> Result<Vec<DocPageItem>, String> {
    tauri::async_runtime::spawn_blocking(|| {
        let conn = get_db_connection()?;
        query_all_doc_pages(&conn).map_err(|e| format!("查询文档页面失败: {}", e))
    })
    .await
    .map_err(|e| format!("执行异步任务失败: {}", e))?
}

#[tauri::command]
pub async fn db_save_page(page: DocPageItem) -> Result<(), String> {
    tauri::async_runtime::spawn_blocking(move || {
        let conn = get_db_connection()?;
        save_doc_page_atomic(&conn, &page).map_err(|e| format!("保存文档页面失败: {}", e))
    })
    .await
    .map_err(|e| format!("执行异步任务失败: {}", e))?
}

#[tauri::command]
pub async fn db_delete_page(id: String) -> Result<(), String> {
    tauri::async_runtime::spawn_blocking(move || {
        let conn = get_db_connection()?;
        delete_doc_page_atomic(&conn, &id).map_err(|e| format!("删除文档页面失败: {}", e))
    })
    .await
    .map_err(|e| format!("执行异步任务失败: {}", e))?
}

#[tauri::command]
pub async fn db_get_blocks_for_page(page_id: String) -> Result<Vec<DocBlockItem>, String> {
    tauri::async_runtime::spawn_blocking(move || {
        let conn = get_db_connection()?;
        query_blocks_for_page(&conn, &page_id).map_err(|e| format!("查询块列表失败: {}", e))
    })
    .await
    .map_err(|e| format!("执行异步任务失败: {}", e))?
}

#[tauri::command]
pub async fn db_save_blocks_for_page(page_id: String, blocks: Vec<DocBlockItem>) -> Result<(), String> {
    tauri::async_runtime::spawn_blocking(move || {
        let mut conn = get_db_connection()?;
        save_all_blocks_for_page_atomic(&mut conn, &page_id, &blocks).map_err(|e| format!("保存块列表失败: {}", e))
    })
    .await
    .map_err(|e| format!("执行异步任务失败: {}", e))?
}

#[tauri::command]
pub async fn db_get_all_collections() -> Result<Vec<DbCollectionItem>, String> {
    tauri::async_runtime::spawn_blocking(|| {
        let conn = get_db_connection()?;
        query_all_collections(&conn).map_err(|e| format!("查询多维表格失败: {}", e))
    })
    .await
    .map_err(|e| format!("执行异步任务失败: {}", e))?
}

#[tauri::command]
pub async fn db_save_collection(collection: DbCollectionItem) -> Result<(), String> {
    tauri::async_runtime::spawn_blocking(move || {
        let conn = get_db_connection()?;
        save_collection_atomic(&conn, &collection).map_err(|e| format!("保存多维表格失败: {}", e))
    })
    .await
    .map_err(|e| format!("执行异步任务失败: {}", e))?
}

#[tauri::command]
pub async fn db_delete_collection(id: String) -> Result<(), String> {
    tauri::async_runtime::spawn_blocking(move || {
        let conn = get_db_connection()?;
        delete_collection_atomic(&conn, &id).map_err(|e| format!("删除多维表格失败: {}", e))
    })
    .await
    .map_err(|e| format!("执行异步任务失败: {}", e))?
}

#[tauri::command]
pub async fn db_get_collection_rows(collection_id: String) -> Result<Vec<DbCollectionRowItem>, String> {
    tauri::async_runtime::spawn_blocking(move || {
        let conn = get_db_connection()?;
        query_rows_for_collection(&conn, &collection_id).map_err(|e| format!("查询记录行失败: {}", e))
    })
    .await
    .map_err(|e| format!("执行异步任务失败: {}", e))?
}

#[tauri::command]
pub async fn db_save_collection_row(row: DbCollectionRowItem) -> Result<(), String> {
    tauri::async_runtime::spawn_blocking(move || {
        let conn = get_db_connection()?;
        save_collection_row_atomic(&conn, &row).map_err(|e| format!("保存记录行失败: {}", e))
    })
    .await
    .map_err(|e| format!("执行异步任务失败: {}", e))?
}

#[tauri::command]
pub async fn db_delete_collection_row(id: String) -> Result<(), String> {
    tauri::async_runtime::spawn_blocking(move || {
        let conn = get_db_connection()?;
        delete_collection_row_atomic(&conn, &id).map_err(|e| format!("删除记录行失败: {}", e))
    })
    .await
    .map_err(|e| format!("执行异步任务失败: {}", e))?
}

// ==================== 单元测试验证 ====================

#[cfg(test)]
mod tests {
    #[test]
    fn test_partition_crud() {
        let conn = Connection::open_in_memory().expect("open in-memory db");
        init_db_schema(&conn).expect("init schema");

        let p1 = DocPartitionItem {
            id: "part-private".to_string(),
            name: "私人空间".to_string(),
            partition_type: "private".to_string(),
            sort_order: 1.0,
            is_collapsed: false,
            created_at: 1000,
            updated_at: 1000,
        };
        save_doc_partition_atomic(&conn, &p1).expect("save partition");
        let parts = query_all_doc_partitions(&conn).expect("query partitions");
        assert_eq!(parts.len(), 1);
        assert_eq!(parts[0].name, "私人空间");

        delete_doc_partition_atomic(&conn, "part-private").expect("delete partition");
        assert_eq!(query_all_doc_partitions(&conn).expect("query").len(), 0);
    }

    #[test]
    fn test_doc_and_collection_crud() {
        let mut conn = Connection::open_in_memory().expect("open in-memory db");
        init_db_schema(&conn).expect("init schema");

        // 1. 文档页面 CRUD 测试
        let page = DocPageItem {
            id: "page-1".to_string(),
            title: "Notion 风格架构文档".to_string(),
            icon: Some("📝".to_string()),
            cover: None,
            parent_id: None,
            partition_id: Some("part-private".to_string()),
            collection_id: None,
            properties_json: None,
            is_favorite: true,
            is_archived: false,
            created_at: 1000,
            updated_at: 1000,
        };
        save_doc_page_atomic(&conn, &page).expect("save page");
        let pages = query_all_doc_pages(&conn).expect("query pages");
        assert_eq!(pages.len(), 1);
        assert_eq!(pages[0].title, "Notion 风格架构文档");

        // 2. 块级节点 CRUD 测试
        let blocks = vec![
            DocBlockItem {
                id: "b-1".to_string(),
                page_id: "page-1".to_string(),
                parent_id: None,
                block_type: "h1".to_string(),
                content: "核心架构全景".to_string(),
                properties_json: None,
                format_json: None,
                sort_order: 1.0,
                created_at: 1000,
                updated_at: 1000,
            },
            DocBlockItem {
                id: "b-2".to_string(),
                page_id: "page-1".to_string(),
                parent_id: None,
                block_type: "todo".to_string(),
                content: "完成单元测试".to_string(),
                properties_json: Some(r#"{"checked":true}"#.to_string()),
                format_json: None,
                sort_order: 2.0,
                created_at: 1001,
                updated_at: 1001,
            },
        ];
        save_all_blocks_for_page_atomic(&mut conn, "page-1", &blocks).expect("save blocks");
        let fetched_blocks = query_blocks_for_page(&conn, "page-1").expect("query blocks");
        assert_eq!(fetched_blocks.len(), 2);
        assert_eq!(fetched_blocks[1].block_type, "todo");

        // 3. 多维表格与数据行 CRUD 测试
        let col = DbCollectionItem {
            id: "col-1".to_string(),
            page_id: Some("page-1".to_string()),
            partition_id: Some("part-private".to_string()),
            name: "项目进度管理表".to_string(),
            description: Some("多维属性测试".to_string()),
            schema_json: r#"{"title":{"id":"title","name":"任务名称","type":"text"}}"#.to_string(),
            format_json: None,
            created_at: 1000,
            updated_at: 1000,
        };
        save_collection_atomic(&conn, &col).expect("save col");
        assert_eq!(query_all_collections(&conn).expect("query cols").len(), 1);

        let row = DbCollectionRowItem {
            id: "row-1".to_string(),
            collection_id: "col-1".to_string(),
            cells_json: r#"{"title":"第一行数据"}"#.to_string(),
            sort_order: 1.0,
            created_at: 1000,
            updated_at: 1000,
        };
        save_collection_row_atomic(&conn, &row).expect("save row");
        let rows = query_rows_for_collection(&conn, "col-1").expect("query rows");
        assert_eq!(rows.len(), 1);
        assert_eq!(rows[0].cells_json, r#"{"title":"第一行数据"}"#);
    }

    use super::*;

    #[test]
    fn test_database_crud() {
        let mut conn = Connection::open_in_memory().expect("open in-memory db");
        init_db_schema(&conn).expect("init schema");

        // 1. 待办测试
        let mock_tasks = vec![
            TaskItem {
                id: "task-1".to_string(),
                title: "开发持久化模块".to_string(),
                status: "todo".to_string(),
                priority: "p1".to_string(),
                is_today: Some(true),
                due_date: Some("2026-11-09".to_string()),
                created_at: 1731139200000,
                completed_at: None,
            },
            TaskItem {
                id: "task-2".to_string(),
                title: "编译单文件 EXE".to_string(),
                status: "done".to_string(),
                priority: "p2".to_string(),
                is_today: Some(false),
                due_date: None,
                created_at: 1731139201000,
                completed_at: Some(1731139300000),
            },
        ];

        save_all_tasks_atomic(&mut conn, &mock_tasks).expect("save tasks");
        let fetched_tasks = query_all_tasks(&conn).expect("fetch tasks");
        assert_eq!(fetched_tasks.len(), 2);
        assert_eq!(fetched_tasks[0], mock_tasks[0]);
        assert_eq!(fetched_tasks[1], mock_tasks[1]);

        // 2. 便签测试
        let mock_memos = vec![
            MemoItem {
                id: "memo-1".to_string(),
                title: Some("置顶测试".to_string()),
                content: "这是便签内容".to_string(),
                is_pinned: true,
                theme: "blue".to_string(),
                created_at: 1731139200000,
                updated_at: 1731139205000,
            },
            MemoItem {
                id: "memo-2".to_string(),
                title: None,
                content: "普通便签".to_string(),
                is_pinned: false,
                theme: "emerald".to_string(),
                created_at: 1731139210000,
                updated_at: 1731139210000,
            },
        ];

        save_all_memos_atomic(&mut conn, &mock_memos).expect("save memos");
        let fetched_memos = query_all_memos(&conn).expect("fetch memos");
        assert_eq!(fetched_memos.len(), 2);
        assert_eq!(fetched_memos[0], mock_memos[0]);
        assert_eq!(fetched_memos[1], mock_memos[1]);

        // 3. 配置项测试
        assert_eq!(query_setting(&conn, "theme").expect("query none"), None);
        save_setting(&conn, "theme", "dark").expect("save setting");
        assert_eq!(
            query_setting(&conn, "theme").expect("query setting"),
            Some("dark".to_string())
        );

        // 覆盖更新测试 (ON CONFLICT)
        save_setting(&conn, "theme", "light").expect("update setting");
        assert_eq!(
            query_setting(&conn, "theme").expect("query updated"),
            Some("light".to_string())
        );
    }

    #[test]
    fn test_empty_set_and_lifecycle_invariants() {
        let mut conn = Connection::open_in_memory().expect("open in-memory db");
        init_db_schema(&conn).expect("init schema");

        // 1. 验证初始化前无生命周期标记
        assert_eq!(query_setting(&conn, "memos_initialized").expect("query"), None);
        assert_eq!(query_setting(&conn, "tasks_initialized").expect("query"), None);

        // 2. 写入种子便签并锁定生命周期标记
        let seed_memos = vec![
            MemoItem {
                id: "seed-memo-1".to_string(),
                title: Some("种子便签".to_string()),
                content: "默认内容".to_string(),
                is_pinned: false,
                theme: "neutral".to_string(),
                created_at: 1000,
                updated_at: 1000,
            },
        ];
        save_all_memos_atomic(&mut conn, &seed_memos).expect("save seed memos");
        save_setting(&conn, "memos_initialized", "true").expect("save init mark");
        assert_eq!(query_all_memos(&conn).expect("query").len(), 1);

        // 3. 用户主动将便签全量删除 (传入空切片)
        save_all_memos_atomic(&mut conn, &[]).expect("delete all memos");
        let fetched_empty_memos = query_all_memos(&conn).expect("query empty memos");
        assert_eq!(fetched_empty_memos.len(), 0, "物理库必须精确维持 0 条记录");

        // 4. 模拟进程重启再次读取：生命周期标记依然有效且便签保持 0 条
        assert_eq!(
            query_setting(&conn, "memos_initialized").expect("query"),
            Some("true".to_string())
        );
        let post_restart_memos = query_all_memos(&conn).expect("post-restart query");
        assert_eq!(post_restart_memos.len(), 0, "冷重启后空集必须得到绝对保留");

        // 5. 待办事项空集与生命周期标记同理验证
        let seed_tasks = vec![
            TaskItem {
                id: "seed-task-1".to_string(),
                title: "种子待办".to_string(),
                status: "todo".to_string(),
                priority: "p2".to_string(),
                is_today: Some(true),
                due_date: None,
                created_at: 1000,
                completed_at: None,
            },
        ];
        save_all_tasks_atomic(&mut conn, &seed_tasks).expect("save seed tasks");
        save_setting(&conn, "tasks_initialized", "true").expect("save init mark");
        assert_eq!(query_all_tasks(&conn).expect("query").len(), 1);

        // 删空待办
        save_all_tasks_atomic(&mut conn, &[]).expect("delete all tasks");
        assert_eq!(query_all_tasks(&conn).expect("query").len(), 0);
        assert_eq!(
            query_setting(&conn, "tasks_initialized").expect("query"),
            Some("true".to_string())
        );
    }
}
