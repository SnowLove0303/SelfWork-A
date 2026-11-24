# Folder Subpath Detection and Badge Cleanup

## ADDED Requirements

### Requirement: REQ-DIR-MATCH-01 Longest-Prefix Folder Window Matching
The folder detector SHALL match an opened Explorer window path to a configured `folder` launcher item either by exact match or by longest-prefix parent directory ownership so that navigating into subdirectories remains detected.

#### Scenario: User navigates into a subdirectory of a configured folder
- **GIVEN** a configured folder item `F:\Root\Materials`
- **WHEN** the Explorer window navigates into `F:\Root\Materials\SubA\Item1`
- **THEN** the detector SHALL attribute that Explorer window handle to `F:\Root\Materials` (or a more specific configured child item if present).

### Requirement: REQ-UI-DEBLOAT-02 Removal of Redundant Count Badges
The running manifest modal and item cards SHALL omit redundant header count pills and per-item child-process count badges (`×14`, `14`), showing only clean status dots.

#### Scenario: User opens the running manifest or views item cards
- **GIVEN** running applications with multiple background child processes
- **WHEN** the manifest or cards render
- **THEN** no `×N` or header duplicate count badges SHALL be shown.
