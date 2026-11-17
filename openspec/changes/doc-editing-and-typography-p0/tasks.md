# Tasks: Implement Document Editing and Typography (Phase 1: P0)

## 1. Type Models & Slash Menu Expansion

- [x] 1.1 Extend `BlockType` in `src/types/docs.ts` to include `'toggle'` and verify type check via `pnpm run check`
- [x] 1.2 Register toggle block item in `src/components/docs/editor/SlashMenu.tsx` with icon and description

## 2. Markdown Shortcuts Auto-Conversion

- [x] 2.1 Implement prefix interceptor in `src/components/docs/editor/BlockItem.tsx` for `#`, `##`, `###`, `>`, `-`, `*`, `1.`, `[]`, and `---`
- [x] 2.2 Verify prefix strip and block type mutation behavior via manual and type checks

## 3. Text Color & Highlight Palette

- [x] 3.1 Design and embed text color and background highlight picker in `src/components/docs/editor/FloatingFormatToolbar.tsx`
- [x] 3.2 Implement format applying logic with range preservation and clear formatting handler

## 4. Toggle Collapsible Block Implementation

- [x] 4.1 Implement toggle block UI with interactive chevron, expansion state, and persistence in `src/components/docs/editor/BlockItem.tsx`
- [x] 4.2 Verify toggle state persistence across reloads

## 5. Outline Navigation & Document Statistics

- [x] 5.1 Implement live reading stats calculator (Chinese characters, words, reading time) in `src/components/docs/editor/BlockEditor.tsx`
- [x] 5.2 Enhance outline navigation with smooth scrolling and highlight feedback in `src/components/docs/editor/BlockEditor.tsx`

## 6. End-to-End Verification & Quality Gate

- [x] 6.1 Execute `pnpm run check` and verify exit code 0 with zero errors and zero warnings
- [x] 6.2 Execute `pnpm run build` and verify production bundle generates with exit code 0
- [x] 6.3 Compile 1:1 bidirectional verification matrix and deliver completion report
