# Specification: Docs Table Self-Healing and Legacy Data Cleansing

## 1. 规范概述 (Overview)

本规范遵循 RFC 2119 关键词（SHALL, SHALL NOT, MUST, SHOULD），确立 SelfWork 文档模块在面对外部导入残屑（Notion Flat Summary）与表格克隆畸变时的自愈与清洗契约。

## 2. 核心行为契约 (Behavioral Contracts)

### 2.1 Notion 扁平汇总残屑段落阻断与清洗契约 (Flat Summary Purge Contract)
1. 任何满足以下特征的段落文本 **MUST** 被认定为外部导入扁平汇总残屑：
   - 以 `|` 开头并以 `|` 结尾；
   - 包含多于 3 次重复出现的词组模式（如 `运算 | 运算`、`Python 写法 | Python 写法`、`结果 | 结果`）；
   - 或者是包含表格全部正文数据压缩连接的单行长文本。
2. 数据加载层与导入净化器 **SHALL** 自动识别并剔除此类段落，**SHALL NOT** 允许其作为正文内容渲染到编辑器画布。

### 2.2 表格克隆列规整与单元格竖线保护契约 (Table Deduplication Contract)
1. 当表格第一行（表头）包含相邻重复列项（如 `header[2k] === header[2k+1]`）时，渲染层与持久化层 **MUST** 自动执行列去重，折叠为单一列项。
2. 表格每行数据在对齐列数时，若单元格因转义字符被历史性多切（如 `A \` 与 `B`），自愈算法 **SHALL** 依据表头列数将其安全合并为 `A \| B`。
3. 表格渲染组件 `TableBlock.tsx` **SHALL** 具备运行时无损自愈能力，确保即使加载到存量旧数据，界面也呈现规整的非克隆表格。

### 2.3 存量数据原地自愈与镜像重新落盘契约 (Legacy Data Healing Contract)
1. 系统 **SHALL** 针对数据库中的存量文档执行确定性物理自愈，将更新写入 SQLite 数据库。
2. 自愈完成后，系统 **SHALL** 触发 `sync_doc_markdown_file`，将 `%APPDATA%\SelfWork\documents\02.3-02.5 集合类型、映射类型与其他内置类型.md` 同步刷新为纯净无瑕的 Markdown 内容。
