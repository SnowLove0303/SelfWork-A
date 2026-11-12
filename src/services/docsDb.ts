import {
  DocPage,
  DocBlock,
  DbCollection,
  DbCollectionRow,
  CollectionSchemaMap,
} from '../types/docs.ts';

const DOC_PAGES_STORAGE_KEY = 'selfwork_doc_pages';
const DOC_BLOCKS_PREFIX = 'selfwork_doc_blocks_';
const DB_COLLECTIONS_STORAGE_KEY = 'selfwork_db_collections';
const DB_ROWS_PREFIX = 'selfwork_db_rows_';
const DOCS_INIT_KEY = 'selfwork_docs_initialized';

async function tauriInvoke<T>(
  cmd: string,
  args?: Record<string, unknown>,
): Promise<T> {
  const { invoke } = await import('@tauri-apps/api/core');
  return await invoke<T>(cmd, args);
}

// ==================== 默认初始数据种子 (Initial Seed Data) ====================

export const INITIAL_DOC_PAGES: DocPage[] = [
  {
    id: 'page-getting-started',
    title: '欢迎使用 SelfWork 知识库与多维表格',
    icon: '🚀',
    isFavorite: true,
    isArchived: false,
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now() - 3600000,
  },
  {
    id: 'page-feature-roadmap',
    title: 'SelfWork 2026 功能迭代规划',
    icon: '🎯',
    isFavorite: false,
    isArchived: false,
    createdAt: Date.now() - 1800000,
    updatedAt: Date.now() - 1800000,
  },
];

export const INITIAL_DOC_BLOCKS: Record<string, DocBlock[]> = {
  'page-getting-started': [
    {
      id: 'b-start-1',
      pageId: 'page-getting-started',
      blockType: 'h1',
      content: '欢迎使用 SelfWork 知识库与多维表格系统',
      sortOrder: 1,
      createdAt: Date.now() - 3600000,
      updatedAt: Date.now() - 3600000,
    },
    {
      id: 'b-start-2',
      pageId: 'page-getting-started',
      blockType: 'p',
      content: '本系统基于 Notion 核心工业级架构逆向自研，支持块级富文本页面与多维表格数据引擎。',
      sortOrder: 2,
      createdAt: Date.now() - 3500000,
      updatedAt: Date.now() - 3500000,
    },
    {
      id: 'b-start-3',
      pageId: 'page-getting-started',
      blockType: 'h2',
      content: '💡 核心特色功能',
      sortOrder: 3,
      createdAt: Date.now() - 3400000,
      updatedAt: Date.now() - 3400000,
    },
    {
      id: 'b-start-4',
      pageId: 'page-getting-started',
      blockType: 'todo',
      content: '支持文本、一级/二级/三级标题、待办清单、引述、代码块与分隔线',
      properties: { checked: true },
      sortOrder: 4,
      createdAt: Date.now() - 3300000,
      updatedAt: Date.now() - 3300000,
    },
    {
      id: 'b-start-5',
      pageId: 'page-getting-started',
      blockType: 'todo',
      content: '多维表格引擎：支持文本、数字、状态、单选标签、复选框、日期多类型',
      properties: { checked: true },
      sortOrder: 5,
      createdAt: Date.now() - 3200000,
      updatedAt: Date.now() - 3200000,
    },
    {
      id: 'b-start-6',
      pageId: 'page-getting-started',
      blockType: 'todo',
      content: '输入 / 呼出斜杠指令菜单，沉浸式键盘流交互',
      properties: { checked: false },
      sortOrder: 6,
      createdAt: Date.now() - 3100000,
      updatedAt: Date.now() - 3100000,
    },
    {
      id: 'b-start-7',
      pageId: 'page-getting-started',
      blockType: 'quote',
      content: '数据完全由本地 SQLite 原生持久化，毫秒级响应，永不丢失。',
      sortOrder: 7,
      createdAt: Date.now() - 3000000,
      updatedAt: Date.now() - 3000000,
    },
  ],
  'page-feature-roadmap': [
    {
      id: 'b-road-1',
      pageId: 'page-feature-roadmap',
      blockType: 'h1',
      content: 'SelfWork 2026 功能迭代规划',
      sortOrder: 1,
      createdAt: Date.now() - 1800000,
      updatedAt: Date.now() - 1800000,
    },
    {
      id: 'b-road-2',
      pageId: 'page-feature-roadmap',
      blockType: 'p',
      content: '追踪与沉淀工作台核心模块的研发进度与长程演进目标。',
      sortOrder: 2,
      createdAt: Date.now() - 1700000,
      updatedAt: Date.now() - 1700000,
    },
  ],
};

