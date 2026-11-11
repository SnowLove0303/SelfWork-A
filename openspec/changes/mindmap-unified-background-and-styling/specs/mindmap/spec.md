# Mindmap Background and Visual Styling Specification

## ADDED REQUIREMENTS

### Requirement: REQ-BG-01: Unified Workbench Canvas Background
The Mindmap module SHALL inherit the transparent glass canvas of the SW Workbench rather than rendering opaque solid backgrounds.
- The root containers of both Level-1 Partition View and Level-2 Canvas Editor SHALL use transparent backgrounds (`bg-transparent` or subtle overlays) allowing the workbench's global stage backdrop and fluid gradient sheen to remain visible.
- The color palette, text colors, and borders SHALL strictly adhere to the workbench design system tokens (`text-fg-primary`, `text-fg-muted`, `border-white/[0.08]`, `bg-white/[0.03]`).

#### Scenario: Visual coherence when navigating modules
- GIVEN the user navigates between "快速启动", "待办清单", and "思维导图"
- WHEN the view renders
- THEN the background glass translucency, blur, and fluid light reflection SHALL remain completely consistent without jarring opaque cuts.

---

### Requirement: REQ-BG-02: Level-1 Partition and Document Card Styling Alignment
The system SHALL style the Level-1 Partition View components in alignment with workbench cards and panels.
- The left partition management sidebar SHALL be styled with subtle semi-transparency (`bg-black/15 border-white/[0.06] backdrop-blur-md`).
- Document cards in the grid SHALL use semi-transparent glass cards (`bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.08] hover:border-cyan-500/40`).
- The top partition header and search input SHALL seamlessly blend with workbench header styling.

#### Scenario: Viewing mindmap partition cards
- GIVEN the user is on the Level-1 Partition View
- WHEN inspecting the cards and side panel
- THEN all panels and cards SHALL visually match the GTD Tasks panel and Memo Board styling.

---

### Requirement: REQ-BG-03: Level-2 Canvas Editor Ambient Alignment
The Level-2 Canvas Editor view SHALL blend with the workbench stage.
- The canvas viewport container SHALL be transparent or have a subtle gradient sheen without opaque `bg-slate-950` backdrops.
- The top-left floating breadcrumb navigation bar and bottom-left shortcut guide SHALL use unified glass pill styling (`bg-black/40 backdrop-blur-md border-white/10 shadow-lg`).

#### Scenario: Editing mindmap in Level-2 Canvas
- GIVEN the user enters Level-2 Canvas Editor
- WHEN viewing the canvas and floating pills
- THEN the canvas area SHALL blend seamlessly into the workbench stage.
