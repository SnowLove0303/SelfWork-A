import React, { useState, useRef, useEffect, useMemo } from 'react';
import { DocBlock } from '../../../types/docs.ts';
import { Table, Plus, Trash2, Check, Copy, ToggleLeft, ToggleRight } from 'lucide-react';
import { healTableRows } from '../../../services/docHealingService.ts';

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

  // 同步外部 properties.columnWidths 变更
  useEffect(() => {
    const nextSaved = (block.properties?.columnWidths as number[]) || [];
    setLocalWidths(
      Array.from({ length: colCount }, (_, idx) => nextSaved[idx] || defaultColWidth)
    );
  }, [block.properties?.columnWidths, colCount]);

  // 拖拽手柄状态引用
  const resizingColRef = useRef<{
    colIndex: number;
    startX: number;
    startWidth: number;
  } | null>(null);

  // 更新二维数组并同步
  const updateRows = (
    nextRows: string[][],
    nextWidths?: number[],
    saveHistory = true
  ) => {
    onUpdate(
      block.content || '',
      'table',
      {
        ...block.properties,
        rows: nextRows,
        columnWidths: nextWidths || localWidths,
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
    updateRows(next, undefined, false);
  };

  // 增加新行
  const handleAddRow = () => {
    const newRow = Array(colCount).fill('');
    updateRows([...rows, newRow], undefined, true);
  };

  // 增加新列
  const handleAddCol = () => {
    const next = rows.map((r, idx) => [
      ...r,
      idx === 0 && hasHeaderRow ? `列 ${colCount + 1}` : '',
    ]);
    const nextWidths = [...localWidths, defaultColWidth];
    setLocalWidths(nextWidths);
    updateRows(next, nextWidths, true);
  };

  // 删除指定行
  const handleDeleteRow = (rIdx: number) => {
    if (rowCount <= 1) return;
    const next = rows.filter((_, idx) => idx !== rIdx);
    updateRows(next, undefined, true);
  };

  // 删除指定列
  const handleDeleteCol = (cIdx: number) => {
    if (colCount <= 1) return;
    const next = rows.map((r) => r.filter((_, idx) => idx !== cIdx));
    const nextWidths = localWidths.filter((_, idx) => idx !== cIdx);
    setLocalWidths(nextWidths);
    updateRows(next, nextWidths, true);
  };

  // 2. 拖拽调整列宽手柄事件流
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
        mdLines.push(`| ${Array(colCount).fill('---').join(' | ')} |`);
      }
    });
    navigator.clipboard.writeText(mdLines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  // 计算表格总有效宽度
  const totalTableWidth =
    localWidths.reduce((sum, w) => sum + w, 0) + (rowCount > 1 ? 36 : 0);

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
            title="复制为标准 Markdown 表格"
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

          {/* 增加列 */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleAddCol}
            className="flex items-center gap-0.5 px-2 py-1 rounded-md bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-400 hover:text-sky-300 transition-colors cursor-pointer"
            title="在右侧追加新列"
          >
            <Plus size={11} />
            <span>加列</span>
          </button>

          {/* 增加行 */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleAddRow}
            className="flex items-center gap-0.5 px-2 py-1 rounded-md bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-400 hover:text-emerald-300 transition-colors cursor-pointer"
            title="在底部追加新行"
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

      {/* 表格二维呈现网格 Canvas（支持平滑水平拖动与滚动） */}
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
            {rowCount > 1 && <col style={{ width: '36px' }} />}
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
                  {row.map((cell, cIdx) => (
                    <td
                      key={cIdx}
                      style={{ width: `${localWidths[cIdx] || defaultColWidth}px` }}
                      className={`px-3 py-2 align-top border-r border-white/[0.05] last:border-r-0 relative group/cell ${
                        isHeader ? 'text-slate-200' : 'text-slate-300'
                      }`}
                    >
                      {/* 列宽调整交互手柄 (仅在表头或第0行渲染) */}
                      {rIdx === 0 && (
                        <div
                          onMouseDown={(e) => handleResizeStart(e, cIdx)}
                          className="absolute top-0 right-0 bottom-0 w-2 cursor-col-resize hover:bg-sky-500/40 active:bg-sky-500 z-10 flex items-center justify-center select-none group/resize"
                          title="左右拖动调整列宽"
                        >
                          <div className="w-[1.5px] h-full bg-white/[0.06] group-hover/resize:bg-sky-400 group-active/resize:bg-sky-400 transition-colors" />
                        </div>
                      )}

                      {/* 单元格微型行列删除浮钮（仅悬停且列数 > 1 时显示） */}
                      {rIdx === 0 && colCount > 1 && (
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleDeleteCol(cIdx)}
                          className="absolute -top-1.5 right-2 opacity-0 group-hover/cell:opacity-100 p-0.5 rounded bg-slate-800 text-slate-500 hover:text-rose-400 border border-white/10 text-[9px] transition-all cursor-pointer shadow-md z-20"
                          title="删除此列"
                        >
                          <Trash2 size={9} />
                        </button>
                      )}

                      <div
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                        dangerouslySetInnerHTML={{ __html: cell }}
                        onBlur={(e) =>
                          handleCellBlur(rIdx, cIdx, e.currentTarget.innerHTML)
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Tab') {
                            e.preventDefault();
                            // Tab 键智能跳至下一格
                            const inputs = Array.from(
                              document.querySelectorAll(
                                `[id="block-${block.id}"] [contenteditable="true"]`
                              )
                            ) as HTMLElement[];
                            const currentIndex = inputs.indexOf(e.currentTarget);
                            if (e.shiftKey) {
                              if (currentIndex > 0) inputs[currentIndex - 1]?.focus();
                            } else {
                              if (currentIndex < inputs.length - 1) {
                                inputs[currentIndex + 1]?.focus();
                              } else {
                                // 到达最后一格，自动加行并聚焦新行首格
                                handleAddRow();
                                setTimeout(() => {
                                  const refreshed = Array.from(
                                    document.querySelectorAll(
                                      `[id="block-${block.id}"] [contenteditable="true"]`
                                    )
                                  ) as HTMLElement[];
                                  refreshed[currentIndex + 1]?.focus();
                                }, 50);
                              }
                            }
                          }
                        }}
                        className={`outline-none focus:outline-none min-h-[1.35rem] leading-[20px] cursor-text select-text break-words rounded px-1 py-0.5 focus:bg-white/[0.04] focus:ring-1 focus:ring-sky-500/40 transition-all ${
                          isHeader ? 'font-medium' : 'font-normal'
                        }`}
                      />
                    </td>
                  ))}
                  {/* 行删除微按钮 */}
                  {rowCount > 1 && (
                    <td className="w-9 px-1 text-center border-b border-transparent">
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleDeleteRow(rIdx)}
                        className="opacity-0 group-hover/row:opacity-100 p-1 rounded hover:bg-rose-500/20 text-slate-600 hover:text-rose-400 transition-opacity cursor-pointer"
                        title="删除此行"
                      >
                        <Trash2 size={11} />
                      </button>
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
