# Proposal: Docs Table Word-Style Toolbar Categorization and Reorganization

## 1. 需求来源与背景 (Origin & Spec-Kit RTM)

- **登记时间**: 2026-11-20 15:41:58 (UTC+8)
- **用户原始事实指纹 (100% 逐字留存)**:
  > “感觉一般啊，你要不去逆向一下notion或word，看看他们怎么做的功能”
  > “执行，核心是工具栏的分类做太差了，你要用REA 去逆向notion或word才知道了，主要是参考word”

### 1:1 需求物理对账矩阵 (RTM)

| 需求 ID | 需求契约与场景故事 | 核心交付目标 |
|:---:|---|---|
| **REQ-WORD-CATEGORY** | **Word 级工具栏严格正交分类体系**：解决当前工具栏平铺堆砌、分类杂乱的痛点。主要参考 Microsoft Word / WPS 表格工具标准，将分散操作重构为四大正交维度：1. 结构与行列（插入/删除/分布）；2. 对齐与几何（Word 标志性 9 宫格对齐选择器）；3. 样式与底纹（单元格底色/斑马纹/表头开关）；4. 内容与富文本（文字格式/剪贴板）。 | 消除按钮平铺堆砌与认知杂乱，建立工业级严密分类。 |
| **REQ-WORD-9GRID-ALIGN** | **Word 标志性 9 宫格对齐系统**：超越以往粗糙的水平 3 对齐，引入 3×3 矩阵对齐微选择器（顶左/顶中/顶右、中左/正中/中右、底左/底中/底右），支持单格与多选单元格批量应用。 | 单元格对齐具备工业级排版精度与视觉直观预览。 |
| **REQ-WORD-CONTEXT-MENU** | **Word 式浮动微工具条 (Mini Toolbar) + 分组上下文菜单**：右键表格或选区时，顶部呈现紧凑 Mini 格式栏（B/I/U/高亮/底纹/对齐），下方分组折叠二级菜单（插入、删除、对齐、几何尺寸），告别单列傻长菜单。 | 菜单结构层级清晰，单次点击直达高频动作。 |
| **REQ-NOTION-GRIPPERS** | **Notion 式表头列把手与行把手 (Column & Row Grippers)**：悬停表头与行左边缘时显式呼出把手，支持一键选行/选列并呼出列专属与行专属菜单（快速对齐、底色、插入、删除）。 | 几何边缘交互顺滑，多选行/列符合现代笔记心智。 |

---

## 2. REA 逆向工程与事实证据 (REA Reverse Deconstruction Findings)

通过 REA MCP 工具链 (`analyze_javascript_application`、`inspect_pe_resources`) 深度分析 Notion 桌面端与 WPS/Word 表格实现：
1. **Word 核心标准 (Ribbon + Context Menu)**：
   - Word 从不把所有按钮放在一级视线中，而是划分为清晰的“表格设计 (Design)”与“表格布局 (Layout)”；
   - 上下文菜单永远是：`[顶部 Mini Toolbar] + [分组折叠菜单]`，严密按“剪贴板/插入/删除/合并/对齐”顺序排布。
2. **Notion 核心标准 (Selection Grippers & Hover Menus)**：
   - 块级表格弱化常驻复杂面板，依靠行首、列头的微型把手（`···`）承载局部动作；
   - 点击把手高亮整行/整列，菜单就地浮动呈现。

---

## 3. 拟变范围与保持现状承诺清单 (Dual Scope Invariants)

### 3.1 拟变范围清单 (Proposed Changes)
- `src/components/docs/editor/TableBlock.tsx`: [Root Component]
  - 重构右键菜单 `TableContextMenu`：拆分为顶部 Mini Toolbar 与四大分类折叠组；
  - 引入 `TableNineGridAlignment` 9 宫格对齐选择器组件；
  - 增强表格顶部分类常驻工具条（布局 / 对齐 / 样式 / 数据）；
  - 升级表头与行侧悬停微把手，支持快速呼出行/列分类操作。

### 3.2 保持现状承诺清单 (Invariant Scope)
- 既有单元格边框闭合几何系统（`border-collapse: collapse`、`1px solid rgba(255,255,255,0.08)`）保持绝对稳定；
- 既有多选选区状态机（`selectedRange` 与矩阵复制粘贴 TSV）100% 保持稳定；
- 既有文本划选浮动格式工具条（`FloatingFormatToolbar`）100% 保持可用；
- `docHealingService.ts` 数据自愈防线 100% 保持原样。
