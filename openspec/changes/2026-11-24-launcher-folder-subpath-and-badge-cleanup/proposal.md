# Proposal: 修复目录子路径漏检并清除运行清单/卡片冗余数字徽章

## 1. 原始需求与事实指纹
> 目录的检测不全面，另外，我是让你为页面减负，减少非必要说明，我标注的这些东西，你显示出来的意义是什么呢

## 2. 1:1 需求物理对账矩阵 (RTM)

| 需求编号 | 需求描述 | 因果定位 | 对应任务 |
|---|---|---|---|
| **REQ-DIR-MATCH-01** | 目录检测支持精确匹配与最长子路径归属匹配（覆盖进入子目录场景） | `src-tauri/src/lib.rs` `detect_launcher_processes` | Task 1 |
| **REQ-UI-DEBLOAT-02** | 去除清单标题旁重复统计徽章、行内 `×N` 子进程数徽章、卡片右上角子进程数字 | `ProcessManifestModal.tsx` & `LauncherDashboard.tsx` | Task 2, Task 3 |

## 3. 法定双清单
- 拟变文件：`src-tauri/src/lib.rs`、`src/components/launcher/ProcessManifestModal.tsx`、`src/components/LauncherDashboard.tsx`
- 保持现状：白名单进程检测安全防线、多开启动与窗口 `WM_CLOSE` 安全关闭机制不变。
