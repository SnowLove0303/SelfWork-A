# Design Document: Tasks & Sticky Notes Dual-Column Workspace

## 1. System Architecture & Split Layout

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SlotContainer.tsx (activeModule === 'tasks')     │
│                                                                        │
│  ┌───────────────────────────────┐  ┌───────────────────────────────┐  │
│  │   Left 58%: TasksPanel.tsx    │  │   Right 42%: MemoBoard.tsx    │  │
│  │  • Quick Task Input Bar       │  │  • + New Memo Header Action   │  │
│  │  • Filter Capsules (All/Today)│  │  • Translucent Glass Cards    │  │
│  │  • Priority Dot Color Toggles │  │  • In-place Markdown/Text     │  │
│  │  • Checkbox Tactile Animation │  │  • Pinning (Priority Sorting) │  │
│  │  • Clean Completed Tasks      │  │  • Copy to Clipboard & Themes │  │
│  └──────────────┬────────────────┘  └──────────────┬────────────────┘  │
│                 │                                  │                   │
│                 ▼                                  ▼                   │
│        useTasksState() Hook               useMemosState() Hook         │
│                 │                                  │                   │
│                 └─────────────────┬────────────────┘                   │
│                                   ▼                                    │
│                 localStorage (Local-First Engine)                      │
│                 - selfwork_tasks_data                                  │
│                 - selfwork_memos_data                                  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Component Design & Directory Structure

```text
src/
  ├── types/
  │     └── tasks.ts                  <-- TaskItem, MemoItem, Priority, Theme interfaces
  ├── components/
  │     ├── tasks/
  │     │     ├── TasksPanel.tsx       <-- Left tasks manager & filter list
  │     │     ├── MemoBoard.tsx        <-- Right sticky memo board
  │     │     └── initialData.ts       <-- Clean default onboarding tasks and memos
  │     ├── TasksView.tsx              <-- Dual-column orchestrator
  │     └── SlotContainer.tsx          <-- Mounted when activeModule === 'tasks'
```

---

## 3. UI/UX Interaction & Aesthetic Details

1. **Stationary Tactile Mechanics**:
   - Checkbox clicks trigger border illumination and line strikethrough without card resizing;
   - Micro-dots for priority:
     - High (`p1`): `bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.6)]`
     - Medium (`p2`): `bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.6)]`
     - Low (`p3`): `bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]`
2. **Memo Card Aesthetics**:
   - Backgrounds utilize 5 refined dark crystal tints:
     - `neutral`: `rgba(255,255,255,0.03)`
     - `blue`: `rgba(56,189,248,0.06)`
     - `emerald`: `rgba(52,211,153,0.06)`
     - `purple`: `rgba(168,85,247,0.06)`
     - `amber`: `rgba(245,158,11,0.06)`
   - Hover reveals actions: Pin (📌), Theme selector, Copy (📋), Delete (🗑️).
3. **Zero AI-Slop & Radical Text Economy**:
   - No placeholder sentences like "No tasks here, click to create one!";
   - Clean, direct iconography with compact counts.
