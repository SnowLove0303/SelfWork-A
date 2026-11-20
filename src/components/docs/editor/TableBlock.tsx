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
  Eraser,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  MoreHorizontal,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  PaintBucket,
  Grid3X3,
  ChevronRight,
  GripVertical,
  Layers,
} from 'lucide-react';
import { healTableRows } from '../../../services/docHealingService.ts';
import { FloatingFormatToolbar } from './FloatingFormatToolbar.tsx';

export type TableColAlign = 'left' | 'center' | 'right';
export type TableVAlign = 'top' | 'middle' | 'bottom';

export type TableNineGridAlign =
  | 'tl' // 顶端左对齐
  | 'tc' // 顶端居中
  | 'tr' // 顶端右对齐
  | 'ml' // 居中左对齐
  | 'mc' // 正中对齐
  | 'mr' // 居中右对齐
  | 'bl' // 底端左对齐
  | 'bc' // 底端居中
  | 'br'; // 底端右对齐

export interface CellCoord {
  rIdx: number;
  cIdx: number;
}

export interface CellRange {
  start: CellCoord;
  end: CellCoord;
}

// 莫兰迪暗黑低饱和度优雅底纹预设色卡
export const SHADING_COLORS = [
  { name: '无底色', value: '', label: '无', hex: 'transparent' },
  { name: '暗灰', value: 'rgba(148, 163, 184, 0.16)', label: '灰', hex: '#94a3b8' },
  { name: '冰蓝', value: 'rgba(56, 189, 248, 0.18)', label: '蓝', hex: '#38bdf8' },
  { name: '翠绿', value: 'rgba(52, 211, 153, 0.18)', label: '绿', hex: '#34d399' },
  { name: '暖珀', value: 'rgba(251, 191, 36, 0.18)', label: '黄', hex: '#fbbf24' },
  { name: '绛红', value: 'rgba(251, 113, 133, 0.18)', label: '红', hex: '#fb7185' },
  { name: '暮紫', value: 'rgba(167, 139, 250, 0.18)', label: '紫', hex: '#a78bfa' },
  { name: '雅靛', value: 'rgba(99, 102, 241, 0.18)', label: '靛', hex: '#6366f1' },
];

export const NINE_GRID_CONFIG: {
  id: TableNineGridAlign;
  title: string;
  hAlign: TableColAlign;
  vAlign: TableVAlign;
  dotPos: string;
}[] = [
  { id: 'tl', title: '顶端居左', hAlign: 'left', vAlign: 'top', dotPos: 'top-0.5 left-0.5' },
  { id: 'tc', title: '顶端居中', hAlign: 'center', vAlign: 'top', dotPos: 'top-0.5 left-1/2 -translate-x-1/2' },
  { id: 'tr', title: '顶端居右', hAlign: 'right', vAlign: 'top', dotPos: 'top-0.5 right-0.5' },
  { id: 'ml', title: '居中居左', hAlign: 'left', vAlign: 'middle', dotPos: 'top-1/2 -translate-y-1/2 left-0.5' },
  { id: 'mc', title: '垂直正中', hAlign: 'center', vAlign: 'middle', dotPos: 'top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2' },
  { id: 'mr', title: '居中居右', hAlign: 'right', vAlign: 'middle', dotPos: 'top-1/2 -translate-y-1/2 right-0.5' },
  { id: 'bl', title: '底端居左', hAlign: 'left', vAlign: 'bottom', dotPos: 'bottom-0.5 left-0.5' },
  { id: 'bc', title: '底端居中', hAlign: 'center', vAlign: 'bottom', dotPos: 'bottom-0.5 left-1/2 -translate-x-1/2' },
  { id: 'br', title: '底端居右', hAlign: 'right', vAlign: 'bottom', dotPos: 'bottom-0.5 right-0.5' },
];

/**
 * 1. Word 标志性 3×3 九宫格对齐微选择器组件
 */
