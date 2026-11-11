# Design: 全局字阶规范体系与跨模块布局基准线条严密对齐

## 1. 字体字号层级分类标准 (Typography Hierarchy Matrix)

全系统统一收敛至以下 5 级 Design Tokens 分类体系：

| 层级 (Level) | 适用范畴 (Scope) | Tailwind 样式类名 | 视觉参数 (Specs) | 语义说明 |
| :--- | :--- | :--- | :--- | :--- |
| **L1 · 顶栏主标题** | 各面板、侧栏顶标、主模块名称 | `text-xs font-semibold text-fg-primary tracking-tight` | 12px / 600 / 高对比 | 权威面板标题锚点，全工作台统一统一标尺 |
| **L2 · 统计徽标** | 待办数量、便签计数、导图篇数 | `text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-white/[0.06] text-fg-muted border border-white/[0.06]` | 10px / 等宽数字 / 胶囊底 | 精确数量展示，严禁喧宾夺主 |
| **L3 · 分类与标签** | 分区列表项、过滤胶囊 Tab | `text-xs font-medium` | 12px / 500 / 微光高亮 | 模块内层级导航，清晰易辩 |
| **L4 · 内容卡片标题** | 导图卡片名、待办事项名、便签标题 | `text-xs font-medium text-slate-200 truncate` | 12px / 500 / 防溢出 | 核心业务正文标题，高密度规整排版 |
| **L5 · 辅助微文案** | 更新时间、节点计数、快捷键提示 | `text-[10px] text-fg-muted` | 10px / 400 / 弱对比 | 辅助元数据与指引，安静克制 |

---

## 2. 连续对齐网格与顶栏 Y 轴基准线几何设计 (Continuous Grid Alignment)

```mermaid
graph LR
    subgraph "水平分割线 Y 轴零落差贯穿 (Y = 49px)"
        LHeader[左侧顶标: h-[49px] px-3.5] --- BorderB[border-b border-white/[0.08]] --- RHeader[右侧顶标: h-[49px] px-5]
    end
    
    subgraph "垂直分割线与十字交叉拓扑"
        LHeader --- VerticalDivider[border-r border-white/[0.08]]
        LBody[左侧分区列表] --- VerticalDivider
        VerticalDivider --- RGrid[右侧导图网格]
    end
```

- **单边框所有权公理 (Single-Border Ownership)**：
  - 左侧分区栏负责右边框（`border-r border-white/[0.08]`）；
  - 顶栏容器整体负责底边框（`border-b border-white/[0.08]`）；
  - 左右两列顶栏严格限定为相同的固定高度 `h-[49px]`，保证 `border-b` 在整屏水平方向处于绝对同一 Y 坐标，十字交叉处严丝合缝，零像素错位，消除切换模块时的顿挫突兀感。
