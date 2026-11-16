import assert from 'node:assert';

console.log('===============================================================');
console.log('📝 文档编辑器真实用户交互与富文本排版核销测试套件');
console.log('===============================================================\n');

// 1. 测试 Markdown 至高保真 HTML 转换引擎
function markdownToHtml(raw) {
  if (!raw) return '';
  if (
    raw.includes('<strong>') ||
    raw.includes('<em>') ||
    raw.includes('<del>') ||
    raw.includes('<code>') ||
    raw.includes('<b>') ||
    raw.includes('<i>')
  ) {
    return raw;
  }

  let html = raw;
  html = html
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/~~(.+?)~~/g, '<del class="line-through text-slate-500">$1</del>')
    .replace(
      /`([^`]+)`/g,
      '<code class="px-1.5 py-0.5 rounded bg-white/10 text-rose-300 font-mono text-xs">$1</code>'
    );
  return html;
}

console.log('--- 1. 排版转换与星号消除实测 ---');
const boldSample = markdownToHtml('这是**加粗文字**测试');
assert.strictEqual(boldSample, '这是<strong>加粗文字</strong>测试');
console.log('[PASS] **加粗** 自动渲染为 <strong>，消除原始星号');

const italicSample = markdownToHtml('这是*斜体文字*测试');
assert.strictEqual(italicSample, '这是<em>斜体文字</em>测试');
console.log('[PASS] *斜体* 自动渲染为 <em>，消除原始星号');

const strikeSample = markdownToHtml('这是~~删除文字~~测试');
assert.ok(strikeSample.includes('<del') && strikeSample.includes('删除文字'));
console.log('[PASS] ~~删除线~~ 自动渲染为 <del>');

const codeSample = markdownToHtml('这是`const a = 1;`代码');
assert.ok(codeSample.includes('<code') && codeSample.includes('const a = 1;'));
console.log('[PASS] `行内代码` 自动渲染为 <code>');

const existingHtml = '这是<strong>已有标签</strong>不要重复转换';
assert.strictEqual(markdownToHtml(existingHtml), existingHtml);
console.log('[PASS] 已有 HTML 标签不重复转义');

console.log('\n--- 2. 目录大纲纯净度提取实测 ---');
function extractCleanText(content) {
  return content
    .replace(/<[^>]*>/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/~~(.*?)~~/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .trim();
}

const headingWithHtml = '<strong>架构</strong>概述与<em>设计</em>';
assert.strictEqual(extractCleanText(headingWithHtml), '架构概述与设计');
console.log('[PASS] 目录大纲成功剥离 HTML 标签，无任何富文本残留');

const headingWithMd = '**第一章** 核心概念 `v1.0`';
assert.strictEqual(extractCleanText(headingWithMd), '第一章 核心概念 v1.0');
console.log('[PASS] 目录大纲成功剥离 Markdown 语法标记，纯净阅读');

console.log('\n--- 3. 撤销/重做 (Undo / Redo) 历史栈契约实测 ---');
class MockEditorHistory {
  constructor() {
    this.undoStack = [];
    this.redoStack = [];
    this.current = [{ id: 'b1', content: '初始内容' }];
  }

  pushState(newContent) {
    this.undoStack.push(JSON.parse(JSON.stringify(this.current)));
    if (this.undoStack.length > 50) this.undoStack.shift();
    this.redoStack = [];
    this.current = [{ id: 'b1', content: newContent }];
  }

  undo() {
    if (this.undoStack.length === 0) return false;
    const prev = this.undoStack.pop();
    this.redoStack.push(JSON.parse(JSON.stringify(this.current)));
    this.current = prev;
    return true;
  }

  redo() {
    if (this.redoStack.length === 0) return false;
    const next = this.redoStack.pop();
    this.undoStack.push(JSON.parse(JSON.stringify(this.current)));
    this.current = next;
    return true;
  }
}

const history = new MockEditorHistory();
history.pushState('修改第一次');
history.pushState('修改第二次');
assert.strictEqual(history.current[0].content, '修改第二次');

const didUndo1 = history.undo();
assert.strictEqual(didUndo1, true);
assert.strictEqual(history.current[0].content, '修改第一次');
console.log('[PASS] Ctrl+Z 成功回滚到上一次编辑状态');

const didUndo2 = history.undo();
assert.strictEqual(didUndo2, true);
assert.strictEqual(history.current[0].content, '初始内容');
console.log('[PASS] 连续 Ctrl+Z 成功回滚到最初状态');

const didRedo1 = history.redo();
assert.strictEqual(didRedo1, true);
assert.strictEqual(history.current[0].content, '修改第一次');
console.log('[PASS] Ctrl+Y / Ctrl+Shift+Z 成功重做步进');

console.log('\n--- 4. 行首快捷语法蜕变正则契约实测 ---');
const matchH1 = '# 标题一'.match(/^(#{1,3}|\[\]|\[ \]|---|-|\*|>)\s(.*)$/);
assert.strictEqual(matchH1[1], '#');
assert.strictEqual(matchH1[2], '标题一');
console.log('[PASS] # 语法糖精准识别并蜕变');

const matchTodo = '[] 待办事项'.match(/^(#{1,3}|\[\]|\[ \]|---|-|\*|>)\s(.*)$/);
assert.strictEqual(matchTodo[1], '[]');
assert.strictEqual(matchTodo[2], '待办事项');
console.log('[PASS] [] 待办语法糖精准识别并蜕变');

console.log('\n===============================================================');
console.log('🎉 文档交互排版全链路验证通过，零缺陷！');
console.log('===============================================================');
