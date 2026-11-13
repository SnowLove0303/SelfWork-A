import {
  DocPage,
  DocBlock,
  DbCollection,
  DbCollectionRow,
  CollectionSchemaMap,
  DocPartition,
} from '../types/docs.ts';

const DOC_PARTITIONS_STORAGE_KEY = 'selfwork_doc_partitions';
const DOC_PAGES_STORAGE_KEY = 'selfwork_doc_pages';
const DOC_BLOCKS_PREFIX = 'selfwork_doc_blocks_';
const DB_COLLECTIONS_STORAGE_KEY = 'selfwork_db_collections';
const DB_ROWS_PREFIX = 'selfwork_db_rows_';
const DOCS_INIT_KEY = 'selfwork_docs_v2_initialized';
const PLACEHOLDER_PURGED_MARK = 'selfwork_docs_placeholder_purged_v1';
const LEGACY_PLACEHOLDER_PAGE_IDS = ['page_plm_readme', 'page_python_notes', 'page_env_variables'];
const LEGACY_PLACEHOLDER_COL_IDS = ['col_plm_survey'];

async function tauriInvoke<T>(
  cmd: string,
  args?: Record<string, unknown>,
): Promise<T> {
  const { invoke } = await import('@tauri-apps/api/core');
  return await invoke<T>(cmd, args);
}

// ==================== 默认分区种子 (Partitions Seed) ====================

export const INITIAL_PARTITIONS: DocPartition[] = [
  {
    id: 'part_private',
    name: '私人',
    type: 'private',
    sortOrder: 1,
    isCollapsed: false,
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000,
  },
  {
    id: 'part_recent',
    name: '最近',
    type: 'recent',
    sortOrder: 2,
    isCollapsed: false,
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000,
  },
  {
    id: 'part_favorite',
    name: '收藏',
    type: 'favorite',
    sortOrder: 3,
    isCollapsed: false,
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000,
  },
];

// ==================== PLM 流程调研 多维数据库种子 (完全对齐用户 Notion 截图 1 & 3) ====================

export const PLM_COLLECTION_SCHEMA: CollectionSchemaMap = {
  col_title: {
    id: 'col_title',
    name: '调查问题',
    type: 'text',
    width: 320,
  },
  col_seq: {
    id: 'col_seq',
    name: '序号',
    type: 'number',
    width: 80,
  },
  col_module: {
    id: 'col_module',
    name: '模块',
    type: 'select',
    width: 140,
    options: [
      { id: 'opt_u2', label: 'U2 项目管理', color: 'amber' },
      { id: 'opt_u3', label: 'U3 研发管理', color: 'sky' },
      { id: 'opt_u1', label: 'U1 需求管理', color: 'purple' },
    ],
  },
  col_topic: {
    id: 'col_topic',
    name: '调查专题',
    type: 'select',
    width: 220,
    options: [
      { id: 't_u2_01', label: 'U2-01 项目启动与负责人管理', color: 'amber' },
      { id: 't_u2_02', label: 'U2-02 研发项目计划管理', color: 'emerald' },
      { id: 't_u2_03', label: 'U2-03 项目任务分解与责任分配管理', color: 'amber' },
      { id: 't_u2_04', label: 'U2-04 项目任务延期与计划偏差管理', color: 'sky' },
      { id: 't_u2_05', label: 'U2-05 项目生命周期与阶段流转管理', color: 'rose' },
      { id: 't_u2_06', label: 'U2-06 项目目标与范围变更管理', color: 'amber' },
      { id: 't_u2_07', label: 'U2-07 跨项目资源协调与优先级管理', color: 'sky' },
      { id: 't_u2_08', label: 'U2-08 研发项目暂停与恢复管理', color: 'rose' },
      { id: 't_u2_09', label: 'U2-09 研发项目正常结项管理', color: 'emerald' },
    ],
  },
  col_status: {
    id: 'col_status',
    name: '确认状态',
    type: 'status',
    width: 130,
    options: [
      { id: 'st_partial', label: '部分确认', color: 'amber' },
      { id: 'st_confirmed', label: '已确认', color: 'emerald' },
      { id: 'st_pending', label: '待调研', color: 'slate' },
    ],
  },
  col_kw1: { id: 'col_kw1', name: '关键词1', type: 'text', width: 120 },
  col_kw2: { id: 'col_kw2', name: '关键词2', type: 'text', width: 120 },
  col_kw3: { id: 'col_kw3', name: '关键词3', type: 'text', width: 120 },
  col_kw4: { id: 'col_kw4', name: '关键词4', type: 'text', width: 120 },
  col_kw5: { id: 'col_kw5', name: '关键词5', type: 'text', width: 120 },
  col_kw6: { id: 'col_kw6', name: '关键词6', type: 'text', width: 120 },
  col_notes: { id: 'col_notes', name: '待核实事项', type: 'text', width: 260 },
};

