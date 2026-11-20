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
} from 'lucide-react';
import { healTableRows } from '../../../services/docHealingService.ts';

export type TableColAlign = 'left' | 'center' | 'right';

interface TableContextMenuProps {
  x: number;
  y: number;
  rIdx: number;
  cIdx: number;
  rowCount: number;
  colCount: number;
  currentAlign: TableColAlign;
  onAlignChange: (align: TableColAlign) => void;
  onInsertRowAbove: () => void;
  onInsertRowBelow: () => void;
  onInsertColLeft: () => void;
  onInsertColRight: () => void;
  onClearRow: () => void;
  onClearCol: () => void;
  onDeleteRow: () => void;
  onDeleteCol: () => void;
  onCopyMarkdown: () => void;
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
  onAlignChange,
  onInsertRowAbove,
  onInsertRowBelow,
  onInsertColLeft,
  onInsertColRight,
  onClearRow,
  onClearCol,
  onDeleteRow,
  onDeleteCol,
  onCopyMarkdown,
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

  const menuWidth = 200;
  const menuHeight = 390;
  const clampedX = Math.min(x, window.innerWidth - menuWidth - 16);
  const clampedY = Math.min(y, window.innerHeight - menuHeight - 16);

  return (
    <div
      ref={menuRef}
      style={{ left: `${Math.max(8, clampedX)}px`, top: `${Math.max(8, clampedY)}px` }}
      className="fixed z-[9999] w-[200px] rounded-xl bg-[#161b22]/95 backdrop-blur-xl border border-white/10 shadow-2xl p-1.5 text-[12px] text-slate-300 select-none animate-in fade-in zoom-in-95 duration-100"
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* 文本对齐方式 */}
      <div className="px-2 py-1 text-[10px] font-medium text-slate-500 uppercase tracking-wider">
        文本对齐 (第 {cIdx + 1} 列)
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
        <span>复制 Markdown 表格</span>
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
  const [activeCell, setActiveCell] = useState<{ rIdx: number; cIdx: number } | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    rIdx: number;
    cIdx: number;
  } | null>(null);

  // 解析并运行运行时自愈规范化二维数据（自动消除克隆列与转义字符切裂）
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

  // 拖拽手柄状态引用
  const resizingColRef = useRef<{
    colIndex: number;
    startX: number;
    startWidth: number;
  } | null>(null);

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

  // 一键复制为标准 Markdown 表格 (支持 GFM :---, :---:, ---: 对齐标记)
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
        // 生成对齐标记行
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
        // 光标移至末尾
        const sel = window.getSelection();
        if (sel) {
          sel.selectAllChildren(target);
          sel.collapseToEnd();
        }
      }
    }, 50);
  };

  // 计算表格总有效宽度 (纯数据列宽度和，无多余占位列)
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
          {activeCell && (
            <span className="text-sky-400/80 text-[10px] bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20">
              第 {activeCell.rIdx + 1} 行 · 第 {activeCell.cIdx + 1} 列
            </span>
          )}
        </div>

        {/* 右侧极简操作区 */}
        <div className="flex items-center gap-1.5 text-[11px]">
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

      {/* 表格二维呈现网格 Canvas (彻底闭合网格，消除任何断点与不对齐) */}
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
            {/* 列宽锁定 colgroup (纯数据列，绝无多余操作假列) */}
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

                      return (
                        <td
                          key={cIdx}
                          style={{ width: `${localWidths[cIdx] || defaultColWidth}px` }}
                          className={`px-3 py-2 align-top border border-white/[0.08] relative group/cell ${
                            isHeader ? 'text-slate-200' : 'text-slate-300'
                          } ${alignClass}`}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setContextMenu({
                              x: e.clientX,
                              y: e.clientY,
                              rIdx,
                              cIdx,
                            });
                          }}
                        >
                          {/* Notion/飞书式 列分割线吸附插入微手柄 (首行悬停浮现) */}
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

                          {/* 首列左边缘插入手柄 (向左插入列) */}
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

                          {/* Notion/飞书式 行分割线吸附插入微手柄 (首列悬停浮现) */}
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

                          {/* 首行上方插入手柄 (向上插入行) */}
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

                          {/* 表头右上角微型操作指示点 (··· 右键或点击呼出上下文菜单) */}
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

                          {/* 列宽调整交互手柄 (仅第 0 行，绝对定位垂直分割线) */}
                          {rIdx === 0 && (
                            <div
                              onMouseDown={(e) => handleResizeStart(e, cIdx)}
                              className="absolute top-0 right-[-3px] bottom-0 w-[6px] cursor-col-resize hover:bg-sky-500/40 active:bg-sky-500 z-20 select-none group/resize"
                              title="左右拖动调整列宽"
                            >
                              <div className="w-[1px] h-full mx-auto bg-transparent group-hover/resize:bg-sky-400 group-active/resize:bg-sky-400 transition-colors" />
                            </div>
                          )}

                          {/* 单元格内容编辑器 (Word 键盘流) */}
                          <div
                            data-cell-pos={`${rIdx}-${cIdx}`}
                            contentEditable={true}
                            suppressContentEditableWarning={true}
                            dangerouslySetInnerHTML={{ __html: cell }}
                            onFocus={() => setActiveCell({ rIdx, cIdx })}
                            onBlur={(e) => {
                              handleCellBlur(rIdx, cIdx, e.currentTarget.innerHTML);
                            }}
                            onKeyDown={(e) => {
                              // 1. Enter: 跳转下一行同列 (未按 Shift)
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                if (rIdx < rowCount - 1) {
                                  focusCell(rIdx + 1, cIdx);
                                } else {
                                  // 最后一行回车：自动追加新行并聚焦
                                  handleInsertRow(rIdx, 'below');
                                  focusCell(rIdx + 1, cIdx);
                                }
                                return;
                              }

                              // 2. Tab: 顺序跳格
                              if (e.key === 'Tab') {
                                e.preventDefault();
                                if (e.shiftKey) {
                                  // 向上一个单元格跳
                                  if (cIdx > 0) {
                                    focusCell(rIdx, cIdx - 1);
                                  } else if (rIdx > 0) {
                                    focusCell(rIdx - 1, colCount - 1);
                                  }
                                } else {
                                  // 向下一个单元格跳
                                  if (cIdx < colCount - 1) {
                                    focusCell(rIdx, cIdx + 1);
                                  } else if (rIdx < rowCount - 1) {
                                    focusCell(rIdx + 1, 0);
                                  } else {
                                    // 表格最后一格 Tab：自动加行
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

          {/* 表格底部极简辅助扩展栏 (Notion 风格微触发) */}
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
            <span className="text-slate-600 text-[10px]">
              右键单元格或表头呼出完整编辑菜单
            </span>
          </div>
        </div>
      </div>

      {/* 沉浸式暗黑毛玻璃右键上下文菜单 */}
      {contextMenu && (
        <TableContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          rIdx={contextMenu.rIdx}
          cIdx={contextMenu.cIdx}
          rowCount={rowCount}
          colCount={colCount}
          currentAlign={localAlignments[contextMenu.cIdx] || 'left'}
          onAlignChange={(align) => handleSetColAlignment(contextMenu.cIdx, align)}
          onInsertRowAbove={() => handleInsertRow(contextMenu.rIdx, 'above')}
          onInsertRowBelow={() => handleInsertRow(contextMenu.rIdx, 'below')}
          onInsertColLeft={() => handleInsertCol(contextMenu.cIdx, 'left')}
          onInsertColRight={() => handleInsertCol(contextMenu.cIdx, 'right')}
          onClearRow={() => handleClearRow(contextMenu.rIdx)}
          onClearCol={() => handleClearCol(contextMenu.cIdx)}
          onDeleteRow={() => handleDeleteRow(contextMenu.rIdx)}
          onDeleteCol={() => handleDeleteCol(contextMenu.cIdx)}
          onCopyMarkdown={handleCopyMarkdown}
          onDeleteTable={onDelete}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
};
