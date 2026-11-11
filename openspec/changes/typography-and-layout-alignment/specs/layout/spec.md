# Typography and Layout Alignment Specification

## ADDED REQUIREMENTS

### Requirement: REQ-TYPO-01: Standardized 5-Level Typography Hierarchy
The workbench and all feature modules SHALL adhere to a standardized 5-level typography token system:
- **Level 1 (Module/Panel Main Header Title)**: Font size SHALL be `text-xs` (12px), font weight `font-semibold`, tracking `tracking-tight`, color `text-fg-primary`.
- **Level 2 (Count and Status Badges)**: Font size SHALL be `text-[10px]` (10px), font family `font-mono`, padding `px-1.5 py-0.5`, background `bg-white/[0.06]`, border `border border-white/[0.06]`, color `text-fg-muted`.
- **Level 3 (Navigation Categories and Tab Filters)**: Font size SHALL be `text-xs` (12px), font weight `font-medium`.
- **Level 4 (Card Titles and Main Content)**: Font size SHALL be `text-xs` (12px), font weight `font-medium`, with truncation on overflow.
- **Level 5 (Meta, Timestamp, and Shortcut Captions)**: Font size SHALL be `text-[10px]` (10px), color `text-fg-muted`.
- Mindmap module headers SHALL NOT use oversized text (`text-base` or `text-sm`).

#### Scenario: Visual typography consistency across modules
- GIVEN the user navigates between Tasks, Memos, and Mindmaps
- WHEN inspecting panel titles, item names, and badges
- THEN all titles across all panels SHALL render at identical 12px font-semibold size, and all badges at 10px font-mono.

---

### Requirement: REQ-TYPO-02: Consistent Top Header Baseline Height and Continuous Hairline
The workbench panels SHALL maintain a consistent top header height and aligned separator hairlines.
- The top header of all primary panels (including MindMapPartitionView left sidebar and right grid header) SHALL be locked to the exact height of `49px` (`h-[49px]`), matching TasksPanel and MemoBoard.
- The horizontal bottom border (`border-b border-white/[0.08]`) of the left partition header and the right document header SHALL align on the exact same vertical Y coordinate, forming a continuous, unbroken baseline across the view.
- The vertical partition divider line SHALL intersect with the horizontal top header line in a clean perpendicular cross without gaps or double borders.

#### Scenario: Aligning lines in Mindmap Partition View
- GIVEN the user is on the Mindmap Partition View
- WHEN inspecting the line between the left partition header and the right main header
- THEN the horizontal bottom line SHALL be completely flat and continuous across the entire viewport width.

---

### Requirement: REQ-TYPO-03: Smooth Layout Transition Across Modules
The workbench module views SHALL maintain uniform padding and spatial rhythm.
- The right main area of the Mindmap module SHALL adopt a balanced padding rhythm (e.g. `px-5 py-3` header, `p-5` grid) matching the visual density of the Tasks and Launcher views.
- Switching between "待办清单" and "思维导图" SHALL exhibit zero layout jumps, zero header line shifts, and seamless visual stability.

#### Scenario: Switching from Tasks to Mindmap
- GIVEN the user is on Tasks view
- WHEN the user clicks "思维导图"
- THEN the top header line and layout density SHALL align naturally without abrupt visual displacement.