export const INITIAL_COLLECTION_SCHEMA = PLM_COLLECTION_SCHEMA;

export const INITIAL_COLLECTIONS: DbCollection[] = [];
export const INITIAL_COLLECTION_ROWS: DbCollectionRow[] = [];
export const INITIAL_ROW_PAGE_BLOCKS: Record<string, DocBlock[]> = {};
export const INITIAL_DOC_PAGES: DocPage[] = [];

// ==================== 旧占位数据安全定向清算 ====================

export async function purgeLegacyPlaceholders(): Promise<void> {
  if (localStorage.getItem(PLACEHOLDER_PURGED_MARK) === 'true') {
    return;
  }
  try {
    for (const colId of LEGACY_PLACEHOLDER_COL_IDS) {
      try {
        await tauriInvoke('db_delete_collection', { id: colId });
      } catch (_) {}
      localStorage.removeItem(`${DB_ROWS_PREFIX}${colId}`);
    }
    for (const pageId of LEGACY_PLACEHOLDER_PAGE_IDS) {
      try {
        await tauriInvoke('db_delete_page', { id: pageId });
      } catch (_) {}
      localStorage.removeItem(`${DOC_BLOCKS_PREFIX}${pageId}`);
    }
    const savedPages = localStorage.getItem(DOC_PAGES_STORAGE_KEY);
    if (savedPages) {
      const parsed: DocPage[] = JSON.parse(savedPages);
      const filtered = parsed.filter((p) => !LEGACY_PLACEHOLDER_PAGE_IDS.includes(p.id));
      localStorage.setItem(DOC_PAGES_STORAGE_KEY, JSON.stringify(filtered));
    }
    const savedCols = localStorage.getItem(DB_COLLECTIONS_STORAGE_KEY);
    if (savedCols) {
      const parsed: DbCollection[] = JSON.parse(savedCols);
      const filtered = parsed.filter((c) => !LEGACY_PLACEHOLDER_COL_IDS.includes(c.id));
      localStorage.setItem(DB_COLLECTIONS_STORAGE_KEY, JSON.stringify(filtered));
    }
    localStorage.setItem(PLACEHOLDER_PURGED_MARK, 'true');
    localStorage.setItem(DOCS_INIT_KEY, 'true');
  } catch (err) {
    console.warn('[docsDb] purgeLegacyPlaceholders failed', err);
  }
}

// ==================== 分区服务 (Partitions) ====================

function normalizePartitions(raw: any[]): DocPartition[] {
  const list: DocPartition[] = raw.map((p) => ({
    id: p.id,
    name: p.name,
    type: p.partitionType || p.type || 'private',
    parentId: p.parentId || null,
    sortOrder: typeof p.sortOrder === 'number' ? p.sortOrder : 1,
    isCollapsed: Boolean(p.isCollapsed),
    createdAt: p.createdAt || Date.now(),
    updatedAt: p.updatedAt || Date.now(),
  }));

  // 保证三大核心模块根节点完备存在 (私人/最近/收藏)，过滤旧的假工作空间
  const filtered = list.filter((p) => p.id !== 'part_workspace');
  for (const defaultP of INITIAL_PARTITIONS) {
    const exist = filtered.find((p) => p.id === defaultP.id);
    if (!exist) {
      filtered.push(defaultP);
    } else {
      // 纠正名称 (例如旧的'最爱'升级为'收藏')
      exist.name = defaultP.name;
      exist.type = defaultP.type;
    }
  }
  return filtered.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
}

