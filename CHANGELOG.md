# Changelog - SelfWork (SW工作台)

All notable changes and architectural invariants for SelfWork will be documented in this file.

## [0.1.18] - 2026-11-10

### Refactored (顶部控制台栏极致减噪：移除冗余侧栏折叠按钮与 Desktop 状态胶囊)
- **彻底移除顶部栏重复的侧栏折叠按钮 (Duplicate Toggle Purged)**:
  - 剔除 `src/components/Titlebar.tsx` 左侧的 `PanelLeft` 折叠按钮，消除“顶栏与侧栏两个折叠键”的重复堆叠，仅保留侧边栏原有的收起/展开机制作为全局唯一控制入口；
  - 顶栏左侧无缝贴合纯净品牌文字 `SW工作台`（`#E6EDF7`）与模块信息（`#8FA3BF`），自然左对齐，呼吸留白舒朗。
- **彻底移除右侧 Desktop 状态指示胶囊 (Desktop Pill Purged)**:
  - 剔除常驻于顶栏右侧的“Desktop / Web Preview”状态探测胶囊与状态小圆点，彻底消灭技术性指示造成的视觉杂音；
  - 右侧仅纯粹保留最小化、最大化/向下还原、克制暗调且悬浮柔和暗红的关闭三按键。
- **最大化扩展原生物理拖拽抓手面积 (Expanded Drag Surface)**:
  - 在剥离左侧按钮与右侧胶囊后，顶部栏中间 `data-tauri-drag-region` 获得更宽阔平整的水平抓手，硬件级窗口拖动与双击最大化响应极为畅快。
- **工程产物交付**:
  - `pnpm check` (`tsc --noEmit`) 零警告零错误退出码 0；
  - `cargo test` 5/5 底层测试全绿退出码 0；
  - `pnpm tauri build --no-bundle` 全量 Release 编译通过；
  - 同步更新根目录单文件可执行程序 `SelfWork.exe`（5.59MB）。

## [0.1.17] - 2026-11-10

### Added & Refactored (统一深色控制台顶栏重塑与左上角占位小图标彻底移除)
- **左上角突兀占位小图标移除与纯净排版重构 (Placeholder Icon Purged)**:
  - 彻底移除最顶部左上角的 22px 占位小图标，根除视觉杂质与结构干扰；
  - 重构左侧区域布局对齐：主标 `SW工作台` 采用高亮浅色 `#E6EDF7`，模块信息采用沉稳弱化色 `#8FA3BF`，保持自然留白与严格基线对齐，杜绝结构错位或排版塌陷。
- **全窗体贯穿的统一深色控制台色彩体系 (Unified Dark Console Palette)**:
  - 顶部栏背景色精确采用比主视口略显微蓝灰的深色 `#0D1422`，完美融入整体科技感、冷静克制的深色控制台设计语言，彻底消除“系统默认窗口栏”的断层外挂感；
  - 底部分隔线采用 `rgba(80, 140, 200, 0.15)` 极弱冷调描边，实现清晰可感知但低存在感的分层；
  - 控件 Hover 状态采用柔和深蓝灰提亮（`rgba(80, 140, 200, 0.12)`），与主页面的青蓝/天蓝高亮元素浑然天成。
- **克制窗口控制与柔和暗红关闭交互 (Restrained Window Controls)**:
  - 窗口右上角集成极简细线条最小化、最大化/还原、关闭三按键；
  - 关闭按钮默认保持与整体一致的克制暗调，仅在鼠标悬浮时触发柔和暗红（`hover:bg-rose-500/20 hover:text-rose-300`），移出即刻平滑恢复，绝不刺眼。
- **硬件级零延迟窗口物理拖拽 (Zero-Latency Hardware Dragging)**:
  - 在 `src-tauri/tauri.conf.json` 中配置 `"decorations": false` 与 `"shadow": true`；
  - 顶部栏通过原生 `data-tauri-drag-region` 属性驱动，由底层 WebView2 与 Windows 消息循环直接接管拖拽与双击最大化，零 JS 异步微任务阻塞；
  - 在 Rust 微内核（`src-tauri/src/lib.rs`）中注册 `window_minimize`、`window_toggle_maximize`、`window_close`、`window_is_maximized` 原生命令，与前端形成双通道高可用容灾。
- **工程产物交付**:
  - `pnpm check` (`tsc --noEmit`) 零警告零错误退出码 0；
  - `cargo test` 5/5 底层测试全绿退出码 0；
  - `pnpm tauri build --no-bundle` 全量 Release 编译通过；
  - 同步更新根目录单文件可执行程序 `SelfWork.exe`（5.59MB）。

