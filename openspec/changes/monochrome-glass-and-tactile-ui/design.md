# Technical Design: Monochrome Frosted Glass and Tactile UI

## 1. Material Stack & Visual Topology (材质层级与空间拓扑)

```mermaid
flowchart TB
    subgraph Layer0["Layer 0: 物理底座 (Canvas Base)"]
        BaseDark["深冷微底 (#080b11) + 细微径向漫射景深光"]
    end

    subgraph Layer1["Layer 1: 亚克力毛玻璃视口 (Frosted Acrylic Panels)"]
        direction LR
        SidebarGlass["侧边栏<br/>bg-canvas-default/70<br/>backdrop-blur-md<br/>border-r border-border-default"]
        HeaderGlass["顶部状态栏<br/>bg-canvas-default/70<br/>backdrop-blur-md<br/>border-b border-border-default"]
        StageGlass["主舞台视口<br/>bg-canvas-subtle/80"]
    end

    subgraph Layer2["Layer 2: 实体画板与浮层 (Floating Glass Cards)"]
        StageCard["主画板卡片<br/>bg-canvas-elevated/40 + backdrop-blur-xl<br/>border border-white/[0.08]<br/>inset-0-1px-0 玻璃上高光"]
    end

    subgraph Layer3["Layer 3: 触觉交互控件 (Tactile Interactive Controls)"]
        NavButtons["侧栏模块按钮<br/>Hover: 提亮 + 上边缘微光<br/>Active: 0.97x 机械微下压"]
        StatusPill["状态探测胶囊<br/>毛玻璃胶囊 + 凹凸微触觉"]
        CollapseBtn["折叠展开按钮<br/>方形毛玻璃微按钮 + 物理回弹"]
    end

    BaseDark --> Layer1
    Layer1 --> Layer2
    Layer2 --> Layer3
```

## 2. 核心设计令牌 (Design Tokens) 升级方案
1. **黑灰白单色域 (Radical Monochrome)**：
   - 移除不必要的杂乱有色变量，保留纯粹的冷黑、深灰、锌白。
   - 品牌高光集中在必要的核心状态指示（如 Emerald 在线小绿点、SW 流体发光 Logo）与极克制的中性冷白光圈。
2. **磨砂毛玻璃层级 (Backdrop Blur & Translucency)**：
   - `backdrop-blur-md` (12px) 赋予侧栏与顶栏柔和通透感；
   - `backdrop-blur-xl` (24px) 赋予主画板深邃立体感；
   - 统一透明度：面板层采用 65%~75% 不透明度，既显通透又绝对保证文字清晰度。
3. **触觉物理学 (Tactile Button Mechanics)**：
   - **顶面内切高光 (`inset 0 1px 0 rgba(255,255,255,0.12)`)**：模拟真实机械键帽/玻璃切面顶部的物理反光；
   - **Hover 态**：表面光泽提升至 `0.18`，轻微上浮；
   - **Active 态**：`scale-[0.97]`，下凹内阴影 `inset 0 1px 2px rgba(0,0,0,0.5)`，物理下压感十足；
   - **Transition**：`duration-150 ease-out` 快速响应，杜绝拖泥带水。
