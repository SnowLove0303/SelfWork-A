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

### Requirement: REQ-TODO-BORDER-01 待办清单输入栏高亮白色分割线移除
待办清单视图中的快捷任务录入栏下方 SHALL NOT 渲染横向高亮白色边框或分割线，任务录入栏与任务卡片列表之间 SHALL 保持一体化自然背景过渡。

#### Scenario: 待办清单录入区视觉一体化
- **GIVEN** 用户处于“待办清单”模块
- **WHEN** 查看顶部任务录入条与下方任务列表
- **THEN** 录入栏下方无任何多余高亮白色水平线或分割边界，整体暗黑磨砂质感连续统一

### Requirement: REQ-DOC-TITLE-SCALE-02 笔记大标题字号优雅收敛
笔记文档编辑视图中的主标题输入框 SHALL 采用更精炼克制的字号与字重（`text-2xl font-semibold`，约 24px），在保持主视觉识别度的同时与正文各级块建立和谐的字阶梯度。

#### Scenario: 笔记大标题字阶展示
- **GIVEN** 用户打开一篇笔记进行编辑
- **WHEN** 查看或输入文档大标题
- **THEN** 标题文字呈现现代知识库风格的紧凑优雅字阶，不再呈现压迫感过强的大号粗重字体

### Requirement: REQ-DOC-OUTLINE-LAYOUT-03 笔记标题靠左与目录大纲右侧相对缩进
文档编辑主工作区 SHALL 确立“笔记标题与正文靠左主导、目录大纲相对向右缩进”的排版格局；目录大纲 SHALL 作为右侧伴随式索引栏呈现，SHALL NOT 在正文左侧挤占标题的左对齐阅读起点。

#### Scenario: 目录大纲与正文版式排布
- **GIVEN** 用户在笔记视图中开启目录大纲功能
- **WHEN** 查看整体文档版面
- **THEN** 笔记图标、主标题与正文块严格从视口左侧（保留适度呼吸内边距）起始排布
- **AND** 目录大纲位于正文右侧或作为右侧伴随轨，相对笔记标题向右缩进呈现，且支持顶部一键显隐切换

### Requirement: REQ-RESP-OVERLAP-01 主工具栏与执行报文控制台页眉物理隔离
主工作区工具栏与右侧执行报文控制台之间 SHALL 维持严格的独立布局边界与容器隔离；当执行报文面板展开时，主工具栏的任何功能按钮（包括新建项、执行报文开关等）SHALL NOT 溢出或覆盖到执行报文控制台的页眉与内容之上。

#### Scenario: 窗口缩小下展开执行报文控制台
- **GIVEN** 用户处于“快速启动”模块且窗口处于较小尺寸
- **WHEN** 展开右侧“执行报文”控制台
- **THEN** 主工具栏各按钮与报文控制台页眉保持清晰的物理分割线
- **AND** 主工具栏按钮无任何被报文页眉遮挡或相互堆叠的视觉异常

### Requirement: REQ-RESP-GRID-SQUEEZE-02 启动项大盘容器自适应流式网格
启动项卡片大盘 SHALL 采用基于容器实际可用宽度的自适应流式布局（`repeat(auto-fill, minmax(136px, 1fr))`）；单个启动项卡片的宽度 SHALL NOT 低于 136px 的人体工学安全阈值，SHALL NOT 产生垂直细长畸变或导致卡片内容缺失。

#### Scenario: 紧凑视口下卡片规整自适应排布
- **GIVEN** 窗口尺寸缩减或侧栏/报文面板占用较多横向空间
- **WHEN** 浏览启动项大盘列表
- **THEN** 卡片自动依据当前容器剩余可用宽度自适应折行排布（例如 2 列或 1 列）
- **AND** 每个卡片均保持规整的宽高比与清晰完整的文字及徽章，无内容缺失

### Requirement: REQ-RESP-GLOBAL-PANEL-03 执行报文页眉控制项全量可见与面板弹性平衡
执行报文控制台（`TelemetryPanel`）内部的操作按钮（日志过滤级别、自动滚屏、复制全部、清空报文及关闭面板 X）SHALL 在所有支持的窗口宽度下 100% 完整可见；分类侧栏与报文面板 SHALL 保持黄金空间分配比例，为中间大盘预留充分的操作视野。

#### Scenario: 报文控制台工具栏操作
- **GIVEN** 用户在任何视口宽度下查看执行报文控制台
- **WHEN** 观察报文控制台顶栏
- **THEN** 等级过滤胶囊、滚屏开关、复制按钮、清空按钮及右上角的关闭 X 按钮均完整显示在可视区域内，无任何按钮被推至屏幕外截断

### Requirement: REQ-DOC-PURGE-TOOLBAR-01 文档编辑顶栏右上角快捷插块按钮清理
文档笔记编辑视图的顶部栏右上角 SHALL NOT 渲染 `[目录]`、`[标题]`、`[待办]`、`[代码]` 快捷插入按钮及对应的分割线；顶栏 SHALL 保持极简纯净的面包屑与状态指示。

