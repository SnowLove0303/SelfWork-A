# titlebar

## ADDED Requirements

### Requirement: REQ-PURGE-TOP-01: Purge Redundant Sidebar Toggle from Titlebar
The system SHALL remove the duplicate sidebar toggle button from the top titlebar, maintaining the sidebar's internal control as the sole collapse/expand trigger.

#### Scenario: Top titlebar left area rendering
- **WHEN** the top titlebar renders
- **THEN** the top titlebar SHALL NOT render any sidebar collapse/expand button or PanelLeft icon
- **THEN** the brand title "SW工作台" SHALL be the first visual anchor on the left

### Requirement: REQ-PURGE-TOP-02: Purge Desktop Status Capsule from Titlebar
The system SHALL remove the "Desktop / Web Preview" status capsule and indicator light from the top titlebar to achieve maximum visual minimalism.

#### Scenario: Top titlebar right area rendering
- **WHEN** the top titlebar renders
- **THEN** the top titlebar SHALL NOT render any "Desktop / Web Preview" status text, pill button, or indicator dot
- **THEN** the right side of the titlebar SHALL directly host the window control buttons

### Requirement: REQ-PURGE-TOP-03: Realign Titlebar Layout and Drag Area
The system SHALL realign the top titlebar to provide a balanced typography layout, expanded drag region, and crisp window controls.

#### Scenario: Titlebar layout balance
- **WHEN** the window is displayed in normal or maximized state
- **THEN** the left side SHALL display the primary title `#E6EDF7` and module info `#8FA3BF` with natural padding
- **THEN** the central area SHALL act as a full-span `data-tauri-drag-region` for window dragging and double-click maximization
- **THEN** the right side SHALL cleanly render the minimize, maximize/restore, and soft-red hover close buttons