export const INITIAL_COLLECTION_SCHEMA: CollectionSchemaMap = {
  col_title: {
    id: 'col_title',
    name: '任务名称',
    type: 'text',
    width: 260,
  },
  col_status: {
    id: 'col_status',
    name: '进度状态',
    type: 'status',
    width: 140,
    options: [
      { id: 'opt_todo', label: '待处理', color: 'slate' },
      { id: 'opt_prog', label: '进行中', color: 'sky' },
      { id: 'opt_done', label: '已完成', color: 'emerald' },
    ],
  },
  col_priority: {
    id: 'col_priority',
    name: '优先级',
    type: 'select',
    width: 120,
    options: [
      { id: 'p0', label: 'P0 紧急', color: 'rose' },
      { id: 'p1', label: 'P1 重要', color: 'amber' },
      { id: 'p2', label: 'P2 普通', color: 'slate' },
    ],
  },
  col_owner: {
    id: 'col_owner',
    name: '负责人',
    type: 'text',
    width: 120,
  },
  col_date: {
    id: 'col_date',
    name: '截止日期',
    type: 'date',
    width: 140,
  },
  col_verified: {
    id: 'col_verified',
    name: '机检通过',
    type: 'checkbox',
    width: 100,
  },
};

export const INITIAL_COLLECTIONS: DbCollection[] = [
  {
    id: 'col_roadmap_main',
    name: '2026 核心任务多维追踪表',
    description: '涵盖 SelfWork 启动器、脑图、待办便签与文档数据库等全矩阵任务',
    schema: INITIAL_COLLECTION_SCHEMA,
    createdAt: Date.now() - 7200000,
    updatedAt: Date.now() - 7200000,
  },
];

export const INITIAL_COLLECTION_ROWS: DbCollectionRow[] = [
  {
    id: 'row-1',
    collectionId: 'col_roadmap_main',
    cells: {
      col_title: '构建文档/多维表格数据库引擎',
      col_status: 'opt_prog',
      col_priority: 'p0',
      col_owner: 'Antigravity',
      col_date: '2026-11-15',
      col_verified: true,
    },
    sortOrder: 1,
    createdAt: Date.now() - 7200000,
    updatedAt: Date.now() - 7200000,
  },
  {
    id: 'row-2',
    collectionId: 'col_roadmap_main',
    cells: {
      col_title: 'Launcher 自动化脚本执行报文流',
      col_status: 'opt_done',
      col_priority: 'p1',
      col_owner: 'Administrator',
      col_date: '2026-11-12',
      col_verified: true,
    },
    sortOrder: 2,
    createdAt: Date.now() - 7100000,
    updatedAt: Date.now() - 7100000,
  },
  {
    id: 'row-3',
    collectionId: 'col_roadmap_main',
    cells: {
      col_title: '思维导图双向同步与分区分组',
      col_status: 'opt_done',
      col_priority: 'p2',
      col_owner: 'Team',
      col_date: '2026-11-10',
      col_verified: true,
    },
    sortOrder: 3,
    createdAt: Date.now() - 7000000,
    updatedAt: Date.now() - 7000000,
  },
];

// ==================== 文档页面服务 (DocPages) ====================

