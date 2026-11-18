import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { DocBlock } from '../../../types/docs.ts';
import { MindMapNode, INITIAL_MINDMAP } from '../../../types/mindmap.ts';
import { MindMapCanvas } from '../../mindmap/MindMapCanvas.tsx';
import {
  Network,
  Plus,
  Trash2,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Palette,
  GitFork,
  X,
} from 'lucide-react';

interface MindMapEmbedBlockProps {
  block: DocBlock;
  onUpdate: (
    content: string,
    blockType?: any,
    properties?: Record<string, any>,
    isStructural?: boolean
  ) => void;
  onDelete?: () => void;
}

// 递归查找指定节点及其父节点
function findNodeAndParent(
  current: MindMapNode,
  targetId: string,
  parent?: MindMapNode
): { node: MindMapNode; parent?: MindMapNode } | null {
  if (current.id === targetId) {
    return { node: current, parent };
  }
  if (current.children) {
    for (const child of current.children) {
      const found = findNodeAndParent(child, targetId, current);
      if (found) return found;
    }
  }
  return null;
}

// 计算单份思维导图的总节点数
function countNodes(node: MindMapNode): number {
  let count = 1;
  if (node.children) {
    for (const child of node.children) {
      count += countNodes(child);
    }
  }
  return count;
}

