import React, { useState, useRef, useEffect, useMemo } from 'react';
import { DocBlock } from '../../../types/docs.ts';
import {
  Table,
  Plus,
  Trash2,
  Check,
  Copy,
  ToggleLeft,
  ToggleRight,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Eraser,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  MoreHorizontal,
  Bold,
  Italic,
  Underline,
} from 'lucide-react';
import { healTableRows } from '../../../services/docHealingService.ts';
import { FloatingFormatToolbar } from './FloatingFormatToolbar.tsx';

export type TableColAlign = 'left' | 'center' | 'right';

interface CellCoord {
  rIdx: number;
  cIdx: number;
}

interface CellRange {
  start: CellCoord;
  end: CellCoord;
}

interface TableContextMenuProps {
  x: number;
  y: number;
  rIdx: number;
  cIdx: number;
  rowCount: number;
  colCount: number;
  currentAlign: TableColAlign;
  isRangeActive: boolean;
  selectedCellCount: number;
  onAlignChange: (align: TableColAlign) => void;
  onInsertRowAbove: () => void;
  onInsertRowBelow: () => void;
  onInsertColLeft: () => void;
  onInsertColRight: () => void;
  onClearRow: () => void;
  onClearCol: () => void;
  onDeleteRow: () => void;
  onDeleteCol: () => void;
  onClearRange: () => void;
  onBatchFormat: (format: 'bold' | 'italic' | 'underline' | 'clear') => void;
  onCopyMarkdown: () => void;
  onCopySelectedRange: () => void;
  onDeleteTable: () => void;
  onClose: () => void;
}