export const TableNineGridAlignment: React.FC<{
  currentH: TableColAlign;
  currentV: TableVAlign;
  onSelect: (h: TableColAlign, v: TableVAlign, id: TableNineGridAlign) => void;
  className?: string;
}> = ({ currentH, currentV, onSelect, className = '' }) => {
  return (
    <div className={`p-1.5 bg-[#161b22] border border-white/10 rounded-xl shadow-2xl ${className}`}>
      <div className="text-[10px] text-slate-400 font-medium px-1 mb-1 flex items-center justify-between">
        <span>对齐方式 (Word 9宫格)</span>
        <span className="text-[9px] text-sky-400/80 font-mono">水平×垂直</span>
      </div>
      <div className="grid grid-cols-3 gap-1 w-[96px] h-[96px]">
        {NINE_GRID_CONFIG.map((item) => {
          const isActive = item.hAlign === currentH && item.vAlign === currentV;
          return (
            <button
              key={item.id}
              type="button"
              title={item.title}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(item.hAlign, item.vAlign, item.id);
              }}
              className={`relative rounded-md border transition-all cursor-pointer flex items-center justify-center ${
                isActive
                  ? 'bg-sky-500/25 border-sky-400 text-sky-300 ring-1 ring-sky-400/50'
                  : 'bg-white/[0.04] border-white/10 hover:bg-white/[0.1] hover:border-white/20 text-slate-400'
              }`}
            >
              {/* 微对齐视效指示块 */}
              <div className="w-5 h-5 relative border border-dashed border-white/20 rounded-[3px]">
                <span
                  className={`absolute w-1.5 h-1.5 rounded-full ${
                    isActive ? 'bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.8)]' : 'bg-slate-400'
                  } ${item.dotPos}`}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

/**
 * 2. 单元格底纹/填充色微面板
 */
export const TableShadingPicker: React.FC<{
  currentColor?: string;
  onSelect: (color: string) => void;
  className?: string;
}> = ({ currentColor, onSelect, className = '' }) => {
  return (
    <div className={`p-1.5 bg-[#161b22] border border-white/10 rounded-xl shadow-2xl w-[140px] ${className}`}>
      <div className="text-[10px] text-slate-400 font-medium px-1 mb-1 flex items-center justify-between">
        <span>底纹颜色</span>
        <PaintBucket size={10} className="text-slate-400" />
      </div>
      <div className="grid grid-cols-4 gap-1.5 p-0.5">
        {SHADING_COLORS.map((c) => {
          const isSelected = (!currentColor && !c.value) || currentColor === c.value;
          return (
            <button
              key={c.name}
              type="button"
              title={c.name}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(c.value);
              }}
              className={`w-6 h-6 rounded-md border flex items-center justify-center transition-all cursor-pointer ${
                isSelected
                  ? 'ring-2 ring-sky-400 border-white/40 scale-105'
                  : 'border-white/10 hover:border-white/30 hover:scale-110'
              }`}
              style={{ backgroundColor: c.value || 'transparent' }}
            >
              {!c.value ? (
                <div className="w-full h-full border border-dashed border-white/30 rounded-md flex items-center justify-center text-[9px] text-slate-400">
                  ×
                </div>
              ) : isSelected ? (
                <Check size={11} className="text-white drop-shadow" />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
};

interface TableContextMenuProps {
  x: number;
  y: number;
  rIdx: number;
  cIdx: number;
  rowCount: number;
  colCount: number;
  currentHAlign: TableColAlign;
  currentVAlign: TableVAlign;
  currentShading?: string;
  isRangeActive: boolean;
  selectedCellCount: number;
  onNineGridAlignChange: (h: TableColAlign, v: TableVAlign, id: TableNineGridAlign) => void;
  onShadingChange: (color: string) => void;
  onInsertRowAbove: () => void;
  onInsertRowBelow: () => void;
  onInsertColLeft: () => void;
  onInsertColRight: () => void;
  onClearRow: () => void;
  onClearCol: () => void;
  onDeleteRow: () => void;
  onDeleteCol: () => void;
  onClearRange: () => void;
  onBatchFormat: (format: 'bold' | 'italic' | 'underline' | 'strike' | 'clear') => void;
  onDistributeCols: () => void;
  onDistributeRows: () => void;
  onCopyMarkdown: () => void;
  onCopySelectedRange: () => void;
  onDeleteTable: () => void;
  onClose: () => void;
}

/**
 * 3. Word 式分层上下文菜单 (Top Mini Toolbar + Grouped Submenus)
 */
const TableContextMenu: React.FC<TableContextMenuProps> = ({
  x,
  y,
  rIdx,
  cIdx,
  rowCount,
  colCount,
  currentHAlign,
  currentVAlign,
  currentShading,
  isRangeActive,
  selectedCellCount,
  onNineGridAlignChange,
  onShadingChange,
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
  onDistributeCols,
  onDistributeRows,
  onCopyMarkdown,
  onCopySelectedRange,
  onDeleteTable,
  onClose,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [activeSubmenu, setActiveSubmenu] = useState<'insert' | 'delete' | 'align' | 'shading' | null>(null);

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

  const menuWidth = 224;
  const menuHeight = isRangeActive ? 430 : 380;
  const clampedX = Math.min(x, window.innerWidth - menuWidth - 20);
  const clampedY = Math.min(y, window.innerHeight - menuHeight - 20);

  return (
    <div
      ref={menuRef}
      style={{ left: `${Math.max(8, clampedX)}px`, top: `${Math.max(8, clampedY)}px` }}
      className="fixed z-[999995] w-[224px] rounded-2xl bg-[#161b22]/95 backdrop-blur-2xl border border-white/10 shadow-2xl p-1.5 text-[12px] text-slate-300 select-none animate-in fade-in zoom-in-95 duration-100"
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* 顶部 Word 风格浮动微格式工具栏 (Mini Toolbar) */}
      <div className="flex items-center justify-between gap-1 p-1 mb-1 rounded-xl bg-white/[0.04] border border-white/[0.08]">
        <button
          type="button"
          onClick={() => onBatchFormat('bold')}
          className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
          title="加粗 (Ctrl+B)"
        >
          <Bold size={12} />
        </button>
        <button
          type="button"
          onClick={() => onBatchFormat('italic')}
          className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
          title="斜体 (Ctrl+I)"
        >
          <Italic size={12} />
        </button>
        <button
          type="button"
          onClick={() => onBatchFormat('underline')}
          className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
          title="下划线 (Ctrl+U)"
        >
          <Underline size={12} />
        </button>
        <button
          type="button"
          onClick={() => onBatchFormat('strike')}
          className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
          title="删除线"
        >
          <Strikethrough size={12} />
        </button>
        <div className="w-[1px] h-3 bg-white/10" />
        {/* 9 宫格对齐微按钮 */}
        <button
          type="button"
          onClick={() => setActiveSubmenu(activeSubmenu === 'align' ? null : 'align')}
          className={`p-1 rounded-lg transition-colors cursor-pointer ${
            activeSubmenu === 'align' ? 'bg-sky-500/25 text-sky-300' : 'hover:bg-white/10 text-slate-300'
          }`}
          title="Word 9宫格对齐方式"
        >
          <Grid3X3 size={12} />
        </button>
        {/* 底色微按钮 */}
        <button
          type="button"
          onClick={() => setActiveSubmenu(activeSubmenu === 'shading' ? null : 'shading')}
          className={`p-1 rounded-lg transition-colors cursor-pointer ${
            activeSubmenu === 'shading' ? 'bg-amber-500/25 text-amber-300' : 'hover:bg-white/10 text-slate-300'
          }`}
          title="设置底纹颜色"
        >
          <PaintBucket size={12} />
        </button>
        {/* 清除格式 */}
        <button
          type="button"
          onClick={() => onBatchFormat('clear')}
          className="p-1 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
          title="清除格式"
        >
          <Eraser size={12} />
        </button>
      </div>

      {/* 9 宫格弹窗层 */}
      {activeSubmenu === 'align' && (
        <div className="mb-1.5 p-1 rounded-xl bg-black/40 border border-white/10">
          <TableNineGridAlignment
            currentH={currentHAlign}
            currentV={currentVAlign}
            onSelect={(h, v, id) => {
              onNineGridAlignChange(h, v, id);
              setActiveSubmenu(null);
            }}
          />
        </div>
      )}

      {/* 底纹选择器弹窗层 */}
      {activeSubmenu === 'shading' && (
        <div className="mb-1.5 p-1 rounded-xl bg-black/40 border border-white/10">
          <TableShadingPicker
            currentColor={currentShading}
            onSelect={(color) => {
              onShadingChange(color);
              setActiveSubmenu(null);
            }}
          />
        </div>
      )}

      {/* 多选范围指示器 */}
      {isRangeActive && (
        <div className="mb-1 px-2.5 py-1 rounded-xl bg-sky-500/15 border border-sky-500/25 text-sky-300 text-[11px] font-medium flex items-center justify-between">
          <span>已选中 {selectedCellCount} 个单元格</span>
          <span className="text-[10px] text-sky-400/80 font-mono">矩阵</span>
        </div>
      )}

      {/* 1. 剪贴板与数据操作组 */}
      <div className="px-1.5 py-0.5 text-[10px] font-medium text-slate-500 uppercase tracking-wider flex items-center justify-between">
        <span>剪贴板与数据</span>
      </div>
      <button
        type="button"
        onClick={() => {
          onCopySelectedRange();
          onClose();
        }}
        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-white/5 text-slate-300 hover:text-white transition-colors text-left cursor-pointer"
      >
        <span className="flex items-center gap-2">
          <Copy size={13} className="text-sky-400" />
          <span>{isRangeActive ? '复制选中单元格 (TSV)' : '复制当前单元格'}</span>
        </span>
        <span className="text-[10px] text-slate-500 font-mono">Ctrl+C</span>
      </button>

      <button
        type="button"
        onClick={() => {
          onClearRange();
          onClose();
        }}
        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-amber-500/15 text-slate-300 hover:text-amber-300 transition-colors text-left cursor-pointer"
      >
        <span className="flex items-center gap-2">
          <Eraser size={13} className="text-amber-400" />
          <span>{isRangeActive ? `清空所选 ${selectedCellCount} 格内容` : '清空当前格内容'}</span>
        </span>
        <span className="text-[10px] text-slate-500 font-mono">Del</span>
      </button>

      <div className="my-1 border-t border-white/[0.08]" />

      {/* 2. 插入行列 (二级菜单) */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setActiveSubmenu(activeSubmenu === 'insert' ? null : 'insert')}
          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors text-left cursor-pointer ${
            activeSubmenu === 'insert' ? 'bg-white/10 text-emerald-300' : 'hover:bg-white/5 text-slate-300'
          }`}
        >
          <span className="flex items-center gap-2">
            <Plus size={13} className="text-emerald-400" />
            <span>插入行列</span>
          </span>
          <ChevronRight size={12} className="text-slate-500" />
        </button>

        {activeSubmenu === 'insert' && (
          <div className="mt-1 mb-1 pl-2.5 border-l-2 border-emerald-500/40 space-y-0.5">
            <button
              type="button"
              onClick={() => {
                onInsertRowAbove();
                onClose();
              }}
              className="w-full flex items-center gap-2 px-2 py-1 rounded-md hover:bg-white/5 text-slate-300 hover:text-emerald-300 text-left cursor-pointer text-[11px]"
            >
              <ArrowUp size={11} className="text-emerald-400" />
              <span>在上方插入行</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onInsertRowBelow();
                onClose();
              }}
              className="w-full flex items-center gap-2 px-2 py-1 rounded-md hover:bg-white/5 text-slate-300 hover:text-emerald-300 text-left cursor-pointer text-[11px]"
            >
              <ArrowDown size={11} className="text-emerald-400" />
              <span>在下方插入行</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onInsertColLeft();
                onClose();
              }}
              className="w-full flex items-center gap-2 px-2 py-1 rounded-md hover:bg-white/5 text-slate-300 hover:text-sky-300 text-left cursor-pointer text-[11px]"
            >
              <ArrowLeft size={11} className="text-sky-400" />
              <span>在左侧插入列</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onInsertColRight();
                onClose();
              }}
              className="w-full flex items-center gap-2 px-2 py-1 rounded-md hover:bg-white/5 text-slate-300 hover:text-sky-300 text-left cursor-pointer text-[11px]"
            >
              <ArrowRight size={11} className="text-sky-400" />
              <span>在右侧插入列</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. 删除操作 (二级菜单) */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setActiveSubmenu(activeSubmenu === 'delete' ? null : 'delete')}
          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors text-left cursor-pointer ${
            activeSubmenu === 'delete' ? 'bg-white/10 text-rose-300' : 'hover:bg-white/5 text-slate-300'
          }`}
        >
          <span className="flex items-center gap-2">
            <Trash2 size={13} className="text-rose-400" />
            <span>删除操作</span>
          </span>
          <ChevronRight size={12} className="text-slate-500" />
        </button>

        {activeSubmenu === 'delete' && (
          <div className="mt-1 mb-1 pl-2.5 border-l-2 border-rose-500/40 space-y-0.5">
            <button
              type="button"
              disabled={rowCount <= 1}
              onClick={() => {
                onDeleteRow();
                onClose();
              }}
              className={`w-full flex items-center gap-2 px-2 py-1 rounded-md text-left text-[11px] ${
                rowCount <= 1
                  ? 'opacity-30 cursor-not-allowed text-slate-500'
                  : 'hover:bg-rose-500/15 text-slate-300 hover:text-rose-300 cursor-pointer'
              }`}
            >
              <Trash2 size={11} />
              <span>删除当前行 (第 {rIdx + 1} 行)</span>
            </button>
            <button
              type="button"
              disabled={colCount <= 1}
              onClick={() => {
                onDeleteCol();
                onClose();
              }}
              className={`w-full flex items-center gap-2 px-2 py-1 rounded-md text-left text-[11px] ${
                colCount <= 1
                  ? 'opacity-30 cursor-not-allowed text-slate-500'
                  : 'hover:bg-rose-500/15 text-slate-300 hover:text-rose-300 cursor-pointer'
              }`}
            >
              <Trash2 size={11} />
              <span>删除当前列 (第 {cIdx + 1} 列)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onClearRow();
                onClose();
              }}
              className="w-full flex items-center gap-2 px-2 py-1 rounded-md hover:bg-amber-500/15 text-slate-300 hover:text-amber-300 text-left cursor-pointer text-[11px]"
            >
              <Eraser size={11} className="text-amber-400" />
              <span>清空当前行内容</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onClearCol();
                onClose();
              }}
              className="w-full flex items-center gap-2 px-2 py-1 rounded-md hover:bg-amber-500/15 text-slate-300 hover:text-amber-300 text-left cursor-pointer text-[11px]"
            >
              <Eraser size={11} className="text-amber-400" />
              <span>清空当前列内容</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onDeleteTable();
                onClose();
              }}
              className="w-full flex items-center gap-2 px-2 py-1 rounded-md hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 text-left cursor-pointer text-[11px]"
            >
              <Trash2 size={11} />
              <span>删除整张表格</span>
            </button>
          </div>
        )}
      </div>

      <div className="my-1 border-t border-white/[0.08]" />

      {/* 4. 几何与分布 (Word 风格) */}
      <div className="px-1.5 py-0.5 text-[10px] font-medium text-slate-500 uppercase tracking-wider">
        尺寸与分布
      </div>
      <button
        type="button"
        onClick={() => {
          onDistributeCols();
          onClose();
        }}
        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/5 text-slate-300 hover:text-sky-300 transition-colors text-left cursor-pointer"
      >
        <Layers size={13} className="text-sky-400" />
        <span>平均分布各列 (等宽)</span>
      </button>

      <button
        type="button"
        onClick={() => {
          onDistributeRows();
          onClose();
        }}
        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/5 text-slate-300 hover:text-emerald-300 transition-colors text-left cursor-pointer"
      >
        <Layers size={13} className="text-emerald-400" />
        <span>平均分布各行 (自适应)</span>
      </button>

      <button
        type="button"
        onClick={() => {
          onCopyMarkdown();
          onClose();
        }}
        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/5 text-slate-300 hover:text-slate-100 transition-colors text-left cursor-pointer"
      >
        <Copy size={13} className="text-slate-400" />
        <span>复制整表为 Markdown</span>
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

  // 顶层微工具栏弹出状态
  const [showTopNineGrid, setShowTopNineGrid] = useState(false);
  const [showTopShading, setShowTopShading] = useState(false);

  // Notion 风格列把手与行把手弹窗状态
  const [activeColMenu, setActiveColMenu] = useState<{ cIdx: number; x: number; y: number } | null>(null);
  const [activeRowMenu, setActiveRowMenu] = useState<{ rIdx: number; x: number; y: number } | null>(null);

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
  const hasBandedRows = Boolean(block.properties?.hasBandedRows);
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

  // 2. 每列水平文本对齐状态治理 (默认 'left')
  const savedAlignments = (block.properties?.columnAlignments as TableColAlign[]) || [];
  const initialAlignments = Array.from(
    { length: colCount },
    (_, idx) => savedAlignments[idx] || 'left'
  );
  const [localAlignments, setLocalAlignments] = useState<TableColAlign[]>(initialAlignments);

  // 3. 每列垂直文本对齐状态治理 (默认 'top')
  const savedVAlignments = (block.properties?.columnVerticalAlignments as TableVAlign[]) || [];
  const initialVAlignments = Array.from(
    { length: colCount },
    (_, idx) => savedVAlignments[idx] || 'top'
  );
  const [localVAlignments, setLocalVAlignments] = useState<TableVAlign[]>(initialVAlignments);

  // 4. 单元格底纹状态字典 `${rIdx}-${cIdx}` -> color
  const cellShading = (block.properties?.cellShading as Record<string, string>) || {};

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

  useEffect(() => {
    const nextVAligns = (block.properties?.columnVerticalAlignments as TableVAlign[]) || [];
    setLocalVAlignments(
      Array.from({ length: colCount }, (_, idx) => nextVAligns[idx] || 'top')
    );
  }, [block.properties?.columnVerticalAlignments, colCount]);

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
    nextVAlignments?: TableVAlign[],
    nextShading?: Record<string, string>,
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
        columnVerticalAlignments: nextVAlignments || localVAlignments,
        cellShading: nextShading !== undefined ? nextShading : cellShading,
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
    updateRows(next, undefined, undefined, undefined, undefined, false);
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

    // 同步位移 cellShading 字典中插入行之后的行索引
    const updatedShading: Record<string, string> = {};
    Object.entries(cellShading).forEach(([key, color]) => {
      const [rStr, cStr] = key.split('-');
      const r = parseInt(rStr, 10);
      const c = parseInt(cStr, 10);
      if (r >= insertAt) {
        updatedShading[`${r + 1}-${c}`] = color;
      } else {
        updatedShading[key] = color;
      }
    });

    updateRows(nextRows, undefined, undefined, undefined, updatedShading, true);
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
    const nextVAlignments: TableVAlign[] = [
      ...localVAlignments.slice(0, insertAt),
      'top',
      ...localVAlignments.slice(insertAt),
    ];

    // 同步位移 cellShading 字典中插入列之后的列索引
    const updatedShading: Record<string, string> = {};
    Object.entries(cellShading).forEach(([key, color]) => {
      const [rStr, cStr] = key.split('-');
      const r = parseInt(rStr, 10);
      const c = parseInt(cStr, 10);
      if (c >= insertAt) {
        updatedShading[`${r}-${c + 1}`] = color;
      } else {
        updatedShading[key] = color;
      }
    });

    setLocalWidths(nextWidths);
    setLocalAlignments(nextAlignments);
    setLocalVAlignments(nextVAlignments);
    updateRows(nextRows, nextWidths, nextAlignments, nextVAlignments, updatedShading, true);
  };

  // 增加末尾列
  const handleAddCol = () => {
    handleInsertCol(colCount - 1, 'right');
  };

  // 删除指定行
  const handleDeleteRow = (rIdx: number) => {
    if (rowCount <= 1) return;
    const next = rows.filter((_, idx) => idx !== rIdx);

    const updatedShading: Record<string, string> = {};
    Object.entries(cellShading).forEach(([key, color]) => {
      const [rStr, cStr] = key.split('-');
      const r = parseInt(rStr, 10);
      const c = parseInt(cStr, 10);
      if (r === rIdx) return; // 移除被删除行
      if (r > rIdx) {
        updatedShading[`${r - 1}-${c}`] = color;
      } else {
        updatedShading[key] = color;
      }
    });

    updateRows(next, undefined, undefined, undefined, updatedShading, true);
  };

  // 清空指定行
  const handleClearRow = (rIdx: number) => {
    const next = rows.map((row, r) =>
      r === rIdx ? Array(colCount).fill('') : [...row]
    );
    updateRows(next, undefined, undefined, undefined, undefined, true);
  };

  // 删除指定列
  const handleDeleteCol = (cIdx: number) => {
    if (colCount <= 1) return;
    const next = rows.map((r) => r.filter((_, idx) => idx !== cIdx));
    const nextWidths = localWidths.filter((_, idx) => idx !== cIdx);
    const nextAlignments = localAlignments.filter((_, idx) => idx !== cIdx);
    const nextVAlignments = localVAlignments.filter((_, idx) => idx !== cIdx);

    const updatedShading: Record<string, string> = {};
    Object.entries(cellShading).forEach(([key, color]) => {
      const [rStr, cStr] = key.split('-');
      const r = parseInt(rStr, 10);
      const c = parseInt(cStr, 10);
      if (c === cIdx) return; // 移除被删除列
      if (c > cIdx) {
        updatedShading[`${r}-${c - 1}`] = color;
      } else {
        updatedShading[key] = color;
      }
    });

    setLocalWidths(nextWidths);
    setLocalAlignments(nextAlignments);
    setLocalVAlignments(nextVAlignments);
    updateRows(next, nextWidths, nextAlignments, nextVAlignments, updatedShading, true);
  };

  // 清空指定列
  const handleClearCol = (cIdx: number) => {
    const next = rows.map((row, r) =>
      row.map((cell, c) => (c === cIdx ? (r === 0 && hasHeaderRow ? cell : '') : cell))
    );
    updateRows(next, undefined, undefined, undefined, undefined, true);
  };

  // 设定 Word 9 宫格对齐方式 (支持当前格、整列或选区批量)
  const handleSetNineGridAlign = (
    hAlign: TableColAlign,
    vAlign: TableVAlign,
    targetCell?: CellCoord
  ) => {
    if (isRangeActive && normalizedRange) {
      const { minC, maxC } = normalizedRange;
      const nextH = [...localAlignments];
      const nextV = [...localVAlignments];
      for (let c = minC; c <= maxC; c++) {
        nextH[c] = hAlign;
        nextV[c] = vAlign;
      }
      setLocalAlignments(nextH);
      setLocalVAlignments(nextV);
      updateRows(rows, localWidths, nextH, nextV, undefined, true);
    } else {
      const cell = targetCell || activeCell;
      if (cell) {
        const nextH = [...localAlignments];
        const nextV = [...localVAlignments];
        nextH[cell.cIdx] = hAlign;
        nextV[cell.cIdx] = vAlign;
        setLocalAlignments(nextH);
        setLocalVAlignments(nextV);
        updateRows(rows, localWidths, nextH, nextV, undefined, true);
      }
    }
  };

  // 设定底纹背景色 (支持当前格或选区批量)
  const handleSetShading = (color: string, targetCell?: CellCoord) => {
    const nextShading = { ...cellShading };
    if (isRangeActive && normalizedRange) {
      const { minR, maxR, minC, maxC } = normalizedRange;
      for (let r = minR; r <= maxR; r++) {
        for (let c = minC; c <= maxC; c++) {
          const key = `${r}-${c}`;
          if (!color) {
            delete nextShading[key];
          } else {
            nextShading[key] = color;
          }
        }
      }
    } else {
      const cell = targetCell || activeCell;
      if (cell) {
        const key = `${cell.rIdx}-${cell.cIdx}`;
        if (!color) {
          delete nextShading[key];
        } else {
          nextShading[key] = color;
        }
      }
    }
    updateRows(rows, undefined, undefined, undefined, nextShading, true);
  };

  // 跨选批量清空选区内所有单元格
  const handleClearRange = () => {
    if (!normalizedRange) {
      if (activeCell) {
        const next = rows.map((row, r) =>
          r === activeCell.rIdx ? row.map((cell, c) => (c === activeCell.cIdx ? '' : cell)) : [...row]
        );
        updateRows(next, undefined, undefined, undefined, undefined, true);
      }
      return;
    }
    const { minR, maxR, minC, maxC } = normalizedRange;
    const next = rows.map((row, r) =>
      row.map((cell, c) => (r >= minR && r <= maxR && c >= minC && c <= maxC ? '' : cell))
    );
    updateRows(next, undefined, undefined, undefined, undefined, true);
  };

  // 跨选批量复制 (TSV 格式，兼容 Excel 与纯文本)
  const handleCopySelectedRange = () => {
    const range = normalizedRange || (activeCell ? { minR: activeCell.rIdx, maxR: activeCell.rIdx, minC: activeCell.cIdx, maxC: activeCell.cIdx } : null);
    if (!range) return;
    const { minR, maxR, minC, maxC } = range;
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

  // 平均分布各列 (等宽)
  const handleDistributeCols = () => {
    const totalW = localWidths.reduce((sum, w) => sum + w, 0);
    const avgW = Math.max(70, Math.floor(totalW / colCount));
    const nextWidths = Array(colCount).fill(avgW);
    setLocalWidths(nextWidths);
    updateRows(rows, nextWidths, undefined, undefined, undefined, true);
  };

  // 跨选批量格式化应用
  const handleBatchFormat = (format: 'bold' | 'italic' | 'underline' | 'strike' | 'clear') => {
    const range = normalizedRange || (activeCell ? { minR: activeCell.rIdx, maxR: activeCell.rIdx, minC: activeCell.cIdx, maxC: activeCell.cIdx } : null);
    if (!range) return;
    const { minR, maxR, minC, maxC } = range;
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
          } else if (format === 'strike') {
            return cell.includes('<del>') || cell.includes('<s>')
              ? cell.replace(/<\/?(del|s)>/gi, '')
              : `<del>${cell}</del>`;
          } else if (format === 'clear') {
            return cell.replace(/<[^>]+>/g, '');
          }
        }
        return cell;
      })
    );
    updateRows(next, undefined, undefined, undefined, undefined, true);
  };

  // 文本划选检测与浮动工具条联动
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

  // 应用富文本格式至单元格选中文本
  const handleApplyTextFormat = (
    format: 'bold' | 'italic' | 'strike' | 'underline' | 'code' | 'clear'
  ) => {
    if (isRangeActive) {
      if (format === 'bold' || format === 'italic' || format === 'underline' || format === 'strike' || format === 'clear') {
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

  // 矩阵式粘贴处理
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
      let nextVAlignments = [...localVAlignments];
      while (nextVAlignments.length < requiredCols) {
        nextVAlignments.push('top');
      }

      setLocalWidths(nextWidths);
      setLocalAlignments(nextAlignments);
      setLocalVAlignments(nextVAlignments);
      updateRows(expandedRows, nextWidths, nextAlignments, nextVAlignments, undefined, true);

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
              columnVerticalAlignments: localVAlignments,
              cellShading,
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

  // 当前选中单元格的水平和垂直对齐
  const curCellCIdx = activeCell?.cIdx ?? (contextMenu?.cIdx ?? 0);
  const curHAlign = localAlignments[curCellCIdx] || 'left';
  const curVAlign = localVAlignments[curCellCIdx] || 'top';
  const curShading = activeCell ? cellShading[`${activeCell.rIdx}-${activeCell.cIdx}`] : undefined;

  return (
    <div
      id={`block-${block.id}`}
      className="group/table relative my-3.5 rounded-2xl bg-[#0d1117] border border-white/[0.08] shadow-2xl overflow-hidden transition-all hover:border-white/[0.14]"
    >
      {/* 顶部 Word 风格分类操作控制条 (Header Ribbon Bar) */}
      <div className="h-10 px-3 bg-[#161b22]/90 border-b border-white/[0.06] flex items-center justify-between select-none">
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

        {/* 右侧 Word 式分类功能组 */}
        <div className="flex items-center gap-1.5 text-[11px]">
          {/* 1. 9 宫格对齐微控件入口 */}
          <div className="relative">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setShowTopNineGrid(!showTopNineGrid);
                setShowTopShading(false);
              }}
              className={`flex items-center gap-1 px-2 py-1 rounded-md border text-[11px] transition-colors cursor-pointer ${
                showTopNineGrid
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                  : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border-white/[0.08]'
              }`}
              title="Word 9宫格对齐方式 (水平×垂直)"
            >
              <Grid3X3 size={12} className="text-sky-400" />
              <span>对齐</span>
            </button>
            {showTopNineGrid && (
              <div className="absolute right-0 top-full mt-1.5 z-50">
                <TableNineGridAlignment
                  currentH={curHAlign}
                  currentV={curVAlign}
                  onSelect={(h, v) => {
                    handleSetNineGridAlign(h, v);
                    setShowTopNineGrid(false);
                  }}
                />
              </div>
            )}
          </div>

          {/* 2. 底纹颜色卡微控件入口 */}
          <div className="relative">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setShowTopShading(!showTopShading);
                setShowTopNineGrid(false);
              }}
              className={`flex items-center gap-1 px-2 py-1 rounded-md border text-[11px] transition-colors cursor-pointer ${
                showTopShading
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border-white/[0.08]'
              }`}
              title="单元格底色 / 底纹"
            >
              <PaintBucket size={12} className="text-amber-400" />
              <span>底纹</span>
            </button>
            {showTopShading && (
              <div className="absolute right-0 top-full mt-1.5 z-50">
                <TableShadingPicker
                  currentColor={curShading}
                  onSelect={(color) => {
                    handleSetShading(color);
                    setShowTopShading(false);
                  }}
                />
              </div>
            )}
          </div>

          <div className="w-[1px] h-3.5 bg-white/10 mx-0.5" />

          {/* 3. 隔行斑马纹切换 */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() =>
              onUpdate(
                block.content,
                'table',
                { ...block.properties, hasBandedRows: !hasBandedRows },
                true
              )
            }
            className={`flex items-center gap-1 px-2 py-1 rounded-md border text-[11px] transition-colors cursor-pointer ${
              hasBandedRows
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-slate-200 border-white/[0.08]'
            }`}
            title={hasBandedRows ? '关闭隔行斑马纹' : '开启隔行斑马纹 (Word 经典样式)'}
          >
            {hasBandedRows ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
            <span>斑马纹</span>
          </button>

          {/* 4. 首行表头切换 */}
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
            {hasHeaderRow ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
            <span>表头</span>
          </button>

          {/* 5. 复制 Markdown 表格 */}
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

          {/* 6. 删除整表 */}
          <button
            type="button"
            onClick={onDelete}
            className="p-1 rounded-md hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 border border-transparent hover:border-rose-500/30 transition-colors cursor-pointer ml-0.5"
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
                const isBanded = hasBandedRows && !isHeader && rIdx % 2 === 1;

                return (
                  <tr
                    key={rIdx}
                    className={`group/row transition-colors relative ${
                      isHeader
                        ? 'bg-[#161b22] font-semibold text-slate-100'
                        : isBanded
                        ? 'bg-white/[0.025] hover:bg-white/[0.04]'
                        : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    {row.map((cell, cIdx) => {
                      const colAlign = localAlignments[cIdx] || 'left';
                      const colVAlign = localVAlignments[cIdx] || 'top';
                      const customShading = cellShading[`${rIdx}-${cIdx}`];

                      const alignClass =
                        colAlign === 'center'
                          ? 'text-center'
                          : colAlign === 'right'
                          ? 'text-right'
                          : 'text-left';

                      const vAlignClass =
                        colVAlign === 'middle'
                          ? 'align-middle'
                          : colVAlign === 'bottom'
                          ? 'align-bottom'
                          : 'align-top';

                      const isSelected = isInRange(rIdx, cIdx);

                      return (
                        <td
                          key={cIdx}
                          style={{
                            width: `${localWidths[cIdx] || defaultColWidth}px`,
                            backgroundColor: isSelected
                              ? undefined
                              : customShading || undefined,
                          }}
                          className={`px-3 py-2 border border-white/[0.08] relative group/cell transition-colors ${vAlignClass} ${
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
                          {/* Notion 风格整列选择与操作微把手 (表头悬停微胶囊) */}
                          {rIdx === 0 && (
                            <button
                              type="button"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                const rect = e.currentTarget.getBoundingClientRect();
                                setSelectedRange({
                                  start: { rIdx: 0, cIdx },
                                  end: { rIdx: rowCount - 1, cIdx },
                                });
                                setActiveCell({ rIdx: 0, cIdx });
                                setActiveColMenu({ cIdx, x: rect.left, y: rect.bottom + 4 });
                              }}
                              className="absolute top-1 left-1.5 p-0.5 rounded opacity-0 group-hover/cell:opacity-60 hover:!opacity-100 text-slate-400 hover:text-sky-300 hover:bg-sky-500/20 transition-all select-none cursor-pointer z-10"
                              title="点击选中整列并打开列设置"
                            >
                              <MoreHorizontal size={11} />
                            </button>
                          )}

                          {/* Notion 风格整行选择与操作微把手 (首列左边缘悬停) */}
                          {cIdx === 0 && (
                            <button
                              type="button"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                const rect = e.currentTarget.getBoundingClientRect();
                                setSelectedRange({
                                  start: { rIdx, cIdx: 0 },
                                  end: { rIdx, cIdx: colCount - 1 },
                                });
                                setActiveCell({ rIdx, cIdx: 0 });
                                setActiveRowMenu({ rIdx, x: rect.left, y: rect.bottom + 4 });
                              }}
                              className="absolute top-1/2 -translate-y-1/2 left-0.5 p-0.5 rounded opacity-0 group-hover/row:opacity-60 hover:!opacity-100 text-slate-400 hover:text-emerald-300 hover:bg-emerald-500/20 transition-all select-none cursor-pointer z-10"
                              title="点击选中整行并打开行设置"
                            >
                              <GripVertical size={11} />
                            </button>
                          )}

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
                              // 1. Esc: 取消多选与弹窗
                              if (e.key === 'Escape') {
                                e.preventDefault();
                                setSelectedRange(null);
                                setFloatingToolbarPos(null);
                                setShowTopNineGrid(false);
                                setShowTopShading(false);
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
            <button
              type="button"
              onClick={handleDistributeCols}
              className="flex items-center gap-1 hover:text-sky-400 transition-colors cursor-pointer py-0.5"
              title="按表格总宽度将所有列设为等宽"
            >
              <Layers size={11} />
              <span>平均分布各列</span>
            </button>
            <span className="text-slate-600">·</span>
            <span className="text-slate-500 text-[10px]">
              Word 9宫格对齐 · 莫兰迪底纹 · 右键 Mini Toolbar · Shift+点击/拖拽跨行跨列多选
            </span>
          </div>
        </div>
      </div>

      {/* Notion 风格整列快捷弹窗 */}
      {activeColMenu && (
        <div
          style={{ left: `${activeColMenu.x}px`, top: `${activeColMenu.y}px` }}
          className="fixed z-[999996] w-48 rounded-xl bg-[#161b22]/95 backdrop-blur-xl border border-white/10 shadow-2xl p-1.5 text-[12px] text-slate-300 select-none animate-in fade-in zoom-in-95"
        >
          <div className="px-2 py-0.5 text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">
            第 {activeColMenu.cIdx + 1} 列快速设置
          </div>
          <button
            type="button"
            onClick={() => {
              handleInsertCol(activeColMenu.cIdx, 'left');
              setActiveColMenu(null);
            }}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/5 text-slate-300 hover:text-sky-300 text-left cursor-pointer"
          >
            <ArrowLeft size={12} className="text-sky-400" />
            <span>在左侧插入列</span>
          </button>
          <button
            type="button"
            onClick={() => {
              handleInsertCol(activeColMenu.cIdx, 'right');
              setActiveColMenu(null);
            }}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/5 text-slate-300 hover:text-sky-300 text-left cursor-pointer"
          >
            <ArrowRight size={12} className="text-sky-400" />
            <span>在右侧插入列</span>
          </button>
          <button
            type="button"
            onClick={() => {
              handleClearCol(activeColMenu.cIdx);
              setActiveColMenu(null);
            }}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/5 text-slate-300 hover:text-amber-300 text-left cursor-pointer"
          >
            <Eraser size={12} className="text-amber-400" />
            <span>清空整列内容</span>
          </button>
          <button
            type="button"
            disabled={colCount <= 1}
            onClick={() => {
              handleDeleteCol(activeColMenu.cIdx);
              setActiveColMenu(null);
            }}
            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left ${
              colCount <= 1
                ? 'opacity-30 cursor-not-allowed text-slate-500'
                : 'hover:bg-rose-500/20 text-rose-300 cursor-pointer'
            }`}
          >
            <Trash2 size={12} />
            <span>删除整列</span>
          </button>
        </div>
      )}

      {/* Notion 风格整行快捷弹窗 */}
      {activeRowMenu && (
        <div
          style={{ left: `${activeRowMenu.x}px`, top: `${activeRowMenu.y}px` }}
          className="fixed z-[999996] w-48 rounded-xl bg-[#161b22]/95 backdrop-blur-xl border border-white/10 shadow-2xl p-1.5 text-[12px] text-slate-300 select-none animate-in fade-in zoom-in-95"
        >
          <div className="px-2 py-0.5 text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">
            第 {activeRowMenu.rIdx + 1} 行快速设置
          </div>
          <button
            type="button"
            onClick={() => {
              handleInsertRow(activeRowMenu.rIdx, 'above');
              setActiveRowMenu(null);
            }}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/5 text-slate-300 hover:text-emerald-300 text-left cursor-pointer"
          >
            <ArrowUp size={12} className="text-emerald-400" />
            <span>在上方插入行</span>
          </button>
          <button
            type="button"
            onClick={() => {
              handleInsertRow(activeRowMenu.rIdx, 'below');
              setActiveRowMenu(null);
            }}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/5 text-slate-300 hover:text-emerald-300 text-left cursor-pointer"
          >
            <ArrowDown size={12} className="text-emerald-400" />
            <span>在下方插入行</span>
          </button>
          <button
            type="button"
            onClick={() => {
              handleClearRow(activeRowMenu.rIdx);
              setActiveRowMenu(null);
            }}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/5 text-slate-300 hover:text-amber-300 text-left cursor-pointer"
          >
            <Eraser size={12} className="text-amber-400" />
            <span>清空整行内容</span>
          </button>
          <button
            type="button"
            disabled={rowCount <= 1}
            onClick={() => {
              handleDeleteRow(activeRowMenu.rIdx);
              setActiveRowMenu(null);
            }}
            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left ${
              rowCount <= 1
                ? 'opacity-30 cursor-not-allowed text-slate-500'
                : 'hover:bg-rose-500/20 text-rose-300 cursor-pointer'
            }`}
          >
            <Trash2 size={12} />
            <span>删除整行</span>
          </button>
        </div>
      )}

      {/* 沉浸式暗黑毛玻璃右键上下文菜单 (Word 式 Mini Toolbar + 正交分组) */}
      {contextMenu && (
        <TableContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          rIdx={contextMenu.rIdx}
          cIdx={contextMenu.cIdx}
          rowCount={rowCount}
          colCount={colCount}
          currentHAlign={localAlignments[contextMenu.cIdx] || 'left'}
          currentVAlign={localVAlignments[contextMenu.cIdx] || 'top'}
          currentShading={cellShading[`${contextMenu.rIdx}-${contextMenu.cIdx}`]}
          isRangeActive={isRangeActive}
          selectedCellCount={selectedCellCount}
          onNineGridAlignChange={(h, v) => handleSetNineGridAlign(h, v, { rIdx: contextMenu.rIdx, cIdx: contextMenu.cIdx })}
          onShadingChange={(color) => handleSetShading(color, { rIdx: contextMenu.rIdx, cIdx: contextMenu.cIdx })}
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
          onDistributeCols={handleDistributeCols}
          onDistributeRows={() => {}}
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
