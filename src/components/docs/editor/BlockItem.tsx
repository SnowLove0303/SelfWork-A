import React, { useRef, useEffect, useState } from 'react';
import { DocBlock, BlockType, DocPage } from '../../../types/docs.ts';
import { SlashMenu, SLASH_MENU_ITEMS } from './SlashMenu.tsx';
import { PageMentionMenu } from './PageMentionMenu.tsx';
import { BlockContextMenu } from './BlockContextMenu.tsx';
import { FloatingFormatToolbar } from './FloatingFormatToolbar.tsx';
import {
  Plus,
  Trash2,
  Check,
  Copy,
  WrapText,
  ChevronDown,
  ListOrdered,
  Image as ImageIcon,
  Upload,
  RefreshCw,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Code as CodeIcon,
  Workflow,
  GripVertical,
} from 'lucide-react';
import {
  highlightCode,
  getCaretOffset,
  restoreCaretOffset,
} from './codeHighlight.ts';
import { TableBlock } from './TableBlock.tsx';
import { MindMapEmbedBlock } from './MindMapEmbedBlock.tsx';
import { MermaidPreview } from './MermaidPreview.tsx';
import { MathBlock } from './MathBlock.tsx';
import { MultiColumnBlock } from './MultiColumnBlock.tsx';
import { TableOfContentsBlock } from './TableOfContentsBlock.tsx';

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
  { id: 'mermaid', name: 'Mermaid' },
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
  /** 有序列表块的序号（由 BlockEditor 计算后注入，仅 numbered 类型有效） */
  seqNumber?: number;
  /** 工作区全部文档（用于 [[ 键入触发双向页面引用菜单） */
  pages?: DocPage[];
  /** 点击双向页面引用胶囊时的跳转回调 */
  onNavigatePage?: (pageId: string) => void;
  /** 块拖拽重排交互属性与回调 */
  isDragging?: boolean;
  dropIndicator?: 'top' | 'bottom' | null;
  onDragStartBlock?: (blockId: string) => void;
  onDragEndBlock?: () => void;
  onDragOverBlock?: (blockId: string, position: 'top' | 'bottom') => void;
  onDropBlock?: (sourceBlockId: string, targetBlockId: string, position: 'top' | 'bottom') => void;
  /** 键盘快捷上下位移回调 (Alt + Up / Down) */
  onSwapBlock?: (direction: 'up' | 'down') => void;
  /** 全量块流（用于 /toc 动态大纲卡片提取） */
  allBlocks?: DocBlock[];
  /** 点击大纲项滚动锚点定位回调 */
  onScrollToHeading?: (headingId: string) => void;
}

