# Docs Table Clean UI and Instant Selection Dismiss

## ADDED Requirements

### Requirement: REQ-SELECTION-DISMISS Instant Range Dismissal and Outside Click Deselection
The table selection system SHALL ensure multi-cell ranges collapse immediately upon single-cell clicking, outside clicking, or pressing the Escape key.

#### Scenario: User clicks a single cell after multi-cell selection
- **GIVEN** a multi-cell selection range (`selectedRange`) is currently active
- **WHEN** the user clicks (without holding Shift) on any table cell
- **THEN** the multi-cell selection SHALL immediately collapse to `null`
- **AND** the clicked cell SHALL become the sole active focused cell.

#### Scenario: User clicks outside the table
- **GIVEN** a table cell or multi-cell selection is currently active
- **WHEN** the user clicks anywhere outside the table container
- **THEN** the multi-cell selection range and active cell focus SHALL be cleared.

### Requirement: REQ-CLEAN-TABLE-HEADER Minimalist Clean Table Header without Function Dump
The table header SHALL be clean, removing clustered permanent buttons and explanatory instructions from the canvas.

#### Scenario: User views the table block
- **GIVEN** a table block is rendered in the document
- **WHEN** the table header bar is displayed
- **THEN** it SHALL NOT contain clustered permanent buttons for alignment, shading, banded rows, header toggle, or markdown copy
- **AND** the table footer SHALL NOT contain verbose explanation strings.

### Requirement: REQ-RIGHTCLICK-CONVERGENCE Right-Click Menu Full Capability Convergence
The right-click context menu SHALL converge all table configuration and styling actions previously placed in the header.

#### Scenario: User opens table context menu
- **GIVEN** a user right-clicks on a table cell
- **WHEN** the context menu opens
- **THEN** it SHALL provide access to 9-grid alignment, cell shading, table style toggles (header row, banded rows), clipboard operations, and row/column structure operations.
