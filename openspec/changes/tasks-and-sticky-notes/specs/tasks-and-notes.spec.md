# Specification: Tasks & Sticky Notes Dual-Column Workspace

## 1. Domain Data Models

### 1.1 Task Model (`TaskItem`)
```typescript
export type TaskPriority = 'p1' | 'p2' | 'p3'; // p1: 高 (红), p2: 中 (黄), p3: 低 (绿)
export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface TaskItem {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  isToday?: boolean;
  dueDate?: string; // YYYY-MM-DD
  createdAt: number; // Unix timestamp ms
  completedAt?: number;
}
```

### 1.2 Sticky Note Model (`MemoItem`)
```typescript
export type MemoTheme = 'neutral' | 'blue' | 'emerald' | 'purple' | 'amber';

export interface MemoItem {
  id: string;
  title?: string;
  content: string;
  isPinned: boolean;
  theme: MemoTheme;
  createdAt: number;
  updatedAt: number;
}
```

---

## 2. Left Tasks Workspace Specification

### 2.1 Fast Input & Creation
- The task list SHALL feature an input box at the top with placeholder: `+ 快速添加待办任务，按 Enter 键保存...`.
- WHEN the user presses `Enter` with non-empty text:
  - A new `TaskItem` with default priority `p2` and status `todo` SHALL be prepended to the task list.
  - The input field SHALL be cleared immediately.

### 2.2 Status & Transition
- Clicking the task checkbox SHALL toggle status:
  - From `todo` / `in_progress` to `done`.
  - From `done` back to `todo`.
- Completed items SHALL be visually dimmed with strikethrough text and moved to a collapsible or separated "已完成" section.
- Clicking the priority dot SHALL cycle through `p1` -> `p2` -> `p3`.

### 2.3 Filter Capsules
- The top filter bar SHALL support:
  - `all` (全部): shows all uncompleted + completed.
  - `today` (今日): filters items marked for today or due today.
  - `pending` (待办): shows `todo` and `in_progress`.
  - `done` (已完成): shows completed tasks.

---

## 3. Right Sticky Memo Board Specification

### 3.1 Memo Card Management
- Clicking `+ 新建便签` SHALL create an empty memo at the top of the board.
- The memo card SHALL support:
  - Title input (optional, bold font).
  - Multi-line textarea for content with auto-expanding height.
  - Pin toggle button (Pinned memos SHALL always precede unpinned memos).
  - Theme selector (cycles through subtle dark translucent tints).
  - Copy button: copies memo content to clipboard with instant Tooltip feedback.
  - Delete button: removes the memo card with subtle fade out.

---

## 4. Local-First Persistence & Storage Contract

- Tasks SHALL be serialized to `localStorage` key `selfwork_tasks_data`.
- Memos SHALL be serialized to `localStorage` key `selfwork_memos_data`.
- If keys are missing on bootstrap, the system SHALL seed sensible initial onboarding items so the UI is immediately alive and self-explanatory.
- Storage writes SHALL be debounced within 300ms.

---

## 5. Invariants & Aesthetics

- The view SHALL follow the split ratio: Left Tasks ~58%, Right Memos ~42%.
- Background blur, custom wallpaper, and opacity settings from `SettingsView` SHALL pass through seamlessly.
- Typography and tactile buttons SHALL follow WCAG 2.2 AA and stationary click physics.
