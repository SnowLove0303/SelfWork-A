#!/usr/bin/env node
/**
 * Doc Editor Dedicated MCP & Automation Test Harness
 * 专注文档编辑原子操作的 MCP 服务与自动化测试工具
 */

import fs from 'node:fs';
import path from 'node:path';

// 1. Markdown 语法糖与行首蜕变模拟器
export function simulateMarkdownSugaring(input) {
  if (input === '---') return { transformed: true, blockType: 'divider', content: '' };

  const match = input.match(/^(#{1,3}|\[\]|\[ \]|---|-|\*|>)\s?(.*)$/);
  if (!match) return { transformed: false, blockType: 'p', content: input };

  const trigger = match[1];
  const rest = match[2];

  if (trigger === '#') return { transformed: true, blockType: 'h1', content: rest };
  if (trigger === '##') return { transformed: true, blockType: 'h2', content: rest };
  if (trigger === '###') return { transformed: true, blockType: 'h3', content: rest };
  if (trigger === '[]' || trigger === '[ ]') return { transformed: true, blockType: 'todo', content: rest };
  if (trigger === '-' || trigger === '*') return { transformed: true, blockType: 'bullet', content: rest };
  if (trigger === '>') return { transformed: true, blockType: 'quote', content: rest };
  if (trigger === '---') return { transformed: true, blockType: 'divider', content: '' };

  return { transformed: false, blockType: 'p', content: input };
}

// 2. 选区切片与富文本格式包裹器
export function applyFormatToSelection(content, start, end, format, value) {
  if (start >= end) return content;
  const before = content.slice(0, start);
  const selected = content.slice(start, end);
  const after = content.slice(end);

  if (format === 'clear') {
    const cleaned = selected
      .replace(/^\*\*|\*\*$/g, '')
      .replace(/^\*|\*$/g, '')
      .replace(/^~~|~~$/g, '')
      .replace(/^`|`$/g, '')
      .replace(/<[^>]*>/g, '');
    return before + cleaned + after;
  }

  if (format === 'bold') {
    const wrap = '**';
    if (selected.startsWith(wrap) && selected.endsWith(wrap) && selected.length >= 4) {
      return before + selected.slice(2, -2) + after;
    }
    return before + wrap + selected + wrap + after;
  }

  if (format === 'italic') {
    const wrap = '*';
    if (selected.startsWith(wrap) && selected.endsWith(wrap) && selected.length >= 2) {
      return before + selected.slice(1, -1) + after;
    }
    return before + wrap + selected + wrap + after;
  }

  if (format === 'strike') {
    const wrap = '~~';
    if (selected.startsWith(wrap) && selected.endsWith(wrap) && selected.length >= 4) {
      return before + selected.slice(2, -2) + after;
    }
    return before + wrap + selected + wrap + after;
  }

  if (format === 'code') {
    const wrap = '`';
    if (selected.startsWith(wrap) && selected.endsWith(wrap) && selected.length >= 2) {
      return before + selected.slice(1, -1) + after;
    }
    return before + wrap + selected + wrap + after;
  }

  if (format === 'color') {
    if (value === 'default') {
      const cleaned = selected.replace(/<span class="text-[^"]+">([\s\S]*?)<\/span>/g, '$1');
      return before + cleaned + after;
    }
    const colorMap = {
      rose: 'text-rose-400',
      orange: 'text-amber-500',
      yellow: 'text-yellow-300',
      green: 'text-emerald-400',
      sky: 'text-sky-400',
      purple: 'text-purple-400',
    };
    const cls = colorMap[value] || 'text-slate-100';
    return before + `<span class="${cls}">${selected}</span>` + after;
  }

  if (format === 'highlight') {
    if (value === 'none') {
      const cleaned = selected.replace(/<mark class="[^"]+">([\s\S]*?)<\/mark>/g, '$1');
      return before + cleaned + after;
    }
    const bgMap = {
      yellow: 'bg-yellow-400/20 text-yellow-200 border-b border-yellow-400/60 px-1 py-0.5 rounded',
      green: 'bg-emerald-400/20 text-emerald-200 border-b border-emerald-400/60 px-1 py-0.5 rounded',
      sky: 'bg-sky-400/20 text-sky-200 border-b border-sky-400/60 px-1 py-0.5 rounded',
      rose: 'bg-rose-400/20 text-rose-200 border-b border-rose-400/60 px-1 py-0.5 rounded',
      purple: 'bg-purple-400/20 text-purple-200 border-b border-purple-400/60 px-1 py-0.5 rounded',
    };
    const cls = bgMap[value] || '';
    return before + `<mark class="${cls}">${selected}</mark>` + after;
  }

  return content;
}

// 3. 块类型转换模拟器
export function simulateTurnInto(content, fromType, toType, properties = {}) {
  const newProps = { ...properties };
  if (toType === 'todo' && newProps.checked === undefined) {
    newProps.checked = false;
  }
  return {
    content,
    blockType: toType,
    properties: newProps,
  };
}

// 4. 自检套件执行 (Self-Test Suite)
export function runSelfTest() {
  console.log('=== Running Doc Editor MCP Verification Suite ===');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      passed++;
      console.log(`[PASS] ${message}`);
    } else {
      failed++;
      console.error(`[FAIL] ${message}`);
    }
  }

  // Test 1: Markdown Sugaring
  assert(simulateMarkdownSugaring('# 架构设计').blockType === 'h1', 'H1 Sugaring matches');
  assert(simulateMarkdownSugaring('## 二级模块').blockType === 'h2', 'H2 Sugaring matches');
  assert(simulateMarkdownSugaring('### 三级核心').blockType === 'h3', 'H3 Sugaring matches');
  assert(simulateMarkdownSugaring('[] 待办事项').blockType === 'todo', 'Todo Sugaring matches');
  assert(simulateMarkdownSugaring('- 列表项').blockType === 'bullet', 'Bullet Sugaring matches');
  assert(simulateMarkdownSugaring('> 引用文本').blockType === 'quote', 'Quote Sugaring matches');
  assert(simulateMarkdownSugaring('---').blockType === 'divider', 'Divider Sugaring matches');

  // Test 2: Formatting Slicing
  const text = 'Hello world from SelfWork';
  // wrap "world" (start=6, end=11) with bold
  const bolded = applyFormatToSelection(text, 6, 11, 'bold');
  assert(bolded === 'Hello **world** from SelfWork', 'Bold wrapping is exact');

  // Toggle bold unwraps
  const unbolded = applyFormatToSelection(bolded, 6, 15, 'bold');
  assert(unbolded === 'Hello world from SelfWork', 'Bold toggle unwraps cleanly');

  // Test 3: Highlight wrapping
  const highlighted = applyFormatToSelection(text, 0, 5, 'highlight', 'yellow');
  assert(highlighted.includes('<mark class="bg-yellow-400/20'), 'Highlight markup wrapped');

  // Test 4: Clear formatting
  const cleared = applyFormatToSelection(highlighted, 0, highlighted.indexOf('</mark>') + 7, 'clear');
  assert(cleared.startsWith('Hello world'), 'Clear formatting restores plain text');

  // Test 5: Turn Into
  const turned = simulateTurnInto('我的核心结论', 'p', 'h1');
  assert(turned.blockType === 'h1' && turned.content === '我的核心结论', 'Turn into preserves content 100%');

  const todoTurned = simulateTurnInto('完成审计报告', 'p', 'todo');
  assert(todoTurned.blockType === 'todo' && todoTurned.properties.checked === false, 'Turn into todo initializes checked property');

  console.log(`\nVerification complete: ${passed} passed, ${failed} failed.`);
  return failed === 0;
}

// 5. 命令行启动
if (process.argv.includes('--test') || !process.argv.includes('--mcp')) {
  const success = runSelfTest();
  process.exit(success ? 0 : 1);
}