const TableContextMenu: React.FC<TableContextMenuProps> = ({
  x,
  y,
  rIdx,
  cIdx,
  rowCount,
  colCount,
  currentAlign,
  isRangeActive,
  selectedCellCount,
  onAlignChange,
  onInsertRowAbove,
  onInsertRowBelow,
  onInsertColLeft,
  onInsertColRight,
  onClearRow,
  onClearCol,
  onDeleteRow,
  onDeleteCol,
  onClearRange,
  onBatchFormat,
  onCopyMarkdown,
  onCopySelectedRange,
  onDeleteTable,
  onClose,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const menuWidth = 210;
  const menuHeight = isRangeActive ? 420 : 390;
  const clampedX = Math.min(x, window.innerWidth - menuWidth - 16);
  const clampedY = Math.min(y, window.innerHeight - menuHeight - 16);

  return (
    <div
      ref={menuRef}
      style={{ left: `${Math.max(8, clampedX)}px`, top: `${Math.max(8, clampedY)}px` }}
      className="fixed z-[999995] w-[210px] rounded-xl bg-[#161b22]/95 backdrop-blur-xl border border-white/10 shadow-2xl p-1.5 text-[12px] text-slate-300 select-none animate-in fade-in zoom-in-95 duration-100"
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* 多选范围指示器 */}
      {isRangeActive && (
        <div className="mb-1 px-2 py-1 rounded bg-sky-500/20 border border-sky-500/30 text-sky-300 text-[11px] font-medium flex items-center justify-between">
          <span>已选中 {selectedCellCount} 个单元格</span>
          <span className="text-[10px] text-sky-400/80 font-mono">范围</span>
        </div>
      )}

      {/* 跨选批量格式化 */}
      {isRangeActive && (
        <div className="mb-1 pb-1 border-b border-white/[0.08]">
          <div className="px-2 py-0.5 text-[10px] font-medium text-slate-400 uppercase tracking-wider">
            批量格式化
          </div>
          <div className="grid grid-cols-3 gap-1 px-1 pt-0.5">
            <button
              type="button"
              onClick={() => {
                onBatchFormat('bold');
                onClose();
              }}
              className="flex items-center justify-center gap-1 py-1 rounded border border-white/5 hover:bg-white/5 text-slate-300 hover:text-white text-[11px] cursor-pointer"
              title="批量切换加粗"
            >
              <Bold size={11} />
              <span>加粗</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onBatchFormat('italic');
                onClose();
              }}
              className="flex items-center justify-center gap-1 py-1 rounded border border-white/5 hover:bg-white/5 text-slate-300 hover:text-white text-[11px] cursor-pointer"
              title="批量切换斜体"
            >
              <Italic size={11} />
              <span>斜体</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onBatchFormat('underline');
                onClose();
              }}
              className="flex items-center justify-center gap-1 py-1 rounded border border-white/5 hover:bg-white/5 text-slate-300 hover:text-white text-[11px] cursor-pointer"
              title="批量切换下划线"
            >
              <Underline size={11} />
              <span>下划</span>
            </button>
          </div>
          <button
            type="button"
            onClick={() => {
              onClearRange();
              onClose();
            }}
            className="w-full mt-1 flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 transition-colors text-left cursor-pointer"
          >
            <Eraser size={13} className="text-amber-400" />
            <span>清空所选 {selectedCellCount} 个单元格</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onCopySelectedRange();
              onClose();
            }}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/5 text-slate-300 hover:text-white transition-colors text-left cursor-pointer"
          >
            <Copy size={13} className="text-sky-400" />
            <span>复制所选单元格 (TSV)</span>
          </button>
        </div>
      )}

      {/* 文本对齐方式 */}
      <div className="px-2 py-1 text-[10px] font-medium text-slate-500 uppercase tracking-wider">
        文本对齐 ({isRangeActive ? '所选范围' : `第 ${cIdx + 1} 列`})
      </div>
      <div className="grid grid-cols-3 gap-1 px-1 pb-1.5">
        <button
          type="button"
          onClick={() => {
            onAlignChange('left');
            onClose();
          }}
          className={`flex items-center justify-center gap-1 py-1 rounded border text-[11px] transition-colors cursor-pointer ${
            currentAlign === 'left'
              ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 font-medium'
              : 'border-white/5 hover:bg-white/5 text-slate-400 hover:text-slate-200'
          }`}
          title="居左对齐"
        >
          <AlignLeft size={12} />
          <span>左</span>
        </button>
        <button
          type="button"
          onClick={() => {
            onAlignChange('center');
            onClose();
          }}
          className={`flex items-center justify-center gap-1 py-1 rounded border text-[11px] transition-colors cursor-pointer ${
            currentAlign === 'center'
              ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 font-medium'
              : 'border-white/5 hover:bg-white/5 text-slate-400 hover:text-slate-200'
          }`}
          title="居中对齐"
        >
          <AlignCenter size={12} />
          <span>中</span>
        </button>
        <button
          type="button"
          onClick={() => {
            onAlignChange('right');
            onClose();
          }}
          className={`flex items-center justify-center gap-1 py-1 rounded border text-[11px] transition-colors cursor-pointer ${
            currentAlign === 'right'
              ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 font-medium'
              : 'border-white/5 hover:bg-white/5 text-slate-400 hover:text-slate-200'
          }`}
          title="居右对齐"
        >
          <AlignRight size={12} />
          <span>右</span>
        </button>
      </div>

      <div className="my-1 border-t border-white/[0.08]" />

      {/* 行操作 */}
      <div className="px-2 py-0.5 text-[10px] font-medium text-slate-500 uppercase tracking-wider">
        行操作 (第 {rIdx + 1} 行)
      </div>
      <button
        type="button"
        onClick={() => {
          onInsertRowAbove();
          onClose();
        }}
        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/5 text-slate-300 hover:text-emerald-300 transition-colors text-left cursor-pointer"
      >
        <ArrowUp size={13} className="text-emerald-400" />
        <span>在上方插入行</span>
      </button>
      <button
        type="button"
        onClick={() => {
          onInsertRowBelow();
          onClose();
        }}
        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/5 text-slate-300 hover:text-emerald-300 transition-colors text-left cursor-pointer"
      >
        <ArrowDown size={13} className="text-emerald-400" />
        <span>在下方插入行</span>
      </button>
      {!isRangeActive && (
        <button
          type="button"
          onClick={() => {
            onClearRow();
            onClose();
          }}
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/5 text-slate-300 hover:text-amber-300 transition-colors text-left cursor-pointer"
        >
          <Eraser size={13} className="text-amber-400" />
          <span>清空此行内容</span>
        </button>
      )}
      <button
        type="button"
        disabled={rowCount <= 1}
        onClick={() => {
          onDeleteRow();
          onClose();
        }}
        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors text-left ${
          rowCount <= 1
            ? 'opacity-30 cursor-not-allowed text-slate-500'
            : 'hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 cursor-pointer'
        }`}
      >
        <Trash2 size={13} />
        <span>删除当前行</span>
      </button>

      <div className="my-1 border-t border-white/[0.08]" />

      {/* 列操作 */}
      <div className="px-2 py-0.5 text-[10px] font-medium text-slate-500 uppercase tracking-wider">
        列操作 (第 {cIdx + 1} 列)
      </div>
      <button
        type="button"
        onClick={() => {
          onInsertColLeft();
          onClose();
        }}
        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/5 text-slate-300 hover:text-sky-300 transition-colors text-left cursor-pointer"
      >
        <ArrowLeft size={13} className="text-sky-400" />
        <span>在左侧插入列</span>
      </button>
      <button
        type="button"
        onClick={() => {
          onInsertColRight();
          onClose();
        }}
        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/5 text-slate-300 hover:text-sky-300 transition-colors text-left cursor-pointer"
      >
        <ArrowRight size={13} className="text-sky-400" />
        <span>在右侧插入列</span>
      </button>
      {!isRangeActive && (
        <button
          type="button"
          onClick={() => {
            onClearCol();
            onClose();
          }}
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/5 text-slate-300 hover:text-amber-300 transition-colors text-left cursor-pointer"
        >
          <Eraser size={13} className="text-amber-400" />
          <span>清空此列内容</span>
        </button>
      )}
      <button
        type="button"
        disabled={colCount <= 1}
        onClick={() => {
          onDeleteCol();
          onClose();
        }}
        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors text-left ${
          colCount <= 1
            ? 'opacity-30 cursor-not-allowed text-slate-500'
            : 'hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 cursor-pointer'
        }`}
      >
        <Trash2 size={13} />
        <span>删除当前列</span>
      </button>

      <div className="my-1 border-t border-white/[0.08]" />

      {/* 快捷与整表 */}
      <button
        type="button"
        onClick={() => {
          onCopyMarkdown();
          onClose();
        }}
        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/5 text-slate-300 hover:text-slate-100 transition-colors text-left cursor-pointer"
      >
        <Copy size={13} className="text-slate-400" />
        <span>复制整表为 Markdown</span>
      </button>
      <button
        type="button"
        onClick={() => {
          onDeleteTable();
          onClose();
        }}
        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors text-left cursor-pointer"
      >
        <Trash2 size={13} />
        <span>删除整个表格</span>
      </button>
    </div>
  );
};

interface TableBlockProps {
  block: DocBlock;
  onUpdate: (
    content: string,
    blockType?: any,
    properties?: Record<string, unknown>,
    saveHistory?: boolean
  ) => void;
  onDelete: () => void;
}

