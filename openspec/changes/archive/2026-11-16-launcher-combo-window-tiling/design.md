# Design: 快速启动组合智能分屏编排与窗口位置自动吸附 (Window Snap Tiling)

## 架构因果拓扑与几何算法模型

### 1. 屏幕分屏象限归一化坐标系 (Normalized Screen Quadrant System)
为适配各种屏幕分辨率（1080P、2K、4K、带鱼屏）与多显示器环境，所有槽位坐标均采用归一化浮点比例 `[0.0, 1.0]` 进行建模：

```text
(0, 0) ──────────────────────── (0.5, 0) ──────────────────────── (1.0, 0)
  │                                │                                │
  │        槽位 ①：左上象限          │        槽位 ②：右上象限          │
  │   (x=0, y=0, w=0.5, h=0.5)     │   (x=0.5, y=0, w=0.5, h=0.5)   │
  │                                │                                │
(0, 0.5) ─────────────────────── (0.5, 0.5) ───────────────────── (1.0, 0.5)
  │                                │                                │
  │        槽位 ③：左下象限          │        槽位 ④：右下象限          │
  │   (x=0, y=0.5, w=0.5, h=0.5)   │  (x=0.5, y=0.5, w=0.5, h=0.5)  │
  │                                │                                │
(0, 1.0) ─────────────────────── (0.5, 1.0) ───────────────────── (1.0, 1.0)
```

在执行时，通过 Windows 原生 API 动态获取工作区尺寸：
- `work_area`: `RECT { left: 0, top: 0, right: 1920, bottom: 1032 }`（例如 1080P 屏幕扣除 48px 任务栏后高度为 1032px）
- 实际像素转换公式：
  - `pixel_x = work_area.left + (work_width * slot.x_ratio)`
  - `pixel_y = work_area.top + (work_height * slot.y_ratio)`
  - `pixel_w = work_width * slot.w_ratio`
  - `pixel_h = work_height * slot.h_ratio`

### 2. 窗口句柄捕获与吸附流水线 (Window Handle Capture Pipeline)
1. **启动序列**：
   - 组合触发时，先通过现有通道顺序 `launch_custom_target` 打开各项目；
2. **异步平稳等待**：
   - 等待约 350ms~400ms，确保 Windows 操作系统完成进程创建与窗口初始化；
3. **分流精准匹配**：
   - **资源管理器文件夹窗口**：通过 `Shell.Application` COM 自动化管道读取 `$w.Document.Folder.Self.Path`，与各目标目录严格匹配（去除末尾斜杠对比），提取窗口对应 `$w.HWND`；
   - **应用程序 EXE 窗口**：通过 Win32 `EnumWindows` + `GetWindowThreadProcessId` 匹配最近启动的应用主窗口；
4. **Win32 原生平铺调用**：
   - 调用 `SetWindowPos(hwnd, HWND_TOP, pixel_x, pixel_y, pixel_w, pixel_h, SWP_SHOWWINDOW | SWP_NOACTIVATE)`；
   - 窗口瞬间归位，毫无卡顿。

### 3. 前端 UI/UX 编排器设计
在 `LauncherDashboard.tsx` 的“组合模态框”中：
- 增加分屏编排折叠或标签区；
- 提供 4 种可视化模板卡片（带有微缩布局图标）：
  1. `grid-4`: 田字四分屏 (2×2)
  2. `split-h`: 左右双分屏 (1:1)
  3. `split-v`: 上下双分屏 (1:1)
  4. `main-aside-3`: 主次三分屏
- 当选择模板时，自动生成对应槽位选择框，用户为各槽位下拉选取已加入组合的项目。