export async function loadDocPartitions(): Promise<DocPartition[]> {
  try {
    const raw = await tauriInvoke<any[]>('db_get_all_partitions');
    if (raw && raw.length > 0) {
      const normalized = normalizePartitions(raw);
      localStorage.setItem(DOC_PARTITIONS_STORAGE_KEY, JSON.stringify(normalized));
      return normalized;
    }

    const saved = localStorage.getItem(DOC_PARTITIONS_STORAGE_KEY);
    if (saved) {
      const parsed = normalizePartitions(JSON.parse(saved));
      return parsed;
    }

    // 首次播种三大默认根分区
    for (const p of INITIAL_PARTITIONS) {
      await saveDocPartition(p);
    }
    localStorage.setItem(DOC_PARTITIONS_STORAGE_KEY, JSON.stringify(INITIAL_PARTITIONS));
    return INITIAL_PARTITIONS;
  } catch (err) {
    const saved = localStorage.getItem(DOC_PARTITIONS_STORAGE_KEY);
    if (saved) return normalizePartitions(JSON.parse(saved));
    return INITIAL_PARTITIONS;
  }
}

export async function saveDocPartition(partition: DocPartition): Promise<void> {
  const payload = {
    id: partition.id,
    name: partition.name,
    partitionType: partition.type,
    parentId: partition.parentId || null,
    sortOrder: partition.sortOrder,
    isCollapsed: partition.isCollapsed,
    createdAt: partition.createdAt,
    updatedAt: partition.updatedAt,
  };

  try {
    await tauriInvoke('db_save_partition', { partition: payload });
  } catch (err) {
    console.warn('[DocPartition] Tauri IPC save failed, using fallback', err);
  }
  const partitions = await loadDocPartitions();
  const idx = partitions.findIndex((p) => p.id === partition.id);
  if (idx >= 0) {
    partitions[idx] = partition;
  } else {
    partitions.push(partition);
  }
  localStorage.setItem(DOC_PARTITIONS_STORAGE_KEY, JSON.stringify(partitions));
}

export async function deleteDocPartition(id: string): Promise<void> {
  try {
    await tauriInvoke('db_delete_partition', { id });
  } catch (err) {
    console.warn('[DocPartition] Tauri IPC delete failed, using fallback', err);
  }
  const partitions = (await loadDocPartitions()).filter((p) => p.id !== id);
  localStorage.setItem(DOC_PARTITIONS_STORAGE_KEY, JSON.stringify(partitions));
}

