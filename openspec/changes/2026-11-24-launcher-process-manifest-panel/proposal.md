# Proposal: 快速启动模块全进程状态清单与批量/定向终止管理面板

## 1. 原始需求与事实指纹
> 个人工作台 快速启动模块 我希望有一个全进程状态清单，要支持一键全部关闭所有进程或关闭指定应用、组合进程

## 2. 1:1 需求物理对账矩阵 (RTM)

| 需求编号 | 需求描述 | 因果定位 | 对应任务 |
|---|---|---|---|
| **REQ-PROC-LIST-01** | 全进程状态清单：全局聚合展示当前所有正在运行的纳入快速启动组合套件与单品应用、实例数及 PID 列表 | 顶栏入口 + `ProcessManifestModal` 独立面板 | Task 1, Task 2 |
| **REQ-PROC-KILL-ALL-02** | 一键全部关闭所有进程：收集全部分区正在运行的白名单 PIDs 并一次性安全终止（含防误触二次确认保护） | 全局一键终止调度函数 | Task 1, Task 2 |
| **REQ-PROC-KILL-APP-03** | 关闭指定单个应用的运行进程（支持单应用整组关闭及多开单 PID 精准关闭） | 单品应用条目控制 | Task 1, Task 2 |
| **REQ-PROC-KILL-COMBO-04** | 关闭指定组合套件（Combo）的运行进程，聚合展现全部运行/部分运行状态并支持一键关闭该组合 | 组合套件条目控制 | Task 1, Task 2 |

## 3. 法定双清单 (Dual-Checklist)

### 3.1 拟变范围清单 (Scope of Changes)
1. `F:\App Location\SelfWork\src\components\launcher\ProcessManifestModal.tsx` `[New UI Component]`：
   - 新增独立的全进程状态清单弹窗/面板组件，采用工作台统一的暗黑磨砂玻璃风格；
   - 包含顶栏统计与搜索过滤（全部 / 组合套件 / 单品应用）、“一键全部关闭”按钮（带轻量化二次确认防误触状态）、“运行中的组合套件”区（展示组合名称、运行进度如 `2/3`、子项胶囊、一键关闭组合）及“运行中的单品应用”区（展示图标、名称、分类标签、多实例数、可展开的单 PID 精准关闭以及整组关闭）。
2. `F:\App Location\SelfWork\src\components\LauncherDashboard.tsx` `[State Dispatch & Toolbar Entry]`：
   - 在顶栏工具栏新增带实时运行总数徽章的“进程清单”按钮；
   - 新增 `handleTerminateAllProcesses`（收集去重全部运行中白名单 PIDs 并下发 `terminate_launcher_processes`）及 `handleTerminateSinglePid`（终止单个指定 PID）；
   - 挂载 `ProcessManifestModal` 组件并透传实时状态、分类映射与关闭回调。

### 3.2 保持现状承诺清单 (Leave-As-Is Commitment)
- 100% 保持 `src-tauri/src/lib.rs` 后端进程白名单侦测 (`detect_launcher_processes`) 与终止 (`terminate_launcher_processes`) 原封不动；
- 100% 保持既有的单品/组合卡片右上角指示灯、悬停关闭及右键菜单原封不动；
- 100% 保持可重复启动多实例公理与批处理执行逻辑原封不动。
