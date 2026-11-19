# 规格定义: 阶段五（维度 3）富交互与行内极客体验

## 1. 批注与阅读指标数据模型 (Schema Definitions)

### 1.1 文档批注模型 (`DocComment`)
```typescript
export interface DocCommentReply {
  id: string;
  author: string;
  content: string;
  createdAt: number;
}

export interface DocComment {
  id: string;
  pageId: string;
  blockId?: string;
  highlightedText: string;
  content: string;
  author: string;
  createdAt: number;
  isResolved: boolean;
  replies?: DocCommentReply[];
}
```

### 1.2 细粒度阅读指标模型 (`DocReadingMetrics`)
```typescript
export interface DocReadingMetrics {
  totalWords: number;
  chineseChars: number;
  englishWords: number;
  codeLines: number;
  imageCount: number;
  tableCount: number;
  estimatedSilentReadMinutes: number; // 默读时长 (按 350 字/分)
  estimatedSpeechMinutes: number;     // 朗读时长 (按 180 字/分)
}
```

---

## 2. 行为契约 (RFC 2119 Statements)

### REQ-D3.1 行内划词批注与文档评论流 (`DocCommentDrawer`)
1. **SHALL** 在划选文字浮动工具条提供「💬 添加批注」入口；
2. **SHALL** 触发批注后在选区文字包裹 `span.doc-comment-highlight` 微光高亮底纹，并在右侧呼出 `DocCommentDrawer`；
3. **SHALL** 支持在抽屉内查看所有批注列表、按「未解决/已解决/全部」过滤，并支持追加回复与一键解决；
4. **SHALL** 批注数据以 `selfwork_doc_comments_${pageId}` 持久化于本地存储。

### REQ-D3.2 划选即时浮动工具条深度补全 (`FloatingToolbar` 增强)
1. **SHALL** 提供 5 色荧光调色板（黄 `#fef08a40`、绿 `#bbf7d040`、蓝 `#bae6fd40`、紫 `#e9d5ff40`、粉 `#fbcfe840`）；
2. **SHALL** 提供「`」转换为行内代码标签（`<code>...</code>`）；
3. **SHALL** 提供「🧹」一键剥离选区内所有内联样式与标签。

### REQ-D3.3 全局折叠块一键展开与收起 (`DocFoldControl`)
1. **SHALL** 当文档包含 `toggle` 块时，在顶栏呈现「展开全部」与「收起全部」快捷按钮；
2. **SHALL** 点击后一次性更新所有 `toggle` 块的 `properties.isOpen`，并触发原子保存。

### REQ-D3.4 细粒度阅读指标与字数透视卡片 (`DocReadingTimeModal`)
1. **SHALL** 在点击右下角 `DocStatsBadge` 时展开多维指标卡片；
2. **SHALL** 准确拆分中文字数、英文字数、代码行数与双速预估时长；
3. **SHALL** 支持 `Esc` 或点击遮罩退出。
