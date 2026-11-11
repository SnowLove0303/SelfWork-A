# Mindmap Toolbar Purge and Immersive Canvas Specification

## ADDED REQUIREMENTS

### Requirement: REQ-PURGE-01: Top Toolbar Buttons Purged and Zen Canvas Viewport
The system SHALL remove all top toolbar buttons and provide a pure, full-height immersive mindmap canvas.
- The system SHALL NOT render any node manipulation buttons (`子分支`, `同级分支`, `删除`) on the interface.
- The system SHALL NOT render any top utility buttons (`居中`, `导入`, `导出`) on the top toolbar.
- The mindmap canvas SHALL expand vertically to fill the full container height without top toolbar margin or borders.
- The system SHALL retain the subtle footer shortcut reminder bar at the bottom of the viewport.

#### Scenario: User navigates to mindmap view
- GIVEN the user selects the "思维导图" module from the sidebar
- WHEN the mindmap view is mounted
- THEN the interface SHALL render a full-viewport canvas without any top button toolbar, and display keyboard shortcut hints in the bottom footer.

### Requirement: REQ-PURGE-02: 100% Keyboard-Driven Branch Manipulation and Inline Editing
The system SHALL preserve all existing keyboard shortcuts for branch creation, deletion, navigation, and text editing.
- WHEN a node is selected and the user presses `Tab`, the system SHALL append a new child branch and immediately activate inline text editing.
- WHEN a non-root node is selected and the user presses `Enter`, the system SHALL insert a new sibling branch after the selected node and immediately activate inline text editing.
- WHEN a non-root node is selected and the user presses `Delete` or `Backspace`, the system SHALL delete the branch and transition selection to its parent.
- WHEN a node is selected and the user presses `Space` or `F2` (or double-clicks), the system SHALL enter inline text editing mode.

#### Scenario: Fluent keyboard mindmapping
- GIVEN a mindmap with an active selected node
- WHEN the user presses `Tab` followed by text entry and `Enter`
- THEN the node structure SHALL update fluently via keyboard with zero dependency on visual UI buttons.
