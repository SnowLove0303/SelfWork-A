import React, { useRef, useEffect, useState } from 'react';
import { DocBlock, BlockType } from '../../../types/docs.ts';
import { SlashMenu, SLASH_MENU_ITEMS } from './SlashMenu.tsx';
import { BlockContextMenu } from './BlockContextMenu.tsx';
import { FloatingFormatToolbar } from './FloatingFormatToolbar.tsx';
import {
  Plus,
  Trash2,
  Check,
  Table,
  Copy,
  WrapText,
  ChevronDown,
} from 'lucide-react';

export const SUPPORTED_CODE_LANGUAGES = [
  { id: 'python', name: 'Python' },
  { id: 'javascript', name: 'JavaScript' },
  { id: 'typescript', name: 'TypeScript' },
  { id: 'rust', name: 'Rust' },
  { id: 'sql', name: 'SQL' },
  { id: 'shell', name: 'Bash / Shell' },
  { id: 'powershell', name: 'PowerShell' },
  { id: 'json', name: 'JSON' },
  { id: 'html', name: 'HTML' },
  { id: 'css', name: 'CSS' },
  { id: 'c', name: 'C / C++' },
  { id: 'go', name: 'Go' },
  { id: 'java', name: 'Java' },
  { id: 'markdown', name: 'Markdown' },
  { id: 'plaintext', name: 'Plain Text' },
] as const;

interface BlockItemProps {
  block: DocBlock;
  onUpdate: (
    content: string,
    blockType?: BlockType,
    properties?: Record<string, any>,
    isStructural?: boolean
  ) => void;
  onDelete: () => void;
  onInsertBelow: (blockType?: BlockType) => void;
  onFocusPrev: () => void;
  onFocusNext: () => void;
  autoFocus?: boolean;
}

