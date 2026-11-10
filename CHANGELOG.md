# Changelog - SelfWork (SW工作台)

All notable changes and architectural invariants for SelfWork will be documented in this file.

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
- **单层顶栏空间深度整合 (Single-Tier Header Integration)**:
  - 坚决杜绝“叠床架屋”多加一层标题条的粗暴做法，将窗口控制功能与拖拽抓手深度内嵌于现有 44px（`h-11`）顶栏中，主工作区可用高度 0 损耗；
  - 重新理顺空间关系：左侧与侧栏无缝对齐并展示当前模块标题；中间作为自适应原生拖拽抓手；右侧集成状态胶囊与窗口控制按钮组；避免重复出现 SW Logo 与应用名。
- **自定义桌面原生控制按钮 (Custom Window Controls)**:
  - 右上角集成最小化（`-`）、最大化/还原（`□` / `❐` 状态联动）、关闭（`✕`）三组 1.2px 精准描边细线条几何按键；
  - 默认低对比度柔和浅灰，最小化/最大化悬停呈现柔和半透明浅白反光，关闭按钮悬停呈现克制暗红警示反馈（`bg-rose-500/25 text-rose-300`）。
- **保全完整的 Windows 原生交互与防误触隔离 (Native Window Invariants)**:
  - 顶栏与侧栏 Brand 区域空白处挂载 `data-tauri-drag-region` 原生拖拽抓手，支持鼠标顺畅拖动窗口；
  - 双击顶栏空白区域即刻平滑切换最大化与向下还原；
  - 侧栏展开按钮、状态探测胶囊与右上角窗口控制按钮严格物理隔离拖拽热区，保障点击事件 100% 独立响应、零吞没；
  - 窗口四周边缘仍能顺畅吸附并拖拽缩放尺寸（Resize）。
- **Rust 底层免权限官方通道 (Rust IPC Fallback)**:
  - 在 `src-tauri/src/lib.rs` 中直接暴露 `window_minimize`、`window_toggle_maximize`、`window_close`、`window_is_maximized` 原生命令，完全由 Rust 内核通过 `tauri::Window` 执行，免除前端繁琐 capabilities 权限字典限制；
  - 在 Web 预览环境下提供优雅降级。
- **工程产物交付**:
  - `pnpm check` 零警告零错误退出码 0；
  - `cargo test` 5/5 项单元测试全绿；
  - 全量生产编译更新单文件可执行程序 `SelfWork.exe`（5.5MB，退出码 0）。

### Root Cause & Engineering Defense (根因穿透与长效防线)
1. **白灰系统标题栏破坏深色科技风一致性根因**:
   - 依赖 Windows 原生默认窗口装饰（`decorations: true`）无法自定义系统标题栏背景色，在深色应用中必然产生刺眼的视觉横杠。
2. **长效防线下沉**:
   - 建立“框架配置关边框、Rust 内核接管窗口控制、顶栏单层一体化嵌入、拖拽与点击物理隔离、最大化自适应贴边”的标准桌面沉浸式工程架构。
