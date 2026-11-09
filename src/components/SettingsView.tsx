import React, { useState, useRef, ChangeEvent } from 'react';
import {
  Palette,
  Sliders,
  Keyboard,
  Info,
  Sparkles,
  Globe,
  Upload,
  RotateCcw,
  Monitor,
  Layout,
  Check,
  Trash2,
} from 'lucide-react';
import {
  AppearanceSettings,
  BackgroundScope,
  BackgroundType,
} from '../types/settings.ts';

export interface SettingsViewProps {
  settings: AppearanceSettings;
  onUpdateSettings: (settings: AppearanceSettings) => void;
  onResetSettings: () => void;
}

type SettingsTabId = 'appearance' | 'general' | 'shortcuts' | 'about';

interface SettingsTab {
  id: SettingsTabId;
  name: string;
  icon: React.FC<{ className?: string }>;
  disabled?: boolean;
  badge?: string;
}

const SETTINGS_TABS: SettingsTab[] = [
  { id: 'appearance', name: '外观与背景', icon: Palette },
  { id: 'general', name: '通用设置', icon: Sliders, disabled: true, badge: '预留' },
  { id: 'shortcuts', name: '快捷键', icon: Keyboard, disabled: true, badge: '预留' },
  { id: 'about', name: '关于工作台', icon: Info, disabled: true, badge: '预留' },
];

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onResetSettings,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTabId>('appearance');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleScopeChange = (scope: BackgroundScope) => {
    onUpdateSettings({ ...settings, scope });
  };

  const handleTypeChange = (type: BackgroundType) => {
    onUpdateSettings({ ...settings, type });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        onUpdateSettings({
          ...settings,
          type: 'image_upload',
          imageUrl: result,
        });
      }
    };
    reader.readAsDataURL(file);
    // 重置 input 以支持重复选择相同文件
    e.target.value = '';
  };

  const handleUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
    onUpdateSettings({
      ...settings,
      imageUrl: e.target.value,
    });
  };

  const handleClearImage = () => {
    onUpdateSettings({
      ...settings,
      imageUrl: '',
    });
  };

  return (
    <div className="flex h-full w-full overflow-hidden text-fg-primary select-none box-border">
      {/* 左侧二级设置导航骨架 */}
      <aside className="w-44 shrink-0 border-r border-white/[0.08] bg-black/20 backdrop-blur-md flex flex-col p-2.5 box-border">
        <div className="px-2 py-1.5 mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-fg-muted font-mono">
            设置中心
          </span>
        </div>

        <nav className="flex-1 space-y-1">
          {SETTINGS_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                disabled={tab.disabled}
                onClick={() => !tab.disabled && setActiveTab(tab.id)}
                className={`group relative flex w-full items-center justify-between rounded-md px-2.5 py-2 text-xs tactile-btn transition-colors duration-150 ${
                  isActive
                    ? 'tactile-btn-active text-fg-primary font-medium'
                    : tab.disabled
                    ? 'text-fg-muted/40 cursor-not-allowed opacity-60'
                    : 'text-fg-secondary hover:text-fg-primary hover:bg-white/[0.06]'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Icon
                    className={`h-3.5 w-3.5 shrink-0 ${
                      isActive ? 'text-brand-primary' : 'text-fg-muted'
                    }`}
                  />
                  <span className="truncate">{tab.name}</span>
                </div>

                {tab.badge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] text-fg-muted font-mono">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* 底部重置与环境说明 */}
        <div className="pt-2 border-t border-white/[0.06]">
          <button
            type="button"
            onClick={onResetSettings}
            className="flex w-full items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-[11px] text-fg-muted hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 tactile-btn transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            <span>恢复默认外观</span>
          </button>
        </div>
      </aside>

      {/* 右侧主配置内容区 */}
      <main className="flex-1 overflow-y-auto p-6 space-y-6 box-border">
        {/* 顶部标题区 */}
        <header className="border-b border-white/[0.08] pb-4">
          <h2 className="text-base font-semibold tracking-tight text-fg-primary font-mono flex items-center gap-2">
            <Palette className="h-4 w-4 text-brand-primary" />
            外观与背景
          </h2>
          <p className="text-xs text-fg-muted mt-1">
            个性化工作台背景图像、视口透光范围、高斯磨砂模糊与深色防眩遮罩
          </p>
        </header>

        {/* 配置节 1：背景应用范围 (Scope) */}
        <section className="space-y-2">
          <label className="text-xs font-semibold text-fg-secondary uppercase tracking-wider font-mono">
            背景生效范围
          </label>
          <div className="grid grid-cols-2 gap-3 max-w-xl">
            {/* 全视口贯穿 */}
            <button
              type="button"
              onClick={() => handleScopeChange('window')}
              className={`flex items-start gap-3 p-3 rounded-lg border text-left tactile-btn transition-colors ${
                settings.scope === 'window'
                  ? 'border-brand-primary/60 bg-brand-primary/[0.08] shadow-[0_0_15px_rgba(56,189,248,0.15)]'
                  : 'border-white/[0.08] bg-black/20 hover:border-white/[0.15] hover:bg-white/[0.03]'
              }`}
            >
              <div
                className={`mt-0.5 p-1.5 rounded-md ${
                  settings.scope === 'window'
                    ? 'bg-brand-primary/20 text-brand-primary'
                    : 'bg-white/[0.06] text-fg-muted'
                }`}
              >
                <Monitor className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-fg-primary">
                    全视口贯穿
                  </span>
                  {settings.scope === 'window' && (
                    <Check className="h-3.5 w-3.5 text-brand-primary" />
                  )}
                </div>
                <p className="text-[11px] text-fg-muted mt-0.5 leading-relaxed">
                  贯穿侧栏与顶栏，呈现一体化全景晶莹透光沉浸视效
                </p>
              </div>
            </button>

            {/* 仅主工作区 */}
            <button
              type="button"
              onClick={() => handleScopeChange('stage')}
              className={`flex items-start gap-3 p-3 rounded-lg border text-left tactile-btn transition-colors ${
                settings.scope === 'stage'
                  ? 'border-brand-primary/60 bg-brand-primary/[0.08] shadow-[0_0_15px_rgba(56,189,248,0.15)]'
                  : 'border-white/[0.08] bg-black/20 hover:border-white/[0.15] hover:bg-white/[0.03]'
              }`}
            >
              <div
                className={`mt-0.5 p-1.5 rounded-md ${
                  settings.scope === 'stage'
                    ? 'bg-brand-primary/20 text-brand-primary'
                    : 'bg-white/[0.06] text-fg-muted'
                }`}
              >
                <Layout className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-fg-primary">
                    仅主工作台画板
                  </span>
                  {settings.scope === 'stage' && (
                    <Check className="h-3.5 w-3.5 text-brand-primary" />
                  )}
                </div>
                <p className="text-[11px] text-fg-muted mt-0.5 leading-relaxed">
                  仅在中央画板卡片内部渲染，侧边栏与顶栏保持纯净暗色
                </p>
              </div>
            </button>
          </div>
        </section>

        {/* 配置节 2：背景类型选择 (Type) */}
        <section className="space-y-2">
          <label className="text-xs font-semibold text-fg-secondary uppercase tracking-wider font-mono">
            背景表现模式
          </label>
          <div className="grid grid-cols-3 gap-3 max-w-xl">
            {/* 预设流光 */}
            <button
              type="button"
              onClick={() => handleTypeChange('fluid')}
              className={`flex flex-col items-center p-3 rounded-lg border text-center tactile-btn transition-colors ${
                settings.type === 'fluid'
                  ? 'border-brand-primary/60 bg-brand-primary/[0.08] shadow-[0_0_15px_rgba(56,189,248,0.15)]'
                  : 'border-white/[0.08] bg-black/20 hover:border-white/[0.15] hover:bg-white/[0.03]'
              }`}
            >
              <Sparkles
                className={`h-4 w-4 mb-1.5 ${
                  settings.type === 'fluid'
                    ? 'text-brand-primary'
                    : 'text-fg-muted'
                }`}
              />
              <span className="text-xs font-medium text-fg-primary">
                系统预设流光
              </span>
              <span className="text-[10px] text-fg-muted mt-0.5">
                双光团缓慢呼吸
              </span>
            </button>

            {/* 本地图片上传 */}
            <button
              type="button"
              onClick={() => handleTypeChange('image_upload')}
              className={`flex flex-col items-center p-3 rounded-lg border text-center tactile-btn transition-colors ${
                settings.type === 'image_upload'
                  ? 'border-brand-primary/60 bg-brand-primary/[0.08] shadow-[0_0_15px_rgba(56,189,248,0.15)]'
                  : 'border-white/[0.08] bg-black/20 hover:border-white/[0.15] hover:bg-white/[0.03]'
              }`}
            >
              <Upload
                className={`h-4 w-4 mb-1.5 ${
                  settings.type === 'image_upload'
                    ? 'text-brand-primary'
                    : 'text-fg-muted'
                }`}
              />
              <span className="text-xs font-medium text-fg-primary">
                本地壁纸上传
              </span>
              <span className="text-[10px] text-fg-muted mt-0.5">
                JPG / PNG / WebP
              </span>
            </button>

            {/* 网络 URL */}
            <button
              type="button"
              onClick={() => handleTypeChange('image_url')}
              className={`flex flex-col items-center p-3 rounded-lg border text-center tactile-btn transition-colors ${
                settings.type === 'image_url'
                  ? 'border-brand-primary/60 bg-brand-primary/[0.08] shadow-[0_0_15px_rgba(56,189,248,0.15)]'
                  : 'border-white/[0.08] bg-black/20 hover:border-white/[0.15] hover:bg-white/[0.03]'
              }`}
            >
              <Globe
                className={`h-4 w-4 mb-1.5 ${
                  settings.type === 'image_url'
                    ? 'text-brand-primary'
                    : 'text-fg-muted'
                }`}
              />
              <span className="text-xs font-medium text-fg-primary">
                网络图片直链
              </span>
              <span className="text-[10px] text-fg-muted mt-0.5">
                在线 HTTP/HTTPS
              </span>
            </button>
          </div>
        </section>

        {/* 配置节 3：图片来源具体参数 (当不为流光时展示) */}
        {settings.type !== 'fluid' && (
          <section className="space-y-2 max-w-xl">
            <label className="text-xs font-semibold text-fg-secondary uppercase tracking-wider font-mono">
              {settings.type === 'image_upload'
                ? '本地图片文件'
                : '网络图片直链'}
            </label>

            {settings.type === 'image_upload' ? (
              <div className="space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {settings.imageUrl ? (
                  <div className="flex items-center gap-3 p-2.5 rounded-lg border border-white/[0.10] bg-black/30">
                    <div className="relative h-14 w-24 shrink-0 rounded overflow-hidden border border-white/[0.12] bg-black/40">
                      <img
                        src={settings.imageUrl}
                        alt="壁纸预览"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-fg-primary truncate">
                        已选择自定义壁纸
                      </p>
                      <p className="text-[10px] text-fg-muted mt-0.5">
                        Base64 本地安全离线存储
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-2.5 py-1 text-xs rounded border border-white/[0.12] bg-white/[0.06] hover:bg-white/[0.12] tactile-btn"
                      >
                        更换
                      </button>
                      <button
                        type="button"
                        onClick={handleClearImage}
                        title="清除壁纸"
                        className="p-1 text-fg-muted hover:text-rose-400 hover:bg-rose-500/10 rounded tactile-btn"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center p-6 rounded-lg border border-dashed border-white/[0.15] bg-black/20 hover:border-brand-primary/50 hover:bg-white/[0.02] cursor-pointer transition-colors"
                  >
                    <Upload className="h-6 w-6 text-fg-muted mb-2" />
                    <span className="text-xs font-medium text-fg-primary">
                      点击选择本地背景图片
                    </span>
                    <span className="text-[10px] text-fg-muted mt-1">
                      推荐 1920×1080 或更高分辨率，支持 PNG、JPG、WebP
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={settings.imageUrl}
                    onChange={handleUrlChange}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="flex-1 rounded-md border border-white/[0.10] bg-black/30 px-3 py-1.5 text-xs text-fg-primary placeholder:text-fg-muted/40 focus:border-brand-primary/60 focus:outline-none focus:ring-1 focus:ring-brand-primary/40 font-mono"
                  />
                  {settings.imageUrl && (
                    <button
                      type="button"
                      onClick={handleClearImage}
                      className="px-2 text-xs rounded border border-white/[0.10] bg-white/[0.04] text-fg-muted hover:text-rose-400 tactile-btn"
                    >
                      清除
                    </button>
                  )}
                </div>
                {settings.imageUrl && (
                  <div className="relative h-16 w-32 rounded overflow-hidden border border-white/[0.12] bg-black/40">
                    <img
                      src={settings.imageUrl}
                      alt="URL 预览"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display =
                          'none';
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* 配置节 4：高精光学参数调节滑块 (Sliders) */}
        <section className="space-y-4 max-w-xl">
          <label className="text-xs font-semibold text-fg-secondary uppercase tracking-wider font-mono">
            光学质感与防眩调节
          </label>

          <div className="space-y-4 p-4 rounded-lg border border-white/[0.08] bg-black/20 backdrop-blur-md">
            {/* 滑块 1：画板透光度 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-fg-primary">
                  画板透光度 (Glass Opacity)
                </span>
                <span className="text-xs font-mono text-brand-primary font-semibold">
                  {Math.round(settings.opacity * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={settings.opacity}
                onChange={(e) =>
                  onUpdateSettings({
                    ...settings,
                    opacity: parseFloat(e.target.value),
                  })
                }
                className="glass-slider"
              />
              <p className="text-[10px] text-fg-muted">
                调节工作区底色透光率，数值越低亚克力质感越通透
              </p>
            </div>

            {/* 滑块 2：高斯磨砂模糊 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-fg-primary">
                  背景磨砂模糊 (Gaussian Blur)
                </span>
                <span className="text-xs font-mono text-brand-primary font-semibold">
                  {Math.round(settings.blur)}px
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                step="1"
                value={settings.blur}
                onChange={(e) =>
                  onUpdateSettings({
                    ...settings,
                    blur: parseInt(e.target.value, 10),
                  })
                }
                className="glass-slider"
              />
              <p className="text-[10px] text-fg-muted">
                模糊背景细节杂质，确保前台文字与图表清晰聚焦
              </p>
            </div>

            {/* 滑块 3：深色防眩遮罩暗度 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-fg-primary">
                  防眩遮罩暗度 (Anti-Glare Dimmer)
                </span>
                <span className="text-xs font-mono text-brand-primary font-semibold">
                  {Math.round(settings.overlayDarkness * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="0.8"
                step="0.01"
                value={settings.overlayDarkness}
                onChange={(e) =>
                  onUpdateSettings({
                    ...settings,
                    overlayDarkness: parseFloat(e.target.value),
                  })
                }
                className="glass-slider"
              />
              <p className="text-[10px] text-fg-muted">
                压暗高亮刺眼壁纸，严格保障 WCAG 2.2 AA 白色文字可读性
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
