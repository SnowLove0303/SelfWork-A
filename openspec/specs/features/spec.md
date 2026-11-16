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

### Requirement: 纯净富文本排版与原始HTML标签绝不泄露 (Clean Rich Text & No Raw HTML Invariant)
The system SHALL NOT inject verbose HTML markup containing CSS class strings (such as `<span class="...">` or `<mark class="...">`) into block plain text content.
系统在文档编辑、右键格式化及内容输入过程中，严禁向块的纯文本内容中注入包含冗长 CSS 类名字符串的原始 HTML 标签；所有排版必须保持干净清爽，杜绝尖括号代码与类名泄露到用户编辑视野中。

#### Scenario: 划选文本应用排版格式
- **WHEN**: 用户在编辑器中划选一段文字并通过右键菜单应用格式
- **THEN**: 系统仅应用标准 Markdown 语义标记或纯净内联格式，绝对不插入任何 `<span class="...">` 或 `<mark class="...">` 原始 HTML 代码标签

#### Scenario: 聚焦块进入编辑状态
- **WHEN**: 用户点击任意块进入编辑光标态
- **THEN**: 编辑框内呈现干净的自然文本，绝不出现未解析的 HTML 标签屑

### Requirement: 智能大纲纯文本清洗与防污染 (Clean Outline Plain Text Extraction)
The system SHALL strip all formatting tokens, markdown markers, and tag remnants when extracting headings for the table of contents outline.
系统在动态提取右侧目录大纲条目时，必须自动剥除所有格式控制符与标记符号，保证目录索引呈现清晰、高可读性的纯文本标题。

#### Scenario: 标题块包含格式标记时提取大纲
- **WHEN**: 标题块内容包含加粗、斜体或特殊标点
- **THEN**: 右侧目录大纲栏中呈现的内容为过滤掉标记符号后的纯文本，不包含代码碎片

### Requirement: 顶层文档标题与正文首块去重规范 (Page Title & Block Header Deduplication)
The page title header in BlockEditor SHALL serve as the unique canonical document title, and the document body SHALL NOT duplicate the exact same title as an immediately following H1 block.
页面顶部的文档大标题输入框为当前文档的唯一权威总标题；系统与模板初始化时严禁在正文第一块插入完全重复的 H1 标题与图标，消除视觉上的双重堆叠。

#### Scenario: 载入或初始化文档
- **WHEN**: 用户查看或初始化一篇新文档
- **THEN**: 顶部展示文档图标与页面大标题，正文内容区第一块直接开启章节或段落，不存在重复的相同大标题块

### Requirement: 快速启动新建项端到端生命周期契约 (Launcher New Item E2E Lifecycle Contract)
The launcher dashboard SHALL allow users to create new items for types app, url, script, folder, and bundle, and persist them into the SQLite database.
系统必须支持用户在快速启动界面完整录入应用、网页、脚本、文件夹与捆绑组合五种启动项，并将其原子化持久写入 SQLite 数据库。

#### Scenario: 用户新建应用程序项
- **WHEN**: 用户在快速启动界面点击新建项，选择应用类型，录入可执行程序路径及名称并确认
- **THEN**: 系统生成唯一的 LauncherItem 记录并保存至存储，列表实时呈现该卡片

#### Scenario: 用户新建网页直达项
- **WHEN**: 用户选择网页类型，录入合规的 HTTPS 网址及名称并确认
- **THEN**: 系统自动识别域名并保存为 URL 类型启动项

#### Scenario: 用户新建脚本指令项
- **WHEN**: 用户选择脚本类型，输入待执行的命令行脚本及工作目录并确认
- **THEN**: 系统生成脚本启动项并支持后台静默执行与输出日志收集

### Requirement: 新建项边界校验与防空保护 (Launcher New Item Input Validation & Boundary Defense)
The system SHALL strictly validate required fields during item creation and prevent empty or invalid inputs from polluting the storage.
系统在新建项保存时，必须对必填字段执行确定性校验拦截，杜绝空名称、空目标或空组合写入存储。

#### Scenario: 缺少名称时点击保存
- **WHEN**: 用户未输入启动项名称直接点击确认添加
- **THEN**: 系统拦截保存请求，弹出错误提示并不发生状态变更

