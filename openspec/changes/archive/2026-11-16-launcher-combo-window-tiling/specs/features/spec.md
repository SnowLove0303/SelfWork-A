# Spec: 快速启动组合智能分屏编排与窗口位置自动吸附 (Window Snap Tiling)

## ADDED Requirements

### Requirement: REQ-TILING-PRESET-CONFIG 组合分屏预设与象限槽位绑定契约
The system SHALL allow configuring screen window tiling layouts and binding child items to screen slots for combo launcher items.

#### Scenario: 用户为组合选择四分屏模板并指派子项到四个象限
- **WHEN** 用户在组合创建/编辑面板开启“屏幕窗口布局编排”时
- **THEN** The system SHALL present visual layout presets including 2x2 grid (`grid-4`), horizontal split (`split-h`), vertical split (`split-v`), and main-aside split (`main-aside-3`)
- **THEN** When selecting `grid-4`, the system SHALL provide 4 slots corresponding to Top-Left (0, 0, 50%, 50%), Top-Right (50%, 0, 50%, 50%), Bottom-Left (0, 50%, 50%, 50%), and Bottom-Right (50%, 50%, 50%, 50%)
- **THEN** The user SHALL be able to assign combo member items to each slot
- **THEN** The configured windowLayout data SHALL be persisted to SQLite app_settings without loss

### Requirement: REQ-TILING-AUTOMATED-PLACEMENT 启动组合时窗口自动吸附平铺契约
The system SHALL automatically arrange and position launched windows into designated screen quadrants upon combo activation.

#### Scenario: 一键启动四分屏组合并自动平铺四个窗口
- **WHEN** 用户在大盘点击配置了 `grid-4` 分屏的组合卡片或“启动组合”按钮时
- **THEN** The system SHALL sequentially launch all targets in the combo
- **THEN** The system SHALL invoke `arrange_combo_windows` with the normalized slot coordinates
- **THEN** The system SHALL query the desktop work area excluding Windows taskbar
- **THEN** The system SHALL locate the window handles (HWND) of the launched explorer or app instances and call Win32 `SetWindowPos` to tile each window into its designated quadrant
- **THEN** All 4 windows SHALL tile seamlessly across the screen matching the user's expected 2x2 grid layout
