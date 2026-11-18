import React, { useEffect, useState, useRef } from 'react';
import mermaid from 'mermaid';
import { AlertCircle, Code, Copy, Check, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface MermaidPreviewProps {
  code: string;
  onSwitchToCode?: () => void;
}

let isMermaidInitialized = false;

function ensureMermaidInit() {
  if (isMermaidInitialized) return;
  mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    securityLevel: 'loose',
    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
    themeVariables: {
      darkMode: true,
      background: 'transparent',
      mainBkg: '#161b22',
      nodeBorder: '#38bdf8',
      clusterBkg: '#0d1117',
      clusterBorder: '#30363d',
      defaultLinkColor: '#7dd3fc',
      titleColor: '#f0f6fc',
      edgeLabelBackground: '#161b22',
      actorBkg: '#161b22',
      actorBorder: '#38bdf8',
      actorTextColor: '#f0f6fc',
      actorLineColor: '#58a6ff',
      signalColor: '#38bdf8',
      signalTextColor: '#f0f6fc',
      labelBoxBkgColor: '#161b22',
      labelBoxBorderColor: '#38bdf8',
      labelTextColor: '#f0f6fc',
      loopTextColor: '#f0f6fc',
      noteBorderColor: '#f59e0b',
      noteBkgColor: '#161b22',
      noteTextColor: '#fbbf24',
    },
  });
  isMermaidInitialized = true;
}

export const MermaidPreview: React.FC<MermaidPreviewProps> = ({
  code,
  onSwitchToCode,
}) => {
  const [svgHtml, setSvgHtml] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [zoom, setZoom] = useState(1);
  const renderSeqRef = useRef(0);

  useEffect(() => {
    ensureMermaidInit();
    const cleanCode = code.trim();
    if (!cleanCode) {
      setSvgHtml('');
      setErrorMsg(null);
      return;
    }

    const currentSeq = ++renderSeqRef.current;
    const uniqueId = `mermaid-svg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    // 异步渲染并捕获语法异常
    mermaid
      .render(uniqueId, cleanCode)
      .then((res) => {
        if (currentSeq === renderSeqRef.current) {
          setSvgHtml(res.svg);
          setErrorMsg(null);
        }
      })
      .catch((err) => {
        if (currentSeq === renderSeqRef.current) {
          // 清理 mermaid 插入的临时错误节点
          const errEl = document.getElementById(uniqueId);
          if (errEl) errEl.remove();
          const dErrEl = document.getElementById('d' + uniqueId);
          if (dErrEl) dErrEl.remove();

          const rawMsg = err?.message || String(err);
          // 剔除 Mermaid 默认的长段口水提示
          const shortMsg = rawMsg
            .replace(/Parse error on line \d+:/, (m: string) => m)
            .split('\n')[0]
            .trim();
          setErrorMsg(shortMsg || 'Mermaid 语法格式异常，无法解析为图表');
          setSvgHtml('');
        }
      });
  }, [code]);

  const handleCopySvg = () => {
    if (!svgHtml) return;
    navigator.clipboard.writeText(svgHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (errorMsg) {
    return (
      <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-b-xl text-rose-300 text-xs flex flex-col gap-2">
        <div className="flex items-center gap-2 font-medium">
          <AlertCircle size={14} className="text-rose-400 shrink-0" />
          <span>Mermaid 语法解析提示</span>
        </div>
        <div className="text-[11px] font-mono text-rose-400/90 bg-black/30 p-2 rounded-lg border border-rose-500/20 break-words whitespace-pre-wrap">
          {errorMsg}
        </div>
        {onSwitchToCode && (
          <button
            type="button"
            onClick={onSwitchToCode}
            className="self-start flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 hover:underline mt-1 cursor-pointer"
          >
            <Code size={12} />
            <span>切换至「⚙️ 源码」修改</span>
          </button>
        )}
      </div>
    );
  }

  if (!svgHtml) {
    return (
      <div className="p-6 text-center text-xs text-slate-500 rounded-b-xl bg-[#0d1117]/60">
        图表内容为空，请在源码模式下输入 Mermaid 图表定义
      </div>
    );
  }

  return (
    <div className="relative group/diagram bg-[#0d1117]/90 rounded-b-xl border-t border-white/[0.06] overflow-hidden flex flex-col items-center p-4">
      {/* 悬停微型控制胶囊 */}
      <div className="absolute top-2 right-2 opacity-0 group-hover/diagram:opacity-100 transition-opacity flex items-center gap-1 bg-[#161b22]/90 border border-white/10 rounded-lg p-1 text-[10px] text-slate-400 shadow-xl z-10 backdrop-blur-md">
        <button
          type="button"
          onClick={() => setZoom((z) => Math.max(0.5, Number((z - 0.1).toFixed(1))))}
          className="p-1 hover:bg-white/10 hover:text-white rounded"
          title="缩小"
        >
          <ZoomOut size={11} />
        </button>
        <span className="font-mono px-1">{Math.round(zoom * 100)}%</span>
        <button
          type="button"
          onClick={() => setZoom((z) => Math.min(2.0, Number((z + 0.1).toFixed(1))))}
          className="p-1 hover:bg-white/10 hover:text-white rounded"
          title="放大"
        >
          <ZoomIn size={11} />
        </button>
        <button
          type="button"
          onClick={() => setZoom(1)}
          className="p-1 hover:bg-white/10 hover:text-white rounded"
          title="重置缩放"
        >
          <RotateCcw size={11} />
        </button>
        <div className="w-px h-3 bg-white/10" />
        <button
          type="button"
          onClick={handleCopySvg}
          className="flex items-center gap-1 px-1.5 py-0.5 hover:bg-white/10 hover:text-white rounded"
          title="复制矢量 SVG"
        >
          {copied ? (
            <>
              <Check size={11} className="text-emerald-400" />
              <span className="text-emerald-400">已复制</span>
            </>
          ) : (
            <>
              <Copy size={11} />
              <span>复制 SVG</span>
            </>
          )}
        </button>
      </div>

      {/* SVG 矢量画布容器 */}
      <div
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'top center',
          transition: 'transform 100ms ease-out',
        }}
        className="w-full max-w-full overflow-x-auto flex justify-center items-center py-2 [&>svg]:max-w-full [&>svg]:h-auto"
        dangerouslySetInnerHTML={{ __html: svgHtml }}
      />
    </div>
  );
};
