import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import {
  MindMapNode,
  MindMapStorageData,
  MindMapDocument,
  DEFAULT_PARTITION_ID,
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
    const newDoc: MindMapDocument = {
      id: newDocId,
      partitionId: partitionId || storage.activePartitionId,
      title: '未命名导图',
      root: JSON.parse(JSON.stringify(INITIAL_MINDMAP)),
      createdAt: now,
      updatedAt: now,
    };

    setStorage((prev) => ({
      ...prev,
      documents: [newDoc, ...prev.documents],
      activeDocumentId: newDocId,
    }));

    setActiveDocId(newDocId);
    setSelectedId(newDoc.root.id);
    setEditingId(null);
    setPan({ x: 80, y: 120 });
    setCurrentView('canvas');
  }, [storage.activePartitionId]);

  const handleOpenDocument = useCallback((docId: string) => {
    const doc = storage.documents.find((d) => d.id === docId);
    if (!doc) return;
    setActiveDocId(docId);
    setSelectedId(doc.root.id);
    setEditingId(null);
    setPan({ x: 80, y: 120 });
    setCurrentView('canvas');
  }, [storage.documents]);

  const handleRenameDocument = useCallback((id: string, newTitle: string) => {
    setStorage((prev) => ({
      ...prev,
      documents: prev.documents.map((d) =>
        d.id === id ? { ...d, title: newTitle, updatedAt: Date.now() } : d
      ),
    }));
  }, []);

  const handleDeleteDocument = useCallback((id: string) => {
    setStorage((prev) => {
      const remaining = prev.documents.filter((d) => d.id !== id);
      return {
        ...prev,
        documents: remaining,
        activeDocumentId: prev.activeDocumentId === id ? null : prev.activeDocumentId,
      };
    });
    if (activeDocId === id) {
      setActiveDocId(null);
      setCurrentView('partitions');
    }
  }, [activeDocId]);

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
    // 刷新当前文档时间戳并立即写入
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
  }, [activeDocument, selectedId]);

  const handleAddSibling = useCallback(() => {
    if (!activeDocument) return;
    const isRoot = selectedId === activeDocument.root.id;
    if (!selectedId || isRoot) {
      handleAddChild();
      return;
    }

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
  }, [activeDocument, selectedId, handleAddChild]);

  const handleDeleteSelected = useCallback(() => {
    if (!activeDocument) return;
    const isRoot = selectedId === activeDocument.root.id;
    if (!selectedId || isRoot) return;

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
  }, [activeDocument, selectedId]);

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
      // 如果改的是中心主题，且导图标题仍是默认名，则同步更新导图标题
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

  // ==================== 全局键盘交互调度器 ====================

  useEffect(() => {
    // 仅在二级画布页面监听快捷键
    if (currentView !== 'canvas') return;

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
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
      } else if (e.key === 'Escape') {
        // 如果正在编辑文本，则退出编辑
        if (editingId) {
          setEditingId(null);
        }
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
  ]);

  // ==================== 视图分流渲染 ====================

  if (currentView === 'partitions' || !activeDocument) {
    return (
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
        onDeleteDocument={handleDeleteDocument}
        onMoveDocumentPartition={handleMoveDocumentPartition}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full w-full overflow-hidden relative select-none min-w-0">
      {/* 二级画布主内容区：继承通透主画板 */}
      <div className="flex-1 relative overflow-hidden min-w-0 h-full w-full bg-transparent">
        {/* 左上角极简悬浮返回导航栏与面包屑 */}
        <div className="absolute top-4 left-4 z-40 flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-black/45 backdrop-blur-md border border-white/[0.08] shadow-lg text-xs">
          <button
            onClick={handleBackToPartitions}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-slate-300 hover:text-cyan-300 hover:bg-white/10 transition-colors"
            title="返回分区管理大盘"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="font-medium">返回分区</span>
          </button>
          <span className="text-white/20">|</span>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="truncate max-w-[120px]">
              {activePartition?.name || '默认分区'}
            </span>
            <span className="text-white/20">/</span>
            <span className="text-slate-100 font-semibold truncate max-w-[160px]">
              {activeDocument.title}
            </span>
          </div>
        </div>

        {/* 核心脑图画布 */}
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
        />

        {/* 左下角极简触觉快捷键指南指示 */}
        <div className="absolute bottom-3 left-3 pointer-events-none z-30 flex items-center gap-2 px-2.5 py-1 rounded-lg bg-black/45 backdrop-blur-md border border-white/[0.08] text-[10px] text-fg-muted/80 font-mono shadow-lg">
          <span>
            <span className="text-fg-primary">Tab</span> 子分支
          </span>
          <span className="text-white/20">|</span>
          <span>
            <span className="text-fg-primary">Enter</span> 同级分支
          </span>
          <span className="text-white/20">|</span>
          <span>
            <span className="text-fg-primary">Delete</span> 删除
          </span>
          <span className="text-white/20">|</span>
          <span>
            <span className="text-fg-primary">双击/空格</span> 改名
          </span>
        </div>
      </div>
    </div>
  );
};
