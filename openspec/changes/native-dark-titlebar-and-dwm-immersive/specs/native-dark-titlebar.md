# Specification: native-dark-titlebar

## 1. 窗口外壳与系统契约 (Native Decoration & DWM Spec)

### 1.1 窗口装饰规范 (Decorations Invariant)
- **WHEN** 应用程序在 Windows 环境下构建与启动；
- **THEN** `src-tauri/tauri.conf.json` **SHALL** 配置 `"decorations": true`；
- **THEN** `src-tauri/tauri.conf.json` **SHALL** 配置 `"theme": "Dark"`；
- **THEN** 窗口移动完全由 Windows 系统内核驱动，**SHALL** 支持 Aero Snap 与系统物理动画。

### 1.2 DWM 沉浸式深色模式契约 (DWM Dark Mode Contract)
- **WHEN** Tauri 主窗口初始化（`.setup` 生命周期）；
- **THEN** 系统 **SHALL** 获取主窗口 HWND 物理句柄；
- **THEN** 系统 **SHALL** 调用 Win32 API `DwmSetWindowAttribute`：
  - 属性常量 20（`DWMWA_USE_IMMERSIVE_DARK_MODE`，适用于 Windows 11 与 Windows 10 20H1+）；
  - 属性常量 19（适用于 Windows 10 1809~1909）；
  - 传入参数 `1`（启用）；
- **THEN** Windows 原生标题栏背景 **SHALL** 自动呈现深黑/暗炭灰色，标题字体反白显示，系统原生三键适配深色主题。

## 2. 界面布局去重规范 (UI Header De-duplication Spec)

### 2.1 顶栏元素纯净化
- **WHEN** 用户查看应用内顶栏（`Header`）；
- **THEN** 顶栏 **SHALL NOT** 包含前端自定义的最小化、最大化、关闭三按键；
- **THEN** 顶栏 **SHALL NOT** 包含针对窗口移动的自定义 `handleStartDragging` 监听；
- **THEN** 顶栏左侧展示折叠/展开按钮与当前模块名/副标，右侧展示内核连接状态胶囊。

### 2.2 根视口与侧栏规范
- **WHEN** 根视口渲染；
- **THEN** 根视口 **SHALL** 依附于 Windows 原生客户区，取消自定义无边框模式下的假边界阴影；
- **THEN** 侧栏顶端 Brand 区域取消模拟拖拽监听，保持纯净品牌展示与收起交互。
