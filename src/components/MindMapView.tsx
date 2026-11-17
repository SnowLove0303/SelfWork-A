import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import {
  MindMapNode,
  MindMapNodeStyle,
  MindMapStorageData,
  MindMapDocument,
  DEFAULT_PARTITION_ID,
  RECYCLE_BIN_PARTITION_ID,
  INITIAL_MINDMAP,
} from '../types/mindmap.ts';
import {
  loadMindMapStorage,
  saveMindMapStorage,
  createDefaultMindMapStorage,
  MINDMAP_STORAGE_KEY_V2,
} from '../services/db.ts';
import { MindMapCanvas } from './mindmap/MindMapCanvas.tsx';
import { MindMapPartitionView } from './mindmap/MindMapPartitionView.tsx';
import { MindMapToolbar } from './mindmap/MindMapToolbar.tsx';
import { MindMapStylePanel } from './mindmap/MindMapStylePanel.tsx';
import { MindMapLayoutResult } from './mindmap/layout.ts';

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

// 深层克隆，生成新 id
function deepCloneWithNewIds(node: MindMapNode): MindMapNode {
  return {
    ...node,
    id: `node-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    children: node.children?.map(deepCloneWithNewIds),
  };
}

// 递归设置所有节点的 collapsed 属性
function setAllCollapsed(node: MindMapNode, collapsed: boolean): MindMapNode {
  return {
    ...node,
    collapsed: node.isRoot ? false : collapsed,
    children: node.children?.map((c) => setAllCollapsed(c, collapsed)),
  };
}

const MAX_UNDO = 50;

export const MindMapView: React.FC = () => {
  // 1. 初始化多分区多导图存储（优先本地快速缓存秒开）
  const [storage, setStorage] = useState<MindMapStorageData>(() => {
    try {
      const cached = localStorage.getItem(MINDMAP_STORAGE_KEY_V2);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (
          parsed &&
          Array.isArray(parsed.partitions) &&
          Array.isArray(parsed.documents) &&
          parsed.partitions.length > 0
        ) {
          return parsed as MindMapStorageData;
        }
      }
    } catch {
      // ignore
    }
    return createDefaultMindMapStorage();
  });

  // 页面层级模式: 'partitions' (一级分区大盘) | 'canvas' (二级导图画布)
  const [currentView, setCurrentView] = useState<'partitions' | 'canvas'>('partitions');
  const [activeDocId, setActiveDocId] = useState<string | null>(null);

  // 画布节点交互状态
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 80, y: 120 });
  const [isHydrated, setIsHydrated] = useState(false);

  // 撤销/重做栈
  const undoStackRef = useRef<MindMapNode[]>([]);
  const redoStackRef = useRef<MindMapNode[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // 布局设置
  const [layoutDirection, setLayoutDirection] = useState<'right' | 'both'>('right');
  const [rainbowBranch, setRainbowBranch] = useState(false);
  const [branchColor, setBranchColor] = useState('#4F87FF');

  // 当前 Layout 结果（用于键盘导航）
  const layoutResultRef = useRef<MindMapLayoutResult | null>(null);

  // 从 SQLite 权威异步水合恢复
  useEffect(() => {
    let isMounted = true;
    loadMindMapStorage().then((loaded) => {
      if (isMounted) {
        setStorage(loaded);
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
      saveMindMapStorage(storage);
    }, 300);
    return () => clearTimeout(timer);
  }, [storage, isHydrated]);

  // 当前正在编辑的文档对象
  const activeDocument = useMemo(() => {
    if (!activeDocId) return null;
    return storage.documents.find((d) => d.id === activeDocId) || null;
  }, [storage.documents, activeDocId]);

  // 当前正在编辑的文档所属分区
  const activePartition = useMemo(() => {
    if (!activeDocument) return null;
    return (
      storage.partitions.find((p) => p.id === activeDocument.partitionId) ||
      storage.partitions[0]
    );
  }, [storage.partitions, activeDocument]);

  // 当前选中节点对象（给样式面板用）
  const selectedNode = useMemo(() => {
    if (!selectedId || !activeDocument) return null;
    const found = findNodeAndParent(activeDocument.root, selectedId);
    return found?.node ?? null;
  }, [selectedId, activeDocument]);

  // ==================== 撤销/重做管理 ====================

  const syncUndoRedoState = useCallback(() => {
    setCanUndo(undoStackRef.current.length > 0);
    setCanRedo(redoStackRef.current.length > 0);
  }, []);

  // 在进行任何修改前调用，将当前 root 压入撤销栈
  const pushUndo = useCallback(
    (currentRoot: MindMapNode) => {
      undoStackRef.current = [
        ...undoStackRef.current.slice(-MAX_UNDO + 1),
        JSON.parse(JSON.stringify(currentRoot)),
      ];
      redoStackRef.current = [];
      syncUndoRedoState();
    },
    [syncUndoRedoState]
  );

  const handleUndo = useCallback(() => {
    if (!activeDocument || undoStackRef.current.length === 0) return;
    const prevRoot = undoStackRef.current.pop()!;
    redoStackRef.current.push(JSON.parse(JSON.stringify(activeDocument.root)));
    setStorage((prev) => ({
      ...prev,
      documents: prev.documents.map((d) =>
        d.id === activeDocument.id ? { ...d, root: prevRoot, updatedAt: Date.now() } : d
      ),
    }));
    syncUndoRedoState();
  }, [activeDocument, syncUndoRedoState]);

  const handleRedo = useCallback(() => {
    if (!activeDocument || redoStackRef.current.length === 0) return;
    const nextRoot = redoStackRef.current.pop()!;
    undoStackRef.current.push(JSON.parse(JSON.stringify(activeDocument.root)));
    setStorage((prev) => ({
      ...prev,
      documents: prev.documents.map((d) =>
        d.id === activeDocument.id ? { ...d, root: nextRoot, updatedAt: Date.now() } : d
      ),
    }));
    syncUndoRedoState();
  }, [activeDocument, syncUndoRedoState]);

  // ==================== 分区操作处理 ====================

  const handleSelectPartition = useCallback((partitionId: string) => {
    setStorage((prev) => ({
      ...prev,
      activePartitionId: partitionId,
    }));
  }, []);

  const handleCreatePartition = useCallback((name: string) => {
    const newPartitionId = `part-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setStorage((prev) => ({
      ...prev,
      partitions: [
        ...prev.partitions,
        {
          id: newPartitionId,
          name,
          createdAt: Date.now(),
        },
      ],
      activePartitionId: newPartitionId,
    }));
  }, []);

  const handleRenamePartition = useCallback((id: string, newName: string) => {
    setStorage((prev) => ({
      ...prev,
      partitions: prev.partitions.map((p) =>
        p.id === id ? { ...p, name: newName } : p
      ),
    }));
  }, []);

  const handleDeletePartition = useCallback((id: string) => {
    setStorage((prev) => {
      // 默认分区不可删除
      if (id === DEFAULT_PARTITION_ID) return prev;
      const targetDefault =
        prev.partitions.find((p) => p.id === DEFAULT_PARTITION_ID)?.id ||
        prev.partitions[0].id;
      // 将被删除分区的文档迁移到默认分区
      const updatedDocs = prev.documents.map((doc) =>
        doc.partitionId === id ? { ...doc, partitionId: targetDefault } : doc
      );
      const remainingPartitions = prev.partitions.filter((p) => p.id !== id);
      return {
        ...prev,
        partitions: remainingPartitions,
        documents: updatedDocs,
        activePartitionId:
          prev.activePartitionId === id ? targetDefault : prev.activePartitionId,
      };
    });
  }, []);

  // ==================== 导图文档管理操作 ====================

  const handleCreateDocument = useCallback((partitionId: string) => {
    const now = Date.now();
    const newDocId = `doc-${now}-${Math.random().toString(36).slice(2, 6)}`;
    const targetPartitionId =
      partitionId && partitionId !== RECYCLE_BIN_PARTITION_ID
        ? partitionId
        : storage.activePartitionId !== RECYCLE_BIN_PARTITION_ID
        ? storage.activePartitionId
        : DEFAULT_PARTITION_ID;

    const newDoc: MindMapDocument = {
      id: newDocId,
      partitionId: targetPartitionId,
      title: '未命名导图',
      root: JSON.parse(JSON.stringify(INITIAL_MINDMAP)),
      createdAt: now,
      updatedAt: now,
    };

    setStorage((prev) => ({
      ...prev,
      documents: [newDoc, ...prev.documents],
      activeDocumentId: newDocId,
      activePartitionId: targetPartitionId,
    }));

    setActiveDocId(newDocId);
    setSelectedId(newDoc.root.id);
    setEditingId(null);
    setPan({ x: 80, y: 120 });
    setCurrentView('canvas');
    // 新导图清空撤销栈
    undoStackRef.current = [];
    redoStackRef.current = [];
    syncUndoRedoState();
  }, [storage.activePartitionId, syncUndoRedoState]);

  const handleOpenDocument = useCallback((docId: string) => {
    const doc = storage.documents.find((d) => d.id === docId);
    if (!doc) return;
    setActiveDocId(docId);
    setSelectedId(doc.root.id);
    setEditingId(null);
    setPan({ x: 80, y: 120 });
    setCurrentView('canvas');
    // 切换导图时清空撤销栈
    undoStackRef.current = [];
    redoStackRef.current = [];
    syncUndoRedoState();
  }, [storage.documents, syncUndoRedoState]);

  const handleRenameDocument = useCallback((id: string, newTitle: string) => {
    setStorage((prev) => ({
      ...prev,
      documents: prev.documents.map((d) =>
        d.id === id ? { ...d, title: newTitle, updatedAt: Date.now() } : d
      ),
    }));
  }, []);

  // 软删除导图至回收站
  const handleSoftDeleteDocument = useCallback((id: string) => {
    setStorage((prev) => ({
      ...prev,
      documents: prev.documents.map((d) =>
        d.id === id ? { ...d, isDeleted: true, deletedAt: Date.now() } : d
      ),
      activeDocumentId: prev.activeDocumentId === id ? null : prev.activeDocumentId,
    }));
    if (activeDocId === id) {
      setActiveDocId(null);
      setCurrentView('partitions');
    }
  }, [activeDocId]);

  // 从回收站恢复导图至原分区
  const handleRestoreDocument = useCallback((id: string) => {
    setStorage((prev) => {
      const defaultPartId =
        prev.partitions.find((p) => p.id === DEFAULT_PARTITION_ID)?.id ||
        prev.partitions[0]?.id ||
        DEFAULT_PARTITION_ID;

      return {
        ...prev,
        documents: prev.documents.map((d) => {
          if (d.id !== id) return d;
          const partitionExists = prev.partitions.some((p) => p.id === d.partitionId);
          return {
            ...d,
            isDeleted: false,
            deletedAt: undefined,
            partitionId: partitionExists ? d.partitionId : defaultPartId,
            updatedAt: Date.now(),
          };
        }),
      };
    });
  }, []);

  // 彻底物理销毁单篇导图
  const handlePermanentDeleteDocument = useCallback((id: string) => {
    setStorage((prev) => ({
      ...prev,
      documents: prev.documents.filter((d) => d.id !== id),
      activeDocumentId: prev.activeDocumentId === id ? null : prev.activeDocumentId,
    }));
  }, []);

  // 一键清空回收站
  const handleEmptyRecycleBin = useCallback(() => {
    setStorage((prev) => ({
      ...prev,
      documents: prev.documents.filter((d) => !d.isDeleted),
    }));
  }, []);

  const handleMoveDocumentPartition = useCallback((docId: string, targetPartitionId: string) => {
    setStorage((prev) => ({
      ...prev,
      documents: prev.documents.map((d) =>
        d.id === docId ? { ...d, partitionId: targetPartitionId, updatedAt: Date.now() } : d
      ),
    }));
  }, []);

  // 返回一级分区大盘
  const handleBackToPartitions = useCallback(() => {
    if (activeDocId) {
      setStorage((prev) => {
        const updated = {
          ...prev,
          documents: prev.documents.map((d) =>
            d.id === activeDocId ? { ...d, updatedAt: Date.now() } : d
          ),
        };
        saveMindMapStorage(updated);
        return updated;
      });
    }
    setCurrentView('partitions');
    setActiveDocId(null);
  }, [activeDocId]);

  // ==================== 二级画布节点树编辑操作 ====================

  const handleAddChild = useCallback(() => {
    if (!activeDocument) return;
    const targetId = selectedId || activeDocument.root.id;
    pushUndo(activeDocument.root);
    const newChildId = `node-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newChild: MindMapNode = {
      id: newChildId,
      title: '新子分支',
      children: [],
    };

    setStorage((prev) => {
      const currentDoc = prev.documents.find((d) => d.id === activeDocument.id);
      if (!currentDoc) return prev;
      const cloneRoot = JSON.parse(JSON.stringify(currentDoc.root)) as MindMapNode;
      const target = findNodeAndParent(cloneRoot, targetId);
      if (target) {
        if (!target.node.children) target.node.children = [];
        target.node.children.push(newChild);
        // 自动展开目标节点
        target.node.collapsed = false;
      }
      return {
        ...prev,
        documents: prev.documents.map((d) =>
          d.id === currentDoc.id
            ? { ...d, root: cloneRoot, updatedAt: Date.now() }
            : d
        ),
      };
    });

    setSelectedId(newChildId);
    setEditingId(newChildId);
  }, [activeDocument, selectedId, pushUndo]);

  const handleAddSibling = useCallback(() => {
    if (!activeDocument) return;
    const isRoot = selectedId === activeDocument.root.id;
    if (!selectedId || isRoot) {
      handleAddChild();
      return;
    }

    pushUndo(activeDocument.root);
    const newSiblingId = `node-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newSibling: MindMapNode = {
      id: newSiblingId,
      title: '新同级分支',
      children: [],
    };

    setStorage((prev) => {
      const currentDoc = prev.documents.find((d) => d.id === activeDocument.id);
      if (!currentDoc) return prev;
      const cloneRoot = JSON.parse(JSON.stringify(currentDoc.root)) as MindMapNode;
      const target = findNodeAndParent(cloneRoot, selectedId);
      if (target && target.parent && target.parent.children) {
        const idx = target.parent.children.findIndex((c) => c.id === selectedId);
        target.parent.children.splice(idx + 1, 0, newSibling);
      }
      return {
        ...prev,
        documents: prev.documents.map((d) =>
          d.id === currentDoc.id
            ? { ...d, root: cloneRoot, updatedAt: Date.now() }
            : d
        ),
      };
    });

    setSelectedId(newSiblingId);
    setEditingId(newSiblingId);
  }, [activeDocument, selectedId, handleAddChild, pushUndo]);

  const handleDeleteSelected = useCallback(() => {
    if (!activeDocument) return;
    const isRoot = selectedId === activeDocument.root.id;
    if (!selectedId || isRoot) return;

    pushUndo(activeDocument.root);
    setStorage((prev) => {
      const currentDoc = prev.documents.find((d) => d.id === activeDocument.id);
      if (!currentDoc) return prev;
      const cloneRoot = JSON.parse(JSON.stringify(currentDoc.root)) as MindMapNode;
      const target = findNodeAndParent(cloneRoot, selectedId);
      if (target && target.parent && target.parent.children) {
        target.parent.children = target.parent.children.filter(
          (c) => c.id !== selectedId
        );
        setSelectedId(target.parent.id);
      }
      return {
        ...prev,
        documents: prev.documents.map((d) =>
          d.id === currentDoc.id
            ? { ...d, root: cloneRoot, updatedAt: Date.now() }
            : d
        ),
      };
    });
    setEditingId(null);
  }, [activeDocument, selectedId, pushUndo]);

  const handleUpdateTitle = useCallback((id: string, newTitle: string) => {
    if (!activeDocument) return;
    setStorage((prev) => {
      const currentDoc = prev.documents.find((d) => d.id === activeDocument.id);
      if (!currentDoc) return prev;
      const cloneRoot = JSON.parse(JSON.stringify(currentDoc.root)) as MindMapNode;
      const target = findNodeAndParent(cloneRoot, id);
      if (target) {
        target.node.title = newTitle;
      }
      const updatedTitle =
        id === cloneRoot.id && currentDoc.title === '未命名导图'
          ? newTitle
          : currentDoc.title;

      return {
        ...prev,
        documents: prev.documents.map((d) =>
          d.id === currentDoc.id
            ? { ...d, root: cloneRoot, title: updatedTitle, updatedAt: Date.now() }
            : d
        ),
      };
    });
    setEditingId(null);
  }, [activeDocument]);

  // ==================== 折叠/展开操作 ====================

  const handleToggleCollapse = useCallback((nodeId: string) => {
    if (!activeDocument) return;
    const found = findNodeAndParent(activeDocument.root, nodeId);
    if (!found || found.node.isRoot) return;

    pushUndo(activeDocument.root);
    setStorage((prev) => {
      const currentDoc = prev.documents.find((d) => d.id === activeDocument.id);
      if (!currentDoc) return prev;
      const cloneRoot = JSON.parse(JSON.stringify(currentDoc.root)) as MindMapNode;
      const target = findNodeAndParent(cloneRoot, nodeId);
      if (target) {
        target.node.collapsed = !target.node.collapsed;
      }
      return {
        ...prev,
        documents: prev.documents.map((d) =>
          d.id === currentDoc.id ? { ...d, root: cloneRoot, updatedAt: Date.now() } : d
        ),
      };
    });
  }, [activeDocument, pushUndo]);

  const handleCollapseAll = useCallback(() => {
    if (!activeDocument) return;
    pushUndo(activeDocument.root);
    setStorage((prev) => {
      const currentDoc = prev.documents.find((d) => d.id === activeDocument.id);
      if (!currentDoc) return prev;
      const newRoot = setAllCollapsed(currentDoc.root, true);
      return {
        ...prev,
        documents: prev.documents.map((d) =>
          d.id === currentDoc.id ? { ...d, root: newRoot, updatedAt: Date.now() } : d
        ),
      };
    });
  }, [activeDocument, pushUndo]);

  const handleExpandAll = useCallback(() => {
    if (!activeDocument) return;
    pushUndo(activeDocument.root);
    setStorage((prev) => {
      const currentDoc = prev.documents.find((d) => d.id === activeDocument.id);
      if (!currentDoc) return prev;
      const newRoot = setAllCollapsed(currentDoc.root, false);
      return {
        ...prev,
        documents: prev.documents.map((d) =>
          d.id === currentDoc.id ? { ...d, root: newRoot, updatedAt: Date.now() } : d
        ),
      };
    });
  }, [activeDocument, pushUndo]);

  // ==================== 排序操作（Alt+上下） ====================

  const handleMoveNodeUp = useCallback(() => {
    if (!activeDocument || !selectedId) return;
    const found = findNodeAndParent(activeDocument.root, selectedId);
    if (!found || !found.parent || !found.parent.children) return;
    const siblings = found.parent.children;
    const idx = siblings.findIndex((c) => c.id === selectedId);
    if (idx <= 0) return;

    pushUndo(activeDocument.root);
    setStorage((prev) => {
      const currentDoc = prev.documents.find((d) => d.id === activeDocument.id);
      if (!currentDoc) return prev;
      const cloneRoot = JSON.parse(JSON.stringify(currentDoc.root)) as MindMapNode;
      const parentFound = findNodeAndParent(cloneRoot, found.parent!.id);
      const parentNode = parentFound?.node ?? cloneRoot;
      if (!parentNode.children) return prev;
      const i = parentNode.children.findIndex((c) => c.id === selectedId);
      if (i > 0) {
        [parentNode.children[i - 1], parentNode.children[i]] = [
          parentNode.children[i],
          parentNode.children[i - 1],
        ];
      }
      return {
        ...prev,
        documents: prev.documents.map((d) =>
          d.id === currentDoc.id ? { ...d, root: cloneRoot, updatedAt: Date.now() } : d
        ),
      };
    });
  }, [activeDocument, selectedId, pushUndo]);

  const handleMoveNodeDown = useCallback(() => {
    if (!activeDocument || !selectedId) return;
    const found = findNodeAndParent(activeDocument.root, selectedId);
    if (!found || !found.parent || !found.parent.children) return;
    const siblings = found.parent.children;
    const idx = siblings.findIndex((c) => c.id === selectedId);
    if (idx >= siblings.length - 1) return;

    pushUndo(activeDocument.root);
    setStorage((prev) => {
      const currentDoc = prev.documents.find((d) => d.id === activeDocument.id);
      if (!currentDoc) return prev;
      const cloneRoot = JSON.parse(JSON.stringify(currentDoc.root)) as MindMapNode;
      const parentFound = findNodeAndParent(cloneRoot, found.parent!.id);
      const parentNode = parentFound?.node ?? cloneRoot;
      if (!parentNode.children) return prev;
      const i = parentNode.children.findIndex((c) => c.id === selectedId);
      if (i < parentNode.children.length - 1) {
        [parentNode.children[i], parentNode.children[i + 1]] = [
          parentNode.children[i + 1],
          parentNode.children[i],
        ];
      }
      return {
        ...prev,
        documents: prev.documents.map((d) =>
          d.id === currentDoc.id ? { ...d, root: cloneRoot, updatedAt: Date.now() } : d
        ),
      };
    });
  }, [activeDocument, selectedId, pushUndo]);

  // ==================== 复制节点（Ctrl+D） ====================

  const handleDuplicateNode = useCallback(() => {
    if (!activeDocument || !selectedId) return;
    const isRoot = selectedId === activeDocument.root.id;
    if (isRoot) return;

    const found = findNodeAndParent(activeDocument.root, selectedId);
    if (!found || !found.parent || !found.parent.children) return;

    pushUndo(activeDocument.root);
    const clonedNode = deepCloneWithNewIds(found.node);

    setStorage((prev) => {
      const currentDoc = prev.documents.find((d) => d.id === activeDocument.id);
      if (!currentDoc) return prev;
      const cloneRoot = JSON.parse(JSON.stringify(currentDoc.root)) as MindMapNode;
      const parentFound = findNodeAndParent(cloneRoot, found.parent!.id);
      const parentNode = parentFound?.node ?? cloneRoot;
      if (!parentNode.children) return prev;
      const idx = parentNode.children.findIndex((c) => c.id === selectedId);
      parentNode.children.splice(idx + 1, 0, clonedNode);
      return {
        ...prev,
        documents: prev.documents.map((d) =>
          d.id === currentDoc.id ? { ...d, root: cloneRoot, updatedAt: Date.now() } : d
        ),
      };
    });

    setSelectedId(clonedNode.id);
  }, [activeDocument, selectedId, pushUndo]);

  // ==================== 节点样式更新 ====================

  const handleUpdateNodeStyle = useCallback(
    (nodeId: string, patch: Partial<MindMapNodeStyle>) => {
      if (!activeDocument) return;
      setStorage((prev) => {
        const currentDoc = prev.documents.find((d) => d.id === activeDocument.id);
        if (!currentDoc) return prev;
        const cloneRoot = JSON.parse(JSON.stringify(currentDoc.root)) as MindMapNode;
        const target = findNodeAndParent(cloneRoot, nodeId);
        if (target) {
          target.node.style = { ...(target.node.style ?? {}), ...patch };
        }
        return {
          ...prev,
          documents: prev.documents.map((d) =>
            d.id === currentDoc.id ? { ...d, root: cloneRoot, updatedAt: Date.now() } : d
          ),
        };
      });
    },
    [activeDocument]
  );

  const handleResetNodeStyle = useCallback(
    (nodeId: string) => {
      if (!activeDocument) return;
      setStorage((prev) => {
        const currentDoc = prev.documents.find((d) => d.id === activeDocument.id);
        if (!currentDoc) return prev;
        const cloneRoot = JSON.parse(JSON.stringify(currentDoc.root)) as MindMapNode;
        const target = findNodeAndParent(cloneRoot, nodeId);
        if (target) {
          target.node.style = {};
        }
        return {
          ...prev,
          documents: prev.documents.map((d) =>
            d.id === currentDoc.id ? { ...d, root: cloneRoot, updatedAt: Date.now() } : d
          ),
        };
      });
    },
    [activeDocument]
  );

  // ==================== 键盘导航辅助（利用 layoutResultRef） ====================

  const navigateToNeighbor = useCallback(
    (direction: 'up' | 'down' | 'left' | 'right') => {
      if (!selectedId || !layoutResultRef.current) return;
      const layouts = layoutResultRef.current.layouts;
      const currentLayout = layouts.find((l) => l.node.id === selectedId);
      if (!currentLayout) return;

      let bestId: string | null = null;
      let bestDist = Infinity;

      const cx = currentLayout.x + currentLayout.width / 2;
      const cy = currentLayout.y + currentLayout.height / 2;

      for (const l of layouts) {
        if (l.node.id === selectedId) continue;
        const lx = l.x + l.width / 2;
        const ly = l.y + l.height / 2;
        const dx = lx - cx;
        const dy = ly - cy;

        let isInDir = false;
        if (direction === 'right' && dx > 20 && Math.abs(dy) < Math.abs(dx) * 1.5) isInDir = true;
        if (direction === 'left' && dx < -20 && Math.abs(dy) < Math.abs(dx) * 1.5) isInDir = true;
        if (direction === 'down' && dy > 10 && Math.abs(dx) < Math.abs(dy) * 2) isInDir = true;
        if (direction === 'up' && dy < -10 && Math.abs(dx) < Math.abs(dy) * 2) isInDir = true;

        if (isInDir) {
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < bestDist) {
            bestDist = dist;
            bestId = l.node.id;
          }
        }
      }

      if (bestId) {
        setSelectedId(bestId);
        setEditingId(null);
      }
    },
    [selectedId]
  );

  // ==================== 全局键盘交互调度器 ====================

  useEffect(() => {
    if (currentView !== 'canvas') return;

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInInput =
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          (activeEl as HTMLElement).isContentEditable);

      // 在输入模式下只处理 Escape
      if (isInInput) {
        if (e.key === 'Escape' && editingId) {
          setEditingId(null);
        }
        return;
      }

      // Ctrl+Z 撤销
      if (e.key === 'z' && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
        return;
      }
      // Ctrl+Y / Ctrl+Shift+Z 重做
      if (
        (e.key === 'y' && (e.ctrlKey || e.metaKey)) ||
        (e.key === 'z' && (e.ctrlKey || e.metaKey) && e.shiftKey)
      ) {
        e.preventDefault();
        handleRedo();
        return;
      }
      // Ctrl+D 复制
      if (e.key === 'd' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleDuplicateNode();
        return;
      }

      // Alt+Up/Down 排序
      if (e.key === 'ArrowUp' && e.altKey) {
        e.preventDefault();
        handleMoveNodeUp();
        return;
      }
      if (e.key === 'ArrowDown' && e.altKey) {
        e.preventDefault();
        handleMoveNodeDown();
        return;
      }

      // 箭头键导航
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        navigateToNeighbor('right');
        return;
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        navigateToNeighbor('left');
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        navigateToNeighbor('down');
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        navigateToNeighbor('up');
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
      } else if (e.key === ' ') {
        // Space 键折叠/展开
        e.preventDefault();
        if (selectedId) {
          handleToggleCollapse(selectedId);
        }
      } else if (e.key === 'F2') {
        e.preventDefault();
        if (selectedId) {
          setEditingId(selectedId);
        }
      } else if (e.key === 'Escape') {
        if (editingId) {
          setEditingId(null);
        }
      } else if (e.key === '/') {
        // / 折叠全部
        e.preventDefault();
        handleCollapseAll();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [
    currentView,
    selectedId,
    editingId,
    handleAddChild,
    handleAddSibling,
    handleDeleteSelected,
    handleUndo,
    handleRedo,
    handleDuplicateNode,
    handleMoveNodeUp,
    handleMoveNodeDown,
    navigateToNeighbor,
    handleToggleCollapse,
    handleCollapseAll,
  ]);

  // ==================== 视图分流渲染 ====================

  if (currentView === 'partitions' || !activeDocument) {
    return (
      <div key="view-partitions" className="animate-view-fade flex-1 flex flex-col h-full w-full overflow-hidden min-w-0">
        <MindMapPartitionView
          partitions={storage.partitions}
          documents={storage.documents}
          activePartitionId={storage.activePartitionId}
          onSelectPartition={handleSelectPartition}
          onCreatePartition={handleCreatePartition}
          onRenamePartition={handleRenamePartition}
          onDeletePartition={handleDeletePartition}
          onCreateDocument={handleCreateDocument}
          onOpenDocument={handleOpenDocument}
          onRenameDocument={handleRenameDocument}
          onDeleteDocument={handleSoftDeleteDocument}
          onMoveDocumentPartition={handleMoveDocumentPartition}
          onRestoreDocument={handleRestoreDocument}
          onPermanentDeleteDocument={handlePermanentDeleteDocument}
          onEmptyRecycleBin={handleEmptyRecycleBin}
        />
      </div>
    );
  }

  return (
    <div key="view-canvas" className="animate-canvas-fade flex-1 flex flex-col h-full w-full overflow-hidden relative select-none min-w-0">
      {/* 工具栏 */}
      <MindMapToolbar
        selectedId={selectedId}
        isRootSelected={selectedId === activeDocument.root.id}
        onAddChild={handleAddChild}
        onAddSibling={handleAddSibling}
        onDeleteSelected={handleDeleteSelected}
        onRecenter={() => setPan({ x: 80, y: 120 })}
        onOpenIOModal={() => {}}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={canUndo}
        canRedo={canRedo}
        onCollapseAll={handleCollapseAll}
        onExpandAll={handleExpandAll}
        layoutDirection={layoutDirection}
        onLayoutChange={setLayoutDirection}
      />

      {/* 主内容区域：画布 + 右侧样式面板 */}
      <div className="flex-1 flex flex-row overflow-hidden min-w-0 relative">
        {/* 核心脑图画布 */}
        <div className="flex-1 relative overflow-hidden min-w-0 h-full">
          {/* 左上角极简悬浮返回导航栏与面包屑 */}
          <div className="absolute top-3.5 left-3.5 z-40 flex items-center gap-2 px-2.5 py-1 rounded-lg bg-black/45 backdrop-blur-md border border-white/[0.08] shadow-lg text-xs">
            <button
              type="button"
              onClick={handleBackToPartitions}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium text-slate-300 hover:text-cyan-300 hover:bg-white/10 transition-colors"
              title="返回分区管理大盘"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>返回分区</span>
            </button>
            <span className="text-white/20">|</span>
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-fg-muted">
              <span className="truncate max-w-[120px]">
                {activePartition?.name || '默认分区'}
              </span>
              <span className="text-white/20">/</span>
              <span className="text-fg-primary font-semibold truncate max-w-[160px]">
                {activeDocument.title}
              </span>
            </div>
          </div>

          <MindMapCanvas
            root={activeDocument.root}
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
            layoutDirection={layoutDirection}
            rainbowBranch={rainbowBranch}
            branchColor={branchColor}
            onToggleCollapse={handleToggleCollapse}
            onLayoutResultChange={(result) => {
              layoutResultRef.current = result;
            }}
          />

          {/* 左下角快捷键指南 */}
          <div className="absolute bottom-3 left-3 pointer-events-none z-30 flex items-center gap-2 px-2.5 py-1 rounded-lg bg-black/45 backdrop-blur-md border border-white/[0.08] text-[10px] text-fg-muted/80 font-mono shadow-lg">
            <span>
              <span className="text-fg-primary">Tab</span> 子分支
            </span>
            <span className="text-white/20">|</span>
            <span>
              <span className="text-fg-primary">Enter</span> 同级
            </span>
            <span className="text-white/20">|</span>
            <span>
              <span className="text-fg-primary">Space</span> 折叠
            </span>
            <span className="text-white/20">|</span>
            <span>
              <span className="text-fg-primary">F2</span> 改名
            </span>
            <span className="text-white/20">|</span>
            <span>
              <span className="text-fg-primary">Ctrl+Z</span> 撤销
            </span>
          </div>
        </div>

        {/* 右侧样式面板（选中节点时显示） */}
        {selectedId && (
          <MindMapStylePanel
            selectedNode={selectedNode}
            layoutDirection={layoutDirection}
            rainbowBranch={rainbowBranch}
            branchColor={branchColor}
            onUpdateNodeStyle={handleUpdateNodeStyle}
            onLayoutDirectionChange={setLayoutDirection}
            onRainbowBranchChange={setRainbowBranch}
            onBranchColorChange={setBranchColor}
            onResetNodeStyle={handleResetNodeStyle}
          />
        )}
      </div>
    </div>
  );
};