#### Scenario: 缺少目标路径时点击保存
- **WHEN**: 用户未输入目标路径直接点击确认添加
- **THEN**: 系统拦截保存请求，杜绝产生空目标脏卡片

### Requirement: 新建项原生图标提取与真实执行验证 (Launcher New Item Icon Extraction & Execution Witness)
The system SHALL automatically extract native high-res icons for executable targets and support direct execution of newly created items.
针对录入的 Windows 可执行文件，系统必须通过原生 IPC 可靠提取 32x32 关联图标并持久化，且新创建的项目能通过原生启动管道真实唤起。

#### Scenario: 自动提取可执行文件图标
- **WHEN**: 用户指定本地存在的 .exe 文件路径
- **THEN**: 系统调用 get_app_icon 返回以 data:image/png;base64, 开头的有效图像指纹

#### Scenario: 真实唤起新创建项
- **WHEN**: 用户点击执行新创建的应用程序或脚本项
- **THEN**: 系统调用原生启动通道启动对应目标，返回成功唤起状态

### Requirement: 快速启动项文件夹模式与表单交互契约 (REQ-LAUNCHER-FOLDER-01 & REQ-LAUNCHER-FOLDER-02)
The system SHALL support `folder` as an explicit launcher item type in the creation/editing modal, and SHALL provide both manual input and native directory browsing capabilities without truncating directory names containing dots.

#### Scenario: 用户在新建启动项中配置文件夹目标
- **WHEN**: 用户在新建启动项模态框中选中“文件夹 (folder)”类型
- **THEN**: 系统将表单输入项自适应为“文件夹路径 *”，并提供“点击右侧按钮选择文件夹，或输入绝对路径...”占位提示
- **WHEN**: 用户点击“浏览选择”按钮
- **THEN**: 系统唤起 Windows 原生 `FolderBrowserDialog`，仅允许选择目录，并将所选完整物理路径回填至表单；若名称为空，则自动填入不带误截断的目录名

### Requirement: Windows 原生文件资源管理器直达唤起契约 (REQ-LAUNCHER-FOLDER-03 & REQ-LAUNCHER-FOLDER-06)
The system SHALL launch the target physical directory directly via the native Windows Explorer channel with zero console window flickering, and SHALL return explicit, user-friendly errors when the directory does not exist.

#### Scenario: 用户点击启动文件夹项
- **WHEN**: 用户在大盘网格中点击一个已配置的文件夹启动项
- **THEN**: 后端检查目标路径，若目标为物理目录，则以原生 `explorer.exe <normalized_path>` 方式直接唤起文件资源管理器打开该目录，无 PowerShell 命令行窗口闪烁
- **WHEN**: 目标文件夹在物理磁盘上已被删除或不存在
- **THEN**: 系统拦截并返回明确中文错误提示（如“目标文件夹不存在: <路径>”），并记录至运行日志，绝不导致应用崩溃白屏

### Requirement: 文件夹专属视觉呈现与组合批量调度契约 (REQ-LAUNCHER-FOLDER-04 & REQ-LAUNCHER-FOLDER-05)
The system SHALL render folder items with an amber category badge and `FolderOpen` icon, and SHALL support folder items as first-class members in bundle and batch launch pipelines.

#### Scenario: 文件夹项在大盘展示与组合调度
- **WHEN**: 文件夹项呈现在仪表盘卡片网格中
- **THEN**: 卡片右上角显示专属“目录”琥珀金色徽标，中央显示 `FolderOpen` 矢量图标与平滑微动效
- **WHEN**: 用户将文件夹项加入组合套件 (Bundle) 或在多选启动中批量触发
- **THEN**: 系统将文件夹项按流水线顺序以 150ms 安全微间隔唤起，实时展示调度反馈与耗时记录

### Requirement: 执行报文控制台默认收起与右侧悬浮抽屉防挤压契约 (REQ-TELEMETRY-RESPONSIVE-01)
The system SHALL initialize the telemetry execution console in a collapsed state by default, and SHALL render it as a non-destructive floating overlay drawer when toggled, ensuring zero squeezing on primary launcher controls regardless of window dimensions.

