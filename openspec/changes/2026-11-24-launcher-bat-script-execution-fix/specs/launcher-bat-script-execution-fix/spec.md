# Launcher Bat & Script Execution Fix

## ADDED Requirements

### Requirement: REQ-BAT-EXEC-01 Local Batch and Script File Execution Routing
The launcher SHALL detect when a script or application item targets a local `.bat`, `.cmd`, or `.ps1` file (with or without surrounding quotation marks) and execute it via the appropriate Windows command interpreter rather than evaluating the path as a string literal.

#### Scenario: User launches a script item pointing to a quoted .bat file path
- **GIVEN** a launcher item of type `script` whose target is `"F:\App Location\脚本\微信双开管理\微信双开.bat"`
- **WHEN** the user clicks the item card to launch it
- **THEN** the launcher SHALL strip surrounding quotation marks, identify the `.bat` extension, and execute the batch file using `cmd.exe /c` with the script's parent directory as the working directory
- **AND** it SHALL NOT evaluate the quoted path as a PowerShell string literal.

### Requirement: REQ-DIR-ISOLATION-03 Automatic Quote Normalization and Working Directory Binding
The launcher SHALL normalize outer quotation marks from pasted Windows file paths and automatically derive the parent directory as the working directory for local script files when no explicit working directory is configured.

#### Scenario: User saves or launches a local script path without specifying working directory
- **GIVEN** a local script path with spaces and Chinese characters, optionally wrapped in double quotes
- **WHEN** the item is saved or executed
- **THEN** the launcher SHALL derive the script's parent folder as the default working directory
- **AND** relative references inside the script (such as `%~dp0`) SHALL resolve accurately.
