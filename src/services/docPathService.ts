import { DocBlock } from '../types/docs.ts';
import { exportBlocksToMarkdown } from './markdownExport.ts';
import { loadDocBlocks } from './docsDb.ts';

export type DocsPathMode = 'local' | 'url';

const STORAGE_PATH_MODE_KEY = 'selfwork_docs_path_mode';

/**
 * 安全调用 Tauri IPC
 */
async function tauriInvoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  const { invoke } = await import('@tauri-apps/api/core');
  return await invoke<T>(cmd, args);
}

/**
 * 获取当前文档路径计算模式
 * 桌面端默认强制使用 'local' 物理路径，面向 MCP+AI；未来上线部署后可配置为 'url'
 */
export function getDocsPathMode(): DocsPathMode {
  const saved = localStorage.getItem(STORAGE_PATH_MODE_KEY);
  if (saved === 'url' || saved === 'local') {
    return saved;
  }
  // 环境变量覆盖支持
  const envMode = import.meta.env.VITE_DOCS_PATH_MODE;
  if (envMode === 'url' || envMode === 'local') {
    return envMode;
  }
  return 'local';
}

/**
 * 切换文档路径模式（'local' 物理文件 或 'url' 在线链接）
 */
export function setDocsPathMode(mode: DocsPathMode): void {
  localStorage.setItem(STORAGE_PATH_MODE_KEY, mode);
}

export interface ResolveDocPathOptions {
  pageId: string;
  title: string;
  icon?: string;
  blocks?: DocBlock[];
  forceMode?: DocsPathMode;
}

export interface CopyDocPathResult {
  path: string;
  mode: DocsPathMode;
  isPhysicalSynced: boolean;
}

/**
 * 解析并生成面向机器/AI可直接寻址的文档物理路径或上线 URL
 */
export async function resolveDocumentResourcePath(
  options: ResolveDocPathOptions
): Promise<CopyDocPathResult> {
  const { pageId, title, icon, forceMode } = options;
  let blocks = options.blocks;
  const mode = forceMode || getDocsPathMode();

  if (mode === 'url') {
    const baseUrl =
      import.meta.env.VITE_DOCS_URL_BASE ||
      (typeof window !== 'undefined' ? `${window.location.origin}/#` : 'http://localhost:1420/#');
    const cleanBase = baseUrl.replace(/\/+$/, '');
    const urlPath = `${cleanBase}/docs/${encodeURIComponent(pageId)}`;
    return {
      path: urlPath,
      mode: 'url',
      isPhysicalSynced: false,
    };
  }

  // 默认：本地物理绝对路径模式（面向 MCP+AI）
  let isPhysicalSynced = false;
  let absolutePath = '';

  try {
    // 若调用方未显式传入 blocks，自动从数据库/缓存按需拉取
    if (!blocks || blocks.length === 0) {
      blocks = await loadDocBlocks(pageId);
    }

    if (blocks && blocks.length > 0) {
      // 1. 将 blocks 转换为标准无损 Markdown
      const markdown = exportBlocksToMarkdown(title, icon, blocks);
      // 2. 调用 Rust 后端原子写入 %APPDATA%\SelfWork\documents\${safeTitle}.md
      absolutePath = await tauriInvoke<string>('db_sync_doc_markdown_file', {
        pageId,
        title,
        content: markdown,
      });
      isPhysicalSynced = true;
    } else {
      // 若当前暂无块，获取预期本地绝对路径
      absolutePath = await tauriInvoke<string>('db_get_doc_local_path', {
        pageId,
        title,
      });
    }
  } catch (err) {
    console.warn('[docPathService] Tauri IPC 物理落盘不可用，使用标准本地路径兜底', err);
    // 浏览器或无 IPC 环境下兜底绝对路径示意
    const safeTitle = (title || 'untitled_doc').replace(/[\\/:*?"<>|]/g, '_').trim();
    absolutePath = `C:\\Users\\AppData\\Roaming\\SelfWork\\documents\\${safeTitle || pageId}.md`;
  }

  return {
    path: absolutePath,
    mode: 'local',
    isPhysicalSynced,
  };
}

/**
 * 一键复制文档资源路径到剪贴板
 */
export async function copyDocumentResourcePath(
  options: ResolveDocPathOptions
): Promise<CopyDocPathResult> {
  const result = await resolveDocumentResourcePath(options);
  if (navigator?.clipboard?.writeText) {
    await navigator.clipboard.writeText(result.path);
  }
  return result;
}
