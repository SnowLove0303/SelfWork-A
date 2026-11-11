# Spec: 待办清单与思维导图模块顶栏标题像素级对齐规范

## 1. 标题与顶栏几何契约 (RFC 2119)

### SHALL Requirements
1. `TasksPanel.tsx` **SHALL** 拥有独立的顶栏标题容器，其高度严格锁定为 `h-[49px]`，与 `MemoBoard.tsx` 以及 `MindMapPartitionView.tsx` 保持 1:1 绝对一致。
2. 顶栏标题容器 **SHALL** 应用 `px-3.5 flex items-center justify-between border-b border-border-subtle bg-white/[0.01] shrink-0 min-w-0` 类规范。
3. 标题与图标组合容器 **SHALL** 应用 `flex items-center gap-2 shrink-0` 规范，其中图标采用 `w-4 h-4 text-brand-primary shrink-0`，主标题采用 `text-xs font-semibold text-fg-primary tracking-tight font-mono shrink-0 whitespace-nowrap`。
4. 统计徽标 **SHALL** 紧随主标题排列，采用 `text-[10px] px-1.5 py-0.2 rounded-full bg-white/[0.06] text-fg-muted font-mono border border-white/[0.06] shrink-0 whitespace-nowrap` 胶囊样式。
5. 待办快捷录入输入框 **SHALL** 独立置于 `h-[49px]` 顶栏之下，采用自适应工具条容器包裹，保留 `onKeyDown` 回车创建待办的核心交互。

### WHEN / THEN Contracts
- **WHEN** 用户在主导航中从“待办清单”切换到“思维导图”模块时；
- **THEN** 左上角标题文字（“待办清单”与“分区管理”）的 X 轴偏移量必须完全相等（均来自 `px-3.5` + `gap-2`），Y 轴居中几何中心必须完全相等（均居中于 `h-[49px]` 容器中，Y=24.5px），实现零抖动无感平滑切换。
