# Specification: Potential Pluggable Features (候选可插拔功能契约)

## Status: DRAFT / CANDIDATE POOL (候选特性池，暂不开发)

### 1. General Pluggable Invariants
- Each feature module SHALL be designed as an isolated, optional plugin.
- A failure or crash in one module SHALL NOT crash the core workbench platform.
- Modules SHALL NOT import internal implementation details from other sibling modules directly.
- Cross-module communication SHALL be routed through the central EventBus or shared domain types.

### 2. [Candidate] App Launcher Specification
- The launcher MAY accept local executable paths (`.exe`, `.bat`, etc.) and optional execution arguments.
- The host backend SHALL validate executable paths to mitigate command injection risks.
- The launcher SHALL emit explicit status events (`Launched`, `ExitCode(code)`, `Error(reason)`).

### 3. [Candidate] GTD & Task Management Specification
- Tasks SHALL have an explicit status state machine: `Todo -> InProgress -> Blocked -> Done | Cancelled`.
- Tasks SHALL be serializable into standard JSON or Markdown checklist items.

### 4. [Candidate] Notion-like Block Notes Specification
- Document content SHALL be modeled as discrete atomic blocks.
- The notes engine SHALL support bi-directional mapping to standard Markdown files.

### 5. [Candidate] Xmind-like Mind Map Specification
- The mind map engine SHALL maintain a tree/graph data model decoupled from the visual renderer.
- The mind map engine MAY provide lossless conversion interfaces to hierarchical Markdown outlines.

### 6. [Candidate] MCP & API Protocol Specification
- The workbench MAY act as an MCP Client to consume external tool servers.
- The workbench MAY act as an MCP Server exposing local workspace resources via JSON-RPC.

### 7. [Candidate] AI Automation Specification
- The AI engine SHALL support multi-provider model endpoints via standard chat completion interfaces.
- Tool executions initiated by LLMs SHALL require explicit human confirmation unless explicitly delegated.
