import { DocPage } from '../types/docs.ts';
import { loadDocPages, saveDocPage, deleteDocPage } from './docsDb.ts';

/**
 * 将指定页面软删除移入废纸篓
 */
export async function softDeleteDocPage(pageId: string): Promise<DocPage[]> {
  const pages = await loadDocPages();
  const target = pages.find((p) => p.id === pageId);
  if (!target) return pages;

  const updated: DocPage = {
    ...target,
    isDeleted: true,
    deletedAt: Date.now(),
    updatedAt: Date.now(),
  };

  await saveDocPage(updated);
  return pages.map((p) => (p.id === pageId ? updated : p));
}

/**
 * 从废纸篓还原页面
 */
export async function restoreDocPage(pageId: string): Promise<DocPage[]> {
  const pages = await loadDocPages();
  const target = pages.find((p) => p.id === pageId);
  if (!target) return pages;

  const updated: DocPage = {
    ...target,
    isDeleted: false,
    deletedAt: undefined,
    updatedAt: Date.now(),
  };

  await saveDocPage(updated);
  return pages.map((p) => (p.id === pageId ? updated : p));
}

/**
 * 从废纸篓彻底粉碎物理删除单篇页面
 */
export async function permanentlyDeleteDocPage(pageId: string): Promise<DocPage[]> {
  await deleteDocPage(pageId);
  const pages = await loadDocPages();
  return pages.filter((p) => p.id !== pageId);
}

/**
 * 一键清空废纸篓中所有已软删除的页面
 */
export async function emptyDocTrash(trashPages: DocPage[]): Promise<DocPage[]> {
  for (const page of trashPages) {
    await deleteDocPage(page.id);
  }
  const pages = await loadDocPages();
  return pages.filter((p) => !p.isDeleted);
}

/**
 * 计算 30 天保留期的剩余天数
 */
export function getTrashRemainingDays(deletedAt?: number): number {
  if (!deletedAt) return 30;
  const elapsedDays = Math.floor((Date.now() - deletedAt) / 86400000);
  return Math.max(0, 30 - elapsedDays);
}
