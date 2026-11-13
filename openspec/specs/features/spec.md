# features Specification

## Purpose
TBD - created by archiving change clean-partitions-and-notes. Update Purpose after archive.

## Requirements

### Requirement: 纯净分区与子分区治理 (Clean Partitions & Sub-Partitions)
系统界面上必须彻底清除所有无业务支撑的占位假入口，确立三大核心根模块，并支持在私人模块下任意创建子分区。

#### Scenario: 建立子分区
- **WHEN**: 用户在私人头部或子分区行右侧点击新建子分区
- **THEN**: 系统生成新的分区记录并允许内联重命名

### Requirement: 笔记数据库与独立笔记双轨创建 (Note Database & Standalone Note)
子分区与私人根目录下支持创建容纳多篇笔记的多维数据库与单篇独立笔记。

#### Scenario: 创建笔记数据库
- **WHEN**: 用户在子分区下点击新建数据库
- **THEN**: 系统生成 DbCollection 并在主工作区打开多维表格视图

#### Scenario: 创建独立笔记
- **WHEN**: 用户在子分区下点击新建笔记
- **THEN**: 系统生成 DocPage 并在主工作区打开块级编辑器

### Requirement: 纯净零占位数据契约 (Zero Placeholder Seed Invariant)
The system SHALL NOT automatically inject or seed any mock placeholder notes or mock databases during initialization.
系统在任何初始化、重置或冷启动过程中，绝对禁止自动写入或展示任何非用户主动创建的示例笔记、假调查问卷或假数据库。

#### Scenario: 初始空状态启动
- **WHEN**: 用户首次启动或重启应用时
- **THEN**: 文档页面列表与多维数据库列表必须均为空集合 (length == 0)，绝对不展示任何测试预置数据

### Requirement: 旧占位物理数据自动定向清算 (Legacy Placeholder Purge Contract)
The system SHALL purge legacy placeholder items from SQLite database and local caches upon startup.
针对旧版本中已持久化写入 SQLite 与缓存的固定占位笔记与数据库，系统必须在初次加载时进行无感安全清算，彻底清除其页面记录、块节点及数据行。

#### Scenario: 清算既有物理占位数据
- **WHEN**: 系统初始化加载文档与数据库服务时
- **THEN**: 检测并物理删除旧的占位 ID (如 `page_plm_readme`, `page_python_notes`, `page_env_variables`, `col_plm_survey`)，确保无任何假数据残留

### Requirement: 优雅空状态与首篇创建引导 (Empty Workspace UX Contract)
The system SHALL render an elegant empty workspace canvas with quick action buttons when no notes exist.
当工作台中不存在任何笔记与数据库时，主视口必须呈现符合 Notion 极简美学的居中引导面板，并提供直接可用的创建动作。

#### Scenario: 空工作区首篇创建
- **WHEN**: 工作区处于无笔记状态且用户点击居中引导区的「新建笔记」或「新建数据库」时
- **THEN**: 系统立即创建首篇空白实体，并自动将其设置为当前激活项载入编辑器

### Requirement: 智能大纲目录索引栏契约 (Auto-Generated Outline & TOC Contract)
The system SHALL dynamically extract headings (H1, H2, H3) from document blocks and render a clickable table of contents on the left pane.
系统必须从文档块流中自动提取各级标题，在左侧区域渲染出层级缩进的大纲目录索引面板，并支持平滑滚动锚点定位。

#### Scenario: 实时目录生成与点击跳转
- **WHEN**: 用户在文档中键入或修改 H1、H2 或 H3 标题块时
- **THEN**: 左侧大纲目录栏必须实时同步呈现对应标题条目，且当用户点击任一条目时，编辑视口平滑滚动至对应正文块

### Requirement: 正文行与标题绝对左对齐契约 (Flush-Left Text Alignment Contract)
The text input baseline of blocks SHALL align horizontally flush with the document title without artificial indentation.
正文文本输入块的水平起点必须与文档大标题的左边缘保持严格平齐，绝对禁止因侧边手柄而产生内部缩进。

#### Scenario: 正文输入起始位置验证
- **WHEN**: 用户聚焦到第一行正文段落开始输入文字时
- **THEN**: 其文本起始光标必须与上方文档标题处于同一垂直基准线，水平偏移量为 0

### Requirement: 大屏响应式视野与版心契约 (Responsive Fluid Workspace Contract)
The workspace layout SHALL adapt to maximized window dimensions without gaping empty voids.
工作台编辑版面必须自适应最大化窗口尺寸，扩展阅读版心并消除左侧巨大空洞。

#### Scenario: 窗口最大化自适应
- **WHEN**: 应用窗口由普通尺寸切换为最大化全屏尺寸时
- **THEN**: 大纲目录栏与正文版心自适应扩展，左右边距自然对称，维持饱满视觉体验
