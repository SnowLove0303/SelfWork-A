# Smooth Page Transitions and Position Alignment Specification

## ADDED REQUIREMENTS

### Requirement: REQ-TRANS-01: Module Switching Transition Animations
The workbench SHALL apply smooth, hardware-accelerated transition animations whenever the active module changes in `SlotContainer`.
- WHEN the user switches `activeModule` between "快速启动", "待办清单", and "思维导图", the incoming view SHALL render with a smooth cross-fade animation.
- The animation duration SHALL be between 160ms and 200ms with an `ease-out` timing curve.
- The animation SHALL combine opacity transition (`0 -> 1`) with subtle vertical translation (`4px -> 0`) to prevent jarring instantaneous flashing.
- The animation SHALL execute via CSS transforms and opacity to guarantee 60fps/120fps GPU compositing without layout thrashing.

#### Scenario: Switching between workbench modules
- GIVEN the user is viewing "待办清单"
- WHEN the user clicks "思维导图" in the sidebar
- THEN the new view SHALL fade in smoothly over ~180ms without visual tearing or blinking.

---

### Requirement: REQ-TRANS-02: Mindmap Level-1 and Level-2 Transition Animation
The Mindmap module SHALL provide fluid visual transitions between the Level-1 Partition Manager and Level-2 Canvas Editor.
- WHEN a user clicks a mindmap card to open the editor, the Level-2 Canvas SHALL animate smoothly with a gentle zoom-fade in effect.
- WHEN a user clicks "返回分区", the view SHALL smoothly transition back to the Level-1 Partition Manager.
- Transition animations SHALL NOT delay or block user keyboard or mouse interaction.

#### Scenario: Opening and closing mindmap canvas
- GIVEN the user is on the mindmap card grid
- WHEN the user clicks a card
- THEN the canvas SHALL smoothly transition into focus.

---

### Requirement: REQ-TRANS-03: Spatial Anchor Harmony and Zero Position Shift
The layout containers across modules SHALL align their visual anchor points to eliminate lateral and vertical eye jumping.
- The left partition column width and right content start boundary SHALL be balanced to reduce visual displacement against the Tasks and Launcher views.
- Top header elements (title, badges, actions) SHALL remain strictly anchored to `h-[49px]` to guarantee zero header jitter across views.

#### Scenario: Eliminating visual jumpiness
- GIVEN the user rapidly alternates between "待办清单" and "思维导图"
- WHEN observing the top header and content grid
- THEN the header bar line SHALL remain perfectly still and visual weight SHALL remain centered.
