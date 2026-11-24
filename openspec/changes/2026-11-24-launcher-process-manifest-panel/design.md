# Design: 快速启动全进程状态清单与批量/定向关闭管理面板

## 1. 架构与数据流设计

复用已有 Tauri IPC 契约（无需修改 Rust 后端）：
- **数据来源**：`storage.items`（全部分区的单品与组合）、`storage.categories`（分类名映射）、`processStatusMap`（全局白名单实时快照）。
- **派生视图**：
  1. `runningApps`: `storage.items.filter(it => it.type === 'app' && processStatusMap[it.id]?.is_running)`
  2. `runningCombos`: `storage.items.filter(it => it.type === 'bundle')`，计算其 `bundleItemIds` 中在 `processStatusMap` 内处于 `is_running` 的子项数 `runningSubCount` 与总有效子项数 `totalSubCount`，筛选 `runningSubCount > 0` 的组合。
  3. `allRunningPids`: 收集 `runningApps` 的所有 `pids` 并通过 `Set<number>` 去重。

## 2. UI 与交互编排 (`ProcessManifestModal.tsx`)
- **入口位置**：在 `LauncherDashboard.tsx` 顶栏工具栏 `执行报文` 按钮左侧新增 `进程清单` 按钮：
  - 当 `runningApps.length > 0` 时显示翠绿呼吸点与运行实例数徽章；
  - 当无运行进程时仍可点击打开，呈现优雅的空状态提示及“立即巡检”刷新按钮。
- **面板结构**：
  - **Header**：标题“全进程状态清单”、当前活跃应用数与进程总数统计、手动刷新按钮、以及带有二次确认防误触状态的 **“一键全部关闭”** 按钮（首次点击变为 `确认关闭全部 (N 个进程)?` 琥珀/红色脉冲态，3.5秒后自动复位，再次点击立即执行）。
  - **Filter Bar**：关键字搜索框 + 分类标签页（全部 / 组合套件 / 单品应用）。
  - **Combo Section**：展示正在运行的组合套件卡片，标明“全部运行 X/X”或“部分运行 M/N”，内嵌子项运行小徽章，右侧提供“关闭组合”按钮。
  - **App Section**：展示正在运行的单品应用行，包含原生图标、名称、所属分类徽章、多实例数徽章，可展开查看独立 PID 胶囊（支持点 `✕` 单独关闭某一个实例），右侧提供“结束运行”按钮。