#### Scenario: 用户进入快速启动台
- **WHEN**: 用户打开或切换到“快速启动”工作台
- **THEN**: 执行报文控制台默认为收起隐藏状态，主卡片大盘与顶部操作工具栏独享全部可用视口宽度，操作按钮（“+ 新建项”、“+ 组合”、“全启动”、“多选启动”）完全舒展呈现，无任何字符被截断为单个“+”

#### Scenario: 用户按需展开与关闭执行报文
- **WHEN**: 用户点击顶栏“执行报文”按钮
- **THEN**: 控制台以平滑右侧抽屉（Overlay Drawer）形式滑出，浮动于内容区右侧，具备磨砂模糊与深度阴影，中间工具栏各功能按钮宽度保持 100% 稳定，绝不发生横向抖动或挤压截断
- **WHEN**: 用户点击控制台右上角关闭按钮（X）或再次点击顶栏“执行报文”按钮
- **THEN**: 控制台平滑收起隐退，恢复全量视口

### Requirement: 左侧导航栏左下角版本信息彻底净化契约 (REQ-SIDEBAR-PURGE-VERSION-02)
The system SHALL NOT render any version string or divider border at the bottom of the main navigation sidebar.

#### Scenario: 用户查看左侧导航栏
- **WHEN**: 用户观察左侧主导航栏底部（无论处于展开状态还是折叠图标状态）
- **THEN**: 左下角不存在 `v0.1.0-alpha` 文本，且不存在任何底部分割横线，导航模块列表下方保持完全纯净透亮

### Requirement: REQ-TELEMETRY-NON-OVERLAY-01 并列协同自适应布局与非覆盖式渲染契约
The system SHALL support side-by-side parallel collaborative layout when expanding the telemetry execution console, MUST NOT overlay or cover the main quick launcher content, and SHALL adapt the card grid and top toolbar dynamically.

#### Scenario: 展开执行报文时大盘卡片自适应重排且零遮挡
- **WHEN** 用户点击顶栏“执行报文”按钮展开控制台时
- **THEN** The system SHALL render the telemetry panel as a direct parallel flex child on the right with width `w-[290px] xl:w-[350px] shrink-0`
- **THEN** The system SHALL shrink the main quick launcher area width dynamically, and the card grid SHALL recalculate columns via `repeat(auto-fill, minmax(136px, 1fr))`
- **THEN** All launcher item cards SHALL remain 100% visible with 0% overlay coverage from the telemetry panel
- **THEN** All top toolbar controls SHALL remain fully visible and clickable without text truncation or squishing

#### Scenario: 收起执行报文时大盘平滑回弹复原
- **WHEN** 用户点击报文关闭按钮或再次点击“执行报文”按钮时
- **THEN** The system SHALL unmount the telemetry panel and restore the main launcher area to full width

### Requirement: REQ-TELEMETRY-HEADER-CONTAINMENT 报文控制栏防溢出与呼吸边隙契约
The system SHALL contain all telemetry control buttons strictly within the panel header bounds without overflowing, and MUST maintain adequate breathing padding from the right border.

#### Scenario: 报文顶栏控制按键完全位于容器内且留有安全内边距
- **WHEN** 执行报文面板处于展开状态时
- **THEN** The system SHALL render all header controls (filter capsules, scroll lock, copy, clear, close) within the header boundary with zero overflow
- **THEN** The system SHALL ensure the close button (`✕`) maintains at least 10px breathing clearance from the right panel border

### Requirement: REQ-TOOLBAR-BREATHING-SPACE 顶栏工具链呼吸空间与视觉韵律契约
The system SHALL provide comfortable breathing room between toolbar buttons and container boundaries, eliminating cramped button clusters.

#### Scenario: 快速启动顶部工具栏按键间隙与边距舒展
- **WHEN** 用户浏览快速启动大盘顶部工具栏时
- **THEN** The system SHALL space action buttons with a minimum gap of 8px to 10px (`gap-2 ~ gap-2.5`)
- **THEN** The system SHALL pad the toolbar container with `px-4 md:px-5`, maintaining balanced margins between elements and outer edges

### Requirement: REQ-PURGE-USELESS-TELEMETRY-FOOTER 报文底栏废话调试说明彻底清除契约
The system SHALL purge redundant developer debug footers from the telemetry panel to uphold radical text economy.

