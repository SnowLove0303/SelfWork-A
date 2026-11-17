import React, { useRef, useState, useEffect } from 'react';
import { MindMapNode, NodeLayout } from '../../types/mindmap.ts';
import {
  calculateMindMapLayout,
  calculateBothLayout,
  MindMapLayoutResult,
  RAINBOW_COLORS,
} from './layout.ts';

interface MindMapCanvasProps {
  root: MindMapNode;
  selectedId: string | null;
  editingId: string | null;
  onSelectNode: (id: string) => void;
  onStartEdit: (id: string) => void;
  onUpdateTitle: (id: string, newTitle: string) => void;
  pan: { x: number; y: number };
  onPanChange: (newPan: { x: number; y: number }) => void;
  zoom?: number;
  layoutDirection?: 'right' | 'both';
  rainbowBranch?: boolean;
  branchColor?: string;
  onToggleCollapse?: (id: string) => void;
  onLayoutResultChange?: (result: MindMapLayoutResult) => void;
}

export const MindMapCanvas: React.FC<MindMapCanvasProps> = ({
  root,
  selectedId,
  editingId,
  onSelectNode,
  onStartEdit,
  onUpdateTitle,
  pan,
  onPanChange,
  zoom = 1,
  layoutDirection = 'right',
  rainbowBranch = false,
  branchColor,
  onToggleCollapse,
  onLayoutResultChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const [layoutResult, setLayoutResult] = useState<MindMapLayoutResult>(() =>
    layoutDirection === 'both'
      ? calculateBothLayout(root, rainbowBranch ? RAINBOW_COLORS : undefined)
      : calculateMindMapLayout(root, rainbowBranch ? RAINBOW_COLORS : undefined)
  );

  // 动态重算排版
  useEffect(() => {
    const result =
      layoutDirection === 'both'
        ? calculateBothLayout(root, rainbowBranch ? RAINBOW_COLORS : undefined)
        : calculateMindMapLayout(root, rainbowBranch ? RAINBOW_COLORS : undefined);
    setLayoutResult(result);
    onLayoutResultChange?.(result);
  }, [root, layoutDirection, rainbowBranch, onLayoutResultChange]);

  // 画布拖拽平移状态
  const isDraggingCanvasRef = useRef(false);
  const dragStartPosRef = useRef({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0 });

  const handleMouseDownOnCanvas = (e: React.MouseEvent<HTMLDivElement>) => {
    // 仅在点击画布空白处时触发平移
    if ((e.target as HTMLElement).closest('.mindmap-node-card')) {
      return;
    }
    isDraggingCanvasRef.current = true;
    dragStartPosRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { ...pan };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingCanvasRef.current) return;
      const dx = e.clientX - dragStartPosRef.current.x;
      const dy = e.clientY - dragStartPosRef.current.y;
      onPanChange({
        x: panStartRef.current.x + dx,
        y: panStartRef.current.y + dy,
      });
    };

    const handleMouseUp = () => {
      isDraggingCanvasRef.current = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [onPanChange]);

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDownOnCanvas}
      className="relative flex-1 w-full h-full overflow-hidden select-none bg-canvas-default/20 cursor-grab active:cursor-grabbing"
    >
      {/* 极简网格坐标点阵背景 */}
      <div
        className="absolute inset-0 pointer-events-none opacity-15"
        style={{
          backgroundImage:
            'radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          backgroundPosition: `${pan.x}px ${pan.y}px`,
        }}
      />

      {/* 视口变换主容器 */}
      <div
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
        className="absolute inset-0 pointer-events-none"
      >
        {/* SVG 连接线图层（彩虹分支） */}
        <svg
          className="absolute inset-0 overflow-visible pointer-events-none"
          style={{ width: '100%', height: '100%' }}
        >
          {layoutResult.connections.map((conn) => {
            const isRelatedToSelected =
              selectedId === conn.from.node.id || selectedId === conn.to.node.id;

            // 彩虹分支模式：使用 layout 计算出的 color；单色模式：使用 branchColor 或默认
            const strokeColor = rainbowBranch
              ? (conn.color ?? 'rgba(80,140,200,0.5)')
              : (branchColor ?? 'rgba(80,140,200,0.35)');

            return (
              <path
                key={conn.id}
                d={conn.path}
                fill="none"
                stroke={
                  isRelatedToSelected
                    ? 'rgba(56, 189, 248, 0.85)'
                    : strokeColor
                }
                strokeWidth={isRelatedToSelected ? 2.5 : 1.8}
                strokeLinecap="round"
                className="transition-colors duration-150"
              />
            );
          })}
        </svg>

        {/* HTML 节点卡片图层 */}
        {layoutResult.layouts.map((layout) => (
          <NodeCardItem
            key={layout.node.id}
            layout={layout}
            isSelected={selectedId === layout.node.id}
            isEditing={editingId === layout.node.id}
            onSelect={() => onSelectNode(layout.node.id)}
            onStartEdit={() => onStartEdit(layout.node.id)}
            onUpdateTitle={(val) => onUpdateTitle(layout.node.id, val)}
            onToggleCollapse={
              onToggleCollapse ? () => onToggleCollapse(layout.node.id) : undefined
            }
          />
        ))}
      </div>
    </div>
  );
};

