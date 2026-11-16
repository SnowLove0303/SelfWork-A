# Specification: features

## ADDED Requirements

### Requirement: 执行报文控制台默认收起与右侧悬浮抽屉防挤压契约 (REQ-TELEMETRY-RESPONSIVE-01)
The system SHALL initialize the telemetry execution console in a collapsed state by default, and SHALL render it as a non-destructive floating overlay drawer when toggled, ensuring zero squeezing on primary launcher controls regardless of window dimensions.

#### Scenario: 用户进入快速启动台
- **WHEN**: 用户打开或切换到“快速启动”工作台
- **THEN**: 执行报文控制台默认为收起隐藏状态，主卡片大盘与顶部操作工具栏独享全部可用视口宽度，操作按钮（“+ 新建项”、“+ 组合”、“全启动”、“多选启动”）完全舒展呈现，无任何字符被截断为单个“+”

#### Scenario: 用户按需展开与关闭执行报文
- **WHEN**: 用户点击顶栏“执行报文”按钮
- **THEN**: 控制台以平滑右侧抽屉（Overlay Drawer）形式滑出，浮动于内容区右侧，具备磨砂模糊与深度阴影，中间工具栏各功能按钮宽度保持 100% 稳定，绝不发生横向抖动或挤压截断
- **WHEN**: 用户点击控制台右上角关闭按钮（X）或再次点击顶栏“执行报文”按钮
- **THEN**: 控制台平滑收起隐退，恢复全量视口

### Requirement: 左侧导航栏左下角版本信息彻底净化契约 (REQ-SIDEBAR-PURGE-VERSION-02)
The system SHALL NOT render any version string or divider border at the bottom of the main navigation sidebar.

#### Scenario: 用户查看左侧导航栏
- **WHEN**: 用户观察左侧主导航栏底部（无论处于展开状态还是折叠图标状态）
- **THEN**: 左下角不存在 `v0.1.0-alpha` 文本，且不存在任何底部分割横线，导航模块列表下方保持完全纯净透亮
