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
    id: 'part_favorite',
    name: '最爱',
    type: 'favorite',
    sortOrder: 2,
    isCollapsed: false,
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000,
  },
  {
    id: 'part_workspace',
    name: 'Jr Forever 的工作空间 总部',
    type: 'workspace',
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

export const INITIAL_COLLECTIONS: DbCollection[] = [
  {
    id: 'col_plm_survey',
    partitionId: 'part_private',
    name: 'PLM流程调研',
    description: '涵盖 U2 项目管理、U3 研发管理、U1 需求管理全景调研',
    schema: PLM_COLLECTION_SCHEMA,
    views: [
      { id: 'v1', name: 'U2 项目管理全景调研表', type: 'table' },
      { id: 'v2', name: 'U3 研发管理全景调研表', type: 'table' },
      { id: 'v3', name: 'U1 需求管理全景调研表', type: 'table' },
    ],
    createdAt: Date.now() - 7200000,
    updatedAt: Date.now() - 7200000,
  },
];

export const INITIAL_COLLECTION_ROWS: DbCollectionRow[] = [
  {
    id: 'row-plm-1',
    collectionId: 'col_plm_survey',
    cells: {
      col_title: '第1问：项目负责人与执行责任 调查研发项目负责人的指定方式、执...',
      col_seq: 1,
      col_module: 'opt_u2',
      col_topic: 't_u2_01',
      col_status: 'st_partial',
      col_kw1: '项目负责人',
      col_kw2: '立项工程师',
      col_kw3: '多人协作',
      col_kw4: '主责任人',
      col_kw5: '进度管理',
      col_kw6: '交接留痕',
      col_notes: '1. 职责与台账记录机制：核实当前研发台账或系统表单中，项目主负责人与协同人员的具体职责是否有统一的结构化记录字段。\n2. 协作任务派发与追踪：核实跨人员/跨部门多人协作时，项目子任务分解与执行进度的集中追踪载体。',
    },
    sortOrder: 1,
    createdAt: Date.now() - 7200000,
    updatedAt: Date.now() - 7200000,
  },
  {
    id: 'row-plm-2',
    collectionId: 'col_plm_survey',
    cells: {
      col_title: '第2问：研发项目计划制定机制 调查研发项目立项后计划制定的规范...',
      col_seq: 2,
      col_module: 'opt_u2',
      col_topic: 't_u2_02',
      col_status: 'st_partial',
      col_kw1: '立项计划',
      col_kw2: '里程碑甘特',
      col_kw3: '基线审查',
      col_kw4: '资源排期',
    },
    sortOrder: 2,
    createdAt: Date.now() - 7100000,
    updatedAt: Date.now() - 7100000,
  },
  {
    id: 'row-plm-3',
    collectionId: 'col_plm_survey',
    cells: {
      col_title: '第3问：项目阶段目标与里程碑设置 调查研发项目执行过程中阶段目...',
      col_seq: 3,
      col_module: 'opt_u2',
      col_topic: 't_u2_02',
      col_status: 'st_partial',
      col_kw1: '阶段目标',
      col_kw2: '里程碑交付物',
    },
    sortOrder: 3,
    createdAt: Date.now() - 7000000,
    updatedAt: Date.now() - 7000000,
  },
  {
    id: 'row-plm-4',
    collectionId: 'col_plm_survey',
    cells: {
      col_title: '第4问：项目任务分解及分配机制 调查研发立项后具体工作任务的拆...',
      col_seq: 4,
      col_module: 'opt_u2',
      col_topic: 't_u2_03',
      col_status: 'st_partial',
      col_kw1: 'WBS工作分解',
      col_kw2: '执行责任矩阵',
    },
    sortOrder: 4,
    createdAt: Date.now() - 6900000,
    updatedAt: Date.now() - 6900000,
  },
  {
    id: 'row-plm-5',
    collectionId: 'col_plm_survey',
    cells: {
      col_title: '第5问：任务进度跟踪与完成确认 调查研发项目执行过程中任务进度...',
      col_seq: 5,
      col_module: 'opt_u2',
      col_topic: 't_u2_03',
      col_status: 'st_partial',
      col_kw1: '实时进度看板',
      col_kw2: '验收打卡',
    },
    sortOrder: 5,
    createdAt: Date.now() - 6800000,
    updatedAt: Date.now() - 6800000,
  },
  {
    id: 'row-plm-6',
    collectionId: 'col_plm_survey',
    cells: {
      col_title: '第6问：项目任务延期时的处理机制 调查研发任务执行延误时的原因...',
      col_seq: 6,
      col_module: 'opt_u2',
      col_topic: 't_u2_04',
      col_status: 'st_partial',
      col_kw1: '偏差告警',
      col_kw2: '纠偏策略',
    },
    sortOrder: 6,
    createdAt: Date.now() - 6700000,
    updatedAt: Date.now() - 6700000,
  },
];

// 对齐 Row 1 专属的页面正文 Block 数据 (完全对齐 Notion 截图 3)
export const INITIAL_ROW_PAGE_BLOCKS: Record<string, DocBlock[]> = {
  'row-plm-1': [
    {
      id: 'b-plm-1',
      pageId: 'row-plm-1',
      blockType: 'h1',
      content: '调查研发项目负责人的指定方式、执行职责分工以及跨人员协作机制:',
      sortOrder: 1,
      createdAt: Date.now() - 7200000,
      updatedAt: Date.now() - 7200000,
    },
    {
      id: 'b-plm-2',
      pageId: 'row-plm-1',
      blockType: 'bullet',
      content: '项目立项后，项目负责人通常由谁担任？承担哪些具体研发与进度管理职责？',
      sortOrder: 2,
      createdAt: Date.now() - 7100000,
      updatedAt: Date.now() - 7100000,
    },
    {
      id: 'b-plm-3',
      pageId: 'row-plm-1',
      blockType: 'bullet',
      content: '复杂项目涉及多名工程师或多部门协作时，是否设立明确的主责任人？',
      sortOrder: 3,
      createdAt: Date.now() - 7000000,
      updatedAt: Date.now() - 7000000,
    },
    {
      id: 'b-plm-4',
      pageId: 'row-plm-1',
      blockType: 'h2',
      content: '1. 职责与台账记录机制',
      sortOrder: 4,
      createdAt: Date.now() - 6900000,
      updatedAt: Date.now() - 6900000,
    },
    {
      id: 'b-plm-5',
      pageId: 'row-plm-1',
      blockType: 'quote',
      content: '核实当前研发台账或系统表单中，项目主负责人与协同人员的具体职责是否有统一的结构化记录字段。目前是通过口头沟通还是企微群确认？',
      sortOrder: 5,
      createdAt: Date.now() - 6800000,
      updatedAt: Date.now() - 6800000,
    },
    {
      id: 'b-plm-6',
      pageId: 'row-plm-1',
      blockType: 'h2',
      content: '2. 协作任务派发与追踪',
      sortOrder: 6,
      createdAt: Date.now() - 6700000,
      updatedAt: Date.now() - 6700000,
    },
    {
      id: 'b-plm-7',
      pageId: 'row-plm-1',
      blockType: 'todo',
      content: '核实跨人员/跨部门多人协作时，项目子任务分解与执行进度的集中追踪载体（目前是通过企业微信、线下表格还是口头沟通）。',
      properties: { checked: false },
      sortOrder: 7,
      createdAt: Date.now() - 6600000,
      updatedAt: Date.now() - 6600000,
    },
  ],
};

export const INITIAL_DOC_PAGES: DocPage[] = [
  {
    id: 'page_plm_readme',
    partitionId: 'part_private',
    title: 'PLM项目说明',
    icon: '📑',
    isFavorite: false,
    isArchived: false,
    createdAt: Date.now() - 8000000,
    updatedAt: Date.now() - 8000000,
  },
  {
    id: 'page_python_notes',
    partitionId: 'part_private',
    title: 'python白梳理',
    icon: '🐍',
    isFavorite: false,
    isArchived: false,
    createdAt: Date.now() - 7500000,
    updatedAt: Date.now() - 7500000,
  },
  {
    id: 'page_env_variables',
    partitionId: 'part_favorite',
    title: '01.2.2 环境变量 (Environment Variables)',
    icon: '📄',
    isFavorite: true,
    isArchived: false,
    createdAt: Date.now() - 9000000,
    updatedAt: Date.now() - 9000000,
  },
];

// ==================== 分区服务 (Partitions) ====================

export async function loadDocPartitions(): Promise<DocPartition[]> {
  try {
    const raw = await tauriInvoke<any[]>('db_get_all_partitions');
    if (raw && raw.length > 0) {
      localStorage.setItem(DOC_PARTITIONS_STORAGE_KEY, JSON.stringify(raw));
      return raw;
    }

    const saved = localStorage.getItem(DOC_PARTITIONS_STORAGE_KEY);
    if (saved) return JSON.parse(saved);

    // 播种默认分区
    for (const p of INITIAL_PARTITIONS) {
      await tauriInvoke('db_save_partition', { partition: p });
    }
    localStorage.setItem(DOC_PARTITIONS_STORAGE_KEY, JSON.stringify(INITIAL_PARTITIONS));
    return INITIAL_PARTITIONS;
  } catch (err) {
    const saved = localStorage.getItem(DOC_PARTITIONS_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
    return INITIAL_PARTITIONS;
  }
}

export async function saveDocPartition(partition: DocPartition): Promise<void> {
  try {
    await tauriInvoke('db_save_partition', { partition });
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

// ==================== 文档页面服务 (DocPages) ====================

export async function loadDocPages(): Promise<DocPage[]> {
  try {
    const rawPages = await tauriInvoke<any[]>('db_get_all_pages');
    if (rawPages && rawPages.length > 0) {
      const formatted: DocPage[] = rawPages.map((p) => ({
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

    const isInit = localStorage.getItem(DOCS_INIT_KEY);
    if (isInit === 'true') {
      const saved = localStorage.getItem(DOC_PAGES_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
      return [];
    }

    // 首次播种
    for (const p of INITIAL_DOC_PAGES) {
      await saveDocPage(p);
    }
    localStorage.setItem(DOCS_INIT_KEY, 'true');
    localStorage.setItem(DOC_PAGES_STORAGE_KEY, JSON.stringify(INITIAL_DOC_PAGES));
    return INITIAL_DOC_PAGES;
  } catch (err) {
    const saved = localStorage.getItem(DOC_PAGES_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
    localStorage.setItem(DOC_PAGES_STORAGE_KEY, JSON.stringify(INITIAL_DOC_PAGES));
    return INITIAL_DOC_PAGES;
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

    // 播种种子数据
    if (INITIAL_ROW_PAGE_BLOCKS[pageId]) {
      const seedBlocks = INITIAL_ROW_PAGE_BLOCKS[pageId];
      await saveDocBlocks(pageId, seedBlocks);
      return seedBlocks;
    }

    return [];
  } catch (err) {
    const saved = localStorage.getItem(`${DOC_BLOCKS_PREFIX}${pageId}`);
    if (saved) return JSON.parse(saved);
    if (INITIAL_ROW_PAGE_BLOCKS[pageId]) return INITIAL_ROW_PAGE_BLOCKS[pageId];
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
  try {
    const rawCols = await tauriInvoke<any[]>('db_get_all_collections');
    if (rawCols && rawCols.length > 0) {
      const formatted: DbCollection[] = rawCols.map((c) => ({
        id: c.id,
        pageId: c.pageId,
        partitionId: c.partitionId || 'part_private',
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

    // 播种初始表格与记录行
    for (const c of INITIAL_COLLECTIONS) {
      await saveDbCollection(c);
    }
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
    partitionId: col.partitionId || 'part_private',
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

    if (collectionId === 'col_plm_survey') {
      return INITIAL_COLLECTION_ROWS;
    }
    return [];
  } catch (err) {
    const saved = localStorage.getItem(`${DB_ROWS_PREFIX}${collectionId}`);
    if (saved) return JSON.parse(saved);
    if (collectionId === 'col_plm_survey') return INITIAL_COLLECTION_ROWS;
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
