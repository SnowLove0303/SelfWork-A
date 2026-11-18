import React, { useState, useMemo, useRef, useEffect } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { DocBlock } from '../../../types/docs.ts';
import {
  Sigma,
  Code,
  Check,
  Copy,
  Trash2,
  CheckCircle2,
} from 'lucide-react';

interface MathBlockProps {
  block: DocBlock;
  onUpdate: (
    content: string,
    blockType?: any,
    properties?: Record<string, any>,
    isStructural?: boolean
  ) => void;
  onDelete: () => void;
}

const DEFAULT_MATH_EXAMPLE = 'f(x) = \\int_{-\\infty}^\\infty \\hat f(\\xi)\\,e^{2 \\pi i \\xi x}\\,d\\xi';

export const MathBlock: React.FC<MathBlockProps> = ({
  block,
  onUpdate,
  onDelete,
}) => {
  const currentLatex = block.content || (block.properties?.latex as string) || DEFAULT_MATH_EXAMPLE;
  const [isEditing, setIsEditing] = useState(false);
  const [latexInput, setLatexInput] = useState(currentLatex);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setLatexInput(block.content || (block.properties?.latex as string) || DEFAULT_MATH_EXAMPLE);
  }, [block.content, block.properties]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(
        textareaRef.current.value.length,
        textareaRef.current.value.length
      );
    }
  }, [isEditing]);

  // KaTeX 高性能服务端/本地即时渲染
  const renderedHtml = useMemo(() => {
    try {
      return katex.renderToString(latexInput || 'E = mc^2', {
        displayMode: true,
        throwOnError: false,
      });
    } catch (err: any) {
      return `<div class="text-rose-400 text-xs font-mono p-2 bg-rose-500/10 rounded">KaTeX 语法错误: ${err?.message || ''}</div>`;
    }
  }, [latexInput]);

  const handleCopyLatex = () => {
    navigator.clipboard.writeText(latexInput);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleFinishEditing = () => {
    setIsEditing(false);
    onUpdate(
      latexInput,
      'math',
      { ...block.properties, latex: latexInput },
      true
    );
  };

  if (isEditing) {
    return (
      <div className="w-full my-2 bg-slate-950/90 border border-violet-500/40 rounded-xl p-3 shadow-2xl flex flex-col gap-2.5 animate-in fade-in zoom-in-95 duration-100">
        {/* 编辑器 Header */}
        <div className="flex items-center justify-between text-xs text-slate-300 border-b border-white/[0.08] pb-2 select-none">
          <div className="flex items-center gap-1.5 font-medium text-violet-300">
            <Sigma size={14} className="text-violet-400" />
            <span>LaTeX 数学公式编辑</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500">
              Shift + Enter 完成 | Esc 退出
            </span>
            <button
              type="button"
              onClick={handleFinishEditing}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 text-violet-200 border border-violet-500/30 text-xs font-medium transition-colors cursor-pointer"
            >
              <CheckCircle2 size={12} className="text-violet-300" />
              <span>完成</span>
            </button>
          </div>
        </div>

        {/* 源码输入框 */}
        <textarea
          ref={textareaRef}
          value={latexInput}
          onChange={(e) => {
            setLatexInput(e.target.value);
            onUpdate(
              e.target.value,
              'math',
              { ...block.properties, latex: e.target.value },
              false
            );
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.shiftKey) {
              e.preventDefault();
              handleFinishEditing();
            } else if (e.key === 'Escape') {
              e.preventDefault();
              handleFinishEditing();
            }
          }}
          placeholder="输入 LaTeX 数学公式表达式，例如 \frac{a}{b} 或 \sum_{i=1}^n x_i ..."
          rows={3}
          className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 font-mono text-xs text-slate-100 placeholder-slate-600 outline-none focus:border-violet-500/60 transition-colors resize-y leading-relaxed"
        />

        {/* 即时渲染预览区 */}
        <div className="border-t border-white/[0.06] pt-2">
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            实时公式预览
          </div>
          <div
            className="w-full overflow-x-auto py-2 px-3 bg-black/20 rounded-lg flex justify-center text-slate-100 [&_.katex-display]:my-0"
            dangerouslySetInnerHTML={{ __html: renderedHtml }}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      onDoubleClick={() => setIsEditing(true)}
      className="group/math relative w-full my-2 bg-slate-950/60 border border-white/10 hover:border-violet-500/40 rounded-xl p-4 shadow-lg flex flex-col items-center justify-center transition-all cursor-pointer"
      title="双击进入公式源码编辑"
    >
      {/* 悬停微型工具胶囊 */}
      <div className="absolute top-2 right-2 opacity-0 group-hover/math:opacity-100 transition-opacity flex items-center gap-1 bg-[#161b22]/90 border border-white/10 rounded-lg p-1 text-[11px] text-slate-400 shadow-xl z-10 backdrop-blur-md select-none">
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="flex items-center gap-1 px-1.5 py-0.5 hover:bg-white/10 hover:text-white rounded"
          title="编辑 LaTeX 源码"
        >
          <Code size={11} className="text-violet-400" />
          <span>编辑</span>
        </button>
        <div className="w-px h-3 bg-white/10" />
        <button
          type="button"
          onClick={handleCopyLatex}
          className="flex items-center gap-1 px-1.5 py-0.5 hover:bg-white/10 hover:text-white rounded"
          title="复制 LaTeX 源码"
        >
          {copied ? (
            <>
              <Check size={11} className="text-emerald-400" />
              <span className="text-emerald-400">已复制</span>
            </>
          ) : (
            <>
              <Copy size={11} />
              <span>复制</span>
            </>
          )}
        </button>
        <div className="w-px h-3 bg-white/10" />
        <button
          type="button"
          onClick={onDelete}
          className="p-1 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 rounded"
          title="删除公式块"
        >
          <Trash2 size={11} />
        </button>
      </div>

      {/* 公式居中呈现 */}
      <div
        className="w-full overflow-x-auto flex justify-center text-slate-100 py-1 select-text [&_.katex-display]:my-0"
        dangerouslySetInnerHTML={{ __html: renderedHtml }}
      />
    </div>
  );
};
