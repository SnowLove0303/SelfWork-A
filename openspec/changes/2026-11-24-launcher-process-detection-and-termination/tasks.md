# Tasks: 快速启动模块纳入项进程检测与终止管理

## 1. 任务实施概览与执行锁状态

- [x] **Task 1: Tauri 后端 Rust 原生白名单进程侦测与安全终止指令封装 (`launcher:tauri-proc-core`)**
  - **因果角色**: [Root Backend IPC Producer]
  - **关联需求**: REQ-1, REQ-2, REQ-4
  - **核心动作**:
    1. 在 `Cargo.toml` 中为 `windows-sys` 补充 `"Win32_System_Threading"` 特性；
    2. 在 `src-tauri/src/lib.rs` 中实现 `detect_launcher_processes`：基于 Toolhelp32Snapshot 遍历，白名单匹配启动项目标 exe，返回各项存活状态、PIDs 与实例数；
    3. 在 `src-tauri/src/lib.rs` 中实现 `terminate_launcher_processes`：接收指定 PIDs 列表，通过 `OpenProcess` 与 `TerminateProcess` 执行受控关闭；
    4. 注册到 Tauri `generate_handler!` 并在系统保护下做自卫校验（防止自杀或杀系统核心进程）。
  - **实测验证**: `cd "F:\App Location\SelfWork" ; cargo check --manifest-path src-tauri/Cargo.toml` 零警告零错误通过。

- [x] **Task 2: 前端进程状态节流调度器与单品卡片右上角微状态指示+一键关闭交互 (`launcher:item-proc-ui`)**
  - **因果角色**: [Process State Machine & Card UI]
  - **关联需求**: REQ-2, REQ-4, REQ-5
  - **核心动作**:
    1. 在 `LauncherDashboard.tsx` 建立 `processStatusMap: Record<string, { isRunning: boolean; pids: number[]; count: number }>` 状态；
    2. 实现前台聚焦节流轮询（2.5s）与启动/关闭后即时脉冲刷新；
    3. 在单品卡片图标右上角 (`-top-1 -right-1`) 挂载运行态指示灯与悬停小叉号关闭按钮（`e.stopPropagation()`）；
    4. 在卡片右键菜单中增设“🔴 结束运行 (Kill)”选项；
    5. 保证单品卡片正常点击依然支持多开/重复拉起实例。
  - **实测验证**: `cd "F:\App Location\SelfWork" ; pnpm check` 零警告零错误。

- [x] **Task 3: 组合启动项多态复合感知、状态聚合与联动批量关闭 (`launcher:combo-proc-ui`)**
  - **因果角色**: [Combo Aggregator & Sub-Item Controls]
  - **关联需求**: REQ-3, REQ-5
  - **核心动作**:
    1. 聚合计算 `bundle` 包含的全部子项运行状态（全量运行 / 部分运行 / 未运行）；
    2. 在组合卡片顶栏或状态位提供组合运行态徽章（如“全部运行 3/3”或“部分运行 2/3”），并支持一键全部关闭；
    3. 在组合内渲染的各子项预览胶囊中注入独立状态指示与单项关闭操作。
  - **实测验证**: `cd "F:\App Location\SelfWork" ; pnpm check` 零警告零错误。

- [x] **Task 4: 全量编译验证、桌面端部署更新与 1:1 双向物理核销 (`launcher:build-verify`)**
  - **因果角色**: [Build & Release]
  - **关联需求**: 全量需求 (REQ-1 ~ REQ-5)
  - **核心动作**:
    1. 执行前端与 Tauri Release 完整编译；
    2. 热替换部署 `SelfWork.exe` 并唤起进程验证；
    3. 更新 `CHANGELOG.md` 沉淀版本记录；
    4. 提交 Git 原子变更并出具 1:1 双向物理核销清算表。
  - **实测验证**: 真实编译退出码 0，桌面端进程稳定存活。