// 格式转换器：将旧存量 Markdown 代码自动平滑转为高保真 HTML 格式，保证所见即所得
function markdownToHtml(raw: string): string {
  if (!raw) return '';
  // 若已包含标准 HTML 标签，直接返回
  if (
    raw.includes('<strong>') ||
    raw.includes('<em>') ||
    raw.includes('<del>') ||
    raw.includes('<code>') ||
    raw.includes('<b>') ||
    raw.includes('<i>') ||
    raw.includes('<u>')
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

export const BlockItem: React.FC<BlockItemProps> = ({
  block,
  onUpdate,
  onDelete,
  onInsertBelow,
  onFocusPrev,
  onFocusNext,
  autoFocus,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const isLocalInputRef = useRef(false);

  const [slashMenuOpen, setSlashMenuOpen] = useState(false);
  const [slashMenuPos, setSlashMenuPos] = useState({ top: 0, left: 0 });
  const [slashSelectedIndex, setSlashSelectedIndex] = useState(0);

  // 右键划选排版菜单状态
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });
  const [savedSelectionText, setSavedSelectionText] = useState('');
  const savedRangeRef = useRef<Range | null>(null);

  // 划选浮动微光工具栏状态
  const [floatingToolbarOpen, setFloatingToolbarOpen] = useState(false);
  const [floatingToolbarPos, setFloatingToolbarPos] = useState({ top: 0, left: 0 });

  // 代码块专属状态：复制反馈与语言下拉菜单
  const [copiedCode, setCopiedCode] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  // 1. 初始化与外部状态同步：解耦本地打字与撤销/重做
  useEffect(() => {
    // 若本次变化是由本地输入触发，清理标记并跳过，杜绝打字时光标重置
    if (isLocalInputRef.current) {
      isLocalInputRef.current = false;
      return;
    }

    // 来自外部（Undo、Redo、加载）的更新：强制同步 innerHTML 并将光标平滑置于末尾
    if (editorRef.current) {
      const targetHtml = markdownToHtml(block.content);
      if (editorRef.current.innerHTML !== targetHtml) {
        editorRef.current.innerHTML = targetHtml;
        if (document.activeElement === editorRef.current) {
          const sel = window.getSelection();
          if (sel) {
            const range = document.createRange();
            range.selectNodeContents(editorRef.current);
            range.collapse(false);
            sel.removeAllRanges();
            sel.addRange(range);
          }
        }
      }
    }
  }, [block.id, block.content]);

  // 2. 自动对焦与光标定位至末尾
  useEffect(() => {
    if (autoFocus && editorRef.current) {
      editorRef.current.focus();
      const sel = window.getSelection();
      if (sel) {
        const range = document.createRange();
        range.selectNodeContents(editorRef.current);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
  }, [autoFocus]);

  // 3. 选区检测与浮动工具条调度
  const checkSelection = () => {
    setTimeout(() => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !editorRef.current) {
        setFloatingToolbarOpen(false);
        return;
      }

      if (!editorRef.current.contains(sel.anchorNode)) {
        setFloatingToolbarOpen(false);
        return;
      }

      const text = sel.toString().trim();
      if (text.length > 0 && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        savedRangeRef.current = range.cloneRange();
        setSavedSelectionText(text);

        const rect = range.getBoundingClientRect();
        setFloatingToolbarPos({
          top: rect.top - 46,
          left: Math.max(16, rect.left + rect.width / 2 - 110),
        });
        setFloatingToolbarOpen(true);
      } else {
        setFloatingToolbarOpen(false);
      }
    }, 15);
  };

  const handleMouseUp = () => {
    checkSelection();
  };

  // 4. 处理文本输入与行首 Markdown 语法糖
  const handleInput = () => {
    if (!editorRef.current) return;
    isLocalInputRef.current = true;
    const rawHtml = editorRef.current.innerHTML;
    const rawText = editorRef.current.innerText || '';

    // 行首语法糖快速蜕变 (Shorthand Sugaring)
    if (block.blockType === 'p') {
      if (rawText === '---' || rawText === '---\n') {
        editorRef.current.innerHTML = '';
        onUpdate('', 'divider', undefined, true);
        onInsertBelow('p');
        return;
      }

      // 匹配行首代码块语法糖 ``` 或 ```python + 空格/换行
      const codeMatch = rawText.match(/^```([a-zA-Z0-9_-]*)\s$/) || rawText.match(/^```([a-zA-Z0-9_-]*)\n$/);
      if (codeMatch) {
        const lang = codeMatch[1].toLowerCase() || 'plaintext';
        editorRef.current.innerHTML = '';
        onUpdate('', 'code', { language: lang, wrap: false }, true);
        return;
      }
      const match = rawText.match(/^(#{1,3}|\[\]|\[ \]|---|-|\*|>)\s(.*)$/);
      if (match) {
        const trigger = match[1];
        const rest = match[2];
        let nextType: BlockType = 'p';
        let initialProps: Record<string, any> | undefined = undefined;

        if (trigger === '#') nextType = 'h1';
        else if (trigger === '##') nextType = 'h2';
        else if (trigger === '###') nextType = 'h3';
        else if (trigger === '[]' || trigger === '[ ]') {
          nextType = 'todo';
          initialProps = { checked: false };
        } else if (trigger === '-' || trigger === '*') nextType = 'bullet';
        else if (trigger === '>') nextType = 'quote';

        if (nextType !== 'p') {
          editorRef.current.innerHTML = rest;
          onUpdate(rest, nextType, initialProps, true);
          return;
        }
      }
    }

    // 检测斜杠指令菜单唤起
    if (
      rawText.endsWith('/') &&
      (rawText.length === 1 || rawText.endsWith(' /') || rawText.endsWith('\n/'))
    ) {
      const rect = editorRef.current.getBoundingClientRect();
      setSlashMenuPos({
        top: rect.bottom + 4,
        left: Math.max(16, rect.left),
      });
      setSlashMenuOpen(true);
      setSlashSelectedIndex(0);
    } else if (slashMenuOpen && !rawText.includes('/')) {
      setSlashMenuOpen(false);
    }

    onUpdate(rawHtml);
  };

  // 5. 键盘事件快捷流 (Enter / Backspace / Tab / Arrow / Shortcuts)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // 段落行首直接敲空格或回车触发 ```<lang> 代码块蜕变
    if (block.blockType === 'p') {
      const text = editorRef.current?.innerText?.trim() || '';
      if (e.key === ' ' || e.key === 'Enter') {
        const codePrefixMatch = text.match(/^```([a-zA-Z0-9_-]*)$/);
        if (codePrefixMatch) {
          e.preventDefault();
          const lang = codePrefixMatch[1].toLowerCase() || 'plaintext';
          if (editorRef.current) editorRef.current.innerHTML = '';
          onUpdate('', 'code', { language: lang, wrap: false }, true);
          return;
        }
      }
    }

    // 快捷排版组合键支持
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
      e.preventDefault();
      handleApplyFormat('bold');
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
      e.preventDefault();
      handleApplyFormat('italic');
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'u') {
      e.preventDefault();
      handleApplyFormat('underline');
      return;
    }

    // 斜杠菜单导航
    if (slashMenuOpen) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSlashSelectedIndex((prev) => (prev + 1) % SLASH_MENU_ITEMS.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSlashSelectedIndex(
          (prev) => (prev - 1 + SLASH_MENU_ITEMS.length) % SLASH_MENU_ITEMS.length
        );
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        const selected = SLASH_MENU_ITEMS[slashSelectedIndex];
        if (selected) {
          handleSelectBlockType(selected.type);
        }
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setSlashMenuOpen(false);
        return;
      }
    }

    // 代码块专属击键工学：Tab 缩进插入空格、Enter 单块多行、空块退格平滑回退
    if (block.blockType === 'code') {
      if (e.key === 'Tab') {
        e.preventDefault();
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
          const range = sel.getRangeAt(0);
          range.deleteContents();
          const spaceNode = document.createTextNode('  ');
          range.insertNode(spaceNode);
          range.setStartAfter(spaceNode);
          range.setEndAfter(spaceNode);
          sel.removeAllRanges();
          sel.addRange(range);
          if (editorRef.current) {
            onUpdate(editorRef.current.innerHTML);
          }
        }
        return;
      }

      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
          const range = sel.getRangeAt(0);
          range.deleteContents();
          const brNode = document.createTextNode('\n');
          range.insertNode(brNode);
          range.setStartAfter(brNode);
          range.setEndAfter(brNode);
          sel.removeAllRanges();
          sel.addRange(range);
          if (editorRef.current) {
            onUpdate(editorRef.current.innerHTML);
          }
        } else {
          document.execCommand('insertLineBreak');
        }
        return;
      }

      if (e.key === 'Backspace') {
        const text = editorRef.current?.innerText?.trim() || '';
        if (text === '') {
          e.preventDefault();
          if (editorRef.current) editorRef.current.innerHTML = '';
          onUpdate('', 'p', undefined, true);
          return;
        }
      }
    }

    // 回车键：继承或派生新块
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const text = editorRef.current?.innerText?.trim() || '';

      // 空待办或空列表：回车降级为普通段落
      if (
        (block.blockType === 'bullet' || block.blockType === 'todo') &&
        text === ''
      ) {
        if (editorRef.current) editorRef.current.innerHTML = '';
        onUpdate('', 'p', undefined, true);
        return;
      }

      if (block.blockType === 'bullet') {
        onInsertBelow('bullet');
        return;
      }
      if (block.blockType === 'todo') {
        onInsertBelow('todo');
        return;
      }

      onInsertBelow('p');
      return;
    }

    // 退格键：降级或删除空块
    if (e.key === 'Backspace') {
      const selection = window.getSelection();
      const isAtStart =
        selection && selection.anchorOffset === 0 && selection.isCollapsed;
      const text = editorRef.current?.innerText?.trim() || '';

      // 非普通段落且位于行首：退格降级为段落
      if (isAtStart && block.blockType !== 'p') {
        e.preventDefault();
        onUpdate(editorRef.current?.innerHTML || '', 'p', undefined, true);
        return;
      }

      // 空块退格：删除当前块
      if (text === '') {
        e.preventDefault();
        if (block.blockType !== 'p') {
          onUpdate('', 'p', undefined, true);
        } else {
          onDelete();
        }
        return;
      }
    }

    // Tab 键：缩进支持，防止焦点逃逸
    if (e.key === 'Tab') {
      e.preventDefault();
      document.execCommand('insertText', false, '  ');
      return;
    }

    // 上下箭头跨块移动对焦
    if (e.key === 'ArrowUp') {
      const selection = window.getSelection();
      if (selection && selection.anchorOffset === 0) {
        e.preventDefault();
        onFocusPrev();
        return;
      }
    }
    if (e.key === 'ArrowDown') {
      const selection = window.getSelection();
      const len = editorRef.current?.innerText?.length || 0;
      if (selection && selection.anchorOffset >= len) {
        e.preventDefault();
        onFocusNext();
        return;
      }
    }
  };

  // 6. 右键上下文菜单捕获与选区冻结
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const selection = window.getSelection();
    let text = '';
    if (selection && selection.rangeCount > 0) {
      text = selection.toString();
      savedRangeRef.current = selection.getRangeAt(0).cloneRange();
    } else {
      savedRangeRef.current = null;
    }

    setSavedSelectionText(text);
    setContextMenuPos({ x: e.clientX, y: e.clientY });
    setContextMenuOpen(true);
    setFloatingToolbarOpen(false);
  };

  // 7. 原生富文本排版应用：严格锁定选区，消除失焦与局部失效
  const handleApplyFormat = (
    format: 'bold' | 'italic' | 'strike' | 'underline' | 'code' | 'clear'
  ) => {
    editorRef.current?.focus();

    if (savedRangeRef.current) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(savedRangeRef.current);
      }
    }

    if (format === 'bold') {
      document.execCommand('bold', false);
    } else if (format === 'italic') {
      document.execCommand('italic', false);
    } else if (format === 'underline') {
      document.execCommand('underline', false);
    } else if (format === 'strike') {
      document.execCommand('strikeThrough', false);
    } else if (format === 'clear') {
      document.execCommand('removeFormat', false);
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && editorRef.current) {
        const styledElements = editorRef.current.querySelectorAll('code, del, strike, span');
        styledElements.forEach((el) => {
          if (sel.containsNode(el, true)) {
            const textNode = document.createTextNode(el.textContent || '');
            el.parentNode?.replaceChild(textNode, el);
          }
        });
      }
    } else if (format === 'code') {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
        const range = sel.getRangeAt(0);
        const parentCode = range.commonAncestorContainer.parentElement?.closest('code');
        if (parentCode && editorRef.current?.contains(parentCode)) {
          // 解包已有代码块
          const textNode = document.createTextNode(parentCode.textContent || '');
          parentCode.parentNode?.replaceChild(textNode, parentCode);
        } else {
          const codeEl = document.createElement('code');
          codeEl.className =
            'px-1.5 py-0.5 rounded bg-white/10 text-rose-300 font-mono text-xs';
          const frag = range.extractContents();
          codeEl.appendChild(frag);
          range.insertNode(codeEl);
          sel.removeAllRanges();
        }
      }
    }

    if (editorRef.current) {
      onUpdate(editorRef.current.innerHTML, undefined, undefined, true);
    }
    setContextMenuOpen(false);
    setFloatingToolbarOpen(false);
  };

  // 8. 块类型转换 (Turn Into)
  const handleTurnInto = (newType: BlockType) => {
    const currentHtml = editorRef.current?.innerHTML || block.content;
    onUpdate(currentHtml, newType, undefined, true);
    setContextMenuOpen(false);
    setFloatingToolbarOpen(false);
    setTimeout(() => {
      editorRef.current?.focus();
    }, 50);
  };

  // 9. 剪贴板动作
  const handleCopy = () => {
    if (savedSelectionText) {
      navigator.clipboard.writeText(savedSelectionText);
    }
    setContextMenuOpen(false);
  };

  const handleCut = () => {
    if (savedSelectionText) {
      navigator.clipboard.writeText(savedSelectionText);
      document.execCommand('delete');
      if (editorRef.current) {
        onUpdate(editorRef.current.innerHTML, undefined, undefined, true);
      }
    }
    setContextMenuOpen(false);
  };

  // 10. 选择斜杠菜单中的类型
  const handleSelectBlockType = (newType: BlockType) => {
    setSlashMenuOpen(false);
    if (editorRef.current) {
      const cleaned = editorRef.current.innerHTML.replace(/\/$/, '');
      editorRef.current.innerHTML = cleaned;
      onUpdate(cleaned, newType, undefined, true);
    }
    setTimeout(() => {
      editorRef.current?.focus();
    }, 50);
  };

  // 11. 待办复选框打勾切换
  const handleToggleTodo = () => {
    const isChecked = Boolean(block.properties?.checked);
    onUpdate(
      block.content,
      block.blockType,
      { ...block.properties, checked: !isChecked },
      true
    );
  };

  // 获取不同块类型的特定样式类
  const getBlockStyle = () => {
    switch (block.blockType) {
      case 'h1':
        return 'text-[28px] font-bold text-white leading-tight';
      case 'h2':
        return 'text-[22px] font-semibold text-slate-100 leading-snug';
      case 'h3':
        return 'text-lg font-semibold text-slate-200 leading-snug';
      case 'quote':
        return 'italic text-slate-300 text-base leading-relaxed';
      case 'code':
        return 'font-mono text-sm text-rose-300 leading-relaxed';
      default:
        return 'text-base text-slate-200 leading-relaxed';
    }
  };

  const getPlaceholder = () => {
    switch (block.blockType) {
      case 'h1':
        return '一级标题...';
      case 'h2':
        return '二级标题...';
      case 'h3':
        return '三级标题...';
      case 'code': {
        const lang = (block.properties?.language as string) || '';
        return lang ? `// 输入或粘贴 ${lang} 代码...` : '// 输入或粘贴代码...';
      }
      default:
        return "输入文本，或按 '/' 唤出菜单...";
    }
  };

  // 分隔线特殊渲染
  if (block.blockType === 'divider') {
    return (
      <div id={`block-${block.id}`} className="group relative flex items-center py-2 my-1">
        <div className="absolute -left-8 top-1 flex items-center justify-end pr-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 select-none">
          <button
            onClick={onDelete}
            className="p-0.5 hover:bg-white/10 text-slate-500 hover:text-rose-400 rounded"
            title="删除分隔线"
          >
            <Trash2 size={12} />
          </button>
        </div>
        <div className="flex-1 h-px bg-white/10" />
      </div>
    );
  }

  // 表格嵌入卡片特殊渲染
  if (block.blockType === 'table') {
    return (
      <div id={`block-${block.id}`} className="group relative flex items-start py-2 my-1">
        <div className="absolute -left-8 top-2 flex items-center justify-end pr-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 select-none">
          <button
            onClick={onDelete}
            className="p-0.5 hover:bg-white/10 text-slate-500 hover:text-rose-400 rounded"
            title="删除此块"
          >
            <Trash2 size={12} />
          </button>
        </div>
        <div className="flex-1 p-3 bg-white/[0.02] border border-white/10 rounded-xl flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
            <Table size={18} />
          </div>
          <div>
            <div className="text-xs font-semibold text-white">多维表格数据库视图</div>
            <div className="text-[11px] text-slate-500">点击左侧切换为独立全功能表格编辑</div>
          </div>
        </div>
      </div>
    );
  }

  const isChecked = Boolean(block.properties?.checked);

  return (
    <div
      id={`block-${block.id}`}
      onContextMenu={handleContextMenu}
      className="group relative flex items-start py-1 my-0.5"
    >
      {/* 悬浮操作侧柄 */}
      <div className="absolute -left-8 top-1 flex items-center justify-end pr-1 opacity-0 group-hover:opacity-100 transition-opacity select-none z-10">
        <button
          onClick={() => onInsertBelow('p')}
          className="p-0.5 hover:bg-white/10 text-slate-500 hover:text-slate-300 rounded"
          title="在下方插入块"
        >
          <Plus size={12} />
        </button>
        <button
          onClick={onDelete}
          className="p-0.5 hover:bg-white/10 text-slate-500 hover:text-rose-400 rounded"
          title="删除块"
        >
          <Trash2 size={12} />
        </button>
      </div>

      {/* 待办复选框 */}
      {block.blockType === 'todo' && (
        <div className="pt-1.5 pr-2.5 shrink-0 select-none">
          <button
            onClick={handleToggleTodo}
            className={`w-[18px] h-[18px] rounded flex items-center justify-center transition-all ${
              isChecked
                ? 'bg-cyan-500 text-black shadow-sm'
                : 'border border-white/20 hover:border-cyan-400 bg-white/5'
            }`}
          >
            {isChecked && <Check size={12} strokeWidth={3} />}
          </button>
        </div>
      )}

      {/* 无序列表圆点 */}
      {block.blockType === 'bullet' && (
        <div className="pt-2.5 pr-3 shrink-0 select-none">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
        </div>
      )}

      {/* 引用区块左竖线包装 */}
      {block.blockType === 'quote' && (
        <div className="w-1 self-stretch bg-sky-500/40 rounded-full mr-3 shrink-0 my-0.5" />
      )}

      {/* 文本内容编辑与富文本渲染容器 */}
      {(() => {
        const currentLang = (block.properties?.language as string) || 'plaintext';
        const isWrap = Boolean(block.properties?.wrap);

        return (
          <div
            className={`flex-1 min-w-0 ${
              block.blockType === 'code'
                ? 'p-3.5 bg-slate-950/85 border border-white/10 rounded-xl my-1.5 shadow-inner relative group/code'
                : ''
            }`}
          >
            {/* 代码块右上角悬浮微光操作胶囊栏 */}
            {block.blockType === 'code' && (
              <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-20 select-none opacity-0 group-hover/code:opacity-100 focus-within:opacity-100 transition-opacity duration-150">
                {/* 语言选择切换器 */}
                <div className="relative">
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setShowLangMenu(!showLangMenu)}
                    className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-mono text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors cursor-pointer"
                    title="切换编程语言"
                  >
                    <span>{SUPPORTED_CODE_LANGUAGES.find((l) => l.id === currentLang)?.name || currentLang}</span>
                    <ChevronDown size={11} className="opacity-60" />
                  </button>

                  {showLangMenu && (
                    <div
                      onMouseDown={(e) => e.preventDefault()}
                      className="absolute right-0 top-full mt-1 w-36 max-h-56 overflow-y-auto bg-slate-900/95 border border-white/15 rounded-lg shadow-2xl py-1 z-50 text-xs backdrop-blur-md"
                    >
                      {SUPPORTED_CODE_LANGUAGES.map((lang) => (
                        <button
                          key={lang.id}
                          type="button"
                          onClick={() => {
                            onUpdate(
                              editorRef.current?.innerHTML || block.content,
                              'code',
                              { ...block.properties, language: lang.id },
                              true
                            );
                            setShowLangMenu(false);
                          }}
                          className={`w-full text-left px-3 py-1 hover:bg-sky-500/15 flex items-center justify-between transition-colors ${
                            currentLang === lang.id ? 'text-sky-400 font-semibold bg-sky-500/10' : 'text-slate-300'
                          }`}
                        >
                          <span>{lang.name}</span>
                          {currentLang === lang.id && <Check size={12} />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 代码换行切换 */}
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onUpdate(
                      editorRef.current?.innerHTML || block.content,
                      'code',
                      { ...block.properties, wrap: !isWrap },
                      true
                    );
                  }}
                  className={`p-1 rounded-md border text-[11px] transition-colors cursor-pointer ${
                    isWrap
                      ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                      : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 border-white/10'
                  }`}
                  title={isWrap ? '代码自动换行中 (点击切换为横向滚动)' : '保持单行横向滚动 (点击切换为自动换行)'}
                >
                  <WrapText size={12} />
                </button>

                {/* 一键复制代码 */}
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    const text = editorRef.current?.innerText || block.content;
                    navigator.clipboard.writeText(text);
                    setCopiedCode(true);
                    setTimeout(() => setCopiedCode(false), 1800);
                  }}
                  className="p-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                  title="复制代码到剪贴板"
                >
                  {copiedCode ? (
                    <>
                      <Check size={12} className="text-emerald-400" />
                      <span className="text-[10px] text-emerald-400 font-medium">已复制</span>
                    </>
                  ) : (
                    <Copy size={12} />
                  )}
                </button>
              </div>
            )}

            <div
              ref={editorRef}
              contentEditable={true}
              suppressContentEditableWarning={true}
              onInput={handleInput}
              onKeyDown={handleKeyDown}
              onKeyUp={checkSelection}
              onMouseUp={handleMouseUp}
              onContextMenu={handleContextMenu}
              data-placeholder={getPlaceholder()}
              className={`w-full outline-none focus:outline-none min-h-[1.5rem] cursor-text select-text ${getBlockStyle()} ${
                block.blockType === 'code'
                  ? isWrap
                    ? 'whitespace-pre-wrap break-words'
                    : 'whitespace-pre overflow-x-auto no-scrollbar'
                  : 'break-words'
              } ${
                isChecked && block.blockType === 'todo' ? 'line-through text-slate-500' : ''
              }`}
            />
          </div>
        );
      })()}

      {/* 划选即时浮动微光工具栏 */}
      {floatingToolbarOpen && (
        <FloatingFormatToolbar
          position={floatingToolbarPos}
          onApplyFormat={handleApplyFormat}
          onClose={() => setFloatingToolbarOpen(false)}
        />
      )}

      {/* 斜杠指令菜单 */}
      {slashMenuOpen && (
        <SlashMenu
          position={slashMenuPos}
          selectedIndex={slashSelectedIndex}
          setSelectedIndex={setSlashSelectedIndex}
          onSelect={handleSelectBlockType}
          onClose={() => setSlashMenuOpen(false)}
        />
      )}

      {/* 划选右键定制调整弹窗 */}
      {contextMenuOpen && (
        <BlockContextMenu
          position={contextMenuPos}
          hasSelection={Boolean(savedSelectionText)}
          selectedText={savedSelectionText}
          currentBlockType={block.blockType}
          onApplyFormat={handleApplyFormat}
          onTurnInto={handleTurnInto}
          onCopy={handleCopy}
          onCut={handleCut}
          onClose={() => setContextMenuOpen(false)}
        />
      )}
    </div>
  );
};
