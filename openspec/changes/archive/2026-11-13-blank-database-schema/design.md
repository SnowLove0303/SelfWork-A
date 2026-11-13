# Design: 通用空白数据库模型设计

## 1. 架构拓扑
```mermaid
flowchart LR
    A[用户点击 + 数据库] --> B[DocsView.tsx handleCreateCollection]
    B --> C[DEFAULT_BLANK_COLLECTION_SCHEMA]
    C --> D[唯一字段: col_title - 名称 - text]
    D --> E[TableDatabaseView.tsx 渲染纯净表头]
    E --> F[用户按需点击表头 + 自由添加列]
```

## 2. 字段字典定义
```typescript
export const DEFAULT_BLANK_COLLECTION_SCHEMA: CollectionSchemaMap = {
  col_title: {
    id: 'col_title',
    name: '名称',
    type: 'text',
    width: 280,
  },
};
```
彻底淘汰任何包含特定业务名词（如“U2项目管理”、“确认状态”、“关键词”）的硬编码结构。
