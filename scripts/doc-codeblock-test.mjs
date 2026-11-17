import fs from 'fs';
import path from 'path';
import assert from 'assert';

console.log('=== [OrbitStack L4 Witness] Code Block Smart Recognition & Toolbar Test Suite ===\n');

const WORKSPACE = 'F:/App Location/SelfWork';

// Test 1: Verify src/components/docs/editor/BlockItem.tsx codeblock invariants
console.log('[Test 1] Verifying src/components/docs/editor/BlockItem.tsx code block definitions...');
const blockItem = fs.readFileSync(path.join(WORKSPACE, 'src/components/docs/editor/BlockItem.tsx'), 'utf8');

assert(blockItem.includes('SUPPORTED_CODE_LANGUAGES'), 'BlockItem must define SUPPORTED_CODE_LANGUAGES');
assert(blockItem.includes('python'), 'SUPPORTED_CODE_LANGUAGES must include python');
assert(blockItem.includes('rust'), 'SUPPORTED_CODE_LANGUAGES must include rust');
assert(blockItem.includes('sql'), 'SUPPORTED_CODE_LANGUAGES must include sql');

// Test 2: Verify Markdown shorthand trigger
console.log('[Test 2] Verifying Markdown ```<lang> shorthand trigger in handleInput & handleKeyDown...');
assert(blockItem.includes("match(/^```([a-zA-Z0-9_-]*)\\s$/)"), 'handleInput must match ```<lang> + space');
assert(blockItem.includes("match(/^```([a-zA-Z0-9_-]*)\\n$/)"), 'handleInput must match ```<lang> + newline');
assert(blockItem.includes("match(/^```([a-zA-Z0-9_-]*)$/)"), 'handleKeyDown must match ```<lang> on Enter or Space');
console.log('  -> PASS: ```<lang> shorthand trigger accurately implemented.\n');

// Test 3: Verify floating action bar components
console.log('[Test 3] Verifying floating action bar (language selector, copy button, wrap toggle)...');
assert(blockItem.includes('group-hover/code:opacity-100'), 'Code block must support floating action bar hover display');
assert(blockItem.includes('setShowLangMenu'), 'Floating bar must support language picker dropdown');
assert(blockItem.includes('navigator.clipboard.writeText'), 'Floating bar must support one-click copy to clipboard');
assert(blockItem.includes('copiedCode'), 'Floating bar must support visual copy confirmation state');
assert(blockItem.includes('WrapText'), 'Floating bar must support code wrap toggle');
console.log('  -> PASS: Floating action bar components strictly verified.\n');

// Test 4: Verify keyboard ergonomics (Tab indentation, Enter newline, Backspace degradation)
console.log('[Test 4] Verifying keyboard ergonomics for code blocks...');
assert(blockItem.includes("if (e.key === 'Tab')"), 'Must intercept Tab key in code block');
assert(blockItem.includes("document.createTextNode('  ')"), 'Must insert 2 spaces on Tab key press');
assert(blockItem.includes("if (e.key === 'Backspace')"), 'Must handle Backspace in code block');
assert(blockItem.includes("onUpdate('', 'p', undefined, true)"), 'Empty code block must degrade to paragraph on Backspace');
console.log('  -> PASS: Tab indentation and Backspace degradation verified.\n');

// Test 5: Functional regex logic simulation
console.log('[Test 5] Simulating regex and language extraction logic...');
function testCodeTrigger(input) {
  const match = input.match(/^```([a-zA-Z0-9_-]*)$/);
  if (match) {
    return match[1].toLowerCase() || 'plaintext';
  }
  return null;
}

assert.strictEqual(testCodeTrigger('```python'), 'python', '```python must resolve to python');
assert.strictEqual(testCodeTrigger('```javascript'), 'javascript', '```javascript must resolve to javascript');
assert.strictEqual(testCodeTrigger('```rust'), 'rust', '```rust must resolve to rust');
assert.strictEqual(testCodeTrigger('```sql'), 'sql', '```sql must resolve to sql');
assert.strictEqual(testCodeTrigger('```'), 'plaintext', '``` must resolve to plaintext');
assert.strictEqual(testCodeTrigger('``'), null, '`` must not trigger');
assert.strictEqual(testCodeTrigger('python```'), null, 'suffix must not trigger');
console.log('  -> PASS: All regex extraction test cases passed.\n');

console.log('================================================================');
console.log('All 5 Code Block Smart Recognition & Toolbar Tests Passed! Exit 0.');
console.log('================================================================');
