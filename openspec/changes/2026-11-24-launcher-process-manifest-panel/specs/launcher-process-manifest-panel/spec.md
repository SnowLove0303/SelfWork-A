# Launcher Process Manifest Panel

## ADDED Requirements

### Requirement: REQ-PROC-LIST-01 Global Running Process Manifest Panel
The launcher SHALL provide a unified Process Manifest panel accessible from the main toolbar that lists all currently running whitelisted applications and combo suites across all categories.

#### Scenario: User opens the Process Manifest panel
- **GIVEN** multiple launcher items and combo suites across different categories have active running processes
- **WHEN** the user clicks the "进程清单" button in the launcher toolbar
- **THEN** the panel SHALL display a live summary of running combo suites (with progress e.g. `2/3`) and running standalone applications (with icon, category, instance count, and PIDs)
- **AND** it SHALL NOT include any process not configured in the launcher storage.

### Requirement: REQ-PROC-KILL-ALL-02 One-Click Terminate All Whitelisted Processes
The Process Manifest panel SHALL allow the user to terminate all currently running whitelisted launcher processes in a single batch action with an accidental-click confirmation guard.

#### Scenario: User terminates all running launcher processes
- **GIVEN** the Process Manifest panel lists active running applications
- **WHEN** the user triggers and confirms "一键全部关闭"
- **THEN** the launcher SHALL deduplicate all active whitelisted PIDs and invoke `terminate_launcher_processes`
- **AND** all whitelisted applications SHALL be closed while SelfWork itself remains running.

### Requirement: REQ-PROC-KILL-APP-03 Targeted Single Application and PID Termination
The Process Manifest panel SHALL allow closing a specific running application or an individual instance PID without affecting other running applications.

#### Scenario: User closes a specific application from the manifest
- **GIVEN** multiple applications are running in the manifest list
- **WHEN** the user clicks the terminate button on a specific application row (or an expanded PID badge)
- **THEN** only the PIDs associated with that selection SHALL be terminated
- **AND** other applications in the list SHALL continue running unaffected.

### Requirement: REQ-PROC-KILL-COMBO-04 Targeted Combo Suite Termination
The Process Manifest panel SHALL aggregate running states for combo suites and allow terminating all running sub-processes belonging to a specific combo suite.

#### Scenario: User closes a running combo suite from the manifest
- **GIVEN** a combo suite has one or more running sub-items
- **WHEN** the user clicks the terminate button on that combo suite row
- **THEN** all active sub-item PIDs belonging to that combo suite SHALL be terminated
- **AND** running items outside that combo suite SHALL remain unaffected.
