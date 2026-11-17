# Specification: 快速启动分屏多显示器精准投送与几何平铺 (launcher-split-screen)

## 1. 规范概述
本规范定义了 SelfWork 桌面应用中窗口多显示器定向投放、窗口句柄高可靠捕获、最大化解除、以及像素级几何划分平铺的法定行为契约。

## 2. 行为契约 (RFC 2119 规范)

### 2.1 目标显示器物理投送 (REQ-SNAP-01)
- **SHALL**: 当用户指定 `targetMonitorIndex` 时，后端 `arrange_combo_windows` SHALL 通过 `get_system_monitors_internal()` 获取该索引对应的显示器工作区原点 `(base_x, base_y)` 与有效长宽 `(work_w, work_h)`。
- **SHALL NOT**: 严禁将指定给副屏（例如 `base_x = 1920`）的窗口放置在主屏（`base_x = 0`）物理坐标系内。
- **WHEN**: 当目标显示器索引超出系统当前连接显示器总数时，系统 SHALL 安全回退至系统主显示器（`is_primary == true`），并在日志中记录警告，绝不引起程序崩溃。
- **THEN**: 目标窗口通过 Win32 API 移动后，其物理矩形 `(Left, Top, Right, Bottom)` SHALL 完全位于目标显示器的物理边界内。

### 2.2 屏幕几何划分与无缝平铺 (REQ-SNAP-02)
- **SHALL**: 系统在对窗口应用新坐标前，SHALL 首先执行 `ShowWindow(hWnd, 9 /* SW_RESTORE */)`，以确保处于系统最大化（Maximized）状态的窗口被正确还原为可自由调整尺寸的浮动窗口。
- **SHALL**: 系统 SHALL 依据槽位预设的相对占比 `(x_ratio, y_ratio, w_ratio, h_ratio)` 计算出绝对坐标 `(Px, Py, Pw, Ph)`，并通过 `SetWindowPos(hWnd, IntPtr.Zero, Px, Py, Pw, Ph, SWP_SHOWWINDOW)` 应用位置与大小。
- **SHALL**: 系统 SHALL 维护排他性窗口句柄池（`$usedHwnds`），每个槽位 SHALL 绑定唯一的窗口句柄，严禁多槽位复用同一窗口造成重叠。
- **SHALL**: 内部相邻窗口边缘 SHALL 注入 `DWM_GAP_COMPENSATION` 隐形微重叠补偿（6~8 像素），消除 Windows 11 DWM 投影缝隙。

### 2.3 窗口多维识别与多轮探测 (REQ-SNAP-MATCH)
- **SHALL**: 系统 SHALL 支持三层立体匹配模型：
  1. **Layer 1 (资源管理器)**: `Shell.Application` 物理文件夹路径 100% 绝对比对；
  2. **Layer 2 (顶级桌面窗口与进程)**: 枚举 `WinSta0/Default` 桌面活动顶级窗口，综合比对窗口标题、进程名称（如 `chrome`、`msedge`、`wechat`）与条目显示名（如用户设置的“工作台”、“微信”）；
  3. **Layer 3 (主窗口兜底)**: 系统进程 `MainWindowHandle` 比对。
- **SHALL**: 后端脚本解释器必须 100% 兼容 Windows PowerShell 5.1 语法，严禁使用非法的 `&&` 或 `||` 操作符，逻辑与/或运算必须统一采用 `-and` 和 `-or`。
- **SHALL NOT**: 严禁在脚本执行失败或退出码非 0 时使用任何默认全通兜底，任何执行中断必须作为错误返回并真实记录未就绪数量。
