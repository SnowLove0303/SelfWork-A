# Implementation Tasks: Launcher Inspection Authenticity & Dual-Witness Probing

## Single-Focus Lock: Task Pipeline

- [ ] **Task 1: Rust 微内核原生进程枚举与全维巡检 IPC (inspect_system_health)**
  - **因果归属**: [Root Source] 后端核心状态检测能力
  - **实现目标**:
    - 在 `src-tauri/Cargo.toml` 中配置 `windows-sys` 针对 `Win32_System_Diagnostics_ToolHelp` 与 `Win32_Foundation` 的原生绑定；
    - 在 `src-tauri/src/lib.rs` 中实现毫秒级 Windows 原生进程快照扫描（`CreateToolhelp32Snapshot`）；
    - 实现全维综合巡检命令 `inspect_system_health`，整合多线程短超时端口探测与无开销原生进程枚举；
    - 编写并运行单元测试 `test_inspect_system_health`。
  - **实测验证门禁 [Measured]**:
    - `cargo check --manifest-path "F:/App Location/SelfWork/src-tauri/Cargo.toml"` 退出码 0。
    - `cargo test --manifest-path "F:/App Location/SelfWork/src-tauri/Cargo.toml"` 退出码 0。

- [ ] **Task 2: 前端服务配置项进程映射与类型定义扩展**
  - **因果归属**: [Root Source] 事实模型拓扑绑定
  - **实现目标**:
    - 在 `src/types/launcher.ts` 中扩展 `ServiceItemConfig`（增加 `processNames?: string[]` 与 `pids?: number[]`）；
    - 在 `src/components/launcher/launcherData.ts` 中为微信、企微、FlClash、Antigravity、Antigravity IDE、ChatGPT、Cockpit、AIstudy 等所有桌面工具精确绑定目标进程名数组；
    - 导出待监控的全部目标进程清单 `MONITORED_PROCESS_NAMES`。
  - **实测验证门禁 [Measured]**:
    - `pnpm tsc --noEmit` 静态类型检查退出码 0。

- [ ] **Task 3: 前端全维状态同步与深度诊断报文回显**
  - **因果归属**: [State Transition] 用户交互与报文呈现
  - **实现目标**:
    - 在 `src/components/LauncherDashboard.tsx` 中升级 `pollPorts` 为 `pollHealth`，调用 `inspect_system_health`；
    - 根据真实进程 PID 与端口监听双重见证真实判定服务状态；
    - 在服务项卡片中若存在 PID，展示精确的进程 PID 徽章与真实运行呼吸灯；
    - 实现手动“🔍 探查”触发结构化诊断报文输出，以及后台自动感知外部进程启闭并输出状态变更审计日志。
  - **实测验证门禁 [Measured]**:
    - `pnpm check` 零错误、零警告退出码 0。
    - `pnpm build` 前端构建退出码 0。

- [ ] **Task 4: 全量构建、单文件 EXE 封包与终审验收**
  - **因果归属**: [Verification & Delivery] 生产交付
  - **实测验证门禁 [Measured]**:
    - `pnpm tauri build --no-bundle` 编译出最新生产态 `SelfWork.exe` 退出码 0。
    - 离线独立运行验证，真实测试打开/关闭微信或其它应用时，仪表盘与控制台即时如实反映真实状态。
