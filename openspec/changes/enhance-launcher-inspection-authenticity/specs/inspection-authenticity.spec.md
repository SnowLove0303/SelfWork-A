# Specification: Launcher Inspection Authenticity & Dual-Witness Probing

## 1. Process-Level Inspection Specification

### 1.1 Target Process Mapping
The system SHALL support native scanning of process entities for all desktop applications without fixed ports:
- `wechat`: `["Weixin.exe", "WeChat.exe"]`
- `wxwork`: `["WXWork.exe"]`
- `flclash`: `["FlClash.exe"]`
- `antigravity-app`: `["Antigravity.exe"]`
- `antigravity-ide`: `["Antigravity IDE.exe"]`
- `chatgpt-app`: `["ChatGPT.exe"]`
- `cockpit-5000`: `["cockpit-tools.exe"]`
- `aistudy`: `["AIstudy.exe"]`

### 1.2 Native Toolhelp Process Enumeration
- The Rust core SHALL enumerate processes using Windows native Toolhelp API (`CreateToolhelp32Snapshot`).
- Process matching SHALL be case-insensitive.
- When matching processes are found:
  - The service state SHALL transition to `running`.
  - The process identifier(s) (PIDs) SHALL be returned in the inspection result evidence.
- When no matching process and no listening port are found:
  - The service state SHALL transition to `stopped`.

---

## 2. Port & Health Probe Specification

### 2.1 Monitored Ports
The system SHALL monitor the following service ports:
- `5000`: Cockpit 5000 Web
- `9010`: DeepSeek Harness Web (DSH)
- `3100`: StudyPower Web
- `18765`: Guanzhitong Docker Web
- `5173`: MSDS Web
- `5174`: MSDS API
- `7891`: Feishu Bridge Core
- `49374`: OpenCode 2 Web
- `9011`: DeepSeek Harness WSL

### 2.2 Dual-Witness Verification
- For Web services with designated ports:
  - WHEN TCP connection succeeds within 150ms timeout, the service port SHALL be marked open.
  - IF an application specifies an HTTP health probe (e.g. MSDS API `/api/msds/health`), the probe SHALL optionally execute an asynchronous fast HTTP GET check.
  - A service possessing both process and port criteria SHALL be marked `running` when either the verified port is active or its primary process is alive.

---

## 3. Telemetry Feedback & Logging Specification

### 3.1 Manual Inspection Telemetry
- WHEN the user clicks the "🔍 探查" button:
  - The system SHALL emit an `[INFO]` log entry: `[inspect] 正在执行全维系统真实巡检...`
  - Upon receiving the backend report, the system SHALL emit a `[SUCCESS]` log summarizing:
    - Total items scanned
    - Number of active processes with names and PIDs
    - Number of open service ports
    - Total execution latency in milliseconds

### 3.2 State Transition Telemetry
- WHEN periodic background polling (every 4s) detects a state change (e.g. an external process starts or terminates):
  - The system SHALL automatically emit a telemetry notice:
    `[INFO] [inspect] 外部状态变动检测: <service_name> 状态变更为 <running | stopped>`
  - The UI indicator light and toggle switch SHALL update synchronously without visual blinking.

---

## 4. Invariant & Performance Constraints

- Single-cycle inspection SHALL NOT exceed 200ms latency.
- CPU usage during background polling SHALL remain near 0%.
- All existing visual invariants (44px baseline, glassmorphism, stationary typography) SHALL be preserved.
