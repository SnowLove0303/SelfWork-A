# Design: 最长前缀目录匹配与 UI 减负方案

1. **最长前缀目录匹配**：对所有已打开的资源管理器窗口路径 `open_path`，遍历已配置的 `folder` 项，筛选 `open_path == folder_path` 或 `open_path.starts_with(format!("{}\\", folder_path))`，选取 `folder_path.len()` 最长的那一项归属该 `HWND`。
2. **UI 减负**：
   - `ProcessManifestModal.tsx` 移除标题旁的 `{runningItems.length} 项`、`{runningCombos.length} 组合`，移除行内 `×{count}` 徽章；
   - `LauncherDashboard.tsx` 卡片右上角仅保留纯净翠绿呼吸圆点，移除数字显示。
