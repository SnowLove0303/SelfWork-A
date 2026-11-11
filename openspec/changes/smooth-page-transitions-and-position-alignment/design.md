# Design: 工作台全局平滑切页动效与空间视觉落位对齐

## 1. 动效工程设计 (Transition Motion Architecture)

现代高品质桌面软件（如 macOS 原生、Linear、Raycast）的视口切换均采用纯 CSS 硬件加速合成动效，避免 JavaScript 帧循环阻塞或重绘重排。

### 1.1 模块级切页动效 (`SlotContainer.tsx`)
在 `SlotContainer` 中，对激活的模块视图使用动态 `key={activeModule}` 配合轻量动画类：
```css
@keyframes viewFadeIn {
  from {
    opacity: 0;
    transform: translateY(4px) scale(0.998);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.animate-view-fade {
  animation: viewFadeIn 180ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
```
- **耗时**：180ms（人眼感知最舒适的无感微动效区间）；
- **缓动**：`cubic-bezier(0.16, 1, 0.3, 1)`（原生质感减速曲线）；
- **性能**：仅触发 GPU `transform` 与 `opacity` 合成层（Compositing），零 Layout Thrashing。

---

## 2. 空间落位与锚点平衡 (Spatial Anchor Harmony)

```mermaid
graph TD
    subgraph "空间位置平滑对齐架构"
        TopBar[全局统一顶栏基准: h-[49px] Y=49px绝对固定]
        LeftAnchor[左侧分区导航: 黄金宽度比例 w-64 / 256px 稳定锚定]
        RightAnchor[右侧主内容区: p-4 网格起始点与 Tasks/Launcher 视线对齐]
    end
```

- **视觉跳移根除方案**：
  1. 顶栏水平线 Y=49px 绝对静态锚定，切换时横线完全静止；
  2. 左右分界线位置微调至符合视觉习惯的黄金宽度；
  3. 配合 180ms 柔和淡入，使视觉神经自然聚焦于新模块，彻底消除硬切的跳跃错觉。
