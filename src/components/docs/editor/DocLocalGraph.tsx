import React, { useState, useEffect, useMemo, useRef } from 'react';
import { DocPage, DocBlock } from '../../../types/docs.ts';
import { scanBacklinksForPage } from '../../../services/backlinks.ts';
import { Share2, Compass, ExternalLink } from 'lucide-react';

interface DocLocalGraphProps {
  currentPage: DocPage;
  allPages?: DocPage[];
  currentBlocks?: DocBlock[];
  onNavigatePage?: (pageId: string) => void;
}

interface GraphNode {
  id: string;
  title: string;
  icon?: string;
  role: 'center' | 'outlink' | 'inlink' | 'both';
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

interface GraphLink {
  sourceId: string;
  targetId: string;
  role: 'outlink' | 'inlink' | 'both';
}

/**
 * 局部文档关联力导向图谱组件 (DocLocalGraph)
 * - 纯原生 React + SVG 轻量弹簧力学模拟
 * - 呈现中心当前页面与外部出度引用、入度被引用的拓扑关系
 * - 支持拖拽节点、悬浮高亮及双击一键穿透跳转
 */
export const DocLocalGraph: React.FC<DocLocalGraphProps> = ({
  currentPage,
  allPages = [],
  currentBlocks = [],
  onNavigatePage,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 220, height: 260 });
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry && entry.contentRect.width > 0) {
        setDimensions({
          width: Math.max(160, Math.floor(entry.contentRect.width)),
          height: Math.max(200, Math.floor(entry.contentRect.height || 260)),
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // 1. 扫描出度 (Outlinks)
  const outlinkPageIds = useMemo(() => {
    const ids = new Set<string>();
    const linkRegex = /#\/page\/([a-zA-Z0-9_-]+)/g;
    currentBlocks.forEach((b) => {
      if (!b.content) return;
      let match: RegExpExecArray | null;
      while ((match = linkRegex.exec(b.content)) !== null) {
        if (match[1] && match[1] !== currentPage.id) {
          ids.add(match[1]);
        }
      }
    });
    return ids;
  }, [currentBlocks, currentPage.id]);

  // 2. 扫描入度 (Inlinks)
  const inlinkPageIds = useMemo(() => {
    const backlinks = scanBacklinksForPage(currentPage.id, allPages);
    return new Set<string>(backlinks.map((b) => b.sourcePageId));
  }, [currentPage.id, allPages]);

  // 3. 构建初始拓扑图节点与连线
  const { initialNodes, initialLinks } = useMemo(() => {
    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];

    const cx = dimensions.width / 2;
    const cy = dimensions.height / 2;

    // 中心当前文档节点
    nodes.push({
      id: currentPage.id,
      title: currentPage.title || '当前文档',
      icon: currentPage.icon || '📄',
      role: 'center',
      x: cx,
      y: cy,
      vx: 0,
      vy: 0,
      radius: 18,
    });

    const relatedMap = new Map<string, 'outlink' | 'inlink' | 'both'>();

    outlinkPageIds.forEach((id) => {
      relatedMap.set(id, 'outlink');
    });

    inlinkPageIds.forEach((id) => {
      if (relatedMap.has(id)) {
        relatedMap.set(id, 'both');
      } else {
        relatedMap.set(id, 'inlink');
      }
    });

    const relatedList = Array.from(relatedMap.entries());
    const count = relatedList.length;
    const rOrbit = Math.min(cx, cy) * 0.72;

    relatedList.forEach(([pageId, role], idx) => {
      const page = allPages.find((p) => p.id === pageId);
      const angle = (idx / (count || 1)) * 2 * Math.PI - Math.PI / 2;
      const x = cx + rOrbit * Math.cos(angle);
      const y = cy + rOrbit * Math.sin(angle);

      nodes.push({
        id: pageId,
        title: page?.title || '未命名文档',
        icon: page?.icon || '📝',
        role,
        x,
        y,
        vx: 0,
        vy: 0,
        radius: 14,
      });

      links.push({
        sourceId: role === 'inlink' ? pageId : currentPage.id,
        targetId: role === 'inlink' ? currentPage.id : pageId,
        role,
      });
    });

    return { initialNodes: nodes, initialLinks: links };
  }, [currentPage, allPages, outlinkPageIds, inlinkPageIds, dimensions]);

  // 4. 力导向物理位置状态
  const [nodes, setNodes] = useState<GraphNode[]>(initialNodes);

  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes]);

  // 简易力导向弹簧动力学步进 (Spring Simulation Tick)
  useEffect(() => {
    if (nodes.length <= 1) return;

    let animFrame: number;
    let iteration = 0;
    const maxIterations = 80;

    const tick = () => {
      setNodes((prevNodes) => {
        const cx = dimensions.width / 2;
        const cy = dimensions.height / 2;
        const nextNodes = prevNodes.map((n) => ({ ...n }));

        // 斥力 (Coulomb repulsion between satellites)
        for (let i = 0; i < nextNodes.length; i++) {
          for (let j = i + 1; j < nextNodes.length; j++) {
            const na = nextNodes[i];
            const nb = nextNodes[j];
            const dx = nb.x - na.x;
            const dy = nb.y - na.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            if (dist < 100) {
              const force = (100 - dist) * 0.03;
              const fx = (dx / dist) * force;
              const fy = (dy / dist) * force;
              if (na.role !== 'center' && na.id !== draggingNodeId) {
                na.x -= fx;
                na.y -= fy;
              }
              if (nb.role !== 'center' && nb.id !== draggingNodeId) {
                nb.x += fx;
                nb.y += fy;
              }
            }
          }
        }

        // 引力与向心力 (Hooke law towards center)
        const centerNode = nextNodes.find((n) => n.role === 'center');
        if (centerNode) {
          centerNode.x = cx;
          centerNode.y = cy;
          nextNodes.forEach((n) => {
            if (n.role === 'center' || n.id === draggingNodeId) return;
            const dx = centerNode.x - n.x;
            const dy = centerNode.y - n.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const targetDist = 75;
            const diff = dist - targetDist;
            n.x += (dx / dist) * diff * 0.05;
            n.y += (dy / dist) * diff * 0.05;

            // 画布边缘约束
            const pad = 20;
            n.x = Math.max(pad, Math.min(dimensions.width - pad, n.x));
            n.y = Math.max(pad, Math.min(dimensions.height - pad, n.y));
          });
        }

        return nextNodes;
      });

      iteration++;
      if (iteration < maxIterations) {
        animFrame = requestAnimationFrame(tick);
      }
    };

    animFrame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrame);
  }, [initialNodes, dimensions, draggingNodeId]);

  // 鼠标拖拽支持
  const handleMouseDown = (nodeId: string) => {
    setDraggingNodeId(nodeId);
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!draggingNodeId || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setNodes((prev) =>
      prev.map((n) => {
        if (n.id === draggingNodeId) {
          return {
            ...n,
            x: Math.max(16, Math.min(dimensions.width - 16, mouseX)),
            y: Math.max(16, Math.min(dimensions.height - 16, mouseY)),
          };
        }
        return n;
      })
    );
  };

  const handleMouseUp = () => {
    setDraggingNodeId(null);
  };

  if (nodes.length <= 1) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 text-center select-none text-slate-500">
        <div className="w-10 h-10 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center mb-3 text-slate-400">
          <Compass size={18} className="animate-pulse" />
        </div>
        <p className="text-xs font-medium text-slate-300">暂无关联</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 flex flex-col min-h-[220px] select-none relative overflow-hidden"
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="w-full h-full"
      >
        <defs>
          <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
          </radialGradient>
          <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 关系连线 */}
        {initialLinks.map((link) => {
          const src = nodes.find((n) => n.id === link.sourceId);
          const tgt = nodes.find((n) => n.id === link.targetId);
          if (!src || !tgt) return null;

          const isConnectedHover =
            hoveredNodeId === src.id || hoveredNodeId === tgt.id;

          return (
            <line
              key={`${link.sourceId}-${link.targetId}`}
              x1={src.x}
              y1={src.y}
              x2={tgt.x}
              y2={tgt.y}
              stroke={
                isConnectedHover
                  ? '#38bdf8'
                  : link.role === 'outlink'
                  ? 'rgba(56, 189, 248, 0.35)'
                  : 'rgba(168, 85, 247, 0.35)'
              }
              strokeWidth={isConnectedHover ? 2 : 1.2}
              strokeDasharray={link.role === 'inlink' ? '3,3' : undefined}
              className="transition-colors duration-200"
            />
          );
        })}

        {/* 节点渲染 */}
        {nodes.map((node) => {
          const isCenter = node.role === 'center';
          const isHovered = hoveredNodeId === node.id;

          let strokeColor = '#38bdf8';
          let fillColor = '#0f172a';
          if (!isCenter) {
            if (node.role === 'outlink') strokeColor = '#38bdf8';
            else if (node.role === 'inlink') strokeColor = '#a855f7';
            else strokeColor = '#10b981';
          }

          return (
            <g
              key={node.id}
              transform={`translate(${node.x}, ${node.y})`}
              onMouseEnter={() => setHoveredNodeId(node.id)}
              onMouseLeave={() => setHoveredNodeId(null)}
              onMouseDown={(e) => {
                e.stopPropagation();
                handleMouseDown(node.id);
              }}
              onClick={() => {
                if (!isCenter && onNavigatePage) {
                  onNavigatePage(node.id);
                }
              }}
              className={`cursor-pointer transition-transform duration-100 ${
                isHovered ? 'scale-110' : ''
              }`}
            >
              {/* 中心节点发光外环 */}
              {isCenter && (
                <circle
                  r={node.radius + 8}
                  fill="url(#centerGlow)"
                  className="animate-pulse"
                />
              )}

              {/* 核心圆形 */}
              <circle
                r={node.radius}
                fill={fillColor}
                stroke={strokeColor}
                strokeWidth={isCenter ? 2.5 : isHovered ? 2 : 1.5}
                filter={isHovered ? 'url(#glowFilter)' : undefined}
                className="transition-all"
              />

              {/* 节点图标/Emoji */}
              <text
                textAnchor="middle"
                dy="0.35em"
                fontSize={isCenter ? 12 : 10}
                className="select-none pointer-events-none fill-slate-200"
              >
                {node.icon || '📄'}
              </text>
            </g>
          );
        })}
      </svg>

      {/* 底部或悬停微标签 */}
      <div className="px-3 py-1.5 bg-black/40 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
        <div className="flex items-center gap-1.5 truncate max-w-[140px]">
          {hoveredNodeId ? (
            (() => {
              const hNode = nodes.find((n) => n.id === hoveredNodeId);
              return (
                <span className="truncate text-slate-200 font-medium flex items-center gap-1">
                  <span>{hNode?.icon}</span>
                  <span className="truncate">{hNode?.title}</span>
                </span>
              );
            })()
          ) : (
            <span className="text-slate-500 flex items-center gap-1">
              <Share2 size={11} className="text-sky-400" />
              <span>{nodes.length - 1} 个关联文档</span>
            </span>
          )}
        </div>

        {hoveredNodeId && hoveredNodeId !== currentPage.id && (
          <button
            type="button"
            onClick={() => onNavigatePage?.(hoveredNodeId)}
            className="text-sky-400 hover:text-sky-300 flex items-center gap-0.5 shrink-0 transition-colors"
          >
            <span>穿透</span>
            <ExternalLink size={10} />
          </button>
        )}
      </div>
    </div>
  );
};
