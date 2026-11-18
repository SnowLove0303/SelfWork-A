import fs from 'fs';
import path from 'path';
import assert from 'assert';

const ROOT = 'F:/App Location/SelfWork';

console.log('=== [OrbitStack L4 Witness] Image, Shortcuts & Alignment Test Suite ===\n');

// Test 1: docs.ts
console.log('[Test 1] Verifying src/types/docs.ts for BlockType & format.textAlign...');
const docsTs = fs.readFileSync(path.join(ROOT, 'src/types/docs.ts'), 'utf-8');
assert(docsTs.includes("| 'image'"), "BlockType must include 'image'");
assert(docsTs.includes("textAlign?: 'left' | 'center' | 'right'"), "DocBlock.format must support textAlign");
console.log('  -> PASS: docs.ts verified.');

// Test 2: SlashMenu.tsx
console.log('[Test 2] Verifying src/components/docs/editor/SlashMenu.tsx...');
const slashMenuTsx = fs.readFileSync(path.join(ROOT, 'src/components/docs/editor/SlashMenu.tsx'), 'utf-8');
assert(slashMenuTsx.includes('Image as ImageIcon'), "Must import Image as ImageIcon");
assert(slashMenuTsx.includes("type: 'image'"), "SLASH_MENU_ITEMS must have 'image'");
assert(slashMenuTsx.includes("label: '图片'"), "SLASH_MENU_ITEMS must have label '图片'");
console.log('  -> PASS: SlashMenu.tsx verified.');

// Test 3: FloatingFormatToolbar.tsx
console.log('[Test 3] Verifying src/components/docs/editor/FloatingFormatToolbar.tsx...');
const toolbarTsx = fs.readFileSync(path.join(ROOT, 'src/components/docs/editor/FloatingFormatToolbar.tsx'), 'utf-8');
assert(toolbarTsx.includes('AlignLeft') && toolbarTsx.includes('AlignCenter') && toolbarTsx.includes('AlignRight'), "Must import AlignLeft, AlignCenter, AlignRight");
assert(toolbarTsx.includes("onApplyAlign?: (align: 'left' | 'center' | 'right') => void"), "Props must include onApplyAlign");
assert(toolbarTsx.includes("onApplyAlign?.('left')"), "Must invoke onApplyAlign with 'left'");
assert(toolbarTsx.includes("onApplyAlign?.('center')"), "Must invoke onApplyAlign with 'center'");
assert(toolbarTsx.includes("onApplyAlign?.('right')"), "Must invoke onApplyAlign with 'right'");
console.log('  -> PASS: FloatingFormatToolbar.tsx verified.');

// Test 4: markdownExport.ts
console.log('[Test 4] Verifying src/services/markdownExport.ts...');
const exportTs = fs.readFileSync(path.join(ROOT, 'src/services/markdownExport.ts'), 'utf-8');
assert(exportTs.includes("case 'image':"), "Must have case 'image'");
assert(exportTs.includes("lines.push(`![${block.properties?.caption || 'image'}](${block.properties?.src || ''})`, '');"), "Must export image in Markdown format");
console.log('  -> PASS: markdownExport.ts verified.');

// Test 5: BlockItem.tsx
console.log('[Test 5] Verifying src/components/docs/editor/BlockItem.tsx...');
const blockItemTsx = fs.readFileSync(path.join(ROOT, 'src/components/docs/editor/BlockItem.tsx'), 'utf-8');
// 5.1 Regex for 1.
assert(blockItemTsx.includes('/^(#{1,3}|\\[\\]|\\[ \\]|---|-|\\*|>|1\\.)\\s(.*)$/'), "Must match 1. with regex");
assert(blockItemTsx.includes("else if (trigger === '1.') nextType = 'numbered';"), "Must set nextType = 'numbered' on 1.");

// 5.2 Shorthand >>
assert(blockItemTsx.includes("if (rawText.startsWith('>> '))"), "Must match >> shorthand");
assert(blockItemTsx.includes("nextType = 'toggle'") || blockItemTsx.includes("onUpdate(rest, 'toggle'"), "Must convert to toggle block");

// 5.3 markdownToHtml ==highlight==
assert(blockItemTsx.includes('/==([^=]+)==/g'), "markdownToHtml must replace ==highlight==");
assert(blockItemTsx.includes('background:#FFD93D40'), "mark must have yellow highlight background");

// 5.4 Image block rendering
assert(blockItemTsx.includes("if (block.blockType === 'image')"), "Must have dedicated image block renderer");
assert(blockItemTsx.includes("点击上传本地图片"), "Must have local image upload button");
assert(blockItemTsx.includes("readAsDataURL"), "Must convert local image to base64");
assert(blockItemTsx.includes("max-h-[500px]"), "Image must have max-h-[500px]");
assert(blockItemTsx.includes("rounded-xl"), "Image must be rounded-xl");
assert(blockItemTsx.includes("caption"), "Image block must support caption");
assert(blockItemTsx.includes("更换"), "Must have replace capsule");
assert(blockItemTsx.includes("删除"), "Must have delete capsule");

// 5.5 Alignment
assert(blockItemTsx.includes("handleApplyAlign = (align: 'left' | 'center' | 'right')"), "Must define handleApplyAlign");
assert(blockItemTsx.includes("textAlign: (block.format?.textAlign as any) || 'left'") || blockItemTsx.includes("style={{ textAlign: align }}"), "Must apply textAlign from block.format");
assert(blockItemTsx.includes("onApplyAlign={handleApplyAlign}"), "Must pass onApplyAlign to FloatingFormatToolbar");

console.log('  -> PASS: BlockItem.tsx verified.');

console.log('\n================================================================');
console.log('All Image, Shortcuts & Alignment Tests Passed! Exit 0.');
console.log('================================================================');
