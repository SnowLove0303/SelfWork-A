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
         );",
    )?;
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

// ==================== 单元测试验证 ====================

#[cfg(test)]
mod tests {
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
