import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Download, Upload, FileText, Code2 } from 'lucide-react';
import { MindMapNode } from '../../types/mindmap.ts';

interface MindMapIOModalProps {
  isOpen: boolean;
  mode: 'import' | 'export';
  root: MindMapNode;
  onClose: () => void;
  onImportTree: (imported: MindMapNode) => void;
}

// 导出为层级 Markdown 大纲
export function treeToMarkdown(node: MindMapNode, depth = 0): string {
  let line = '';
  if (depth === 0) {
    line = `# ${node.title}\n`;
  } else if (depth === 1) {
    line = `## ${node.title}\n`;
  } else {
    const indent = '  '.repeat(depth - 2);
    line = `${indent}- ${node.title}\n`;
  }

  let res = line;
  if (node.children && node.children.length > 0) {
    for (const child of node.children) {
      res += treeToMarkdown(child, depth + 1);
    }
  }
  return res;
}

// 从 Markdown 大纲解析重构 MindMapNode 树
export function markdownToTree(mdText: string): MindMapNode {
  const lines = mdText.split('\n').filter((l) => l.trim().length > 0);
  if (lines.length === 0) {
    return { id: `node-${Date.now()}`, title: '中心主题', isRoot: true };
  }

  let root: MindMapNode = {
    id: `root-${Date.now()}`,
    title: '中心主题',
    isRoot: true,
    children: [],
  };

  const stack: Array<{ node: MindMapNode; depth: number }> = [];

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();

    // H1: 根节点
    if (trimmed.startsWith('# ')) {
      root.title = trimmed.slice(2).trim();
      stack.length = 0;
      stack.push({ node: root, depth: 0 });
      continue;
    }

    // H2: 主分支 (Depth 1)
    if (trimmed.startsWith('## ')) {
      const child: MindMapNode = {
        id: `node-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: trimmed.slice(3).trim(),
        children: [],
      };
      if (!root.children) root.children = [];
      root.children.push(child);

      stack.length = 0;
      stack.push({ node: root, depth: 0 });
      stack.push({ node: child, depth: 1 });
      continue;
    }

    // 列表项 (- 或 *)
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const title = trimmed.slice(2).trim();
      // 计算前导空格数判断深度
      const leadingSpaces = rawLine.search(/\S|$/);
      const listDepth = Math.max(2, 2 + Math.floor(leadingSpaces / 2));

      const child: MindMapNode = {
        id: `node-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title,
        children: [],
      };

      // 退栈找到当前节点的直接父级
      while (stack.length > 0 && stack[stack.length - 1].depth >= listDepth) {
        stack.pop();
      }

      const parentEntry = stack.length > 0 ? stack[stack.length - 1] : { node: root, depth: 0 };
      if (!parentEntry.node.children) parentEntry.node.children = [];
      parentEntry.node.children.push(child);
      stack.push({ node: child, depth: listDepth });
    }
  }

  return root;
}

