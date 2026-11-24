# Proposal: 运行清单顶部筛选 Tab 按快速启动已有分类文件夹动态分类

## 1. 原始需求与事实指纹
> 不是让你做运行清单分类吗，根据已有的快速启动问及安详文件夹来做分类：

## 2. 1:1 需求物理对账矩阵 (RTM)

| 需求编号 | 需求描述 | 因果定位 | 对应任务 |
|---|---|---|---|
| **REQ-CAT-TABS-01** | 替换写死的 `全部/组合/单项` Tab，根据快速启动已有 `categories` 动态生成分类筛选 Tab（仅展示有运行项的分类 + `全部`），点击精准过滤对应分类下的组合与单项 | `ProcessManifestModal.tsx` | Task 1, Task 2 |

## 3. 法定双清单
- 拟变文件：`src/components/launcher/ProcessManifestModal.tsx`
- 保持现状：`LauncherDashboard.tsx`、`src-tauri/src/lib.rs` 及所有关闭逻辑不变。
