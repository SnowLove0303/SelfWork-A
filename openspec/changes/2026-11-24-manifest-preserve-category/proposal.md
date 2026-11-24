# Proposal: 运行清单保留启动项分类显示

## 1. 原始需求与事实指纹
> 运行清单这里要保留启动项分类

## 2. 1:1 需求物理对账矩阵 (RTM)

| 需求编号 | 需求描述 | 因果定位 | 对应任务 |
|---|---|---|---|
| **REQ-MANIFEST-CAT-01** | 在运行清单的单项与组合条目保留启动项分类标签，并按分类顺序排列 | `ProcessManifestModal.tsx` | Task 1, Task 2 |

## 3. 法定双清单
- 拟变文件：`src/components/launcher/ProcessManifestModal.tsx`
- 保持现状：`LauncherDashboard.tsx`、`src-tauri/src/lib.rs` 及所有关闭交互逻辑不变。
