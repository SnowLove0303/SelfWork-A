# Launcher Process Detection and Termination

## ADDED Requirements

### Requirement: REQ-PROC-WHITELIST-DETECTION Whitelist Process Detection for Launcher Items
The system SHALL detect active processes exclusively for items included in the user's quick launch configuration.

#### Scenario: Background detection runs for launcher items
- **GIVEN** a list of items configured in the launcher storage
- **WHEN** the process detector takes a snapshot of running system processes
- **THEN** it SHALL only match processes corresponding to the executables of configured launcher items
- **AND** it SHALL NOT inspect or expose unconfigured system processes.

### Requirement: REQ-PROC-SINGLE-ITEM-STATUS-AND-KILL Single Item Running Status and Quick Termination
The launcher SHALL render a running status badge on the top-right corner of configured item icons and allow immediate termination of running processes.

#### Scenario: Item is running in system
- **GIVEN** an application item whose target executable has active running processes
- **WHEN** the item card is rendered in the launcher
- **THEN** an active status indicator dot SHALL appear at the top-right corner of its icon
- **AND** when hovering over the indicator, a termination action SHALL be exposed to stop the process
- **AND** clicking the card body SHALL still permit launching additional instances if supported.

### Requirement: REQ-PROC-COMBO-AGGREGATION-AND-KILL Combo Suite Multi-State Aggregation and Bulk Termination
The launcher SHALL aggregate process states for bundle combo suites and provide bulk termination capabilities.

#### Scenario: Bundle suite contains running sub-items
- **GIVEN** a bundle combo item with multiple configured sub-items
- **WHEN** one or more sub-items are running in the system
- **THEN** the bundle card SHALL display an aggregated status indicator indicating full or partial running states
- **AND** the user SHALL be able to terminate all running sub-processes of the combo suite with a single action.

### Requirement: REQ-PROC-MULTI-INSTANCE-CONCURRENCY Multi-Instance Preservation and Clean Teardown
The launcher SHALL allow repeated launching without obstruction while ensuring clean teardown upon explicit termination.

#### Scenario: User launches multiple instances and terminates them
- **GIVEN** an item that supports multiple concurrent instances
- **WHEN** the user clicks the item card multiple times
- **THEN** each click SHALL invoke the launch command normally without blocking
- **AND** when the user explicitly triggers termination, all active PID instances of that target SHALL be safely closed.