export async function loadDocPages(): Promise<DocPage[]> {
  try {
    const rawPages = await tauriInvoke<any[]>('db_get_all_pages');
    if (rawPages && rawPages.length > 0) {
      localStorage.setItem(DOC_PAGES_STORAGE_KEY, JSON.stringify(rawPages));
      return rawPages;
    }

    const isInit = localStorage.getItem(DOCS_INIT_KEY);
    if (isInit === 'true') {
      const saved = localStorage.getItem(DOC_PAGES_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
      return [];
    }

    // 首次播种
    for (const p of INITIAL_DOC_PAGES) {
      await tauriInvoke('db_save_page', { page: p });
    }
    localStorage.setItem(DOCS_INIT_KEY, 'true');
    localStorage.setItem(DOC_PAGES_STORAGE_KEY, JSON.stringify(INITIAL_DOC_PAGES));
    return INITIAL_DOC_PAGES;
  } catch (err) {
    // 降级为 localStorage
    const saved = localStorage.getItem(DOC_PAGES_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
    localStorage.setItem(DOC_PAGES_STORAGE_KEY, JSON.stringify(INITIAL_DOC_PAGES));
    return INITIAL_DOC_PAGES;
  }
}

export async function saveDocPage(page: DocPage): Promise<void> {
  try {
    await tauriInvoke('db_save_page', { page });
  } catch (err) {
    console.warn('[DocPage] Tauri IPC save failed, using localStorage fallback', err);
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
    console.warn('[DocPage] Tauri IPC delete failed, using localStorage fallback', err);
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

    // 播种种子数据
    if (INITIAL_DOC_BLOCKS[pageId]) {
      const seedBlocks = INITIAL_DOC_BLOCKS[pageId];
      await saveDocBlocks(pageId, seedBlocks);
      return seedBlocks;
    }

    return [];
  } catch (err) {
    const saved = localStorage.getItem(`${DOC_BLOCKS_PREFIX}${pageId}`);
    if (saved) return JSON.parse(saved);
    if (INITIAL_DOC_BLOCKS[pageId]) return INITIAL_DOC_BLOCKS[pageId];
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
    console.warn('[DocBlocks] Tauri IPC save failed, using localStorage fallback', err);
  }
  localStorage.setItem(`${DOC_BLOCKS_PREFIX}${pageId}`, JSON.stringify(blocks));
}

// ==================== 多维表格服务 (Collections) ====================

export async function loadDbCollections(): Promise<DbCollection[]> {
  try {
    const rawCols = await tauriInvoke<any[]>('db_get_all_collections');
    if (rawCols && rawCols.length > 0) {
      const formatted: DbCollection[] = rawCols.map((c) => ({
        id: c.id,
        pageId: c.pageId,
        name: c.name,
        description: c.description,
        schema: typeof c.schemaJson === 'string' ? JSON.parse(c.schemaJson) : c.schemaJson,
        format: c.formatJson ? JSON.parse(c.formatJson) : undefined,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      }));
      localStorage.setItem(DB_COLLECTIONS_STORAGE_KEY, JSON.stringify(formatted));
      return formatted;
    }

    const saved = localStorage.getItem(DB_COLLECTIONS_STORAGE_KEY);
    if (saved) return JSON.parse(saved);

    // 播种初始表格
    for (const c of INITIAL_COLLECTIONS) {
      await saveDbCollection(c);
    }
    // 播种数据行
    for (const r of INITIAL_COLLECTION_ROWS) {
      await saveDbCollectionRow(r);
    }
    return INITIAL_COLLECTIONS;
  } catch (err) {
    const saved = localStorage.getItem(DB_COLLECTIONS_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
    return INITIAL_COLLECTIONS;
  }
}

export async function saveDbCollection(col: DbCollection): Promise<void> {
  const payload = {
    id: col.id,
    pageId: col.pageId || null,
    name: col.name,
    description: col.description || null,
    schemaJson: JSON.stringify(col.schema),
    formatJson: col.format ? JSON.stringify(col.format) : null,
    createdAt: col.createdAt,
    updatedAt: col.updatedAt,
  };

  try {
    await tauriInvoke('db_save_collection', { collection: payload });
  } catch (err) {
    console.warn('[DbCollection] Tauri IPC save failed, using localStorage fallback', err);
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
    console.warn('[DbCollection] Tauri IPC delete failed, using localStorage fallback', err);
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

    if (collectionId === 'col_roadmap_main') {
      return INITIAL_COLLECTION_ROWS;
    }
    return [];
  } catch (err) {
    const saved = localStorage.getItem(`${DB_ROWS_PREFIX}${collectionId}`);
    if (saved) return JSON.parse(saved);
    if (collectionId === 'col_roadmap_main') return INITIAL_COLLECTION_ROWS;
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
    console.warn('[DbCollectionRow] Tauri IPC save failed, using localStorage fallback', err);
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
    console.warn('[DbCollectionRow] Tauri IPC delete failed, using localStorage fallback', err);
  }

  const rows = (await loadDbCollectionRows(collectionId)).filter((r) => r.id !== id);
  localStorage.setItem(`${DB_ROWS_PREFIX}${collectionId}`, JSON.stringify(rows));
}
