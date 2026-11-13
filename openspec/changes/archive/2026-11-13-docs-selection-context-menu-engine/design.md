# Design: 划选内容右键定制调整弹窗与富文本转换引擎架构设计

## 1. 架构总览与交互拓扑

```text
       [用户在 BlockItem 划选文字] ──右键点击──> onContextMenu 拦截
                                                      │
                                                      ▼
                      [计算防溢出锚点坐标: x, y, selectionRange]
                                                      │
                                                      ▼
                            ┌────────────────────────────────────┐
                            │    BlockContextMenu 调整面板       │
                            │  - 行内排版: [B] [I] [S] [Code]    │
                            │  - 字体色盘: 白/红/橙/黄/绿/蓝/紫  │
                            │  - 荧光高亮: 黄/绿/蓝/粉/紫        │
                            │  - 块级转换: p/h1/h2/h3/todo/code  │
                            │  - 剪贴动作: 复制/剪切/清除格式    │
                            └─────────────────┬──────────────────┘
                                              │
                      ┌───────────────────────┴───────────────────────┐
                      ▼                                               ▼
         [触发行内格式化 / 上色]                             [触发块类型转换 Turn into]
   (切分选区，包裹 Markdown / Span)               (onUpdate(content, newBlockType))
```

## 2. 核心算法设计

### 2.1 视窗碰撞检测防溢出算法 (Collision Detection)
```typescript
const POPOVER_WIDTH = 290;
const POPOVER_HEIGHT = 380;
const PADDING = 16;

const adjustedLeft = Math.min(
  clientX,
  window.innerWidth - POPOVER_WIDTH - PADDING
);
const adjustedTop = clientY + POPOVER_HEIGHT > window.innerHeight - PADDING
  ? Math.max(PADDING, clientY - POPOVER_HEIGHT)
  : clientY;
```

### 2.2 选区子文本切分与格式包裹 (Text Slicing & Wrapping)
```typescript
function applyFormatToSelection(
  content: string,
  start: number,
  end: number,
  prefix: string,
  suffix: string
): string {
  const before = content.slice(0, start);
  const selected = content.slice(start, end);
  const after = content.slice(end);

  // 若已被对应前后缀包裹，则反向剥离（Toggle）
  if (selected.startsWith(prefix) && selected.endsWith(suffix)) {
    const unwrapped = selected.slice(prefix.length, selected.length - suffix.length);
    return before + unwrapped + after;
  }
  return before + prefix + selected + suffix + after;
}
```

## 3. 影响范围与安全隔离
- **新建组件**：`src/components/docs/editor/BlockContextMenu.tsx`（纯净受控浮窗组件）；
- **改动文件**：`src/components/docs/editor/BlockItem.tsx`（挂载 `onContextMenu` 监听并集成右键弹窗）；
- **只读保证**：底层 SQLite 数据库持久化逻辑、任务清单、思维导图与启动器保持绝对零变动。
