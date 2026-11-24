# UI Text Economy and Skill Lock

## ADDED Requirements

### Requirement: REQ-UI-01 Radical Text Economy in Process Manifest Modal
The `ProcessManifestModal` component SHALL omit explanatory subtitle paragraphs and verbose empty-state prose, adhering to the Radical Text Economy invariant.

#### Scenario: User opens Process Manifest modal
- **GIVEN** the Process Manifest modal is opened
- **WHEN** the header and empty state render
- **THEN** no explanatory subtitle prose SHALL appear under the modal title or empty state headline
- **AND** action button labels SHALL stay concise (1-4 Chinese characters).

### Requirement: REQ-UI-02 Mandatory UI Skill Governance in Project Constitution
The project constitution (`AGENTS.md`) SHALL codify the requirement that every UI modification MUST invoke the `ui-ux-design-engineering` skill beforehand.

#### Scenario: Future UI modification is proposed
- **GIVEN** `AGENTS.md` Layer 3 governance rules
- **WHEN** any agent initiates a UI change
- **THEN** the `ui-ux-design-engineering` skill SHALL be loaded and enforced as a pre-execution gate.
