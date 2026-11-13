// 块级原子节点类型 (Notion Block Models)
export type BlockType =
  | 'p'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'todo'
  | 'bullet'
  | 'quote'
  | 'code'
  | 'divider'
  | 'table';

export interface DocBlock {
  id: string;
  pageId: string;
  parentId?: string | null;
  blockType: BlockType;
  content: string;
  properties?: Record<string, unknown>;
  format?: Record<string, unknown>;
  sortOrder: number;
  createdAt: number;
  updatedAt: number;
}

// 分区类型定义 (Notion Partition System)
export type PartitionType = 'private' | 'favorite' | 'workspace';

export interface DocPartition {
  id: string;
  name: string;
  type: PartitionType;
  sortOrder: number;
  isCollapsed: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface DocPage {
  id: string;
  title: string;
  icon?: string;
  cover?: string;
  parentId?: string | null;
  partitionId?: string | null;
  collectionId?: string | null; // 若此页面是多维表格的一行
  properties?: Record<string, any>; // 页面绑定的多维属性字典 (Row-as-Page 核心)
  isFavorite: boolean;
  isArchived: boolean;
  createdAt: number;
  updatedAt: number;
}

// 多维表格字段属性类型 (基于 Notion Collection Schema 逆向契约)
export type ColumnType =
  | 'text'
  | 'number'
  | 'select'
  | 'multi_select'
  | 'status'
  | 'date'
  | 'checkbox';

export interface SelectOption {
  id: string;
  label: string;
  color: string; // 'sky' | 'emerald' | 'amber' | 'rose' | 'purple' | 'slate'
}

export interface ColumnSchema {
  id: string;
  name: string;
  type: ColumnType;
  width?: number;
  options?: SelectOption[];
}

export type CollectionSchemaMap = Record<string, ColumnSchema>;

// 多维表格视图 Tab 定义 (Notion Multi-View Tabs)
export interface DbCollectionView {
  id: string;
  name: string;
  type: 'table' | 'board' | 'list';
  filter?: Record<string, any>;
  sort?: { property: string; direction: 'asc' | 'desc' };
}

export interface DbCollection {
  id: string;
  pageId?: string | null;
  partitionId?: string | null;
  name: string;
  description?: string;
  schema: CollectionSchemaMap;
  views?: DbCollectionView[];
  format?: {
    tableProperties?: Array<{ property: string; width: number; visible: boolean }>;
  };
  createdAt: number;
  updatedAt: number;
}

export interface DbCollectionRow {
  id: string;
  collectionId: string;
  cells: Record<string, any>; // colId -> value
  sortOrder: number;
  createdAt: number;
  updatedAt: number;
}

// Notion 经典 Side Peek 侧边预览抽屉状态
export interface SidePeekState {
  isOpen: boolean;
  rowId: string | null;
  collectionId: string | null;
  isMaximized: boolean;
}
