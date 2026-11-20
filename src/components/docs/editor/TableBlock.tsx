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
} from 'lucide-react';
import { healTableRows } from '../../../services/docHealingService.ts';

export type TableColAlign = 'left' | 'center' | 'right';

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

  // 切换指定列对齐方式 (left -> center -> right -> left)
  const handleToggleColAlignment = (cIdx: number) => {
    const current = localAlignments[cIdx] || 'left';
    const nextMap: Record<TableColAlign, TableColAlign> = {
      left: 'center',
      center: 'right',
      right: 'left',
    };
    const nextAlign = nextMap[current] || 'left';
    const updated = [...localAlignments];
    updated[cIdx] = nextAlign;
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

  // 计算表格总有效宽度
  const totalTableWidth =
    localWidths.reduce((sum, w) => sum + w, 0) + (rowCount > 1 ? 52 : 0);

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

        {/* 右侧操作胶囊栏 */}
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

          {/* 右侧追加新列 */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleAddCol}
            className="flex items-center gap-0.5 px-2 py-1 rounded-md bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-400 hover:text-sky-300 transition-colors cursor-pointer"
            title="在最右侧追加新列"
          >
            <Plus size={11} />
            <span>加列</span>
          </button>

          {/* 底部追加新行 */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleAddRow}
            className="flex items-center gap-0.5 px-2 py-1 rounded-md bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-400 hover:text-emerald-300 transition-colors cursor-pointer"
            title="在最底部追加新行"
          >
            <Plus size={11} />
            <span>加行</span>
          </button>

          {/* 删除整表 */}
          <button
            type="button"
            onClick={onDelete}
            className="p-1 rounded-md hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 border border-transparent hover:border-rose-500/30 transition-colors cursor-pointer ml-1"
            title="删除整个表格块"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* 表格二维呈现网格 Canvas */}
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20 scrollbar-track-transparent select-text">
        <table
          className="border-collapse text-left font-sans text-[13px]"
          style={{
            tableLayout: 'fixed',
            width: `${Math.max(totalTableWidth, 100)}px`,
            minWidth: '100%',
          }}
        >
          {/* 列宽锁定 colgroup */}
          <colgroup>
            {localWidths.map((w, idx) => (
              <col key={idx} style={{ width: `${w}px` }} />
            ))}
            {rowCount > 1 && <col style={{ width: '52px' }} />}
          </colgroup>

          <tbody>
            {rows.map((row, rIdx) => {
              const isHeader = rIdx === 0 && hasHeaderRow;
              return (
                <tr
                  key={rIdx}
                  className={`group/row transition-colors ${
                    isHeader
                      ? 'bg-[#161b22] font-semibold text-slate-100 border-b border-white/[0.08]'
                      : 'border-b border-white/[0.05] hover:bg-white/[0.02]'
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
                        className={`px-3 py-2 align-top border-r border-white/[0.05] last:border-r-0 relative group/cell ${
                          isHeader ? 'text-slate-200' : 'text-slate-300'
                        } ${alignClass}`}
                      >
                        {/* 表头快捷操作栏 (仅首行悬停展示：对齐切换、左/右插入列、清空列、删除列) */}
                        {rIdx === 0 && (
                          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 opacity-0 group-hover/cell:opacity-100 flex items-center gap-0.5 px-1 py-0.5 rounded-md bg-[#1c2128] border border-white/10 shadow-xl z-30 transition-all select-none">
                            {/* 向左插入列 */}
                            <button
                              type="button"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => handleInsertCol(cIdx, 'left')}
                              className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-sky-300 transition-colors cursor-pointer"
                              title="在左侧插入新列"
                            >
                              <ArrowLeft size={10} />
                            </button>

                            {/* 对齐方式切换 */}
                            <button
                              type="button"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => handleToggleColAlignment(cIdx)}
                              className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
                              title={`当前对齐: ${
                                colAlign === 'center'
                                  ? '居中'
                                  : colAlign === 'right'
                                  ? '右对齐'
                                  : '左对齐'
                              } (点击切换)`}
                            >
                              {colAlign === 'center' ? (
                                <AlignCenter size={10} />
                              ) : colAlign === 'right' ? (
                                <AlignRight size={10} />
                              ) : (
                                <AlignLeft size={10} />
                              )}
                            </button>

                            {/* 向右插入列 */}
                            <button
                              type="button"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => handleInsertCol(cIdx, 'right')}
                              className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-sky-300 transition-colors cursor-pointer"
                              title="在右侧插入新列"
                            >
                              <ArrowRight size={10} />
                            </button>

                            {/* 清空列内容 */}
                            <button
                              type="button"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => handleClearCol(cIdx)}
                              className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-orange-300 transition-colors cursor-pointer"
                              title="清空此列内容"
                            >
                              <Eraser size={10} />
                            </button>

                            {/* 删除列 */}
                            {colCount > 1 && (
                              <button
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => handleDeleteCol(cIdx)}
                                className="p-1 rounded hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                                title="删除此列"
                              >
                                <Trash2 size={10} />
                              </button>
                            )}
                          </div>
                        )}

                        {/* 列宽调整交互手柄 (仅第 0 行) */}
                        {rIdx === 0 && (
                          <div
                            onMouseDown={(e) => handleResizeStart(e, cIdx)}
                            className="absolute top-0 right-0 bottom-0 w-2 cursor-col-resize hover:bg-sky-500/40 active:bg-sky-500 z-10 flex items-center justify-center select-none group/resize"
                            title="左右拖动调整列宽"
                          >
                            <div className="w-[1.5px] h-full bg-white/[0.06] group-hover/resize:bg-sky-400 group-active/resize:bg-sky-400 transition-colors" />
                          </div>
                        )}

                        {/* 单元格内容编辑器 */}
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

                  {/* 行操作侧栏：上下插入行、清空行、删除行 */}
                  {rowCount > 1 && (
                    <td className="w-13 px-1 text-center border-b border-transparent select-none">
                      <div className="opacity-0 group-hover/row:opacity-100 flex items-center justify-center gap-0.5 transition-opacity">
                        {/* 上方插入行 */}
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleInsertRow(rIdx, 'above')}
                          className="p-1 rounded hover:bg-white/10 text-slate-500 hover:text-emerald-300 transition-colors cursor-pointer"
                          title="在上方插入新行"
                        >
                          <ArrowUp size={10} />
                        </button>

                        {/* 下方插入行 */}
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleInsertRow(rIdx, 'below')}
                          className="p-1 rounded hover:bg-white/10 text-slate-500 hover:text-emerald-300 transition-colors cursor-pointer"
                          title="在下方插入新行"
                        >
                          <ArrowDown size={10} />
                        </button>

                        {/* 清空行 */}
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleClearRow(rIdx)}
                          className="p-1 rounded hover:bg-white/10 text-slate-500 hover:text-orange-300 transition-colors cursor-pointer"
                          title="清空此行内容"
                        >
                          <Eraser size={10} />
                        </button>

                        {/* 删除行 */}
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleDeleteRow(rIdx)}
                          className="p-1 rounded hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                          title="删除此行"
                        >
                          <Trash2 size={10} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
