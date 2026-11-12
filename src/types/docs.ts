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

export interface DocPage {
  id: string;
  title: string;
  icon?: string;
  cover?: string;
  parentId?: string | null;
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

export interface DbCollection {
  id: string;
  pageId?: string | null;
  name: string;
  description?: string;
  schema: CollectionSchemaMap;
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
