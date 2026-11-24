# Manifest Dynamic Category Tabs

## ADDED Requirements

### Requirement: REQ-CAT-TABS-01 Dynamic Category Filter Tabs in Running Manifest
The running manifest modal SHALL replace static type tabs with dynamic filter tabs derived from the user's configured launcher `categories`, showing `全部` and each category that has active running items or combos.

#### Scenario: User filters running items by launcher category tab
- **GIVEN** configured launcher categories such as `常用办公与开发`, `组合`, and `文件夹`
- **WHEN** the user opens the running manifest and selects a category tab
- **THEN** only running combos and items belonging to that `categoryId` SHALL be displayed
- **AND** selecting `全部` SHALL display all running combos and items.
