# tasks-and-memos

## ADDED Requirements

### Requirement: REQ-DRAG-01: Task Item Drag-and-Drop Reordering
The system SHALL support reordering task items within the tasks list via drag-and-drop gestures and drag handles.

#### Scenario: Dragging a task to a new position
- **WHEN** the user drags a task item using the drag handle or card body
- **THEN** the system SHALL render a visual drop indicator on the target slot
- **WHEN** the user releases the dragged item
- **THEN** the system SHALL update the tasks list order and trigger SQLite persistence

### Requirement: REQ-DRAG-02: Memo Card Drag-and-Drop Reordering
The system SHALL support reordering memo cards on the memo board via drag-and-drop gestures.

#### Scenario: Dragging a memo card to a new position
- **WHEN** the user drags a memo card using the card header or drag handle
- **THEN** the dragged card SHALL display reduced opacity and the target slot SHALL show drop feedback
- **WHEN** the user releases the card
- **THEN** the system SHALL reorder the memos collection and trigger SQLite persistence

### Requirement: REQ-DRAG-03: Interaction Isolation and Anti-Conflict Protection
The system SHALL isolate interactive elements (inputs, checkboxes, buttons) from drag event triggers.

#### Scenario: Clicking interactive controls inside task or memo
- **WHEN** the user clicks a checkbox, priority button, text input, textarea, or action button
- **THEN** the click or input event SHALL execute normally without triggering drag operations
- **THEN** dragging SHALL only trigger from designated handles or non-interactive card surfaces

### Requirement: REQ-DRAG-04: Reordered State Persistence and Cold-Start Recovery
The system SHALL persist custom task and memo sequences to SQLite storage.

#### Scenario: App restart after reordering
- **WHEN** tasks or memos are reordered and persisted to SQLite
- **WHEN** the user closes and restarts the application
- **THEN** the hydrated tasks and memos SHALL be restored in the exact reordered sequence
