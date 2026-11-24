# Global UI Bloat Cleanup

## ADDED Requirements

### Requirement: REQ-CLEAN-GLOBAL Removal of Unnecessary Explanatory Prose Across All Modules
All operational panels, modals, cards, and empty states across Launcher, Docs, Database, and MindMap modules SHALL remove verbose explanatory sentences, redundant file-path subtitles, and instructional filler text, preserving only self-evident labels and concise status indicators.

#### Scenario: User navigates across any workbench module
- **GIVEN** the user opens Process Manifest, Launcher modals, Docs editor/drawers, Database view, or MindMap trash/empty views
- **WHEN** the UI renders
- **THEN** no multi-clause instructional prose or redundant subtitle text SHALL clutter the view
- **AND** all underlying functional actions SHALL continue to operate identically.
