# Mindmap Basic Editor Specification

## ADDED REQUIREMENTS

### Requirement: REQ-MIND-01: REA Evidence-Backed Mindmap Data Structure
The mindmap data model SHALL adhere to a standardized hierarchical tree structure derived from Xmind static evidence analysis.
- Every node SHALL contain a unique string `id`, a string `title`, and an optional `children` array of child nodes.
- The root node SHALL serve as the Central Topic (`isRoot: true`).
- All branches SHALL support arbitrary depth of nesting.

#### Scenario: Mindmap tree initialization
- GIVEN the application initializes the mindmap component
- WHEN a default tree is instantiated
- THEN the root node SHALL have a default title and initial main topic children.

### Requirement: REQ-MIND-02: Mindmap Canvas and Branch Layout
The system SHALL provide a canvas rendering the central root topic and all attached hierarchical branches.
- The canvas SHALL calculate non-overlapping horizontal tree layout positions for all visible nodes.
- The canvas SHALL draw smooth connecting curves between parent nodes and their corresponding children.
- WHEN a user clicks and drags the canvas background, the system SHALL pan the entire view smoothly.
- The canvas SHALL provide a reset/re-center button to bring the mindmap back into the viewport center.

#### Scenario: Visual tree rendering and panning
- GIVEN a hierarchical mindmap tree
- WHEN the user views or drags the canvas background
- THEN all nodes and bezier curves SHALL render with non-overlapping positions and pan smoothly.

### Requirement: REQ-MIND-03: Keyboard Shortcuts and Interactive Branch Editing
The system SHALL provide fluent keyboard-driven branch creation, deletion, and inline text editing.
- WHEN a node is clicked, the system SHALL mark it as the currently selected node.
- WHEN the user presses `Tab` while a node is selected, the system SHALL append a new child branch under the selected node, select it, and immediately open inline editing.
- WHEN the user presses `Enter` while a non-root node is selected, the system SHALL insert a new sibling branch directly after the selected node, select it, and open inline editing.
- WHEN the user presses `Delete` or `Backspace` on a non-root node, the system SHALL delete the node and all of its descendants, and move focus to its parent.
- WHEN the user double-clicks or presses `Space`/`F2` on a selected node, the system SHALL activate inline text editing. Pressing `Enter` SHALL commit changes, while `Escape` SHALL cancel editing.

#### Scenario: Keyboard-driven branch manipulation
- GIVEN a selected node on the canvas
- WHEN the user presses `Tab` or `Enter`
- THEN a new node SHALL be appended and immediately focus in inline text editing mode.

### Requirement: REQ-MIND-04: Serialization, Input/Output and Persistence
The system SHALL support data serialization, input/output, and atomic SQLite persistence.
- The system SHALL support exporting the active mindmap to a standard JSON tree format and a plain text/Markdown indented outline.
- The system SHALL support importing and replacing/loading the mindmap from JSON or Markdown text.
- WHEN any node is created, modified, or deleted, the system SHALL automatically persist the mindmap state to local SQLite storage via debounced `saveMindMap` pipeline.
- WHEN the application starts, the system SHALL rehydrate the mindmap state from SQLite, restoring the exact hierarchy.

#### Scenario: Import, export, and persistence lifecycle
- GIVEN changes made to the mindmap branches
- WHEN the user exports or reloads the application
- THEN the mindmap state SHALL be accurately exported or restored from persistent storage without data loss.

### Requirement: REQ-MIND-05: Strict Feature Boundary and Zero Slop Invariant
The system SHALL strictly restrict the mindmap features to basic branching and input/output.
- The system SHALL NOT introduce custom style theme palettes, complex icon markers, boundaries, summary callouts, cloud syncing, or decorative animations.
- All controls SHALL directly serve the core creation, editing, and input/output workflows.

#### Scenario: Minimalist interface presentation
- GIVEN the mindmap view is displayed
- WHEN the user inspects the interface controls
- THEN only essential branching, editing, and input/output controls SHALL be present.

### Requirement: REQ-MIND-06: Verification and Single Binary Delivery
The system SHALL verify type safety, unit test integrity, and binary compilation.
- The codebase SHALL pass `tsc --noEmit` with zero warnings and zero errors.
- The Tauri Rust backend SHALL pass all 5 unit tests with exit code 0.
- The compiled release executable `SelfWork.exe` SHALL be updated and runnable.

#### Scenario: Production build validation
- GIVEN all mindmap components are integrated
- WHEN `pnpm check` and `cargo test` and `tauri build` are executed
- THEN all tests and builds SHALL complete with exit code 0 and deliver `SelfWork.exe`.