interface NodeCardItemProps {
  layout: NodeLayout;
  isSelected: boolean;
  isEditing: boolean;
  onSelect: () => void;
  onStartEdit: () => void;
  onUpdateTitle: (title: string) => void;
  onToggleCollapse?: () => void;
}

const NodeCardItem: React.FC<NodeCardItemProps> = ({
  layout,
  isSelected,
  isEditing,
  onSelect,
  onStartEdit,
  onUpdateTitle,
  onToggleCollapse,
}) => {
  const { node, x, y, width, height, depth } = layout;
  const [editText, setEditText] = useState(node.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditText(node.title);
  }, [node.title]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleCommitEdit = () => {
    const trimmed = editText.trim();
    onUpdateTitle(trimmed || node.title);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.stopPropagation();
      handleCommitEdit();
    } else if (e.key === 'Escape') {
      e.stopPropagation();
      setEditText(node.title);
      onUpdateTitle(node.title);
    }
  };

  // 根据节点层级构建视觉层级
  const isRoot = depth === 0;
  const isMain = depth === 1;
  const nodeStyle = node.style ?? {};

  // 自定义样式覆盖（来自 MindMapStylePanel）
  const hasCustomBg = nodeStyle.background && nodeStyle.background !== 'transparent';
  const hasCustomBorder = nodeStyle.borderColor && nodeStyle.borderColor !== 'transparent';

  let baseStyle =
    'bg-black/40 border-white/[0.12] text-fg-secondary text-xs hover:border-white/[0.25] shadow-sm';
  if (isRoot) {
    baseStyle =
      'bg-sky-500/[0.16] border-sky-400/80 text-sky-100 font-semibold shadow-[0_0_20px_rgba(56,189,248,0.25)] text-sm tracking-tight';
  } else if (isMain) {
    baseStyle =
      'bg-white/[0.07] border-white/[0.18] text-fg-primary font-medium text-xs hover:border-sky-400/50 shadow-md';
  }

  // 形状类名
  const shapeClass =
    nodeStyle.shape === 'rect'
      ? 'rounded-none'
      : nodeStyle.shape === 'pill'
      ? 'rounded-full'
      : 'rounded-lg';

  const hasChildren = node.children && node.children.length > 0;

  return (
    <div
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
        ...(hasCustomBg ? { background: nodeStyle.background } : {}),
        ...(hasCustomBorder ? { borderColor: nodeStyle.borderColor } : {}),
        ...(nodeStyle.color ? { color: nodeStyle.color } : {}),
        ...(nodeStyle.fontSize ? { fontSize: `${nodeStyle.fontSize}px` } : {}),
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onStartEdit();
      }}
      className={`mindmap-node-card pointer-events-auto absolute border px-3 flex items-center justify-center transition-all duration-150 cursor-pointer ${shapeClass} ${baseStyle} ${
        isSelected
          ? 'ring-2 ring-brand-primary shadow-[0_0_16px_rgba(56,189,248,0.4)] border-brand-primary z-20 scale-[1.02]'
          : 'z-10'
      }`}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleCommitEdit}
          className="w-full bg-transparent border-none text-center outline-none ring-0 p-0 text-inherit font-inherit select-text cursor-text"
        />
      ) : (
        <span className="truncate w-full text-center leading-tight">
          {node.title}
        </span>
      )}

      {/* 折叠/展开圆点指示器 */}
      {hasChildren && !isEditing && onToggleCollapse && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleCollapse();
          }}
          title={node.collapsed ? '展开子树' : '折叠子树'}
          className={`absolute -right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border border-white/40 transition-colors z-30 ${
            node.collapsed
              ? 'bg-sky-400 border-sky-300'
              : 'bg-transparent hover:bg-white/30'
          }`}
        />
      )}
    </div>
  );
};
