import React from 'react';
import { DOC_TEMPLATES, DocTemplateDefinition } from '../../../services/docTemplates.ts';
import { Sparkles, ArrowRight, X } from 'lucide-react';

interface DocTemplatePickerProps {
  onSelectTemplate: (template: DocTemplateDefinition) => void;
  onDismiss?: () => void;
}

/**
 * 空白文档快速模板选择卡片组 (DocTemplatePicker)
 * - 4 款工业级技术模板 (RFC、Bug 复盘、周报日志、核心知识点)
 * - 现代暗黑微光卡片设计，支持一键注入完整富文本块流
 */
export const DocTemplatePicker: React.FC<DocTemplatePickerProps> = ({
  onSelectTemplate,
  onDismiss,
}) => {
  return (
    <div className="my-6 p-6 rounded-2xl bg-gradient-to-b from-white/[0.03] to-white/[0.01] border border-white/10 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-200 select-none">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/5">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
          <Sparkles size={16} className="text-sky-400" />
          <span>从开箱即用技术模板起步</span>
          <span className="text-[11px] font-normal text-slate-500">
            (亦可直接在下方空白处输入内容自由创作)
          </span>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1 hover:bg-white/10 text-slate-500 hover:text-slate-300 rounded-lg transition-colors"
            title="关闭模板推荐"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {DOC_TEMPLATES.map((tmpl) => (
          <div
            key={tmpl.id}
            onClick={() => onSelectTemplate(tmpl)}
            className="group relative p-4 rounded-xl bg-black/30 hover:bg-white/[0.05] border border-white/10 hover:border-sky-500/40 shadow-sm transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl leading-none">{tmpl.icon}</span>
                  <span className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
                    {tmpl.name}
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/10 font-mono">
                  {tmpl.category}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-3 line-clamp-2">
                {tmpl.description}
              </p>
            </div>

            <div className="flex items-center justify-end text-xs font-medium text-sky-400 group-hover:text-sky-300 transition-colors gap-1 pt-1 border-t border-white/[0.04]">
              <span>载入此模板</span>
              <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
