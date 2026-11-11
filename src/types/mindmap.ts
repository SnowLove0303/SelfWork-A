export interface MindMapNode {
  id: string;
  title: string;
  children?: MindMapNode[];
  isRoot?: boolean;
}

export interface NodeLayout {
  node: MindMapNode;
  x: number;
  y: number;
  width: number;
  height: number;
  depth: number;
  parentId?: string;
}

export interface MindMapPartition {
  id: string;
  name: string;
  createdAt: number;
  isDefault?: boolean;
}

export interface MindMapDocument {
  id: string;
  partitionId: string;
  title: string;
  root: MindMapNode;
  createdAt: number;
  updatedAt: number;
}

export interface MindMapStorageData {
  partitions: MindMapPartition[];
  documents: MindMapDocument[];
  activePartitionId: string;
  activeDocumentId: string | null;
}

export const DEFAULT_PARTITION_ID = 'default-partition-all';

export const INITIAL_MINDMAP: MindMapNode = {
  id: 'root-mindmap-topic',
  title: '中心主题',
  isRoot: true,
  children: [
    {
      id: 'branch-topic-1',
      title: '分支主题 1',
      children: [
        { id: 'sub-topic-1-1', title: '子分支 1.1' },
        { id: 'sub-topic-1-2', title: '子分支 1.2' },
      ],
    },
    {
      id: 'branch-topic-2',
      title: '分支主题 2',
      children: [
        { id: 'sub-topic-2-1', title: '子分支 2.1' },
      ],
    },
    {
      id: 'branch-topic-3',
      title: '分支主题 3',
    },
  ],
};
