import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MindMapNode } from '../types/mindmap.ts';
import { INITIAL_MINDMAP } from '../types/mindmap.ts';
import { loadMindMap, saveMindMap, MINDMAP_STORAGE_KEY } from '../services/db.ts';
import { MindMapCanvas } from './mindmap/MindMapCanvas.tsx';

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

export const MindMapView: React.FC = () => {
  // 1. 初始化导图数据（优先从同步缓存恢复秒开）
  const [root, setRoot] = useState<MindMapNode>(() => {
    try {
      const cached = localStorage.getItem(MINDMAP_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === 'object' && parsed.id) {
          return parsed as MindMapNode;
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_MINDMAP;
  });

  const [selectedId, setSelectedId] = useState<string | null>(() => root.id);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 80, y: 120 });
  const [isHydrated, setIsHydrated] = useState(false);

  // 水合状态保护：从 SQLite 权威恢复
  useEffect(() => {
    let isMounted = true;
    loadMindMap().then((loaded) => {
      if (isMounted) {
        setRoot(loaded);
        setSelectedId(loaded.id);
        setIsHydrated(true);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // 自动防抖持久化 (300ms)
  useEffect(() => {
    if (!isHydrated) return;
    const timer = setTimeout(() => {
      saveMindMap(root);
    }, 300);
    return () => clearTimeout(timer);
  }, [root, isHydrated]);

  // 当前选中节点是否为根节点
  const isRootSelected = selectedId === root.id;

  // ==================== 节点树增删改逻辑 ====================

  // 添加子分支
  const handleAddChild = useCallback(() => {
    const targetId = selectedId || root.id;
    const newChildId = `node-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newChild: MindMapNode = {
      id: newChildId,
      title: '新子分支',
      children: [],
    };

    setRoot((prev) => {
      const clone = JSON.parse(JSON.stringify(prev)) as MindMapNode;
      const target = findNodeAndParent(clone, targetId);
      if (target) {
        if (!target.node.children) target.node.children = [];
        target.node.children.push(newChild);
      }
      return clone;
    });

    setSelectedId(newChildId);
    setEditingId(newChildId);
  }, [selectedId, root.id]);

  // 添加同级分支
  const handleAddSibling = useCallback(() => {
    if (!selectedId || isRootSelected) {
      handleAddChild();
      return;
    }

    const newSiblingId = `node-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newSibling: MindMapNode = {
      id: newSiblingId,
      title: '新同级分支',
      children: [],
    };

    setRoot((prev) => {
      const clone = JSON.parse(JSON.stringify(prev)) as MindMapNode;
      const target = findNodeAndParent(clone, selectedId);
      if (target && target.parent && target.parent.children) {
        const idx = target.parent.children.findIndex((c) => c.id === selectedId);
        target.parent.children.splice(idx + 1, 0, newSibling);
      }
      return clone;
    });

    setSelectedId(newSiblingId);
    setEditingId(newSiblingId);
  }, [selectedId, isRootSelected, handleAddChild]);

  // 删除选中分支
  const handleDeleteSelected = useCallback(() => {
    if (!selectedId || isRootSelected) return;

    setRoot((prev) => {
      const clone = JSON.parse(JSON.stringify(prev)) as MindMapNode;
      const target = findNodeAndParent(clone, selectedId);
      if (target && target.parent && target.parent.children) {
        target.parent.children = target.parent.children.filter((c) => c.id !== selectedId);
        setSelectedId(target.parent.id);
      }
      return clone;
    });
    setEditingId(null);
  }, [selectedId, isRootSelected]);

  // 更新节点文本
  const handleUpdateTitle = useCallback((id: string, newTitle: string) => {
    setRoot((prev) => {
      const clone = JSON.parse(JSON.stringify(prev)) as MindMapNode;
      const target = findNodeAndParent(clone, id);
      if (target) {
        target.node.title = newTitle;
      }
      return clone;
    });
    setEditingId(null);
  }, []);

  // ==================== 全局键盘交互调度器 ====================

  const editingIdRef = useRef(editingId);
  editingIdRef.current = editingId;

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // 若当前正处于输入框焦点中，不拦截文本输入键
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          (activeEl as HTMLElement).isContentEditable)
      ) {
        return;
      }

      if (e.key === 'Tab') {
        e.preventDefault();
        handleAddChild();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleAddSibling();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        handleDeleteSelected();
      } else if (e.key === ' ' || e.key === 'F2') {
        e.preventDefault();
        if (selectedId) {
          setEditingId(selectedId);
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [selectedId, handleAddChild, handleAddSibling, handleDeleteSelected]);

  return (
    <div className="flex-1 flex flex-col h-full w-full overflow-hidden relative select-none min-w-0">
      {/* 主画布内容区：纵向顶格满高展开 */}
      <div className="flex-1 relative overflow-hidden min-w-0 h-full w-full">
        <MindMapCanvas
          root={root}
          selectedId={selectedId}
          editingId={editingId}
          onSelectNode={(id) => {
            setSelectedId(id);
            setEditingId(null);
          }}
          onStartEdit={(id) => {
            setSelectedId(id);
            setEditingId(id);
          }}
          onUpdateTitle={handleUpdateTitle}
          pan={pan}
          onPanChange={setPan}
        />

        {/* 左下角极简触觉快捷键指南指示 */}
        <div className="absolute bottom-3 left-3 pointer-events-none z-30 flex items-center gap-2 px-2.5 py-1 rounded-lg bg-black/45 backdrop-blur-md border border-white/[0.08] text-[10px] text-fg-muted/80 font-mono shadow-lg">
          <span><span className="text-fg-primary">Tab</span> 子分支</span>
          <span className="text-white/20">|</span>
          <span><span className="text-fg-primary">Enter</span> 同级分支</span>
          <span className="text-white/20">|</span>
          <span><span className="text-fg-primary">Delete</span> 删除</span>
          <span className="text-white/20">|</span>
          <span><span className="text-fg-primary">双击/空格</span> 改名</span>
        </div>
      </div>
    </div>
  );
};
