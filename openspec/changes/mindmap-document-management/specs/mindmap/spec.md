# Mindmap Partition and Document Management Specification

## ADDED REQUIREMENTS

### Requirement: REQ-PART-01: Two-Level Hierarchical Page Architecture
The system SHALL organize the Mindmap module into a distinct two-level user flow:
- Level-1 Page (分区与导图管理大盘): The root management view displayed whenever the user enters the Mindmap module, dedicated to partition categorization, document discovery, creation, and lifecycle operations.
- Level-2 Page (思维导图编辑画布): The dedicated full-height canvas editor view opened when a specific mindmap is selected or created, focusing purely on node manipulation.
- Transitions between Level-1 and Level-2 SHALL be instantaneous, animated smoothly, and retain zero layout shifts.

#### Scenario: Navigating into Mindmap Module
- GIVEN the user is on the SW Workbench
- WHEN the user clicks "思维导图" in the left navigation sidebar
- THEN the system SHALL display the Level-1 Partition & Document Management page by default.

---

### Requirement: REQ-PART-02: Partition Lifecycle Management
The system SHALL provide category/partition management in Level-1 Page to allow organizing mindmaps into logical folders or workspaces.
- The system SHALL provide a default partition (e.g. "所有导图" / "默认分区") that cannot be deleted.
- The system SHALL support creating custom partitions via a "+ 新建分区" action.
- The system SHALL support renaming custom partitions in-place.
- The system SHALL support deleting custom partitions, moving their associated documents to the default partition or confirming safe cleanup.
- Selecting a partition SHALL immediately filter the mindmap cards shown in the main grid, and display the document count badge for each partition.

#### Scenario: Partition creation and switching
- GIVEN the Level-1 Page is active
- WHEN the user creates a new partition named "工作" and selects it
- THEN the partition SHALL appear in the partition sidebar, and the right grid SHALL only display mindmaps associated with "工作".

---

### Requirement: REQ-PART-03: Document Creation and Management Cards
The system SHALL render mindmap documents as interactive cards in a responsive grid in Level-1 Page.
- The first card in the grid SHALL ALWAYS be the dedicated `[ + 新建导图 ]` (Create Mindmap) action card.
- WHEN the user clicks `[ + 新建导图 ]`, the system SHALL generate a new mindmap document assigned to the current active partition with a central topic node, and immediately transition into the Level-2 canvas editor.
- Subsequent cards SHALL render existing mindmap documents belonging to the selected partition, ordered by `updatedAt DESC`.
- Each mindmap card SHALL display the document title, last updated timestamp, total node count badge, and a visual wireframe/icon.
- Each mindmap card SHALL provide a context menu with options: "重命名" (Rename), "移动分区" (Move to Partition), and "删除" (Delete).
- A search bar SHALL be provided at the top of the grid to filter documents by title in real-time.

#### Scenario: Creating a new mindmap from card
- GIVEN the user is in Level-1 Page under partition "学习"
- WHEN the user clicks the `[ + 新建导图 ]` card
- THEN a new mindmap document SHALL be created under "学习", and the system SHALL transition to Level-2 editor with the new map open.

---

### Requirement: REQ-PART-04: Bi-Directional View Transition and Breadcrumb Navigation
The system SHALL support bi-directional navigation between Level-1 (Management) and Level-2 (Canvas Editor).
- WHEN the user clicks any mindmap card in Level-1, the system SHALL transition to Level-2 and load the document's node tree.
- In Level-2 Canvas Editor, the system SHALL render a discreet, high-contrast navigation bar at the top-left containing a `[ ← 返回分区管理 ]` back button and breadcrumb text displaying `[分区名] / [导图标题]`.
- WHEN the user clicks `[ ← 返回分区管理 ]`, the system SHALL flush pending edits, update the document's `updatedAt` timestamp, and transition back to Level-1 Page.
- All existing keyboard shortcuts in Level-2 (`Tab`, `Enter`, `Delete`, `Space`, `F2`) SHALL remain 100% functional.

#### Scenario: Returning from canvas editor to partition management
- GIVEN the user is editing a mindmap in Level-2 Canvas Editor
- WHEN the user clicks the top-left `[ ← 返回分区管理 ]` button
- THEN the system SHALL save the latest node tree and return to the Level-1 Page showing the updated card.

---

### Requirement: REQ-PART-05: Multi-Partition & Multi-Document SQLite Persistence
The system SHALL persist all partitions and mindmap documents to local storage with multi-document data isolation.
- Partitions SHALL contain `id: string`, `name: string`, `createdAt: number`, `isDefault?: boolean`.
- Mindmap documents SHALL contain `id: string`, `partitionId: string`, `title: string`, `updatedAt: number`, `createdAt: number`, and `root: MindMapNode`.
- Data SHALL be stored in SQLite via `app_settings` with atomicity, supplemented with localStorage cache for instant zero-latency reads.
- Edits in Level-2 Canvas Editor SHALL continue to debounce save within 300ms.
- IF legacy single-map data exists in the database, the system SHALL automatically migrate it into the default partition on first startup without data loss.

#### Scenario: Database migration and multi-document persistence
- GIVEN legacy mindmap data exists from prior single-map versions
- WHEN the application starts with the new partition architecture
- THEN the system SHALL automatically import the legacy map into the default partition and persist both partitions and documents safely.
