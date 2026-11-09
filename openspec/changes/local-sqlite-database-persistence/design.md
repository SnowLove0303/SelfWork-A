# Design Document: Embedded SQLite Database Persistence

## 1. System Architecture & Topology

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SelfWork Frontend (React 19)                    │
│                                                                        │
│   TasksView.tsx                 MemoBoard.tsx         SettingsView.tsx │
│        │                             │                       │         │
│        ▼                             ▼                       ▼         │
│   ┌──────────────────────────────────────────────────────────────┐    │
│   │                 Storage Service Layer (db.ts)                │    │
│   │  • dbLoadTasks() / dbSaveTasks()                             │    │
│   │  • dbLoadMemos() / dbSaveMemos()                             │    │
│   │  • dbLoadSettings() / dbSaveSettings()                       │    │
│   │  • Auto-migration from localStorage to SQLite               │    │
│   └──────────────────────────────┬───────────────────────────────┘    │
└──────────────────────────────────┼─────────────────────────────────────┘
                                   │ Tauri IPC Invoke
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      SelfWork Desktop Rust Core                        │
│                                                                        │
│  src-tauri/src/db.rs (SQLite Manager via rusqlite bundled)             │
│  • Database Path: %APPDATA%\SelfWork\selfwork.db                       │
│  • WAL Mode (Write-Ahead Logging) for concurrent reads/writes          │
│  • Atomic Transactions for batch saves                                 │
│  • Tables: `tasks`, `memos`, `app_settings`                            │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ File I/O
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     Physical Storage (Windows OS)                      │
│                  C:\Users\<User>\AppData\Roaming\SelfWork\selfwork.db  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Technical Stack & Dependencies

- **Crate**: `rusqlite = { version = "0.32", features = ["bundled"] }`
  - Zero external C dynamic library dependencies (SQLite C amalgamation compiled directly into Rust executable).
- **WAL Journal Mode**: `PRAGMA journal_mode=WAL;` ensures ultra-low write latency and prevents database locking.
- **Data Serialization**: `serde` / `serde_json` ensures exact JSON compatibility between Rust structs and TypeScript models.

---

## 3. Database Migration Flow

```text
App Starts
   │
   ▼
Tauri Rust Core: Init SQLite Database (%APPDATA%\SelfWork\selfwork.db)
   │
   ▼
Frontend Loads: Request db_get_all_tasks & db_get_all_memos
   │
   ├── Database has records ──────> Hydrate State Directly
   │
   └── Database is empty
           │
           ├── Check localStorage has data ──> Import to SQLite & Hydrate
           │
           └── localStorage is empty ────────> Seed Default Onboarding Items & Save to SQLite
```
