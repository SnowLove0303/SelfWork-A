/**
 * SelfWork 文档中心代码块专业暗色语法着色与光标保护引擎
 * 参考 GitHub Dark 与 VS Code 工业级代码块高质感配色标准
 */

export interface CaretPosition {
  start: number;
  end: number;
}

export const TOKEN_COLORS: Record<string, string> = {
  keyword: 'text-purple-400 font-medium',       // 关键字（紫罗兰，如 const/def/if/return）
  string: 'text-emerald-300',                   // 字符串（自然柔和薄荷绿）
  comment: 'text-slate-500 italic',             // 注释（石墨灰斜体）
  number: 'text-amber-300 font-mono',           // 数字/常量（琥珀色）
  builtin: 'text-sky-300',                      // 内置函数/核心API（天蓝）
  constant: 'text-amber-300 font-medium',       // 常量/布尔值（True/false/None）
  function: 'text-blue-300',                    // 自定义函数/方法名（蔚蓝）
  type: 'text-teal-300 font-medium',            // 类型/类名（青绿）
  operator: 'text-slate-400',                   // 运算符/标点
  variable: 'text-slate-200',                   // 变量标识符（舒适中性浅白）
  key: 'text-sky-300 font-medium',              // 键名（JSON属性）
  tag: 'text-rose-400 font-medium',             // HTML/XML 标签名
  attr: 'text-amber-200',                       // 属性名
};