export async function createSubPartition(parentId: string, name: string): Promise<DocPartition> {
  const sub: DocPartition = {
    id: `subpart_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: name.trim() || '未命名分区',
    type: 'private',
    parentId,
    sortOrder: Date.now(),
    isCollapsed: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  await saveDocPartition(sub);
  return sub;
}

// ==================== 文档页面服务 (DocPages) ====================

export async function loadDocPages(): Promise<DocPage[]> {
  await purgeLegacyPlaceholders();
  try {
    const rawPages = await tauriInvoke<any[]>('db_get_all_pages');
    if (rawPages && rawPages.length > 0) {
      const formatted: DocPage[] = rawPages
        .filter((p) => !LEGACY_PLACEHOLDER_PAGE_IDS.includes(p.id))
        .map((p) => ({
          id: p.id,
          title: p.title,
          icon: p.icon,
          cover: p.cover,
          parentId: p.parentId,
          partitionId: p.partitionId || 'part_private',
          collectionId: p.collectionId,
          properties: p.propertiesJson ? JSON.parse(p.propertiesJson) : undefined,
          isFavorite: p.isFavorite,
          isArchived: p.isArchived,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        }));
      localStorage.setItem(DOC_PAGES_STORAGE_KEY, JSON.stringify(formatted));
      return formatted;
    }

    const saved = localStorage.getItem(DOC_PAGES_STORAGE_KEY);
    if (saved) {
      const parsed: DocPage[] = JSON.parse(saved);
      return parsed.filter((p) => !LEGACY_PLACEHOLDER_PAGE_IDS.includes(p.id));
    }
    return [];
  } catch (err) {
    const saved = localStorage.getItem(DOC_PAGES_STORAGE_KEY);
    if (saved) {
      const parsed: DocPage[] = JSON.parse(saved);
      return parsed.filter((p) => !LEGACY_PLACEHOLDER_PAGE_IDS.includes(p.id));
    }
    return [];
  }
}

export async function saveDocPage(page: DocPage): Promise<void> {
  const payload = {
    id: page.id,
    title: page.title,
    icon: page.icon || null,
    cover: page.cover || null,
    parentId: page.parentId || null,
    partitionId: page.partitionId || 'part_private',
    collectionId: page.collectionId || null,
    propertiesJson: page.properties ? JSON.stringify(page.properties) : null,
    isFavorite: page.isFavorite,
    isArchived: page.isArchived,
    createdAt: page.createdAt,
    updatedAt: page.updatedAt,
  };

  try {
    await tauriInvoke('db_save_page', { page: payload });
  } catch (err) {
    console.warn('[DocPage] Tauri IPC save failed, using fallback', err);
  }

  const pages = await loadDocPages();
  const idx = pages.findIndex((p) => p.id === page.id);
  if (idx >= 0) {
    pages[idx] = page;
  } else {
    pages.unshift(page);
  }
  localStorage.setItem(DOC_PAGES_STORAGE_KEY, JSON.stringify(pages));
}

export async function deleteDocPage(id: string): Promise<void> {
  try {
    await tauriInvoke('db_delete_page', { id });
  } catch (err) {
    console.warn('[DocPage] Tauri IPC delete failed, using fallback', err);
  }
  const pages = (await loadDocPages()).filter((p) => p.id !== id);
  localStorage.setItem(DOC_PAGES_STORAGE_KEY, JSON.stringify(pages));
  localStorage.removeItem(`${DOC_BLOCKS_PREFIX}${id}`);
}

// ==================== 块级节点服务 (DocBlocks) ====================

export async function loadDocBlocks(pageId: string): Promise<DocBlock[]> {
  try {
    const rawBlocks = await tauriInvoke<any[]>('db_get_blocks_for_page', { pageId });
    if (rawBlocks && rawBlocks.length > 0) {
      const formatted: DocBlock[] = rawBlocks.map((b) => ({
        id: b.id,
        pageId: b.pageId,
        parentId: b.parentId,
        blockType: b.blockType,
        content: b.content,
        properties: b.propertiesJson ? JSON.parse(b.propertiesJson) : undefined,
        format: b.formatJson ? JSON.parse(b.formatJson) : undefined,
        sortOrder: b.sortOrder,
        createdAt: b.createdAt,
        updatedAt: b.updatedAt,
      }));
      localStorage.setItem(`${DOC_BLOCKS_PREFIX}${pageId}`, JSON.stringify(formatted));
      return formatted;
    }

    const saved = localStorage.getItem(`${DOC_BLOCKS_PREFIX}${pageId}`);
    if (saved) return JSON.parse(saved);

    return [];
  } catch (err) {
    const saved = localStorage.getItem(`${DOC_BLOCKS_PREFIX}${pageId}`);
    if (saved) return JSON.parse(saved);
    return [];
  }
}

export async function saveDocBlocks(pageId: string, blocks: DocBlock[]): Promise<void> {
  const backendBlocks = blocks.map((b) => ({
    id: b.id,
    pageId: b.pageId,
    parentId: b.parentId || null,
    blockType: b.blockType,
    content: b.content,
    propertiesJson: b.properties ? JSON.stringify(b.properties) : null,
    formatJson: b.format ? JSON.stringify(b.format) : null,
    sortOrder: b.sortOrder,
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
  }));

  try {
    await tauriInvoke('db_save_blocks_for_page', {
      pageId,
      blocks: backendBlocks,
    });
  } catch (err) {
    console.warn('[DocBlocks] Tauri IPC save failed, using fallback', err);
  }
  localStorage.setItem(`${DOC_BLOCKS_PREFIX}${pageId}`, JSON.stringify(blocks));
}

// ==================== 多维表格服务 (Collections) ====================

export async function loadDbCollections(): Promise<DbCollection[]> {
  await purgeLegacyPlaceholders();
  try {
    const rawCols = await tauriInvoke<any[]>('db_get_all_collections');
    if (rawCols && rawCols.length > 0) {
      const formatted: DbCollection[] = rawCols
        .filter((c) => !LEGACY_PLACEHOLDER_COL_IDS.includes(c.id))
        .map((c) => ({
          id: c.id,
          pageId: c.pageId,
          partitionId: c.partitionId || 'part_private',
          name: c.name,
          description: c.description,
          schema: typeof c.schemaJson === 'string' ? JSON.parse(c.schemaJson) : c.schemaJson,
          format: c.formatJson ? JSON.parse(c.formatJson) : undefined,
          isFavorite: Boolean(c.isFavorite),
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
        }));
      localStorage.setItem(DB_COLLECTIONS_STORAGE_KEY, JSON.stringify(formatted));
      return formatted;
    }

    const saved = localStorage.getItem(DB_COLLECTIONS_STORAGE_KEY);
    if (saved) {
      const parsed: DbCollection[] = JSON.parse(saved);
      return parsed.filter((c) => !LEGACY_PLACEHOLDER_COL_IDS.includes(c.id));
    }
    return [];
  } catch (err) {
    const saved = localStorage.getItem(DB_COLLECTIONS_STORAGE_KEY);
    if (saved) {
      const parsed: DbCollection[] = JSON.parse(saved);
      return parsed.filter((c) => !LEGACY_PLACEHOLDER_COL_IDS.includes(c.id));
    }
    return [];
  }
}

export async function saveDbCollection(col: DbCollection): Promise<void> {
  const payload = {
    id: col.id,
    pageId: col.pageId || null,
    partitionId: col.partitionId || 'part_private',
    name: col.name,
    description: col.description || null,
    schemaJson: JSON.stringify(col.schema),
    formatJson: col.format ? JSON.stringify(col.format) : null,
    isFavorite: Boolean(col.isFavorite),
    createdAt: col.createdAt,
    updatedAt: col.updatedAt,
  };

  try {
    await tauriInvoke('db_save_collection', { collection: payload });
  } catch (err) {
    console.warn('[DbCollection] Tauri IPC save failed, using fallback', err);
  }

  const collections = await loadDbCollections();
  const idx = collections.findIndex((c) => c.id === col.id);
  if (idx >= 0) {
    collections[idx] = col;
  } else {
    collections.unshift(col);
  }
  localStorage.setItem(DB_COLLECTIONS_STORAGE_KEY, JSON.stringify(collections));
}

export async function deleteDbCollection(id: string): Promise<void> {
  try {
    await tauriInvoke('db_delete_collection', { id });
  } catch (err) {
    console.warn('[DbCollection] Tauri IPC delete failed, using fallback', err);
  }
  const collections = (await loadDbCollections()).filter((c) => c.id !== id);
  localStorage.setItem(DB_COLLECTIONS_STORAGE_KEY, JSON.stringify(collections));
  localStorage.removeItem(`${DB_ROWS_PREFIX}${id}`);
}

// ==================== 多维表格记录行服务 (Collection Rows) ====================

export async function loadDbCollectionRows(collectionId: string): Promise<DbCollectionRow[]> {
  try {
    const rawRows = await tauriInvoke<any[]>('db_get_collection_rows', { collectionId });
    if (rawRows && rawRows.length > 0) {
      const formatted: DbCollectionRow[] = rawRows.map((r) => ({
        id: r.id,
        collectionId: r.collectionId,
        cells: typeof r.cellsJson === 'string' ? JSON.parse(r.cellsJson) : r.cellsJson,
        sortOrder: r.sortOrder,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      }));
      localStorage.setItem(`${DB_ROWS_PREFIX}${collectionId}`, JSON.stringify(formatted));
      return formatted;
    }

    const saved = localStorage.getItem(`${DB_ROWS_PREFIX}${collectionId}`);
    if (saved) return JSON.parse(saved);

    return [];
  } catch (err) {
    const saved = localStorage.getItem(`${DB_ROWS_PREFIX}${collectionId}`);
    if (saved) return JSON.parse(saved);
    return [];
  }
}

export async function saveDbCollectionRow(row: DbCollectionRow): Promise<void> {
  const payload = {
    id: row.id,
    collectionId: row.collectionId,
    cellsJson: JSON.stringify(row.cells),
    sortOrder: row.sortOrder,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };

  try {
    await tauriInvoke('db_save_collection_row', { row: payload });
  } catch (err) {
    console.warn('[DbCollectionRow] Tauri IPC save failed, using fallback', err);
  }

  const rows = await loadDbCollectionRows(row.collectionId);
  const idx = rows.findIndex((r) => r.id === row.id);
  if (idx >= 0) {
    rows[idx] = row;
  } else {
    rows.push(row);
  }
  localStorage.setItem(`${DB_ROWS_PREFIX}${row.collectionId}`, JSON.stringify(rows));
}

export async function deleteDbCollectionRow(collectionId: string, id: string): Promise<void> {
  try {
    await tauriInvoke('db_delete_collection_row', { id });
  } catch (err) {
    console.warn('[DbCollectionRow] Tauri IPC delete failed, using fallback', err);
  }

  const rows = (await loadDbCollectionRows(collectionId)).filter((r) => r.id !== id);
  localStorage.setItem(`${DB_ROWS_PREFIX}${collectionId}`, JSON.stringify(rows));
}
