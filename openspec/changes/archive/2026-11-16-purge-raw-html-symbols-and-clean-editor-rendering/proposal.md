# Proposal: 彻底清除富文本原始HTML标签与符号堆叠、统一净空编辑器渲染流

## 1. 业务背景与问题根因 (Background & Root Cause)
用户在查看与编辑测试笔记时指出：“怎么笔记的符号那么多个”、“当我指出了一处具体的问题的时候，就代表这这个问题不止如此，也不只有此处有问题，执行”。
经过深度 5-Whys 根因穿透，发现文档编辑器存在以下系统性缺陷：
1. **原始 HTML 标签泄露与源码裸露**：此前右键菜单的文字颜色与高亮直接向文本注入了长串 `<span class="text-rose-400">` 与 `<mark class="bg-yellow-400/20...">` 字符串。用户在 `<textarea>` 编辑状态下，几十个字符的 CSS 类名直接暴露，视觉上充斥着尖括号与代码碎片。
2. **顶层标题与首块冗余重叠**：`BlockEditor.tsx` 页面顶部已有独立的大图标与大标题输入框（`page.title`），但测试数据又在正文第一块插入了完全相同的 `h1` 标题与相同 emoji，导致顶部出现大标题双重堆叠。
3. **大纲与面包屑脏标记污染**：右侧目录大纲直接提取 `b.content.trim()`，导致带标记的块在侧边大纲栏显示混乱的原始符号。
4. **数据库残留历史测试脏数据**：SQLite 数据库中残留了包含大量 HTML 标签的旧测试块。

## 2. 改进方案与核心目标 (Solution & Goals)
1. **全面净化内联排版机制**：
   - 从 `BlockContextMenu.tsx` 中彻底废除直接向文本注入长串 `<span class="...">` 与 `<mark class="...">` 的恶劣做法；
   - 统一转为干净、标准的轻量排版或块级原生样式，杜绝任何 HTML 代码类名泄露到用户编辑框中；
   - 在 `BlockItem.tsx` 中增加清洗过滤机制，对文本中的 HTML 尖括号标签进行净化。
2. **大纲纯文本提取清洗**：
   - 在 `BlockEditor.tsx` 中优化 `outlineHeadings`，自动过滤 Markdown 语法标记（`**`, `*`, `~~`, `` ` ``）与残留标签，确保大纲呈现干净清爽的纯文本条目。
3. **顶层标题与首块职责分明**：
   - 页面大标题（`page.title`）负责文档总命名，文档首块不再冗余插入重复的 `h1` 大标题。
4. **深度清洗 SQLite 物理数据库测试数据**：
   - 清洗测试文档，剔除所有残留的 HTML 标签与冗余标题，恢复为自然、清爽、优雅的极简笔记。

## 3. 拟变范围与保持现状承诺 (Scope & Invariants)
- **拟变文件清单**：
  - `src/components/docs/editor/BlockItem.tsx` (输入清洗与渲染去噪)
  - `src/components/docs/editor/BlockContextMenu.tsx` (移除生硬的 HTML 类名注入，统一排版)
  - `src/components/docs/editor/BlockEditor.tsx` (大纲纯文本清洗与防重叠)
  - `scripts/seed_test_doc.py` / SQLite 数据库 (清洗脏数据)
- **保持现状承诺**：
  - 严禁触碰 SQLite 核心表结构（字段定义完全不变）；
  - 保持块类型枚举（`p`, `h1`, `h2`, `h3`, `bullet`, `todo`, `quote`, `code`, `divider`, `table`）完全稳定；
  - 保持行首 Markdown 速记（`# `, `## `, `[] `, `- `, `> `, `---`）与键盘流行为不受影响。