#### Scenario: 打开笔记查看纯净顶栏
- **GIVEN** 用户在“文档表格”模块打开任意一篇笔记进行查看或编辑
- **WHEN** 观察文档顶栏右上角
- **THEN** 原右上角的 `[目录]`、`[标题]`、`[待办]`、`[代码]` 按钮完全消失
- **AND** 正文编辑区继续支持通过 `/` 斜杠菜单、快捷键进行各类块的自由插入

### Requirement: REQ-LAUNCHER-NATIVE-PICKER-01 唤起原生资源管理器文件选择与自动填充
添加启动项模态框 SHALL 提供显眼的“浏览文件”或“选择本地程序”按钮；点击后 SHALL 唤起 Windows 原生资源管理器文件选择器对话框，选定文件（`.exe`、`.lnk`、脚本或文件夹）后 SHALL 自动将绝对路径填充至目标输入框，并 SHALL 自动推导填充推荐名称。

#### Scenario: 通过资源管理器选择微信可执行文件
- **GIVEN** 用户打开“添加新的启动项”模态框
- **WHEN** 点击“浏览文件”并在 Windows 资源管理器中选定 `Weixin.exe`
- **THEN** 路径输入框自动填充为该文件的完整物理绝对路径
- **AND** 若名称输入框为空，系统自动将名称填充为 `Weixin`
- **AND** 类型自动确立为 `app`

### Requirement: REQ-LAUNCHER-URL-SIMPLIFY-02 网页类型极简录入与高级选项折叠
当启动项类型为“网页直达”时，弹窗 SHALL 仅向用户展示“目标网址 (URL)”与“名称”核心字段；启动参数与工作目录等字段 SHALL NOT 在网页类型下展示，且在其他类型下 SHALL 默认折叠在“高级选项”内。

#### Scenario: 极简添加常用网页
- **GIVEN** 用户在添加弹窗中选择“网页”类型
- **WHEN** 观察表单输入界面
- **THEN** 仅显示“目标网址 (URL)”与“名称”必填项，无复杂的启动参数或工作目录干扰
- **AND** 输入网址并保存后，点击该卡片能够正常在系统默认浏览器中唤起目标网页

### Requirement: REQ-DOCS-DB-SIDEPEEK-WIDTH-01: 数据库行笔记侧边预览抽屉适度加宽
- **SHALL**: 当用户在数据库表格中打开某一行的行详情抽屉时，若抽屉未处于最大化状态，抽屉的基础横向宽度 SHALL 由原先的 580px 适度放宽至 780px（兼顾小屏幕最大安全边界 `max-w-[85vw]`）。

#### Scenario: 默认打开抽屉获得充裕宽度
- **WHEN**: 用户在数据库行点击打开侧边预览抽屉
- **THEN**: 抽屉以 780px（最大 85vw）宽度呈现，多维属性面板与富文本正文视野宽阔，不发生挤压

#### Scenario: 全屏最大化与还原切换
- **WHEN**: 用户点击抽屉顶栏右上角的“放大为全屏”或“还原分栏”按钮
- **THEN**: 抽屉平滑在 `w-full` 全屏沉浸与 780px 加宽模式之间切换

### Requirement: REQ-DOCS-OUTLINE-COLLAPSIBLE-02: 目录大纲栏自由折叠与展开
- **SHALL**: 块编辑器中的目录大纲栏 SHALL 支持动态折叠与展开状态控制。

#### Scenario: 收起目录大纲以扩大正文书写面积
- **WHEN**: 用户在大纲栏顶部点击“收起目录大纲”按钮
- **THEN**: 目录大纲栏平滑收起隐藏，正文编辑区横向宽度自适应撑满，且顶栏右侧展示“展开目录大纲”按钮

#### Scenario: 展开目录大纲以导航文档结构
- **WHEN**: 用户在顶栏点击“展开目录大纲”按钮
- **THEN**: 目录大纲栏重新滑出展开，完整列出标题索引并支持平滑滚动定位

### Requirement: REQ-DOCS-CONTEXT-MENU-POPOVER-01: 划选文本内容右键呼出统一调整弹窗
- **SHALL**: 当用户在文档正文块中划选文字并点击鼠标右键时，系统 SHALL 拦截系统原生右键菜单，并在鼠标坐标处呼出深色磨砂风格的调整弹窗。

#### Scenario: 划选文本右键呼出弹窗
- **WHEN**: 用户在文档编辑区选中一段文字并按下鼠标右键
- **THEN**: 系统阻止默认右键菜单弹出，并在点击坐标处浮现 `BlockContextMenu` 调整面板

