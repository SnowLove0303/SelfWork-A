import React from 'react';
import {
  Plus,
  CornerDownRight,
  Trash2,
  Maximize2,
  Download,
  Upload,
  GitFork,
} from 'lucide-react';

interface MindMapToolbarProps {
  selectedId: string | null;
  isRootSelected: boolean;
  onAddChild: () => void;
  onAddSibling: () => void;
  onDeleteSelected: () => void;
  onRecenter: () => void;
  onOpenIOModal: (mode: 'import' | 'export') => void;
}

export const MindMapToolbar: React.FC<MindMapToolbarProps> = ({
  selectedId,
  isRootSelected,
  onAddChild,
  onAddSibling,
  onDeleteSelected,
  onRecenter,
  onOpenIOModal,
}) => {
  return (
    <div className="h-11 px-3.5 border-b border-border-default bg-canvas-default/40 backdrop-blur-md flex items-center justify-between shrink-0 select-none min-w-0">
      {/* 左侧模块标示与操作按键组 */}
      <div className="flex items-center gap-1.5 min-w-0 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 mr-2 shrink-0">
          <GitFork className="w-4 h-4 text-brand-primary shrink-0" />
          <span className="text-xs font-semibold text-fg-primary tracking-tight font-mono shrink-0 whitespace-nowrap">
            思维导图
          </span>
        </div>

        <div className="h-4 w-px bg-white/[0.10] mx-1 shrink-0" />

        {/* 添加子节点 */}
        <button
          type="button"
          onClick={onAddChild}
          disabled={!selectedId}
          title="添加子分支 (快捷键: Tab)"
          className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary border border-brand-primary/30 disabled:opacity-30 disabled:pointer-events-none transition-colors tactile-btn shrink-0 whitespace-nowrap"
        >
          <CornerDownRight className="w-3.5 h-3.5 shrink-0" />
          <span>子分支</span>
          <kbd className="hidden sm:inline text-[9px] px-1 py-0.2 bg-black/30 rounded font-mono text-brand-primary/80">Tab</kbd>
        </button>

        {/* 添加同级节点 */}
        <button
          type="button"
          onClick={onAddSibling}
          disabled={!selectedId || isRootSelected}
          title="添加同级分支 (快捷键: Enter)"
          className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium bg-white/[0.05] hover:bg-white/[0.10] text-fg-primary border border-white/[0.10] disabled:opacity-30 disabled:pointer-events-none transition-colors tactile-btn shrink-0 whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5 shrink-0" />
          <span>同级分支</span>
          <kbd className="hidden sm:inline text-[9px] px-1 py-0.2 bg-black/30 rounded font-mono text-fg-muted">Enter</kbd>
        </button>

        {/* 删除节点 */}
        <button
          type="button"
          onClick={onDeleteSelected}
          disabled={!selectedId || isRootSelected}
          title="删除选中分支 (快捷键: Delete / Backspace)"
          className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium hover:bg-rose-500/20 text-fg-muted hover:text-rose-300 disabled:opacity-20 disabled:pointer-events-none transition-colors tactile-btn shrink-0 whitespace-nowrap"
        >
          <Trash2 className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden md:inline">删除</span>
        </button>
      </div>

      {/* 右侧：视图居中与导入导出 */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* 视口居中 */}
        <button
          type="button"
          onClick={onRecenter}
          title="重置居中视口"
          className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium text-fg-muted hover:text-fg-primary hover:bg-white/[0.06] border border-white/[0.06] transition-colors tactile-btn shrink-0 whitespace-nowrap"
        >
          <Maximize2 className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline">居中</span>
        </button>

        <div className="h-4 w-px bg-white/[0.10] mx-1 shrink-0" />

        {/* 导入模态框触发 */}
        <button
          type="button"
          onClick={() => onOpenIOModal('import')}
          title="导入思维导图 (JSON / Markdown大纲)"
          className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium text-fg-secondary hover:text-fg-primary hover:bg-white/[0.06] border border-white/[0.08] transition-colors tactile-btn shrink-0 whitespace-nowrap"
        >
          <Upload className="w-3.5 h-3.5 shrink-0" />
          <span>导入</span>
        </button>

        {/* 导出模态框触发 */}
        <button
          type="button"
          onClick={() => onOpenIOModal('export')}
          title="导出思维导图 (JSON / Markdown大纲)"
          className="flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium bg-white/[0.08] hover:bg-white/[0.14] text-fg-primary border border-white/[0.15] transition-colors tactile-btn shrink-0 whitespace-nowrap"
        >
          <Download className="w-3.5 h-3.5 shrink-0" />
          <span>导出</span>
        </button>
      </div>
    </div>
  );
};
