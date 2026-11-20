# 技术架构与设计方案：选区单一权威归一化与消除双重高亮 (Design)

## 一、 双重高亮根因拓扑与互斥重构

### 1.1 冲突拓扑
```mermaid
graph TD
    A["用户跨段拖拽鼠标"] --> B["浏览器默认行为 (生成原生 window.getSelection)"]
    A --> C["自定义引擎 (生成 CSS.highlights word-selection)"]
    B --> D["❌ 图层 1: 原生 ::selection 选行/选词"]
    C --> E["❌ 图层 2: 自定义 ::highlight 选字"]
    D --> F["💥 视觉崩溃：双重选中 (又选行又选字)，双重叠色 (颜色加倍深斑)"]
    E --> F
```

### 1.2 互斥归一化单一权威拓扑
```mermaid
graph TD
    A["用户开始拖拽鼠标"] --> B{"是否跨越块边界 (currentBlock !== anchorBlock)?"}
    B -- 否 (单块内) --> C["✅ 单块纯原生模式"]
    C --> D["清空 CSS.highlights，仅允许浏览器原生 ::selection 渲染单层文字"]
    B -- 是 (跨段划选) --> E["✅ 跨段纯 Highlight 模式"]
    E --> F["执行 window.getSelection()?.removeAllRanges() 清空原生选区残留"]
    E --> G["构造精准跨段 Range，全权由 CSS.highlights 渲染唯一单层文字"]
    F --> H["✅ 结果：任何时刻屏幕仅有 1 套选区、1 层纯净色彩，绝无重影与冲突"]
    G --> H
```

---

## 二、 核心技术方案细节

### 2.1 运行时无感知互斥切换 (`BlockEditor.tsx`)
在 `handleGlobalMouseMove` 内部：
```typescript
if (anchorBlockEl && currentBlockEl && anchorBlockEl === currentBlockEl) {
  // 单块内：清空自定义 highlight，全权由原生选区单层渲染
  if (activeSelectionRangeRef.current) {
    activeSelectionRangeRef.current = null;
    if (typeof CSS !== 'undefined' && (CSS as any).highlights) {
      (CSS as any).highlights.delete('word-selection');
    }
  }
  return;
}

// 跨块划选：第一步必须立即清空浏览器原生的选区残留！
const nativeSel = window.getSelection();
if (nativeSel && nativeSel.rangeCount > 0) {
  nativeSel.removeAllRanges();
}

// 第二步：构造精准跨块 Range，全权交由 CSS.highlights 进行单层硬件加速渲染
const range = new Range();
const pos = anchor.node.compareDocumentPosition(focusNode);
if (pos & Node.DOCUMENT_POSITION_FOLLOWING || (anchor.node === focusNode && anchor.offset <= focusOffset)) {
  range.setStart(anchor.node, anchor.offset);
  range.setEnd(focusNode, focusOffset);
} else {
  range.setStart(focusNode, focusOffset);
  range.setEnd(anchor.node, anchor.offset);
}

activeSelectionRangeRef.current = range;
if (typeof CSS !== 'undefined' && (CSS as any).highlights) {
  const HighlightCtor = (window as any).Highlight || (globalThis as any).Highlight;
  if (HighlightCtor) {
    (CSS as any).highlights.set('word-selection', new HighlightCtor(range));
  }
}
```

### 2.2 彻底解耦 `crossSelectedBlockIds` 对 UI 的任何样式污染
- 确保 `BlockItem.tsx` 绝对不因为 `isCrossSelected` 渲染任何多余的行边框或背景；
- `isCrossSelected` 仅保留侧边把手静默退后（`pointer-events-none !opacity-0`）的辅助功能；
- 无论代码块还是普通文本块，高亮完全统一交给单层的 `::highlight(word-selection)`，杜绝任何组件级多余着色。
