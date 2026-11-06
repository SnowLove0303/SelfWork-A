# Specification: Desktop Micro-Kernel Host & UI Shell

## 1. Native Rust Toolchain & Tauri Host
- The build environment SHALL have Rust stable (`rustc`, `cargo`) configured and accessible from the command line.
- The desktop shell SHALL be governed by Tauri v2 with `tauri.conf.json` specifying window dimensions (minimum 960x640, default 1200x800).
- The Rust native core SHALL implement a strongly-typed IPC command `ping` returning a JSON response with status, version, and server timestamp.
- WHEN frontend invokes `ping` with valid parameters, THEN the Rust backend SHALL respond with status code 0 and valid pong payload.

## 2. Frontend Engineering & Design Tokens
- The frontend framework SHALL use React 19 with TypeScript strict mode enabled (`noImplicitAny: true`, `strict: true`).
- The styling system SHALL implement Design Tokens conforming to `ui-ux-design-engineering`:
  - Typography scale: Major/Minor Third ratio with explicit line heights;
  - Spacing grid: 4px/8px rhythm;
  - Semantic palette: neutral canvas, clear foreground contrasts (WCAG 2.2 AA >= 4.5:1), and restraint brand accent.
- The UI SHALL strictly reject Anti-AI-Slop cliches: NO gratuitous purple neon gradients, NO uninformative card walls, and NO explanatory prose clutter.

## 3. Pluggable Module Slots
- The main window layout SHALL consist of a collapsible left navigation bar and a responsive right viewport.
- The navigation bar SHALL provide slot selectors for the candidate modules (`launcher`, `tasks`, `notes`, `mindmap`, `mcp`, `ai`, `settings`).
- WHEN a navigation slot is selected, THEN the main viewport SHALL render the corresponding module slot container cleanly.
