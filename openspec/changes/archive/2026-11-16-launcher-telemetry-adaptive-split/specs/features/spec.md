# Spec: 快速启动执行报文并列协同布局与大盘卡片自适应重排

## ADDED Requirements

### Requirement: REQ-TELEMETRY-NON-OVERLAY-01 并列协同自适应布局与非覆盖式渲染契约
The system SHALL support side-by-side parallel collaborative layout when expanding the telemetry execution console, MUST NOT overlay or cover the main quick launcher content, and SHALL adapt the card grid and top toolbar dynamically.

#### Scenario: 展开执行报文时大盘卡片自适应重排且零遮挡
- **WHEN** 用户点击顶栏“执行报文”按钮展开控制台时
- **THEN** The system SHALL render the telemetry panel as a direct parallel flex child on the right with width `w-[290px] xl:w-[350px] shrink-0`
- **THEN** The system SHALL shrink the main quick launcher area width dynamically, and the card grid SHALL recalculate columns via `repeat(auto-fill, minmax(136px, 1fr))`
- **THEN** All launcher item cards SHALL remain 100% visible with 0% overlay coverage from the telemetry panel
- **THEN** All top toolbar controls SHALL remain fully visible and clickable without text truncation or squishing

#### Scenario: 收起执行报文时大盘平滑回弹复原
- **WHEN** 用户点击报文关闭按钮或再次点击“执行报文”按钮时
- **THEN** The system SHALL unmount the telemetry panel and restore the main launcher area to full width