export const MindMapEmbedBlock: React.FC<MindMapEmbedBlockProps> = ({
  block,
  onUpdate,
  onDelete,
}) => {
  // 从 block.properties 中恢复 root 树，缺省使用 INITIAL_MINDMAP 克隆
  const rootNode: MindMapNode = useMemo(() => {
    if (block.properties?.root && typeof block.properties.root === 'object') {
      return block.properties.root as MindMapNode;
    }
    return JSON.parse(JSON.stringify(INITIAL_MINDMAP));
  }, [block.properties?.root]);

  const title = (block.properties?.title as string) || rootNode.title || '思维导图';
  const layoutDirection = (block.properties?.layoutDirection as 'right' | 'both') || 'right';
  const rainbowBranch = Boolean(block.properties?.rainbowBranch ?? true);

  // 画布交互状态
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 40, y: 80 });
  const [zoom, setZoom] = useState<number>(0.9);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(title);

  const containerRef = useRef<HTMLDivElement>(null);

  // 更新 root 并持久化到 Block properties
  const updateRoot = useCallback(
    (newRoot: MindMapNode) => {
      onUpdate(
        block.content,
        'mindmap',
        {
          ...block.properties,
          root: newRoot,
        },
        true
      );
    },
    [block.content, block.properties, onUpdate]
  );

  // 添加子分支
  const handleAddChild = useCallback(() => {
    const targetId = selectedId || rootNode.id;
    const newChildId = `node-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newChild: MindMapNode = {
      id: newChildId,
      title: '新子分支',
      children: [],
    };

    const cloneRoot = JSON.parse(JSON.stringify(rootNode)) as MindMapNode;
    const target = findNodeAndParent(cloneRoot, targetId);
    if (target) {
      if (!target.node.children) target.node.children = [];
      target.node.children.push(newChild);
      target.node.collapsed = false;
      updateRoot(cloneRoot);
      setSelectedId(newChildId);
      setEditingId(newChildId);
    }
  }, [rootNode, selectedId, updateRoot]);

  // 删除当前选中的分支 (根节点不可删除)
  const handleDeleteSelected = useCallback(() => {
    if (!selectedId || selectedId === rootNode.id) return;
    const cloneRoot = JSON.parse(JSON.stringify(rootNode)) as MindMapNode;
    const target = findNodeAndParent(cloneRoot, selectedId);
    if (target && target.parent && target.parent.children) {
      target.parent.children = target.parent.children.filter((c) => c.id !== selectedId);
      updateRoot(cloneRoot);
      setSelectedId(target.parent.id);
    }
    setEditingId(null);
  }, [rootNode, selectedId, updateRoot]);

  // 更新节点文本
  const handleUpdateNodeTitle = useCallback(
    (id: string, newTitle: string) => {
      const cloneRoot = JSON.parse(JSON.stringify(rootNode)) as MindMapNode;
      const target = findNodeAndParent(cloneRoot, id);
      if (target) {
        target.node.title = newTitle;
        // 如果是根节点，同步更新整个导图标题
        if (target.node.isRoot) {
          setTitleInput(newTitle);
        }
        updateRoot(cloneRoot);
      }
      setEditingId(null);
    },
    [rootNode, updateRoot]
  );

  // 折叠 / 展开分支
  const handleToggleCollapse = useCallback(
    (id: string) => {
      const cloneRoot = JSON.parse(JSON.stringify(rootNode)) as MindMapNode;
      const target = findNodeAndParent(cloneRoot, id);
      if (target && !target.node.isRoot) {
        target.node.collapsed = !target.node.collapsed;
        updateRoot(cloneRoot);
      }
    },
    [rootNode, updateRoot]
  );

  // 缩放步进调整
  const handleZoom = (delta: number) => {
    setZoom((prev) => Math.min(2.0, Math.max(0.4, Number((prev + delta).toFixed(2)))));
  };

  // 滚轮缩放控制
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.08 : -0.08;
      handleZoom(delta);
    }
  };

  // 键盘快捷键监听
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (editingId) return; // 编辑文本中不拦截
      if (!selectedId) return;

      if (e.key === 'Tab') {
        e.preventDefault();
        handleAddChild();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedId !== rootNode.id) {
          e.preventDefault();
          handleDeleteSelected();
        }
      } else if (e.key === ' ' || e.key === 'F2') {
        e.preventDefault();
        setEditingId(selectedId);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('keydown', handleKeyDown);
      return () => container.removeEventListener('keydown', handleKeyDown);
    }
  }, [editingId, selectedId, rootNode.id, handleAddChild, handleDeleteSelected]);

  const totalNodeCount = useMemo(() => countNodes(rootNode), [rootNode]);

  // 主体内容
  const cardContent = (
    <div
      ref={containerRef}
      tabIndex={0}
      onWheel={handleWheel}
      className={`group relative flex flex-col bg-slate-950/80 border border-white/10 rounded-xl overflow-hidden shadow-2xl transition-all focus:outline-none focus:border-amber-500/40 ${
        isFullscreen
          ? 'fixed inset-4 z-50 bg-slate-950/95 backdrop-blur-2xl border-white/20 shadow-2xl'
          : 'w-full h-[400px] my-2'
      }`}
    >
      {/* 36px 独立顶部 Header Bar */}
      <div className="h-9 px-3 flex items-center justify-between border-b border-white/[0.08] bg-[#0c111a]/90 backdrop-blur-md select-none shrink-0 z-20">
        {/* 左侧：图标、标题、节点统计 */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center justify-center w-5 h-5 rounded bg-amber-500/10 text-amber-400">
            <Network size={13} />
          </div>

          {isEditingTitle ? (
            <input
              type="text"
              autoFocus
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onBlur={() => {
                setIsEditingTitle(false);
                onUpdate(
                  block.content,
                  'mindmap',
                  { ...block.properties, title: titleInput },
                  true
                );
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setIsEditingTitle(false);
                  onUpdate(
                    block.content,
                    'mindmap',
                    { ...block.properties, title: titleInput },
                    true
                  );
                }
              }}
              className="text-xs font-semibold text-slate-100 bg-white/10 px-1.5 py-0.5 rounded outline-none border border-amber-500/50"
            />
          ) : (
            <span
              onDoubleClick={() => setIsEditingTitle(true)}
              className="text-xs font-semibold text-slate-200 truncate cursor-pointer hover:text-white"
              title="双击重命名导图"
            >
              {title}
            </span>
          )}

          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-white/[0.06] text-slate-400">
            {totalNodeCount} 节点
          </span>
        </div>

        {/* 右侧：增删分支、布局、彩虹、缩放、重置、全屏 */}
        <div className="flex items-center gap-1 text-[11px] text-slate-400">
          {/* 添加子节点 */}
          <button
            type="button"
            onClick={handleAddChild}
            className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="添加子分支 (Tab)"
          >
            <Plus size={12} className="text-amber-400" />
            <span className="hidden sm:inline">子分支</span>
          </button>

          {/* 删除选中分支 */}
          {selectedId && selectedId !== rootNode.id && (
            <button
              type="button"
              onClick={handleDeleteSelected}
              className="p-1 rounded hover:bg-white/10 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
              title="删除选中分支 (Delete)"
            >
              <Trash2 size={12} />
            </button>
          )}

          <div className="w-px h-3 bg-white/10 mx-0.5" />

          {/* 彩虹配色切换 */}
          <button
            type="button"
            onClick={() => {
              onUpdate(
                block.content,
                'mindmap',
                { ...block.properties, rainbowBranch: !rainbowBranch },
                true
              );
            }}
            className={`p-1 rounded transition-colors cursor-pointer ${
              rainbowBranch
                ? 'bg-amber-500/20 text-amber-300'
                : 'hover:bg-white/10 text-slate-400 hover:text-slate-200'
            }`}
            title={rainbowBranch ? '彩虹分支已开启' : '开启彩虹分支'}
          >
            <Palette size={12} />
          </button>

          {/* 双向 / 向右发散切换 */}
          <button
            type="button"
            onClick={() => {
              const nextDir = layoutDirection === 'right' ? 'both' : 'right';
              onUpdate(
                block.content,
                'mindmap',
                { ...block.properties, layoutDirection: nextDir },
                true
              );
            }}
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
              layoutDirection === 'both'
                ? 'bg-sky-500/20 text-sky-300'
                : 'hover:bg-white/10 text-slate-400 hover:text-slate-200'
            }`}
            title={layoutDirection === 'both' ? '左右双向发散' : '向右单向发散'}
          >
            <GitFork size={12} />
            <span className="hidden md:inline">
              {layoutDirection === 'both' ? '双向' : '向右'}
            </span>
          </button>

          <div className="w-px h-3 bg-white/10 mx-0.5" />

          {/* 缩放控制器 */}
          <button
            type="button"
            onClick={() => handleZoom(-0.1)}
            className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            title="缩小 (Ctrl + 滚轮)"
          >
            <ZoomOut size={12} />
          </button>
          <span className="font-mono text-[10px] w-9 text-center text-slate-400">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => handleZoom(0.1)}
            className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            title="放大 (Ctrl + 滚轮)"
          >
            <ZoomIn size={12} />
          </button>

          {/* 重置视角 */}
          <button
            type="button"
            onClick={() => {
              setPan({ x: 40, y: 80 });
              setZoom(0.9);
            }}
            className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            title="重置视角"
          >
            <RotateCcw size={12} />
          </button>

          <div className="w-px h-3 bg-white/10 mx-0.5" />

          {/* 全屏切换 */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            title={isFullscreen ? '退出全屏' : '全屏编辑导图'}
          >
            {isFullscreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
          </button>

          {/* 全屏状态下的关闭叉 */}
          {isFullscreen && (
            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              className="p-1 rounded hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer ml-1"
              title="退出全屏"
            >
              <X size={13} />
            </button>
          )}

          {/* 删除导图卡片 */}
          {!isFullscreen && onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="p-1 rounded hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer ml-0.5"
              title="删除此导图卡片"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>

      {/* 画布呈现区 */}
      <div className="flex-1 w-full h-full relative overflow-hidden">
        <MindMapCanvas
          root={rootNode}
          selectedId={selectedId}
          editingId={editingId}
          onSelectNode={(id) => setSelectedId(id)}
          onStartEdit={(id) => setEditingId(id)}
          onUpdateTitle={handleUpdateNodeTitle}
          pan={pan}
          onPanChange={setPan}
          zoom={zoom}
          layoutDirection={layoutDirection}
          rainbowBranch={rainbowBranch}
          onToggleCollapse={handleToggleCollapse}
        />
      </div>
    </div>
  );

  return (
    <>
      {cardContent}
      {/* 当全屏时遮罩底层防滚动穿透 */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsFullscreen(false)}
        />
      )}
    </>
  );
};
