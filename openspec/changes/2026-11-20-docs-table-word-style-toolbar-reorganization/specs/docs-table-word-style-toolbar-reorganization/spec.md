# Docs Table Word-Style Toolbar Categorization and Reorganization

## ADDED Requirements

### Requirement: REQ-WORD-CATEGORY Word-Style Orthogonal Toolbar Classification
The table editing system SHALL organize table operations into four orthogonal functional categories (Structure, Alignment, Style, Content) adhering to Microsoft Word table design benchmarks.

#### Scenario: User opens table action toolbar
- **GIVEN** the user has focused or selected cells inside a table
- **WHEN** the table action surfaces (top action bar or context menu) are rendered
- **THEN** operations SHALL be grouped into explicit categories:
  1. `Structure` (Insert Above/Below/Left/Right, Delete Row/Col/Table, Distribute Rows/Cols)
  2. `Alignment` (9-grid cell alignment selector)
  3. `Style` (Cell background color, Header row toggle, Banded rows toggle)
  4. `Content` (Text formats B/I/U, Clear contents, Copy TSV/Markdown)
- **AND** operations SHALL NOT be presented as a flat, unorganized button dump.

### Requirement: REQ-WORD-9GRID-ALIGN Word 9-Grid Cell Alignment Selector
The system SHALL provide a 3×3 matrix alignment selector allowing users to configure both horizontal (left, center, right) and vertical (top, middle, bottom) alignment for single cells or multi-cell selections.

#### Scenario: User changes cell alignment via 9-grid selector
- **GIVEN** one or more table cells are selected
- **WHEN** the user opens the alignment selector and clicks a grid option (e.g., middle-center)
- **THEN** the target cells SHALL update their horizontal and vertical alignment accordingly
- **AND** the active option in the 9-grid selector SHALL reflect the current cell alignment state.

### Requirement: REQ-WORD-CONTEXT-MENU Word-Style Mini Toolbar and Hierarchical Context Menu
The table context menu SHALL present a top Mini Formatting Toolbar for high-frequency formatting alongside cleanly grouped submenus for structural operations.

#### Scenario: User right-clicks inside table
- **GIVEN** a table cell or cell range is right-clicked
- **WHEN** the context menu opens
- **THEN** the top section SHALL display a compact Mini Toolbar with B, I, U, Highlight, Cell Color, and Alignment quick toggles
- **AND** the body section SHALL present grouped action items for Clipboard, Insert, Delete, and Sizing.

### Requirement: REQ-NOTION-GRIPPERS Notion-Style Column and Row Grippers
The table SHALL provide hover grippers at the top of column headers and the left of row boundaries to allow one-click row/column selection and quick-action popup menus.

#### Scenario: User hovers over column or row header
- **GIVEN** the cursor hovers over a table column header or row edge
- **WHEN** the user clicks the gripper icon
- **THEN** the entire column or row SHALL be selected
- **AND** a contextual popup SHALL surface relevant column/row actions (Alignment, Shading, Insert, Delete).
