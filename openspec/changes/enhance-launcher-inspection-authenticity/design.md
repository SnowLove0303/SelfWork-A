# Design Document: Launcher Inspection Authenticity & Dual-Witness Probing

## 1. System Architecture & Inspection Pipeline

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SelfWork Frontend (React 19)                    │
│                                                                        │
│  SwitchboardPanel.tsx (🔍 探查按钮) / 4s 后台自动轮询                   │
│                       │                                                │
│                       ▼                                                │
│         dispatch: inspect_system_health({ ports, process_names })       │
└───────────────────────┬────────────────────────────────────────────────┘
                        │ Tauri IPC (Async / Parallel)
                        ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      SelfWork Desktop Rust Core                        │
│                                                                        │
│  ┌───────────────────────────────┐  ┌───────────────────────────────┐  │
│  │   Toolhelp Process Scanner    │  │   TCP Port Parallel Prober    │  │
│  │  • CreateToolhelp32Snapshot   │  │  • std::thread::scope         │  │
│  │  • Process32FirstW/NextW      │  │  • 150ms timeout TcpStream    │  │
│  │  • Case-insensitive match     │  │  • Instant socket check       │  │
│  │  • Zero-overhead (< 2ms)      │  │  • (150ms max per batch)      │  │
│  └──────────────┬────────────────┘  └──────────────┬────────────────┘  │
│                 │                                  │                   │
│                 └─────────────────┬────────────────┘                   │
│                                   ▼                                    │
│                     SystemHealthSnapshot struct                        │
│                     { ports, processes, duration_ms }                  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ IPC Return
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   Frontend State & Telemetry Dispatch                  │
│                                                                        │
│  • Cluster State Synchronizer:                                         │
│    - If item has processNames: matched PIDs > 0 => running             │
│    - If item has port: port open => running                            │
│    - Otherwise => stopped                                              │
│  • Telemetry Logger:                                                   │
│    - Formats active process names & PIDs                               │
│    - Formats listening ports                                           │
│    - Detects external changes & emits diagnostic notices               │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. IPC Data Contracts

### 2.1 Backend Contract (`src-tauri/src/lib.rs`)
```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HealthInspectionPayload {
    pub ports: Vec<u16>,
    pub process_names: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemHealthSnapshot {
    pub ports: HashMap<u16, bool>,
    pub processes: HashMap<String, Vec<u32>>, // process_name (lowercase) -> PIDs
    pub duration_ms: u64,
}

#[tauri::command]
pub async fn inspect_system_health(
    payload: HealthInspectionPayload,
) -> Result<SystemHealthSnapshot, String>
```

### 2.2 Frontend Service Model Enhancement (`src/types/launcher.ts`)
```typescript
export interface ServiceItemConfig {
  id: string;
  name: string;
  cluster: ServiceClusterId;
  description: string;
  commandTarget: string;
  port?: number;
  url?: string;
  processNames?: string[]; // e.g. ['weixin.exe', 'wechat.exe']
  status: ServiceStatus;
  pids?: number[]; // Detected active PIDs
  iconName: string;
}
```

---

## 3. High-Performance Process Enumeration in Rust

Using Windows `CreateToolhelp32Snapshot` with `PROCESSENTRY32W`:
- Fast single pass over the system snapshot;
- Normalizes process name to lowercase;
- Gathers all matching PIDs into the map;
- Time complexity $O(N)$ where $N$ is total OS processes (~200);
- Typical execution time $< 2\text{ms}$, 100x faster than spawning `tasklist.exe` or `powershell.exe`.

---

## 4. UI/UX Telemetry Feedback Strategy

1. **Manual Inspection**:
   When the user clicks "🔍 探查", the UI immediately enters `isPolling = true` with spinning indicator, dispatches the IPC command, updates the clusters, and writes a detailed log entry:
   `[SUCCESS] [inspect] 巡检完成 (耗时 18ms): 发现 6 项活跃服务 (微信 PID 12480, FlClash PID 8892, DSH 监听 9010...)`
2. **Periodic Background Inspection**:
   Every 4 seconds, runs silently. If any service changes status between cycles (e.g. user closed WeChat externally), it logs a notification:
   `[INFO] [inspect] 状态变动: 微信 从 运行中 变为 已停止`
   and updates the UI light to gray without disturbing user focus.
