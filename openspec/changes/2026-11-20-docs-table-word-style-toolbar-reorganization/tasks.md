# Tasks: Docs Table Word-Style Toolbar Categorization and Reorganization

## 1. 任务实施概览与执行锁状态

- [x] **Task 1: 建立 3×3 九宫格对齐选择器组件 (`TableNineGridAlignment`)**
  - **因果角色**: [Alignment UI Component]
  - **关联需求**: REQ-WORD-9GRID-ALIGN
  - **核心动作**:
    1. 在 `TableBlock.tsx` 编写 `TableNineGridAlignment` 组件，以 3×3 图标网格直观展现 9 种对齐；
    2. 支持单格以及多选选区矩阵批量应用垂直对齐与水平对齐；
    3. 在单元格样式中无缝联动 `align-items` / `justify-content` 或 `text-align` 与 `vertical-align`。
  - **实测验证**: `cd "F:\App Location\SelfWork" ; pnpm check` 零警告零错误。

- [x] **Task 2: 重构右键上下文菜单为 Word 式层级结构 (Mini Toolbar + 分组二级菜单)**
  - **因果角色**: [Context Menu Reorganization]
  - **关联需求**: REQ-WORD-CONTEXT-MENU, REQ-WORD-CATEGORY
  - **核心动作**:
    1. 顶部挂载 Mini Toolbar：加粗、斜体、下划线、删除线、高亮、底纹下拉、9 宫格对齐入口、清除格式；
    2. 菜单主体按标准正交分组：
       - `剪贴板` (复制 TSV/MD、批量清空)
       - `插入 ▸` (向上/向下插入行、向左/向右插入列)
       - `删除 ▸` (删除行、删除列、删除表格)
       - `几何分布` (平均分布各行、平均分布各列)；
    3. 支持鼠标悬停展开平滑二级子菜单，消除单列冗长杂乱。
  - **实测验证**: `cd "F:\App Location\SelfWork" ; pnpm check` 零警告零错误。

- [x] **Task 3: 引入单元格底纹/填充色与斑马纹系统 (`table:cell-shading`)**
  - **因果角色**: [Cell Styling & Theming]
  - **关联需求**: REQ-WORD-CATEGORY
  - **核心动作**:
    1. 扩展单元格数据模型，支持单个或选区批量设置背景底色；
    2. 提供 8 色暗黑莫兰迪低饱和度预设色卡（透灰、透蓝、透绿、透黄、透橙、透红、透紫与无底色）；
    3. 增加表头行强调与隔行斑马纹快速切换开关。
  - **实测验证**: `cd "F:\App Location\SelfWork" ; pnpm check` 零警告零错误。

- [x] **Task 4: 升级表头与行侧 Notion 式微把手 (Column/Row Grippers)**
  - **因果角色**: [Edge Interaction Handles]
  - **关联需求**: REQ-NOTION-GRIPPERS
  - **核心动作**:
    1. 表头顶部悬停浮现列把手，点击呼出列专属面板（对齐、底色、插入、删除）；
    2. 行左侧悬停浮现行把手，点击呼出行专属面板（插入、清空、删除、底色）；
    3. 完善聚焦状态下的顶部分类工具条。
  - **实测验证**: `cd "F:\App Location\SelfWork" ; pnpm check` 零警告零错误。

- [x] **Task 5: 全量编译、应用部署、1:1 双向物理核销与发布**
  - **因果角色**: [Build & Verification]
  - **关联需求**: REQ-WORD-CATEGORY, REQ-WORD-9GRID-ALIGN, REQ-WORD-CONTEXT-MENU, REQ-NOTION-GRIPPERS
  - **核心动作**:
    1. 执行前端与 Tauri Release 完整编译；
    2. 部署替换 `SelfWork.exe` 并验证进程；
    3. 更新 `CHANGELOG.md` 并执行 git 原子提交；
    4. 呈报 1:1 双向核销交付报告。
  - **实测验证**: 真实编译退出码 0，桌面端进程稳定存活。
