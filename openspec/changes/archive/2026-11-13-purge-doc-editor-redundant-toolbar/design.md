# Design: 移除文档顶栏冗余插块按钮技术方案

## 1. 架构方案与技术细节
- **物理落点**：`src/components/docs/editor/BlockEditor.tsx`
- **改动详情**：
  1. 移除顶栏高度为 `h-[49px]` 容器内部的右上侧 `<div className="flex items-center gap-1.5">...</div>` 代码块，包括 `目录`、`标题`、`待办`、`代码` 按钮及其子项；
  2. 清理 `lucide-react` 中未再使用的 `Heading1`、`CheckSquare`、`Code` 图标导入，保留 `ListTree`（用于右侧大纲栏）和 `FileText`；
  3. 保留正文内 `SlashMenu.tsx` 呼出机制与右侧大纲目录索引结构不变。

## 2. 影响与回归评估
- 仅重构表现层顶栏 JSX，不影响 SQLite 底层数据库与页面/块生命周期；
- 静态检查 `tsc --noEmit` 保持 0 错误 0 告警。
