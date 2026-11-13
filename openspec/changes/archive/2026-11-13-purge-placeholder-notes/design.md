# Design: 虚假占位笔记清空与纯净空状态架构设计

## 1. 架构因果拓扑与状态机设计

```mermaid
flowchart TD
    subgraph Data Layer [数据层: docsDb.ts]
        A[置空内存种子 INITIAL_*] --> B[定向清算旧占位 ID]
        B --> C[物理删除 doc_pages & doc_blocks & db_collections]
        C --> D[同步清除 localStorage 键]
        D --> E[锁定标志位 selfwork_docs_placeholder_purged]
    end

    subgraph UI Layer [视图层: DocsView.tsx]
        F[移除写死的 activeId='col_plm_survey'] --> G{条目数量判定}
        G -- pages.length > 0 or cols.length > 0 --> H[渲染首条活跃文档/表格]
        G -- 全部为空 (length == 0) --> I[渲染极简空状态画布 Empty Workspace Canvas]
        I --> J[提供：+ 新建首篇笔记 / + 新建首个数据库]
    end

    Data Layer --> UI Layer
```

## 2. 状态合法性二分判定与防御
- **状态 1：合法空状态**：用户刚清空或从未创建过笔记，`pages === []` 且 `collections === []`。此时系统不应触发报错或回退到假数据，而必须维持空集合，并展示引导 UI。
- **状态 2：合法有内容状态**：用户新建笔记后，即刻展示编辑器并持久化。

## 3. 定向清理的不可变受限范围 (Blast Radius)
- 定向清理的 ID 严格限定于预设占位常量：
  - `page_plm_readme`
  - `page_python_notes`
  - `page_env_variables`
  - `col_plm_survey`
- 用户的任何自定义 ID（`page_<timestamp>`、`col_<timestamp>`）绝不触碰！
