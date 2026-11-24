# Design: 运行清单动态分类 Tab 方案

1. **Tab 数据派生**：
   - 将 `filterTab` 从 `'all' | 'combo' | 'item'` 改为 `activeCategoryId: string`（`'all'` 或具体的 `category.id`）；
   - 遍历 `categories`，统计每个 `category.id` 下正在运行的 `runningCombos` 与 `runningItems` 总数，仅渲染总数 `> 0` 的分类 Tab（若当前选中的分类在关闭后变为 0，自动回退至 `'all'`）；
   - 保持 `ui-ux-design-engineering` 少字与防溢出规范：Tab 容器支持横向平滑滚动（`overflow-x-auto no-scrollbar`）或紧凑 flex 排列，搜索框置于右侧。
2. **列表过滤**：
   - `visibleCombos` 与 `visibleItems` 同时响应 `activeCategoryId` 与 `searchQuery` 过滤。
   - 在选中具体某分类 Tab 时，列表内不再重复显示每行自带的分类小标签（仅在 `'all'` 视图下保留极简分类标签），避免界面重复冗余。
