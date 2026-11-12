# Tasks: 快速启动执行报文面板与终端控制台

- [x] 1. 增补 `TelemetryPanel.tsx` 组件的可选 `onClose` 属性与面板折叠收起能力 <!-- id: 1 -->
- [x] 2. 在 `LauncherDashboard.tsx` 中引入 `TelemetryPanel`，注入 `logs`、`isTelemetryOpen` 与 `appendLog` 状态分发 <!-- id: 2 -->
- [x] 3. 改造 `handleLaunchItem`、批量启动及组合启动逻辑，捕获并全量输出 stdout/stderr 报文，去除 30 字符截断 <!-- id: 3 -->
- [x] 4. 运行 `npm run build` 进行机械化零警告、零错误编译验证 <!-- id: 4 -->
- [x] 5. 逐条对账 REQ-01 ~ REQ-04，提请用户最终验收 <!-- id: 5 -->
