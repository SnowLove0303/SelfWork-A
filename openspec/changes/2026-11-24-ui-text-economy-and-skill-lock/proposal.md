# Proposal: UI 非必要说明清理与 Ps-openspec UI 技能强制绑定下沉

## 1. 原始需求与事实指纹
> 减少非必要说明，每次改动UI 必须使用Ps-openspec脚手架的UI技能

## 2. 1:1 需求物理对账矩阵 (RTM)

| 需求编号 | 需求描述 | 因果定位 | 对应任务 |
|---|---|---|---|
| **REQ-UI-01** | 清理 `ProcessManifestModal` 非必要说明文字，落实少字原则（Radical Text Economy） | UI 组件微文案净化 | Task 1 |
| **REQ-UI-02** | 将“每次改动 UI 必须使用 Ps-openspec 脚手架 UI 技能 (`ui-ux-design-engineering`)”下沉至项目宪法 `AGENTS.md` | Layer 3 契约立法防线下沉 | Task 2 |

## 3. 法定双清单

### 3.1 拟变范围清单
1. `F:\App Location\SelfWork\src\components\launcher\ProcessManifestModal.tsx` `[UI Microcopy Cleanup]`：删除标题下方说明段落、删除空状态长句引导，精简按钮标签（`一键全部关闭` -> `全部关闭`）。
2. `F:\App Location\SelfWork\AGENTS.md` `[Governance Constitution]`：在 Layer 3 增加 UI 技能强制绑定与少字原则硬约束条款。

### 3.2 保持现状承诺清单
- 保持 `ProcessManifestModal.tsx` 的进程过滤、全部关闭、指定应用/组合/单 PID 关闭交互逻辑 100% 不变；
- 保持 `LauncherDashboard.tsx` 与 `src-tauri/src/lib.rs` 不变。