export const MindMapIOModal: React.FC<MindMapIOModalProps> = ({
  isOpen,
  mode,
  root,
  onClose,
  onImportTree,
}) => {
  const [activeTab, setActiveTab] = useState<'markdown' | 'json'>('markdown');
  const [textValue, setTextValue] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 初始化模态框内容
  useEffect(() => {
    if (!isOpen) return;
    setErrorMsg(null);
    setCopied(false);

    if (mode === 'export') {
      if (activeTab === 'markdown') {
        setTextValue(treeToMarkdown(root));
      } else {
        setTextValue(JSON.stringify(root, null, 2));
      }
    } else {
      setTextValue('');
    }
  }, [isOpen, mode, activeTab, root]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // 容错降级
      const ta = document.createElement('textarea');
      ta.value = textValue;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleExecuteImport = () => {
    setErrorMsg(null);
    const trimmed = textValue.trim();
    if (!trimmed) {
      setErrorMsg('请输入需要导入的内容');
      return;
    }

    try {
      if (activeTab === 'json') {
        const parsed = JSON.parse(trimmed);
        if (!parsed || typeof parsed !== 'object' || !parsed.id || !parsed.title) {
          throw new Error('无效的 JSON 脑图树结构（必须包含 id 和 title 属性）');
        }
        onImportTree(parsed as MindMapNode);
        onClose();
      } else {
        const parsed = markdownToTree(trimmed);
        onImportTree(parsed);
        onClose();
      }
    } catch (e: any) {
      setErrorMsg(e?.message || '导入数据格式解析失败，请检查输入');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in select-none">
      <div className="w-full max-w-xl rounded-xl border border-white/[0.12] bg-[#0D1422] shadow-[0_8px_32px_rgba(0,0,0,0.7)] flex flex-col overflow-hidden max-h-[85vh]">
        {/* 顶部标题栏 */}
        <div className="h-11 px-4 flex items-center justify-between border-b border-border-default shrink-0 bg-white/[0.02]">
          <div className="flex items-center gap-2">
            {mode === 'export' ? (
              <Download className="w-4 h-4 text-brand-primary" />
            ) : (
              <Upload className="w-4 h-4 text-emerald-400" />
            )}
            <h3 className="text-xs font-semibold text-fg-primary tracking-tight font-mono">
              {mode === 'export' ? '导出思维导图' : '导入思维导图'}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-fg-muted hover:text-fg-primary hover:bg-white/[0.06] transition-colors tactile-btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 格式切换 Tabs */}
        <div className="px-4 pt-3 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1 bg-black/30 p-0.5 rounded-lg border border-white/[0.06]">
            <button
              type="button"
              onClick={() => setActiveTab('markdown')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium transition-colors tactile-btn ${
                activeTab === 'markdown'
                  ? 'bg-white/[0.12] text-fg-primary shadow-sm border border-white/[0.10]'
                  : 'text-fg-muted hover:text-fg-secondary'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Markdown 大纲</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('json')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium transition-colors tactile-btn ${
                activeTab === 'json'
                  ? 'bg-white/[0.12] text-fg-primary shadow-sm border border-white/[0.10]'
                  : 'text-fg-muted hover:text-fg-secondary'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>标准 JSON</span>
            </button>
          </div>

          {mode === 'export' && (
            <button
              type="button"
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium transition-colors tactile-btn ${
                copied
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-white/[0.06] hover:bg-white/[0.12] text-fg-primary border border-white/[0.10]'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '已复制' : '复制内容'}</span>
            </button>
          )}
        </div>

        {/* 文本输入/展示区 */}
        <div className="p-4 flex-1 flex flex-col min-h-0">
          {errorMsg && (
            <div className="mb-2 px-3 py-1.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-mono">
              {errorMsg}
            </div>
          )}

          <textarea
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            readOnly={mode === 'export'}
            placeholder={
              mode === 'import'
                ? activeTab === 'markdown'
                  ? '# 根主题\n## 分支 1\n  - 子分支 1.1\n## 分支 2'
                  : '{\n  "id": "root",\n  "title": "中心主题",\n  "children": []\n}'
                : ''
            }
            className="flex-1 w-full p-3 rounded-lg bg-black/40 border border-white/[0.08] text-xs font-mono text-fg-primary placeholder:text-fg-muted/40 focus:outline-none focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/30 resize-none select-text"
            rows={12}
          />
        </div>

        {/* 底部按钮栏 */}
        <div className="h-12 px-4 border-t border-border-default flex items-center justify-end gap-2 shrink-0 bg-white/[0.01]">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded text-xs text-fg-muted hover:text-fg-primary hover:bg-white/[0.06] transition-colors tactile-btn"
          >
            {mode === 'export' ? '关闭' : '取消'}
          </button>

          {mode === 'import' && (
            <button
              type="button"
              onClick={handleExecuteImport}
              className="px-3.5 py-1.5 rounded text-xs font-medium bg-brand-primary/20 hover:bg-brand-primary/30 text-brand-primary border border-brand-primary/40 transition-colors tactile-btn"
            >
              确认导入并覆盖画布
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
