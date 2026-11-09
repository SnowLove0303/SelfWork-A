import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal,
  Copy,
  Trash2,
  ArrowDown,
  Check,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  Clock,
  Sparkles,
} from 'lucide-react';
import { TelemetryLogEntry, TelemetryLogLevel } from '../../types/launcher.ts';

interface TelemetryPanelProps {
  logs: TelemetryLogEntry[];
  onClearLogs: () => void;
}

export const TelemetryPanel: React.FC<TelemetryPanelProps> = ({ logs, onClearLogs }) => {
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [filterLevel, setFilterLevel] = useState<'all' | TelemetryLogLevel>('all');
  const [copied, setCopied] = useState<boolean>(false);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // 自动滚动到最新日志行
  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const filteredLogs = logs.filter((log) => {
    if (filterLevel === 'all') return true;
    return log.level === filterLevel;
  });

  const handleCopy = async () => {
    if (logs.length === 0) return;
    const text = logs
      .map((l) => `[${l.timestamp}] [${l.level.toUpperCase()}] [${l.target}] ${l.message}`)
      .join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_e) {
      // 兼容非安全上下文
    }
  };

  const getLevelBadge = (level: TelemetryLogLevel) => {
    switch (level) {
      case 'info':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] bg-sky-500/15 text-sky-400 border border-sky-500/20">
            <Info className="w-2.5 h-2.5" />
            INFO
          </span>
        );
      case 'success':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-2.5 h-2.5" />
            SUCCESS
          </span>
        );
      case 'warn':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-2.5 h-2.5" />
            WARN
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] bg-rose-500/15 text-rose-400 border border-rose-500/20">
            <AlertCircle className="w-2.5 h-2.5" />
            ERROR
          </span>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#070a0f]/90 backdrop-blur-xl border-l border-white/[0.08] select-text">
      {/* 终端顶部操作栏 */}
      <div className="shrink-0 h-11 px-3.5 border-b border-white/[0.08] flex items-center justify-between gap-2 bg-black/40">
        <div className="flex items-center gap-2 min-w-0">
          <Terminal className="w-4 h-4 text-brand-primary shrink-0" />
          <span className="text-xs font-semibold text-fg-primary tracking-tight font-mono whitespace-nowrap">
            执行报文控制台
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-fg-muted">
            {logs.length} 行
          </span>
        </div>

        {/* 控制按钮组 */}
        <div className="flex items-center gap-1.5 shrink-0 select-none">
          {/* 日志过滤选择 */}
          <div className="flex items-center gap-1 bg-white/[0.04] p-0.5 rounded border border-white/[0.06] text-[10px]">
            {(['all', 'info', 'success', 'warn', 'error'] as const).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setFilterLevel(lvl)}
                className={`px-1.5 py-0.5 rounded uppercase font-mono transition-colors ${
                  filterLevel === lvl
                    ? 'bg-white/[0.12] text-fg-primary font-bold'
                    : 'text-fg-muted hover:text-fg-secondary'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          {/* 自动滚屏开关 */}
          <button
            type="button"
            onClick={() => setAutoScroll((prev) => !prev)}
            title={autoScroll ? '已开启实时自动滚屏 (点击暂停)' : '已锁定滚屏 (点击开启)'}
            className={`h-7 px-2 rounded border text-[11px] font-mono flex items-center gap-1 transition-colors tactile-btn ${
              autoScroll
                ? 'bg-brand-primary/10 border-brand-primary/30 text-brand-primary'
                : 'bg-white/[0.04] border-white/[0.08] text-fg-muted hover:text-fg-primary'
            }`}
          >
            <ArrowDown className={`w-3 h-3 ${autoScroll ? 'animate-bounce' : ''}`} />
            <span className="hidden sm:inline">滚屏</span>
          </button>

          {/* 复制全部 */}
          <button
            type="button"
            onClick={handleCopy}
            disabled={logs.length === 0}
            title="复制全部报文至剪贴板"
            className="h-7 px-2 rounded border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-fg-secondary hover:text-fg-primary text-[11px] font-mono flex items-center gap-1 tactile-btn disabled:opacity-40"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">已复制</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span className="hidden sm:inline">复制</span>
              </>
            )}
          </button>

          {/* 清屏 */}
          <button
            type="button"
            onClick={onClearLogs}
            disabled={logs.length === 0}
            title="清空控制台报文"
            className="h-7 px-2 rounded border border-white/[0.08] bg-white/[0.04] hover:bg-rose-500/10 hover:border-rose-500/30 text-fg-muted hover:text-rose-400 text-[11px] font-mono flex items-center gap-1 tactile-btn disabled:opacity-40"
          >
            <Trash2 className="w-3 h-3" />
            <span className="hidden sm:inline">清空</span>
          </button>
        </div>
      </div>

      {/* 终端报文输出区域 */}
      <div
        ref={logContainerRef}
        className="flex-1 p-3.5 overflow-y-auto font-mono text-[11.5px] leading-relaxed space-y-2 select-text"
      >
        {filteredLogs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-fg-muted/40 gap-3 select-none">
            <div className="w-12 h-12 rounded-xl border border-white/[0.06] bg-white/[0.02] flex items-center justify-center">
              <Sparkles className="w-6 h-6 opacity-30 text-brand-primary" />
            </div>
            <div className="text-center space-y-1">
              <p className="font-semibold text-xs tracking-wide text-fg-muted/70">
                &gt;_ TELEMETRY READY
              </p>
              <p className="text-[11px]">
                点击左侧开关或总控下发指令，系统实时执行回显与输出将在此呈现
              </p>
            </div>
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className="group p-1.5 rounded-md hover:bg-white/[0.02] transition-colors border border-transparent hover:border-white/[0.04]"
            >
              <div className="flex items-center gap-2 mb-1 flex-wrap text-[10px]">
                <span className="text-fg-muted/70 flex items-center gap-0.5">
                  <Clock className="w-2.5 h-2.5" />
                  {log.timestamp}
                </span>
                {getLevelBadge(log.level)}
                <span className="px-1.5 py-0.2 rounded bg-purple-500/15 border border-purple-500/30 text-purple-300 font-mono">
                  [{log.target}]
                </span>
              </div>
              <pre className="text-fg-primary/90 whitespace-pre-wrap break-all font-mono leading-snug pl-1 border-l-2 border-white/[0.10]">
                {log.message}
              </pre>
            </div>
          ))
        )}
      </div>

      {/* 终端底部状态条 */}
      <div className="shrink-0 h-7 px-3 border-t border-white/[0.06] bg-black/60 flex items-center justify-between text-[10px] font-mono text-fg-muted select-none">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
          <span>POWERSHELL IPC DAEMON READY</span>
        </div>
        <div>UTF-8 / CREATE_NO_WINDOW</div>
      </div>
    </div>
  );
};
