# Technical Design: Custom Background and Appearance Settings

## 1. Component Topology & Data Flow (组件拓扑与数据流)

```mermaid
flowchart TB
    subgraph Root["🖥️ App.tsx (全局状态底座)"]
        State["appearanceSettings 状态 (本地持久化: localStorage)"]
        GlobalBg["全局底层背景渲染器<br/>(当 scope === 'window' 时生效)"]
        SidebarComp["Sidebar 侧栏导航"]
        HeaderComp["Header 顶部状态栏"]
        SlotComp["SlotContainer 主舞台视口"]
    end

    subgraph CentralStage["💎 SlotContainer.tsx (主舞台)"]
        StageBg["局部背景渲染器<br/>(当 scope === 'stage' 时生效)"]
        ModuleSwitcher{"activeModule 判断"}
        NormalView["普通模块视图 (如待办清单/脑图等)"]
        SettingsCenter["⚙️ SettingsView (设置中心)"]
    end

    subgraph SettingsArchitecture["⚙️ SettingsView 内部结构"]
        SubNav["左侧设置子导航<br/>• 外观与背景 (当前激活)<br/>• 通用设置 (预留)<br/>• 快捷键 (预留)<br/>• 关于 (预留)"]
        AppearancePanel["外观与背景配置面板<br/>1. 作用域分段开关 (全视口 / 主画板)<br/>2. 背景类型选择 (预设流光 / 本地上传 / URL)<br/>3. 透明度 / 模糊度 / 遮罩暗度滑动条<br/>4. 一键恢复默认按钮"]
    end

    State --> GlobalBg
    State --> SlotComp
    SlotComp --> ModuleSwitcher
    ModuleSwitcher -->|activeModule !== 'settings'| NormalView
    ModuleSwitcher -->|activeModule === 'settings'| SettingsCenter
    SettingsCenter --> SubNav
    SettingsCenter --> AppearancePanel
    AppearancePanel -.->|实时参数回调| State
```

## 2. 状态结构与持久化模型 (`src/types/settings.ts`)

```typescript
export type BackgroundScope = 'window' | 'stage';
export type BackgroundType = 'fluid' | 'image_upload' | 'image_url';

export interface AppearanceSettings {
  scope: BackgroundScope;
  type: BackgroundType;
  imageUrl: string;
  opacity: number;        // 0.0 ~ 1.0 (画板透明度)
  blur: number;           // 0 ~ 40 (高斯模糊 px)
  overlayDarkness: number;// 0.0 ~ 0.8 (深色防眩遮罩)
}
```

## 3. 防眩遮罩与双模背景渲染公式
1. **背景分层渲染物理学**：
   - 最底层：背景图片（`object-cover`）或动态流光发生器；
   - 中间层：可调节深色遮罩（`bg-black`，透明度绑定 `overlayDarkness`）；
   - 表面层：磨砂高斯模糊（`backdrop-filter: blur(Npx)`）+ 晶体玻璃高光边框；
   - 顶层：文字、图标与交互控件。
2. **极简优雅滑动条 (Sleek Glass Range Input)**：
   - 纯 CSS 定制 Range Input 轨道与触觉滑块，融入黑灰白亚克力设计令牌，拖拽手感丝滑。
