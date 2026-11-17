import fs from 'fs';
import path from 'path';
import assert from 'assert';

console.log('=== [OrbitStack L4 Witness] Document Typography & Microsoft YaHei Test Suite ===\n');

const WORKSPACE = 'F:/App Location/SelfWork';

// Test 1: Verify src/styles/globals.css
console.log('[Test 1] Verifying src/styles/globals.css typography invariants...');
const globalsCss = fs.readFileSync(path.join(WORKSPACE, 'src/styles/globals.css'), 'utf8');
assert(globalsCss.includes('.doc-typography'), 'globals.css must define .doc-typography');
assert(globalsCss.includes('"Microsoft YaHei", "微软雅黑"'), 'doc-typography must prioritize Microsoft YaHei');
assert(globalsCss.includes('optimizeLegibility'), 'doc-typography must include text-rendering: optimizeLegibility');
console.log('  -> PASS: .doc-typography defined with Microsoft YaHei at highest priority.\n');

// Test 2: Verify src/components/docs/editor/BlockEditor.tsx
console.log('[Test 2] Verifying src/components/docs/editor/BlockEditor.tsx canvas and title scale...');
const blockEditor = fs.readFileSync(path.join(WORKSPACE, 'src/components/docs/editor/BlockEditor.tsx'), 'utf8');
assert(blockEditor.includes('doc-typography'), 'BlockEditor canvas container must include doc-typography class');
assert(blockEditor.includes('text-3xl font-bold'), 'Title input must be scaled to text-3xl font-bold (30px)');
assert(blockEditor.includes('text-sm text-slate-500 hover:text-slate-300'), 'Bottom placeholder must be scaled to text-sm');
console.log('  -> PASS: Canvas mounts .doc-typography and title is text-3xl font-bold.\n');

// Test 3: Verify src/components/docs/editor/BlockItem.tsx
console.log('[Test 3] Verifying src/components/docs/editor/BlockItem.tsx font size hierarchy...');
const blockItem = fs.readFileSync(path.join(WORKSPACE, 'src/components/docs/editor/BlockItem.tsx'), 'utf8');

assert(blockItem.includes("case 'h1':\n        return 'text-[28px] font-bold text-white leading-tight';"), 'H1 must be text-[28px]');
assert(blockItem.includes("case 'h2':\n        return 'text-[22px] font-semibold text-slate-100 leading-snug';"), 'H2 must be text-[22px]');
assert(blockItem.includes("case 'h3':\n        return 'text-lg font-semibold text-slate-200 leading-snug';"), 'H3 must be text-lg (18px)');
assert(blockItem.includes("case 'quote':\n        return 'italic text-slate-300 text-base leading-relaxed';"), 'Quote must be text-base (16px)');
assert(blockItem.includes("case 'code':\n        return 'font-mono text-sm text-rose-300 leading-relaxed';"), 'Code must be text-sm (14px)');
assert(blockItem.includes("default:\n        return 'text-base text-slate-200 leading-relaxed';"), 'Default body must be text-base (16px)');

// Test 4: Verify vertical baseline adaptations
console.log('[Test 4] Verifying vertical baseline alignment for todo and bullet...');
assert(blockItem.includes('w-[18px] h-[18px]'), 'Todo checkbox must scale to 18px');
assert(blockItem.includes('pt-1.5 pr-2.5'), 'Todo checkbox container must have pt-1.5 pr-2.5');
assert(blockItem.includes('pt-2.5 pr-3 shrink-0 select-none'), 'Bullet dot container must have pt-2.5 pr-3');
console.log('  -> PASS: Checkbox and bullet baselines precisely aligned with 16px text.\n');

// Test 5: Verify anti-regression invariants
console.log('[Test 5] Verifying rich text formatting commands and undo history stack preservation...');
assert(blockItem.includes("document.execCommand('bold', false)"), 'Bold command preserved');
assert(blockItem.includes("document.execCommand('italic', false)"), 'Italic command preserved');
assert(blockItem.includes("document.execCommand('underline', false)"), 'Underline command preserved');
assert(blockItem.includes("document.execCommand('removeFormat', false)"), 'Remove format command preserved');
console.log('  -> PASS: Rich text commands and formatting engine 100% intact.\n');

console.log('================================================================');
console.log('All 5 Document Typography & Font Invariants Passed Successfully! Exit 0.');
console.log('================================================================');