## [0.1.16] - 2026-11-10

### Added & Refactored (Windows 原生标题栏纯净化：剔除文字与图标，纯净深黑拖拽栏落地)
- **清空原生标题栏图文杂质 (Clean Native Caption Bar)**:
  - 在 `src-tauri/tauri.conf.json` 中配置主窗口 `"title": ""`，并在 Rust 内核启动时显式调用 `window.set_title("")`，彻底清除系统原生标题栏上的任何文字；
  - 在 `src-tauri/Cargo.toml` 中为 `windows-sys` 开启 `"Win32_UI_WindowsAndMessaging"` 特性依赖；
  - 在 `src-tauri/src/lib.rs` 的 `.setup` 生命周期中，通过 Win32 API 向 HWND 发送 `WM_SETICON (ICON_SMALL, 0)` 与 `WM_SETICON (ICON_BIG, 0)` 清除图标句柄，并在 `GWL_EXSTYLE` 扩展样式中注入 `WS_EX_DLGMODALFRAME` 阻止系统回退读取 class 图标，配合 `SWP_FRAMECHANGED` 立即刷新 DWM 客户区与非客户区；
  - 原生标题栏左侧完全无图标、无文本，变为一条深邃极简、沉浸感拉满的纯黑物理拖拽条。
- **100% 保留原生硬件级物理交互与控制按键 (Native Interaction Preserved)**:
  - 完整保留 Windows 10/11 原生硬件级拖动、双击最大化、Aero Snap 贴靠吸附、Snap Layouts 布局菜单；
  - 右上角完整保留 Windows 原生沉浸深色的最小化、最大化与关闭三按键。
- **品牌视觉标识收敛与单点独家呈现 (Brand Single Source of Truth)**:
  - 应用程序流体发光 S-W Logo 与“SW工作台”名称纯粹收敛在左侧边栏顶端 BrandHeader 中独家展示，彻底根除“顶部标题栏 + 侧栏顶端”垂直堆叠的“视觉双胞胎”冗余。
- **工程产物交付**:
  - `pnpm check` (`tsc --noEmit`) 零警告零错误退出码 0；
  - `cargo test` 5/5 底层测试全绿退出码 0；
  - `pnpm tauri build --no-bundle` 全量 Release 编译通过；
  - 同步更新根目录单文件可执行程序 `SelfWork.exe`（5.57MB）。

## [0.1.15] - 2026-11-10

### Added & Refactored (Windows 原生标题栏回归与 DWM 沉浸式深色模式工程落地)
- **100% 原始窗口硬件级拖拽移动回归 (100% Native Windows Window Dragging)**:
  - 在 `src-tauri/tauri.conf.json` 中恢复 `"decorations": true`；
  - 窗口移动彻底交由 Windows 操作系统桌面窗口管理器（DWM）与硬件级消息循环接管，彻底根除 Webview2 内部软件模拟拖拽的所有卡顿、延迟与断触缺陷；
  - 100% 原生支持 Windows 10/11 的 Aero Snap（拖拽至屏幕左右半屏分屏）、Snap Layouts 贴靠菜单、Alt+Space 系统窗口菜单与硬件级多显示器流转。
- **Win32 DWM 沉浸式深色标题栏注入 (DWM Immersive Dark Mode)**:
  - 在 `src-tauri/Cargo.toml` 中为 `windows-sys` 开启 `"Win32_Graphics_Dwm"` 特性支持；
  - 在 `src-tauri/tauri.conf.json` 配置 `"theme": "Dark"`；
  - 在 `src-tauri/src/lib.rs` 的 `.setup` 生命周期中获取主窗口 HWND 句柄，精准调用 `DwmSetWindowAttribute` 注入常量 20（Win11/Win10 20H1+）与常量 19（Win10 1809~1909）沉浸式暗黑属性；
  - 将 Windows 原生标题栏由刺眼的白灰色强行刷为深邃的沉浸深黑色，白字清晰自明，彻底根除深色科技风界面与浅色标题栏的视觉割裂。
