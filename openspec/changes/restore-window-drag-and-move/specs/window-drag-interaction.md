# Specification: window-drag-interaction

## 1. 权限与底层通道规格 (Capabilities & IPC Contract)

### 1.1 Tauri v2 窗口权限声明 (Capability Spec)
- **WHEN** Tauri 构建和运行时启动；
- **THEN** 系统 **SHALL** 在 `src-tauri/capabilities/default.json` 中显式声明并激活：
  - `core:default`
  - `core:window:default`
  - `core:window:allow-start-dragging`
  - `core:window:allow-minimize`
  - `core:window:allow-maximize`
  - `core:window:allow-unmaximize`
  - `core:window:allow-close`
  - `core:window:allow-is-maximized`
  - `core:window:allow-toggle-maximize`
- **THEN** Webview2 内部执行 `getCurrentWindow().startDragging()` **SHALL NOT** 被权限拦截。

### 1.2 Rust 内核直通命令契约
- **WHEN** 前端触发窗口拖动；
- **THEN** Rust 内核 **SHALL** 额外提供 `window_start_dragging` 命令作为备用通道；
- **THEN** 前端优先通过 `@tauri-apps/api/window` 的 `getCurrentWindow().startDragging()` 或 `invoke('window_start_dragging')` 发起物理拖拽。

## 2. 交互抓手与事件处理规格 (Header Drag & Click Contract)

### 2.1 鼠标按下拖拽事件流 (MouseDown Flow)
- **WHEN** 用户在顶部栏（`Header`）或侧栏 Brand 顶端区域按下鼠标左键（`e.button === 0`）；
- **IF** 点击的目标源节点属于交互控件（`target.closest('button') !== null` 或包含其他可点击组件）；
- **THEN** 系统 **SHALL** 立即跳过拖拽逻辑，保持子控件的正常点击或按下事件；
- **ELSE IF** 单击计数器 `e.detail > 1`（双击场景）；
- **THEN** 系统 **SHALL** 允许双击事件冒泡以触发最大化/还原切换；
- **ELSE**
- **THEN** 系统 **SHALL** 立即调用 `getCurrentWindow().startDragging()`，操作系统接管鼠标光标并在用户移动时平滑搬动窗口。

### 2.2 全域覆盖与视觉光标
- **WHEN** 鼠标悬停在顶栏非按钮空白区域；
- **THEN** 鼠标光标 **SHALL** 保持默认原生桌面光标（`cursor-default`）；
- **THEN** 元素上同时保留 `data-tauri-drag-region` 声明式属性，与显式 `onMouseDown` 构成双冗余保障。
