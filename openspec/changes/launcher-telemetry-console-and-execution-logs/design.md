# Design: 快速启动执行报文面板与终端控制台架构设计

## 1. 架构拓扑与组件集成

```text
┌────────────────────────────────────────────────────────────────────────┐
│ LauncherDashboard (主大盘视图)                                         │
│                                                                        │
│ ┌──────────────────────┬────────────────────────┬────────────────────┐ │
│ │ 分类导航栏 (210px)   │ 主工作台卡片大盘       │ TelemetryPanel     │ │
│ │                      │ (自适应网格)           │ (执行报文控制台)   │ │
│ │ - 系统与开发         │                        │ (380px, 可折叠)    │ │
│ │ - 日常办公常用       │ - 单项启动卡片         │                    │ │
│ │ - 专属组合           │ - 组合启动卡片         │ - INFO/SUCCESS/ERR │ │
│ │ - ...                │ - 多选批量操作栏       │ - Monospace Pre    │ │
│ │                      │ - 顶部【执行报文】按钮 ┼────────────────────┤ │
│ └──────────────────────┴────────────────────────┴────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

## 2. 状态管理与数据流

1. **报文日志模型**:
   - 复用既有的 `TelemetryLogEntry` 与 `TelemetryLogLevel` 类型：
     ```typescript
     interface TelemetryLogEntry {
       id: string;
       timestamp: string; // HH:mm:ss.SSS
       target: string;    // 目标项名称或 system
       level: TelemetryLogLevel; // 'info' | 'success' | 'warn' | 'error'
       message: string;   // 结构化日志内容或多行标准输出
     }
     ```
2. **状态注入**:
   - `logs: TelemetryLogEntry[]` 状态维护在 `LauncherDashboard` 中，初始化一条就绪报文。
   - `isTelemetryOpen: boolean`（默认为 `true`，用户可一键折叠或展开）。
   - `appendLog(target: string, level: TelemetryLogLevel, message: string)` 辅助函数。
3. **执行流挂载**:
   - 在 `handleLaunchItem` 中：
     - 开始时记录 `appendLog(item.name, 'info', ...)` 并记录开始时间戳 `t0 = performance.now()`;
     - 脚本执行结束时：`appendLog(item.name, 'success', `执行成功 (耗时 ${duration}ms):\n${output}`)`；
     - 应用程序唤起成功时：`appendLog(item.name, 'success', `已成功拉起: ${item.name} (耗时 ${duration}ms)`)`；
     - 异常捕获时：`appendLog(item.name, 'error', `启动失败: ${errMsg} (耗时 ${duration}ms)`)`；
   - 组合与批量启动中同步注入阶段总结日志。

## 3. 依赖与影响面
- 影响文件：
  - `src/components/launcher/TelemetryPanel.tsx`（添加可选 `onClose` 属性，微调样式与控制）
  - `src/components/LauncherDashboard.tsx`（引入 `TelemetryPanel`，绑定日志分发与折叠开关）
- 无需改动 Rust 后端（现有 `execute_custom_script` 与 `launch_custom_target` 已提供完整标准输出与错误链路）。