- **前端顶栏去重与纯净空间重塑 (Clean Frontend Header)**:
  - 在 `src/components/Header.tsx` 中剔除自定义的最小化、最大化、关闭三按键与垂直分割线，坚决避免出现“两套控制按钮”的混乱堆砌；
  - 剔除 `Header.tsx` 与 `Sidebar.tsx` 中冗余的 `handleStartDragging` 软件模拟拖拽代码与相关 DOM 标记；
  - 顶栏精炼呈现模块名称、副标说明与状态胶囊，专注于工作台业务与状态感知；
  - 净化 `src/App.tsx` 根视口，让操作系统原生接管窗口外轮廓与最大化贴边。
- **工程产物交付**:
  - `pnpm check` (`tsc --noEmit`) 零警告零错误退出码 0；
  - `cargo test` 5/5 项单元测试全绿；
  - 全量生产编译更新单文件可执行程序 `SelfWork.exe`（5.57MB，退出码 0，原始丝滑拖拽与深色沉浸标题栏完美结合）。

### Root Cause & Engineering Defense (根因穿透与长效防线)
1. **无边框模拟拖拽无法达到“原生自然”根因**:
   - Webview 内部的 `startDragging()` 受限于 JavaScript 与原生 IPC 的异步通信及 DOM 事件捕获机制，且无法拥有 Windows 硬件级的 Aero Snap 边缘物理阻尼。用户真正反感的是“浅白色白条割裂”，而非原生标题栏本身。
2. **长效防线下沉**:
   - 建立“保留操作系统原生外壳保障 100% 物理交互 + Win32 DWM 沉浸暗黑属性注入解决色彩割裂 + 前端顶栏专注业务去重”的标准工业级桌面沉浸式工程架构。

## [0.1.14] - 2026-11-10

### Fixed (物理修复桌面窗口拖拽移动功能与双通道事件流下沉)
- **Tauri v2 官方权限沙箱解锁 (Capabilities ACL Unlocked)**:
  - 彻底穿透 5-Whys 根因：Tauri v2 默认阻断未授权的 `start_dragging` 核心系统调用；
  - 建立 `src-tauri/capabilities/default.json` 官方权限描述文件，显式授予 `core:window:allow-start-dragging` 等关键窗口交互权限，从底座消除权限拦截。
- **Rust 微内核直通备用通道 (Kernel Drag IPC)**:
  - 在 `src-tauri/src/lib.rs` 增补 `window_start_dragging` 原生指令并注册到 Handler，作为 Channel B 备用直通指令。
- **前端顶栏全域智能鼠标按下拖拽流 (Smart Header OnMouseDown Stream)**:
  - 在 `Header.tsx` 顶栏容器与 `Sidebar.tsx` Brand 顶栏挂载智能 `onMouseDown` 拖拽处理函数；
  - **防吞没精准裁决**：当且仅当用户点击非按钮区域且非双击时，瞬时触发 `getCurrentWindow().startDragging()`；
  - 侧栏折叠展开按钮、状态探测胶囊与右上角窗口控制三按键通过 `closest('button')` 严格隔离，点击事件 100% 独立响应；
  - 保留双击顶栏空白区域切换最大化/还原的顺畅交互。
- **工程产物交付**:
  - `pnpm check` 零警告零错误退出码 0；
  - `cargo test` 5/5 项单元测试全绿；
  - 全量生产编译更新单文件可执行程序 `SelfWork.exe`（5.58MB，退出码 0，拖拽移动恢复如初）。

### Root Cause & Engineering Defense (根因穿透与长效防线)
1. **无边框窗口拖拽失效根因**:
   - 无边框剥离了操作系统原生非客户区拖拽；而 Tauri v2 引入的权限沙箱在无 `capabilities/default.json` 授权下静默吞没了 Webview 内部的 `start_dragging` 调用。
2. **长效防线下沉**:
   - 确立“底层显式声明权限描述符 + 内核备用 IPC + 前端全域 `onMouseDown` 防吞没过滤”三位一体的无边框窗口拖拽工程防线。

## [0.1.13] - 2026-11-10

### Added & Refactored (无边框沉浸窗口与一体化自定义标题栏重构)
- **消除浅色原生标题栏与全域深色视觉融合 (Unified Frameless Window)**:
  - 在 `src-tauri/tauri.conf.json` 中配置 `"decorations": false` 与 `"shadow": true`，彻底消除 Windows 原生白灰色标题栏带来的上下视觉割裂；
  - 窗口顶部与应用主体自然衔接，整体呈现浑然天成的深色暗夜亚克力磨砂科技质感；
  - 根视口在普通窗口模式下自适应渲染 1px 细微暗调轮廓（`border border-white/[0.08]`），最大化时无缝贴边（`border-0`），兼顾桌面边界识别与全屏沉浸。
