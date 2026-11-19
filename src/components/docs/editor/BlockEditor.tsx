import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { DocPage, DocBlock, BlockType, DocSnapshot } from '../../../types/docs.ts';
import { BlockItem } from './BlockItem.tsx';
import { loadDocBlocks, saveDocBlocks } from '../../../services/docsDb.ts';
import { exportBlocksToMarkdown } from '../../../services/markdownExport.ts';
import { exportBlocksToHtml } from '../../../services/htmlExport.ts';
import { DocTemplatePicker } from './DocTemplatePicker.tsx';
import { DocTemplateDefinition } from '../../../services/docTemplates.ts';
import { DocHistoryDrawer } from './DocHistoryDrawer.tsx';
import { saveDocSnapshot } from '../../../services/docHistory.ts';
import { BacklinksPanel } from './BacklinksPanel.tsx';
import { DocLocalGraph } from './DocLocalGraph.tsx';
import { DocCommentDrawer } from './DocCommentDrawer.tsx';
import { getCommentsForPage, addComment } from '../../../services/docComments.ts';
import {
  FileText,
  ListTree,
  Share2,
  MessageSquare,
  PanelRightClose,
  PanelRightOpen,
  Undo2,
  Redo2,
  Download,
  Image as ImageIcon,
  Trash2,
  X,
  Check,
  Palette,
  Search,
  Sparkles,
  History,
  Printer,
  ChevronDown,
  ChevronRight,
  ChevronsDown,
  ChevronsUp,
  Clock,
} from 'lucide-react';
import { FindReplaceBar } from './FindReplaceBar.tsx';
import { DocStatsBadge } from './DocStatsBadge.tsx';

interface BlockEditorProps {
  page: DocPage;
  onUpdatePageTitle: (title: string) => void;
  onUpdatePageIcon?: (icon: string) => void;
  onUpdatePageCover?: (cover: string) => void;
  pages?: DocPage[];
  onNavigatePage?: (pageId: string) => void;
}

const EMOJI_OPTIONS = ['📝', '🚀', '🎯', '💡', '📌', '⚡', '📊', '🔥', '💻', '✨'];

export const PRESET_COVERS = [
  { id: 'space', name: '深空', value: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)' },
  { id: 'aurora', name: '极光', value: 'linear-gradient(135deg, #022c22 0%, #064e3b 50%, #0f766e 100%)' },
  { id: 'sunset', name: '暮落', value: 'linear-gradient(135deg, #450a0a 0%, #7c2d12 50%, #b45309 100%)' },
  { id: 'violet', name: '电紫', value: 'linear-gradient(135deg, #2e1065 0%, #581c87 50%, #7e22ce 100%)' },
  { id: 'midnight', name: '湛夜', value: 'linear-gradient(135deg, #082f49 0%, #0369a1 50%, #0284c7 100%)' },
  { id: 'emerald', name: '林郁', value: 'linear-gradient(135deg, #052e16 0%, #14532d 50%, #166534 100%)' },
  { id: 'neon', name: '绛夜', value: 'linear-gradient(135deg, #4c0519 0%, #831843 50%, #9d174d 100%)' },
  { id: 'obsidian', name: '黑曜', value: 'linear-gradient(135deg, #18181b 0%, #27272a 50%, #3f3f46 100%)' },
];

interface OutlineItem {
  id: string;
  type: BlockType;
  text: string;
}

