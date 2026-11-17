import React from 'react';
import { MindMapNode, MindMapNodeStyle } from '../../types/mindmap.ts';

// ─── Preset colour palette (8 swatches + transparent) ───────────────────────
const FILL_COLORS: string[] = [
  '#4F87FF',
  '#FF6B6B',
  '#FFD93D',
  '#6BCB77',
  '#C77DFF',
  '#FF9A3C',
  '#FFFFFF',
  'transparent',
];

// ─── Branch line styles ──────────────────────────────────────────────────────
type BranchStyle = 'curve' | 'elbow' | 'straight';

// ─── Props ───────────────────────────────────────────────────────────────────
interface MindMapStylePanelProps {
  selectedNode: MindMapNode | null;
  layoutDirection: 'right' | 'both';
  rainbowBranch: boolean;
  branchColor: string;
  onUpdateNodeStyle: (nodeId: string, style: Partial<MindMapNodeStyle>) => void;
  onLayoutDirectionChange: (dir: 'right' | 'both') => void;
  onRainbowBranchChange: (val: boolean) => void;
  onBranchColorChange: (color: string) => void;
  onResetNodeStyle: (nodeId: string) => void;
}

// ─── Tiny helpers ─────────────────────────────────────────────────────────────

interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
}

const Toggle: React.FC<ToggleProps> = ({ checked, onChange }) => (
  <div
    role="switch"
    aria-checked={checked}
    tabIndex={0}
    onClick={() => onChange(!checked)}
    onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && onChange(!checked)}
    className={`relative cursor-pointer rounded-full transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-sky-400`}
    style={{ width: 32, height: 18 }}
  >
    <div
      className={`absolute inset-0 rounded-full transition-colors duration-150 ${
        checked ? 'bg-sky-500' : 'bg-white/15'
      }`}
    />
    <div
      className="absolute top-0.5 rounded-full bg-white shadow transition-transform duration-150"
      style={{
        width: 14,
        height: 14,
        transform: checked ? 'translateX(16px)' : 'translateX(2px)',
      }}
    />
  </div>
);

interface SectionProps {
  label: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ label, children }) => (
  <div className="px-3 py-2.5 border-t border-white/5">
    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">{label}</p>
    {children}
  </div>
);

interface ColorSwatchProps {
  color: string;
  isActive: boolean;
  onClick: () => void;
}

