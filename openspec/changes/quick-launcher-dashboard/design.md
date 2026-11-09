# Design Document: Quick Launcher Dashboard & Telemetry Console

## 1. System Architecture & Topology

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SelfWork Frontend (React 19)                    │
│                                                                        │
│  ┌───────────────────────────────┐  ┌───────────────────────────────┐  │
│  │   Left: Switchboard (55%)     │  │   Right: Telemetry (45%)      │  │
│  │  • 6 Cluster Cards            │  │  • Real-time Stream Terminal  │  │
│  │  • Master Batch Toggles       │  │  • Auto-Scroll / Copy / Clear │  │
│  │  • Port Jump Capsules         │  │  • Status Badges & Timestamps │  │
│  │  • Real-time Pulse Indicators │  │                               │  │
│  └──────────────┬────────────────┘  └──────────────▲────────────────┘  │
│                 │                                  │                   │
│                 ▼                                  │                   │
│             State Hook: useLauncherState()          │                   │
└─────────────────┬──────────────────────────────────┴───────────────────┘
                  │ Tauri IPC Invoke:
                  │ - run_launcher_command(action, target)
                  │ - check_service_ports(ports)
                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      SelfWork Desktop Rust Core                        │
│                                                                        │
│  • Command Dispatcher (tokio::process / std::process::Command)         │
│  • Execution Pipe: powershell.exe -NoProfile -ExecutionPolicy Bypass   │
│    -File "D:\应用研究\统一启动器\System\Workflow-Launcher.ps1" <args>     │
│  • Port Inspector: std::net::TcpStream with 200ms connection timeout   │
└─────────────────┬──────────────────────────────────────────────────────┘
                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│             Windows OS / WSL / Docker / External Services              │
│  • Ports: 9010 (DSH), 3100 (StudyPower), 5000 (Cockpit),               │
│           5173 (MSDS), 18765 (Guanzhitong), 7891/49374 (Feishu)       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Component Design & State Management

### 2.1 Component Tree
```text
SlotContainer.tsx
  └── LauncherDashboard.tsx (Mounted when activeModule === 'launcher')
        ├── SwitchboardPanel (Left 55% width)
        │     ├── Search & Cluster Filter Bar
        │     └── ClusterCardGrid
        │           ├── ClusterCard: Apps (Office & Comms)
        │           ├── ClusterCard: AI Suite (LLM & Dev)
        │           ├── ClusterCard: Web Platforms (DSH, MSDS, etc.)
        │           ├── ClusterCard: LAN Security (Firewall & Access)
        │           ├── ClusterCard: Feishu Bridge (Bots & Sync)
        │           └── ClusterCard: WSL & Maintenance (Ubuntu & Checkin)
        └── TelemetryPanel (Right 45% width)
              ├── TerminalHeader (Clear, Copy, Auto-scroll, Line count)
              └── TerminalBody (Virtual/Scrollable terminal lines with ANSI/log styling)
```

### 2.2 Service State Model (`src/types/launcher.ts`)
```typescript
export type ServiceStatus = 'running' | 'stopped' | 'starting' | 'stopping' | 'unknown';

export interface ServiceItemConfig {
  id: string;
  name: string;
  cluster: 'apps' | 'ai-suite' | 'web' | 'lan' | 'feishu' | 'wsl';
  description: string;
  commandTarget: string; // e.g. "apps", "dsh", "msds"
  port?: number;
  url?: string;
  status: ServiceStatus;
}

export interface TelemetryLogEntry {
  id: string;
  timestamp: string;
  target: string;
  level: 'info' | 'success' | 'warn' | 'error';
  message: string;
}
```

---

## 3. Rust Backend IPC Design

### 3.1 Script Invocation Command
```rust
#[tauri::command]
pub async fn run_launcher_command(action: String, target: String) -> Result<String, String> {
    let script_path = r"D:\应用研究\统一启动器\System\Workflow-Launcher.ps1";
    // Check script existence
    if !std::path::Path::new(script_path).exists() {
        return Err(format!("找不到启动器脚本: {}", script_path));
    }

    let mut cmd = std::process::Command::new("powershell.exe");
    cmd.args(&[
        "-NoProfile",
        "-ExecutionPolicy", "Bypass",
        "-File", script_path,
        &action,
        &target,
    ]);

    // Windows CREATE_NO_WINDOW flag to prevent popping cmd windows
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        cmd.creation_flags(0x08000000); // CREATE_NO_WINDOW
    }

    let output = cmd.output().map_err(|e| format!("执行命令失败: {}", e))?;
    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    let stderr = String::from_utf8_lossy(&output.stderr).to_string();

    if !output.status.success() && !stderr.is_empty() {
        return Err(format!("{}\n{}", stdout, stderr));
    }

    Ok(if stdout.is_empty() { "执行完成 (无回显报文)".to_string() } else { stdout })
}
```

### 3.2 Port Inspection Command
```rust
#[tauri::command]
pub async fn check_service_ports(ports: Vec<u16>) -> Result<std::collections::HashMap<u16, bool>, String> {
    use std::net::{SocketAddr, TcpStream};
    use std::time::Duration;

    let mut results = std::collections::HashMap::new();
    for port in ports {
        let addr = SocketAddr::from(([127, 0, 0, 1], port));
        let is_open = TcpStream::connect_timeout(&addr, Duration::from_millis(150)).is_ok();
        results.insert(port, is_open);
    }
    Ok(results)
}
```

---

## 4. UI/UX Interaction & Aesthetic Details

1. **Dual Column Split Layout**:
   - Left Panel (55%): Grid of glass cards, smooth toggle switches, emerald breathing light for active services.
   - Right Panel (45%): Terminal style dark screen (`#070a0f`), monospace font, syntax highlighting for log levels (`[INFO]`, `[SUCCESS]`, `[WARN]`, `[ERROR]`).
2. **Instant Feedback**:
   - Clicking a switch immediately sets the item state to `starting`/`stopping` (amber pulsing indicator) while appending a telemetry record `[INFO] 正在下发启动指令: <target>...`.
   - On command completion, appends the output to the console and queries port status to set status to `running` or `stopped`.
3. **No Page Scroll & Zero Layout Shift**:
   - The dashboard fits cleanly inside the SlotContainer with overflow-y scrollable within each column.
