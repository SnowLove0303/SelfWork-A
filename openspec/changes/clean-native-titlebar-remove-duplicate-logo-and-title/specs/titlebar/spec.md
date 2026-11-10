# titlebar

## ADDED Requirements

### Requirement: REQ-TITLEBAR-CLEAN: Native Titlebar Clean & Pure Drag Bar
The system SHALL remove the icon and title text from the Windows native titlebar, preserving a clean dark drag area and native buttons.

#### Scenario: Clean native titlebar with no text and no icon
- **WHEN** 应用程序在 Windows 环境下启动
- **THEN** 主窗口 title SHALL 为空字符串，标题栏无文本
- **THEN** 系统通过 Win32 API SHALL 移除图标，标题栏左上角无应用图标
- **THEN** 窗口 SHALL 保持 Windows 原生硬件级物理拖动与 Aero Snap 贴靠