export interface TokenRule {
  type: string;
  regex: RegExp;
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export const LANGUAGE_RULES: Record<string, TokenRule[]> = {
  python: [
    { type: 'comment', regex: /#.*$/m },
    { type: 'string', regex: /"""[\s\S]*?"""|'''[\s\S]*?'''|f?"(?:\\.|[^"\\])*"|f?'(?:\\.|[^'\\])*'|r"(?:\\.|[^"\\])*"|r'(?:\\.|[^'\\])*'/ },
    { type: 'constant', regex: /\b(True|False|None)\b/ },
    { type: 'keyword', regex: /\b(def|class|if|elif|else|for|while|try|except|finally|with|as|import|from|return|yield|raise|break|continue|pass|lambda|global|nonlocal|assert|del|in|is|and|or|not|async|await|match|case)\b/ },
    { type: 'builtin', regex: /\b(print|len|range|str|int|float|bool|list|dict|set|tuple|type|open|enumerate|zip|map|filter|sum|min|max|sorted|any|all|isinstance|issubclass|super|input|abs|round|id|repr|self|cls)\b/ },
    { type: 'number', regex: /\b0x[0-9a-fA-F]+\b|\b\d+(\.\d+)?([eE][+-]?\d+)?\b/ },
    { type: 'function', regex: /\b[a-zA-Z_]\w*(?=\s*\()/ },
    { type: 'operator', regex: /[-+*\/%=&|<>!^~]+/ },
  ],
  javascript: [
    { type: 'comment', regex: /\/\/.*$|\/\*[\s\S]*?\*\//m },
    { type: 'string', regex: /`(?:\\.|[^`\\])*`|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/ },
    { type: 'constant', regex: /\b(true|false|null|undefined|NaN|Infinity)\b/ },
    { type: 'keyword', regex: /\b(const|let|var|function|return|if|else|switch|case|default|break|continue|while|do|for|in|of|try|catch|finally|throw|new|typeof|instanceof|void|delete|await|async|yield|import|export|from|as|class|extends|super|this|interface|type|enum|implements|public|private|protected|static|readonly|abstract)\b/ },
    { type: 'builtin', regex: /\b(console|window|document|Math|JSON|Promise|Array|Object|String|Number|Boolean|Set|Map|RegExp|Error|Symbol|Date|setTimeout|clearTimeout|setInterval|clearInterval)\b/ },
    { type: 'type', regex: /\b(any|boolean|number|string|void|never|unknown)\b/ },
    { type: 'number', regex: /\b0x[0-9a-fA-F]+\b|\b\d+(\.\d+)?([eE][+-]?\d+)?\b/ },
    { type: 'function', regex: /\b[a-zA-Z_$][\w$]*(?=\s*\()/ },
    { type: 'operator', regex: /[-+*\/%=&|<>!^~?:]+/ },
  ],
  typescript: [], // populated below
  rust: [
    { type: 'comment', regex: /\/\/.*$|\/\*[\s\S]*?\*\//m },
    { type: 'string', regex: /b?"(?:\\.|[^"\\])*"|b?'(?:\\.|[^'\\])*'/ },
    { type: 'constant', regex: /\b(true|false)\b/ },
    { type: 'keyword', regex: /\b(fn|let|mut|const|static|if|else|match|loop|while|for|in|return|break|continue|struct|enum|trait|impl|type|pub|mod|use|as|crate|super|self|Self|unsafe|where|async|await|dyn|move|ref)\b/ },
    { type: 'type', regex: /\b(i8|i16|i32|i64|i128|isize|u8|u16|u32|u64|u128|usize|f32|f64|bool|char|str|String|Vec|Option|Result|Some|None|Ok|Err|Box|Rc|Arc)\b/ },
    { type: 'builtin', regex: /\b(println|eprintln|format|panic|vec|dbg)!/ },
    { type: 'number', regex: /\b0x[0-9a-fA-F]+\b|\b\d+(_\d+)*(\.\d+)?([eE][+-]?\d+)?\b/ },
    { type: 'function', regex: /\b[a-zA-Z_]\w*(?=\s*\()/ },
    { type: 'operator', regex: /[-+*\/%=&|<>!^~]+|->|=>/ },
  ],
  sql: [
    { type: 'comment', regex: /--.*$|\/\*[\s\S]*?\*\//m },
    { type: 'string', regex: /'(?:''|[^'])*'/ },
    { type: 'constant', regex: /\b(NULL|TRUE|FALSE)\b/i },
    { type: 'keyword', regex: /\b(SELECT|FROM|WHERE|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|DROP|ALTER|TABLE|VIEW|INDEX|JOIN|INNER|LEFT|RIGHT|FULL|OUTER|ON|AND|OR|NOT|IN|IS|LIKE|ORDER|BY|GROUP|HAVING|LIMIT|OFFSET|AS|UNION|ALL|DISTINCT|CASE|WHEN|THEN|ELSE|END|PRIMARY|KEY|FOREIGN|REFERENCES|DEFAULT|AUTO_INCREMENT|CONSTRAINT|CHECK|UNIQUE|CASCADE|DESC|ASC|BEGIN|COMMIT|ROLLBACK|TRANSACTION)\b/i },
    { type: 'builtin', regex: /\b(COUNT|SUM|AVG|MIN|MAX|NOW|CURRENT_TIMESTAMP|COALESCE|CONCAT|UPPER|LOWER|TRIM|SUBSTRING|ROUND|CAST|IFNULL|NULLIF)\b/i },
    { type: 'number', regex: /\b\d+(\.\d+)?\b/ },
    { type: 'operator', regex: /[-+*\/%=<>!]+/ },
  ],
  shell: [
    { type: 'comment', regex: /#.*$/m },
    { type: 'string', regex: /"(?:\\.|[^"\\])*"|'[^']*'/ },
    { type: 'variable', regex: /\$\{?[a-zA-Z_]\w*\}?|\$[0-9?*@#$!]/ },
    { type: 'keyword', regex: /\b(if|then|else|elif|fi|case|esac|for|while|until|do|done|in|function|select|time|exit|return)\b/ },
    { type: 'builtin', regex: /\b(echo|cd|ls|cat|grep|sed|awk|mkdir|rm|cp|mv|touch|chmod|chown|curl|pnpm|npm|node|git|python|sh|bash|source|export|find|sudo|clear)\b/ },
    { type: 'number', regex: /\b\d+\b/ },
    { type: 'operator', regex: /\|{1,2}|&{1,2}|;|>>?|<{1,2}/ },
  ],
  powershell: [
    { type: 'comment', regex: /#.*$/m },
    { type: 'string', regex: /"(?:\\.|[^"\\])*"|'[^']*'/ },
    { type: 'variable', regex: /\$[a-zA-Z_]\w*/ },
    { type: 'builtin', regex: /\b(Get|Set|New|Remove|Start|Stop|Select|Where|ForEach|Write|Test)-[a-zA-Z]+\b/i },
    { type: 'keyword', regex: /\b(function|param|if|else|elseif|for|foreach|while|switch|return|break|continue|try|catch|finally|throw)\b/i },
    { type: 'number', regex: /\b\d+\b/ },
  ],
  json: [
    { type: 'key', regex: /"(?:\\.|[^"\\])*"(?=\s*:)/ },
    { type: 'string', regex: /"(?:\\.|[^"\\])*"/ },
    { type: 'constant', regex: /\b(true|false|null)\b/ },
    { type: 'number', regex: /-?\b\d+(\.\d+)?([eE][+-]?\d+)?\b/ },
    { type: 'operator', regex: /[{}\[\],:]/ },
  ],
  c: [
    { type: 'comment', regex: /\/\/.*$|\/\*[\s\S]*?\*\//m },
    { type: 'string', regex: /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/ },
    { type: 'keyword', regex: /\b(#include|#define|#ifdef|#ifndef|#endif|if|else|while|for|do|switch|case|default|break|continue|return|goto|sizeof|typedef|struct|union|enum|static|extern|const|volatile)\b/ },
    { type: 'type', regex: /\b(void|int|char|short|long|float|double|signed|unsigned|bool|size_t|uint8_t|uint16_t|uint32_t|uint64_t|int8_t|int16_t|int32_t|int64_t)\b/ },
    { type: 'number', regex: /\b0x[0-9a-fA-F]+\b|\b\d+(\.\d+)?([eE][+-]?\d+)?\b/ },
    { type: 'function', regex: /\b[a-zA-Z_]\w*(?=\s*\()/ },
  ],
  go: [
    { type: 'comment', regex: /\/\/.*$|\/\*[\s\S]*?\*\//m },
    { type: 'string', regex: /`(?:\\.|[^`\\])*`|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/ },
    { type: 'constant', regex: /\b(true|false|nil|iota)\b/ },
    { type: 'keyword', regex: /\b(package|import|func|return|var|const|type|struct|interface|map|chan|select|case|default|if|else|switch|for|range|break|continue|go|defer|goto|fallthrough)\b/ },
    { type: 'type', regex: /\b(bool|string|int|int8|int16|int32|int64|uint|uint8|uint16|uint32|uint64|uintptr|byte|rune|float32|float64|complex64|complex128|error)\b/ },
    { type: 'builtin', regex: /\b(append|cap|close|complex|copy|delete|imag|len|make|new|panic|print|println|real|recover)\b/ },
    { type: 'number', regex: /\b0x[0-9a-fA-F]+\b|\b\d+(\.\d+)?([eE][+-]?\d+)?\b/ },
    { type: 'function', regex: /\b[a-zA-Z_]\w*(?=\s*\()/ },
  ],
  java: [
    { type: 'comment', regex: /\/\/.*$|\/\*[\s\S]*?\*\//m },
    { type: 'string', regex: /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/ },
    { type: 'constant', regex: /\b(true|false|null)\b/ },
    { type: 'keyword', regex: /\b(public|private|protected|class|interface|enum|extends|implements|import|package|static|final|abstract|void|return|new|this|super|if|else|switch|case|default|for|while|do|break|continue|try|catch|finally|throw|throws)\b/ },
    { type: 'type', regex: /\b(int|byte|short|long|float|double|boolean|char|String|Integer|Long|Boolean|List|Map|Set|ArrayList|HashMap|HashSet)\b/ },
    { type: 'builtin', regex: /\b(System\.out\.println|System\.out\.print|System\.err\.println)\b/ },
    { type: 'number', regex: /\b0x[0-9a-fA-F]+\b|\b\d+(\.\d+)?([eE][+-]?\d+)?\b/ },
    { type: 'function', regex: /\b[a-zA-Z_]\w*(?=\s*\()/ },
  ],
  html: [
    { type: 'comment', regex: /<!--[\s\S]*?-->/ },
    { type: 'tag', regex: /<\/?[a-zA-Z0-9-]+/ },
    { type: 'attr', regex: /\b[a-zA-Z0-9-]+(?=\s*=)/ },
    { type: 'string', regex: /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/ },
  ],
  css: [
    { type: 'comment', regex: /\/\*[\s\S]*?\*\// },
    { type: 'key', regex: /[a-zA-Z-]+(?=\s*:)/ },
    { type: 'string', regex: /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/ },
    { type: 'number', regex: /\b\d+(\.\d+)?(px|rem|em|%|vh|vw|s|ms|deg)?\b/ },
    { type: 'keyword', regex: /#[a-zA-Z0-9_-]+|\.[a-zA-Z0-9_-]+|@[a-zA-Z-]+/ },
  ],
  markdown: [
    { type: 'keyword', regex: /^#{1,6}\s.*$/m },
    { type: 'string', regex: /`[^`]+`/ },
    { type: 'comment', regex: /<!--[\s\S]*?-->/ },
    { type: 'operator', regex: /^\s*[-*+]\s|^\s*\d+\.\s/m },
  ],
};

LANGUAGE_RULES.typescript = LANGUAGE_RULES.javascript;
LANGUAGE_RULES.bash = LANGUAGE_RULES.shell;
LANGUAGE_RULES.sh = LANGUAGE_RULES.shell;
LANGUAGE_RULES.js = LANGUAGE_RULES.javascript;
LANGUAGE_RULES.ts = LANGUAGE_RULES.javascript;
LANGUAGE_RULES.jsx = LANGUAGE_RULES.javascript;
LANGUAGE_RULES.tsx = LANGUAGE_RULES.javascript;
LANGUAGE_RULES.py = LANGUAGE_RULES.python;
LANGUAGE_RULES.rs = LANGUAGE_RULES.rust;
LANGUAGE_RULES.cpp = LANGUAGE_RULES.c;

/**
 * 核心着色引擎：将纯文本代码转化为高保真彩色 HTML 字符串
 */
export function highlightCode(text: string, language: string = 'plaintext'): string {
  if (!text) return '';
  const langKey = (language || 'plaintext').toLowerCase();
  const rules = LANGUAGE_RULES[langKey];
  if (!rules || rules.length === 0) {
    return escapeHtml(text);
  }

  let html = '';
  let cursor = 0;

  while (cursor < text.length) {
    let bestMatch: string | null = null;
    let bestRule: TokenRule | null = null;
    let bestIndex = Infinity;

    for (const rule of rules) {
      const rx = new RegExp(rule.regex.source, rule.regex.flags.includes('m') ? 'gm' : 'g');
      rx.lastIndex = cursor;
      const m = rx.exec(text);
      if (m && m.index >= cursor && m.index < bestIndex) {
        bestIndex = m.index;
        bestMatch = m[0];
        bestRule = rule;
        if (bestIndex === cursor) break;
      }
    }

    if (bestMatch && bestRule && bestIndex < Infinity) {
      if (bestIndex > cursor) {
        html += escapeHtml(text.slice(cursor, bestIndex));
      }
      const colorClass = TOKEN_COLORS[bestRule.type] || '';
      html += `<span class="${colorClass}">${escapeHtml(bestMatch)}</span>`;
      cursor = bestIndex + bestMatch.length;
    } else {
      html += escapeHtml(text.slice(cursor));
      break;
    }
  }

  return html;
}

/**
 * 光标与选区保护工具函数：保存 contentEditable 当前字符偏移量
 */
export function getCaretOffset(element: HTMLElement): CaretPosition {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return { start: 0, end: 0 };
  const range = selection.getRangeAt(0);

  if (!element.contains(range.startContainer)) return { start: 0, end: 0 };

  try {
    const preStartRange = range.cloneRange();
    preStartRange.selectNodeContents(element);
    preStartRange.setEnd(range.startContainer, range.startOffset);
    const start = preStartRange.toString().length;

    const preEndRange = range.cloneRange();
    preEndRange.selectNodeContents(element);
    preEndRange.setEnd(range.endContainer, range.endOffset);
    const end = preEndRange.toString().length;

    return { start, end };
  } catch {
    return { start: 0, end: 0 };
  }
}

/**
 * 光标与选区保护工具函数：将光标与选区精准恢复至指定字符偏移量
 */
export function restoreCaretOffset(element: HTMLElement, { start, end }: CaretPosition): void {
  const selection = window.getSelection();
  if (!selection) return;

  let currentOffset = 0;
  const range = document.createRange();
  range.setStart(element, 0);
  range.collapse(true);

  let startNode: Node | null = null;
  let startOffset = 0;
  let endNode: Node | null = null;
  let endOffset = 0;

  function traverse(node: Node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const textLen = node.textContent?.length || 0;
      if (!startNode && currentOffset + textLen >= start) {
        startNode = node;
        startOffset = start - currentOffset;
      }
      if (!endNode && currentOffset + textLen >= end) {
        endNode = node;
        endOffset = end - currentOffset;
      }
      currentOffset += textLen;
    } else {
      for (let i = 0; i < node.childNodes.length; i++) {
        traverse(node.childNodes[i]);
      }
    }
  }

  traverse(element);

  try {
    const sNode = startNode as Node | null;
    const eNode = endNode as Node | null;

    if (sNode) {
      range.setStart(sNode, Math.min(startOffset, sNode.textContent?.length || 0));
    } else {
      range.setStart(element, element.childNodes.length);
    }

    if (eNode) {
      range.setEnd(eNode, Math.min(endOffset, eNode.textContent?.length || 0));
    } else {
      range.setEnd(element, element.childNodes.length);
    }

    selection.removeAllRanges();
    selection.addRange(range);
  } catch {
    // 降级兜底：光标置于末尾
  }
}
