## ADDED Requirements

### Requirement: REQ-LAUNCHER-INDEPENDENCE-01: 快速启动外部程序生命周期彻底独立
系统在唤起任何外部应用程序（.exe、快捷方式、脚本等）时，SHALL 确保目标进程拥有完全独立的生命周期，在 SW工作台关闭、退出或被终结时，已启动的应用程序 SHALL 保持平稳运行。

#### Scenario: 关闭 SW工作台窗口后外部程序持续存活
- GIVEN 用户通过快速启动面板启动了任意外部应用程序（如微信、浏览器、记事本）
- WHEN 用户点击 SW工作台窗口的关闭按钮（X）、任务栏关闭或触发进程退出
- THEN SW工作台主窗口与主进程正常退出
- AND 被启动的外部应用程序 SHALL 持续在桌面与任务栏正常渲染运行，不发生任何随同闪退或崩溃

### Requirement: REQ-LAUNCHER-BREAKAWAY-02: 突破系统作业限制与进程树级联误杀防线
系统在 Windows 平台下唤起外部应用时，SHALL 采用 Windows Shell 托管通道（`ShellExecuteW`）或脱壳标志，使目标进程的父代脱离 SW工作台。

#### Scenario: 避免被任务管理器结束任务或级联脚本杀死
- GIVEN 外部程序通过快速启动唤起
- WHEN 查看操作系统的进程拓扑关系或执行针对 SW工作台的终止操作
- THEN 外部程序在系统中的父进程归属 SHALL 标定为 Windows 桌面外壳或独立进程组，而非受制于 SW工作台
- AND 对 SW工作台执行的单体终止操作 SHALL 绝不波及已唤起的外部程序

### Requirement: REQ-LAUNCHER-COMPAT-03: 全类型启动能力与参数工作目录传递 100% 保持现状
系统在强化生命周期独立性的同时，SHALL 完整保持对本地 .exe、物理文件夹、.lnk 快捷方式与 URL 网络链接的全类型支持，并正确传递参数与工作目录。

#### Scenario: 携带自定义参数与工作目录启动应用程序
- GIVEN 启动项配置了特定的启动参数（args）与工作目录（workingDir）
- WHEN 系统执行唤起逻辑
- THEN 目标程序 SHALL 正确接收命令行参数
- AND 目标程序的工作目录 SHALL 正确生效，确保其同级 DLL 依赖能够正常加载

#### Scenario: 唤起物理文件夹与独立窗口分屏
- GIVEN 目标为本地文件夹路径
- WHEN 系统执行唤起或屏幕分屏快速启动
- THEN 系统 SHALL 以独立窗口形式在 Windows 资源管理器中打开目标目录
- AND 屏幕分屏吸附编排 SHALL 保持精准就位

### Requirement: REQ-LAUNCHER-VERIFY-04: 自动化核销测试套件与物理证据链
系统 SHALL 包含端到端进程生命周期自动化验证测试，证实父进程消亡后外部应用存活无误。

#### Scenario: 自动化生命周期脱壳断言实测
- GIVEN 执行专用生命周期测试套件 `scripts/launcher-lifecycle-test.mjs`
- WHEN 测试程序拉起独立外部应用并完全终止父测试进程
- THEN 系统 SHALL 证实外部应用进程持续保持存活，并安全清理测试实例
- AND 测试套件退出码 SHALL 为 0
