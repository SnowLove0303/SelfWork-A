# Specification: Quick Launcher Dashboard & Telemetry Console

## 1. Domain Model & Clusters

### 1.1 Service Cluster Taxonomy
The Quick Launcher system SHALL model and support the following 6 service clusters mapped directly to `D:\应用研究\统一启动器\System\Workflow-Launcher.ps1`:
1. `apps` (常用办公套件): Antigravity, WeChat, WxWork, FlClash, ChatGPT, GLaDOS Auto Checkin.
2. `ai-suite` (AI 桌面协同套件): Antigravity GUI, Antigravity IDE, ChatGPT, Cockpit 5000 (CDP 9333 / :5000).
3. `web` (核心 Web 平台):
   - `dsh` (DeepSeek Harness, Web UI: 9010)
   - `aistudy` (AI Study Tauri 学习环境)
   - `studypower` (StudyPower Next.js: 3100)
   - `web` (冠志通 Docker: 18765)
   - `compliance` (合规性判断工作台)
   - `msds` (MSDS 智能处理引擎: Web 5173 / API 5174)
4. `lan` (局域网安全访问控制):
   - `guanzhitong-lan` (8080/18765 局域网防火墙穿透与访问切换)
5. `feishu` (飞书双桥接服务):
   - `feishu` (主飞书服务: 7891)
   - `feishu-opencode` (OpenCode 飞书桥接: 49374)
   - `feishu-ag` (Antigravity 飞书集成)
6. `wsl` (WSL 专区 & 自动运维):
   - `dsh-wsl` (WSL 版 DeepSeek Harness: 9011)
   - `antigravity-wsl` (WSL Antigravity)
   - `cockpit-wsl` (WSL Cockpit)
   - `checkin` (GLaDOS 多账号一键签到脚本)

---

## 2. Left Dashboard Switchboard (仪表盘开关阵列)

### 2.1 Cluster Card & Master Control
- The Switchboard SHALL render service items grouped into visual cluster cards.
- Each cluster card SHALL feature a master switch or action button (e.g. "一键启动 / 全部停止") that invokes the cluster batch script (e.g. `wll apps` / `wll stop apps`).
- WHEN the user toggles a master switch:
  - The UI SHALL enter a transient pending state (`starting` / `stopping`).
  - The command SHALL be asynchronously dispatched via Rust IPC.
  - The status indicators of constituent services SHALL update according to detection results.

### 2.2 Independent Service Switch & Port Capsule
- Each individual service item inside a cluster card SHALL display:
  - Service display name and category icon.
  - Quick action toggle switch (Start/Stop).
  - Real-time status indicator:
    - `running` (Emerald green pulsing dot)
    - `stopped` (Muted gray dot)
    - `transitioning` (Amber pulsing dot)
    - `error` (Rose red dot)
  - Port & URL jump capsule (if applicable, e.g. `:9010`, `:3100`, `:5173`, `:18765`):
    - WHEN clicked, it SHALL open the target URL in the default browser.
    - WHEN the service is stopped, the jump capsule SHALL be visually dimmed.

---

## 3. Right Telemetry Log Console (执行报文控制台)

### 3.1 Stream Output & Log Format
- The Telemetry Console SHALL provide real-time terminal output for all command invocations.
- Each log line SHALL contain:
  - Timestamp (`HH:mm:ss.SSS`)
  - Target service tag (`[apps]`, `[dsh]`, `[lan]`, etc.)
  - Severity level (`INFO`, `SUCCESS`, `WARN`, `ERROR`)
  - Raw or formatted output text.
- WHEN new output arrives, the console SHALL automatically scroll to the bottom unless the user has manually scrolled up.

### 3.2 Console Actions
- The Telemetry Console SHALL provide:
  - Clear Log button (清空报文): empties current log buffer.
  - Copy Log button (复制全部): copies all console text to clipboard with feedback tooltip.
  - Auto-scroll toggle (自动滚屏): locks/unlocks tailing behavior.
  - Filter toggle (可选过滤级别: All / Errors / Success).

---

## 4. Rust IPC Engine & Native Invocation

### 4.1 Safe PowerShell Script Execution
- Rust backend SHALL expose `run_launcher_command(action: String, target: String) -> Result<String, String>` or event-based streaming IPC.
- Execution SHALL invoke `powershell.exe -NoProfile -ExecutionPolicy Bypass -File "D:\应用研究\统一启动器\System\Workflow-Launcher.ps1" <action> <target>`.
- The execution SHALL NOT block the Tauri main thread.
- Standard output (`stdout`) and standard error (`stderr`) SHALL be captured and returned/emitted to the frontend.

### 4.2 Port & Health Inspection
- Rust backend SHALL expose `check_service_ports(ports: Vec<u16>) -> Result<HashMap<u16, bool>, String>` via non-blocking TCP socket connection attempts with low timeout (e.g., 200ms).
- The frontend SHALL poll or request port status on interval (e.g., every 3-5s) to keep status indicators synchronized with real system state.

---

## 5. Non-Functional & Invariant Constraints

1. **Appearance Consistency**: Glassmorphic dark theme (`#0c101a` background, `rgba(255,255,255,0.08)` borders, font `Microsoft YaHei`).
2. **Zero Glitch / Zero Blinking**: Switch toggles must not cause layout shift or container vibration.
3. **Graceful Fallback**: If PowerShell path or script is missing, the backend SHALL return an explicit error string and the frontend SHALL display a friendly diagnostic message without crashing.
