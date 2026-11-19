import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  X,
  FileText,
  Code,
  Table,
  CheckSquare,
  Heading,
  Quote,
  CornerDownLeft,
  ArrowUp,
  ArrowDown,
  Layers,
} from 'lucide-react';
import { DocPage, DocBlock, BlockType } from '../../types/docs.ts';

interface SearchResultItem {
  id: string; // pageId + blockId
  pageId: string;
  pageTitle: string;
  pageIcon?: string;
  blockId?: string;
  blockType: BlockType | 'page_title';
  snippet: string;
  matchIndex: number;
}

interface DocGlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  pages: DocPage[];
  onNavigateToBlock: (pageId: string, blockId?: string) => void;
}

type FilterCategory = 'all' | 'p' | 'code' | 'table' | 'todo' | 'heading';

export const DocGlobalSearchModal: React.FC<DocGlobalSearchModalProps> = ({
  isOpen,
  onClose,
  pages,
  onNavigateToBlock,
}) => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // 打开时自动聚焦并清空
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // 全库扫描与匹配逻辑
  const searchResults = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return [];

    const activePages = pages.filter((p) => !p.isDeleted);
    const results: SearchResultItem[] = [];

    for (const page of activePages) {
      // 1. 匹配页面标题
      if (page.title && page.title.toLowerCase().includes(trimmed)) {
        if (activeCategory === 'all' || activeCategory === 'heading') {
          results.push({
            id: `${page.id}_title`,
            pageId: page.id,
            pageTitle: page.title,
            pageIcon: page.icon,
            blockType: 'page_title',
            snippet: page.title,
            matchIndex: page.title.toLowerCase().indexOf(trimmed),
          });
        }
      }

      // 2. 匹配页面块内容
      const blocksRaw = localStorage.getItem(`selfwork_doc_blocks_${page.id}`);
      if (!blocksRaw) continue;

      let blocks: DocBlock[] = [];
      try {
        blocks = JSON.parse(blocksRaw);
      } catch {
        continue;
      }

      for (const block of blocks) {
        // 类别过滤
        if (activeCategory === 'p' && block.blockType !== 'p') continue;
        if (activeCategory === 'code' && block.blockType !== 'code') continue;
        if (activeCategory === 'table' && block.blockType !== 'table') continue;
        if (activeCategory === 'todo' && block.blockType !== 'todo') continue;
        if (
          activeCategory === 'heading' &&
          !['h1', 'h2', 'h3'].includes(block.blockType)
        ) {
          continue;
        }

        // 提取文本内容
        let fullText = (block.content || '').replace(/<[^>]+>/g, ' ');

        // 表格内容附加
        if (block.blockType === 'table' && block.properties?.rows) {
          const rows = block.properties.rows as string[][];
          fullText += ' ' + rows.map((r) => r.join(' ')).join(' ');
        }

        const lowerText = fullText.toLowerCase();
        const matchIdx = lowerText.indexOf(trimmed);
        if (matchIdx !== -1) {
          // 截取关键词上下文片段 (前后约 35 字符)
          const start = Math.max(0, matchIdx - 25);
          const end = Math.min(fullText.length, matchIdx + trimmed.length + 35);
          const snippet =
            (start > 0 ? '...' : '') +
            fullText.slice(start, end).trim() +
            (end < fullText.length ? '...' : '');

          results.push({
            id: `${page.id}_${block.id}`,
            pageId: page.id,
            pageTitle: page.title,
            pageIcon: page.icon,
            blockId: block.id,
            blockType: block.blockType,
            snippet,
            matchIndex: matchIdx,
          });

          if (results.length >= 80) break; // 性能上限
        }
      }
      if (results.length >= 80) break;
    }

    return results;
  }, [query, pages, activeCategory]);

  // 结果发生变化时重置选中索引
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchResults.length, activeCategory]);

  // 键盘快捷导航
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
      return;
    }

    if (searchResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % searchResults.length);
      scrollItemIntoView((selectedIndex + 1) % searchResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(
        (prev) => (prev - 1 + searchResults.length) % searchResults.length
      );
      scrollItemIntoView(
        (selectedIndex - 1 + searchResults.length) % searchResults.length
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const current = searchResults[selectedIndex];
      if (current) {
        onNavigateToBlock(current.pageId, current.blockId);
        onClose();
      }
    }
  };

  const scrollItemIntoView = (index: number) => {
    if (!listRef.current) return;
    const items = listRef.current.querySelectorAll('.search-result-item');
    if (items[index]) {
      items[index].scrollIntoView({ block: 'nearest' });
    }
  };

  // 高亮匹配文字
  const renderHighlightedSnippet = (snippet: string, targetQuery: string) => {
    if (!targetQuery) return snippet;
    const parts = snippet.split(new RegExp(`(${targetQuery})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === targetQuery.toLowerCase() ? (
        <span
          key={i}
          className="text-amber-300 bg-amber-400/20 font-medium px-0.5 rounded"
        >
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const getBlockTypeIcon = (type: BlockType | 'page_title') => {
    switch (type) {
      case 'page_title':
        return <FileText size={13} className="text-sky-400" />;
      case 'code':
        return <Code size={13} className="text-emerald-400" />;
      case 'table':
        return <Table size={13} className="text-purple-400" />;
      case 'todo':
        return <CheckSquare size={13} className="text-amber-400" />;
      case 'h1':
      case 'h2':
      case 'h3':
        return <Heading size={13} className="text-rose-400" />;
      case 'quote':
        return <Quote size={13} className="text-indigo-400" />;
      default:
        return <FileText size={13} className="text-slate-400" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/60 backdrop-blur-sm select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-slate-900/95 border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* 顶部搜索框 */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-white/[0.02]">
          <Search size={16} className="text-sky-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="全库模糊检索（支持代码、表格、标题、待办...）"
            className="flex-1 bg-transparent border-none text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="p-1 text-slate-500 hover:text-slate-300 rounded"
            >
              <X size={14} />
            </button>
          )}
          <kbd className="px-1.5 py-0.5 text-[10px] text-slate-400 bg-white/5 border border-white/10 rounded font-mono">
            ESC
          </kbd>
        </div>

        {/* 块类型分类胶囊栏 */}
        <div className="flex items-center gap-1.5 px-3 py-2 border-b border-white/5 bg-black/20 text-xs overflow-x-auto">
          {[
            { id: 'all', label: '全部', icon: <Layers size={11} /> },
            { id: 'p', label: '正文', icon: <FileText size={11} /> },
            { id: 'code', label: '代码', icon: <Code size={11} /> },
            { id: 'table', label: '表格', icon: <Table size={11} /> },
            { id: 'todo', label: '待办', icon: <CheckSquare size={11} /> },
            { id: 'heading', label: '标题', icon: <Heading size={11} /> },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as FilterCategory)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] transition-colors ${
                activeCategory === cat.id
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 font-medium'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          ))}
          <span className="ml-auto text-[10px] text-slate-500">
            {searchResults.length} 条匹配
          </span>
        </div>

        {/* 搜索结果列表 */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-2 space-y-1">
          {query.trim() === '' ? (
            <div className="py-12 flex flex-col items-center justify-center text-xs text-slate-500 gap-1.5">
              <Search size={22} className="text-slate-600 mb-1" />
              <span>输入关键字以检索全库文档及多维块内容</span>
              <span className="text-[10px] text-slate-600 font-mono">
                快捷键: Ctrl + Shift + F 随时唤出
              </span>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-xs text-slate-500">
              <span>未在全库找到相关匹配内容</span>
            </div>
          ) : (
            searchResults.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onNavigateToBlock(item.pageId, item.blockId);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`search-result-item flex items-start gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-sky-500/15 border border-sky-500/30 text-white'
                      : 'hover:bg-white/5 text-slate-300'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {getBlockTypeIcon(item.blockType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-300 truncate">
                      <span>{item.pageIcon || '📄'}</span>
                      <span className="truncate">{item.pageTitle}</span>
                      <span className="text-[10px] text-slate-500 ml-auto font-mono">
                        {item.blockType === 'page_title' ? '标题' : item.blockType}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {renderHighlightedSnippet(item.snippet, query.trim())}
                    </div>
                  </div>
                  {isSelected && (
                    <CornerDownLeft
                      size={12}
                      className="text-sky-400 shrink-0 self-center opacity-70"
                    />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* 底部按键提示栏 */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-white/5 bg-black/40 text-[10px] text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-white/5 border border-white/10 rounded font-mono">
                <ArrowUp size={9} className="inline" />
              </kbd>
              <kbd className="px-1 py-0.5 bg-white/5 border border-white/10 rounded font-mono">
                <ArrowDown size={9} className="inline" />
              </kbd>
              <span>移动</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-white/5 border border-white/10 rounded font-mono">
                Enter
              </kbd>
              <span>跳转</span>
            </span>
          </div>
          <span>SelfWork 全库实时索引</span>
        </div>
      </div>
    </div>
  );
};
