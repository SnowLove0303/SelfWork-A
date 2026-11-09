# Specification: Embedded SQLite Database Persistence

## 1. Database Architecture & Physical Storage

### 1.1 Embedded SQLite Engine
- The Tauri desktop core SHALL bundle SQLite statically via `rusqlite` (bundled feature).
- No external database driver or server process SHALL be required.
- The physical database file SHALL reside at `%APPDATA%\SelfWork\selfwork.db` (or user data directory).
- IF the parent directory does not exist, the system SHALL create it recursively before opening the database.

### 1.2 Schema Definition & Initialization
On application startup, the system SHALL execute the following DDL statements inside an atomic transaction:
```sql
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
```

---

## 2. IPC Command Contracts

The Tauri backend SHALL expose the following asynchronous commands:
1. `db_get_all_tasks() -> Result<Vec<TaskItem>, String>`
2. `db_save_all_tasks(tasks: Vec<TaskItem>) -> Result<(), String>`
3. `db_get_all_memos() -> Result<Vec<MemoItem>, String>`
4. `db_save_all_memos(memos: Vec<MemoItem>) -> Result<(), String>`
5. `db_get_setting(key: String) -> Result<Option<String>, String>`
6. `db_set_setting(key: String, value: String) -> Result<(), String>`

---

## 3. Frontend Hydration & Seamless Migration Strategy

### 3.1 Initial Hydration
- Upon component mount (`TasksView` / `SettingsView`):
  - Frontend SHALL invoke `db_get_all_tasks` / `db_get_all_memos` / `db_get_setting`.
  - IF the database returns records, the frontend state SHALL be hydrated directly from SQLite.
  - IF the database returns empty, frontend SHALL check `localStorage`:
    - IF `localStorage` contains legacy data, the system SHALL import those records into SQLite immediately.
    - IF `localStorage` is also empty, the system SHALL seed initial onboarding data and save to SQLite.

### 3.2 Live Synchronization
- Mutations to tasks or memos SHALL trigger a debounced (300ms) write to SQLite via Tauri IPC.
- IF running in a web browser fallback environment, operations SHALL gracefully degrade to `localStorage`.

---

## 4. Invariants & Backward Compatibility

- Data loss on application restart SHALL be strictly 0%.
- The standalone single executable `SelfWork.exe` SHALL remain portable and self-contained.
- All existing UI/UX and visual features SHALL operate without regression.
