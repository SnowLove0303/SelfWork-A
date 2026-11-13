# Proposal: 彻底清空所有虚假占位笔记与数据库，建立纯净空状态体验

## Why
在早期的功能原型演示阶段，系统内硬编码了“PLM项目说明”、“python白梳理”、“01.2.2 环境变量”以及“PLM流程调研”等调研示例笔记与数据库行记录。用户在正式使用时，这些示例数据属于虚假占位内容，不仅造成混淆，而且占用了“私人”、“最近”、“收藏”列表的空间。用户明确要求清空所有虚假的占位笔记。

## What Changes
1. **种子数据源全面清空**：
   - 将 `INITIAL_DOC_PAGES`、`INITIAL_COLLECTIONS`、`INITIAL_COLLECTION_ROWS`、`INITIAL_ROW_PAGE_BLOCKS` 全部置为空集合，系统彻底停止自动播种任何虚假占位数据。
2. **已有物理库与缓存定向清除**：
   - 在数据加载阶段增加一次性占位清理机制，精准剔除旧的固定占位 ID（`page_plm_readme`, `page_python_notes`, `page_env_variables`, `col_plm_survey` 及相关 blocks/rows），确保旧物理库与 localStorage 得到彻底净化。
3. **DocsView 默认焦点与空状态优化**：
   - 移除 `DocsView.tsx` 中写死的 `'col_plm_survey'` 默认选中逻辑；
   - 当没有笔记或数据库时，主工作区展示优雅的极简空状态画布，并提供快捷创建独立笔记和笔记数据库的交互。

## 1:1 需求对账矩阵注入 (Spec-Kit RTM Alignment)
- **REQ-PURGE-01**: 彻底清空内置预置示例笔记（清除 INITIAL_DOC_PAGES，初始文档数为 0）；
- **REQ-PURGE-02**: 彻底清空内置预置多维数据库及记录行（清除 INITIAL_COLLECTIONS 及 INITIAL_COLLECTION_ROWS）；
- **REQ-PURGE-03**: 物理数据库与本地缓存彻底同步清算（定向剔除旧占位物理数据，冷重启零残留）；
- **REQ-PURGE-04**: 纯净空状态交互与引导呈现（无笔记时优雅呈现空状态引导，快捷创建首篇笔记或数据库）。

## 验收标准与交付物
1. 启动应用后，「私人」、「最近」、「收藏」没有任何假笔记与假数据库；
2. 本地 SQLite 物理数据库中占位记录全部清除；
3. 主视口居中呈现纯净空状态，点击快捷按钮可正常创建新笔记并进入编辑；
4. `tsc --noEmit` 零警告零错误，`cargo test` 全绿通过。
