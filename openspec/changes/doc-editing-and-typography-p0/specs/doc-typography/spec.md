# Spec Delta

## Purpose

Defines behavior contracts for rich-text typography, markdown shortcut recognition, toggle collapsible blocks, and live reading statistics in the document editor.

## ADDED Requirements

### Requirement: Markdown Shortcuts Auto-Conversion
The editor SHALL detect standard markdown prefixes entered at the beginning of a text block followed by a space or specific trigger, immediately convert the block to the target block type, and remove the prefix characters.

#### Scenario: Heading prefix conversion
- **WHEN** user types `# `, `## `, or `### ` at the beginning of a paragraph block
- **THEN** the block type changes to `h1`, `h2`, or `h3` respectively and the prefix is stripped from the editable content.

#### Scenario: Quote, list, and todo prefix conversion
- **WHEN** user types `> ` (quote), `- ` / `* ` (bullet), `1. ` (numbered), or `[] ` / `[ ] ` (todo) at the beginning of a block
- **THEN** the block type updates to `quote`, `bullet`, `numbered`, or `todo` respectively with prefix stripped.

#### Scenario: Horizontal rule conversion
- **WHEN** user types `---` in an empty block
- **THEN** the block converts into a `divider` block.

### Requirement: Text Color and Background Highlight Palette
The floating format toolbar SHALL provide a color palette allowing users to apply foreground text colors and background highlight colors to selected text ranges, and support clearing formats.

#### Scenario: Applying text color
- **WHEN** user selects text in a block and chooses a color from the text color palette
- **THEN** the selected text is wrapped with a styled span applying the semantic color token.

#### Scenario: Applying background highlight
- **WHEN** user selects text in a block and chooses a highlight color from the highlight palette
- **THEN** the selected text is wrapped with a styled span applying the background highlight style.

#### Scenario: Clearing color formatting
- **WHEN** user selects formatted text and clicks clear formatting
- **THEN** custom color and background highlight spans are removed, restoring default text appearance.

### Requirement: Toggle Collapsible Block Component
The document engine SHALL support a `toggle` block type that renders a collapsible header with an interactive chevron toggle, allowing nested child content to be expanded or hidden.

#### Scenario: Toggling block collapsed state
- **WHEN** user clicks the chevron toggle icon on a toggle block
- **THEN** the block toggles between collapsed and expanded state with smooth visual feedback and persists the state.

#### Scenario: Creating toggle block via slash menu
- **WHEN** user types `/toggle` in an empty block and presses enter
- **THEN** a new toggle block is created and focused.

### Requirement: Real-time Word Count and Smooth Outline Navigation
The editor SHALL compute document reading statistics in real time and maintain an interactive outline tree that scrolls smoothly to target sections upon selection.

#### Scenario: Updating reading statistics
- **WHEN** document content changes
- **THEN** word count, Chinese character count, total characters, and estimated reading time are updated with debounce.

#### Scenario: Navigating via outline
- **WHEN** user clicks a heading item in the outline drawer
- **THEN** the editor viewport smoothly scrolls to the target block and applies subtle focus highlight.
