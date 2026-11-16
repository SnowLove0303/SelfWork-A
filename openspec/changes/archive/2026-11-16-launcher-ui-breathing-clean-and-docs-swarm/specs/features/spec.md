# Spec: 报文控制栏防溢出、顶栏呼吸空间重构、冗余文本剔除与文档表格 Swarm 派发

## ADDED Requirements

### Requirement: REQ-TELEMETRY-HEADER-CONTAINMENT 报文控制栏防溢出与呼吸边隙契约
The system SHALL contain all telemetry control buttons strictly within the panel header bounds without overflowing, and MUST maintain adequate breathing padding from the right border.

#### Scenario: 报文顶栏控制按键完全位于容器内且留有安全内边距
- **WHEN** 执行报文面板处于展开状态时
- **THEN** The system SHALL render all header controls (filter capsules, scroll lock, copy, clear, close) within the header boundary with zero overflow
- **THEN** The system SHALL ensure the close button (`✕`) maintains at least 10px breathing clearance from the right panel border

### Requirement: REQ-TOOLBAR-BREATHING-SPACE 顶栏工具链呼吸空间与视觉韵律契约
The system SHALL provide comfortable breathing room between toolbar buttons and container boundaries, eliminating cramped button clusters.

#### Scenario: 快速启动顶部工具栏按键间隙与边距舒展
- **WHEN** 用户浏览快速启动大盘顶部工具栏时
- **THEN** The system SHALL space action buttons with a minimum gap of 8px to 10px (`gap-2 ~ gap-2.5`)
- **THEN** The system SHALL pad the toolbar container with `px-4 md:px-5`, maintaining balanced margins between elements and outer edges

### Requirement: REQ-PURGE-USELESS-TELEMETRY-FOOTER 报文底栏废话调试说明彻底清除契约
The system SHALL purge redundant developer debug footers from the telemetry panel to uphold radical text economy.

#### Scenario: 彻底清除底层 IPC 调试说明
- **WHEN** 用户查看执行报文面板时
- **THEN** The system MUST NOT render `POWERSHELL IPC DAEMON READY` or `UTF-8 / CREATE_NO_WINDOW` or any redundant debug text at the panel bottom

### Requirement: REQ-SWARM-DOCS-TABLE-DELEGATE 文档表格模块专属 Swarm 智能体编组派发契约
The system SHALL initialize and maintain a dedicated Swarm worker specifically designated for the documentation and data table module.

#### Scenario: 成功挂载文档表格专属 Swarm Worker
- **WHEN** 集群调度器执行 Swarm 派发时
- **THEN** The system SHALL register a worker named `docs-table-worker` with a brief dedicated to docs and tables engineering
- **THEN** The worker status SHALL be verifiable via Swarm status inspection
