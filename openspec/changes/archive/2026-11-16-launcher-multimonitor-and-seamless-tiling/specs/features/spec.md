# Spec: 多屏幕感知、目标显示器定向分屏与无缝吸附契约 (Multi-Monitor & Seamless Tiling)

## ADDED Requirements

### Requirement: REQ-MULTIMONITOR-DETECTION 系统多屏幕拓扑感知契约
The system SHALL detect all connected physical monitors and their work areas.

#### Scenario: 探测系统连接的多个活动显示器
- **WHEN** 前端挂载或用户打开分屏编排面板时
- **THEN** The system SHALL invoke `get_system_monitors` native command
- **THEN** The system SHALL query all active displays with their bounds, working areas (excluding Windows taskbar), and primary status
- **THEN** The system SHALL return a list of `SystemMonitorInfo` objects identifying Screen 1 (Primary), Screen 2 (Secondary), etc.

### Requirement: REQ-TARGET-MONITOR-PLACEMENT 目标显示器定向平铺契约
The system SHALL support directing the tiled windows onto a user-specified monitor.

#### Scenario: 用户指定将四分屏窗口投放到屏幕 2
- **WHEN** 用户在分屏设置或即时分屏栏中选择“屏幕 2 (副屏)”并执行分屏启动时
- **THEN** The system SHALL invoke `arrange_combo_windows` passing the target monitor index
- **THEN** The system SHALL base the absolute coordinate calculations on the selected monitor's work area
- **THEN** All launched windows SHALL snap and tile onto Screen 2 without obstructing Screen 1

### Requirement: REQ-SEAMLESS-SNAP-COMPENSATION 消除平铺接缝与无缝微观贴靠契约
The system SHALL eliminate visible gaps between tiled windows by compensating for Windows DWM invisible resize frame borders.

#### Scenario: 四分屏平铺时消除中线与交界处的大缝隙
- **WHEN** 算法计算相邻象限窗口的像素坐标时
- **THEN** The system SHALL compensate for DWM drop-shadow resize padding (approx. 7px on inner adjacent edges)
- **THEN** Adjacent windows SHALL slightly overlap their invisible frame borders so that their visible client surfaces touch seamlessly without visible background gaps

### Requirement: REQ-CARD-TYPOGRAPHY-PRESERVATION 组合卡片排版防乱与微文案契约
The system SHALL ensure combo launcher cards render cleanly without vertical letter-wrapping in all resolutions.

#### Scenario: 组合卡片同时带有数量与分屏徽标时保持单行整洁
- **WHEN** 组合卡片在大盘渲染时
- **THEN** The card header badges SHALL apply strict `whitespace-nowrap overflow-hidden select-none`
- **THEN** The layout SHALL use concise text and icon indicators to eliminate vertical text wrapping
- **THEN** Card icons and titles SHALL remain unclipped and vertically centered
