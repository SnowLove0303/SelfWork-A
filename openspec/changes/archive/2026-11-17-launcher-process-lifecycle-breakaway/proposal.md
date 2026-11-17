# Proposal: 快速启动外部进程生命周期解耦与 Windows Shell 独立脱壳架构

## 1. 业务背景与问题根因 (Problem Statement)
用户通过 SW工作台的“快速启动”模块拉起微信、Chrome、飞书、Cockpit 或其它日常应用程序后，当关闭或重启 SW工作台时，被启动的外部应用程序也会随之异常退出。

经底层内核级 Win32 API 探测与实机取证（详见事实指纹报告），确认该问题的核心根因为：
1. **Windows Job Object 继承绑定**：操作系统外壳（Explorer）为 SW工作台分配了 Job Object 资源管理容器。原 `launch_custom_target` 采用 `std::process::Command::new().spawn()` 且创建标志为 0，导致所有子进程强制继承该 Job Object 并在进程树中将 `SelfWork.exe` 标定为直接父进程（`ParentProcessId`）；
2. **级联清理波及**：当 SW工作台被任务管理器“结束任务”关闭，或由运维脚本（`replace-and-launch.mjs` 中的 `taskkill /T`）终止时，Windows 会沿着进程树对所有衍生子进程执行级联终结；
3. **突破作业限制（Breakaway）受限**：直接在 `CreateProcess` 中注入 `CREATE_BREAKAWAY_FROM_JOB` 会由于父作业未开启 `JOB_OBJECT_LIMIT_BREAKAWAY_OK` 权限而触发 WinError 5（拒绝访问）。

## 2. 1:1 需求物理对账矩阵 (Requirements Traceability Matrix)

| 需求 ID | 需求名称 | 对应 Spec-Kit 条目 | 验证指标 |
| :--- | :--- | :--- | :--- |
| **REQ-LAUNCHER-INDEPENDENCE-01** | 快速启动外部程序生命周期与 SelfWork 彻底解耦 | 条目 1：外部程序生命周期彻底独立 | SelfWork 关闭或退出后，外部程序持续存活运行 |
| **REQ-LAUNCHER-BREAKAWAY-02** | 突破系统作业限制与进程树级联误杀防线 | 条目 2：Windows Shell 委托拉起与脱壳 | 目标进程父进程归属为系统外壳 (explorer)，脱离 SelfWork 作业 |
| **REQ-LAUNCHER-COMPAT-03** | 全类型启动能力与既有参数拓扑 100% 保持现状 | 条目 3：全类型与参数、工作目录兼容 | .exe、文件夹、.lnk、URL 协议与分屏快速启动正常 |
| **REQ-LAUNCHER-VERIFY-04** | 自动化核销测试套件与物理证据链 | 条目 4：自动化生命周期测试套件 | 专用生命周期测试套件与全量既有测试真实退出码 0 |

## 3. 核心方案与架构变更 (Proposed Changes)
1. **采用 Win32 工业级标准 `ShellExecuteW` 作为主导唤起引擎**：
   - 在 `src-tauri/src/lib.rs` 的 `launch_custom_target` 中，引入对 Windows 原生 `ShellExecuteW` 的调用；
   - 唤起请求直接委托给 Windows Shell 外壳服务，使外部应用程序的宿主父进程直接标定为系统桌面外壳（`explorer.exe`）；
   - 从根本上突破 SelfWork 的 Job Object 约束，使被拉起程序拥有与桌面图标双击启动完全等同的一级独立生命周期。
2. **安全双保险机制 (Fallback to Detached Process)**：
   - 若 `ShellExecuteW` 返回值异常（<= 32），平滑回退至附加 `CREATE_NEW_PROCESS_GROUP (0x00000200) | DETACHED_PROCESS (0x00000008)` 标志的原生独立进程拉起，确保 100% 可靠性。
3. **运维脚本级联杀伤净化 (`replace-and-launch.mjs`)**：
   - 彻底移除 `taskkill` 中的 `/T` 级联子进程杀死参数，严格锁定单进程 `SelfWork.exe`，绝不波及已启动应用。