const ColorSwatch: React.FC<ColorSwatchProps> = ({ color, isActive, onClick }) => {
  const isTransparent = color === 'transparent';
  return (
    <button
      type="button"
      onClick={onClick}
      title={isTransparent ? '无填充' : color}
      className={`w-5 h-5 rounded border transition-all shrink-0 ${
        isActive
          ? 'ring-2 ring-sky-400 ring-offset-1 ring-offset-slate-900'
          : 'border-white/15 hover:border-white/40'
      }`}
      style={{
        background: isTransparent
          ? 'repeating-linear-gradient(45deg,#555 0,#555 2px,transparent 0,transparent 50%) 0/8px 8px'
          : color,
      }}
    />
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

type PanelTab = 'style' | 'present' | 'canvas';

export const MindMapStylePanel: React.FC<MindMapStylePanelProps> = ({
  selectedNode,
  layoutDirection,
  rainbowBranch,
  branchColor,
  onUpdateNodeStyle,
  onLayoutDirectionChange,
  onRainbowBranchChange,
  onBranchColorChange,
  onResetNodeStyle,
}) => {
  const [activeTab, setActiveTab] = React.useState<PanelTab>('style');

  if (!selectedNode) return null;

  const style = selectedNode.style ?? {};
  const nodeId = selectedNode.id;

  const patch = (s: Partial<MindMapNodeStyle>) => onUpdateNodeStyle(nodeId, s);

  const currentBranchStyle: BranchStyle =
    (style as MindMapNodeStyle & { branchStyle?: BranchStyle }).branchStyle ?? 'curve';

  const setBranchStyle = (v: BranchStyle) =>
    patch({ ...(style as object), branchStyle: v } as Partial<MindMapNodeStyle>);

  const tabs: { id: PanelTab; label: string }[] = [
    { id: 'style', label: '样式' },
    { id: 'present', label: '演说' },
    { id: 'canvas', label: '画布' },
  ];

  return (
    <div
      className="flex flex-col h-full bg-slate-900/95 backdrop-blur-xl border-l border-white/10 select-none overflow-y-auto"
      style={{ width: 220, minWidth: 220 }}
    >
      {/* ── Tab bar ── */}
      <div className="flex shrink-0 border-b border-white/5">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            disabled={t.id !== 'style'}
            onClick={() => setActiveTab(t.id)}
            className={`flex-1 py-2 text-[11px] font-medium transition-colors ${
              activeTab === t.id
                ? 'text-sky-400 border-b-2 border-sky-400'
                : t.id === 'style'
                ? 'text-slate-400 hover:text-slate-200'
                : 'text-slate-600 cursor-not-allowed'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'style' && (
        <>
          {/* ── Shape ── */}
          <Section label="形状">
            <div className="flex gap-2">
              {(
                [
                  { v: 'rounded', label: '⌐', title: '圆角矩形' },
                  { v: 'rect', label: '□', title: '矩形' },
                  { v: 'pill', label: '( )', title: '胶囊' },
                ] as const
              ).map(({ v, label, title }) => (
                <button
                  key={v}
                  type="button"
                  title={title}
                  onClick={() => patch({ shape: v })}
                  className={`flex-1 py-1.5 rounded text-[11px] font-mono border transition-colors ${
                    (style.shape ?? 'rounded') === v
                      ? 'bg-sky-500/20 border-sky-500/60 text-sky-300'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/25'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </Section>

          {/* ── Fill colour ── */}
          <Section label="填充颜色">
            <div className="flex flex-wrap gap-1.5 items-center">
              {FILL_COLORS.map((c) => (
                <ColorSwatch
                  key={c}
                  color={c}
                  isActive={(style.background ?? 'transparent') === c}
                  onClick={() => patch({ background: c })}
                />
              ))}
              <label
                title="自定义填充颜色"
                className="w-5 h-5 rounded border border-white/15 hover:border-white/40 cursor-pointer overflow-hidden"
              >
                <input
                  type="color"
                  className="w-6 h-6 opacity-0 cursor-pointer -ml-0.5 -mt-0.5"
                  value={style.background && style.background !== 'transparent' ? style.background : '#4F87FF'}
                  onChange={(e) => patch({ background: e.target.value })}
                />
              </label>
            </div>
          </Section>

          {/* ── Border colour ── */}
          <Section label="边框颜色">
            <div className="flex flex-wrap gap-1.5 items-center">
              {FILL_COLORS.map((c) => (
                <ColorSwatch
                  key={c}
                  color={c}
                  isActive={(style.borderColor ?? 'transparent') === c}
                  onClick={() => patch({ borderColor: c })}
                />
              ))}
              <label
                title="自定义边框颜色"
                className="w-5 h-5 rounded border border-white/15 hover:border-white/40 cursor-pointer overflow-hidden"
              >
                <input
                  type="color"
                  className="w-6 h-6 opacity-0 cursor-pointer -ml-0.5 -mt-0.5"
                  value={style.borderColor && style.borderColor !== 'transparent' ? style.borderColor : '#4F87FF'}
                  onChange={(e) => patch({ borderColor: e.target.value })}
                />
              </label>
            </div>
          </Section>

          {/* ── Text ── */}
          <Section label="文本">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] text-slate-500 w-7 shrink-0">字号</span>
              <input
                type="range"
                min={12}
                max={32}
                step={1}
                value={style.fontSize ?? 14}
                onChange={(e) => patch({ fontSize: Number(e.target.value) })}
                className="flex-1 accent-sky-500"
              />
              <span className="text-[10px] text-slate-300 w-5 text-right shrink-0">
                {style.fontSize ?? 14}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  patch({
                    bold: !(style as MindMapNodeStyle & { bold?: boolean }).bold,
                  } as Partial<MindMapNodeStyle>)
                }
                className={`flex-1 py-1.5 rounded text-xs font-bold border transition-colors ${
                  (style as MindMapNodeStyle & { bold?: boolean }).bold
                    ? 'bg-sky-500/20 border-sky-500/60 text-sky-300'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/25'
                }`}
              >
                B
              </button>
              <button
                type="button"
                onClick={() =>
                  patch({
                    italic: !(style as MindMapNodeStyle & { italic?: boolean }).italic,
                  } as Partial<MindMapNodeStyle>)
                }
                className={`flex-1 py-1.5 rounded text-xs italic border transition-colors ${
                  (style as MindMapNodeStyle & { italic?: boolean }).italic
                    ? 'bg-sky-500/20 border-sky-500/60 text-sky-300'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/25'
                }`}
              >
                I
              </button>
            </div>
          </Section>

          {/* ── Structure ── */}
          <Section label="结构">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onLayoutDirectionChange('right')}
                title="向右布局"
                className={`flex-1 py-1.5 rounded text-[11px] border transition-colors flex items-center justify-center gap-1 ${
                  layoutDirection === 'right'
                    ? 'bg-sky-500/20 border-sky-500/60 text-sky-300'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/25'
                }`}
              >
                <span>→</span>
                <span>向右</span>
              </button>
              <button
                type="button"
                onClick={() => onLayoutDirectionChange('both')}
                title="双向布局"
                className={`flex-1 py-1.5 rounded text-[11px] border transition-colors flex items-center justify-center gap-1 ${
                  layoutDirection === 'both'
                    ? 'bg-sky-500/20 border-sky-500/60 text-sky-300'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/25'
                }`}
              >
                <span>↔</span>
                <span>双向</span>
              </button>
            </div>
          </Section>

          {/* ── Branch ── */}
          <Section label="分支">
            {/* Line style */}
            <div className="flex gap-1.5 mb-3">
              {(
                [
                  { v: 'curve' as BranchStyle, label: '曲线' },
                  { v: 'elbow' as BranchStyle, label: '折线' },
                  { v: 'straight' as BranchStyle, label: '直线' },
                ] satisfies { v: BranchStyle; label: string }[]
              ).map(({ v, label }) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setBranchStyle(v)}
                  className={`flex-1 py-1 rounded text-[10px] border transition-colors ${
                    currentBranchStyle === v
                      ? 'bg-sky-500/20 border-sky-500/60 text-sky-300'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/25'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Rainbow toggle */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] text-slate-300">彩虹分支</span>
              <Toggle checked={rainbowBranch} onChange={onRainbowBranchChange} />
            </div>

            {/* Branch colour */}
            {!rainbowBranch && (
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">颜色</span>
                <label className="flex-1 h-6 rounded border border-white/15 hover:border-white/40 cursor-pointer overflow-hidden">
                  <div
                    className="w-full h-full"
                    style={{ background: branchColor || '#4F87FF' }}
                  />
                  <input
                    type="color"
                    className="sr-only"
                    value={branchColor || '#4F87FF'}
                    onChange={(e) => onBranchColorChange(e.target.value)}
                  />
                </label>
              </div>
            )}
          </Section>
        </>
      )}

      {/* ── Reset button ── */}
      <div className="mt-auto px-3 py-3 border-t border-white/5 shrink-0">
        <button
          type="button"
          onClick={() => onResetNodeStyle(nodeId)}
          className="w-full py-1.5 rounded text-[11px] text-slate-400 border border-white/10 hover:border-white/25 hover:text-slate-200 transition-colors"
        >
          重设样式
        </button>
      </div>
    </div>
  );
};
