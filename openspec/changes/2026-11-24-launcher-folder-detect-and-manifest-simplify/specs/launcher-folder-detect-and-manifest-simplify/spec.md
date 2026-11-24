# Folder Detection and Manifest Simplification

## ADDED Requirements

### Requirement: REQ-FOLDER-01 Folder Window Detection and Safe Closure
The launcher SHALL detect opened Windows Explorer folder windows matching configured `folder` launcher items and close only those specific folder windows without terminating `explorer.exe`.

#### Scenario: Configured folder is opened in Windows Explorer
- **GIVEN** a launcher item of type `folder` pointing to an existing directory
- **WHEN** a Windows Explorer window is displaying that directory
- **THEN** the item card, combo suite aggregation, and running manifest SHALL reflect its active running state
- **AND** triggering close SHALL post `WM_CLOSE` to that specific folder window handle while leaving `explorer.exe` intact.

### Requirement: REQ-JARGON-02 Removal of Technical Jargon in Running Manifest
The running manifest UI SHALL avoid technical terms such as "进程", "实例", "PID", and "活跃".

#### Scenario: User views the running manifest
- **GIVEN** items and combos are running
- **WHEN** the user opens the running manifest modal
- **THEN** headings, badges, and buttons SHALL use plain labels without "进程", "实例", or "PID".

### Requirement: REQ-NO-MULTI-03 Removal of Multi-Launch and PID Expansion in Manifest
The running manifest modal SHALL NOT display a "多开" button or expandable PID detail drawer.

#### Scenario: User views a running item row in the manifest
- **GIVEN** a running item row in the manifest modal
- **WHEN** the row is rendered
- **THEN** only the status indicator, icon, name, optional count, and "关闭" button SHALL be shown.