#### Scenario: 彻底清除底层 IPC 调试说明
- **WHEN** 用户查看执行报文面板时
- **THEN** The system MUST NOT render `POWERSHELL IPC DAEMON READY` or `UTF-8 / CREATE_NO_WINDOW` or any redundant debug text at the panel bottom

### Requirement: REQ-SWARM-DOCS-TABLE-DELEGATE 文档表格模块专属 Swarm 智能体编组派发契约
The system SHALL initialize and maintain a dedicated Swarm worker specifically designated for the documentation and data table module.

#### Scenario: 成功挂载文档表格专属 Swarm Worker
- **WHEN** 集群调度器执行 Swarm 派发时
- **THEN** The system SHALL register a worker named `docs-table-worker` with a brief dedicated to docs and tables engineering
- **THEN** The worker status SHALL be verifiable via Swarm status inspection

### Requirement: REQ-LAUNCHER-PICKER-HEX-UTF8 选择器通道十六进制无损编码传输契约
The system SHALL transfer selected file and folder paths via hexadecimal UTF-8 encoding across the PowerShell process boundary to ensure 100% lossless multi-byte character preservation regardless of system code pages.

#### Scenario: 选取中文物理路径文件夹无乱码
- **WHEN** 用户通过“浏览选择”选取包含中文字符的目录或文件时
- **THEN** The system SHALL serialize the path as UTF-8 bytes and output as an ASCII hex string from PowerShell
- **THEN** The Rust backend SHALL decode the hex string into raw UTF-8 bytes and reconstruct the path without replacement characters (`\u{FFFD}`)
- **THEN** The returned path SHALL strictly match the physical path on disk

### Requirement: REQ-LAUNCHER-CORRUPTED-TARGET-REPAIR 既有损坏目录启动项数据自愈契约
The system SHALL repair existing corrupted launcher item targets in SQLite database to restore launchability.

#### Scenario: 自愈修复 MSDS 重写版中文目录项
- **WHEN** 检查启动项存储数据时
- **THEN** The system SHALL rectify the corrupted path of `MSDS 重写版` to `F:\App Location\Guanzhi Tong\Skill\MSDS-Engine\算法训练材料\TDS MSDS 重写版`
- **THEN** Clicking the card SHALL successfully launch Windows Explorer to open the physical directory

### Requirement: REQ-TILING-PRESET-CONFIG 组合分屏预设与象限槽位绑定契约
The system SHALL allow configuring screen window tiling layouts and binding child items to screen slots for combo launcher items.

#### Scenario: 用户为组合选择四分屏模板并指派子项到四个象限
- **WHEN** 用户在组合创建/编辑面板开启“屏幕窗口布局编排”时
- **THEN** The system SHALL present visual layout presets including 2x2 grid (`grid-4`), horizontal split (`split-h`), vertical split (`split-v`), and main-aside split (`main-aside-3`)
- **THEN** When selecting `grid-4`, the system SHALL provide 4 slots corresponding to Top-Left (0, 0, 50%, 50%), Top-Right (50%, 0, 50%, 50%), Bottom-Left (0, 50%, 50%, 50%), and Bottom-Right (50%, 50%, 50%, 50%)
- **THEN** The user SHALL be able to assign combo member items to each slot
- **THEN** The configured windowLayout data SHALL be persisted to SQLite app_settings without loss

### Requirement: REQ-TILING-AUTOMATED-PLACEMENT 启动组合时窗口自动吸附平铺契约
The system SHALL automatically arrange and position launched windows into designated screen quadrants upon combo activation.

#### Scenario: 一键启动四分屏组合并自动平铺四个窗口
- **WHEN** 用户在大盘点击配置了 `grid-4` 分屏的组合卡片或“启动组合”按钮时
- **THEN** The system SHALL sequentially launch all targets in the combo
- **THEN** The system SHALL invoke `arrange_combo_windows` with the normalized slot coordinates
- **THEN** The system SHALL query the desktop work area excluding Windows taskbar
- **THEN** The system SHALL locate the window handles (HWND) of the launched explorer or app instances and call Win32 `SetWindowPos` to tile each window into its designated quadrant
- **THEN** All 4 windows SHALL tile seamlessly across the screen matching the user's expected 2x2 grid layout
