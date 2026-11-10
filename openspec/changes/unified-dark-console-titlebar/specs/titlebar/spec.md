# titlebar

## ADDED Requirements

### Requirement: REQ-TITLEBAR-01: Remove Placeholder Icon and Realign Left Layout
The system SHALL remove the top-left placeholder icon and realign the title text, product identity, and controls to maintain a balanced layout without structural collapse.

#### Scenario: Left header rendering without placeholder icon
- **WHEN** the application starts and renders the top titlebar
- **THEN** the system SHALL NOT render any placeholder small square icon or legacy app-icon image in the top-left corner
- **THEN** the brand title "SW工作台" and module information SHALL be aligned with natural typography padding
- **THEN** no empty blank gap, misalignment, or layout collapse SHALL be present

### Requirement: REQ-TITLEBAR-02: Unified Dark Console Color Scheme
The system SHALL style the top titlebar with a refined dark console color scheme matching the workbench deep background.

#### Scenario: Background color and visual integration
- **WHEN** the user views the top titlebar across any theme state
- **THEN** the top titlebar background color SHALL be a subtle deep blue-gray matching `#0D1422` or `#0B1220`
- **THEN** the background SHALL NOT show light gray, stark black, or saturated bright color blocks
- **THEN** the top titlebar SHALL seamlessly integrate with the main console aesthetic

### Requirement: REQ-TITLEBAR-03: Refined Border and Typographic Hierarchy
The system SHALL render a low-presence cool border divider and strict typographic hierarchy on the top titlebar.

#### Scenario: Border divider and text hierarchy display
- **WHEN** the top titlebar renders its boundary and labels
- **THEN** the bottom border SHALL use a low-presence cool-toned divider matching `rgba(80, 140, 200, 0.15)`
- **THEN** the primary title SHALL render in high-contrast light text `#E6EDF7`
- **THEN** the secondary metadata SHALL render in muted text `#8FA3BF`

### Requirement: REQ-TITLEBAR-04: Tactile Feedback and Window Controls
The system SHALL provide smooth interactive feedback and restrained window controls.

#### Scenario: Hovering and clicking window control buttons
- **WHEN** the user hovers over titlebar buttons or controls
- **THEN** the interactive buttons SHALL show a soft blue-gray highlight
- **WHEN** the user hovers over the window close button
- **THEN** the close button SHALL display a soft restrained red highlight instead of an aggressive bright red
- **WHEN** the user clicks minimize, maximize/restore, or close
- **THEN** the system SHALL trigger native window actions without blocking UI interaction

### Requirement: REQ-TITLEBAR-05: Native Dragging and Invariant Preservation
The system SHALL preserve 100% natural window dragging, double-click maximization, and core business functions.

#### Scenario: Dragging and core functionality preservation
- **WHEN** the user clicks and drags any non-button area of the titlebar
- **THEN** the window SHALL move smoothly via native hardware-accelerated drag events
- **WHEN** the user double-clicks the titlebar drag area
- **THEN** the window SHALL toggle between maximized and restored states
- **THEN** the launcher, tasks, and SQLite database features SHALL remain 100% functional
