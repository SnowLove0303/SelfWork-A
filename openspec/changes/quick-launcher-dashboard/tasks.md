# Implementation Tasks: Quick Launcher Dashboard & Telemetry Console

## Single-Focus Lock: Task Pipeline

- [ ] **Task 1: Rust IPC 核心接口与系统类型定义**
  - **因果归属**: [Root Source] 后端系统通信链路
  - **实现目标**:
    - 在 `src/types/launcher.ts` 中定义完整的集群、服务项、状态枚举与报文日志契约；
    - 在 `src-tauri/src/lib.rs` 中实现 `run_launcher_command`（无控制台黑框调用 `Workflow-Launcher.ps1`）与 `check_service_ports`（快速 TCP 端口连通性探测）；
    - 在 `src-tauri/src/lib.rs` 单元测试中验证命令契约与端口探测逻辑。
  - **实测验证门禁 [Measured]**:
    - `cargo check --manifest-path "F:/App Location/SelfWork/src-tauri/Cargo.toml"` 退出码 0。
    - `cargo test --manifest-path "F:/App Location/SelfWork/src-tauri/Cargo.toml"` 退出码 0。

- [ ] **Task 2: 前端左侧仪表盘开关阵列 (SwitchboardPanel)**
  - **因果归属**: [State Transition] 用户交互与状态展现
  - **实现目标**:
    - 创建 `src/components/LauncherDashboard.tsx` 及其子组件；
    - 完整映射 6 大服务集群（常用套件、AI套件、Web平台、局域网、飞书、WSL专区）；
    - 实现集群一键总控开关与独立服务项拨动开关；
    - 实现真实状态呼吸指示灯（运行绿/停止灰/启动中橙）与端口直达链接胶囊；
    - 集成端口自动巡检机制（挂载轮询与开关后即时触发）。
  - **实测验证门禁 [Measured]**:
    - `pnpm tauri check` 或 `pnpm tsc --noEmit` 静态类型检查退出码 0。

- [ ] **Task 3: 前端右侧执行报文控制台与系统联动 (TelemetryPanel)**
  - **因果归属**: [State Transition] 报文监控与日志沉淀
  - **实现目标**:
    - 实现高透流光风格报文控制台（深黑背景、等宽代码字体、滚动条美化）；
    - 实现实时流式报文输出渲染，带时间戳与状态级别（INFO/SUCCESS/WARN/ERROR）彩色标签；
    - 实现一键清屏、复制全部报文至剪贴板、自动滚屏锁定/解锁切换功能；
    - 在 `SlotContainer.tsx` 中挂载 `LauncherDashboard`，替换原先的纯文本占位符。
  - **实测验证门禁 [Measured]**:
    - `pnpm check` 零错误、零警告退出码 0。
    - `pnpm build` 前端构建退出码 0。

- [ ] **Task 4: 全量构建、单文件 EXE 封包与终审验收**
  - **因果归属**: [Verification & Delivery] 生产交付
  - **实测验证门禁 [Measured]**:
    - `pnpm tauri build --no-bundle` 编译出最新生产态 `SelfWork.exe` 退出码 0。
    - 离线独立运行验证，无黑框、无空白，仪表盘开关与报文控制台响应灵敏。
