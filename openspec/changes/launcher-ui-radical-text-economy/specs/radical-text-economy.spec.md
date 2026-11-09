# Specification: Radical Text Economy & Card Layout Refactoring

## 1. Radical Text Economy Axiom

### 1.1 Zero Static Prose Paragraphs
- Operational cards inside `SwitchboardPanel` SHALL NOT render static explanatory description paragraphs (e.g. `<p>{item.description}</p>`).
- If an item possesses background metadata or descriptive notes, that text SHALL ONLY be attached as a native HTML `title` tooltip on the item container or name element.
- Cluster card headers SHALL NOT render explanatory subheadings (e.g. `{cluster.description}`).

### 1.2 Microcopy Conciseness
- Action buttons SHALL strictly use 2 to 3 Chinese characters (e.g. `启动`, `停止`, `全启动`, `全停止`, `探查`).
- Status badges SHALL strictly use concise identifiers (e.g. `运行中`, `已停止`, `启动中`, `停止中`, `异常`, `PID: xxxxx`, `:9010`).

---

## 2. Compact Single-Line Geometry

### 2.1 Service Row Layout
- Each service item in a cluster card SHALL be rendered as a single-line horizontal flex row (`flex items-center justify-between`).
- Row height SHALL be bounded between 40px and 44px (e.g. `py-2 px-3`).
- Left cluster:
  - Icon: `w-6 h-6` or `w-7 h-7` compact icon box
  - Name: `text-xs font-medium`
  - Badges: Port capsule (`:9010`), PID badge (`PID: 12345`)
- Right cluster:
  - Status dot + status text (`text-[11px]`)
  - Switch action button (`tactile-btn`, `h-6 px-2 text-[11px]`)

### 2.2 Cluster Card Spacing
- Cluster cards SHALL use 8pt rhythm: `space-y-2.5` between cards.
- Cluster header SHALL use `py-2 px-3` with title, running count, and master action buttons.

---

## 3. Invariants & Backward Compatibility

- Service identifiers (`item.id`, `commandTarget`, `processNames`, `port`, `url`) SHALL remain unchanged.
- Execution telemetry logging in `TelemetryPanel` SHALL NOT be altered.
- Native Rust IPC inspection and background 4-second polling SHALL operate with 100% parity.