// 格式转换器：将旧存量 Markdown 代码自动平滑转为高保真 HTML 格式，保证所见即所得
function markdownToHtml(raw: string): string {
  if (!raw) return '';
  // 若包含 ==高亮== 语法糖，先替换为 <mark>
  if (raw.includes('==')) {
    raw = raw.replace(
      /==([^=]+)==/g,
      '<mark style="background:#FFD93D40; border-radius:3px; padding:0 2px;">$1</mark>'
    );
  }
  // 若已包含标准 HTML 标签，直接返回
  if (
    raw.includes('<strong>') ||
    raw.includes('<em>') ||
    raw.includes('<del>') ||
    raw.includes('<code>') ||
    raw.includes('<b>') ||
    raw.includes('<i>') ||
    raw.includes('<u>') ||
    raw.includes('<a ') ||
    raw.includes('<mark ')
  ) {
    return raw;
  }

  let html = raw;
  // 链接语法必须在 ** 规则之前处理，防止被 strong 误匹配
  html = html.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-sky-400 underline underline-offset-2 hover:text-sky-300 transition-colors cursor-pointer">$1</a>'
  );
  html = html
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/~~(.+?)~~/g, '<del class="line-through text-slate-500">$1</del>')
    .replace(
      /==([^=]+)==/g,
      '<mark style="background:#FFD93D40; border-radius:3px; padding:0 2px;">$1</mark>'
    )
    .replace(
      /`([^`]+)`/g,
      '<code class="px-1.5 py-0.5 mx-0.5 rounded bg-white/[0.08] text-amber-200/90 font-mono text-[12px] border border-white/[0.06]">$1</code>'
    );
  // 裸 URL 自动链接（仅对不在 href="" 内的 http/https URL）
  html = html.replace(
    /((?<![="'])(https?:\/\/[^\s<>"]+))/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-sky-400 underline underline-offset-2 hover:text-sky-300 transition-colors cursor-pointer">$2</a>'
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
  seqNumber,
  pages,
  onNavigatePage,
  isDragging,
  dropIndicator,
  onDragStartBlock,
  onDragEndBlock,
  onDragOverBlock,
  onDropBlock,
  onSwapBlock,
  allBlocks,
  onScrollToHeading,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const isLocalInputRef = useRef(false);
  const isComposingRef = useRef(false);

  // 原生拖拽辅助函数与落点事件
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const rect = e.currentTarget.getBoundingClientRect();
    const isTop = e.clientY - rect.top < rect.height / 2;
    onDragOverBlock?.(block.id, isTop ? 'top' : 'bottom');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('text/plain');
    if (sourceId && sourceId !== block.id) {
      const rect = e.currentTarget.getBoundingClientRect();
      const isTop = e.clientY - rect.top < rect.height / 2;
      onDropBlock?.(sourceId, block.id, isTop ? 'top' : 'bottom');
    }
  };

  const renderSideHandle = (topClass = 'top-1') => (
    <div
      className={`absolute -left-9 ${topClass} flex items-center justify-end pr-1 opacity-0 group-hover:opacity-100 transition-opacity select-none z-10 gap-0.5`}
    >
      <div
        draggable={true}
        onDragStart={(e) => {
          e.dataTransfer.setData('text/plain', block.id);
          e.dataTransfer.effectAllowed = 'move';
          onDragStartBlock?.(block.id);
        }}
        onDragEnd={() => {
          onDragEndBlock?.();
        }}
        className="p-0.5 hover:bg-white/10 text-slate-500 hover:text-slate-300 rounded cursor-grab active:cursor-grabbing transition-colors"
        title="按住拖拽调整块顺序"
      >
        <GripVertical size={13} />
      </div>
      <button
        type="button"
        onClick={() => onInsertBelow('p')}
        className="p-0.5 hover:bg-white/10 text-slate-500 hover:text-slate-300 rounded transition-colors cursor-pointer"
        title="在下方插入块"
      >
        <Plus size={12} />
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="p-0.5 hover:bg-white/10 text-slate-500 hover:text-rose-400 rounded transition-colors cursor-pointer"
        title="删除块"
      >
        <Trash2 size={12} />
      </button>
    </div>
  );

  const renderDropIndicator = () => (
    <>
      {dropIndicator === 'top' && (
        <div className="absolute -top-1 left-0 right-0 h-0.5 bg-sky-400 rounded-full shadow-[0_0_8px_rgba(56,189,248,0.9)] z-30 pointer-events-none animate-pulse" />
      )}
      {dropIndicator === 'bottom' && (
        <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-sky-400 rounded-full shadow-[0_0_8px_rgba(56,189,248,0.9)] z-30 pointer-events-none animate-pulse" />
      )}
    </>
  );

  const [slashMenuOpen, setSlashMenuOpen] = useState(false);
  const [slashMenuPos, setSlashMenuPos] = useState({ top: 0, left: 0 });
  const [slashSelectedIndex, setSlashSelectedIndex] = useState(0);

  // 页面双向链接引用状态 ([[ 触发)
  const [mentionMenuOpen, setMentionMenuOpen] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionMenuPos, setMentionMenuPos] = useState({ top: 0, left: 0 });
  const [mentionSelectedIndex, setMentionSelectedIndex] = useState(0);

  // 右键划选排版菜单状态
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });
  const [savedSelectionText, setSavedSelectionText] = useState('');
  const savedRangeRef = useRef<Range | null>(null);

  // 划选浮动微光工具栏状态
  const [floatingToolbarOpen, setFloatingToolbarOpen] = useState(false);
  const [floatingToolbarPos, setFloatingToolbarPos] = useState({ top: 0, left: 0 });

  // 代码块专属状态：复制反馈与语言下拉菜单、动态行数
  const [copiedCode, setCopiedCode] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [lineCount, setLineCount] = useState(() =>
    Math.max(1, (block.content || '').split('\n').length)
  );

  // Callout 块图标选择器状态
  const [showIconPicker, setShowIconPicker] = useState(false);

  // 图片块状态
  const [imageUrlInput, setImageUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. 初始化与外部状态同步：解耦本地打字与撤销/重做
  useEffect(() => {
    // 若本次变化是由本地输入触发，清理标记并跳过，杜绝打字时光标重置
    if (isLocalInputRef.current) {
      isLocalInputRef.current = false;
      return;
    }

    // 来自外部（Undo、Redo、加载）的更新：强制同步 innerHTML 并将光标平滑置于末尾
    if (editorRef.current) {
      if (block.blockType === 'code') {
        const lang = (block.properties?.language as string) || 'plaintext';
        const targetHtml = highlightCode(block.content, lang);
        if (editorRef.current.innerHTML !== targetHtml) {
          editorRef.current.innerHTML = targetHtml;
        }
        const lines = Math.max(1, (block.content || '').split('\n').length);
        setLineCount(lines);
      } else {
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
    }
  }, [block.id, block.content, block.blockType, block.properties?.language]);

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

  // 代码块即时语法染色与光标选区无损同步
  const handleCodeInput = () => {
    if (!editorRef.current) return;
    isLocalInputRef.current = true;
    const rawText = editorRef.current.innerText || '';
    const caret = getCaretOffset(editorRef.current);
    const currentLang = (block.properties?.language as string) || 'plaintext';
    const targetHtml = highlightCode(rawText, currentLang);
    if (editorRef.current.innerHTML !== targetHtml) {
      editorRef.current.innerHTML = targetHtml;
      restoreCaretOffset(editorRef.current, caret);
    }
    const lines = Math.max(1, rawText.split('\n').length);
    setLineCount(lines);
    onUpdate(rawText);
  };

  // 代码块粘贴拦截：防止外部脏 HTML 污染，实现纯文本平滑注入与无损染色
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    if (block.blockType === 'code') {
      e.preventDefault();
      const text = e.clipboardData.getData('text/plain');
      if (!text || !editorRef.current) return;
      isLocalInputRef.current = true;
      const caret = getCaretOffset(editorRef.current);
      const currentText = editorRef.current.innerText || '';
      const before = currentText.slice(0, caret.start);
      const after = currentText.slice(caret.end);
      const newText = before + text + after;
      const newCaretPos = caret.start + text.length;
      const currentLang = (block.properties?.language as string) || 'plaintext';
      const targetHtml = highlightCode(newText, currentLang);
      editorRef.current.innerHTML = targetHtml;
      restoreCaretOffset(editorRef.current, { start: newCaretPos, end: newCaretPos });
      const lines = Math.max(1, newText.split('\n').length);
      setLineCount(lines);
      onUpdate(newText);
    }
  };

  // 4. 处理文本输入与行首 Markdown 语法糖
  const handleInput = () => {
    if (!editorRef.current) return;
    isLocalInputRef.current = true;

    // 代码块输入走专属即时语法染色流
    if (block.blockType === 'code') {
      if (isComposingRef.current) {
        onUpdate(editorRef.current.innerText || '');
        return;
      }
      handleCodeInput();
      return;
    }

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

      // 匹配行首折叠块语法糖 >> 
      if (rawText.startsWith('>> ')) {
        const rest = rawText.slice(3);
        editorRef.current.innerHTML = rest;
        onUpdate(rest, 'toggle', { isOpen: true }, true);
        return;
      }

      const match = rawText.match(/^(#{1,3}|\[\]|\[ \]|---|-|\*|>|1\.)\s(.*)$/);
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
        else if (trigger === '1.') nextType = 'numbered';

        if (nextType !== 'p') {
          editorRef.current.innerHTML = rest;
          onUpdate(rest, nextType, initialProps, true);
          return;
        }
      }
    }

    // 支持行内输入 ==高亮文本== 敲空格即时转换为 <mark> 标签
    if (editorRef.current && /==([^=]+)==(\s)$/.test(rawText)) {
      const caret = getCaretOffset(editorRef.current);
      const convertedHtml = editorRef.current.innerHTML.replace(
        /==([^=]+)==(\s|&nbsp;)$/g,
        '<mark style="background:#FFD93D40; border-radius:3px; padding:0 2px;">$1</mark>&nbsp;'
      );
      if (convertedHtml !== editorRef.current.innerHTML) {
        editorRef.current.innerHTML = convertedHtml;
        restoreCaretOffset(editorRef.current, caret);
        onUpdate(editorRef.current.innerHTML);
        return;
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

    // 检测双向页面引用指令唤起 ([[ 触发)
    const doubleBracketIdx = rawText.lastIndexOf('[[');
    if (doubleBracketIdx !== -1 && pages && pages.length > 0) {
      const queryPart = rawText.slice(doubleBracketIdx + 2);
      if (!queryPart.includes(']]') && !queryPart.includes('\n')) {
        const rect = editorRef.current.getBoundingClientRect();
        setMentionMenuPos({
          top: rect.bottom + 4,
          left: Math.max(16, rect.left),
        });
        setMentionQuery(queryPart);
        setMentionMenuOpen(true);
        setMentionSelectedIndex(0);
      } else if (mentionMenuOpen) {
        setMentionMenuOpen(false);
      }
    } else if (mentionMenuOpen) {
      setMentionMenuOpen(false);
    }

    onUpdate(rawHtml);
  };

  // 5. 键盘事件快捷流 (Enter / Backspace / Tab / Arrow / Shortcuts)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // 快捷键 Alt + ↑ / Alt + ↓ 快速上下对调块位置
    if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      e.preventDefault();
      onSwapBlock?.(e.key === 'ArrowUp' ? 'up' : 'down');
      return;
    }

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
          handleSelectBlockType(selected.type, selected.properties);
        }
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setSlashMenuOpen(false);
        return;
      }
    }

    // 双向页面链接菜单键盘导航
    if (mentionMenuOpen) {
      const filtered = (pages || [])
        .filter((p) => p.id !== block.pageId)
        .filter((p) =>
          !mentionQuery ? true : p.title.toLowerCase().includes(mentionQuery.toLowerCase())
        );

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setMentionSelectedIndex((prev) => (filtered.length ? (prev + 1) % filtered.length : 0));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setMentionSelectedIndex((prev) =>
          filtered.length ? (prev - 1 + filtered.length) % filtered.length : 0
        );
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[mentionSelectedIndex]) {
          handleSelectPageMention(filtered[mentionSelectedIndex]);
        }
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setMentionMenuOpen(false);
        return;
      }
    }

    // 代码块专属击键工学：智能缩进、Tab/Shift+Tab、Enter 保持前导缩进
    if (block.blockType === 'code') {
      const currentLang = (block.properties?.language as string) || '';
      const indentUnit = currentLang === 'python' ? '    ' : '  ';

      if (e.key === 'Tab') {
        e.preventDefault();
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0 && editorRef.current) {
          if (!e.shiftKey) {
            // 普通 Tab 缩进：插入对应语言规范空格
            const range = sel.getRangeAt(0);
            range.deleteContents();
            const spaceNode = document.createTextNode(indentUnit);
            range.insertNode(spaceNode);
            range.setStartAfter(spaceNode);
            range.setEndAfter(spaceNode);
            sel.removeAllRanges();
            sel.addRange(range);
          } else {
            // Shift + Tab：减少缩进（Outdent）
            const caret = getCaretOffset(editorRef.current);
            const text = editorRef.current.innerText || '';
            const lineStart = text.lastIndexOf('\n', Math.max(0, caret.start - 1)) + 1;
            const lineLeading = text.slice(lineStart, lineStart + indentUnit.length);
            const spacesToRemove = lineLeading.match(/^ +/)?.[0].length || 0;
            if (spacesToRemove > 0) {
              const count = Math.min(spacesToRemove, indentUnit.length);
              const nextText = text.slice(0, lineStart) + text.slice(lineStart + count);
              editorRef.current.innerHTML = highlightCode(nextText, currentLang);
              restoreCaretOffset(editorRef.current, {
                start: Math.max(lineStart, caret.start - count),
                end: Math.max(lineStart, caret.end - count),
              });
              onUpdate(nextText, 'code', block.properties, false);
              return;
            }
          }
          handleCodeInput();
        }
        return;
      }

      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0 && editorRef.current) {
          const caret = getCaretOffset(editorRef.current);
          const text = editorRef.current.innerText || '';
          // 提取当前行内容与前导空格
          const lineStart = text.lastIndexOf('\n', Math.max(0, caret.start - 1)) + 1;
          const currentLine = text.slice(lineStart, caret.start);
          const matchIndent = currentLine.match(/^[ \t]+/);
          let indent = matchIndent ? matchIndent[0] : '';

          // 智能加深缩进判定：上一行以 {、[、( 或 : 结尾时，追加一级缩进
          const trimmed = currentLine.trimEnd();
          if (trimmed.endsWith('{') || trimmed.endsWith('[') || trimmed.endsWith('(') || trimmed.endsWith(':')) {
            indent += indentUnit;
          }

          const insertStr = '\n' + indent;
          const range = sel.getRangeAt(0);
          range.deleteContents();
          const brNode = document.createTextNode(insertStr);
          range.insertNode(brNode);
          range.setStartAfter(brNode);
          range.setEndAfter(brNode);
          sel.removeAllRanges();
          sel.addRange(range);
          handleCodeInput();
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
        (block.blockType === 'bullet' || block.blockType === 'todo' || block.blockType === 'numbered') &&
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
      if (block.blockType === 'numbered') {
        onInsertBelow('numbered');
        return;
      }
      // callout 内部回车：在当前 callout 下方插入段落
      if (block.blockType === 'callout') {
        onInsertBelow('p');
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
    format: 'bold' | 'italic' | 'strike' | 'underline' | 'code' | 'clear' | 'link' | 'highlight'
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
        const styledElements = editorRef.current.querySelectorAll('code, del, strike, span, a, mark');
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
            'px-1.5 py-0.5 mx-0.5 rounded bg-white/[0.08] text-amber-200/90 font-mono text-[12px] border border-white/[0.06]';
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

  // 链接插入
  const handleApplyLink = (url: string) => {
    editorRef.current?.focus();
    if (savedRangeRef.current) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(savedRangeRef.current);
      }
    }
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      const range = sel.getRangeAt(0);
      const parentA = range.commonAncestorContainer.parentElement?.closest('a');
      if (parentA && editorRef.current?.contains(parentA)) {
        // 更新已有链接 href
        parentA.setAttribute('href', url);
      } else {
        const aEl = document.createElement('a');
        aEl.href = url;
        aEl.target = '_blank';
        aEl.rel = 'noopener noreferrer';
        aEl.className = 'text-sky-400 underline underline-offset-2 hover:text-sky-300 transition-colors cursor-pointer';
        const frag = range.extractContents();
        aEl.appendChild(frag);
        range.insertNode(aEl);
        sel.removeAllRanges();
      }
    }
    if (editorRef.current) {
      onUpdate(editorRef.current.innerHTML, undefined, undefined, true);
    }
    setContextMenuOpen(false);
    setFloatingToolbarOpen(false);
  };

  // 高亮插入（color 为空时清除）
  const handleApplyHighlight = (color: string) => {
    editorRef.current?.focus();
    if (savedRangeRef.current) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(savedRangeRef.current);
      }
    }
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      if (!color) {
        // 清除高亮：移除选区内的 mark 元素
        document.execCommand('removeFormat', false);
        if (editorRef.current) {
          const marks = editorRef.current.querySelectorAll('mark');
          marks.forEach((mark) => {
            if (sel.containsNode(mark, true)) {
              const textNode = document.createTextNode(mark.textContent || '');
              mark.parentNode?.replaceChild(textNode, mark);
            }
          });
        }
      } else {
        const range = sel.getRangeAt(0);
        const markEl = document.createElement('mark');
        markEl.style.background = color;
        markEl.style.borderRadius = '3px';
        markEl.style.padding = '0 2px';
        const frag = range.extractContents();
        markEl.appendChild(frag);
        range.insertNode(markEl);
        sel.removeAllRanges();
      }
    }
    if (editorRef.current) {
      onUpdate(editorRef.current.innerHTML, undefined, undefined, true);
    }
    setContextMenuOpen(false);
    setFloatingToolbarOpen(false);
  };

  // 块级文字对齐应用
  const handleApplyAlign = (align: 'left' | 'center' | 'right') => {
    block.format = {
      ...block.format,
      textAlign: align,
    };
    onUpdate(
      editorRef.current?.innerHTML || block.content,
      block.blockType,
      block.properties,
      true
    );
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
  const handleSelectBlockType = (newType: BlockType, properties?: Record<string, any>) => {
    setSlashMenuOpen(false);
    if (editorRef.current) {
      const cleaned = editorRef.current.innerHTML.replace(/\/$/, '');
      editorRef.current.innerHTML = cleaned;
      onUpdate(cleaned, newType, properties, true);
    }
    setTimeout(() => {
      editorRef.current?.focus();
    }, 50);
  };

  // 选定目标文档，插入双向页面胶囊超链接
  const handleSelectPageMention = (targetPage: DocPage) => {
    setMentionMenuOpen(false);
    if (!editorRef.current) return;
    const currentHtml = editorRef.current.innerHTML;
    const linkPill = `<a data-page-link="true" href="#/page/${targetPage.id}" class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 hover:text-sky-200 border border-sky-500/30 font-medium text-xs mx-0.5 select-none no-underline cursor-pointer transition-colors" contenteditable="false">${targetPage.icon || '📄'} ${targetPage.title || '无标题文档'}</a>&nbsp;`;

    // 匹配最后的 [[... 表达式并替换
    const regex = /\[\[([^\]<]*)$/;
    let updatedHtml: string;
    if (regex.test(currentHtml)) {
      updatedHtml = currentHtml.replace(regex, linkPill);
    } else {
      updatedHtml = currentHtml + linkPill;
    }
    editorRef.current.innerHTML = updatedHtml;
    onUpdate(updatedHtml);
    setTimeout(() => {
      editorRef.current?.focus();
    }, 50);
  };

  // 拦截对页面引用胶囊的点击事件，触发平滑跨文档穿透跳转
  const handleBlockClick = (e: React.MouseEvent) => {
    const linkEl = (e.target as HTMLElement).closest('[data-page-link="true"]');
    if (linkEl) {
      e.preventDefault();
      e.stopPropagation();
      const href = linkEl.getAttribute('href');
      const pageId = href?.replace('#/page/', '');
      if (pageId && onNavigatePage) {
        onNavigatePage(pageId);
      }
    }
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

  // 获取不同块类型的外边距与垂直排版呼吸空间类
  const getBlockMarginClass = () => {
    switch (block.blockType) {
      case 'h1':
        return 'mt-10 mb-2.5 pt-2';
      case 'h2':
        return 'mt-8 mb-2 pt-1';
      case 'h3':
        return 'mt-5 mb-1.5';
      case 'divider':
        return 'my-6';
      case 'code':
      case 'table':
        return 'my-3.5';
      default:
        return 'py-1 my-0.5';
    }
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
        return 'font-mono text-[13px] text-slate-200 leading-[22px] tracking-normal';
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
      case 'numbered':
        return '有序列表项...';
      case 'callout':
        return '提示内容...';
      default:
        return "输入文本，或按 '/' 唤出菜单...";
    }
  };

  // Callout 提示框特殊渲染（带图标与主题色背景）
  if (block.blockType === 'callout') {
    const calloutTheme = (block.properties?.theme as string) || 'info';
    const calloutIcon = (block.properties?.icon as string) || '💡';
    const themeClasses: Record<string, string> = {
      info: 'bg-sky-500/10 border-sky-500/30 text-sky-200',
      warn: 'bg-amber-500/10 border-amber-500/30 text-amber-200',
      success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200',
      tip: 'bg-violet-500/10 border-violet-500/30 text-violet-200',
    };
    const themeClass = themeClasses[calloutTheme] || themeClasses['info'];
    const CALLOUT_ICONS = ['💡', '📌', '⚠️', '✅', '📢', '🔥', '❗', '🎯', '📝', '🚀'];
    // showIconPicker / setShowIconPicker 来自顶层 state（已声明在组件顶部）

    return (
      <div
        id={`block-${block.id}`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`group relative flex items-start py-1 my-0.5 ${
          isDragging ? 'opacity-30 scale-[0.99] transition-all' : ''
        }`}
      >
        {renderDropIndicator()}
        {renderSideHandle('top-1')}

        {/* 主体卡片 */}
        <div className={`flex-1 flex items-start gap-3 p-3 rounded-xl border ${themeClass}`}>
          {/* 图标选择器 */}
          <div className="relative shrink-0">
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setShowIconPicker(!showIconPicker)}
              className="text-xl hover:bg-white/10 p-1 rounded-lg transition-colors leading-none select-none"
              title="更换图标"
            >
              {calloutIcon}
            </button>
            {showIconPicker && (
              <div className="absolute left-0 top-full mt-1 bg-slate-900/95 border border-white/15 rounded-xl shadow-2xl p-2 z-50 flex flex-wrap gap-1 w-44 backdrop-blur-md animate-in fade-in duration-100">
                {CALLOUT_ICONS.map((ico) => (
                  <button
                    key={ico}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      onUpdate(block.content, 'callout', { ...block.properties, icon: ico }, true);
                      setShowIconPicker(false);
                    }}
                    className="text-lg p-1.5 hover:bg-white/10 rounded-lg transition-transform hover:scale-110"
                  >
                    {ico}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 可编辑内容区 */}
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
            style={{ textAlign: (block.format?.textAlign as any) || 'left' }}
            className="flex-1 outline-none focus:outline-none min-h-[1.5rem] cursor-text select-text text-base leading-relaxed break-words"
          />
        </div>

        {/* 主题切换微胶囊（悬停显示） */}
        <div className="absolute right-0 top-1 opacity-0 group-hover:opacity-100 transition-opacity select-none flex gap-0.5 mr-1">
          {(['info', 'warn', 'success', 'tip'] as const).map((t) => (
            <button
              key={t}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onUpdate(block.content, 'callout', { ...block.properties, theme: t }, true)}
              className={`w-3 h-3 rounded-full border border-white/20 transition-transform hover:scale-125 ${
                t === 'info' ? 'bg-sky-400' : t === 'warn' ? 'bg-amber-400' : t === 'success' ? 'bg-emerald-400' : 'bg-violet-400'
              } ${calloutTheme === t ? 'scale-125 ring-1 ring-white/50' : ''}`}
              title={t}
            />
          ))}
        </div>

        {/* 划选浮动微光工具栏 */}
        {floatingToolbarOpen && (
          <FloatingFormatToolbar
            position={floatingToolbarPos}
            onApplyFormat={handleApplyFormat}
            onApplyLink={handleApplyLink}
            onApplyHighlight={handleApplyHighlight}
            onApplyAlign={handleApplyAlign}
            onClose={() => setFloatingToolbarOpen(false)}
          />
        )}

        {/* 划选右键菜单 */}
        {contextMenuOpen && (
          <BlockContextMenu
            position={contextMenuPos}
            hasSelection={Boolean(savedSelectionText)}
            selectedText={savedSelectionText}
            currentBlockType={block.blockType}
            onApplyFormat={handleApplyFormat}
            onApplyLink={handleApplyLink}
            onApplyHighlight={handleApplyHighlight}
            onTurnInto={handleTurnInto}
            onCopy={handleCopy}
            onCut={handleCut}
            onClose={() => setContextMenuOpen(false)}
          />
        )}
      </div>
    );
  }

  // 分隔线特殊渲染
  if (block.blockType === 'divider') {
    return (
      <div
        id={`block-${block.id}`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`group relative flex items-center py-2 my-1 ${
          isDragging ? 'opacity-30 scale-[0.99] transition-all' : ''
        }`}
      >
        {renderDropIndicator()}
        {renderSideHandle('top-1')}
        <div className="flex-1 h-px bg-white/10" />
      </div>
    );
  }

  // 数据表格块特殊渲染 (Simple Table Block)
  if (block.blockType === 'table') {
    return (
      <div
        id={`block-${block.id}`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`group relative flex items-start py-1 ${
          isDragging ? 'opacity-30 scale-[0.99] transition-all' : ''
        }`}
      >
        {renderDropIndicator()}
        {renderSideHandle('top-3')}
        <div className="flex-1 min-w-0">
          <TableBlock block={block} onUpdate={onUpdate} onDelete={onDelete} />
        </div>
      </div>
    );
  }

  // 思维导图嵌入卡片 (MindMap Block)
  if (block.blockType === 'mindmap') {
    return (
      <div
        id={`block-${block.id}`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`group relative flex items-start py-1 ${
          isDragging ? 'opacity-30 scale-[0.99] transition-all' : ''
        }`}
      >
        {renderDropIndicator()}
        {renderSideHandle('top-3')}
        <div className="flex-1 min-w-0">
          <MindMapEmbedBlock block={block} onUpdate={onUpdate} onDelete={onDelete} />
        </div>
      </div>
    );
  }

  // 数学公式卡片 (Math Block)
  if (block.blockType === 'math') {
    return (
      <div
        id={`block-${block.id}`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`group relative flex items-start py-1 ${
          isDragging ? 'opacity-30 scale-[0.99] transition-all' : ''
        }`}
      >
        {renderDropIndicator()}
        {renderSideHandle('top-3')}
        <div className="flex-1 min-w-0">
          <MathBlock block={block} onUpdate={onUpdate} onDelete={onDelete} />
        </div>
      </div>
    );
  }

  // 多栏排版卡片 (Multi-Column Block)
  if (block.blockType === 'columns') {
    return (
      <div
        id={`block-${block.id}`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`group relative flex items-start py-1 ${
          isDragging ? 'opacity-30 scale-[0.99] transition-all' : ''
        }`}
      >
        {renderDropIndicator()}
        {renderSideHandle('top-3')}
        <div className="flex-1 min-w-0">
          <MultiColumnBlock block={block} onUpdate={onUpdate} onDelete={onDelete} />
        </div>
      </div>
    );
  }

  // 正文内嵌动态目录卡片 (TOC Block)
  if (block.blockType === 'toc') {
    return (
      <div
        id={`block-${block.id}`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`group relative flex items-start py-1 ${
          isDragging ? 'opacity-30 scale-[0.99] transition-all' : ''
        }`}
      >
        {renderDropIndicator()}
        {renderSideHandle('top-3')}
        <div className="flex-1 min-w-0">
          <TableOfContentsBlock
            allBlocks={allBlocks || []}
            onScrollToHeading={onScrollToHeading}
            onDelete={onDelete}
          />
        </div>
      </div>
    );
  }

  // 图片块渲染（支持本地上传 base64 与网络图片 URL 嵌入）
  if (block.blockType === 'image') {
    const src = block.properties?.src as string | undefined;
    const caption = (block.properties?.caption as string) || '';
    const align = (block.format?.textAlign as 'left' | 'center' | 'right') || 'left';

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        onUpdate(block.content, 'image', { ...block.properties, src: base64 }, true);
      };
      reader.readAsDataURL(file);
    };

    const handleConfirmUrl = () => {
      const url = imageUrlInput.trim();
      if (!url) return;
      onUpdate(block.content, 'image', { ...block.properties, src: url }, true);
      setImageUrlInput('');
    };

    if (!src) {
      return (
        <div
          id={`block-${block.id}`}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`group relative flex items-start py-2 my-1 ${
            isDragging ? 'opacity-30 scale-[0.99] transition-all' : ''
          }`}
        >
          {renderDropIndicator()}
          {renderSideHandle('top-2')}

          {/* 空状态：优雅浅灰边框卡片 */}
          <div className="flex-1 p-5 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] hover:bg-white/[0.04] transition-all flex flex-col items-center justify-center gap-3.5 text-center">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
              <ImageIcon size={20} />
            </div>
            <div>
              <div className="text-xs font-medium text-slate-200">添加图片</div>
              <div className="text-[11px] text-slate-500 mt-0.5">支持上传本地图片或嵌入网络图片 URL</div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 w-full max-w-md pt-1">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                <Upload size={13} className="text-pink-400" />
                <span>点击上传本地图片</span>
              </button>

              <span className="text-[11px] text-slate-600">或</span>

              <div className="flex items-center gap-1.5 flex-1 min-w-[200px]">
                <input
                  type="text"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleConfirmUrl();
                    }
                  }}
                  placeholder="输入网络图片 URL..."
                  className="flex-1 px-3 py-1.5 bg-black/40 border border-white/15 rounded-xl text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-pink-500/50 transition-colors"
                />
                <button
                  type="button"
                  onClick={handleConfirmUrl}
                  className="px-3 py-1.5 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 hover:text-pink-200 text-xs font-medium transition-colors cursor-pointer shrink-0"
                >
                  插入
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        id={`block-${block.id}`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`group relative py-2 my-1.5 ${
          isDragging ? 'opacity-30 scale-[0.99] transition-all' : ''
        }`}
        style={{ textAlign: align }}
      >
        {renderDropIndicator()}
        {renderSideHandle('top-2')}

        {/* 已载入图片主体 */}
        <div className="relative inline-block max-w-full">
          <img
            src={src}
            alt={caption || 'image'}
            className="rounded-xl border border-white/10 max-h-[500px] object-contain mx-auto shadow-lg"
          />

          {/* 悬停显示「更换」与「删除」小胶囊（含快速对齐） */}
          <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity select-none flex items-center gap-1 bg-slate-950/80 backdrop-blur-md border border-white/15 rounded-lg px-2 py-1 shadow-xl z-10">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-white px-1.5 py-0.5 rounded hover:bg-white/10 transition-colors cursor-pointer"
              title="更换本地图片"
            >
              <RefreshCw size={11} className="text-pink-400" />
              <span>更换</span>
            </button>
            <div className="w-px h-3 bg-white/20" />
            <button
              type="button"
              onClick={() => handleApplyAlign('left')}
              className={`p-1 rounded hover:bg-white/10 transition-colors ${align === 'left' ? 'text-sky-400' : 'text-slate-400'}`}
              title="左对齐"
            >
              <AlignLeft size={11} />
            </button>
            <button
              type="button"
              onClick={() => handleApplyAlign('center')}
              className={`p-1 rounded hover:bg-white/10 transition-colors ${align === 'center' ? 'text-sky-400' : 'text-slate-400'}`}
              title="居中"
            >
              <AlignCenter size={11} />
            </button>
            <button
              type="button"
              onClick={() => handleApplyAlign('right')}
              className={`p-1 rounded hover:bg-white/10 transition-colors ${align === 'right' ? 'text-sky-400' : 'text-slate-400'}`}
              title="右对齐"
            >
              <AlignRight size={11} />
            </button>
            <div className="w-px h-3 bg-white/20" />
            <button
              type="button"
              onClick={onDelete}
              className="flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 px-1.5 py-0.5 rounded hover:bg-white/10 transition-colors cursor-pointer"
              title="删除图片块"
            >
              <Trash2 size={11} />
              <span>删除</span>
            </button>
          </div>
        </div>

        {/* 下方提供可编辑的 Caption 输入框 */}
        <div className="mt-1.5 max-w-full">
          <input
            type="text"
            value={caption}
            onChange={(e) => {
              onUpdate(
                block.content,
                'image',
                { ...block.properties, caption: e.target.value },
                false
              );
            }}
            placeholder="添加图片说明 (Caption)..."
            className="w-full max-w-md bg-transparent border-none outline-none text-xs text-slate-400 placeholder-slate-600 focus:text-slate-200 transition-colors inline-block"
            style={{ textAlign: align }}
          />
        </div>
      </div>
    );
  }

  const isChecked = Boolean(block.properties?.checked);

  return (
    <div
      id={`block-${block.id}`}
      onContextMenu={handleContextMenu}
      onClick={handleBlockClick}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`group relative flex items-start ${getBlockMarginClass()} ${
        isDragging ? 'opacity-30 scale-[0.99] transition-all' : ''
      }`}
    >
      {renderDropIndicator()}
      {renderSideHandle('top-1')}

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

      {/* 有序列表序号 */}
      {block.blockType === 'numbered' && (
        <div className="pt-[3px] pr-2 shrink-0 select-none min-w-[1.5rem] text-right">
          <span className="text-sm font-mono text-slate-400">{seqNumber ?? 1}.</span>
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
        const isLineNumbersEnabled = block.properties?.lineNumbers !== false;
        const viewMode = (block.properties?.viewMode as 'code' | 'preview') || (currentLang === 'mermaid' ? 'preview' : 'code');

        return (
          <div
            className={`flex-1 min-w-0 ${
              block.blockType === 'code'
                ? 'my-3.5 rounded-2xl bg-[#0d1117] border border-white/[0.08] shadow-2xl overflow-hidden group/code transition-all hover:border-white/[0.14] focus-within:border-sky-500/40 focus-within:ring-1 focus-within:ring-sky-500/20'
                : ''
            }`}
            style={{ textAlign: (block.format?.textAlign as any) || 'left' }}
          >
            {/* 现代化独立代码块 Header 控制栏 */}
            {block.blockType === 'code' && (
              <div className="h-9 px-3 bg-[#161b22]/90 border-b border-white/[0.06] flex items-center justify-between select-none">
                {/* 左侧语言选择 Pill */}
                <div className="relative">
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setShowLangMenu(!showLangMenu)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[11px] font-mono text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="切换编程语言"
                  >
                    <span className="font-medium">
                      {SUPPORTED_CODE_LANGUAGES.find((l) => l.id === currentLang)?.name || currentLang}
                    </span>
                    <ChevronDown size={11} className="opacity-60" />
                  </button>

                  {showLangMenu && (
                    <div
                      onMouseDown={(e) => e.preventDefault()}
                      className="absolute left-0 top-full mt-1.5 w-40 max-h-60 overflow-y-auto bg-[#161b22] border border-white/10 rounded-xl shadow-2xl py-1.5 z-50 text-xs backdrop-blur-md"
                    >
                      {SUPPORTED_CODE_LANGUAGES.map((lang) => (
                        <button
                          key={lang.id}
                          type="button"
                          onClick={() => {
                            const currentText = editorRef.current?.innerText ?? block.content;
                            const isFocused = document.activeElement === editorRef.current;
                            const caret = isFocused && editorRef.current ? getCaretOffset(editorRef.current) : null;
                            const nextLang = lang.id;
                            if (editorRef.current) {
                              editorRef.current.innerHTML = highlightCode(currentText, nextLang);
                              if (isFocused && caret) {
                                restoreCaretOffset(editorRef.current, caret);
                              }
                            }
                            onUpdate(
                              currentText,
                              'code',
                              { ...block.properties, language: nextLang },
                              true
                            );
                            setShowLangMenu(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 hover:bg-sky-500/15 flex items-center justify-between transition-colors ${
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

                {/* 右侧操作胶囊栏 */}
                <div className="flex items-center gap-1 text-[11px]">
                  {/* Mermaid 双模切换胶囊 */}
                  {currentLang === 'mermaid' && (
                    <div className="flex items-center p-0.5 bg-black/40 border border-white/10 rounded-md mr-1">
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          onUpdate(
                            editorRef.current?.innerText || block.content,
                            'code',
                            { ...block.properties, viewMode: 'code' },
                            true
                          );
                        }}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] transition-colors cursor-pointer ${
                          viewMode === 'code'
                            ? 'bg-sky-500/20 text-sky-300 font-medium'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                        title="查看/编辑 Mermaid 源码"
                      >
                        <CodeIcon size={11} />
                        <span>源码</span>
                      </button>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          onUpdate(
                            editorRef.current?.innerText || block.content,
                            'code',
                            { ...block.properties, viewMode: 'preview' },
                            true
                          );
                        }}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] transition-colors cursor-pointer ${
                          viewMode === 'preview'
                            ? 'bg-sky-500/20 text-sky-300 font-medium'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                        title="查看 Mermaid 架构流程图"
                      >
                        <Workflow size={11} />
                        <span>架构图</span>
                      </button>
                    </div>
                  )}

                  {/* 代码换行切换 */}
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      onUpdate(
                        editorRef.current?.innerText || block.content,
                        'code',
                        { ...block.properties, wrap: !isWrap },
                        true
                      );
                    }}
                    className={`flex items-center gap-1 px-2 py-1 rounded-md border text-[11px] transition-colors cursor-pointer ${
                      isWrap
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                        : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-slate-200 border-white/[0.08]'
                    }`}
                    title={isWrap ? '代码自动换行中 (点击切换为横向滚动)' : '保持单行横向滚动 (点击切换为自动换行)'}
                  >
                    <WrapText size={12} />
                    <span className="hidden sm:inline">{isWrap ? '换行' : '不换行'}</span>
                  </button>

                  {/* 行号显示切换 */}
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      onUpdate(
                        editorRef.current?.innerText || block.content,
                        'code',
                        { ...block.properties, lineNumbers: !isLineNumbersEnabled },
                        true
                      );
                    }}
                    className={`flex items-center gap-1 px-2 py-1 rounded-md border text-[11px] transition-colors cursor-pointer ${
                      isLineNumbersEnabled
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                        : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-slate-200 border-white/[0.08]'
                    }`}
                    title={isLineNumbersEnabled ? '隐藏行号' : '显示行号'}
                  >
                    <ListOrdered size={12} />
                    <span className="hidden sm:inline">行号</span>
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
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="复制代码到剪贴板"
                  >
                    {copiedCode ? (
                      <>
                        <Check size={12} className="text-emerald-400" />
                        <span className="text-[11px] text-emerald-400 font-medium">已复制</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span className="text-[11px]">复制</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {block.blockType === 'code' ? (
              currentLang === 'mermaid' && viewMode === 'preview' ? (
                <MermaidPreview
                  code={block.content}
                  onSwitchToCode={() => {
                    onUpdate(
                      block.content,
                      'code',
                      { ...block.properties, viewMode: 'code' },
                      true
                    );
                  }}
                />
              ) : (
                <div className="flex font-mono text-[13px] leading-[22px] tracking-normal bg-[#0d1117] py-3 overflow-hidden">
                  {/* 行号呈现列：强制 1:1 锁死 line-height 与 padding */}
                  {isLineNumbersEnabled && (
                    <div
                      className="select-none px-3.5 text-right text-slate-600 font-mono text-[13px] leading-[22px] border-r border-white/[0.06] shrink-0 tabular-nums"
                      style={{ minWidth: '3rem' }}
                      aria-hidden="true"
                    >
                      {Array.from({ length: lineCount }, (_, i) => (
                        <div key={i + 1} className="leading-[22px] select-none">
                          {i + 1}
                        </div>
                      ))}
                    </div>
                  )}
                  {/* 代码编辑区 */}
                  <div
                    ref={editorRef}
                    contentEditable={true}
                    suppressContentEditableWarning={true}
                    onInput={handleInput}
                    onKeyDown={handleKeyDown}
                    onKeyUp={checkSelection}
                    onMouseUp={handleMouseUp}
                    onPaste={handlePaste}
                    onCompositionStart={() => {
                      isComposingRef.current = true;
                    }}
                    onCompositionEnd={() => {
                      isComposingRef.current = false;
                      handleInput();
                    }}
                    onContextMenu={handleContextMenu}
                    data-placeholder={getPlaceholder()}
                    className={`flex-1 px-4 outline-none focus:outline-none min-h-[1.5rem] cursor-text select-text ${getBlockStyle()} ${
                      isWrap
                        ? 'whitespace-pre-wrap break-words'
                        : 'whitespace-pre overflow-x-auto no-scrollbar'
                    }`}
                  />
                </div>
              )
            ) : (
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
                style={{ textAlign: (block.format?.textAlign as any) || 'left' }}
                className={`w-full outline-none focus:outline-none min-h-[1.5rem] cursor-text select-text ${getBlockStyle()} break-words ${
                  isChecked && block.blockType === 'todo' ? 'line-through text-slate-500' : ''
                }`}
              />
            )}
          </div>
        );
      })()}

      {/* 划选即时浮动微光工具栏 */}
      {floatingToolbarOpen && (
        <FloatingFormatToolbar
          position={floatingToolbarPos}
          onApplyFormat={handleApplyFormat}
          onApplyLink={handleApplyLink}
          onApplyHighlight={handleApplyHighlight}
          onApplyAlign={handleApplyAlign}
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

      {/* 双向页面链接菜单 */}
      {mentionMenuOpen && pages && (
        <PageMentionMenu
          pages={pages.filter((p) => p.id !== block.pageId)}
          query={mentionQuery}
          position={mentionMenuPos}
          selectedIndex={mentionSelectedIndex}
          setSelectedIndex={setMentionSelectedIndex}
          onSelectPage={handleSelectPageMention}
          onClose={() => setMentionMenuOpen(false)}
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
          onApplyLink={handleApplyLink}
          onApplyHighlight={handleApplyHighlight}
          onTurnInto={handleTurnInto}
          onCopy={handleCopy}
          onCut={handleCut}
          onClose={() => setContextMenuOpen(false)}
        />
      )}
    </div>
  );
};