export const BlockEditor: React.FC<BlockEditorProps> = ({
  page,
  onUpdatePageTitle,
  onUpdatePageIcon,
  onUpdatePageCover,
  pages,
  onNavigatePage,
}) => {
  const [blocks, setBlocks] = useState<DocBlock[]>([]);
  const [, setLoading] = useState(true);
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const [customCoverUrl, setCustomCoverUrl] = useState('');
  const [showOutline, setShowOutlineState] = useState(() => {
    const saved = localStorage.getItem('selfwork_doc_outline_visible');
    if (saved !== null) return saved === 'true';
    return typeof window !== 'undefined' ? window.innerWidth >= 1440 : false;
  });

  const setShowOutline = (val: boolean | ((prev: boolean) => boolean)) => {
    setShowOutlineState((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      localStorage.setItem('selfwork_doc_outline_visible', String(next));
      return next;
    });
  };
  const titleInputRef = useRef<HTMLInputElement>(null);

  // 全局查找与替换状态 (Ctrl + F)
  const [isFindOpen, setIsFindOpen] = useState(false);
  const [findQuery, setFindQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  // 块拖拽重排交互状态 (Drag & Drop Reordering)
  const [draggingBlockId, setDraggingBlockId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{ blockId: string; position: 'top' | 'bottom' } | null>(null);

  // 目录大纲智能层级过滤与 ScrollSpy 导航
  const [rightPanelTab, setRightPanelTab] = useState<'toc' | 'graph'>('toc');
  const [outlineFilter, setOutlineFilter] = useState<'all' | 'h1' | 'h1-h2'>('all');
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);
  // 目录父子级标题折叠状态集合
  const [collapsedHeadingIds, setCollapsedHeadingIds] = useState<Set<string>>(new Set());
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 模板库与版本历史状态
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [previewSnapshot, setPreviewSnapshot] = useState<DocSnapshot | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const isEmptyDoc = blocks.length <= 1 && (blocks[0]?.content.trim() === '' || blocks.length === 0);

  // 行内批注与评论流状态
  const [showCommentDrawer, setShowCommentDrawer] = useState(false);
  const [unresolvedCommentCount, setUnresolvedCommentCount] = useState(0);

  useEffect(() => {
    setUnresolvedCommentCount(
      getCommentsForPage(page.id).filter((c) => !c.isResolved).length
    );
  }, [page.id, showCommentDrawer]);

  const handleAddComment = (selectedText: string, blockId: string) => {
    addComment(page.id, selectedText, '请在此输入批注思考...', '当前用户', blockId);
    setShowCommentDrawer(true);
    setUnresolvedCommentCount(
      getCommentsForPage(page.id).filter((c) => !c.isResolved).length
    );
  };

  // 全局折叠块统计与一键收展
  const toggleCount = blocks.filter((b) => b.blockType === 'toggle').length;
  const handleToggleFoldAll = (isOpen: boolean) => {
    const nextBlocks = blocks.map((b) => {
      if (b.blockType === 'toggle') {
        return {
          ...b,
          properties: { ...(b.properties || {}), isOpen },
        };
      }
      return b;
    });
    setBlocks(nextBlocks);
    saveDocBlocks(page.id, nextBlocks).catch(() => {});
  };

  // 监听 Ctrl + F / Cmd + F 唤起查找与替换
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'f' || e.key === 'F')) {
        e.preventDefault();
        setIsFindOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 当封面选择器打开时，同步已有自定义图片链接
  useEffect(() => {
    if (showCoverPicker) {
      if (page.cover && !page.cover.startsWith('linear-gradient')) {
        setCustomCoverUrl(page.cover);
      } else {
        setCustomCoverUrl('');
      }
    }
  }, [showCoverPicker, page.cover]);

  // 引用最新 blocks 状态，杜绝闭包陈旧问题
  const blocksRef = useRef<DocBlock[]>(blocks);
  blocksRef.current = blocks;

  // 历史栈 (Undo / Redo)
  const undoStackRef = useRef<DocBlock[][]>([]);
  const redoStackRef = useRef<DocBlock[][]>([]);
  const lastTypingTimeRef = useRef<number>(0);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 压入 Undo 栈
  const pushUndo = useCallback((snapshot: DocBlock[]) => {
    undoStackRef.current.push(JSON.parse(JSON.stringify(snapshot)));
    if (undoStackRef.current.length > 50) {
      undoStackRef.current.shift();
    }
    redoStackRef.current = [];
  }, []);

  // 执行撤销 (Ctrl+Z)
  const handleUndo = useCallback(async () => {
    if (undoStackRef.current.length === 0) return;
    const previous = undoStackRef.current.pop()!;
    redoStackRef.current.push(JSON.parse(JSON.stringify(blocksRef.current)));
    setBlocks(previous);
    blocksRef.current = previous;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    await saveDocBlocks(page.id, previous);
  }, [page.id]);

  // 执行重做 (Ctrl+Y / Ctrl+Shift+Z)
  const handleRedo = useCallback(async () => {
    if (redoStackRef.current.length === 0) return;
    const next = redoStackRef.current.pop()!;
    undoStackRef.current.push(JSON.parse(JSON.stringify(blocksRef.current)));
    setBlocks(next);
    blocksRef.current = next;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    await saveDocBlocks(page.id, next);
  }, [page.id]);

  // 导出为 Markdown 文件
  const handleExportMarkdown = useCallback(() => {
    const md = exportBlocksToMarkdown(page.title, page.icon, blocksRef.current);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${page.title || 'untitled'}.md`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  }, [page.title, page.icon]);

  // 导出为独立完整 HTML 文件
  const handleExportHtml = useCallback(() => {
    const html = exportBlocksToHtml(page.title, page.icon, blocksRef.current);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${page.title || 'untitled'}.html`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  }, [page.title, page.icon]);

  // 触发高保真打印 / 另存为 PDF
  const handlePrintPdf = useCallback(() => {
    setShowExportMenu(false);
    setTimeout(() => {
      window.print();
    }, 120);
  }, []);

  // 模板选择与原子注入
  const handleSelectTemplate = useCallback(
    (template: DocTemplateDefinition) => {
      const newBlocks = template.buildBlocks(page.id);
      pushUndo(blocksRef.current);
      setBlocks(newBlocks);
      blocksRef.current = newBlocks;
      saveDocBlocks(page.id, newBlocks);
      saveDocSnapshot(page.id, newBlocks, `应用模板: ${template.name}`);
      setShowTemplatePicker(false);
    },
    [page.id, pushUndo]
  );

  // 历史版本快照恢复
  const handleRestoreSnapshot = useCallback(
    (restoredBlocks: DocBlock[]) => {
      pushUndo(blocksRef.current);
      setBlocks(restoredBlocks);
      blocksRef.current = restoredBlocks;
      saveDocBlocks(page.id, restoredBlocks);
      setPreviewSnapshot(null);
    },
    [page.id, pushUndo]
  );

  // 全局撤销/重做快捷键监听
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // 当焦点处于普通文本输入框(非文档内容)时，优先允许默认行为
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [handleUndo, handleRedo]);

  // 1. 加载块流
  useEffect(() => {
    let isMounted = true;
    const fetchBlocks = async () => {
      setLoading(true);
      try {
        const fetched = await loadDocBlocks(page.id);
        if (isMounted) {
          if (fetched.length === 0) {
            // 若完全为空，提供默认初始块
            const defaultBlock: DocBlock = {
              id: 'b_' + Date.now(),
              pageId: page.id,
              blockType: 'p',
              content: '',
              sortOrder: 1,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            };
            setBlocks([defaultBlock]);
            blocksRef.current = [defaultBlock];
          } else {
            const sorted = fetched.sort((a, b) => a.sortOrder - b.sortOrder);
            setBlocks(sorted);
            blocksRef.current = sorted;
          }
          undoStackRef.current = [];
          redoStackRef.current = [];
        }
      } catch (err) {
        console.error('Failed to load blocks:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchBlocks();
    return () => {
      isMounted = false;
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveDocBlocks(page.id, blocksRef.current);
      }
    };
  }, [page.id]);

  // 2. 动态自动提取文档标题大纲索引 (纯文本清洗，杜绝 Markdown 与 HTML 符号污染)
  const outlineHeadings = useMemo<OutlineItem[]>(() => {
    return blocks
      .filter((b) => ['h1', 'h2', 'h3'].includes(b.blockType) && b.content.trim() !== '')
      .map((b) => {
        const cleanText = b.content
          .replace(/<[^>]*>/g, '')
          .replace(/\*\*(.*?)\*\*/g, '$1')
          .replace(/\*(.*?)\*/g, '$1')
          .replace(/~~(.*?)~~/g, '$1')
          .replace(/`(.*?)`/g, '$1')
          .trim();
        return {
          id: b.id,
          type: b.blockType,
          text: cleanText || b.content.trim(),
        };
      })
      .filter((item) => item.text !== '');
  }, [blocks]);

  // 2.0 智能推导大纲项真实语义层级深度（结合基础标签与点分编号如 1.1, 2.1 启发自愈）
  const getHeadingDepth = useCallback((type: BlockType | string, text: string): number => {
    const clean = text.trim();
    if (type === 'h1') return 1;
    // 若为 h2 但以点分数字编号开头 (如 1.1, 1.2, 2.1)，在人类心智和排版树上为下属子节，自愈为深度 3
    if (type === 'h2' && /^\d+\.\d+/.test(clean)) return 3;
    if (type === 'h2') return 2;
    if (type === 'h3' && /^\d+\.\d+\.\d+/.test(clean)) return 4;
    return 3;
  }, []);

  // 2.1 赋予大纲标题多层级父子管辖元信息 (depth, hasChildren, childCount)
  const outlineHeadingsWithMeta = useMemo(() => {
    return outlineHeadings.map((heading, i) => {
      const curDepth = getHeadingDepth(heading.type, heading.text);
      let childCount = 0;
      for (let j = i + 1; j < outlineHeadings.length; j++) {
        const next = outlineHeadings[j];
        const nextDepth = getHeadingDepth(next.type, next.text);
        if (nextDepth <= curDepth) break;
        childCount++;
      }
      return {
        ...heading,
        depth: curDepth,
        hasChildren: childCount > 0,
        childCount,
      };
    });
  }, [outlineHeadings, getHeadingDepth]);

  // 2.2 父子折叠交互控制函数
  const toggleHeadingFold = (headingId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedHeadingIds((prev) => {
      const next = new Set(prev);
      if (next.has(headingId)) {
        next.delete(headingId);
      } else {
        next.add(headingId);
      }
      return next;
    });
  };

  const hasAnyCollapsed = collapsedHeadingIds.size > 0;
  const toggleAllHeadingsFold = () => {
    if (hasAnyCollapsed) {
      setCollapsedHeadingIds(new Set());
    } else {
      const allParents = new Set<string>();
      outlineHeadingsWithMeta.forEach((h) => {
        if (h.hasChildren) allParents.add(h.id);
      });
      setCollapsedHeadingIds(allParents);
    }
  };

  // 3. 结合多层级深度与父子折叠状态推导最终可见大纲列表
  const filteredHeadings = useMemo(() => {
    const visible: typeof outlineHeadingsWithMeta = [];
    let blockedDepth: number | null = null;

    for (const heading of outlineHeadingsWithMeta) {
      const depth = heading.depth;

      // 若当前层级深度小于等于之前的阻断深度，说明已走出前一个折叠父节点的管辖范围
      if (blockedDepth !== null && depth <= blockedDepth) {
        blockedDepth = null;
      }

      // 若当前未被父级折叠阻断
      if (blockedDepth === null) {
        const matchesFilter =
          outlineFilter === 'all' ||
          (outlineFilter === 'h1' && heading.type === 'h1') ||
          (outlineFilter === 'h1-h2' && (heading.type === 'h1' || heading.type === 'h2'));

        if (matchesFilter) {
          visible.push(heading);
        }

        // 若当前项被折叠且拥有子项，对后续比当前更深层级的项开启阻断
        if (collapsedHeadingIds.has(heading.id) && heading.hasChildren) {
          blockedDepth = depth;
        }
      }
    }

    return visible;
  }, [outlineHeadingsWithMeta, outlineFilter, collapsedHeadingIds]);

  // 4. ScrollSpy: 监听正文滚动，计算视口内当前正在阅读的章节标题
  const handleScrollContent = useCallback(() => {
    if (!scrollContainerRef.current || outlineHeadings.length === 0) return;
    const containerTop = scrollContainerRef.current.getBoundingClientRect().top;

    let currentActiveId = outlineHeadings[0]?.id || null;
    for (const h of outlineHeadings) {
      const el = document.getElementById(`block-${h.id}`);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top - containerTop <= 120) {
          currentActiveId = h.id;
        } else {
          break;
        }
      }
    }
    setActiveHeadingId(currentActiveId);
  }, [outlineHeadings]);

  // 5. 点击大纲平滑滚动至对应锚点
  const handleScrollToHeading = (blockId: string) => {
    const el = document.getElementById(`block-${blockId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setFocusedBlockId(blockId);
      setActiveHeadingId(blockId);
    }
  };

  // 4. 更新块内容与属性 (支持防抖保存与结构变更入栈)
  const handleUpdateBlock = (
    blockId: string,
    content: string,
    blockType?: BlockType,
    properties?: Record<string, any>,
    isStructural?: boolean
  ) => {
    const now = Date.now();
    const prevBlock = blocksRef.current.find((b) => b.id === blockId);
    const prevContent = prevBlock?.content || '';

    // 快照分词切分准则：结构性变更、初始首字、停顿超800ms或标点符号切分
    const timeDiff = now - lastTypingTimeRef.current;
    const isPunctuation = /[\s，。！？,.!?:;]$/.test(content);
    const hasLengthChange = Math.abs(content.length - prevContent.length) >= 2;

    if (
      isStructural ||
      (prevContent === '' && content !== '') ||
      timeDiff > 800 ||
      (isPunctuation && hasLengthChange && timeDiff > 400)
    ) {
      pushUndo(blocksRef.current);
    }
    lastTypingTimeRef.current = now;

    const nextBlocks = blocksRef.current.map((b) => {
      if (b.id !== blockId) return b;
      return {
        ...b,
        content,
        blockType: blockType !== undefined ? blockType : b.blockType,
        properties: properties !== undefined ? properties : b.properties,
        updatedAt: Date.now(),
      };
    });
    setBlocks(nextBlocks);
    blocksRef.current = nextBlocks;

    // 500ms 防抖保存至底层 SQLite 并更新版本快照
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveDocBlocks(page.id, nextBlocks);
      saveDocSnapshot(page.id, nextBlocks);
    }, 500);
  };

  // 5. 在指定块下方插入新块
  const handleInsertBelow = async (currentBlockId: string, blockType: BlockType = 'p') => {
    pushUndo(blocksRef.current);
    const idx = blocksRef.current.findIndex((b) => b.id === currentBlockId);
    const newBlockId = 'b_' + Date.now();
    const newBlock: DocBlock = {
      id: newBlockId,
      pageId: page.id,
      blockType,
      content: '',
      sortOrder: (blocksRef.current[idx]?.sortOrder || 0) + 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const nextBlocks = [...blocksRef.current];
    nextBlocks.splice(idx + 1, 0, newBlock);

    // 重新规整序号
    nextBlocks.forEach((b, i) => {
      b.sortOrder = i + 1;
    });

    setBlocks(nextBlocks);
    blocksRef.current = nextBlocks;
    setFocusedBlockId(newBlockId);
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    await saveDocBlocks(page.id, nextBlocks);
  };

  // 6. 删除块
  const handleDeleteBlock = async (blockId: string) => {
    pushUndo(blocksRef.current);
    if (blocksRef.current.length <= 1) {
      // 保持至少一个空块
      const resetBlock: DocBlock = {
        id: 'b_' + Date.now(),
        pageId: page.id,
        blockType: 'p',
        content: '',
        sortOrder: 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setBlocks([resetBlock]);
      blocksRef.current = [resetBlock];
      setFocusedBlockId(resetBlock.id);
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      await saveDocBlocks(page.id, [resetBlock]);
      return;
    }

    const idx = blocksRef.current.findIndex((b) => b.id === blockId);
    const prevBlock = blocksRef.current[idx - 1] || blocksRef.current[idx + 1];
    const nextBlocks = blocksRef.current.filter((b) => b.id !== blockId);

    setBlocks(nextBlocks);
    blocksRef.current = nextBlocks;
    if (prevBlock) {
      setFocusedBlockId(prevBlock.id);
    }
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    await saveDocBlocks(page.id, nextBlocks);
  };

  // 7. 焦点移动
  const handleFocusPrev = (currentBlockId: string) => {
    const idx = blocksRef.current.findIndex((b) => b.id === currentBlockId);
    if (idx > 0 && blocksRef.current[idx - 1]) {
      setFocusedBlockId(blocksRef.current[idx - 1].id);
    }
  };

  const handleFocusNext = (currentBlockId: string) => {
    const idx = blocksRef.current.findIndex((b) => b.id === currentBlockId);
    if (idx >= 0 && idx < blocksRef.current.length - 1 && blocksRef.current[idx + 1]) {
      setFocusedBlockId(blocksRef.current[idx + 1].id);
    }
  };

  // 8. 块原生拖拽重排处理 (HTML5 Drag & Drop)
  const handleDragStartBlock = useCallback((blockId: string) => {
    setDraggingBlockId(blockId);
  }, []);

  const handleDragEndBlock = useCallback(() => {
    setDraggingBlockId(null);
    setDropTarget(null);
  }, []);

  const handleDragOverBlock = useCallback((blockId: string, position: 'top' | 'bottom') => {
    setDropTarget({ blockId, position });
  }, []);

  const handleDropBlock = useCallback(
    (sourceBlockId: string, targetBlockId: string, position: 'top' | 'bottom') => {
      setDraggingBlockId(null);
      setDropTarget(null);

      if (sourceBlockId === targetBlockId) return;

      const current = [...blocksRef.current];
      const sourceIndex = current.findIndex((b) => b.id === sourceBlockId);
      if (sourceIndex === -1) return;

      const [movedBlock] = current.splice(sourceIndex, 1);
      const targetIndex = current.findIndex((b) => b.id === targetBlockId);
      if (targetIndex === -1) return;

      const insertIndex = position === 'top' ? targetIndex : targetIndex + 1;
      current.splice(insertIndex, 0, movedBlock);

      // 连续重排并重新赋予递增 sortOrder
      const reordered = current.map((b, idx) => ({
        ...b,
        sortOrder: idx + 1,
        updatedAt: Date.now(),
      }));

      pushUndo(blocksRef.current);
      setBlocks(reordered);
      blocksRef.current = reordered;
      saveDocBlocks(page.id, reordered);
    },
    [page.id, pushUndo]
  );

  // 9. 键盘流快速上下交换块 (Alt + Up / Down)
  const handleSwapBlock = useCallback(
    (blockId: string, direction: 'up' | 'down') => {
      const current = [...blocksRef.current];
      const idx = current.findIndex((b) => b.id === blockId);
      if (idx === -1) return;
      if (direction === 'up' && idx === 0) return;
      if (direction === 'down' && idx === current.length - 1) return;

      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      const temp = current[idx];
      current[idx] = current[targetIdx];
      current[targetIdx] = temp;

      const reordered = current.map((b, i) => ({
        ...b,
        sortOrder: i + 1,
        updatedAt: Date.now(),
      }));

      pushUndo(blocksRef.current);
      setBlocks(reordered);
      blocksRef.current = reordered;
      setFocusedBlockId(blockId);
      saveDocBlocks(page.id, reordered);
    },
    [page.id, pushUndo]
  );

  // 全文匹配项计算 (实时检索当前页面的所有文本块)
  const findMatches = useMemo(() => {
    if (!findQuery.trim()) return [];
    const list: Array<{ blockId: string; blockIndex: number }> = [];
    const flags = caseSensitive ? 'g' : 'gi';
    const escaped = findQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, flags);

    blocks.forEach((b, bIdx) => {
      const text = b.content.replace(/<[^>]+>/g, '');
      if (regex.test(text)) {
        list.push({ blockId: b.id, blockIndex: bIdx });
      }
    });
    return list;
  }, [blocks, findQuery, caseSensitive]);

  // 滚动聚焦当前匹配项
  const scrollToMatch = useCallback(
    (index: number) => {
      const match = findMatches[index];
      if (match) {
        const el = document.getElementById(`block-${match.blockId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    },
    [findMatches]
  );

  const handleFindNext = useCallback(() => {
    if (findMatches.length === 0) return;
    const nextIdx = (currentMatchIndex + 1) % findMatches.length;
    setCurrentMatchIndex(nextIdx);
    scrollToMatch(nextIdx);
  }, [findMatches.length, currentMatchIndex, scrollToMatch]);

  const handleFindPrev = useCallback(() => {
    if (findMatches.length === 0) return;
    const prevIdx = (currentMatchIndex - 1 + findMatches.length) % findMatches.length;
    setCurrentMatchIndex(prevIdx);
    scrollToMatch(prevIdx);
  }, [findMatches.length, currentMatchIndex, scrollToMatch]);

  // 单次替换当前匹配项
  const handleReplaceCurrent = useCallback(() => {
    const match = findMatches[currentMatchIndex];
    if (!match) return;
    const targetBlock = blocks.find((b) => b.id === match.blockId);
    if (!targetBlock) return;

    const flags = caseSensitive ? '' : 'i';
    const escaped = findQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, flags);
    const updated = targetBlock.content.replace(regex, replaceQuery);
    handleUpdateBlock(targetBlock.id, updated, targetBlock.blockType, targetBlock.properties, true);
  }, [findMatches, currentMatchIndex, blocks, caseSensitive, findQuery, replaceQuery, handleUpdateBlock]);

  // 全部替换
  const handleReplaceAll = useCallback(() => {
    if (!findQuery.trim()) return;
    pushUndo(blocksRef.current);
    const flags = caseSensitive ? 'g' : 'gi';
    const escaped = findQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, flags);

    let hasChanged = false;
    const nextBlocks = blocks.map((b) => {
      if (regex.test(b.content)) {
        hasChanged = true;
        return {
          ...b,
          content: b.content.replace(regex, replaceQuery),
          updatedAt: Date.now(),
        };
      }
      return b;
    });

    if (hasChanged) {
      setBlocks(nextBlocks);
      blocksRef.current = nextBlocks;
      saveDocBlocks(page.id, nextBlocks);
    }
  }, [findQuery, caseSensitive, replaceQuery, blocks, pushUndo, page.id]);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0a0d14] text-slate-100 overflow-hidden select-text">
      {/* 顶部状态与面包屑栏 (49px 高度对齐基准线，清理冗余右上角按钮) */}
      <div className="h-[49px] border-b border-white/5 px-6 flex items-center justify-between bg-black/20 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <FileText size={14} className="text-sky-400" />
          <span className="truncate font-medium text-slate-200">{page.title || '无标题文档'}</span>
          <span className="text-slate-600">·</span>
          <span className="text-[11px] text-slate-500">{blocks.length} 个块</span>
        </div>

        {/* 右侧动作栏：撤销/重做快捷入口与大纲控制入口 */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white/[0.03] border border-white/5 rounded-lg p-0.5 select-none">
            <button
              onClick={() => handleUndo()}
              className="p-1 hover:bg-white/10 text-slate-400 hover:text-slate-200 rounded transition-colors"
              title="撤销 (Ctrl+Z)"
            >
              <Undo2 size={13} />
            </button>
            <button
              onClick={() => handleRedo()}
              className="p-1 hover:bg-white/10 text-slate-400 hover:text-slate-200 rounded transition-colors"
              title="重做 (Ctrl+Y / Ctrl+Shift+Z)"
            >
              <Redo2 size={13} />
            </button>
            {/* 技术模板库按钮 */}
            <button
              onClick={() => setShowTemplatePicker(!showTemplatePicker)}
              className={`p-1 hover:bg-white/10 rounded transition-colors ${
                showTemplatePicker ? 'text-sky-400 bg-sky-500/10' : 'text-slate-400 hover:text-sky-300'
              }`}
              title="技术模板库"
            >
              <Sparkles size={13} />
            </button>

            {/* 版本历史与快照抽屉按钮 */}
            <button
              onClick={() => setShowHistoryDrawer(!showHistoryDrawer)}
              className={`p-1 hover:bg-white/10 rounded transition-colors ${
                showHistoryDrawer ? 'text-sky-400 bg-sky-500/10' : 'text-slate-400 hover:text-sky-300'
              }`}
              title="版本历史与快照"
            >
              <History size={13} />
            </button>

            {/* 行内批注与评论流抽屉按钮 */}
            <button
              onClick={() => setShowCommentDrawer(!showCommentDrawer)}
              className={`relative p-1 hover:bg-white/10 rounded transition-colors ${
                showCommentDrawer ? 'text-sky-400 bg-sky-500/10' : 'text-slate-400 hover:text-sky-300'
              }`}
              title="行内批注与讨论"
            >
              <MessageSquare size={13} />
              {unresolvedCommentCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-sky-500 text-[9px] text-white font-bold flex items-center justify-center shadow-md animate-pulse">
                  {unresolvedCommentCount}
                </span>
              )}
            </button>

            {/* 全局折叠块展开/收起胶囊 */}
            {toggleCount > 0 && (
              <div className="flex items-center gap-0.5 p-0.5 bg-white/[0.04] border border-white/5 rounded-md text-[10px] text-slate-400">
                <button
                  type="button"
                  onClick={() => handleToggleFoldAll(true)}
                  className="px-1.5 py-0.5 rounded hover:bg-white/10 hover:text-white transition-colors"
                  title="展开全文所有折叠块"
                >
                  展开
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleFoldAll(false)}
                  className="px-1.5 py-0.5 rounded hover:bg-white/10 hover:text-white transition-colors"
                  title="收起全文所有折叠块"
                >
                  收起
                </button>
              </div>
            )}

            {/* 查找与替换 */}
            <button
              onClick={() => setIsFindOpen(true)}
              className="p-1 hover:bg-white/10 text-slate-400 hover:text-sky-300 rounded transition-colors"
              title="查找与替换 (Ctrl+F)"
            >
              <Search size={13} />
            </button>

            {/* 导出菜单组 (Markdown / HTML / 打印与PDF) */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="p-1 hover:bg-white/10 text-slate-400 hover:text-slate-200 rounded transition-colors flex items-center gap-0.5"
                title="导出与打印"
              >
                <Download size={13} />
                <ChevronDown size={10} className="text-slate-500" />
              </button>

              {showExportMenu && (
                <div
                  className="absolute right-0 top-full mt-1.5 w-48 bg-[#12161f]/95 border border-white/10 rounded-xl shadow-2xl p-1 z-50 backdrop-blur-md animate-in fade-in select-none text-xs text-slate-200"
                  onClick={() => setShowExportMenu(false)}
                >
                  <button
                    onClick={handleExportMarkdown}
                    className="w-full text-left px-2.5 py-1.5 hover:bg-white/10 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Download size={13} className="text-sky-400" />
                    <span>导出为 Markdown (.md)</span>
                  </button>
                  <button
                    onClick={handleExportHtml}
                    className="w-full text-left px-2.5 py-1.5 hover:bg-white/10 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <FileText size={13} className="text-amber-400" />
                    <span>导出为独立网页 (.html)</span>
                  </button>
                  <div className="h-px bg-white/5 my-1" />
                  <button
                    onClick={handlePrintPdf}
                    className="w-full text-left px-2.5 py-1.5 hover:bg-white/10 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Printer size={13} className="text-emerald-400" />
                    <span>打印 / 另存为 PDF</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setShowOutline(!showOutline)}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg transition-all select-none border ${
              showOutline
                ? 'bg-sky-500/15 text-sky-300 border-sky-500/30 font-medium'
                : 'text-slate-400 hover:text-sky-300 bg-white/[0.03] hover:bg-white/[0.08] border-white/5'
            }`}
            title={showOutline ? "收起目录大纲" : "展开目录大纲"}
          >
            {showOutline ? (
              <PanelRightClose size={13} className="text-sky-400" />
            ) : (
              <PanelRightOpen size={13} className="text-sky-400" />
            )}
            <span>目录大纲</span>
            {outlineHeadings.length > 0 && (
              <span className={`text-[10px] font-mono ${showOutline ? 'text-sky-400/80' : 'text-slate-500'}`}>
                ({outlineHeadings.length})
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 主工作区：左侧正文编辑区（标题靠左） + 右侧目录大纲栏（相对向右缩进伴随索引） */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        {/* 全局查找与替换微工具条 */}
        <FindReplaceBar
          isOpen={isFindOpen}
          onClose={() => setIsFindOpen(false)}
          findQuery={findQuery}
          setFindQuery={setFindQuery}
          replaceQuery={replaceQuery}
          setReplaceQuery={setReplaceQuery}
          caseSensitive={caseSensitive}
          setCaseSensitive={setCaseSensitive}
          currentMatch={currentMatchIndex}
          totalMatches={findMatches.length}
          onFindNext={handleFindNext}
          onFindPrev={handleFindPrev}
          onReplaceCurrent={handleReplaceCurrent}
          onReplaceAll={handleReplaceAll}
        />
        {/* 页面内容正文区域 (包含顶部沉浸式大封面条带及正文流) */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScrollContent}
          className="flex-1 overflow-y-auto min-w-0 doc-typography custom-scrollbar"
        >
          {/* 若 page.cover 存在：在页面正文滚动区最顶端渲染 h-40 的大封面条带 */}
          {page.cover && (
            <div className="relative w-full h-40 group select-none overflow-hidden shrink-0">
              {page.cover.startsWith('linear-gradient') ? (
                <div
                  className="w-full h-full transition-all duration-300"
                  style={{ background: page.cover }}
                />
              ) : (
                <img
                  src={page.cover}
                  alt="页面封面"
                  className="w-full h-full object-cover transition-all duration-300"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              )}
              {/* 悬停在封面右上角显示轻量半透明胶囊操作组：「更换封面」与「移除封面」 */}
              <div className="absolute top-3 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg p-1 text-xs text-slate-200 shadow-lg">
                <button
                  onClick={() => setShowCoverPicker(true)}
                  className="px-2 py-1 hover:bg-white/10 hover:text-white rounded flex items-center gap-1.5 transition-colors"
                  title="更换封面"
                >
                  <ImageIcon size={13} className="text-sky-400" />
                  <span>更换封面</span>
                </button>
                <button
                  onClick={() => onUpdatePageCover?.('')}
                  className="px-2 py-1 hover:bg-white/10 hover:text-red-300 rounded flex items-center gap-1.5 transition-colors"
                  title="移除封面"
                >
                  <Trash2 size={13} className="text-red-400" />
                  <span>移除封面</span>
                </button>
              </div>
            </div>
          )}

          <div className={`px-8 lg:px-12 ${page.cover ? 'pb-48 pt-0' : 'pt-8 pb-48'}`}>
            <div
              className={`space-y-4 transition-all duration-200 ${
                showOutline ? 'max-w-3xl lg:max-w-4xl' : 'max-w-4xl xl:max-w-5xl'
              }`}
            >
              {/* 文档图标与大标题 (若有 cover，Emoji 使用 -mt-7 ml-8 浮空重叠在封面上) */}
              <div className="space-y-2 mb-6 group/header">
                <div className="flex items-center gap-2">
                  <div className={`relative inline-block ${page.cover ? '-mt-7 ml-8' : ''} z-10`}>
                    <button
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className={`text-2xl p-1.5 rounded-xl transition-all cursor-pointer select-none ${
                        page.cover
                          ? 'bg-[#0a0d14]/90 backdrop-blur border border-white/10 shadow-lg hover:bg-white/10'
                          : 'hover:bg-white/5'
                      }`}
                      title="更换图标"
                    >
                      {page.icon || '📝'}
                    </button>

                    {showEmojiPicker && (
                      <div className="absolute left-0 top-full mt-1 bg-slate-900 border border-white/10 rounded-xl shadow-2xl p-2 z-50 flex gap-1.5 animate-in fade-in duration-100">
                        {EMOJI_OPTIONS.map((emo) => (
                          <button
                            key={emo}
                            onClick={() => {
                              onUpdatePageIcon?.(emo);
                              setShowEmojiPicker(false);
                            }}
                            className="text-xl p-1.5 hover:bg-white/10 rounded-lg transition-transform hover:scale-110"
                          >
                            {emo}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 若 page.cover 不存在：标题区域上方或悬停时，在更换图标按钮旁边提供极其隐蔽优雅的「🖼️ 添加封面」按钮 */}
                  {!page.cover && (
                    <button
                      onClick={() => {
                        onUpdatePageCover?.(PRESET_COVERS[0].value);
                        setShowCoverPicker(true);
                      }}
                      className="opacity-0 group-hover/header:opacity-100 transition-opacity text-xs text-slate-400 hover:text-slate-200 hover:bg-white/5 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 select-none"
                      title="添加页面封面"
                    >
                      <span>🖼️</span>
                      <span>添加封面</span>
                    </button>
                  )}
                </div>

                <input
                  ref={titleInputRef}
                  type="text"
                  value={page.title}
                  onChange={(e) => onUpdatePageTitle(e.target.value)}
                  placeholder="无标题文档"
                  className="w-full text-3xl font-bold text-white bg-transparent border-none outline-none placeholder-slate-600 leading-snug tracking-tight"
                />
                {/* 标题与正文黄金过渡层 */}
                <div className="mt-4 mb-2 border-b border-white/[0.04]" />
              </div>

              {/* 历史快照预览提醒横幅 */}
              {previewSnapshot && (
                <div className="mb-4 p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-between text-xs text-amber-200 backdrop-blur-md animate-in fade-in select-none">
                  <div className="flex items-center gap-2">
                    <Clock size={15} className="text-amber-400 shrink-0" />
                    <span>
                      正在只读预览历史快照：
                      <span className="font-mono text-amber-300 ml-1">
                        {new Date(previewSnapshot.timestamp).toLocaleString()}
                      </span>
                    </span>
                    <span className="text-amber-400/70 font-mono text-[11px]">
                      ({previewSnapshot.blockCount} 块 · {previewSnapshot.wordCount} 字)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRestoreSnapshot(previewSnapshot.blocks)}
                      className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded-lg font-medium transition-colors cursor-pointer"
                    >
                      恢复到此版本
                    </button>
                    <button
                      onClick={() => setPreviewSnapshot(null)}
                      className="px-2.5 py-1 bg-white/10 hover:bg-white/15 text-slate-200 rounded-lg transition-colors cursor-pointer"
                    >
                      退出预览
                    </button>
                  </div>
                </div>
              )}

              {/* 空白文档技术模板快捷选择卡片 */}
              {(isEmptyDoc || showTemplatePicker) && !previewSnapshot && (
                <DocTemplatePicker
                  onSelectTemplate={handleSelectTemplate}
                  onDismiss={showTemplatePicker ? () => setShowTemplatePicker(false) : undefined}
                />
              )}

            {/* 块流渲染 (解冻垂直排版外边距，彻底移除破坏性的 space-y-*) */}
            <div className="min-h-[400px]">
              {(previewSnapshot ? previewSnapshot.blocks : blocks).map((block, idx) => {
                // 计算有序列表块的连续序号（遇到非 numbered 块重置计数）
                let seqNumber: number | undefined;
                if (block.blockType === 'numbered') {
                  let count = 0;
                  for (let i = idx; i >= 0; i--) {
                    if (blocks[i].blockType === 'numbered') {
                      count++;
                    } else {
                      break;
                    }
                  }
                  seqNumber = count;
                }

                return (
                  <BlockItem
                    key={block.id}
                    block={block}
                    seqNumber={seqNumber}
                    autoFocus={focusedBlockId === block.id}
                    onUpdate={(content, blockType, properties, isStructural) =>
                      handleUpdateBlock(block.id, content, blockType, properties, isStructural)
                    }
                    onDelete={() => handleDeleteBlock(block.id)}
                    onInsertBelow={(bType) => handleInsertBelow(block.id, bType)}
                    onFocusPrev={() => handleFocusPrev(block.id)}
                    onFocusNext={() => handleFocusNext(block.id)}
                    pages={pages}
                    onNavigatePage={onNavigatePage}
                    isDragging={draggingBlockId === block.id}
                    dropIndicator={dropTarget?.blockId === block.id ? dropTarget.position : null}
                    onDragStartBlock={handleDragStartBlock}
                    onDragEndBlock={handleDragEndBlock}
                    onDragOverBlock={handleDragOverBlock}
                    onDropBlock={handleDropBlock}
                    onSwapBlock={(dir) => handleSwapBlock(block.id, dir)}
                    allBlocks={blocks}
                    onScrollToHeading={handleScrollToHeading}
                    onAddComment={handleAddComment}
                  />
                );
              })}
            </div>

            {/* 双向反向链接底栏 (BacklinksPanel) */}
            <BacklinksPanel
              pageId={page.id}
              allPages={pages}
              onNavigatePage={onNavigatePage}
            />

            {/* 底部打字机留白与点击空白插入块 */}
            <div
              onClick={() => handleInsertBelow(blocks[blocks.length - 1]?.id || '', 'p')}
              className="py-10 mt-6 cursor-text flex items-center justify-center text-xs font-mono text-slate-600 hover:text-slate-400 transition-colors border border-dashed border-transparent hover:border-white/10 rounded-xl select-none"
            >
              + 点击此处添加新段落，或按 '/' 唤出快捷菜单...
            </div>
          </div>
        </div>
      </div>



        {/* 右侧轻量目录大纲与局部图谱栏 (Notion 风格微光胶囊，字号与间距精心收敛) */}
        {showOutline && (
          <div className="w-52 border-l border-white/5 bg-black/15 backdrop-blur-sm p-3.5 flex flex-col shrink-0 select-none">
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/5">
              <div className="flex items-center gap-1 bg-white/[0.04] p-0.5 rounded-lg border border-white/5 w-full">
                <button
                  type="button"
                  onClick={() => setRightPanelTab('toc')}
                  className={`flex-1 flex items-center justify-center gap-1 px-2 py-0.5 rounded text-[11px] transition-all ${
                    rightPanelTab === 'toc'
                      ? 'bg-sky-500/20 text-sky-300 font-medium border border-sky-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ListTree size={12} />
                  <span>大纲</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRightPanelTab('graph')}
                  className={`flex-1 flex items-center justify-center gap-1 px-2 py-0.5 rounded text-[11px] transition-all ${
                    rightPanelTab === 'graph'
                      ? 'bg-sky-500/20 text-sky-300 font-medium border border-sky-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Share2 size={12} />
                  <span>图谱</span>
                </button>
              </div>
            </div>

            {rightPanelTab === 'toc' ? (
              <>
                {/* 智能层级过滤胶囊组与全局折叠微操作 */}
                <div className="flex items-center justify-between gap-1 mb-2">
                  <div className="flex-1 flex items-center gap-1 bg-white/[0.04] p-1 rounded-lg">
                    {(
                      [
                        { id: 'all', label: '全部' },
                        { id: 'h1', label: '仅H1' },
                        { id: 'h1-h2', label: 'H1+H2' },
                      ] as const
                    ).map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setOutlineFilter(f.id)}
                        className={`flex-1 text-[10px] py-0.5 rounded transition-all text-center ${
                          outlineFilter === f.id
                            ? 'bg-sky-500/20 text-sky-300 font-medium border border-sky-500/30 shadow-sm'
                            : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                  {outlineHeadings.some((h) => h.type === 'h1' || h.type === 'h2') && (
                    <button
                      type="button"
                      onClick={toggleAllHeadingsFold}
                      className="px-1.5 py-1 text-[10px] text-slate-400 hover:text-sky-300 hover:bg-white/5 rounded-lg border border-white/5 transition-colors flex items-center gap-0.5 shrink-0"
                      title={hasAnyCollapsed ? "一键全部展开" : "一键全部折叠"}
                    >
                      {hasAnyCollapsed ? <ChevronsDown size={11} /> : <ChevronsUp size={11} />}
                      <span>{hasAnyCollapsed ? "展开" : "折叠"}</span>
                    </button>
                  )}
                </div>

                {filteredHeadings.length === 0 ? (
                  <div className="text-[11px] text-slate-600 py-6 text-center italic">
                    {outlineHeadings.length === 0 ? '当前文档暂无标题 (H1/H2/H3)' : '无匹配层级标题'}
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto space-y-0.5 pr-1 custom-scrollbar">
                    {filteredHeadings.map((heading) => {
                      const isActive = activeHeadingId === heading.id;
                      const isCollapsed = collapsedHeadingIds.has(heading.id);
                      return (
                        <div
                          key={heading.id}
                          onClick={() => handleScrollToHeading(heading.id)}
                          className={`w-full group/item text-left rounded-md transition-all flex items-center text-xs py-1 px-1.5 relative cursor-pointer select-none ${
                            isActive
                              ? 'bg-sky-500/10 text-sky-300 font-medium'
                              : heading.type === 'h1'
                              ? 'font-medium text-slate-200 hover:text-white hover:bg-white/5'
                              : heading.type === 'h2'
                              ? 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                              : 'text-slate-500 hover:text-slate-300 hover:bg-white/5 text-[11px]'
                          } ${
                            heading.depth === 1 ? 'pl-1.5' : heading.depth === 2 ? 'pl-3.5' : heading.depth === 3 ? 'pl-5.5' : 'pl-7'
                          }`}
                          title={heading.text}
                        >
                          {isActive && (
                            <span className="absolute left-0 top-1 bottom-1 w-0.5 bg-sky-400 rounded-full shadow-[0_0_6px_rgba(56,189,248,0.8)]" />
                          )}

                          {/* 父子折叠微指示箭头 */}
                          {heading.hasChildren ? (
                            <button
                              type="button"
                              onClick={(e) => toggleHeadingFold(heading.id, e)}
                              className="p-0.5 -ml-0.5 mr-1 hover:bg-white/10 rounded text-slate-400 hover:text-sky-300 transition-colors shrink-0"
                              title={isCollapsed ? "展开下属子标题" : "折叠下属子标题"}
                            >
                              {isCollapsed ? (
                                <ChevronRight size={11} className="text-slate-400" />
                              ) : (
                                <ChevronDown size={11} className="text-sky-400/80" />
                              )}
                            </button>
                          ) : (
                            <span className="w-3 mr-1 shrink-0" />
                          )}

                          <span className="truncate flex-1">{heading.text}</span>

                          {/* 折叠时展示包含子标题数量小 Badge */}
                          {isCollapsed && heading.childCount > 0 && (
                            <span className="text-[9px] font-mono px-1 py-0.2 bg-white/5 text-slate-400 rounded shrink-0 ml-1">
                              +{heading.childCount}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              <DocLocalGraph
                currentPage={page}
                allPages={pages || []}
                currentBlocks={blocks}
                onNavigatePage={onNavigatePage}
              />
            )}
          </div>
        )}

        {/* 右侧历史版本与快照时间轴抽屉 */}
        {showHistoryDrawer && (
          <DocHistoryDrawer
            pageId={page.id}
            currentBlocks={blocks}
            onRestoreSnapshot={handleRestoreSnapshot}
            onPreviewSnapshot={(snap) => setPreviewSnapshot(snap)}
            onClose={() => {
              setShowHistoryDrawer(false);
              setPreviewSnapshot(null);
            }}
          />
        )}

        {/* 右侧行内批注与讨论抽屉 */}
        <DocCommentDrawer
          pageId={page.id}
          isOpen={showCommentDrawer}
          onClose={() => setShowCommentDrawer(false)}
        />

        {/* 实时字数、字符数与阅读时长微光统计胶囊 */}
        <DocStatsBadge blocks={blocks} />
      </div>

      {/* 封面选择器弹窗 (CoverPicker) */}
      {showCoverPicker && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px] animate-in fade-in duration-150"
          onClick={() => setShowCoverPicker(false)}
        >
          <div
            className="bg-[#12161f] border border-white/10 rounded-2xl shadow-2xl p-5 w-full max-w-md space-y-4 select-none animate-in zoom-in-95 duration-150 text-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-200">
                <Palette size={16} className="text-sky-400" />
                <span>选择封面壁纸</span>
              </div>
              <button
                onClick={() => setShowCoverPicker(false)}
                className="p-1 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition-colors"
                title="关闭"
              >
                <X size={15} />
              </button>
            </div>

            {/* 8 款预设渐变壁纸 */}
            <div>
              <div className="text-xs text-slate-400 mb-2 font-medium">渐变壁纸</div>
              <div className="grid grid-cols-4 gap-2.5">
                {PRESET_COVERS.map((preset) => {
                  const isSelected = page.cover === preset.value;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => {
                        onUpdatePageCover?.(preset.value);
                      }}
                      className={`group relative h-14 rounded-xl overflow-hidden border transition-all duration-200 flex items-end p-1.5 text-left ${
                        isSelected
                          ? 'border-sky-400 ring-2 ring-sky-400/30 scale-105'
                          : 'border-white/10 hover:border-white/30 hover:scale-[1.03]'
                      }`}
                      style={{ background: preset.value }}
                      title={preset.name}
                    >
                      <span className="text-[11px] font-medium text-white/90 drop-shadow-md truncate">
                        {preset.name}
                      </span>
                      {isSelected && (
                        <span className="absolute top-1 right-1 bg-sky-500 text-white rounded-full p-0.5 shadow">
                          <Check size={10} strokeWidth={3} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 自定义图片 URL */}
            <div className="pt-2 border-t border-white/5">
              <div className="text-xs text-slate-400 mb-2 font-medium">自定义图片 URL</div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (customCoverUrl.trim()) {
                    onUpdatePageCover?.(customCoverUrl.trim());
                    setShowCoverPicker(false);
                  }
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="url"
                  value={customCoverUrl}
                  onChange={(e) => setCustomCoverUrl(e.target.value)}
                  placeholder="输入图片网络链接 (https://...)"
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-sky-500 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!customCoverUrl.trim()}
                  className="px-3.5 py-2 bg-sky-500 hover:bg-sky-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-medium rounded-xl transition-colors shrink-0 shadow-sm"
                >
                  应用
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
