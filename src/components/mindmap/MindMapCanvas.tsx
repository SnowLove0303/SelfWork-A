import React, { useRef, useState, useEffect } from 'react';
import { MindMapNode, NodeLayout } from '../../types/mindmap.ts';
import { calculateMindMapLayout, MindMapLayoutResult } from './layout.ts';

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
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [layoutResult, setLayoutResult] = useState<MindMapLayoutResult>(() =>
    calculateMindMapLayout(root)
  );

  // 动态重算排版
  useEffect(() => {
    setLayoutResult(calculateMindMapLayout(root));
  }, [root]);

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
        {/* SVG 连接线图层 */}
        <svg
          className="absolute inset-0 overflow-visible pointer-events-none"
          style={{ width: '100%', height: '100%' }}
        >
          {layoutResult.connections.map((conn) => {
            const isRelatedToSelected =
              selectedId === conn.from.node.id || selectedId === conn.to.node.id;

            return (
              <path
                key={conn.id}
                d={conn.path}
                fill="none"
                stroke={
                  isRelatedToSelected
                    ? 'rgba(56, 189, 248, 0.75)'
                    : 'rgba(80, 140, 200, 0.35)'
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
}

const NodeCardItem: React.FC<NodeCardItemProps> = ({
  layout,
  isSelected,
  isEditing,
  onSelect,
  onStartEdit,
  onUpdateTitle,
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

  let baseStyle =
    'bg-black/40 border-white/[0.12] text-fg-secondary text-xs hover:border-white/[0.25] shadow-sm';
  if (isRoot) {
    baseStyle =
      'bg-sky-500/[0.16] border-sky-400/80 text-sky-100 font-semibold shadow-[0_0_20px_rgba(56,189,248,0.25)] text-sm tracking-tight';
  } else if (isMain) {
    baseStyle =
      'bg-white/[0.07] border-white/[0.18] text-fg-primary font-medium text-xs hover:border-sky-400/50 shadow-md';
  }

  return (
    <div
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onStartEdit();
      }}
      className={`mindmap-node-card pointer-events-auto absolute rounded-lg border px-3 flex items-center justify-center transition-all duration-150 cursor-pointer ${baseStyle} ${
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
    </div>
  );
};
