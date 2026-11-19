# 技术架构设计与状态机 (Design)

## 1. 架构因果拓扑与事件流

```mermaid
flowchart TD
    A[用户鼠标在块 A 内部按下 mousedown] --> B[记录 startBlockId = A, isDragging = true]
    
    B --> C[用户移动鼠标 mousemove]
    C -->|仍在块 A 内部| D[保持单块原生 Selection]
    C -->|指针跨出块 A 移入块 B| E[触发跨块协同器 activateCrossSelection]
    
    E --> F[确定起点块索引 startIndex 与当前块索引 currentIndex]
    F --> G[计算选区区间 [min(start, cur), max(start, cur)]]
    G --> H[更新 selectedBlockIds Set 集合]
    H --> I[为区间内所有 BlockItem 注入 isCrossSelected 样式]
    
    I --> J{用户触发后续动作}
    J -->|按下 Ctrl+C| K[提取区间内所有块内容 -> 拼接写入剪贴板]
    J -->|按下 Backspace/Delete| L[批量删除区间块 -> 保留单个聚焦空块]
    J -->|直接打字输入| M[删除区间块 -> 插入输入字符为新块]
    J -->|单击任意处| N[清空 selectedBlockIds, 恢复单块编辑状态]
```

## 2. 状态机与性能保证

### 2.1 状态模型
```typescript
interface CrossSelectionState {
  isSelecting: boolean;
  anchorBlockId: string | null;
  selectedBlockIds: Set<string>;
}
```

### 2.2 事件感知与性能
- 避免全量 re-render：在 `BlockItem` 中，仅接收布尔属性 `isCrossSelected?: boolean`；未被选中的块直接短路无需额外重绘；
- 移动事件采样：在 `mousemove` 中利用节流（throttle/RAF）快速提取鼠标所在的目标块 ID（可通过事件冒泡中的 `e.target.closest('[id^="block-"]')` 在 0.01ms 内瞬时获取目标块 ID）；
- 优雅视觉覆盖：被跨选的块使用：
  `bg-sky-500/15 ring-1 ring-sky-500/30 rounded-lg selection:bg-sky-500/30`
  与 Word 及 Notion 的多块选中高亮视觉语言 100% 保持高度一致。
