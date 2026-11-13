# Design: 纯净三层分区架构与笔记数据库技术设计

## 1. 架构拓扑模型 (Architecture Hierarchy)

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        SelfWork 侧栏分区体系                           │
├────────────────────────────────────────────────────────────────────────┤
│ 📁 私人 (Private Root)                                                │
│   ├── [+ 新建子分区]  [+ 新建数据库]  [+ 新建笔记]                    │
│   ├── 📂 工作项目 (Sub-Partition 1)                                    │
│   │     ├── ⊞ PLM 流程调研表 (笔记数据库：内含多篇带属性笔记)         │
│   │     └── 📑 阶段总结备忘 (独立笔记)                                 │
│   ├── 📂 学习研究 (Sub-Partition 2)                                    │
│   │     ├── 🐍 Python 技术白皮书 (独立笔记)                            │
│   │     └── ⊞ 读书笔记数据库 (笔记数据库)                              │
│   └── 📄 快速备忘灵感 (未分组独立笔记)                                 │
├────────────────────────────────────────────────────────────────────────┤
│ 🕒 最近 (Recent Auto-Aggregation)                                     │
│   └── 自动拉取按 updatedAt 倒序的前 10 个笔记/数据库，点击直达          │
├────────────────────────────────────────────────────────────────────────┤
│ ⭐ 收藏 (Favorites Starred Aggregation)                               │
│   └── 自动聚合所有 isFavorite === true 的笔记与数据库                   │
└────────────────────────────────────────────────────────────────────────┘
```

## 2. 数据模型扩展设计 (Data Model)
- `DocPartition`:
  ```typescript
  export interface DocPartition {
    id: string;
    name: string;
    type: 'private' | 'favorite' | 'recent';
    parentId?: string | null; // 支持子分区挂载于父分区
    sortOrder: number;
    isCollapsed: boolean;
    createdAt: number;
    updatedAt: number;
  }
  ```
- 关联关系：
  - `DocPage.partitionId` -> 绑定所属分区（私人根分区或特定子分区）
  - `DbCollection.partitionId` -> 绑定所属分区（私人根分区或特定子分区）
  - `DbCollectionRow.collectionId` -> 绑定所属数据库，每行对应独立的正文 `DocBlock[]`

## 3. UI 交互流与操作手柄
- 每个子分区悬浮出现快捷操作条：
  - `+ 笔记`：在该子分区下新建独立文档页面；
  - `+ 数据库`：在该子分区下新建多维笔记数据库；
  - `+ 子分区`：在该子分区下继续衍生下一级分类；
  - `🗑️`：删除当前子分区；
  - `✏️`：重命名子分区。
