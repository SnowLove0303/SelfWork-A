# 规格定义: 阶段五（维度 4）数据工程与全库深度管理

## 1. 数据模型与契约 (Schema Definitions)

### 1.1 文档软删除属性扩展 (`DocPage`)
```typescript
export interface DocPage {
  id: string;
  title: string;
  icon?: string;
  cover?: string;
  parentId?: string | null;
  partitionId?: string | null;
  collectionId?: string | null;
  properties?: Record<string, any>;
  isFavorite: boolean;
  isArchived: boolean;
  isDeleted?: boolean;  // 软删除标记 (默认 false/undefined)
  deletedAt?: number;   // 软删除时间戳
  createdAt: number;
  updatedAt: number;
}
```

### 1.2 全局搜索匹配项契约 (`GlobalSearchResult`)
```typescript
export interface GlobalSearchResult {
  pageId: string;
  pageTitle: string;
  pageIcon?: string;
  partitionId?: string;
  blockId: string;
  blockType: string;
  content: string;
  matchSnippet: string;
  score: number;
}
```

---

## 2. 行为契约 (RFC 2119 Statements)

### REQ-D4.1 全库块级全局模糊检索引擎 (`DocGlobalSearchModal`)
1. **SHALL** 监听全局快捷键 `Ctrl+Shift+F` 唤出全局检索模态框，按 `Esc` 或遮罩关闭；
2. **SHALL** 从 LocalStorage 索引的全库块数据及 SQLite 缓存中扫描匹配关键字；
3. **SHALL** 支持按块类型过滤器（全部、正文、代码、表格、待办、标题）；
4. **SHALL** 支持键盘 `↑` / `↓` 移动焦点，`Enter` 键平滑选中并切换到目标页面，自动高亮该块。

### REQ-D4.2 文档废纸篓与软删除恢复机 (`DocTrashDrawer` & `docTrash.ts`)
1. **SHALL** 在正常侧边栏列表过滤掉 `isDeleted === true` 的文档；
2. **SHALL** 侧边栏底部提供常驻「🗑️ 废纸篓」入口及计数角标，点击滑出抽屉；
3. **SHALL** 抽屉内列出已软删除文档、删除时间与 30 天保留倒计时；
4. **SHALL** 支持「还原」按钮，将页面 `isDeleted` 设为 `false` 并还原至原分区；
5. **SHALL** 支持「彻底粉碎」按钮，弹窗二次确认后真正物理删除页面及相关块数据；
6. **SHALL** 提供「清空废纸篓」一键粉碎全部已软删除页面。

### REQ-D4.3 文档侧栏多选批量管理 (`DocBatchManager`)
1. **SHALL** 在侧边栏工具栏提供「☑️ 批量操作」切换按钮；
2. **SHALL** 开启批量模式后，每个页面项左侧呈现复选框，支持勾选多个文档；
3. **SHALL** 选中 $\ge 1$ 篇文档时，浮出批量操作底栏：
   - 批量移至分区（选择私人、工作区或自定义子分区）；
   - 批量移入废纸篓（软删除）；
   - 批量导出为 Markdown（合并或打包）；
   - 批量收藏 / 取消收藏。

### REQ-D4.4 外部 Markdown 批量导入还原器 (`DocBatchImporter` & `markdownImport.ts`)
1. **SHALL** 提供多选本地 `.md` 文件上传入口；
2. **SHALL** 逐份解析 Markdown 文本为 SelfWork 结构化 `DocBlock` 数组：
   - `# 一级标题` -> `h1`
   - `## 二级标题` -> `h2`
   - `### 三级标题` -> `h3`
   - `- [ ] / - [x]` -> `todo`
   - ` ```lang ... ``` ` -> `code`
   - `> ...` -> `quote`
   - `| col |` -> `table`
   - 普通段落 -> `p`
3. **SHALL** 自动生成 `DocPage` 并将所有块持久化存入当前分区，随后刷新页面列表。
