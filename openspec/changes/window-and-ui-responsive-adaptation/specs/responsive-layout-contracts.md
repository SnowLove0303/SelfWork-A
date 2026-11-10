# Specification: 窗口与 UI 弹性自适应与抗挤压规范

## 1. 范围与术语
- 本规范适用于 SW工作台（SelfWork）的所有视口级容器、工作台插槽、双栏工作区、工具栏及原子级操作控件。
- 遵循 RFC 2119 规范（SHALL、MUST、MUST NOT、SHOULD）。

## 2. 行为契约 (Behavioral Contracts)

### 2.1 抗挤压与几何稳定性契约 (Anti-Squish Invariant)
- 所有功能图标容器（含 Lucide SVG 图标及 BrandLogo）**MUST** 显式挂载 `shrink-0`，严禁在 Flex 容器收缩时被压缩变形。
- 操作按钮文案（如“启动”、“停止”、“全启动”、“全停止”、“探查”、“便签”、“复制”等）**MUST** 声明 `whitespace-nowrap shrink-0`，**MUST NOT** 发生汉字断行或单个字符纵向排列。
- 端口徽章（`:port`）与进程徽章（`PID: xxx`）**MUST** 声明 `shrink-0` 与 `whitespace-nowrap`，禁止因容器收窄而被挤扁为不规则椭圆。

### 2.2 文本截断与安全弹性契约 (Safe Text Truncation)
- 所有作为伸缩主体的单行文本（如服务名称 `item.name`、待办标题 `task.title`、集群标题 `cluster.name`）**MUST** 声明 `min-w-0 flex-1 truncate`；
- 父级容器 **MUST NOT** 允许未限制 `min-width` 的 Flex 子项将父容器撑破或向外越界。

### 2.3 双栏工作台安全底线契约 (Dual-Column Safety Boundary)
- 在快速启动器（LauncherDashboard）中：
  - 左侧 SwitchboardPanel **SHALL** 设置最小安全宽度 `min-w-[420px]`；
  - 右侧 TelemetryPanel **SHALL** 设置最小安全宽度 `min-w-[320px]`；
  - 顶部操作工具栏在宽度受限时 **SHALL** 具备弹性自适应流动排布，严禁控件互相遮挡。
- 在待办便签工作台（TasksView）中：
  - 左侧 TasksPanel **SHALL** 设置最小安全宽度 `min-w-[380px]`；
  - 右侧 MemoBoard **SHALL** 设置最小安全宽度 `min-w-[280px]`。

### 2.4 视口断点与侧栏响应式契约 (Responsive Sidebar Adaptation)
- **WHEN** 桌面窗口宽度变动时：
  - **IF** `window.innerWidth < 1080px`：
    - 系统 **SHOULD** 自动收起侧边栏至图标模式（`w-12`），为核心主舞台释放 112px 横向空间；
    - 顶栏 **SHALL** 显示快捷展开抽屉按钮；
  - 用户手动点击折叠/展开开关拥有最高法定执行权。
