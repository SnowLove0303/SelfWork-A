import React, { useState } from 'react';
import {
  Folder,
  Trash2,
  Download,
  Star,
  X,
  ChevronUp,
} from 'lucide-react';
import { DocPage, DocPartition, DocBlock } from '../../types/docs.ts';
import { saveDocPage } from '../../services/docsDb.ts';
import { softDeleteDocPage } from '../../services/docTrash.ts';

interface DocBatchManagerProps {
  selectedIds: string[];
  pages: DocPage[];
  partitions: DocPartition[];
  onClearSelection: () => void;
  onPagesChange: (updatedPages: DocPage[]) => void;
}

export const DocBatchManager: React.FC<DocBatchManagerProps> = ({
  selectedIds,
  pages,
  partitions,
  onClearSelection,
  onPagesChange,
}) => {
  const [showPartitionMenu, setShowPartitionMenu] = useState(false);

  if (selectedIds.length === 0) return null;

  const selectedPages = pages.filter((p) => selectedIds.includes(p.id));

  // 1. 批量移动分区
  const handleBatchMovePartition = async (partitionId: string) => {
    const updated = pages.map((p) => {
      if (selectedIds.includes(p.id)) {
        return { ...p, partitionId, updatedAt: Date.now() };
      }
      return p;
    });
    onPagesChange(updated);
    for (const page of selectedPages) {
      await saveDocPage({ ...page, partitionId, updatedAt: Date.now() });
    }
    setShowPartitionMenu(false);
    onClearSelection();
  };

  // 2. 批量移入废纸篓 (软删除)
  const handleBatchSoftDelete = async () => {
    let currentPages = [...pages];
    for (const id of selectedIds) {
      currentPages = await softDeleteDocPage(id);
    }
    onPagesChange(currentPages);
    onClearSelection();
  };

  // 3. 批量收藏
  const handleBatchFavorite = async (isFavorite: boolean) => {
    const updated = pages.map((p) => {
      if (selectedIds.includes(p.id)) {
        return { ...p, isFavorite, updatedAt: Date.now() };
      }
      return p;
    });
    onPagesChange(updated);
    for (const page of selectedPages) {
      await saveDocPage({ ...page, isFavorite, updatedAt: Date.now() });
    }
    onClearSelection();
  };

  // 4. 批量导出为 Markdown
  const handleBatchExportMarkdown = () => {
    for (const page of selectedPages) {
      const blocksRaw = localStorage.getItem(`selfwork_doc_blocks_${page.id}`);
      let blocks: DocBlock[] = [];
      if (blocksRaw) {
        try {
          blocks = JSON.parse(blocksRaw);
        } catch (_) {}
      }

      let md = `# ${page.title || '未命名笔记'}\n\n`;
      for (const block of blocks) {
        const text = (block.content || '').replace(/<[^>]+>/g, '');
        switch (block.blockType) {
          case 'h1':
            md += `# ${text}\n\n`;
            break;
          case 'h2':
            md += `## ${text}\n\n`;
            break;
          case 'h3':
            md += `### ${text}\n\n`;
            break;
          case 'todo':
            md += `- [${block.properties?.checked ? 'x' : ' '}] ${text}\n`;
            break;
          case 'bullet':
            md += `- ${text}\n`;
            break;
          case 'numbered':
            md += `1. ${text}\n`;
            break;
          case 'quote':
            md += `> ${text}\n\n`;
            break;
          case 'code':
            md += `\`\`\`${block.properties?.language || ''}\n${block.properties?.code || text}\n\`\`\`\n\n`;
            break;
          case 'divider':
            md += `---\n\n`;
            break;
          case 'table':
            if (block.properties?.rows) {
              const rows = block.properties.rows as string[][];
              if (rows.length > 0) {
                md += '| ' + rows[0].join(' | ') + ' |\n';
                md += '| ' + rows[0].map(() => '---').join(' | ') + ' |\n';
                for (let i = 1; i < rows.length; i++) {
                  md += '| ' + rows[i].join(' | ') + ' |\n';
                }
                md += '\n';
              }
            }
            break;
          default:
            if (text) md += `${text}\n\n`;
            break;
        }
      }

      // 触发单个文件下载
      const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${page.title || 'doc'}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const subPartitions = partitions.filter(
    (p) => p.parentId === 'part_private' || (p.parentId && p.parentId !== null)
  );

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/90 backdrop-blur-xl border border-white/10 shadow-2xl rounded-xl px-4 py-2.5 flex items-center gap-3 text-xs animate-in slide-in-from-bottom-3 duration-150 select-none">
      <div className="flex items-center gap-2 border-r border-white/10 pr-3">
        <span className="font-medium text-white">已选 {selectedIds.length} 篇</span>
      </div>

      {/* 批量移动分区 */}
      <div className="relative">
        <button
          onClick={() => setShowPartitionMenu(!showPartitionMenu)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
        >
          <Folder size={13} className="text-amber-400" />
          <span>移动到</span>
          <ChevronUp size={11} className={`transition-transform ${showPartitionMenu ? '' : 'rotate-180'}`} />
        </button>

        {showPartitionMenu && (
          <div className="absolute bottom-full mb-2 left-0 w-44 bg-slate-900 border border-white/10 rounded-lg shadow-xl p-1.5 space-y-0.5 text-xs">
            <div className="text-[10px] text-slate-500 px-2 py-0.5 font-medium">目标分区</div>
            <button
              onClick={() => handleBatchMovePartition('part_private')}
              className="w-full text-left px-2 py-1 rounded hover:bg-white/10 text-slate-300 hover:text-white flex items-center gap-1.5 truncate"
            >
              <Folder size={12} className="text-sky-400 shrink-0" />
              <span>私人 (根分区)</span>
            </button>
            {subPartitions.map((sub) => (
              <button
                key={sub.id}
                onClick={() => handleBatchMovePartition(sub.id)}
                className="w-full text-left px-2 py-1 rounded hover:bg-white/10 text-slate-300 hover:text-white flex items-center gap-1.5 truncate"
              >
                <Folder size={12} className="text-amber-400 shrink-0" />
                <span className="truncate">{sub.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 批量收藏 */}
      <button
        onClick={() => handleBatchFavorite(true)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded hover:bg-white/10 text-slate-300 hover:text-amber-300 transition-colors"
        title="设为收藏"
      >
        <Star size={13} className="text-amber-400" />
        <span>收藏</span>
      </button>

      {/* 批量导出 Markdown */}
      <button
        onClick={handleBatchExportMarkdown}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded hover:bg-white/10 text-slate-300 hover:text-emerald-300 transition-colors"
        title="批量导出为 Markdown 文件"
      >
        <Download size={13} className="text-emerald-400" />
        <span>导出 MD</span>
      </button>

      {/* 批量移入废纸篓 */}
      <button
        onClick={handleBatchSoftDelete}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 transition-colors"
        title="批量移入废纸篓"
      >
        <Trash2 size={13} className="text-rose-400" />
        <span>移入废纸篓</span>
      </button>

      {/* 取消选择 */}
      <button
        onClick={onClearSelection}
        className="p-1 text-slate-500 hover:text-slate-200 rounded hover:bg-white/10 ml-1"
        title="取消全选"
      >
        <X size={14} />
      </button>
    </div>
  );
};
