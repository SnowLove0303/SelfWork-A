# Proposal: Docs Table Clean UI and Instant Selection Dismiss

## 1. 需求来源与背景 (Origin & Spec-Kit RTM)

- **登记时间**: 2026-11-20 17:09:44 (UTC+8)
- **用户原始事实指纹 (100% 逐字留存)**:
  > “表格一选中，就无法退出选中？另外，表格抬头不要有过多无用的功能按钮和说明，给我保持干净，相关功能移到右键”

### 1:1 需求物理对账矩阵 (RTM)

| 需求 ID | 需求契约与场景故事 | 核心交付目标 |
|:---:|---|---|
| **REQ-SELECTION-DISMISS** | **选区即时坍缩与全局外部脱离机制**：解决当前表格多选一旦触发就无法退出的死锁缺陷。1. 普通单击任意单格（无Shift）立即坍缩并清除多选状态；2. 点击表格外部任意区域自动清除多空格选区；3. 按 Esc 键无条件退出选区。 | 彻底根除选区粘滞，实现点哪退哪、进退自如。 |
| **REQ-CLEAN-TABLE-HEADER** | **表格抬头极致净化与消除文案堆砌**：解决表格上方和下方堆砌过多无用功能按钮与冗长操作提示的 Anti-AI-Slop 痛点。移除顶部常驻平铺的“对齐、底纹、斑马纹、首行表头、复制MD、删除整表”等按钮，移除底部长串说明文案，保持画布极致纯净。 | 表格正文呈现如 Word/Notion 般通透高质感，无视觉噪音。 |
| **REQ-RIGHTCLICK-CONVERGENCE** | **全功能收敛归口至右键上下文菜单**：将从抬头剥离的全部功能无损收敛进右键菜单（Word 式 Mini Toolbar + 剪贴板 + 插入 + 删除 + 表格样式外观【表头开关/斑马纹开关】 + 尺寸几何分布）。 | 功能零丢失，操作在右键就地一键直达。 |

---

## 2. 拟变范围与保持现状承诺清单 (Dual Scope Invariants)

### 2.1 拟变范围清单 (Proposed Changes)
- `src/components/docs/editor/TableBlock.tsx`: [Root Component]
  - 选区状态机：添加单击单格即时坍缩（`setSelectedRange(null)`）与全局外部 `mousedown` 脱离监听；
  - 界面净化：移除抬头平铺的 6 大功能按钮，移除底部长串文本说明，仅保留极简微指示；
  - 右键菜单增强：在 `TableContextMenu` 增设“表格样式 (首行表头/斑马纹)”分类，收纳复制 Markdown 与删除整表。

### 2.2 保持现状承诺清单 (Invariant Scope)
- 既有单元格边框闭合几何系统（`border-collapse: collapse`、`1px solid rgba(255,255,255,0.08)`）绝对保持现状；
- 既有 Word 9 宫格对齐与莫兰迪底纹算法 100% 保持可用（移至右键 Mini Toolbar 与菜单中）；
- 既有 TSV / Markdown 矩阵复制粘贴机制 100% 保持稳定；
- 既有文本划选浮动格式工具条（`FloatingFormatToolbar`）100% 保持可用；
- `docHealingService.ts` 纯文本防崩溃自愈防线 100% 保持原样。