export const TableBlock: React.FC<TableBlockProps> = ({
  block,
  onUpdate,
  onDelete,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeCell, setActiveCell] = useState<CellCoord | null>(null);
  const [selectedRange, setSelectedRange] = useState<CellRange | null>(null);
  const [isDraggingRange, setIsDraggingRange] = useState(false);
  const dragStartRef = useRef<CellCoord | null>(null);

  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    rIdx: number;
    cIdx: number;
  } | null>(null);

  // 划选富文本浮动工具条状态
  const [floatingToolbarPos, setFloatingToolbarPos] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const activeEditingCellRef = useRef<CellCoord | null>(null);

  // 解析并运行运行时自愈规范化二维数据
  const rawRows = (block.properties?.rows as string[][]) || [];
  const healedRows = useMemo(() => healTableRows(rawRows), [rawRows]);
  const rows: string[][] =
    healedRows.length > 0 && Array.isArray(healedRows[0])
      ? healedRows
      : [
          ['表头 1', '表头 2', '表头 3'],
          ['单元格 1', '单元格 2', '单元格 3'],
          ['单元格 4', '单元格 5', '单元格 6'],
        ];

  const hasHeaderRow = block.properties?.hasHeaderRow !== false;
  const colCount = rows[0]?.length || 1;
  const rowCount = rows.length;

  // 1. 每列像素宽度状态治理 (默认基准 160px)
  const defaultColWidth = 160;
  const savedWidths = (block.properties?.columnWidths as number[]) || [];
  const initialWidths = Array.from(
    { length: colCount },
    (_, idx) => savedWidths[idx] || defaultColWidth
  );
  const [localWidths, setLocalWidths] = useState<number[]>(initialWidths);

  // 2. 每列文本对齐状态治理 (默认 'left')
  const savedAlignments = (block.properties?.columnAlignments as TableColAlign[]) || [];
  const initialAlignments = Array.from(
    { length: colCount },
    (_, idx) => savedAlignments[idx] || 'left'
  );
  const [localAlignments, setLocalAlignments] = useState<TableColAlign[]>(initialAlignments);

  // 同步外部 properties 变更
  useEffect(() => {
    const nextSaved = (block.properties?.columnWidths as number[]) || [];
    setLocalWidths(
      Array.from({ length: colCount }, (_, idx) => nextSaved[idx] || defaultColWidth)
    );
  }, [block.properties?.columnWidths, colCount]);

  useEffect(() => {
    const nextAligns = (block.properties?.columnAlignments as TableColAlign[]) || [];
    setLocalAlignments(
      Array.from({ length: colCount }, (_, idx) => nextAligns[idx] || 'left')
    );
  }, [block.properties?.columnAlignments, colCount]);

  // 全局鼠标拖拽选区结束监听
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDraggingRange(false);
      dragStartRef.current = null;
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  // 拖拽手柄状态引用
  const resizingColRef = useRef<{
    colIndex: number;
    startX: number;
    startWidth: number;
  } | null>(null);

  // 规范化选区矩形区域
  const normalizedRange = useMemo(() => {
    if (!selectedRange) return null;
    const minR = Math.min(selectedRange.start.rIdx, selectedRange.end.rIdx);
    const maxR = Math.max(selectedRange.start.rIdx, selectedRange.end.rIdx);
    const minC = Math.min(selectedRange.start.cIdx, selectedRange.end.cIdx);
    const maxC = Math.max(selectedRange.start.cIdx, selectedRange.end.cIdx);
    return { minR, maxR, minC, maxC };
  }, [selectedRange]);

  const isInRange = (r: number, c: number) => {
    if (!normalizedRange) return false;
    return (
      r >= normalizedRange.minR &&
      r <= normalizedRange.maxR &&
      c >= normalizedRange.minC &&
      c <= normalizedRange.maxC
    );
  };

  const isRangeActive = Boolean(
    normalizedRange &&
      (normalizedRange.minR !== normalizedRange.maxR ||
        normalizedRange.minC !== normalizedRange.maxC)
  );

  const selectedCellCount = normalizedRange
    ? (normalizedRange.maxR - normalizedRange.minR + 1) *
      (normalizedRange.maxC - normalizedRange.minC + 1)
    : 0;

  // 更新二维数组及属性并同步
  const updateRows = (
    nextRows: string[][],
    nextWidths?: number[],
    nextAlignments?: TableColAlign[],
    saveHistory = true
  ) => {
    onUpdate(
      block.content || '',
      'table',
      {
        ...block.properties,
        rows: nextRows,
        columnWidths: nextWidths || localWidths,
        columnAlignments: nextAlignments || localAlignments,
      },
      saveHistory
    );
  };

  // 修改单个单元格
  const handleCellBlur = (rIdx: number, cIdx: number, html: string) => {
    if (rows[rIdx]?.[cIdx] === html) return;
    const next = rows.map((row, r) =>
      r === rIdx ? row.map((cell, c) => (c === cIdx ? html : cell)) : [...row]
    );
    updateRows(next, undefined, undefined, false);
  };

  // 3. 任意位置插入行 (above | below)
  const handleInsertRow = (targetIdx: number, position: 'above' | 'below') => {
    const insertAt = position === 'above' ? targetIdx : targetIdx + 1;
    const newRow = Array(colCount).fill('');
    const nextRows = [
      ...rows.slice(0, insertAt),
      newRow,
      ...rows.slice(insertAt),
    ];
    updateRows(nextRows, undefined, undefined, true);
  };

  // 增加末尾行
  const handleAddRow = () => {
    handleInsertRow(rowCount - 1, 'below');
  };

  // 4. 任意位置插入列 (left | right)
  const handleInsertCol = (targetIdx: number, position: 'left' | 'right') => {
    const insertAt = position === 'left' ? targetIdx : targetIdx + 1;
    const nextRows = rows.map((r, idx) => {
      const defaultVal = idx === 0 && hasHeaderRow ? `列 ${colCount + 1}` : '';
      return [...r.slice(0, insertAt), defaultVal, ...r.slice(insertAt)];
    });

    const nextWidths = [
      ...localWidths.slice(0, insertAt),
      defaultColWidth,
      ...localWidths.slice(insertAt),
    ];
    const nextAlignments: TableColAlign[] = [
      ...localAlignments.slice(0, insertAt),
      'left',
      ...localAlignments.slice(insertAt),
    ];

    setLocalWidths(nextWidths);
    setLocalAlignments(nextAlignments);
    updateRows(nextRows, nextWidths, nextAlignments, true);
  };

  // 增加末尾列
  const handleAddCol = () => {
    handleInsertCol(colCount - 1, 'right');
  };

  // 删除指定行
  const handleDeleteRow = (rIdx: number) => {
    if (rowCount <= 1) return;
    const next = rows.filter((_, idx) => idx !== rIdx);
    updateRows(next, undefined, undefined, true);
  };

  // 清空指定行
  const handleClearRow = (rIdx: number) => {
    const next = rows.map((row, r) =>
      r === rIdx ? Array(colCount).fill('') : [...row]
    );
    updateRows(next, undefined, undefined, true);
  };

  // 删除指定列
  const handleDeleteCol = (cIdx: number) => {
    if (colCount <= 1) return;
    const next = rows.map((r) => r.filter((_, idx) => idx !== cIdx));
    const nextWidths = localWidths.filter((_, idx) => idx !== cIdx);
    const nextAlignments = localAlignments.filter((_, idx) => idx !== cIdx);

    setLocalWidths(nextWidths);
    setLocalAlignments(nextAlignments);
    updateRows(next, nextWidths, nextAlignments, true);
  };

  // 清空指定列
  const handleClearCol = (cIdx: number) => {
    const next = rows.map((row, r) =>
      row.map((cell, c) => (c === cIdx ? (r === 0 && hasHeaderRow ? cell : '') : cell))
    );
    updateRows(next, undefined, undefined, true);
  };

  // 设定指定列对齐方式
  const handleSetColAlignment = (cIdx: number, align: TableColAlign) => {
    const updated = [...localAlignments];
    updated[cIdx] = align;
    setLocalAlignments(updated);
    updateRows(rows, localWidths, updated, true);
  };

  // 5. 跨选批量清空选区内所有单元格
  const handleClearRange = () => {
    if (!normalizedRange) return;
    const { minR, maxR, minC, maxC } = normalizedRange;
    const next = rows.map((row, r) =>
      row.map((cell, c) => (r >= minR && r <= maxR && c >= minC && c <= maxC ? '' : cell))
    );
    updateRows(next, undefined, undefined, true);
  };

  // 6. 跨选批量复制 (TSV 格式，兼容 Excel 与纯文本)
  const handleCopySelectedRange = () => {
    if (!normalizedRange) return;
    const { minR, maxR, minC, maxC } = normalizedRange;
    const tsvLines: string[] = [];
    for (let r = minR; r <= maxR; r++) {
      const slice = rows[r].slice(minC, maxC + 1);
      const cleanSlice = slice.map((c) => c.replace(/<[^>]+>/g, '').trim());
      tsvLines.push(cleanSlice.join('\t'));
    }
    navigator.clipboard.writeText(tsvLines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  // 7. 跨选批量格式化应用
  const handleBatchFormat = (format: 'bold' | 'italic' | 'underline' | 'clear') => {
    if (!normalizedRange) return;
    const { minR, maxR, minC, maxC } = normalizedRange;
    const next = rows.map((row, r) =>
      row.map((cell, c) => {
        if (r >= minR && r <= maxR && c >= minC && c <= maxC) {
          if (!cell.trim()) return cell;
          if (format === 'bold') {
            return cell.includes('<strong>') || cell.includes('<b>')
              ? cell.replace(/<\/?(strong|b)>/gi, '')
              : `<strong>${cell}</strong>`;
          } else if (format === 'italic') {
            return cell.includes('<em>') || cell.includes('<i>')
              ? cell.replace(/<\/?(em|i)>/gi, '')
              : `<em>${cell}</em>`;
          } else if (format === 'underline') {
            return cell.includes('<u>')
              ? cell.replace(/<\/?u>/gi, '')
              : `<u>${cell}</u>`;
          } else if (format === 'clear') {
            return cell.replace(/<[^>]+>/g, '');
          }
        }
        return cell;
      })
    );
    updateRows(next, undefined, undefined, true);
  };

  // 8. 文本划选检测与浮动工具条联动
  const checkTextSelection = (rIdx: number, cIdx: number) => {
    if (isRangeActive) {
      setFloatingToolbarPos(null);
      return;
    }
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
      setFloatingToolbarPos(null);
      return;
    }
    const text = sel.toString().trim();
    if (!text) {
      setFloatingToolbarPos(null);
      return;
    }

    const range = sel.getRangeAt(0);
    savedRangeRef.current = range.cloneRange();
    activeEditingCellRef.current = { rIdx, cIdx };

    const rect = range.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      setFloatingToolbarPos(null);
      return;
    }

    setFloatingToolbarPos({
      top: rect.top - 46,
      left: rect.left + rect.width / 2 - 140,
    });
  };

  // 9. 应用富文本格式至单元格选中文本
  const handleApplyTextFormat = (
    format: 'bold' | 'italic' | 'strike' | 'underline' | 'code' | 'clear'
  ) => {
    if (isRangeActive) {
      if (format === 'bold' || format === 'italic' || format === 'underline' || format === 'clear') {
        handleBatchFormat(format);
      }
      setFloatingToolbarPos(null);
      return;
    }

    const targetCell = activeEditingCellRef.current || activeCell;
    if (!targetCell) return;

    if (savedRangeRef.current) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedRangeRef.current);
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
      if (sel && sel.rangeCount > 0) {
        const cellEl = document.querySelector(
          `[id="block-${block.id}"] [data-cell-pos="${targetCell.rIdx}-${targetCell.cIdx}"]`
        );
        if (cellEl) {
          const styledElements = cellEl.querySelectorAll(
            'code, del, strike, span, a, mark, b, strong, i, em, u'
          );
          styledElements.forEach((el) => {
            if (sel.containsNode(el, true)) {
              const textNode = document.createTextNode(el.textContent || '');
              el.parentNode?.replaceChild(textNode, el);
            }
          });
        }
      }
    } else if (format === 'code') {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
        const range = sel.getRangeAt(0);
        const parentCode = range.commonAncestorContainer.parentElement?.closest('code');
        if (parentCode) {
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

    const cellEl = document.querySelector(
      `[id="block-${block.id}"] [data-cell-pos="${targetCell.rIdx}-${targetCell.cIdx}"]`
    );
    if (cellEl) {
      handleCellBlur(targetCell.rIdx, targetCell.cIdx, cellEl.innerHTML);
    }
  };

  const handleApplyHighlight = (color: string) => {
    const targetCell = activeEditingCellRef.current || activeCell;
    if (!targetCell) return;
    if (savedRangeRef.current) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedRangeRef.current);
      }
    }
    if (color) {
      document.execCommand('hiliteColor', false, color);
    } else {
      document.execCommand('removeFormat', false);
    }
    const cellEl = document.querySelector(
      `[id="block-${block.id}"] [data-cell-pos="${targetCell.rIdx}-${targetCell.cIdx}"]`
    );
    if (cellEl) {
      handleCellBlur(targetCell.rIdx, targetCell.cIdx, cellEl.innerHTML);
    }
  };

  const handleApplyLink = (url: string) => {
    const targetCell = activeEditingCellRef.current || activeCell;
    if (!targetCell) return;
    if (savedRangeRef.current) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedRangeRef.current);
      }
    }
    document.execCommand('createLink', false, url);
    const cellEl = document.querySelector(
      `[id="block-${block.id}"] [data-cell-pos="${targetCell.rIdx}-${targetCell.cIdx}"]`
    );
    if (cellEl) {
      handleCellBlur(targetCell.rIdx, targetCell.cIdx, cellEl.innerHTML);
    }
  };

  // 10. 矩阵式粘贴处理
  const handleCellPaste = (
    e: React.ClipboardEvent,
    startR: number,
    startC: number
  ) => {
    const text = e.clipboardData.getData('text/plain');
    if (!text) return;

    if (text.includes('\t') || text.includes('\n')) {
      e.preventDefault();
      const lines = text.split(/\r?\n/).filter((line) => line.length > 0);
      const matrix = lines.map((line) => line.split('\t'));

      const requiredRows = Math.max(rowCount, startR + matrix.length);
      const pasteColsCount = Math.max(...matrix.map((m) => m.length));
      const requiredCols = Math.max(colCount, startC + pasteColsCount);

      let expandedRows = rows.map((r) => [...r]);
      while (expandedRows.length < requiredRows) {
        expandedRows.push(Array(colCount).fill(''));
      }
      expandedRows = expandedRows.map((r) => {
        if (r.length < requiredCols) {
          return [...r, ...Array(requiredCols - r.length).fill('')];
        }
        return r;
      });

      matrix.forEach((mRow, rOffset) => {
        mRow.forEach((cellVal, cOffset) => {
          const targetR = startR + rOffset;
          const targetC = startC + cOffset;
          if (targetR < expandedRows.length && targetC < expandedRows[targetR].length) {
            expandedRows[targetR][targetC] = cellVal.trim();
          }
        });
      });

      let nextWidths = [...localWidths];
      while (nextWidths.length < requiredCols) {
        nextWidths.push(defaultColWidth);
      }
      let nextAlignments = [...localAlignments];
      while (nextAlignments.length < requiredCols) {
        nextAlignments.push('left');
      }

      setLocalWidths(nextWidths);
      setLocalAlignments(nextAlignments);
      updateRows(expandedRows, nextWidths, nextAlignments, true);

      setSelectedRange({
        start: { rIdx: startR, cIdx: startC },
        end: {
          rIdx: startR + matrix.length - 1,
          cIdx: startC + pasteColsCount - 1,
        },
      });
    }
  };

  // 拖拽调整列宽手柄事件流
  const handleResizeStart = (e: React.MouseEvent, cIdx: number) => {
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startWidth = localWidths[cIdx] || defaultColWidth;
    resizingColRef.current = { colIndex: cIdx, startX, startWidth };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!resizingColRef.current) return;
      const { colIndex, startX: sX, startWidth: sW } = resizingColRef.current;
      const delta = moveEvent.clientX - sX;
      const newWidth = Math.max(60, sW + delta);

      setLocalWidths((prev) => {
        const updated = [...prev];
        updated[colIndex] = newWidth;
        return updated;
      });
    };

    const handleMouseUp = (upEvent: MouseEvent) => {
      if (resizingColRef.current) {
        const { colIndex, startX: sX, startWidth: sW } = resizingColRef.current;
        const delta = upEvent.clientX - sX;
        const finalWidth = Math.max(60, sW + delta);

        setLocalWidths((prev) => {
          const updated = [...prev];
          updated[colIndex] = finalWidth;
          onUpdate(
            block.content || '',
            'table',
            {
              ...block.properties,
              columnWidths: updated,
              columnAlignments: localAlignments,
            },
            true
          );
          return updated;
        });

        resizingColRef.current = null;
      }

      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // 一键复制为标准 Markdown 表格
  const handleCopyMarkdown = () => {
    const mdLines: string[] = [];
    rows.forEach((r, idx) => {
      const cleanRow = r.map((cell) =>
        cell
          .replace(/<[^>]+>/g, '')
          .replace(/\|/g, '\\|')
          .trim()
      );
      mdLines.push(`| ${cleanRow.join(' | ')} |`);

      if (idx === 0) {
        const alignMarkers = Array.from({ length: colCount }, (_, c) => {
          const align = localAlignments[c] || 'left';
          if (align === 'center') return ':---:';
          if (align === 'right') return '---:';
          return ':---';
        });
        mdLines.push(`| ${alignMarkers.join(' | ')} |`);
      }
    });
    navigator.clipboard.writeText(mdLines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  // 聚焦指定单元格
  const focusCell = (rIdx: number, cIdx: number) => {
    setTimeout(() => {
      const target = document.querySelector(
        `[id="block-${block.id}"] [data-cell-pos="${rIdx}-${cIdx}"]`
      ) as HTMLElement | null;
      if (target) {
        target.focus();
        const sel = window.getSelection();
        if (sel) {
          sel.selectAllChildren(target);
          sel.collapseToEnd();
        }
      }
    }, 50);
  };

  const totalTableWidth = localWidths.reduce((sum, w) => sum + w, 0);

  return (
    <div
      id={`block-${block.id}`}
      className="group/table relative my-3.5 rounded-2xl bg-[#0d1117] border border-white/[0.08] shadow-2xl overflow-hidden transition-all hover:border-white/[0.14]"
    >
      {/* 顶部极简操作控制条 (Header Bar) */}
      <div className="h-9 px-3 bg-[#161b22]/90 border-b border-white/[0.06] flex items-center justify-between select-none">
        {/* 左侧表格元数据与规格指示 */}
        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06] text-indigo-400 font-medium">
            <Table size={12} />
            <span>数据表格</span>
          </div>
          <span className="text-slate-500 text-[10px]">
            {colCount} 列 × {rowCount} 行
          </span>
          {isRangeActive ? (
            <span className="text-sky-400 text-[10px] bg-sky-500/15 px-2 py-0.5 rounded-md border border-sky-500/30 font-medium animate-pulse">
              选区: {selectedCellCount} 个单元格 ({normalizedRange!.minR + 1},
              {normalizedRange!.minC + 1}) → ({normalizedRange!.maxR + 1},
              {normalizedRange!.maxC + 1})
            </span>
          ) : activeCell ? (
            <span className="text-sky-400/80 text-[10px] bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20">
              第 {activeCell.rIdx + 1} 行 · 第 {activeCell.cIdx + 1} 列
            </span>
          ) : null}
        </div>

        {/* 右侧极简操作区 */}
        <div className="flex items-center gap-1.5 text-[11px]">
          {/* 跨选批量快捷工具 */}
          {isRangeActive && (
            <div className="flex items-center gap-1 mr-1 bg-sky-500/10 border border-sky-500/25 px-1.5 py-0.5 rounded-lg">
              <button
                type="button"
                onClick={() => handleBatchFormat('bold')}
                className="p-1 rounded hover:bg-white/10 text-sky-300 hover:text-white transition-colors cursor-pointer"
                title="批量加粗 (Ctrl+B)"
              >
                <Bold size={11} />
              </button>
              <button
                type="button"
                onClick={() => handleBatchFormat('italic')}
                className="p-1 rounded hover:bg-white/10 text-sky-300 hover:text-white transition-colors cursor-pointer"
                title="批量斜体 (Ctrl+I)"
              >
                <Italic size={11} />
              </button>
              <button
                type="button"
                onClick={handleClearRange}
                className="p-1 rounded hover:bg-amber-500/20 text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
                title="批量清空选区 (Delete)"
              >
                <Eraser size={11} />
              </button>
              <button
                type="button"
                onClick={handleCopySelectedRange}
                className="p-1 rounded hover:bg-sky-500/20 text-slate-400 hover:text-sky-300 transition-colors cursor-pointer"
                title="复制选区数据 (TSV / Ctrl+C)"
              >
                <Copy size={11} />
              </button>
            </div>
          )}

          {/* 首行表头切换 */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() =>
              onUpdate(
                block.content,
                'table',
                { ...block.properties, hasHeaderRow: !hasHeaderRow },
                true
              )
            }
            className={`flex items-center gap-1 px-2 py-1 rounded-md border text-[11px] transition-colors cursor-pointer ${
              hasHeaderRow
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-slate-200 border-white/[0.08]'
            }`}
            title={hasHeaderRow ? '关闭首行表头高亮' : '开启首行表头高亮'}
          >
            {hasHeaderRow ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
            <span>首行表头</span>
          </button>

          {/* 复制 Markdown 表格 */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleCopyMarkdown}
            className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            title="复制为标准 GFM 对齐 Markdown 表格"
          >
            {copied ? (
              <>
                <Check size={12} className="text-emerald-400" />
                <span className="text-emerald-400 font-medium">已复制</span>
              </>
            ) : (
              <>
                <Copy size={12} />
                <span>复制 MD</span>
              </>
            )}
          </button>

          {/* 删除整表 */}
          <button
            type="button"
            onClick={onDelete}
            className="p-1 rounded-md hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 border border-transparent hover:border-rose-500/30 transition-colors cursor-pointer ml-1"
            title="删除整个表格"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* 表格二维呈现网格 Canvas */}
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20 scrollbar-track-transparent select-text p-2.5">
        <div className="relative inline-block min-w-full">
          <table
            className="border-collapse text-left font-sans text-[13px] border border-white/[0.12] bg-[#0d1117]"
            style={{
              tableLayout: 'fixed',
              width: `${Math.max(totalTableWidth, 100)}px`,
              minWidth: '100%',
            }}
          >
            <colgroup>
              {localWidths.map((w, idx) => (
                <col key={idx} style={{ width: `${w}px` }} />
              ))}
            </colgroup>

            <tbody>
              {rows.map((row, rIdx) => {
                const isHeader = rIdx === 0 && hasHeaderRow;
                return (
                  <tr
                    key={rIdx}
                    className={`group/row transition-colors ${
                      isHeader
                        ? 'bg-[#161b22] font-semibold text-slate-100'
                        : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    {row.map((cell, cIdx) => {
                      const colAlign = localAlignments[cIdx] || 'left';
                      const alignClass =
                        colAlign === 'center'
                          ? 'text-center'
                          : colAlign === 'right'
                          ? 'text-right'
                          : 'text-left';

                      const isSelected = isInRange(rIdx, cIdx);

                      return (
                        <td
                          key={cIdx}
                          style={{ width: `${localWidths[cIdx] || defaultColWidth}px` }}
                          className={`px-3 py-2 align-top border border-white/[0.08] relative group/cell transition-colors ${
                            isSelected
                              ? 'bg-sky-500/20 ring-1 ring-inset ring-sky-400/60'
                              : isHeader
                              ? 'text-slate-200'
                              : 'text-slate-300'
                          } ${alignClass}`}
                          onMouseDown={(e) => {
                            // Shift + 点击：框选至当前单元格
                            if (e.shiftKey) {
                              e.preventDefault();
                              const start = activeCell || { rIdx: 0, cIdx: 0 };
                              setSelectedRange({
                                start,
                                end: { rIdx, cIdx },
                              });
                              setActiveCell({ rIdx, cIdx });
                              return;
                            }

                            // 普通点击：启动拖拽选区
                            dragStartRef.current = { rIdx, cIdx };
                            setIsDraggingRange(true);
                          }}
                          onMouseEnter={() => {
                            // 拖拽多选滑动
                            if (isDraggingRange && dragStartRef.current) {
                              setSelectedRange({
                                start: dragStartRef.current,
                                end: { rIdx, cIdx },
                              });
                            }
                          }}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            // 若右键单元格不在当前多选区内，重置多选为该单格
                            if (!isInRange(rIdx, cIdx)) {
                              setSelectedRange(null);
                              setActiveCell({ rIdx, cIdx });
                            }
                            setContextMenu({
                              x: e.clientX,
                              y: e.clientY,
                              rIdx,
                              cIdx,
                            });
                          }}
                        >
                          {/* 列分割线吸附微手柄 */}
                          {rIdx === 0 && (
                            <div
                              className="absolute -top-2.5 right-[-8px] z-30 opacity-0 group-hover/cell:opacity-100 transition-opacity select-none"
                              title="在此列右侧插入新列"
                            >
                              <button
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleInsertCol(cIdx, 'right');
                                }}
                                className="w-4 h-4 rounded-full bg-sky-500 hover:bg-sky-400 text-white flex items-center justify-center shadow-lg hover:scale-125 active:scale-95 transition-all cursor-pointer"
                              >
                                <Plus size={10} strokeWidth={3} />
                              </button>
                            </div>
                          )}

                          {/* 首列左边缘插入手柄 */}
                          {rIdx === 0 && cIdx === 0 && (
                            <div
                              className="absolute -top-2.5 left-[-8px] z-30 opacity-0 group-hover/cell:opacity-100 transition-opacity select-none"
                              title="在最左侧插入新列"
                            >
                              <button
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleInsertCol(0, 'left');
                                }}
                                className="w-4 h-4 rounded-full bg-sky-500 hover:bg-sky-400 text-white flex items-center justify-center shadow-lg hover:scale-125 active:scale-95 transition-all cursor-pointer"
                              >
                                <Plus size={10} strokeWidth={3} />
                              </button>
                            </div>
                          )}

                          {/* 行分割线吸附微手柄 */}
                          {cIdx === 0 && (
                            <div
                              className="absolute -bottom-2 -left-2.5 z-30 opacity-0 group-hover/row:opacity-100 transition-opacity select-none"
                              title="在此行下方插入新行"
                            >
                              <button
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleInsertRow(rIdx, 'below');
                                }}
                                className="w-4 h-4 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center shadow-lg hover:scale-125 active:scale-95 transition-all cursor-pointer"
                              >
                                <Plus size={10} strokeWidth={3} />
                              </button>
                            </div>
                          )}

                          {/* 首行上方插入手柄 */}
                          {rIdx === 0 && cIdx === 0 && (
                            <div
                              className="absolute -top-2 -left-2.5 z-30 opacity-0 group-hover/row:opacity-100 transition-opacity select-none"
                              title="在最上方插入新行"
                            >
                              <button
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleInsertRow(0, 'above');
                                }}
                                className="w-4 h-4 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center shadow-lg hover:scale-125 active:scale-95 transition-all cursor-pointer"
                              >
                                <Plus size={10} strokeWidth={3} />
                              </button>
                            </div>
                          )}

                          {/* 表头右上角微型操作指示点 */}
                          {rIdx === 0 && (
                            <button
                              type="button"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={(e) => {
                                e.stopPropagation();
                                const rect = e.currentTarget.getBoundingClientRect();
                                setContextMenu({
                                  x: rect.left,
                                  y: rect.bottom + 4,
                                  rIdx,
                                  cIdx,
                                });
                              }}
                              className="absolute top-1 right-1.5 p-0.5 rounded opacity-0 group-hover/cell:opacity-60 hover:!opacity-100 text-slate-400 hover:text-slate-200 hover:bg-white/10 transition-all select-none cursor-pointer z-10"
                              title="列选项与对齐菜单"
                            >
                              <MoreHorizontal size={12} />
                            </button>
                          )}

                          {/* 列宽调整交互手柄 */}
                          {rIdx === 0 && (
                            <div
                              onMouseDown={(e) => handleResizeStart(e, cIdx)}
                              className="absolute top-0 right-[-3px] bottom-0 w-[6px] cursor-col-resize hover:bg-sky-500/40 active:bg-sky-500 z-20 select-none group/resize"
                              title="左右拖动调整列宽"
                            >
                              <div className="w-[1px] h-full mx-auto bg-transparent group-hover/resize:bg-sky-400 group-active/resize:bg-sky-400 transition-colors" />
                            </div>
                          )}

                          {/* 单元格内容编辑器 (双轨键盘流与富文本快捷键) */}
                          <div
                            data-cell-pos={`${rIdx}-${cIdx}`}
                            contentEditable={true}
                            suppressContentEditableWarning={true}
                            dangerouslySetInnerHTML={{ __html: cell }}
                            onFocus={() => {
                              setActiveCell({ rIdx, cIdx });
                            }}
                            onBlur={(e) => {
                              handleCellBlur(rIdx, cIdx, e.currentTarget.innerHTML);
                            }}
                            onMouseUp={() => checkTextSelection(rIdx, cIdx)}
                            onKeyUp={() => checkTextSelection(rIdx, cIdx)}
                            onPaste={(e) => handleCellPaste(e, rIdx, cIdx)}
                            onKeyDown={(e) => {
                              // 1. Esc: 取消多选
                              if (e.key === 'Escape') {
                                e.preventDefault();
                                setSelectedRange(null);
                                setFloatingToolbarPos(null);
                                return;
                              }

                              // 2. Delete / Backspace: 多选态下批量清空
                              if (
                                (e.key === 'Delete' || e.key === 'Backspace') &&
                                isRangeActive
                              ) {
                                e.preventDefault();
                                handleClearRange();
                                return;
                              }

                              // 3. Ctrl+C: 多选态下矩阵复制 TSV
                              if (
                                (e.ctrlKey || e.metaKey) &&
                                e.key.toLowerCase() === 'c' &&
                                isRangeActive
                              ) {
                                e.preventDefault();
                                handleCopySelectedRange();
                                return;
                              }

                              // 4. 富文本快捷键 (Ctrl+B, Ctrl+I, Ctrl+U)
                              if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
                                e.preventDefault();
                                handleApplyTextFormat('bold');
                                return;
                              }
                              if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
                                e.preventDefault();
                                handleApplyTextFormat('italic');
                                return;
                              }
                              if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'u') {
                                e.preventDefault();
                                handleApplyTextFormat('underline');
                                return;
                              }

                              // 5. Enter: 跳转下一行同列 (未按 Shift)
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                setSelectedRange(null);
                                if (rIdx < rowCount - 1) {
                                  focusCell(rIdx + 1, cIdx);
                                } else {
                                  handleInsertRow(rIdx, 'below');
                                  focusCell(rIdx + 1, cIdx);
                                }
                                return;
                              }

                              // 6. Tab: 顺序跳格
                              if (e.key === 'Tab') {
                                e.preventDefault();
                                setSelectedRange(null);
                                if (e.shiftKey) {
                                  if (cIdx > 0) {
                                    focusCell(rIdx, cIdx - 1);
                                  } else if (rIdx > 0) {
                                    focusCell(rIdx - 1, colCount - 1);
                                  }
                                } else {
                                  if (cIdx < colCount - 1) {
                                    focusCell(rIdx, cIdx + 1);
                                  } else if (rIdx < rowCount - 1) {
                                    focusCell(rIdx + 1, 0);
                                  } else {
                                    handleInsertRow(rIdx, 'below');
                                    focusCell(rIdx + 1, 0);
                                  }
                                }
                              }
                            }}
                            className={`outline-none focus:outline-none min-h-[1.35rem] leading-[20px] cursor-text select-text break-words rounded px-1 py-0.5 focus:bg-white/[0.04] focus:ring-1 focus:ring-sky-500/40 transition-all ${
                              isHeader ? 'font-medium' : 'font-normal'
                            }`}
                          />
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* 表格底部极简辅助扩展栏 */}
          <div className="flex items-center gap-3 mt-1.5 px-1 text-[11px] text-slate-500 select-none">
            <button
              type="button"
              onClick={handleAddRow}
              className="flex items-center gap-1 hover:text-emerald-400 transition-colors cursor-pointer py-0.5"
            >
              <Plus size={11} />
              <span>新增行</span>
            </button>
            <button
              type="button"
              onClick={handleAddCol}
              className="flex items-center gap-1 hover:text-sky-400 transition-colors cursor-pointer py-0.5"
            >
              <Plus size={11} />
              <span>新增列</span>
            </button>
            <span className="text-slate-600">·</span>
            <span className="text-slate-500 text-[10px]">
              支持 Shift+点击/拖拽跨行跨列多选 · 选中文本即刻弹出富文本格式浮条 · 支持 Ctrl+B/I/U
            </span>
          </div>
        </div>
      </div>

      {/* 沉浸式暗黑毛玻璃右键上下文菜单 (带选区联动) */}
      {contextMenu && (
        <TableContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          rIdx={contextMenu.rIdx}
          cIdx={contextMenu.cIdx}
          rowCount={rowCount}
          colCount={colCount}
          currentAlign={localAlignments[contextMenu.cIdx] || 'left'}
          isRangeActive={isRangeActive}
          selectedCellCount={selectedCellCount}
          onAlignChange={(align) => {
            if (isRangeActive && normalizedRange) {
              const { minC, maxC } = normalizedRange;
              const updated = [...localAlignments];
              for (let c = minC; c <= maxC; c++) {
                updated[c] = align;
              }
              setLocalAlignments(updated);
              updateRows(rows, localWidths, updated, true);
            } else {
              handleSetColAlignment(contextMenu.cIdx, align);
            }
          }}
          onInsertRowAbove={() => handleInsertRow(contextMenu.rIdx, 'above')}
          onInsertRowBelow={() => handleInsertRow(contextMenu.rIdx, 'below')}
          onInsertColLeft={() => handleInsertCol(contextMenu.cIdx, 'left')}
          onInsertColRight={() => handleInsertCol(contextMenu.cIdx, 'right')}
          onClearRow={() => handleClearRow(contextMenu.rIdx)}
          onClearCol={() => handleClearCol(contextMenu.cIdx)}
          onDeleteRow={() => handleDeleteRow(contextMenu.rIdx)}
          onDeleteCol={() => handleDeleteCol(contextMenu.cIdx)}
          onClearRange={handleClearRange}
          onBatchFormat={handleBatchFormat}
          onCopyMarkdown={handleCopyMarkdown}
          onCopySelectedRange={handleCopySelectedRange}
          onDeleteTable={onDelete}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* 划选文字即时浮动富文本工具条 */}
      {floatingToolbarPos && (
        <FloatingFormatToolbar
          position={floatingToolbarPos}
          onApplyFormat={handleApplyTextFormat}
          onApplyLink={handleApplyLink}
          onApplyHighlight={handleApplyHighlight}
          onClose={() => setFloatingToolbarPos(null)}
        />
      )}
    </div>
  );
};
