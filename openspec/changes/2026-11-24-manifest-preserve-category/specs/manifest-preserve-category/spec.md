# Manifest Preserve Category

## ADDED Requirements

### Requirement: REQ-MANIFEST-CAT-01 Category Preservation in Running Manifest
The running manifest modal SHALL display the configured launcher category badge for each running item and combo suite, ordered cleanly by category.

#### Scenario: User views running items in the manifest
- **GIVEN** running items belonging to different launcher categories
- **WHEN** the user opens the running manifest modal
- **THEN** each item and combo row SHALL show its compact category badge
- **AND** items SHALL remain concise without technical jargon or child-process count pills.
