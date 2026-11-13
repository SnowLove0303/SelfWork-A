# Design: 原生文件选择与网页录入极简重构方案

## 1. 架构方案与技术设计

### 1.1 后端原生文件选择器桥接 (`src-tauri/src/lib.rs`)
- 增加 `pick_launcher_file(is_folder: Option<bool>) -> Result<Option<String>, String>` Tauri 命令；
- 采用非阻塞子线程调用 Windows 原生 `System.Windows.Forms.OpenFileDialog`（或 `FolderBrowserDialog`），支持过滤器：
  `常用启动目标 (*.exe;*.lnk;*.bat;*.cmd;*.ps1)|*.exe;*.lnk;*.bat;*.cmd;*.ps1|所有文件 (*.*)|*.*`；
- 用户选择文件并确认后返回其绝对路径，取消则返回 `None`。

### 1.2 前端智能表单与自适应推导 (`src/components/LauncherDashboard.tsx`)
- 目标路径输入框右侧挂载显眼的“浏览文件 / 文件夹”按钮；
- 选中文件回调：
  1. 路径自动填入 `formTarget`；
  2. 提取文件名（去除扩展名）推导填充 `formName`（若当前名称为空）；
  3. 根据扩展名智能切换 `formType`（`.exe`/`.lnk` -> `app`，`.bat`/`.cmd`/`.ps1` -> `script`，文件夹 -> `folder`）；
- 网页类型专属优化：
  当 `formType === 'url'` 时，界面隐藏文件选择按钮与高级参数，仅保留“目标网址 (URL)”与“名称”；
- 高级选项折叠：
  将“启动参数”、“工作目录”、“辅助描述”收拢进 `<details>` 折叠抽屉中，保持主表单极简。

## 2. 影响与回归评估
- 现有启动逻辑 `launch_custom_target` 保持 100% 现状；
- 已有存储结构 `LauncherItem` 保持不变，向后兼容。
