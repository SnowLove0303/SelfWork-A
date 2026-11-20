import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  X,
  Check,
  Folder,
  Loader2,
} from 'lucide-react';
import { DocPage, DocPartition } from '../../types/docs.ts';
import { saveDocPage } from '../../services/docsDb.ts';
import { parseMarkdownToBlocks } from '../../services/markdownImport.ts';

interface DocBatchImporterProps {
  isOpen: boolean;
  onClose: () => void;
  partitions: DocPartition[];
  currentPartitionId?: string | null;
  onImportSuccess: (newPages: DocPage[]) => void;
}

interface SelectedFileInfo {
  file: File;
  name: string;
  size: number;
}

export const DocBatchImporter: React.FC<DocBatchImporterProps> = ({
  isOpen,
  onClose,
  partitions,
  currentPartitionId,
  onImportSuccess,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<SelectedFileInfo[]>([]);
  const [targetPartitionId, setTargetPartitionId] = useState<string>(
    currentPartitionId || 'part_private'
  );
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFilesChosen = (files: FileList | null) => {
    if (!files) return;
    const mdFiles: SelectedFileInfo[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (f.name.endsWith('.md') || f.name.endsWith('.markdown')) {
        mdFiles.push({
          file: f,
          name: f.name,
          size: f.size,
        });
      }
    }
    setSelectedFiles((prev) => [...prev, ...mdFiles]);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleStartImport = async () => {
    if (selectedFiles.length === 0 || isImporting) return;

    setIsImporting(true);
    setProgress(0);

    const newlyCreatedPages: DocPage[] = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const { file, name } = selectedFiles[i];
      const rawText = await file.text();
      const fallbackTitle = name.replace(/\.(md|markdown)$/i, '');
      const pageId = `page_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      const { title, icon, blocks } = parseMarkdownToBlocks(
        rawText,
        pageId,
        fallbackTitle
      );

      const newPage: DocPage = {
        id: pageId,
        partitionId: targetPartitionId,
        title: title || fallbackTitle,
        icon: icon || '📄',
        isFavorite: false,
        isArchived: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // 1. 持久化页面
      await saveDocPage(newPage);

      // 2. 持久化块数据
      localStorage.setItem(`selfwork_doc_blocks_${pageId}`, JSON.stringify(blocks));

      newlyCreatedPages.push(newPage);
      setProgress(Math.round(((i + 1) / selectedFiles.length) * 100));
    }

    setIsImporting(false);
    onImportSuccess(newlyCreatedPages);
    onClose();
  };

  const subPartitions = partitions.filter(
    (p) => p.parentId === 'part_private' || (p.parentId && p.parentId !== null)
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部标题栏 */}
        <div className="h-12 border-b border-white/10 px-4 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <Upload size={15} className="text-sky-400" />
            <span className="text-xs font-semibold text-slate-200">
              批量导入 Markdown
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-white/5"
          >
            <X size={15} />
          </button>
        </div>

        {/* 主体交互区 */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* 上传拖放区域 */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-white/10 hover:border-sky-500/40 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-white/[0.01] hover:bg-white/[0.03] group"
          >
            <Upload
              size={24}
              className="text-slate-500 group-hover:text-sky-400 transition-colors mb-2"
            />
            <span className="text-xs font-medium text-slate-300">
              点击选择或拖拽本地 Markdown 文件
            </span>
            <span className="text-[10px] text-slate-500 mt-1">
              支持多选 .md / .markdown 文件自动解析还原为多维块
            </span>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".md,.markdown"
              className="hidden"
              onChange={(e) => handleFilesChosen(e.target.files)}
            />
          </div>

          {/* 目标分区选择 */}
          <div className="flex items-center justify-between bg-black/30 p-2.5 rounded-lg border border-white/5">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Folder size={13} className="text-amber-400" />
              <span>导入目标分区:</span>
            </div>
            <select
              value={targetPartitionId}
              onChange={(e) => setTargetPartitionId(e.target.value)}
              className="bg-slate-800 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-sky-500/50"
            >
              <option value="part_private">私人 (根分区)</option>
              {subPartitions.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          {/* 已选文件列表 */}
          {selectedFiles.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                <span>待导入文件 ({selectedFiles.length})</span>
                <button
                  onClick={() => setSelectedFiles([])}
                  className="text-rose-400 hover:text-rose-300"
                >
                  清空列表
                </button>
              </div>
              <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                {selectedFiles.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 rounded bg-white/[0.02] border border-white/5 text-xs text-slate-300"
                  >
                    <div className="flex items-center gap-2 truncate min-w-0 mr-2">
                      <FileText size={13} className="text-sky-400 shrink-0" />
                      <span className="truncate">{f.name}</span>
                      <span className="text-[10px] text-slate-500 shrink-0">
                        ({Math.round(f.size / 1024)} KB)
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveFile(i)}
                      className="p-0.5 text-slate-500 hover:text-rose-400 rounded"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 导入进度条 */}
          {isImporting && (
            <div className="space-y-1 bg-black/40 p-3 rounded-lg border border-white/5">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Loader2 size={12} className="animate-spin text-sky-400" />
                  正在解析并持久化存库...
                </span>
                <span className="font-mono text-sky-400">{progress}%</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-sky-500 h-full transition-all duration-150"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* 底部按钮栏 */}
        <div className="h-12 border-t border-white/10 px-4 flex items-center justify-between bg-black/30 shrink-0">
          <span className="text-[10px] text-slate-500">
            高保真解析标题/代码/表格/任务/引用
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              disabled={isImporting}
              className="px-3 py-1.5 rounded text-slate-400 hover:text-white hover:bg-white/5 text-xs transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleStartImport}
              disabled={selectedFiles.length === 0 || isImporting}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                selectedFiles.length > 0 && !isImporting
                  ? 'bg-sky-500 hover:bg-sky-400 text-white'
                  : 'bg-white/5 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Check size={13} />
              <span>开始导入</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
