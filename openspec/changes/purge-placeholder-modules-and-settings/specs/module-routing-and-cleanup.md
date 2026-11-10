# Specification: 模块导航收敛与虚假占位净化规范

## 1. 范围与术语
- 本规范定义工作台侧边栏（Sidebar）导航项集合、主舞台插槽（SlotContainer）渲染分支及 `ModuleId` 核心领域类型定义。
- 遵循 RFC 2119 规范（SHALL、MUST、MUST NOT、SHOULD）。

## 2. 行为契约 (Behavioral Contracts)

### 2.1 模块白名单契约 (Module Whitelist Invariant)
- 系统合法模块标识 `ModuleId` **SHALL** 严格且仅限定义为：
  `type ModuleId = 'launcher' | 'tasks';`
- 侧边栏导航条目 `MODULES` **MUST NOT** 包含任何未完成业务闭环的占位项目（严禁出现 `notes`、`mindmap`、`mcp`、`ai`、`settings`）。
- 侧边栏列表 **SHALL** 仅由以下两项构成：
  1. `launcher`: 快速启动（本地应用与集群进程调度）
  2. `tasks`: 待办清单（GTD 待办与灵感便签协同工作台）

### 2.2 主舞台插槽渲染契约 (Slot Rendering Contract)
- `SlotContainer` **SHALL** 仅根据 `activeModule` 渲染对应的实体业务视图：
  - **WHEN** `activeModule === 'launcher'` 时，系统 **SHALL** 渲染 `<LauncherDashboard />`；
  - **WHEN** `activeModule === 'tasks'` 时，系统 **SHALL** 渲染 `<TasksView />`；
- 系统 **MUST NOT** 包含任何纯文字提示的空白占位画板（如 `currentMod.name` 居中占位框）；
- 系统 **SHALL** 移除 `SettingsView` 渲染分支，解除相关设置回调的强依赖。

### 2.3 外观底座不变量契约 (Appearance Base Invariant)
- 移除设置视图后，主舞台与窗口背景 **SHALL** 继承既有经过微调验证的默认冷色调微流光与亚克力磨砂玻璃（`DEFAULT_APPEARANCE_SETTINGS`）；
- 外观背景继续保持通透沉浸质感，绝不发生样式崩坏或白屏退化。
