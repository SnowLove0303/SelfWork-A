# Design: 智能大纲目录与左对齐排版架构

## 1. 架构拓扑
```mermaid
flowchart TD
    subgraph Editor Workspace [BlockEditor.tsx]
        A[块流状态: blocks] --> B[useMemo 提取各级标题 H1/H2/H3]
        B --> C[OutlinePanel: 大纲目录栏]
        C -- 点击目录项 --> D[平滑滚动: scrollIntoView]
        
        A --> E[正文流渲染区]
        E --> F[BlockItem.tsx]
        F --> G[操作手柄绝对定位: absolute -left-7]
        F --> H[文本域无内嵌占位: pl-0 垂直对齐大标题]
    end
```

## 2. 大纲目录提取契约
- 提取规则：`blocks.filter(b => ['h1', 'h2', 'h3'].includes(b.blockType) && b.content.trim() !== '')`
- 层级缩进：
  - `h1`: `pl-1 font-medium text-slate-200 text-xs`
  - `h2`: `pl-4 text-slate-400 text-xs`
  - `h3`: `pl-7 text-slate-500 text-[11px]`

## 3. 左对齐几何修复方案
- 移除原本占据 32px 的 `<div className="w-8 shrink-0 ...">` 内嵌容器；
- 将操作按钮（`+` 和垃圾桶）改为绝对定位在块的左侧留白处（`absolute -left-7 top-1`）；
- 使 `textarea` 的左内边距与大标题 `input` 达到 100% 绝对平齐。