#### Scenario: 视窗边界防溢出保护
- **WHEN**: 用户在接近窗口右边缘或下边缘处点击右键
- **THEN**: 弹窗自动计算边界并翻转展开方向，确保面板全部按钮完整位于可见视窗内

#### Scenario: 外部点击与 Esc 平滑关闭
- **WHEN**: 弹窗处于激活状态时，用户在外部空白处点击或按下键盘 Esc 键
- **THEN**: 弹窗立即平滑关闭，不残留遮罩层，编辑焦点平稳恢复

### Requirement: REQ-DOCS-INLINE-FORMATTING-02: 选区行内格式化调整
- **SHALL**: 调整弹窗 SHALL 提供加粗、斜体、删除线、行内代码与清除格式功能，并精准作用于划选的子文本片段。

#### Scenario: 划选文字加粗与行内代码
- **WHEN**: 用户划选子文本并点击弹窗中的“粗体”或“行内代码”
- **THEN**: 目标子文本立即应用相应排版标记，周边未选文字保持不变

#### Scenario: 清除所有格式
- **WHEN**: 用户划选带有格式的文字并点击“清除格式”
- **THEN**: 目标子文本内的排版标记被完全剔除，恢复纯净文本

### Requirement: REQ-DOCS-COLOR-HIGHLIGHT-03: 选区字体颜色与荧光笔高亮背景色调整
- **SHALL**: 调整弹窗 SHALL 提供语义字体色与荧光笔高亮色盘，赋能划选文本的彩色标记。

#### Scenario: 划选应用荧光笔黄色高亮
- **WHEN**: 用户划选文字后在弹窗色盘中点击“鹅黄高亮”
- **THEN**: 划选文本立即渲染为鹅黄柔和背景高亮，提升视觉层级

### Requirement: REQ-DOCS-TURN-INTO-BLOCK-04: 块级类型无缝快捷转换
- **SHALL**: 调整弹窗 SHALL 提供块类型转换功能，保持内容不变地在段落、H1/H2/H3、待办、列表、引用与代码块之间转换。

#### Scenario: 普通正文转换为待办清单
- **WHEN**: 用户在正文块右键点击“待办清单”
- **THEN**: 当前块保持内容不变，左侧出现复选框，块类型平滑转换为 Todo 待办

### Requirement: REQ-DOCS-HEADING-SUBMENU-01: 右键标题二级子弹窗收拢
- **SHALL**: 调整弹窗中的“转换为...”列表 SHALL 将 H1、H2、H3 收拢为统一的【标题 (Headings) ▷】条目，并在鼠标交互时展开二级子弹窗。

#### Scenario: 悬浮标题项展开二级子弹窗
- **WHEN**: 用户在右键调整弹窗中将鼠标移动至“标题 (Headings) ▷”条目
- **THEN**: 在该条目侧方平滑滑出二级子弹窗，清晰列出一级标题、二级标题与三级标题

#### Scenario: 视窗边界防溢出翻转
- **WHEN**: 主菜单位于屏幕右侧边界时
- **THEN**: 二级子弹窗自动向左翻转滑出，确保所有选项 100% 完整可见

#### Scenario: 选择子标题完成转换
- **WHEN**: 用户在二级子弹窗中点击“二级小节标题 (H2)”
- **THEN**: 当前块保持内容不变就地转换为 H2，两级弹窗平滑关闭

### Requirement: REQ-DOCS-EDITOR-MCP-02: 构建文档编辑与测试专属 MCP 工具集
- **SHALL**: 系统 SHALL 构建并注册专注文档编辑原子操作的测试 MCP 工具接口。

#### Scenario: 模拟富文本排版与格式断言
- **WHEN**: 自动化测试智能体调用文档编辑 MCP 工具
- **THEN**: 工具能够准确执行格式包裹、块类型推导与文本状态核验

### Requirement: REQ-DOCS-SWARM-COLLAB-03: 启用原生 Swarm 蜂群协同众测
- **SHALL**: 调度 Antigravity 原生 Swarm 工具组建蜂群，派发独立测试 Worker 对文档编辑功能进行全量边界实测。

#### Scenario: 派发 Swarm 测试 Worker
- **WHEN**: Coordinator 初始化 Swarm 看板并派发 `doc-tester` Worker
- **THEN**: Worker 独立执行排版组合、回车裂变、退格熔断与右键弹窗全量边界测试，并回传缺陷清算清单

### Requirement: REQ-DOCS-AUDIT-CLOSURE-04: 主协调员敌手式认知审计与缺陷根治闭环
- **SHALL**: Coordinator SHALL 对 Worker 报告的各项不到位缺陷进行敌手式认知审计与系统性修复。

#### Scenario: 根治编辑体验缺陷并最终核销
- **WHEN**: 针对 Worker 挑出的编辑不到位缺陷逐项落实代码根治方案
- **THEN**: 生产构建重新验证通过，且出具 1:1 双向物理核销报告
