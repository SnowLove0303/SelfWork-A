# Changelog - SelfWork (SW工作台)

All notable changes and architectural invariants for SelfWork will be documented in this file.

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
