# Tasks: 快速启动模块全进程状态清单与批量/定向终止管理面板

- [x] **Task 1: 构建独立的全进程状态清单面板组件 (`launcher:manifest-modal`)**
  - **因果角色**: [UI Component]
  - **关联需求**: REQ-PROC-LIST-01, REQ-PROC-KILL-ALL-02, REQ-PROC-KILL-APP-03, REQ-PROC-KILL-COMBO-04
  - **核心动作**:
    1. 创建 `src/components/launcher/ProcessManifestModal.tsx`；
    2. 实现运行中组合套件聚合展示与“关闭组合”操作；
    3. 实现运行中单品应用展示、独立 PID 展开关闭与整组关闭操作；
    4. 实现顶部搜索、Tab 切换、手动刷新以及带二次确认防误触的“一键全部关闭”交互。
  - **实测验证**: `pnpm check` 零警告零错误通过。

- [x] **Task 2: 在 `LauncherDashboard.tsx` 接入全进程清单入口与批量/单 PID 终止调度 (`launcher:manifest-integration`)**
  - **因果角色**: [State Dispatch & Toolbar Entry]
  - **关联需求**: REQ-PROC-LIST-01, REQ-PROC-KILL-ALL-02, REQ-PROC-KILL-APP-03, REQ-PROC-KILL-COMBO-04
  - **核心动作**:
    1. 实现 `handleTerminateAllProcesses`（去重全部分区运行中白名单 PIDs 并调用 `terminate_launcher_processes`）及 `handleTerminateSinglePid`；
    2. 在顶栏工具栏新增带实时运行计数徽章的“进程清单”按钮；
    3. 挂载 `ProcessManifestModal` 并绑定状态与刷新机制。
  - **实测验证**: `pnpm check` 零警告零错误通过。

- [x] **Task 3: 全量构建、部署更新与 1:1 双向物理核销 (`launcher:manifest-release`)**
  - **因果角色**: [Build & Release]
  - **关联需求**: 全量需求 (REQ-PROC-LIST-01 ~ REQ-PROC-KILL-COMBO-04)
  - **核心动作**:
    1. 执行 `pnpm check`、`pnpm build`、`pnpm tauri build --no-bundle`；
    2. 热替换更新 `SelfWork.exe` 并验证进程存活；
    3. 更新 `CHANGELOG.md` 并执行 Git 原子提交。
  - **实测验证**: 编译退出码 0，桌面端进程存活，OpenSpec validate 通过。
