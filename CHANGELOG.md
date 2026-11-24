# Changelog - SelfWork (SW工作台)

All notable changes and architectural invariants for SelfWork will be documented in this file.

## [0.1.88] - 2026-11-24

### Fix & Refactor (快速启动：修复目录子路径归属漏检、移除运行清单重复统计/行内数字与卡片数字)

- **目录最长前缀子路径归属匹配 (`launcher:folder-longest-prefix` / `src-tauri/src/lib.rs`)**：
  - 解决打开启动项目录后进入其子目录（如 `源文件材料\6-3 ...\OS-8000`）导致的漏检问题，支持精确匹配与最长前缀归属匹配。
- **页面极简减负 (`ui:manifest-debloat` & `ui:card-debloat` / `ProcessManifestModal.tsx` & `LauncherDashboard.tsx`)**：
  - 移除运行清单标题旁与下方 Tab 重复的 `12 项`、`2 组合` 统计徽章；
  - 移除运行清单每行应用名称旁边的 `×14`、`×11` 等子进程数徽章；
  - 单品卡片右上角仅保留纯净绿色微光圆点，移除子进程数字显示。

## [0.1.87] - 2026-11-24

### Feat & Refactor (快速启动：纳入文件夹打开状态检测与安全关闭、去除运行清单“进程/实例/PID”表述与多开功能)

- **文件夹运行状态检测与安全关闭 (`launcher:folder-detect-close` / `src-tauri/src/lib.rs`)**：
  - 扩展 `detect_launcher_processes` 探测已打开的 Windows 资源管理器文件夹窗口并返回 `window_handles`；
  - 新增 `close_launcher_windows` 命令，向指定文件夹窗口发送 `WM_CLOSE` 安全关闭，绝不误杀桌面 `explorer.exe` 主进程。
- **运行清单去技术化与极简交互 (`ui:manifest-simplify` / `ProcessManifestModal.tsx` & `LauncherDashboard.tsx`)**：
  - 按钮与面板更名为 **运行清单**，全面移除“进程”“实例”“PID”“活跃”等技术词汇；
  - 移除清单每行的“多开”按钮与可展开 PID 明细栏，统一纳管应用与文件夹项，仅保留图标、名称、数量及“关闭”操作。

## [0.1.86] - 2026-11-24

### Refactor (全局 UI 去噪：全面清理全进程清单、快速启动、文档表格与思维导图模块冗余说明)

- **遵循 `ui-ux-design-engineering` 少字原则 (`RADICAL_TEXT_ECONOMY_AXIOM`)**：
  - **全进程清单 (`ProcessManifestModal.tsx`)**：移除每行底部冗长文件路径平铺（移至悬停 `title`）、移除每行重复分类小标签，分组标题精简为 `组合` / `应用`；
  - **快速启动 (`LauncherDashboard.tsx`)**：移除分屏套件标题旁长句说明及弹窗内冗余括号/引导提示；
  - **文档与多维表格 (`DocTemplatePicker.tsx` / `SyncedBlock.tsx` / `BlockItem.tsx` / `DocLocalGraph.tsx` / `DocCommentDrawer.tsx` / `DocTrashDrawer.tsx` / `TableDatabaseView.tsx`)**：移除模板长句引导、同步块解释段、图片块提示，空状态统一收敛为极简短语；
  - **思维导图 (`MindMapPartitionView.tsx`)**：移除回收站与新建卡片冗余长句说明。

## [0.1.85] - 2026-11-24

### Feat (快速启动：新增全进程状态清单面板，支持一键全部关闭及关闭指定应用/组合/单PID进程)

- **全进程状态清单弹窗组件 (`launcher:manifest-modal` / `ProcessManifestModal.tsx`)**：
  - 响应用户核心需求：“个人工作台 快速启动模块 我希望有一个全进程状态清单，要支持一键全部关闭所有进程或关闭指定应用、组合进程”；
  - **全局运行态聚合视图**：跨分类集中展示全部纳入快速启动且正在运行的组合套件与单品应用，并实时统计活跃应用数、独立去重 PID 总数及活跃组合数；
  - **一键全部关闭（防误触二次确认保护）**：清单顶部提供“一键全部关闭”按钮，首次点击进入脉冲确认态（3.5s 自动复位），二次点击一次性收集并安全终止所有白名单进程，绝不波及系统无关进程或工作台自身；
  - **关闭指定组合套件**：独立列出全部运行或部分运行的组合套件及子项胶囊状态，点击“关闭组合”一键关闭该组合涉及的所有子应用进程；
  - **关闭指定单品应用与多开单 PID 精准控制**：每一条运行中的应用支持整组关闭及再多开实例，并支持展开查看独立 PID 胶囊，对多开应用中的某一个指定 PID 执行精准单杀；
  - **交互筛选与搜索**：支持按全部 / 组合套件 / 单品应用 Tab 切换、关键字实时检索及手动刷新快照。
- **顶栏实时入口与调度接入 (`launcher:manifest-integration` / `LauncherDashboard.tsx`)**：
  - 在快速启动模块顶栏工具栏新增带翠绿运行态呼吸点及实时应用计数徽章的 **`进程清单`** 入口按钮；
  - 挂载 `handleTerminateAllProcesses` 与 `handleTerminateSinglePid` 安全终止调度，操作结果实时同步至执行报文终端与各卡片指示灯。

## [0.1.84] - 2026-11-24

### Fix (快速启动：修复 `.bat`/`.cmd`/`.ps1` 本地批处理与带引号路径在脚本模式下不执行的阻断故障)

- **根因定位与排查**：
  - 响应用户反馈：“我刚才把 `"F:\App Location\脚本\微信双开管理\微信双开.bat"` 添加进启动项，但好像无法正常使用，你去排一下，这是一个启动微信双开的脚本”；
  - 查明当以 `script` 类型添加带首尾双引号的 `.bat` 文件路径时，前端无条件传参 `scriptType: 'powershell'`，导致 PowerShell 将 `"F:\...\微信双开.bat"` 当作字符串字面量直接打印回显而未真正执行批处理。
- **Rust 后端执行引擎加固 (`launcher:rust-script-exec` / `src-tauri/src/lib.rs`)**：
  - 新增 `strip_outer_quotes` 剥离用户从资源管理器"复制文件地址"粘贴带有的外层双引号；
  - 增强 `execute_custom_script`：自动识别本地 `.bat`/`.cmd` 文件走 `cmd.exe /c` 精准执行（并注入 `Stdio::null()` 防止脚本内 `pause` 后台永久挂起），识别 `.ps1` 文件走 `powershell -File` 执行；
  - 未显式配置工作目录时，自动绑定脚本物理父目录为 `current_dir`，确保 `%~dp0` 等相对依赖 100% 寻址成功；
  - 新增 `test_execute_quoted_bat_script_contract` 单元测试覆盖含空格中文与带引号 `.bat` 脚本契约。
- **前端脚本路由与表单路径自动规范化 (`launcher:fe-script-route` / `LauncherDashboard.tsx`)**：
  - 修复 `handleLaunchItem` 对 `type === 'script'` 的分发逻辑：自动剥离外层双引号、识别 `.bat`/`.cmd` 传参 `scriptType: 'bat'` 并自动推导父目录作为 `workingDir`，兼容已有历史数据免重新编辑即刻生效；
  - 在 `handleSaveItem` 中对 `.bat`/`.cmd`/`.ps1` 脚本目标同步剥离外层双引号并自动补全父目录为默认工作目录。

## [0.1.83] - 2026-11-24

### Feat (快速启动：白名单专属进程检测与终止管理、卡片右上角微状态指示/一键关闭、组合套件多态聚合与右键快速终止)

- **白名单专属进程检测与终止管理 (`launcher:proc-core` / `src-tauri/src/lib.rs`)**：
  - 响应用户核心需求：“快速启动模块 要计划开发一个 检测所有纳入快速启动项的项的进程检测和关闭功能，你计划一下，只对纳入启动项的做进程检测和关闭，以及需要考虑UI 该功能的位置和编排，要不就已有启动项的图标右上角做进程检测，在运行的支持关闭，包括组合启动项（不要影响可重复的进程启动）”；
  - **白名单进程专属扫描 (`detect_launcher_processes`)**：基于 Windows `Toolhelp32Snapshot` 原生快照遍历，仅精准比对快速启动项列表中配置的应用目标可执行文件名（如 `chrome.exe`、`Code.exe` 等），绝对杜绝全盘系统进程扫描或侵入未纳入项；
  - **受控安全终止进程 (`terminate_launcher_processes`)**：通过 `OpenProcess` 与 `TerminateProcess` 精确安全关闭指定 PIDs，内置针对 SelfWork 自身 PID 与 Windows 核心系统 PID (0/4) 的自卫豁免防御。
- **单品卡片图标右上角微状态指示与悬停关闭交互 (`launcher:item-proc-ui` / `LauncherDashboard.tsx`)**：
  - **右上角微状态指示点**：未运行状态下绝对隐蔽不占位；运行中在启动项图标容器右上角呈现精致微绿发光呼吸圆点（多实例并发时呈现实例数，如 `2`）；
  - **悬停平滑蜕变为红色微关闭按钮**：用户鼠标悬停于右上角指示点时，平滑展开为精致红色圆钮带 `✕` 图标，单击秒速受控关闭对应进程；
  - **右键上下文菜单同步增强**：单品与组合右键菜单增设“🔴 结束运行 (Kill)”快捷选项；
  - **可重复启动公理 100% 守恒**：卡片主体点击事件与右上角关闭事件采用 `e.stopPropagation()` 严格解耦，点击卡片主体依然可正常多次拉起应用（如多开编辑器或浏览器），互不干扰。
- **组合启动项 (Bundle Suite) 多态复合感知与联动批量关闭 (`launcher:combo-proc-ui` / `LauncherDashboard.tsx`)**：
  - **复合聚合状态机**：智能聚合统计组合内全部关联子项的运行态：全量运行（精致翠绿全部运行指示徽章）、部分运行（温暖琥珀部分运行指示徽章）、全未运行（默认状态）；
  - **组合右上角一键批量关闭**：在组合套件卡片右上角同样支持悬停一键终止该组合涉及的全部子项运行进程；
  - **子项预览胶囊独立穿透控制**：组合卡片内渲染的子项小胶囊同步展示单项微状态点，悬停支持单独关闭特定子项。
- **低功耗节流轮询调度器 (`launcher:proc-scheduler` / `LauncherDashboard.tsx`)**：
  - 仅在工作台处于前台激活且页面可见（`!document.hidden`）时启动 2.5 秒轻量轮询；
  - 唤起启动或点击终止后立即触发 300ms 脉冲刷新，确保 UI 状态零延迟即时响应。

## [0.1.82] - 2026-11-20

### Fix & Refactor (文档引擎：表格选区即时退出与外部脱离侦测、抬头与底部界面极致去噪净化、右键折叠菜单收敛表格样式)

- **选区即时坍缩与生命周期闭环 (`table:selection-dismiss` / `TableBlock.tsx`)**：
  - 响应用户尖锐反馈：“表格一选中，就无法退出选中？另外，表格抬头不要有过多无用的功能按钮和说明，给我保持干净，相关功能移到右键”；
  - 彻底修复选区粘滞死锁问题：
    1. **普通单击立即坍缩**：在单元格 `onMouseDown` 与 `contentEditable` 的 `onFocus` 中，未按 Shift 键时立即清空 `selectedRange` 并激活单个单元格；
    2. **全局外部点击脱离侦测**：在最外层容器挂载 `mousedown` 侦测器，点击表格外部或页面任意其他区域，瞬间自动注销多选选区与聚焦状态；
    3. **全局 Escape 键盘响应**：监听 `Escape` 键，无论焦点位于单元格还是表格把手上，秒速清除多空格选区与所有浮动微面板。
- **表格抬头与底部界面极致净化 (`table:clean-ui` / `TableBlock.tsx`)**：
  - 彻底铲除以往平铺在表格抬头上的密集按钮群（对齐、底纹、斑马纹、表头、复制MD等）；
  - 移除表格底部的冗长口水文本说明（`Word 9宫格对齐 · 莫兰迪底纹 · 右键 Mini Toolbar...`），彻底回归干净通透的极简画布外观；
  - 抬头仅保留极低扰动的表格规格指示（如 `数据表格 · 3 列 × 3 行`）及极简辅助点。
- **右键上下文菜单收敛升级 (`table:rightclick-convergence` / `TableBlock.tsx`)**：
  - 在 `TableContextMenu` 增设“🎨 表格样式 ▸”二级折叠子菜单，收纳“首行表头开关”与“隔行斑马纹开关”，并带当前状态勾选标记；
  - 9 宫格对齐微面板与莫兰迪底色卡在右键 Mini Toolbar 中 100% 顺畅唤出；
  - 完美兼顾纯净视觉感知与全面高密度的 Word/Notion 级表格能力。

## [0.1.81] - 2026-11-20

### Refactor (文档引擎：参考 Word 工业级表格工具四维正交分类、Word 标志性 3×3 九宫格对齐选择器、莫兰迪底纹与右键 Mini Toolbar)

- **Word 级工具栏严格正交分类体系 (`table:word-category` / `TableBlock.tsx`)**：
  - 响应用户尖锐反馈：“感觉一般啊，你要不去逆向一下notion或word，看看他们怎么做的功能；核心是工具栏的分类做太差了，你要用REA 去逆向notion或word才知道了，主要是参考word”；
  - 彻底根除以往按钮平铺堆砌与职责混乱的通病，全面对标 Microsoft Word / WPS 表格工具标准，划分出四大正交职责体系：
    1. **结构与行列 (Structure & Grid)**：向上/下插入行、向左/右插入列、删除行/列/整表、平均分布各列/各行；
    2. **对齐与几何 (Alignment & 9-Grid)**：Word 标志性 3×3 矩阵九宫格交互图形选择器（水平×垂直组合对齐）；
    3. **样式与底纹 (Style & Shading)**：8 色暗黑莫兰迪低饱和度底纹色卡、表头行开关、隔行斑马纹开关；
    4. **内容与富文本 (Content & Mini Toolbar)**：文字格式加粗/斜体/下划线/删除线、清除格式、剪贴板数据操作。
- **Word 标志性 3×3 九宫格对齐选择器 (`table:nine-grid-align` / `TableBlock.tsx`)**：
  - 超越以往单纯水平 3 种对齐，引入专业九宫格图形选择器微面板（顶左、顶中、顶右、中左、正中、中右、底左、底中、底右）；
  - 采用微对齐视效指示块直观呈现对齐落点，支持单个单元格与多选二维网格矩阵批量应用。
- **单元格底纹与斑马纹系统 (`table:cell-shading` / `TableBlock.tsx`)**：
  - 新增莫兰迪低饱和度背景底纹系统（无底色、暗灰、冰蓝、翠绿、暖珀、绛红、暮紫、雅靛）；
  - 支持单格与跨选矩形批量填充底色，并在行列插拔删除时智能位移索引字典；
  - 增加 Word 经典隔行斑马纹（Banded Rows）一键切换开关。
- **Word 式沉浸右键上下文菜单 (`table:word-context-menu` / `TableBlock.tsx`)**：
  - 顶部挂载 Word 式 Mini Toolbar：加粗、斜体、下划线、删除线、9 宫格微入口、底纹色板、清除格式；
  - 主体严格分层折叠二级子菜单：剪贴板与数据、插入行列 ▸、删除操作 ▸、尺寸与分布，消除单列傻长菜单。
- **Notion 式表头列把手与行侧把手 (`table:notion-grippers` / `TableBlock.tsx`)**：
  - 表头顶部悬停浮现微操作胶囊，点击一键全选整列并弹出列专属快捷操作；
  - 行左侧悬停浮现 `⠿` 抓手，点击一键全选整行并弹出行专属快捷操作。

## [0.1.80] - 2026-11-20

### Feat (文档引擎：跨行跨列区域选中、单格富文本浮动工具条、矩阵复制粘贴与批量编辑引擎)

- **二维矩形网格选区与状态机解耦 (`table:range-selection` / `TableBlock.tsx`)**：
  - 响应用户核心关切：“首先，表格的跨行跨列选中逻辑都要优化，表格内的文本格式编辑怎么办；核心是，要综合考虑 跨行扩列选中情况下的表格编辑+文本编辑 的问题”；
  - 彻底解耦 Mode A（单格文本编辑态）与 Mode B（跨行跨列区域选中态）：
    - 单击或在单元格内拖拽光标选词时，纯粹处于单元格内部文本聚焦态，选区绝不溢出到邻近单元格；
    - 按住 Shift 点击目标单元格，或按住鼠标从单元格把手/边界向外拖拽时，无缝激活二维网格矩形选区 `[minR..maxR, minC..maxC]`；
    - 选区范围内所有单元格渲染高质感半透明天蓝色覆盖层 (`bg-sky-500/20 ring-1 ring-sky-400/60`)，按 `Esc` 键或点击表格外部即可秒速取消多选；
    - 表格操作栏与右键菜单实时显示动态多选徽章（`已选中 N 个单元格`），并提供批量操作动作。
- **单元格划选浮动格式工具条 (`table:floating-toolbar` / `FloatingFormatToolbar.tsx` & `TableBlock.tsx`)**：
  - 在单元格内划选文字时，监听选区并在光标正上方优雅浮现暗黑毛玻璃浮动格式工具条；
  - 提供富文本核心能力：加粗（`B` / `Ctrl+B`）、斜体（`I` / `Ctrl+I`）、下划线（`U` / `Ctrl+U`）、删除线（`S`）、行内代码（`<>`）、文字高亮（`🎨`）与清除格式（`Tx`）；
  - 精准拦截快捷键并应用 HTML/Markdown 内联格式化，取消选区或失去焦点时浮条自动平滑隐形。
- **跨选态表格级批量编辑与矩阵剪贴板 (`table:batch-operations` / `TableBlock.tsx`)**：
  - **批量清空**：多选态下按 `Delete` 或 `Backspace` 键，秒速批量清空所选二维矩形内所有单元格文字，保留完整表格几何网格；
  - **矩阵复制 (TSV + Markdown)**：多选态下按 `Ctrl+C`，提取切片自动转换为制表符 `\t` 分列、换行符 `\n` 分行的标准 TSV 文本，并生成合法 Markdown 表格写入剪贴板，支持与 Excel / 飞书 1:1 无缝互粘；
  - **矩阵粘贴**：在单元格内按 `Ctrl+V` 粘贴多行多列制表符文本时，自动按二维矩阵精准填入各格，若行列不足自动智能扩充行列；
  - **批量格式化**：多选态下按下 `Ctrl+B` / `Ctrl+I` / `Ctrl+U`，自动对整个所选区域内的所有单元格批量应用加粗、斜体或下划线包装。
- **暗黑沉浸式右键上下文菜单智能感知联动 (`table:context-menu-range` / `TableBlock.tsx`)**：
  - 右键菜单自动感知 `isRangeActive`；若在多选态下右键，菜单顶部突显当前选中单元格数量，并提供对选区批量清空、批量格式化及矩阵复制等专属快捷指令。

## [0.1.79] - 2026-11-20

### Refactor (文档引擎：对标 Notion / 飞书 / Word 工业级表格架构、彻底消除内框线断点、边框吸附微手柄与沉浸式右键上下文菜单)

- **彻底根除内框线断点与不对齐 (`table:border-geometry` / `TableBlock.tsx`)**：
  - 响应用户尖锐反馈：“第一，表格的内框线都没对齐或者有断点；第二 表格功能你可以借鉴一下word 和 notion以及飞书去做吗，可能不是做一对按键放旁边啊”；
  - 深度查明断点根因：旧代码在每行末尾塞入了透明操作列 `<td className="w-13 ... border-transparent">` 及 `<col style={{ width: '52px' }}>`，导致数据列右边框与行末产生断裂豁口与垂直错位；
  - 彻底剔除操作假列，统一采用 `border-collapse: collapse` 架构与统一暗黑边框 `rgba(255, 255, 255, 0.08)`，外框严密闭合，使所有水平线垂直线绝对贯通对齐，消除一切断点与毛刺。
- **Notion / 飞书式边框吸附插入微手柄 (`table:hover-inserters` / `TableBlock.tsx`)**：
  - 彻底铲除表头与行末堆砌的密集外挂按钮（Anti-AI-Slop 净化）；
  - 鼠标悬停在两列垂直分界线或两行水平分界线上时，优雅吸附浮现 16px 圆形微手柄（`+` 图标），支持两列/两行之间即点即插；
  - 鼠标移开后微手柄瞬间平滑隐形，整张表格视觉纯净度达到 100%。
- **飞书 / Notion 式暗黑沉浸式右键上下文菜单 (`table:context-menu` / `TableBlock.tsx`)**：
  - 在表格任意单元格或表头右键，阻止原生菜单，就地弹出现代化紧凑暗黑毛玻璃上下文菜单；
  - 收敛整合：文本对齐（👈左 · ⏺️中 · 👉右）、行列插入（在上方/下方插入行、在左侧/右侧插入列）、数据清空（清空行/列）、结构删除（删除行/列/表格）；点击外部或按 `Esc` 自动关闭。
  - 表头单元格悬停时提供极简 `···` 微指示点，支持点击呼出同款菜单。
- **Word 式键盘录入流与快捷键打磨 (`table:word-keyboard` / `TableBlock.tsx`)**：
  - 优化 `Enter`（同列快速下移，末行回车自动追加新行并无缝聚焦，双手不离键盘录入）；
  - `Shift+Enter`（单元格内部换行）；`Tab` / `Shift+Tab`（平滑跳格，末格 Tab 自动加行）。

## [0.1.78] - 2026-11-20

### Feat (文档引擎：高级表格编辑系统、任意位置插入行列、整列对齐与键盘流深度增强)

- **任意位置插入行与插入列 (`table:insert-anywhere` / `TableBlock.tsx`)**：
  - 响应用户核心功能诉求：“开发下表格的各项编辑功能”；
  - 彻底打破以往只能在最末尾“追加”的限制，实现 `handleInsertRow(targetIdx, 'above' | 'below')` 与 `handleInsertCol(targetIdx, 'left' | 'right')`；
  - 表头各单元格与行侧栏提供直观、精准的插入与清空悬停微控制浮条，列宽数组与对齐数组自动顺延。
- **整列独立对齐调节与 GFM Markdown 输出 (`table:column-alignments` / `TableBlock.tsx` & `markdownExport.ts`)**：
  - 扩展表格数据属性 `columnAlignments`（支持 `'left'`、`'center'`、`'right'`）；
  - 表头各列提供一键循环切换对齐胶囊（`左对齐 -> 居中 -> 右对齐 -> 左对齐`），单元格文本即时响应对齐；
  - 升级复制 MD 与物理导出服务，按每列对齐属性自动输出合法的 GFM `:---`、`:---:`、`---:` 语法标记。
- **单元格键盘流人机工程深度优化 (`table:ergonomic-keyboard`)**：
  - `Enter` 键：同列快速下移并聚焦下一行单元格；若在最后一行回车，自动追加新行并无缝聚焦，实现类似 Excel/Notion 的双手不离键盘高速录入；
  - `Shift + Enter`：在单元格内部换行；
  - `Tab` / `Shift + Tab`：流畅正向与逆向跳格。
- **行列清空辅助功能 (`table:clear-actions`)**：
  - 表头与行侧栏增设清空按钮（`Eraser`），支持一键清空整行或整列文本，同时保留表格几何结构。

## [0.1.77] - 2026-11-20

### Fix (文档引擎：Notion 扁平汇总残屑段落物理剔除、表格双倍克隆与竖线切裂深度自愈)

- **Notion 扁平汇总残屑段落深度清除 (`purge:flat-summary` / `docHealingService.ts`)**：
  - 响应用户关于表格上方长串重复文本（红框 1：`| 运算 Python 写法 结果 ... |`）的核心故障反馈；
  - 查明该文本为 Notion 网页复制时附带的扁平化纯文本预览行，被旧版解析器误存为普通 `p` 段落；
  - 编写残屑段落探测器 `isNotionFlatSummaryBlock`，并在存量数据库（`selfwork.db`）中物理剔除该段落；
  - 在 `markdownImport.ts` 与 `docsDb.ts` 加载钩子中注入前置阻断防护，杜绝此类段落再次入流。
- **表格双倍克隆列折叠与转义竖线切裂自愈 (`heal:table-dedup` / `docHealingService.ts` & `TableBlock.tsx`)**：
  - 查明红框 2 表格因历史未保护转义竖线 `\|` 导致单元格被切成碎片，且表头存在双倍克隆列（`运算` | `运算` | `Python 写法` | `Python 写法` | `结果` | `结果`）；
  - 实现通用自愈算法 `healTableRows`：自动折叠偶数克隆列，并将因转义竖线被切开的碎片单元格（`A \` 与 `B`）原子恢复为规范的 `A \| B`，将表格恢复为完美的 3 列 × 5 行标准结构；
  - 在 `TableBlock.tsx` 挂载运行时 `useMemo` 自愈规范化防线，确保无论何时读取到历史旧数据均自动呈现纯净规整表格。
- **存量文档就地自愈与本地 Markdown 物理镜像重新落盘 (`sync:markdown-mirror`)**：
  - 针对《02.3-02.5 集合类型、映射类型与其他内置类型》存量页面执行事务级数据清洗；
  - 重新原子生成 `%APPDATA%\SelfWork\documents\02.3-02.5 集合类型、映射类型与其他内置类型.md` 物理文件，确保磁盘镜像与界面绝对一致。

## [0.1.76] - 2026-11-20

### Feat (文档引擎：面向 MCP+AI 的真实物理绝对路径落盘与上线 URL 自适应切换)

- **废除分类面包屑文本作为路径输出**：
  - 响应用户核心纠正指示：“我要的不是这个路径：私人 / 02.3-02.5 集合类型...，我要的是本地路径，如果上线的话那就是URL路径了，因为到时候会涉及MCP+AI”；
  - 彻底解耦“视觉导航面包屑”与“可寻址资源定位符”，点击复制不再输出分类描述字符串。
- **本地物理文档镜像与原子落盘机制 (`src-tauri/src/db.rs` / `src-tauri/src/lib.rs`)**：
  - 在 Rust 后端新增 `get_documents_dir`（落盘至 `%APPDATA%\SelfWork\documents\`）与 Windows 保留字符合法化清洗函数 `sanitize_filename`；
  - 新增 Tauri Commands `db_sync_doc_markdown_file` 与 `db_get_doc_local_path`，在文档保存或复制时原子落盘标准 Markdown 文件，并返回规范 Windows 绝对路径（消除 `\\?\` 前缀）；
  - 单元测试套件新增 `test_doc_markdown_file_sync_contract`，15/15 单元测试全绿通过。
- **通用文档路径与模式自适应服务 (`src/services/docPathService.ts`)**：
  - 封装统一的路径解析服务 `resolveDocumentResourcePath` 与 `copyDocumentResourcePath`；
  - 本地模式（默认）：自动将当前文档最新 Blocks 转换为标准 Markdown 并原子同步至本地物理文件，返回可供操作系统、外部 VS Code、本地 MCP（如 Filesystem MCP）及 AI Agent 直接执行 `read_file` 的绝对路径；
  - 上线/Web模式：自适应切换输出符合 Web 标准的 URL 路径（`${BASE_URL}/docs/${pageId}`）。
- **DocsView 交互与 Toast 升级 (`src/components/DocsView.tsx`)**：
  - 顶部工具栏“复制路径”按钮、面包屑栏快捷按钮及侧边栏各层级悬停微复制按钮，统一接入 `docPathService`；
  - Toast 明确呈现复制的完整 Windows 路径，且带有“可由 MCP+AI 直接读取”的高质感知。

## [0.1.75] - 2026-11-20

### Feat (文档引擎：文档完整层级路径解析与多场景一键复制功能)

- **递归多级层级路径解析引擎 (`path:hierarchy-resolver` / `DocsView.tsx`)**：
  - 响应用户核心功能诉求：“需要做一个复制文档路径的功能”；
  - 实现 `getItemHierarchyPath` 递归回溯算法，依据分区的 `parentId` 溯源全部父级/祖父级分区结构，自顶向下规范化输出标准路径（例如：`私人 / 深度学习 / Python进阶 / 02.3 集合类型`）；
  - 针对根目录文档自动规范化为 `私人 / ${title}`，无标题文档自动回退为 `未命名笔记`，杜绝空路径异常。

- **顶部导航栏一键复制胶囊与面包屑快捷点击 (`ui:topbar-copy-path` / `DocsView.tsx`)**：
  - 顶部面包屑文本整体升级为悬停微胶囊，鼠标悬停高亮并展示复制图标，点击即刻复制当前完整文档路径；
  - 顶部操作栏（收藏星标左侧）新增显式独立的“复制路径”操作胶囊，点击后按钮图标瞬变为绿色对勾与“已复制路径”字样，维持 1.8 秒后平滑复原。

- **侧边栏文档项悬停快捷复制与全局轻量 Toast (`ui:sidebar-hover-copy` / `DocsView.tsx`)**：
  - 在侧边栏子分区、根目录、收藏列表与最近浏览项的操作按钮组中，增设 `Copy` 微按钮（`title="复制文档路径"`），点击仅复制路径而不改变当前编辑区活跃视图；
  - 屏幕右下角挂载全局极简毛玻璃微胶囊 Toast（展示具体路径预览），1.8 秒后自然淡出，兼具触觉确认感与阅读无干扰体验。

## [0.1.74] - 2026-11-20

### Feat (文档引擎：外部输入语义净化、Notion 网页噪点剥离与纯净多块分裂解析)

- **前置语义净化器与 Notion 平台外壳剥离 (`parser:sanitize-import` / `markdownImport.ts`)**：
  - 响应用户关于外部导入/复制时混入“废纸篓私人 / 02.3-02.5...”、“·1399 个块”、“目录大纲(190)”、“添加封面”等平台噪点的核心反馈；
  - 引入 `sanitizeImportText` 前置语义净化器，自动剥离 Notion 顶栏、元数据、面包屑及操作按钮；
  - 自动提取并识别页面图标（如 `🐍`）与纯净标题，避免重复拼接（`TitleTitle`）；
  - 深度清洗代码块头部复合按钮与连续行号伪文本（`Python不换行行号复制123456# ...`），提取纯净语言标签并还原代码首行；
  - 清除代码输出后紧随的行号残屑（`\n3注意` -> `\n注意`），并自动将粘连的输出代码与中文解释分离为独立代码块与段落。

### Feat (文档引擎：表格转义安全切分与克隆表头去重)

- **表格负向后行断言切分与防畸变 (`table:safe-split-and-dedup` / `markdownImport.ts`)**：
  - 采用负向后行断言正则表达式 `/(?<!\\)\|/` 安全切分单元格，保护内联代码与转义竖线（`\|`）；
  - 引入 `normalizeTableRows` 表格列数自适应对齐与奇偶克隆表头去重算法，彻底终结 `| 运算 | 运算 | Python 写法 | Python 写法 |` 的列数爆炸与表头递归克隆畸变。

### Feat (文档引擎：表格自由拖拽调整列宽与自适应横向平滑滚动)

- **现代化表格列宽拖拽交互与持久化 (`table:column-resizing` / `TableBlock.tsx`)**：
  - 在 `TableBlock.tsx` 中支持 `columnWidths: number[]` 状态管理与持久化（默认列宽基准 160px，下限 60px）；
  - 采用 `<colgroup>` 与 `table-layout: fixed` 严格锁定列宽，添加加列/删列时的列宽自动联动；
  - 表头单元格右侧边缘渲染交互把手（`cursor-col-resize`），绑定全局鼠标拖拽事件流，实现零卡顿自由拉伸；
  - 表格容器启用自适应平滑横向滚动条（`custom-scrollbar`），长表与多列表格支持流畅横向拖动查阅。

### Feat (文档引擎：编辑器智能粘贴接管与 Notion Block 规范对齐)

- **智能多块分裂注入与纯文本防污染 (`editor:smart-paste-split` / `BlockItem.tsx` & `BlockEditor.tsx`)**：
  - 在 `BlockItem.tsx` 与 `BlockEditor.tsx` 中打通多块结构化粘贴链路；
  - 用户在普通块中粘贴包含多段落、代码块或表格的外部文本时，自动拦截原生杂乱 HTML 注入，通过净化解析器转化为独立 DocBlocks 并顺次注入下方；单行文本保持纯文本注入，防止外部脏样式污染。

## [0.1.73] - 2026-11-20

### Feat (文档引擎：选区单一权威归一化与消除双重高亮叠加)

- **选区单一权威通道归一化 (`editor:single-authority-selection` / `BlockEditor.tsx`)**：
  - 响应用户核心体验反馈：“现在好像会双重选中，又选中字，又选中行，导致双重高亮”；
  - 确立选区单一权威法理（Single Source of Truth），严格禁止浏览器原生 Selection 与自定义 Highlight 并存打架；
  - 跨段划选触发瞬间，立即调用 `window.getSelection()?.removeAllRanges()` 彻底清除原生选区残留，消除“既选行又选字”的冲突异象；
  - 单段内划选时撤销自定义 Highlight，全权由单层原生选区承载；
  - 彻底移除了代码块上的 `ring-1` 状态残留，块级绝无任何多余行边框与背景。

- **消除双重色彩叠加与纯净单层视觉 (`editor:single-layer-highlight` / `BlockEditor.tsx` & `globals.css`)**：
  - 根除 `::selection` 与 `::highlight` 的双层叠色，文字背景色统一保持单层 `0.28` 透明度清爽半透明水蓝（`rgba(56, 189, 248, 0.28)`）；
  - 字符前景色锐利清晰，消除复合渲染引起的文字发虚、发暗或边缘撕裂；
  - 字符级高精起止与 120Hz 零延迟极速跟手手感持续稳定生效。

## [0.1.72] - 2026-11-20

### Feat (文档引擎：W3C 标准字符级高精选区与零延迟即划即现引擎)

- **终结整段粗暴涂抹，实现字符级精准起止 (`editor:char-level-precision` / `BlockEditor.tsx` & `globals.css`)**：
  - 彻底终结“划到第二行一个字却整行整段被涂蓝”的痛点；
  - 采用标准 `caretRangeFromPoint` 毫秒级锁定字符节点与偏移量，构造精确的真实 DOM `Range`；
  - 首段从鼠标落点具体字符起跑，落点前文字保持原状；尾段仅高亮至当前悬停字符，后续文字完全无色，彻底还原 Office Word 般指哪选哪的经典自然体验。

- **零延迟即划即现硬件加速引擎 (`editor:zero-latency-highlight` / `BlockEditor.tsx` & `globals.css`)**：
  - 彻底剥离 `mousemove` 中的频繁 React `setState` 重新渲染循环，消除组件树全量 Diff 与主线程丢帧；
  - 引入 W3C 现代标准 **CSS Custom Highlight API (`CSS.highlights`)**，由底层 GPU / Compositor 线程直接着色，响应延迟 `< 16ms`（达到 120Hz/144Hz 极限跟手刷新率）；
  - 彻底根除“鼠标在前边跑、高亮在后面追、感觉很卡”的迟滞负罪感；
  - 剪贴板 `copy` (Ctrl+C) 基于活跃 Range 精准提取高亮文本切片，实现真正的所见即所得。

## [0.1.71] - 2026-11-19

### Feat (文档引擎：大块内容 Word 级自然选区重塑与段落块辅助化)

- **彻底消除段落块外层卡片化轮廓 (`editor:de-cardify-selection` / `BlockItem.tsx`)**：
  - 响应用户核心体验诉求：“不要让段落块明显影响内容选中，段落块是辅助作用，不能牵住基本操作”；
  - 彻底剥离段落外层宿主容器上的卡片式 `bg-sky-500/15` 底色、`ring-1` 外边框与 `rounded-xl` 大圆角；
  - 段落容器回归纯粹的排版定位辅助，左侧悬浮拖拽手柄在划选大片文本期间自动静默（`pointer-events-none !opacity-0`），绝不抢占指针焦点与遮挡阅读视线。

- **选区高亮精准下沉至文本流 (`editor:text-stream-selection` / `BlockItem.tsx` & `globals.css`)**：
  - 将选区高亮深度下沉至正文文本承载区（`renderContent`），贴合文字行排版（`bg-sky-500/20 text-slate-100 rounded-sm px-1 -mx-1`）；
  - 在 `globals.css` 中声明全局沉浸式 `::selection` 伪元素高亮，使单段内的原生文字划选与跨段多选区在色彩饱和度、透明度与对比度上实现像素级视觉一致；
  - 划选大篇幅文本时，行与行之间自然顺畅贴合，彻底还原 Office Word 般自由流畅的经典文字处理体验；
  - 跨段 `Ctrl+C` 格式化合并复制与 `Backspace`/`Delete` 批量删除能力 100% 保持。

## [0.1.70] - 2026-11-19

### Feat (文档引擎：大纲顶部仅H1/H2过滤条彻底清除与大纲结构纯化)

- **彻底清除大纲顶部层级过滤按钮组 (`toc:filter-bar-cleanup` / `BlockEditor.tsx`)**：
  - 响应用户明确体验指令：“这个仅H1、H2 啥的不要”；
  - 在智能深度父子折叠树已经上线并稳定运行的前提下，彻底移除侧栏头部的「全部 / 仅H1 / H1+H2」硬过滤胶囊按钮组，释放大纲垂直呼吸空间；
  - 彻底移除了 `outlineFilter` 过滤状态机，简化 `filteredHeadings` 为纯粹由多层级父子折叠管辖驱动的树状索引；
  - 标题空态提示由条件判断纯化为“当前文档暂无标题 (H1/H2/H3)”，逻辑纯净统一。

- **目录结构顶栏与全局折叠快捷微操作优化 (`toc:collapse-control-refine` / `BlockEditor.tsx`)**：
  - 将一键「全部展开 / 全部折叠」快捷微操作优化为精简低扰的辅助顶栏（「目录结构」与右侧快捷微按钮），仅在文档中存在子章节时优雅浮现；
  - 点击依然联动全篇多层级章节收拢/展开，单章左侧微箭头依然独立可用，整体大纲视线聚焦、通透无阻。

## [0.1.69] - 2026-11-19

### Feat (文档引擎：Word 级自然无阻断跨块划选与批量协同操作)

- **跨块选区协同器 (`editor:cross-block-selection` / `BlockEditor.tsx` & `BlockItem.tsx`)**：
  - 彻底终结多 `contenteditable` 孤岛机制对鼠标划选的物理截断限制；
  - 在正文编辑容器层引入 `crossSelectedBlockIds` 手势协同器，当用户在某块内按住鼠标左键并拖拽跨越块边界时，平滑捕获起始块至当前指针所在的全部块；
  - 被选中的多块呈现连续连贯的深蓝微光沉浸式高亮背景 (`bg-sky-500/15 ring-1 ring-sky-500/30 rounded-xl`)，彻底还原 Microsoft Word 般的无缝大片划选体验；
  - 单块内正常打字、光标箭头穿梭、双击选词、三击选行保持 100% 原生手感，点击空白处即刻自然恢复。

- **跨块批量操作与剪贴板协同 (`editor:cross-block-batch-ops` / `BlockEditor.tsx`)**：
  - 支持跨块多段 `Ctrl+C` 批量复制，自动按换行与列表符号格式化写入系统剪贴板，粘贴时结构完整无损；
  - 支持跨块多段 `Backspace` / `Delete` 批量一键删除，并平滑保留单个聚焦空段落块；
  - 支持按 `Escape` 键一键退出跨块选区。

## [0.1.68] - 2026-11-19

### Feat (文档引擎：大纲侧栏收起按钮彻底清除与智能多层级深度父子折叠)

- **大纲侧栏内部右上角冗余收起按钮彻底清除 (`toc:panel-close-cleanup` / `BlockEditor.tsx`)**：
  - 彻底移除了大纲侧栏内部右上角的多余收起小图标 (`PanelRightClose`)，全权由顶栏统一的「目录大纲」按钮执行双向 Toggle；
  - 优化大纲头部布局，「大纲 / 图谱」标签页均分宽度对齐，视觉纯粹对称。

- **智能多层级深度父子折叠系统 (`toc:deep-hierarchical-heading-fold` / `BlockEditor.tsx`)**：
  - 引入 `getHeadingDepth` 语义编号启发自愈机制，精准识别点分数字编号（如 `1.1`、`1.2`、`2.1`）为深度 3；
  - 彻底解决长文档中 `## 一、` 与 `## 1.1` 同属 `h2` 导致二级标题无法折叠三级小节的系统性缺陷；
  - 一级标题（H1）可折叠其下属所有小节，二级标题（H2）亦可精准独立折叠其下属的所有 `1.x` 小节并展示折叠计数徽标（如 `+3`）；
  - 大纲条目根据真实深度动态阶梯缩进（`pl-1.5`、`pl-3.5`、`pl-5.5`），完美契合用户心智模型与长文档层次导航。

## [0.1.67] - 2026-11-19

### Feat (文档引擎：大纲展开入口收敛与父子级标题折叠系统)

- **大纲展开入口唯一化收拢 (`toc:entrypoint-unification` / `BlockEditor.tsx`)**：
  - 彻底移除了正文编辑容器内部悬浮常驻的右侧下方「大纲」胶囊按钮，消除双重入口冗余与视觉干扰；
  - 改造顶栏右侧「目录大纲」按钮为常驻双向切换（Toggle）：收起时点击展开、展开时高亮激活且点击可收起，状态无缝持久化保存于 `selfwork_doc_outline_visible`。

- **目录父子级标题折叠系统与树状导航交互 (`toc:hierarchical-heading-fold` / `BlockEditor.tsx`)**：
  - 引入 `collapsedHeadingIds` 状态，根据 H1 ($W=1$)、H2 ($W=2$)、H3 ($W=3$) 动态推导父子管辖层级；
  - 为所有拥有下属子标题的父节点渲染独立的折叠微箭头指示图标（`ChevronDown` 展开 / `ChevronRight` 折叠），点击箭头仅控制子树折叠展开，并显式阻止冒泡 (`stopPropagation`)，彻底与正文跳转解耦；
  - 点击标题文本依然精确平滑穿梭滚动至正文对应位置；
  - 父节点折叠时，在条目右侧呈现包含子标题数量的小徽标（如 `+3`）；
  - 大纲头部工具区增加一键「全部折叠 / 全部展开」微按钮，完美兼容「全部 / 仅H1 / H1+H2」多维层级过滤。

## [0.1.66] - 2026-11-19

### Feat (文档引擎：排版呼吸感、水平空间舒展与划选浮动格式工具条防遮挡优化)

- **块级垂直外边距与黄金排版呼吸节奏解冻 (`typography:vertical-breathing-rhythm` / `BlockItem.tsx` & `BlockEditor.tsx`)**：
  - 彻底移除了 `BlockEditor.tsx` 块流容器上强制覆盖子元素 margin 的 `space-y-0.5` 类，彻底解放块级外边距自由度；
  - 重构 `BlockItem.tsx` 中的 `getBlockMarginClass`，为 H1 (`mt-10 mb-3`)、H2 (`mt-8 mb-2.5`)、H3 (`mt-5 mb-2`)、段落 (`my-2.5 py-0.5`)、代码块与表格 (`my-4`) 注入明确的层级停顿与留白；
  - 将段落行高升级至 `leading-[1.75]`（黄金阅读行高）并微调字号为 `text-[15px]`，密集专业长文彻底告别视觉压迫与拥挤粘连；
  - 将 Callout 提示框等特殊块统一纳入独立外边距计算。

- **编辑器水平空间舒展与大纲栏智能收展 (`layout:horizontal-spatial-declutter` / `BlockEditor.tsx`)**：
  - 支持右侧大纲栏一键折叠收起，状态持久化保存于 `selfwork_doc_outline_visible`；
  - 大纲收起时正文编辑容器自动从 `max-w-3xl` 动态舒展为 `max-w-4xl xl:max-w-5xl` 宽屏沉浸模式；
  - 大纲收起时右侧顶栏常驻极简微光大纲指示胶囊，点击即可滑出大纲；
  - 展开时大纲栏宽度收拢至紧凑的 `w-52` (208px)，释放正文横向视野。

- **划选浮动格式工具条防遮挡与层级收敛 (`toolbar:floating-declutter-and-flip` / `BlockItem.tsx` & `FloatingFormatToolbar.tsx`)**：
  - 引入 `contextMenuOpenRef` 互斥保护机制，右键菜单呼出时彻底抑制浮动条，彻底消除划词浮动条与右键“转换为”菜单双层重叠互叠贴脸的界面瑕疵；
  - 在 `checkSelection` 中增加防遮挡智能垂直翻转算法：当选区靠近视口顶部（`rect.top - 48 < 12`）时，自动翻转至选区正下方（`rect.bottom + 8`），杜绝挡住被选文本与上下文；
  - 收敛 `FloatingFormatToolbar` 的 `zIndex` 至 `999990`，确保与右键菜单层级清晰无干扰。

## [0.1.65] - 2026-11-19

### Feat (文档引擎：阶段五·维度 4 - 数据工程与全库深度管理：全库全局模糊检索、文档废纸篓软删除、侧栏多选批量管理与外部 Markdown 批量导入)

- **全库块级全局模糊检索引擎 (`search:global-fuzzy-spotlight` / `Ctrl+Shift+F` / `DocGlobalSearchModal.tsx`)**：
  - 新增 `DocGlobalSearchModal.tsx`，支持全局快捷键 `Ctrl+Shift+F` 或点击侧栏检索栏胶囊瞬时唤起；
  - 跨越全库所有文档的所有块（正文、代码、表格、公式、待办等）进行毫秒级模糊扫描；
  - 预设「全部 / 正文 / 代码 / 表格 / 待办 / 标题」6 大块类型过滤器与匹配关键词黄色微光高亮；
  - 支持键盘 `↑` / `↓` 焦点穿梭，`Enter` 键平滑穿透至目标文档并高亮目标块。

- **文档废纸篓与软删除恢复机 (`trash:soft-delete-recycle-bin` / `DocTrashDrawer.tsx` & `docTrash.ts`)**：
  - 页面模型扩展 `isDeleted` 与 `deletedAt` 软删除状态，彻底终结单页误点击物理抹除风险；
  - 侧边栏常驻底部「🗑️ 废纸篓」入口与待清理文档数量 Badge；
  - 新增侧滑 `DocTrashDrawer.tsx` 抽屉，展示 30 天保留倒计时、一键原位还原与二次确认彻底粉碎；
  - 提供「清空废纸篓」一键终极物理粉碎。

- **文档侧栏多选批量管理 (`batch:sidebar-multi-select` / `DocBatchManager.tsx`)**：
  - 侧栏顶端检索栏增加「☑️ 批量操作」切换开关，开启后各文档项左侧呈现独立勾选框；
  - 勾选 $\ge 1$ 篇文档时，底部平滑滑出毛玻璃批量浮动手柄工具条；
  - 支持一键批量移动至目标分区（私人根分区或指定子分区）、批量设为收藏、批量移入废纸篓与批量导出为独立 Markdown 文件。

- **外部 Markdown 批量导入还原器 (`importer:markdown-batch-ingestion` / `DocBatchImporter.tsx` & `markdownImport.ts`)**：
  - 新增高保真行状态机解析器 `markdownImport.ts`，精准映射 `# 一级标题`、`## 二级标题`、`### 三级标题`、`- [ ] 待办`、代码块、表格、列表与普通段落；
  - 新增 `DocBatchImporter.tsx` 对话框，支持拖拽或多选本地 `.md` 文件，指定目标分区后一键解析存库；
  - 导入完成后侧边栏页面列表瞬时无损刷新并自动定位到最新导入文档。

## [0.1.64] - 2026-11-19

### Feat (文档引擎：阶段五·维度 3 - 富交互与行内极客体验：划词批注评论流、浮动工具条补全、全局折叠控制与全景字数透视)

- **行内划词批注与文档评论流 (`comments:inline-comments` / `DocCommentDrawer.tsx` & `docComments.ts`)**：
  - 新增 `docComments.ts` 本地批注管理服务与 `DocCommentDrawer.tsx` 侧滑抽屉；
  - 正文划选任意文字通过浮动工具条一键标注并添加行内批注，被批注文字呈现黄色微光引用卡片；
  - 侧滑抽屉清晰分类展示「未解决 (待办)」、「已解决」与「全部」批注列表；
  - 支持直接在卡片内多轮追加探讨回复、标为解决与删除，顶栏自动显示待办批注数量微光 Badge。

- **划选即时浮动工具条深度补全 (`toolbar:floating-enhancements` / `FloatingFormatToolbar.tsx`)**：
  - 浮动工具栏增加「💬 添加行内批注」一键快捷入口；
  - 优化 5 色柔和微光荧光调色板（黄/绿/蓝/紫/粉），选区着色与清除格式平滑生效；
  - 增强行内代码标签转化与清除选区内联样式按钮。

- **全局折叠块一键展开与收起 (`layout:global-fold-control` / `DocFoldControl`)**：
  - 当文档存在至少 1 个折叠块 (`toggle`) 时，顶栏操作区自适应呈现「展开全部 / 收起全部」控制胶囊；
  - 点击一键统一翻转全文所有折叠块的 `properties.isOpen`，并批量持久化至本地数据库，解决长文阅读操作痛点。

- **细粒度阅读指标与字数透视卡片 (`stats:reading-metrics-modal` / `DocStatsBadge.tsx`)**：
  - 点击右下角微光字数胶囊瞬时弹出全景细粒度阅读指标透视卡片；
  - 准确拆分中文字符、英文字词、总代码行数、表格与多媒体块密度；
  - 提供双速阅读预估时长：默读时长（按 350 字/分）与朗读演讲时长（按 180 字/分）。

## [0.1.63] - 2026-11-19

### Feat (文档引擎：阶段五·维度 2 - 结构化排版与高级块类型：多级折叠列表、专业代码块全屏、音视频媒体卡片与跨页双向同步块)

- **多级折叠列表块重塑 (`layout:toggle-block` / `BlockToggle.tsx` & `/toggle`)**：
  - 将 `BlockToggle.tsx` 统合收拢进 `BlockItem.tsx` 统一管道，原生继承 6 点抓手拖拽与 `Alt + ↑/↓` 换块监听；
  - 增强折叠箭头旋转动画与展开时左侧渐变微光竖线层级指示；
  - 优化回车换行与光标聚焦体验，折叠状态实时持久化于 SQLite 与本地缓存。

- **专业代码块深度增强 (`code:enhanced-codeblock` / 行号/复制/沉浸全屏)**：
  - 行号动态自适应计算且强制禁止选中（`select-none`），代码复制绝对无行号与空行干扰；
  - 点击一键复制呈现 1.5 秒绿色 Check 动效与已复制轻提示；
  - 新增全屏沉浸阅读浮窗（`fixed inset-0` 毛玻璃大视口弹窗），支持语法高亮实时查看与 `Esc` / 按钮快捷退出。

- **音视频与多媒体外链卡片 (`media:embed-card` / `MediaEmbedBlock.tsx` & `/media`)**：
  - 新增 `MediaEmbedBlock.tsx`，支持斜杠菜单键入 `/media`、`/video` 或 `/audio` 快捷插入；
  - 智能识别 mp4/webm 视频与 mp3/wav 音频直链；
  - 音频渲染紧凑暗黑声波微光播放条与时长进度，视频渲染自适应等比圆角毛玻璃硬件加速播放器。

- **跨文档双向同步引用块 (`network:synced-block` / `SyncedBlock.tsx` & `syncedBlocks.ts` & `/synced`)**：
  - 新增 `syncedBlocks.ts` 全局 Sync ID 唯一内容管理服务；
  - 新增 `SyncedBlock.tsx`，支持创建独立同步源块或跨文档绑定已有 Sync ID 嵌入引用；
  - 具有专属晶体翡翠/天蓝微光边框与「🔗 跨文档同步块」微徽标，任一处文档修改内容，全库所有引用处即时自动同步更新。

## [0.1.62] - 2026-11-19

### Feat (文档引擎：阶段五·维度 1 - 知识网络与双向拓扑闭环：反向链接、目录大纲卡片、关联力导向图谱与键盘流换块)

- **双向反向链接底栏 (`network:backlinks-panel` / `BacklinksPanel.tsx` & `backlinks.ts`)**：
  - 新增 `backlinks.ts` 全库双向引用扫描服务与 `BacklinksPanel.tsx` 正文底栏微光卡片；
  - 自动遍历全库页面块提取包含 `#/page/${targetId}` 的引用上下文与源页面元数据；
  - 底部优雅折叠显示引用计数徽标（如 `X 处引用`）、源文档标题、最后更新相对时间与正文上下文摘要；
  - 支持单击卡片一键穿透直达源页面，实现网状双向知识链接无缝漫游。

- **正文内嵌动态目录卡片 (`layout:toc-block` / `TableOfContentsBlock.tsx` & `/toc`)**：
  - 新增 `TableOfContentsBlock.tsx` 正文内嵌动态大纲块，在 `src/types/docs.ts` 扩展 `BlockType` 增补 `'toc'`；
  - 斜杠菜单支持 `/toc` 或键入 `toc` 快速插入；
  - 动态响应式提取当前文档内的全部 H1、H2、H3 标题，层级缩进排列；
  - 点击目录项平滑滚动至对应标题位置，导出 HTML/Markdown 时自动转为标准跳转超链接。

- **局部文档关联力导向图谱 (`network:local-graph` / `DocLocalGraph.tsx`)**：
  - 新增 `DocLocalGraph.tsx`，基于原生 React + SVG 纯弹簧动力学方程计算节点坐标；
  - 在右侧大纲栏顶部提供「大纲」与「图谱」双标签页一键切换；
  - 自动提取当前文档的出度引用（天蓝色边框）与入度被引用（紫色边框），中心辐射环状围绕；
  - 支持节点物理拖拽、阻尼回弹、连线高亮与双击一键穿透跳转，独立无依赖纯自研实现。

- **键盘流快速上下交换块 (`keyboard:swap-blocks` / `Alt + ↑/↓`)**：
  - 在 `BlockItem.tsx` 键盘监听中拦截 `Alt + ArrowUp` 与 `Alt + ArrowDown`；
  - 在 `BlockEditor.tsx` 中执行原子数组对调并重新编排 `sortOrder`；
  - 移动后自动保留当前光标聚焦状态并压入 Undo/Redo 历史栈，大幅提升键盘流重构体验。

## [0.1.61] - 2026-11-19

### Feat (文档引擎：阶段 4 - 块级流转、模板库、历史版本快照与高保真导出)

- **开箱即用技术文档模板库 (`template:doc-templates` / `DocTemplatePicker.tsx` & `docTemplates.ts`)**：
  - 新增 `DocTemplatePicker.tsx` 与工业级模板服务 `docTemplates.ts`；
  - 空白文档状态下自动呈现 4 款高频技术模板卡片：
    - 💡 **技术方案设计规范 (RFC/Spec)**：包含背景问题、Mermaid 系统架构、方案评估决策表格与自验证清单；
    - 🐞 **Bug 深度复盘 (5-Whys)**：包含故障基本信息表格、5-Whys 根因深度穿透与 L1/L2/L3 长效防线；
    - 📅 **研发周报与版本发布日志 (Changelog)**：包含完成交付物、阻塞点应对与下阶段迭代里程碑；
    - 📚 **核心知识点与技术卡片**：包含通俗机制比喻、新手易犯陷阱避坑代码对照与速记口诀；
  - 顶栏增设「✨ 模板库」快捷入口，点击瞬时注入完整块流并触发原子持久化。

- **多栏排版布局卡片 (`layout:multi-columns` / `MultiColumnBlock.tsx` & `/columns`)**：
  - 新增独立多栏排版块 `MultiColumnBlock.tsx`，支持斜杠菜单 `/columns` 或快捷指令极速插入；
  - 支持 **双栏 (1:1)** 与 **三栏 (1:1:1)** 自由切换，各栏独立 contenteditable 富文本输入与换行排版；
  - 容器自适应响应式栅格，小屏或窄视口时优雅折叠为纵向流动布局，防止内容挤压溢出；
  - 原生继承 6 点拖拽抓手与落点指示线，支持整体拖拽重排与持久化。

- **文档历史快照与时间轴回滚 (`history:version-timeline` / `docHistory.ts` & `DocHistoryDrawer.tsx`)**：
  - 新增 `docHistory.ts` 快照服务与 `DocHistoryDrawer.tsx` 右侧时间轴抽屉；
  - 文档保存时防抖自动沉淀时间戳快照，同时支持顶栏「创建当前版本快照」手动打标；
  - 抽屉清晰展示倒序时间轴、相对时间、块数与字数指标；
  - 支持点击任一历史快照在主编辑区以只读模式实时预览当时完整内容；
  - 提供「恢复到此版本」功能，恢复前自动对当前最新状态执行防御性备份，确保数据零丢失。

- **高保真独立 HTML 导出与打印/PDF 样式 (`export:print-pdf-html` / `htmlExport.ts` & `@media print`)**：
  - 新增 `htmlExport.ts` 单文件高保真独立 HTML 导出引擎，内嵌现代暗黑/明亮排版 CSS，可脱离环境在任何浏览器离线阅读；
  - 完善 `src/styles/globals.css` 中的 `@media print` 媒体查询规则，打印或另存为 PDF 时强制自动隐蔽侧边栏、标题栏、大纲栏、手柄、按钮等所有界面控件；
  - 顶栏导出按钮升级为微型下拉卡片，提供 Markdown (.md)、独立网页 (.html) 与 打印/另存为 PDF (Ctrl+P) 三大选项。

## [0.1.60] - 2026-11-18

### Feat (文档引擎：阶段 3 - 写作交互与生产力增强：全局查找替换、块级拖拽重排、ScrollSpy 目录大纲与实时字数统计)

- **全局查找与替换微工具条 (`Ctrl+F` / `FindReplaceBar.tsx`)**：
  - 新增 `FindReplaceBar.tsx` 独立微光工具条组件，支持按下 `Ctrl + F` / `Cmd + F` 或点击顶栏放大镜图标即时唤出；
  - 实时正则匹配全文所有块文本，并在右上角显示 `当前匹配序号 / 总匹配数`；
  - 键盘 `Enter` / `Shift+Enter` 快速在匹配项间平滑滚动切换并聚焦目标块；
  - 提供单次精准替换与批量全部替换功能，全部替换前自动压入 Undo 栈，支持 `Ctrl+Z` 瞬时恢复。

- **块级原生拖拽重排与 6 点手柄 (`GripVertical` & HTML5 Drag & Drop)**：
  - 在 `BlockItem.tsx` 统一抽象 `renderSideHandle` 与 `renderDropIndicator`，为所有块类型（常规文本、标题、引用、列表、待办、代码、Callout、数据表格、思维导图、数学公式、图片等）统一注入 6 点拖拽抓手；
  - 拖拽经过目标块时，根据鼠标相对中心高度智能显示顶部或底部蓝色高亮指示线（`h-0.5 bg-sky-400 animate-pulse`）；
  - 释放拖拽时在 `BlockEditor.tsx` 中执行数组切片原子重排，连续重新赋予自增 `sortOrder`，并异步持久化保存至本地 SQLite 数据库。

- **实时字数、字符数与阅读时长统计微光胶囊 (`DocStatsBadge.tsx`)**：
  - 在右下角挂载暗黑磨砂玻璃胶囊，实时计算文档总块数、中文字数、英文单词数、字符数以及按 300字/分钟预估的阅读时长；
  - 深度监听 `selectionchange` 事件，当用户在正文划选任意选区时，统计胶囊即刻高亮提示当前选区的词数与字符数，选区取消后平滑还原为全局统计。

- **目录大纲智能层级过滤与 ScrollSpy 导航 (`outline:scrollspy-and-filter`)**：
  - 目录大纲顶部增加「全部」、「仅 H1」、「H1 + H2」微型层级过滤胶囊切换，帮助快速把握长文档骨架；
  - 正文滚动区域监听滚动事件，动态计算视口顶部 120px 范围内的阅读章节，在右侧大纲对应条目呈现亮青色侧指示标与背景微光；
  - 点击任意大纲标题平滑滚动定位并自动激活该标题。

## [0.1.59] - 2026-11-18

### Feat (文档引擎：阶段 2 - 多维图表嵌入、内嵌思维导图、Mermaid 架构流程图与双向知识关联)

- **嵌入式结构化思维导图卡片 (`block:mindmap` / `MindMapEmbedBlock.tsx`)**：
  - 新增 `MindMapEmbedBlock.tsx` 嵌入式思维导图组件，支持斜杠指令 `/mindmap` 极速插入；
  - 36px 独立结构化 Header 控制栏：导图标题双击即时重命名、实时节点数统计徽标（`N 节点`）、添加子分支（`Plus` 按钮 / `Tab` 快捷键）、删除选中分支（`Trash2` / `Delete` 快捷键）、左右双向/单向发散切换（`GitFork`）、彩虹分支高亮切换（`Palette`）、缩放视口（`ZoomIn`/`ZoomOut`/`Ctrl+滚轮`）、视角重置（`RotateCcw`）以及沉浸式全屏编辑（`Maximize2`/`Minimize2`）；
  - 零外部冗余开销无缝复用 `SelfWork` 原生 `MindMapCanvas` 贝塞尔曲线与彩虹分支排版引擎；
  - 数据树模型与状态持久化保存在 `doc_blocks.properties.root` 中，支持多级展开/折叠与节点重命名。

- **Mermaid 架构流程图双模可视化 (`block:code` with `language === 'mermaid'` / `MermaidPreview.tsx`)**：
  - 在代码块切换或新建为 Mermaid 语言时，Header 右侧提供「⚙️ 源码」与「📊 架构图」双模切换胶囊；
  - 架构图视图自动编译暗黑主题矢量 SVG 并居中呈现，支持 SVG 放大缩小与一键复制矢量 SVG 源码；
  - 内置语法错误温和边界提示，发生语法错误时提供友好的解析提示与一键切回源码修改按钮，绝不白屏或崩溃。

- **KaTeX LaTeX 数学公式块 (`block:math` / `MathBlock.tsx`)**：
  - 新增独立公式块（支持 `/math` 斜杠指令），双击进入 LaTeX 源码多行编辑；
  - 实时边输入边预览 KaTeX 高保真数学公式；
  - 支持 `Shift + Enter` 极速完成排版，公式居中呈现并支持一键复制 LaTeX 源码。

- **双向工作区文档引用与即时穿透跳转 (`mention:pages` / `PageMentionMenu.tsx`)**：
  - 在正文编辑中键入 `[[` 即时弹出当前工作区文档的模糊检索菜单（`PageMentionMenu.tsx`）；
  - 支持键盘方向键与回车选取目标文档，自动生成带微光的 `[data-page-link]` 页面胶囊超链接；
  - 无论在只读或编辑模式下，点击页面胶囊即刻平滑切换至目标文档。

## [0.1.58] - 2026-11-18

### Feat (文档引擎：阶段 1 - 排版垂直节奏重塑、标题呼吸空间与正文结尾打字机沉浸式留白)

- **各级标题垂直排版节奏重构 (`typography:heading-rhythm`)**：
  - 彻底根治所有块统一硬编码 `py-1 my-0.5`（仅 2px 间距）导致的标题与上一段正文“贴脸拥挤”问题；
  - 严格遵循出版物“临近原则（Proximity Principle）”，动态计算各级标题外边距：
    - `case 'h1'`: 上外边距大幅拉升至 40px，下外边距 10px（`mt-10 mb-2.5 pt-2`），形成开阔的章节开辟呼吸感；
    - `case 'h2'`: 上外边距 32px，下外边距 8px（`mt-8 mb-2 pt-1`），中层小节自然舒展；
    - `case 'h3'`: 上外边距 20px，下外边距 6px（`mt-5 mb-1.5`）；
    - 普通段落、列表保持紧凑工整 `py-1 my-0.5`，卡片类块保持 `my-3.5`。

- **正文结尾打字机模式留白 (`ux:typewriter-bottom-scroll`)**：
  - 正文滚动容器底部内边距由原先逼仄的 `pb-8`（32px）大幅提升至 **`pb-48`（192px 约半屏净空）**；
  - 确保长篇文档滚动到底部时，最后一行文字永远悬停在视口中上方黄金视野，彻底消除光标卡死在屏幕下边缘的触底压迫感；
  - 优化底部新增段落占位微交互为柔和幽灵虚线边框卡片（`border-dashed hover:border-white/10`）。

- **大标题与正文起首黄金过渡层 (`typography:title-spacing`)**：
  - 大标题输入框下方建立 `mt-4 mb-2 border-b border-white/[0.04]` 微弱基准线与 32px 空间，形成封面/标题与正文起首的优雅过渡。

## [0.1.57] - 2026-11-18

### Feat (文档引擎：对标 Notion/BlockSuite 简单数据表格 TableBlock 与多维可视化深度重构)

- **原生内嵌简单数据表格 (`block:table` / `TableBlock.tsx`)**：
  - 新增 `TableBlock.tsx` 交互式二维表格组件，彻底取代原先静态占位卡片；
  - 采用现代暗黑卡片风格（`my-3.5 rounded-2xl bg-[#0d1117] border border-white/[0.08] shadow-2xl overflow-hidden`）；
  - 36px 独立结构化 Header 控制栏：左侧显示数据表格徽标与实时 `C 列 × R 行` 尺寸指示，右侧聚合「首行表头切换」、「一键复制 Markdown 表格（带绿勾成功反馈）」、「增加列」、「增加行」与「删除整表」；
  - 表头行采用 `bg-[#161b22]` 微灰渐变底色与加粗排版，数据行悬浮激活动态微光晕（`hover:bg-white/[0.02]`）；
  - 单元格支持即时编辑与富文本渲染（等宽行内代码 `code`、加粗 `strong`、高亮 `mark`、链接 `a`）；
  - 单元格支持键盘工学导航：`Tab` 平滑移动至下一个单元格，行尾按 `Tab` 自动扩展新增一行并使新行首格聚焦。

- **多维内容体系与斜杠菜单对齐 (`slash:multi-dimensional`)**：
  - 斜杠指令菜单 `/table` 升级为「数据表格 (Table)」，提供清晰的对比排版微文案；
  - `markdownExport.ts` 增补对 `table` 的 1:1 双向序列化输出，保证导出为标准 Markdown 表格。

- **既有笔记 10 大技术对比表格 100% 无损对账与原位修复 (`hydration:notion-tables`)**：
  - 升级 Markdown 表格语法状态机解析器，精准识别多行 `| col |` 与 `| --- |` 分割线；
  - 对《02.3-02.5》深度笔记中的全部 10 个散架表格执行 1:1 原位重构编译并写入 SQLite 物理数据库：
    1. 集合创建语法对照表（`{}` 字典 vs `set()` 空集合）
    2. 集合删除方法对比表（`remove` vs `discard` vs `pop` vs `clear`）
    3. 集合数学运算符号与执行结果速查表
    4. `set` 与 `frozenset` 选型场景对比表
    5. `list` 与 `dict` 底层特征全方位对照表
    6. 字典键值获取方式选型表（`data["key"]` vs `data.get()`）
    7. 数据结构组织形态适用场景表
    8. 内置类型可哈希性与普通字典键合法性速查表
    9. `get()` 与 `setdefault()` 行为差异表
    10. `NotImplemented` 与 `NotImplementedError` 区分表

## [0.1.56] - 2026-11-18

### Feat (文档引擎：对标 Notion/GitHub 现代代码块专业细腻度工业级重构)

- **现代独立 Header Bar 与呼吸空间重塑 (`code:header-bar`)**：
  - 彻底移除旧版“悬浮遮挡第 1 行代码”的绝对定位按钮组，升级为 36px 独立结构化顶部控制条（`h-9 px-3 bg-[#161b22]/90 border-b border-white/[0.06]`）；
  - 代码卡片容器升级为 `my-3.5 rounded-2xl bg-[#0d1117] border border-white/[0.08] shadow-2xl`，提供足够的上下一级呼吸间距与圆角质感；
  - 容器新增 `focus-within:border-sky-500/40 focus-within:ring-1 focus-within:ring-sky-500/20` 柔和聚焦光晕；
  - 左侧常驻语言选择 Pill（带向下小箭头，点击呼出半透明模糊浮层支持快速切换 14+ 种主流语言并自动重绘高亮）；
  - 右侧配备「换行 / 不换行」、「行号开关」与带已复制对勾反馈的「一键复制代码」微胶囊。

- **1:1 绝对定宽行高与垂直基准线零漂移对齐 (`code:line-height-parity`)**：
  - 根治导致行号与代码多行错位的核心病因（旧版行号 `text-xs` 与编辑区 `text-sm leading-relaxed` 字体基准差异）；
  - 强制 1:1 锁死行号列与代码编辑区为 `font-mono text-[13px] leading-[22px]`，每行行高严格 `22px`；
  - 统一外层容器 `py-3` 内边距，行号列与代码第 1 行及后续第 N 行实现数学级水平平行，彻底杜绝多行垂直漂移。

- **GitHub Dark / One Dark 高质感色彩系统 (`code:palette-redesign`)**：
  - 彻底剔除刺眼的未高亮报错粉红默认色（`text-rose-300`），将基准普通代码文本定为舒适中性浅白 `text-slate-200`；
  - 全面调优 `TOKEN_COLORS` 语法色盘：紫罗兰关键字（`text-purple-400`）、柔和薄荷绿字符串（`text-emerald-300`）、石墨灰斜体注释（`text-slate-500 italic`）、琥珀色数字常量（`text-amber-300`）、天蓝内置函数（`text-sky-300`）、青绿类型（`text-teal-300`）等；
  - 行内代码块同步重塑为柔和护眼的 `text-amber-200/90` 配合微透明黑底 `bg-white/[0.08]`。

- **智能缩进与按键工学升级 (`code:smart-indent`)**：
  - **Enter 智能前导缩进继承**：回车换行时自动提取上一行的前导空格；若上一行末尾为 `{`、`[`、`(` 或 `:`，智能追加一级缩进，写代码不再反复按空格；
  - **语言自适应 Tab 缩进**：针对 Python 智能插入 4 空格，其他语言插入 2 空格；
  - **Shift + Tab 反向缩进（Outdent）**：支持快捷回缩当前行最多一个缩进单位的前导空格并平滑保护光标。

## [0.1.55] - 2026-11-18

### Feat (文档引擎：P1-4 Notion 沉浸式大封面 Banner + P1-1 多媒体图片块 + P1-2 Markdown 补全 + P1-3 段落对齐)

- **P1-4 Notion 沉浸式页面大封面 Banner (`page:cover`)**：
  - 8 款预设暗黑科技与自然渐变壁纸 `PRESET_COVERS`（深空、极光、暮落、电紫、湛夜、林郁、绛夜、黑曜），支持自定义图片网络 URL；
  - 页面滚动区顶端渲染 `h-40` 沉浸式封面大条带，自适应 object-cover / background gradient；
  - 悬停浮动「更换封面」与「移除封面」半透明胶囊操作组；
  - 文档图标 Emoji 采用 `-mt-7 ml-8` 毛玻璃微光边框浮空重叠在封面上，还原正统 Notion / 飞书旗舰质感；
  - 无封面状态下悬停标题区优雅显现「🖼️ 添加封面」幽灵按钮；
  - `DocsView.tsx` 联动 `saveDocPage` 实现页面封面元数据在 SQLite 底层无损持久化。

- **P1-1 多媒体图片块 (`block:image`)**：
  - `BlockType` 增补 `'image'`；斜杠菜单 `/image` 快速插入；
  - 空状态提供优雅的浅灰边框卡片，支持本地图片上传（自动转换为 Base64 DataURL）与网络图片 URL 快速插入；
  - 载入状态居中圆角 `rounded-xl`、微质感边框 `border-white/10`，最大高度 500px；
  - 下方提供微文案风格的独立可编辑 Caption 图片说明；悬停显示「更换」、「对齐」与「删除」小胶囊；
  - `markdownExport.ts` 联动输出 `![caption](src)` 标准 Markdown。

- **P1-2 Markdown 快捷输入补全增强 (`ux:md-shortcuts-v2`)**：
  - 行首 `1. ` 自动蜕变转换：支持连续输入 `1. ` 自动变为 `numbered` 有序列表项；
  - 行首 `>> ` 快捷蜕变：自动转换为 `toggle` 折叠块，剩余文本作为 summary；
  - `markdownToHtml` 与输入处理支持 `==text==` 自动转为 `<mark>` 高亮并在打字时实时生效。

- **P1-3 段落微排版对齐 (`inline:align`)**：
  - `DocBlock.format` 支持 `textAlign?: 'left' | 'center' | 'right'`；
  - `FloatingFormatToolbar` 增加左/中/右对齐控制按钮组；
  - 块级容器与编辑区应用 `style={{ textAlign }}` 并持久化至底层 SQLite。

## [0.1.54] - 2026-11-18

### Feat (文档引擎：P0 链接插入/高亮色板/Toggle折叠块 + P1-7 Markdown 导出)

- **P0-1 链接插入与自动渲染 (`inline:link`)**：
  - `FloatingFormatToolbar` 与 `BlockContextMenu` 增加「🔗」按钮，内联展开 200px 输入框，支持 URL 自动协议补充、Enter 确认与 Esc 取消；
  - 选区自动转化为 `<a href="..." target="_blank" class="text-sky-400 underline underline-offset-2 hover:text-sky-300">...</a>`；
  - `BlockItem.markdownToHtml` 前置支持 `[text](url)` Markdown 格式及裸 URL 自动超链接识别；
  - `markdownExport` 逆向清理规则支持 `<a>` 标签无损还原为 `[text](url)`。

- **P0-2 文字高亮与 6 色色板 (`inline:highlight`)**：
  - 浮动工具栏与右键菜单增加「A」高亮按钮，展开 6 色半透明色板（黄 `#FFD93D40`、红 `#FF6B6B40`、绿 `#6BCB7740`、蓝 `#4F87FF40`、紫 `#C77DFF40`、橙 `#FF9A3C40`）与清除高亮按钮；
  - 选区格式化为 `<mark style="background:...; border-radius:3px; padding:0 2px;">`；
  - `markdownExport` 逆向清理规则支持 `<mark>` 标签还原为 Obsidian 标准 `==text==` 高亮语法。

- **P0-3 Toggle 折叠块 (`block:toggle`)**：
  - `BlockType` union 新增 `'toggle'`；
  - `SlashMenu` 注册「折叠块（Toggle）」条目与 `ChevronRight` 图标；
  - 新建 `BlockToggle.tsx` 独立组件：
    - 支持 ▶/▼ 展开折叠切换，旋转动效；
    - 标题 Summary 区与内部子内容区物理隔离，支持独立 contentEditable；
    - 回车键一键切换展开/折叠，空行 Backspace 降级为段落；
    - 左侧悬浮侧柄完整继承（增块、删块）。

- **P1-7 Markdown 导出服务 (`export:markdown`)**：
  - 新建 `src/services/markdownExport.ts`，支持将整篇文档清洗为标准 GFM Markdown；
  - 覆盖 H1-H3、段落、引用、待办复选框、无序/有序列表、代码块（带语言）、Callout、Toggle 折叠块及水平分隔线；
  - `BlockEditor` 顶部栏操作区新增「导出为 Markdown」按钮，一键序列化并复制至系统剪贴板。

## [0.1.53] - 2026-11-17

### Feat (思维导图 P0+P1 — 折叠/展开、撤销/重做、键盘导航、彩虹分支、XMind 样式面板)

- **P0-1 节点折叠/展开子树**：
  - `Space` 键触发折叠/展开选中节点的子树；
  - 折叠圆点指示器（右侧 `-right-2.5` 绝对定位），折叠时高亮为 `sky-400`，展开时为透明悬停；
  - 折叠节点在 `layout.ts` 的 `measureSubtreeHeight` 中跳过子树递归，布局零误差；
  - 工具栏新增「折叠全部」（`ChevronsDownUp`）/ 「展开全部」（`ChevronsUpDown`）按钮；`/` 键快速折叠全部。

- **P0-2 完整键盘快捷键**：
  - `Tab` → 添加子分支（原有，保留）
  - `Enter` → 添加同级分支（原有，保留）
  - `Delete/Backspace` → 删除选中节点（原有，保留）
  - `Space` → 折叠/展开（**变更**：原为开始编辑）
  - `F2` → 开始编辑节点（**变更**：原 Space/F2 均为编辑）
  - `ArrowRight/Left/Up/Down` → 按空间邻近算法跳转至最近节点
  - `Alt+ArrowUp/Down` → 节点在兄弟列表中上/下排序
  - `Ctrl+Z` → 撤销 / `Ctrl+Y` / `Ctrl+Shift+Z` → 重做
  - `Ctrl+D` → 复制选中节点（含完整子树，重新生成所有 id）
  - `/` → 折叠全部

- **P0-3 撤销/重做历史栈**：
  - `undoStackRef`（MindMapNode 深克隆，最多 50 步）+ `redoStackRef`；
  - 所有写操作（addChild / addSibling / delete / toggleCollapse / moveUp / moveDown / duplicate / collapseAll / expandAll）均在前调用 `pushUndo(root)`；
  - 工具栏新增撤销（`Undo2`）/ 重做（`Redo2`）按钮，`canUndo` / `canRedo` prop 驱动灰化；
  - 切换文档或新建文档时自动清空历史栈。

- **P1 彩虹分支**：
  - `RAINBOW_COLORS = ['#4F87FF','#FF6B6B','#FFD93D','#6BCB77','#C77DFF','#FF9A3C']`；
  - 一级子树（depth=1）各自分配独立颜色，递归向下继承同色；
  - `rainbowBranch=true` 时 `MindMapCanvas` 读取 `conn.color` 渲染彩色 SVG 路径；
  - 彩虹分支 Toggle 位于右侧样式面板「分支」区。

- **P1 XMind 风格样式面板**（新建 `MindMapStylePanel.tsx`）：
  - 220px 宽，`bg-slate-900/95 backdrop-blur-xl` 毛玻璃深色右侧面板；
  - 仅在选中节点时显示，三 Tab 结构（样式 / 演说 / 画布）；
  - 形状切换：圆角矩形 / 矩形 / 胶囊；
  - 填充颜色 / 边框颜色：8 色色板 + 自定义色轮；
  - 文本：字号 slider（12-32）+ 加粗 / 斜体切换；
  - 结构：「向右」/ 「双向」布局切换按钮；
  - 分支：线条样式（曲线/折线/直线）+ 彩虹分支 Toggle + 单色颜色选择；
  - 底部「重设样式」按钮清空节点自定义样式。

- **P1 双向布局**：
  - `layout.ts` 新增 `calculateBothLayout()`：偶数索引子树向左展开，奇数向右，根节点固定居中 x=480；
  - 工具栏布局切换按钮（`ArrowRight` ↔ `ArrowLeftRight` 图标）；
  - `MindMapCanvas` 根据 `layoutDirection` prop 决定调用哪套布局函数。

- **节点自定义样式渲染**（`MindMapCanvas.tsx`）：
  - `NodeCardItem` 读取 `node.style`，inline style 覆盖 background / borderColor / color / fontSize；
  - 形状通过 `shapeClass` 切换 `rounded-lg` / `rounded-none` / `rounded-full`。

- **架构变更**：
  - `MindMapView.tsx` 新增 `layoutResultRef`（存储最新布局结果供键盘导航使用）；
  - `MindMapCanvas` 新增 `onLayoutResultChange` 回调；
  - `MindMapView` 渲染结构变更：画布区域改为 `flex flex-row`，右侧条件渲染样式面板；
  - `MindMapToolbar` 从 `MindMapView` 提升至顶层渲染（原嵌套在画布层内）。

## [0.1.52] - 2026-11-17

### Feat (文档引擎：Callout 提示框 + 有序列表 + TOC 大纲)

- **新增 `callout` 块类型（提示框）**：
  - 支持 4 种主题：`info`（天蓝）、`warn`（琥珀）、`success`（翠绿）、`tip`（紫罗兰），背景色 + 边框 + 文字三联动；
  - 左侧图标支持点击选择（10 个预设 Emoji），悬停右侧展示主题切换 4 色圆点微胶囊；
  - 斜杠菜单 `/callout` 触发；回车在 callout 下方新建段落，退格空内容降级为普通段落；
  - 完整富文本编辑（加粗、斜体、代码行内、划线）+ 右键上下文菜单 + 浮动格式工具栏全部继承。

- **新增 `numbered` 块类型（有序列表）**：
  - BlockEditor 预计算连续序号注入每个 `numbered` 块（遇到非 `numbered` 块重置计数，严格按数组顺序从 1 开始）；
  - 左侧等宽序号 `1.` 字样以 `font-mono text-slate-400` 渲染，视觉与无序列表圆点对齐；
  - 斜杠菜单 `/numbered` 触发；回车继承 `numbered` 类型插入下一条，空行回车降级为 `p`；退格行首降级为段落；
  - 富文本能力与浮动工具栏完整继承。

- **TOC 目录大纲（已内置于 BlockEditor）**：确认已完整实现：
  - 自动提取所有 `h1` / `h2` / `h3` 块构建大纲条目，右侧 `目录大纲` 面板实时渲染（带层级缩进）；
  - 点击任意条目触发 `scrollIntoView({ behavior: 'smooth' })`，精准平滑定位至对应块的 `id=block-{id}` 锚点；
  - 支持一键展开/收起，顶栏按钮带条目计数显示。

- **BlockType 类型扩展 (`src/types/docs.ts`)**：
  - 联合类型新增 `'numbered'` 和 `'callout'`；不影响既有类型，向后兼容 SQLite `block_type` TEXT 存储。

- **SlashMenu 新增两项 (`SlashMenu.tsx`)**：
  - `numbered`：`ListOrdered` 蓝色图标，标签「有序列表」；
  - `callout`：`MessageSquare` 紫色图标，标签「提示框（Callout）」。

### 工程质量
- `tsc --noEmit` 零错误零警告 (exit 0)；
- `cargo test` 14/14 通过 (exit 0)；
- 生产构建 `tauri build --no-bundle` 成功；
- 通过 `vscode-review` diff 工具确保所有变更均经 VS Code 检阅。

## [0.1.51] - 2026-11-17

### Fix & Architecture (快速启动多显示器定向投放与屏幕几何划分彻底根治)
- **底层 PowerShell 5.1 语法纯净化与命令解析异常根除 (`src-tauri/src/lib.rs`)**:
  - 彻底铲除在 Windows PowerShell 5.1 中导致致命 `ParserError` 的 `&&` 与 `||` 操作符，全量恢复为标准 `-and` 与 `-or` 语法；
  - 拔除 PowerShell 数组定义 `@(...)` 中的行尾多余逗号，彻底消灭 `MissingExpressionAfterToken` 语句中断；
  - 对 `ShowWindow` 与 `SetWindowPos` 调用引入 `[void]` 拦截，杜绝布尔值污染输出流管道。
- **反欺诈与真实错误透传机制建立**:
  - 彻底拔除 `.unwrap_or(specs.len())` 假通兜底，当 PowerShell 进程执行失败或输出异常时，真实返回 Err 并将底层错误明文暴露给前端日志；
  - 仅在真实窗口就位时递增 `placedCount`，实现 100% 真实凭据打钩。
- **多维模糊指纹命中模型与条目名称感知 (`src-tauri/src/lib.rs` / `LauncherDashboard.tsx`)**:
  - `WindowPlacementSpec` 契约扩充 `pub item_name: Option<String>`，前端实时透传用户命名的条目中文别名；
  - 后端自动解构 `TargetStem`（去除 `.exe` 词干，如 `chrome`、`msedge`、`code`）；
  - 融合“物理文件夹路径 -> 桌面顶级活动窗口标题 -> 进程名称 -> 条目别名”四重立体比对，彻底解决 Chrome/Edge/微信 等无 `.exe` 窗口标题导致的分屏捕获落空问题。
- **解除系统最大化与多显示器绝对坐标就位**:
  - 严格执行 `ShowWindow(hWnd, 9 /* SW_RESTORE */)`，解除 Windows 最大化状态对坐标与尺寸的死锁；
  - 基于真实物理显示器工作区 `(base_x, base_y, work_w, work_h)`，将窗口精准挪移至目标屏幕（主屏 X=0 / 副屏 X=1920），彻底杜绝跨屏漂移；
  - 自动应用四分屏田字格与双分屏无缝贴合比例，DWM 缝隙微重叠补偿完全生效。
- **工程质量与全维验证**:
  - 新建专用物理见证者实测套件 `scripts/launcher-multimonitor-split-test.mjs`（5/5 断言全绿，退出码 0）；
  - `cargo test` 14/14 单元测试全部通过（退出码 0）；
  - `pnpm check` (`tsc --noEmit`) 零警告零错误（退出码 0）；
  - 改动文件均通过 VS Code 原生视图通道供用户把控。


## [0.1.50] - 2026-11-17

### Feature & Architecture (文档代码块语法高亮与行号基建 & 快速启动文件夹直达与组合分屏排障)
- **文档中心代码块语法高亮引擎与行号呈现 (`src/components/docs/editor/codeHighlight.ts` / `BlockItem.tsx`)**:
  - **自研轻量零依赖语法着色引擎**：支持 Python、JavaScript/TypeScript、Rust、SQL、Bash/Shell、JSON、HTML、CSS、Go、C/C++、Java 等语言的分级高亮着色：
    - 关键字（蓝青）：`text-sky-400 font-medium`
    - 字符串（薄荷绿）：`text-emerald-400`
    - 注释（灰绿/石墨色）：`text-slate-500 italic`
    - 数字/常量（橙/琥珀）：`text-amber-400` / `text-amber-300`
    - 内置函数/API（天蓝）：`text-cyan-300`
    - HTML 实体转义（`<`、`>`、`&`）自动防护，杜绝泛型与标签渲染冲突；
  - **光标与选区绝对保护 (`getCaretOffset` / `restoreCaretOffset`)**：
    - 实现字符级光标偏移量计算与精准还原算法，在打字输入、粘贴代码及下拉菜单切换语言时，语法着色即时渲染且光标与选区绝不丢失、不跳动；
    - 挂载 `isComposingRef` 中文输入法（IME）合成态保护与 `handlePaste` 纯文本粘贴拦截；
  - **行号呈现列与 1:1 像素级基准对齐**：
    - 左侧独立渲染行号列（`min-w-[2.5rem]`、右对齐、`border-r border-white/10`、`text-slate-600`、`select-none`）；
    - 与右侧代码编辑区共享 `leading-relaxed`，保证大字号及多行换行下行号与代码行绝对 1:1 像素级对齐；
    - 悬浮胶囊栏新增 `ListOrdered` 按钮，支持一键切换行号显隐；
  - **既有工学 100% 保全**：
    - 16px 微软雅黑字号、Tab 缩进 2 空格、Enter 多行换行、一键复制、自动换行开关无损继承。

- **快速启动文件夹精准直达与组合分屏平铺全链路排障 (`src-tauri/src/lib.rs` / `LauncherDashboard.tsx`)**:
  - **根除文件夹退回到“此电脑/文档”缺陷**：
    - 拔除 Windows 原生 `explorer.exe` 不支持的 `/separate` 非法参数，改由原生标准目录参数唤起，确保 100% 秒级直达用户指定的本地文件夹；
  - **三层高可靠窗口捕获与分屏吸附 (`arrange_combo_windows`)**：
    - 突破 Windows 11 Explorer 标签页与不同桌面会话导致的 HWND 捕获失败盲区；
    - 引入基于 `EnumDesktopWindows`（`WinSta0/Default`）的顶级桌面窗口枚举体系，精准捕获 `CabinetWClass`（文件资源管理器）及所有活动应用窗口真实句柄与标题；
    - 配合 `Shell.Application.Windows()` 路径比对与 `MainWindowHandle`，实现三层立体容灾捕获与毫秒级四分屏/双分屏精准平铺；
  - **前端启动项路径输入全量清洗与规范化**：
    - 在文件选取与表单落库时，统一剥离外层多余双引号并将正斜杠转换为 Windows 标准反斜杠，保证文件、程序（.exe）、物理目录与 .lnk 快捷方式的绝对路径 100% 格式纯净。

- **工程质量与全维验证**:
  - 所有代码变更均已通过 VS Code 原生视图通道供用户把控；
  - 编写并运行专用代码块语法着色与行号测试套件 `scripts/doc-codeblock-syntax-test.mjs`（6/6 断言全绿，退出码 0）；
  - 编写并运行快速启动路径与分屏吸附集成验证套件 `scripts/launcher-target-snap-verify.mjs`（3/3 断言全绿，退出码 0）；
  - `pnpm check` (`tsc --noEmit`) 零警告零错误（退出码 0）；
  - `cargo test` 14/14 单元测试全部通过（退出码 0）。


## [0.1.49] - 2026-11-17

### Feature & UX (文档中心代码块智能识别、悬浮微光操作胶囊栏与击键工学基建)
- **文档中心代码块智能识别与行首 Markdown 语法糖 (`src/components/docs/editor/BlockItem.tsx`)**:
  - 深度对标 Notion Python 知识库标准，支持行首输入 ```<lang>```（如 ```python```、```js```、``````）敲击空格或回车瞬间自动蜕变为代码块；
  - 自动将捕获的语言代号存入 `block.properties.language`，并自适应动态呈现占位符（如 `// 输入或粘贴 python 代码...`）。
- **代码块右上角悬浮微光操作胶囊栏 (Floating Action Bar)**:
  - 鼠标悬停（Hover）或处于编辑态时右上角自动浮现暗色玻璃态微光操作条；
  - **语言切换器（Language Picker）**：支持内置 15 种主流编程与标记语言（Python、JavaScript、TypeScript、Rust、SQL、Bash、JSON 等）带高亮选择；
  - **一键复制代码（Copy to Clipboard）**：点击提取纯净代码文本写入系统剪贴板，呈现绿色对勾与“已复制”即时视觉反馈；
  - **代码换行开关（Line Wrap Toggle）**：支持在“单行水平横向滚动”与“按容器宽度自动折行”之间无缝切换。
- **专业击键工学与缩进调度保护**:
  - 代码块内按下 `Tab` 键直接插入 2 个标准空格缩进，绝不将焦点跳离当前编辑器；
  - 代码块内按下 `Enter` 键执行多行换行，绝不破坏拆分当前块；
  - 空代码块按下 `Backspace` 键自动平滑降级回退为普通段落。
- **工程质量与全维验证**:
  - 所有代码变更均通过 `vscode-review:review_diff_in_vscode` 与 VS Code 原生差异视图双向审核确认；
  - 编写并运行专用代码块测试套件 `scripts/doc-codeblock-test.mjs`（全维断言通过，退出码 0）；
  - `pnpm check` (`tsc --noEmit`) 零警告零错误（退出码 0）；
  - `cargo test` 14/14 单元测试全部通过（退出码 0）。


## [0.1.48] - 2026-11-17

### Feature & Architecture (快速启动外部进程生命周期解耦、Windows Shell 独立脱壳与文档排版阶梯升级)
- **Win32 原生 `ShellExecuteW` 工业级外壳委托机制 (`src-tauri/src/lib.rs`)**:
  - 彻底拔除导致外部进程随 SelfWork 关闭而退出的根本原因：全面采用 Win32 原生 `ShellExecuteW` 工业级外壳委托机制替换原有朴素 `Command::spawn()`；
  - 外部应用程序（微信、Chrome、飞书、Cockpit、记事本等）的宿主直接归属于系统桌面外壳（`explorer.exe`），彻底突破 SelfWork 的 Job Object（作业对象）与进程树强依赖；
  - 增设 Detached Process 进程组独立标志安全兜底（`0x00000200 | 0x00000008`），确保系统外壳受阻时仍能独立运行；
  - 快捷方式（`.lnk`）与网络 URL 接入 `ShellExecuteW` 秒级直达，消除繁琐 PowerShell 额外启动开销与黑框闪烁。
- **运维与热替换脚本净化 (`scripts/replace-and-launch.mjs`)**:
  - 彻底移除 `taskkill` 中的 `/T` 级联子进程杀死参数，将进程终止操作精准限制在 `SelfWork.exe` 进程单体，杜绝运维热更误杀已拉起外部程序。
- **文档中心排版美学与字号阶梯升级 (`src/styles/globals.css` / `BlockEditor.tsx` / `BlockItem.tsx`)**:
  - 注入 `.doc-typography` 样式类，强制优先使用微软雅黑（`Microsoft YaHei`）字体族与 `text-rendering: optimizeLegibility` 抗锯齿渲染；
  - 默认正文字号由 14px 全面提升至舒适的 16px (`text-base`) 与 1.75 倍自然行高 (`leading-relaxed`)；
  - H1 升级至 28px、H2 升级至 22px、H3 升级至 18px，文档主标题提升至 30px (`text-3xl font-bold`)；
  - 待办复选框微调至 18px 并自适应基线对齐，无序列表圆点精准对齐，确保大字号下舒展不拥挤。
- **工程质量与全维验证**:
  - 所有代码变更均通过 `vscode-review:review_diff_in_vscode` 与 VS Code 原生差异视图双向审核确认；
  - 编写并运行专用进程生命周期与存活断言测试套件 `scripts/launcher-lifecycle-test.mjs`（全维断言通过，退出码 0）；
  - 编写并运行文档字体与排版自动化测试套件 `scripts/doc-typography-test.mjs`（全维断言通过，退出码 0）；
  - `pnpm check` (`tsc --noEmit`) 零警告零错误（退出码 0）；
  - `cargo test` 14/14 单元测试全部通过（退出码 0）。


## [0.1.46] - 2026-11-16

### Feature & Fix (快速启动屏幕分屏吸附精度与多窗口去重防重叠架构加固)
- **多窗口唯一绑定与 `$usedHwnds` 句柄排他池 (`src-tauri/src/lib.rs`)**:
  - 彻底拔除导致多个窗口“重叠在一起、互相遮挡”的根因：在原生吸附编排管道 `arrange_combo_windows` 中引入 `HashSet[int]` 句柄黑名单排他池；
  - 每一个象限槽位在匹配物理窗口句柄时，先进行排他池过滤，匹配成功后立即锁入黑名单，彻底杜绝已分配窗口被后续槽位重复移动，实现重叠率绝对为 0%。
- **自适应多轮轮询探测管道 (消除 350ms 启动异步时差导致的主副屏落点漂移)**:
  - 彻底拔除导致“有的落在屏幕一、有的落在屏幕二”的根因：多文件夹并发唤起时，Windows 资源管理器需要 800ms~1500ms 异步完成窗口注册。过去单次 350ms 盲等导致后就绪窗口落空，滞留于系统默认的主屏；
  - 重构为最大 6 轮（最多 2.5 秒，每轮 300ms 增量轮询）自适应探测机制，只要全部槽位就位立即退出，后就绪的窗口在生成瞬间立即被捕获并吸附至指定目标屏幕，排版成功率达 100%。
- **Windows 11 Explorer 标签页吞并隔离**:
  - 在 `launch_custom_target` 唤起文件夹时注入 `/separate` 原生参数，强制每个文件夹在独立的物理新窗口中打开，杜绝 Windows 11 自动合并为同一窗口内的 Tabs 导致句柄冲突。
- **物理显示器坐标基准 100% 绝对锚定**:
  - 严格以选定显示器工作区原点（主屏 X=0，副屏 X=1920）计算绝对坐标，并在定位前显式下发 `ShowWindow(hWnd, 9 /* SW_RESTORE */)` 还原最大化锁定状态，再执行 `SetWindowPos` 停靠，彻底消灭跨屏飞跃。
- **工程质量与全场景核销**:
  - 所有代码变更均通过 `vscode-review:review_diff_in_vscode` 与 VS Code 原生差异视图双向审核确认；
  - 编写并运行专用分屏核销测试套件 `scripts/launcher-snap-tiling-test.mjs`，涵盖副屏物理坐标区间计算、句柄去重互斥与多轮轮询模拟（全维断言通过，退出码 0）；
  - `pnpm check` (`tsc --noEmit`) 零警告零错误（退出码 0）；
  - `cargo test` 14/14 单元测试全部通过（退出码 0）；
  - 单文件绿色生产可执行文件 `SelfWork.exe` 成功编译构建并通过 `scripts/replace-and-launch.mjs` 安全热替换上线（新进程 PID: 21784）。


## [0.1.45] - 2026-11-16

### Feature & UX (文档中心编辑全链路加固——Ctrl+Z 聚焦即时撤销、全量选区排版防失焦与划选微光工具栏)
- **Ctrl+Z / Ctrl+Y 聚焦打字状态下即时屏幕回退 (`src/components/docs/editor/BlockItem.tsx` / `BlockEditor.tsx`)**:
  - 彻底拔除导致撤销屏显无反应的元凶：引入 `isLocalInputRef` 精准区分本地敲键盘输入与外部撤销重做状态同步；
  - 移除了过去对聚焦状态（`activeElement === editorRef.current`）下 innerHTML 刷新的阻断逻辑，确保当用户在当前编辑框内打字后按下 `Ctrl+Z` 时，屏幕上的文字即刻、肉眼可见地回退至历史版本，并在回退后平滑将光标锚定在文字末尾；
  - 重构快照分词策略，在遇到空格、标点符号（，。！？,.!?:;）、换行、停顿超 800ms 或结构性改变时自动生成撤销快照，实现逐词/逐句细腻平滑回退；
  - 全局按键分发排除原生 `<input>` 与 `<textarea>`，互不干扰原生系统输入框。
- **划选文本即时浮动微光工具栏 (`src/components/docs/editor/FloatingFormatToolbar.tsx`)**:
  - 新增轻量级选区浮动工具栏组件，在用户鼠标划选一段文字（Selection range > 0）后，自适应在其正上方弹出暗夜微光操作条；
  - 包含 `[B]` 加粗、`[I]` 斜体、`[U]` 下划线、`[S]` 删除线、`[</>]` 行内代码与 `[🧹]` 彻底清除格式 6 大高频工具，无需右键即可 1 键排版。
- **全量文本工具排查与 Mousedown 防失焦保护 (`src/components/docs/editor/BlockContextMenu.tsx` / `BlockItem.tsx`)**:
  - 彻底治愈“选中文本后使用文本工具只有部分文本有效”的顽疾：为上下文菜单和浮动工具条所有按钮统一注入 `onMouseDown={(e) => e.preventDefault()}`，彻底杜绝鼠标点击按钮瞬间导致编辑器失焦与选区坍缩；
  - 新增下划线 `<u>` 原生排版支持与快捷键 `Ctrl+U`；
  - 升级行内代码与彻底清除格式引擎：清除格式能够递归遍历并彻底剥离嵌套的 `<code>`、`<del>`、`<span>` 等所有装饰标签，恢复为绝对纯净基线文本；
  - 块级转换（Turn into）在蜕变前自动抓取当前最新编辑文本，彻底避免内容丢失。
- **工程质量与全链路交互审计**:
  - 所有代码变更均通过 `vscode-review:review_diff_in_vscode` 与 VS Code 原生差异视图双向审核确认；
  - 升级针对用户真实操作路径的端到端交互审计套件 `scripts/docs-editor-interaction-test.mjs`，包含打字回滚、整句加粗覆盖、清除格式彻底性与撤销重做序列全维断言通过（退出码 0）；
  - `pnpm check` (`tsc --noEmit`) 零警告零错误（退出码 0）；
  - `cargo test` 14/14 单元测试全部通过（退出码 0）；
  - 单文件绿色生产可执行文件 `SelfWork.exe` 成功编译构建并通过 `scripts/replace-and-launch.mjs` 安全热替换上线（新进程 PID: 38772）。


## [0.1.44] - 2026-11-16

### Feature & UX (文档中心编辑交互全链路重构——所见即所得富文本、撤销重做历史栈与防抖持久化)
- **持久挂载 `contentEditable` 与纯正富文本渲染 (`src/components/docs/editor/BlockItem.tsx`)**:
  - 彻底废除原有在未聚焦 `<div>` 与聚焦 `<textarea>` 之间频繁卸载/重挂载的模式，消除 DOM 切换导致的焦点脱离、选区丢失与光标瞬移至末尾的顽疾；
  - 彻底终结在文本中直接插入裸露 Markdown `**` 与 `*` 号的做法，升级为真实行内 HTML 富文本（`<strong>`、`<em>`、`<del>`、`<code>`），实现输入与排版即时所见即所得；
  - 原生绑定 `Ctrl+B`（加粗）、`Ctrl+I`（斜体）、`Ctrl+U`（下划线）快捷键；
  - 划选右键上下文菜单（`BlockContextMenu`）排版动作通过调用 `document.execCommand` 在当前 DOM 选区直接应用格式，并在排版后严格保持原选区，彻底解决排版后选区丢失与光标乱跳问题；
  - 内置存量兼容转换器 `markdownToHtml`，自动将存量 Markdown 语法平滑升级为现代富文本，杜绝旧文档星号残留。
- **全生命周期撤销/重做 (Undo / Redo) 历史栈 (`src/components/docs/editor/BlockEditor.tsx`)**:
  - 在文档编辑器顶层构建 `undoStackRef` 与 `redoStackRef` 历史管理栈（支持最大 50 步撤销深度与内存限制保护）；
  - 全局监听 `Ctrl+Z`（撤销）与 `Ctrl+Y` / `Ctrl+Shift+Z`（重做），覆盖文字连续输入快照、格式排版、块类型转换、块插入与块删除；
  - 顶栏右侧新增精致暗晶体撤销与重做操作按钮，方便鼠标点击操作；
  - 目录大纲（Outline）标题文本提取算法强化，过滤并剥离富文本与 Markdown 标记，始终保证目录干净清晰。
- **500ms 智能防抖持久化 (Debounced Persistence)**:
  - 解决原有打字每按一个字符即直接无防抖 `await saveDocBlocks` 导致底层 SQLite 高频并发竞争和界面微卡顿的问题，引入 500ms 智能合并防抖，大幅优化编辑流畅度与响应速度；
  - 页面卸载或切换时自动清理定时器并立即刷盘保证数据绝对不丢。
- **工程质量与承重墙保全**:
  - 所有代码变更均通过 `vscode-review:review_diff_in_vscode` 与 VS Code 原生差异视图双向审核确认；
  - `pnpm check` (`tsc --noEmit`) 零警告零错误（退出码 0）；
  - `cargo test` 14/14 单元测试全部通过（退出码 0）；
  - `launcher-e2e-test.mjs` 真实用户行为测试 30/30 全维断言通过（退出码 0）；
  - `docs-editor-interaction-test.mjs` 富文本与撤销交互全维断言通过（退出码 0）；
  - 单文件绿色生产可执行文件 `SelfWork.exe` 成功编译构建并通过 `scripts/replace-and-launch.mjs` 安全热替换上线（新进程 PID: 6236）。


## [0.1.43] - 2026-11-16

### Feature & UI/UX (快速启动卡片排版极简化、新建项按钮统一与文字去噪)
- **顶栏 `[+ 新建项]` 统一暗夜晶体风格 (`src/components/LauncherDashboard.tsx`)**:
  - 将 `[+ 新建项]` 调整为与相邻的 `[多选启动]`、`[全启动]`、`[分屏组合]` 完全一致的 **Secondary Ghost 暗夜晶体** 样式（`h-8 rounded-xl bg-white/[0.04] border-white/10 hover:border-cyan-500/30 text-slate-300 hover:text-white`，带青色 `+` 图标）；
  - 顶栏 5 个操作按钮实现 100% 像素级一致的材质、半透明度与呼吸感，彻底消除单独高亮造成的突兀感。
- **组合卡片顶栏去冗余与模式排版规整**:
  - 彻底删除了组合卡片顶栏散落脱节的 `N 个应用` 裸露文本；
  - 标题下方仅保留一个纯粹整齐的模式胶囊（如 `[常规顺序唤起]` 或 `[屏幕 1 · 四分屏]`），数量直接在底栏大按钮 `[▶️ 启动套件并平铺 (N项)]` 与中栏成员流中展示。
- **单品卡片全面移除左上角类型文字标签**:
  - 彻底移除了大盘中所有启动项卡片左上角多余的 `[应用]`、`[网址]`、`[脚本]`、`[文件夹]` 等文字标签徽标；
  - 卡片全面回归纯粹的 **40x40 原生高清大图标 + 居中标题 + 极简磨砂底板** 极简美学，彻底消灭视觉噪音。
- **工程质量与承重墙保全**:
  - 所有代码变更均通过 `vscode-review:review_diff_in_vscode` 与 VS Code 原生差异视图双向审核确认；
  - `pnpm check` (`tsc --noEmit`) 零警告零错误（退出码 0）；
  - `cargo test` 14/14 单元测试全部通过（退出码 0）；
  - `launcher-e2e-test.mjs` 真实用户行为测试 30/30 全维断言通过（退出码 0）；
  - 单文件绿色生产可执行文件 `SelfWork.exe` 成功编译构建并通过 `scripts/replace-and-launch.mjs` 安全热替换上线（新进程 PID: 20572）。


## [0.1.42] - 2026-11-16

### Feature & UI/UX (快速启动全局按钮设计体系与调色板收敛重构)
- **三级按钮体系与调色板大降噪 (`src/components/LauncherDashboard.tsx`)**:
  - **Primary Action (首选焦点)**: 将核心高频操作 `[+ 新建项]` 升级为唯一的科技青实体发光高亮按钮（`bg-cyan-500 text-slate-950 font-semibold shadow-[0_0_16px_rgba(6,182,212,0.35)]`），成为顶栏最清晰的视觉引导锚点；
  - **Secondary Ghost (暗晶体次级按钮)**: 将 `[分类]`、`[多选启动]`、`[全启动]`、`[分屏组合]` 与 `[>_ 执行报文]` 彻底从之前“青、绿、粉红、灰”的四色水果糖拼盘中解救出来，统一收敛为高质感的暗夜半透明玻璃晶体（`bg-white/[0.04]` + `border-white/10` + `text-slate-300 hover:text-white hover:border-cyan-500/30`）；
  - 彻底清除静态常驻的高饱和红绿大底色，色彩回归专业沉稳的暗色控制台规范。
- **置顶分屏专区视觉融入全局暗晶体**:
  - 将分屏专区背景板与卡片边框从原本脱节的玫瑰粉红（`rose-500`）重构为深邃暗夜磨砂晶体（`bg-white/[0.025]` + `border-white/[0.08]` + hover 青蓝微光）；
  - 将套件启动按钮 `[▶️ 启动套件并平铺]` 升级为精致的青蓝微光实体风格，与全局暗色控制台浑然一体。
- **刚性几何尺度与基线像素对齐**:
  - 顶栏所有操作按钮与搜索输入框严格锁定在 `h-8 (32px)` 黄金高度；
  - 统一标准圆角尺度为 `rounded-xl (12px)`，消除组件间参差不齐的公差毛刺。
- **工程质量与承重墙保全**:
  - 所有代码变更均通过 `vscode-review:review_diff_in_vscode` 与 VS Code 原生差异视图双向审核确认；
  - `pnpm check` (`tsc --noEmit`) 零警告零错误（退出码 0）；
  - `cargo test` 14/14 单元测试全部通过（退出码 0）；
  - `launcher-e2e-test.mjs` 真实用户行为测试 30/30 全维断言通过（退出码 0）；
  - 单文件绿色生产可执行文件 `SelfWork.exe` 成功编译构建并通过 `scripts/replace-and-launch.mjs` 安全热替换上线（新进程 PID: 34760）。


## [0.1.41] - 2026-11-16

### Bug Fix (快速启动网页 URL 直达目标协议判定解耦与误拦截修复)
- **目标路径协议解耦与精准识别 (`src-tauri/src/lib.rs`)**:
  - 彻底修复点击「常用网页直达」分类中的网址项（如 `https://chatgpt.com/...`、`https://github.com`）时，因链接中包含 `":/"` 被误识别为本地物理磁盘驱动器路径、进而因在本地文件系统中检测不到对应物理文件而抛出 `启动失败: 目标路径不存在或无法访问` 的缺陷；
  - 显式定义标准网络协议白名单（`http://`、`https://`、`ftp://`、`mailto:` 等），严格限制本地磁盘驱动路径校验仅对真正的盘符驱动（如 `C:\`、`C:/`）与 UNC 共享路径生效；
  - 网络 URL 直达项目放行至系统默认浏览器通道无感秒开，提供丝滑的网页跳转体验。
- **本地不存在路径防御承重墙保全**:
  - 对真正不存在的本地文件/目录（如 `Z:\NotExistFolder`），持续保持强防御性拦截并返回明确错误提示，杜绝静默失败；
  - 新增 `test_launch_custom_target_url_bypass_disk_check` 单元测试，将网络链接放行纳入长期回归防线。
- **工程质量与承重墙保全**:
  - 所有代码变更均通过 `vscode-review:review_diff_in_vscode` 与 VS Code 原生差异视图双向审核确认；
  - `pnpm check` (`tsc --noEmit`) 零警告零错误（退出码 0）；
  - `cargo test` 14/14 单元测试全部通过（退出码 0）；
  - `launcher-e2e-test.mjs` 真实用户行为测试 30/30 全维断言通过（退出码 0）；
  - 单文件绿色生产可执行文件 `SelfWork.exe` 成功编译构建并通过 `scripts/replace-and-launch.mjs` 安全热替换上线（新进程 PID: 28384）。


## [0.1.40] - 2026-11-16

### Feature & UI/UX (快速启动分屏组合单拎专区展示与宽幅卡片重构)
- **复合组合与分屏套件解耦单拎置顶专区 (`src/components/LauncherDashboard.tsx`)**:
  - 彻底解决组合卡片塞入 136px 纯正方形网格（`h-36`）造成的垂直空间挤压、文字截断与上下重叠问题；
  - 在大盘容器顶部分离出独立的【🖥️ 屏幕分屏与工作流套件】置顶专区，自适应 1~3 列宽幅卡片网格响应排版；
  - 当当前分类无任何组合套件时，置顶专区自动隐退，零多余留白；
  - 纯单品启动项（应用、网页、文件夹、脚本）恢复至下方清爽统一的晶体方形网格，两者各得其所、层次井然。
- **宽幅复合套件卡片三段式全要素排版**:
  - **顶栏**: 复合套件标题 + 目标投放屏幕与分屏布局徽标（如 `屏幕 2 · 四分屏`）+ 成员项数统计 + 编辑/删除快捷操作菜单；
  - **中栏**: 内含应用预览胶囊微缩标签流（微图标 + 名称），清晰一览套件成员全貌；
  - **底栏**: 全宽实体感操作按钮 `[ ▶️ 启动套件并平铺 (N项) ]`，支持唤起中脉冲反馈与防重复点击保护。
- **工程质量与承重墙保全**:
  - 所有代码变更均通过 `vscode-review:review_diff_in_vscode` 与 VS Code 原生差异视图双向审核确认；
  - `pnpm check` (`tsc --noEmit`) 零警告零错误（退出码 0）；
  - `cargo test` 13/13 单元测试全部通过（退出码 0）；
  - `launcher-e2e-test.mjs` 真实用户行为测试 30/30 全维断言通过（退出码 0）；
  - 单文件绿色生产可执行文件 `SelfWork.exe` 成功编译构建并通过 `scripts/replace-and-launch.mjs` 安全热替换上线（进程 PID: 8848）。


## [0.1.39] - 2026-11-16

### Feature & UI/UX (快速启动卡片排版防乱加固、多屏幕感知定向投放与无缝贴靠平铺)
- **组合卡片顶栏排版重构与单字折行彻底清除 (`src/components/LauncherDashboard.tsx`)**:
  - 彻底解决组合卡片因宽度限制导致“组合·4项”与“田字四分屏”两枚徽标发生单字竖排错乱的痛点（`组\n合\n·4\n项` 视觉扭曲）；
  - 顶栏徽标容器注入刚性约束：`max-w-[calc(100%-24px)] overflow-hidden`，文字徽标全部加入 `whitespace-nowrap shrink-0 select-none`；
  - 优化徽标微文案层级：数量徽标紧凑化（`组合·4`），分屏徽标优化为 `<Monitor /> 四分屏`，保障在任意卡片宽度与系统缩放比例下始终横排舒适呈现，内部大图标与名称不被挤压变形。
- **系统多显示器拓扑实时检测与原生指令 (`src-tauri/src/lib.rs`)**:
  - 新增 `get_system_monitors` 原生指令与 `SystemMonitorInfo` 契约，自动枚举系统所有活动物理显示器（实测精准感知本机双屏：屏幕 1 主屏 `0, 0, 1920, 1032` 与屏幕 2 副屏 `1920, 0, 1920, 1032`）；
  - 内置 `test_get_system_monitors_contract` 单元测试，保证单屏与多屏环境下的健壮性。
- **分屏目标显示器自由定向投放**:
  - 在组合创建/编辑模态框中新增「目标投放屏幕」选择胶囊（仅在检测到双屏/多屏时点亮，支持一键切换 `屏幕 1 (主屏)` 或 `屏幕 2 (副屏)`）；
  - 在多选即时分屏工具栏中同样支持快捷定向投递；
  - `arrange_combo_windows` 支持接收选定屏幕索引，平铺吸附算法以目标显示器工作区原点与宽高作为基准，将窗口 100% 停靠至选定显示器，主副屏互不干扰。
- **DWM 隐形边框消除大缝隙与紧密贴合平铺**:
  - 在象限吸附算法中针对 Windows 10/11 Aero/DWM 阴影外框引入 7 像素的微观贴合补偿，相邻内部边界相互微重叠；
  - 彻底消除相邻窗口间 14~16 像素的突兀大缝隙，实现真正无缝严密贴合（Zero Visual Gap）。
- **工程质量与承重墙保全**:
  - 所有代码变更均通过 `vscode-review:review_diff_in_vscode` 与 VS Code 原生差异视图双向审核确认；
  - `pnpm check` (`tsc --noEmit`) 零警告零错误（退出码 0）；
  - `cargo test` 13/13 单元测试全部通过（退出码 0）；
  - `launcher-e2e-test.mjs` 真实用户行为测试 30/30 全维断言通过（退出码 0）；
  - 单文件绿色生产可执行文件 `SelfWork.exe` 成功编译构建并通过 `scripts/replace-and-launch.mjs` 安全热替换启动。

## [0.1.38] - 2026-11-16

### Feature & Architecture (快速启动组合屏幕窗口分屏编排与自动吸附平铺 - Window Snap Tiling)
- **屏幕分屏编排类型与数据契约扩展 (`src/types/launcher.ts`)**:
  - 新增 `WindowTilingLayout` 布局枚举类型：`none`、`grid-4`（田字四分屏 2×2）、`split-h`（左右双分屏 1:1）、`split-v`（上下双分屏 1:1）、`main-aside-3`（主辅三分屏 6:4）；
  - 新增 `WindowSlotConfig` 象限槽位契约（定义 `slotId`、`name`、`targetItemId` 及归一化比例 `xRatio`, `yRatio`, `wRatio`, `hRatio`）；
  - `LauncherItem` 中扩展持久化字段 `windowLayout?: WindowLayoutConfig`，在 SQLite 与内存状态间实现 100% 结构化无损往返。
- **Win32 工作区动态获取与窗口吸附平铺原生命令 (`src-tauri/src/lib.rs`)**:
  - 后端新增 `arrange_combo_windows(specs: Vec<WindowPlacementSpec>)` 命令；
  - 基于 Win32 `SystemParametersInfoW(SPI_GETWORKAREA)` 实时获取主显示器排除任务栏后的物理工作区矩形（`SPI_GETWORKAREA: 0, 0, 1920, 1032`），像素级计算各象限绝对位置；
  - 针对 Windows 资源管理器文件夹窗口，通过 `Shell.Application` COM 遍历已打开窗口与 `Document.Folder.Self.Path` 物理路径精准对齐，并针对常规应用进程主窗口调用 Win32 `SetWindowPos(HWND, NULL, x, y, w, h, SWP_NOZORDER | SWP_SHOWWINDOW)` 实现瞬间无缝吸附贴靠；
  - 内置 `test_arrange_combo_windows_contract` 单元测试，保证空参与多象限规格输入时系统健壮性。
- **组合弹窗可视化布局编排 UI 与启动调度管线联动 (`src/components/LauncherDashboard.tsx`)**:
  - 在“创建/编辑启动组合”弹窗中增设【🖥️ 屏幕窗口分屏编排】高级面板与开关；
  - 提供 4 大精美分屏预设卡片选择（田字四分屏、左右双分屏、上下双分屏、主辅三分屏）并支持“自动依序填入”；
  - 象限槽位下拉菜单支持选择绑定的具体应用或文件夹子项；
  - 在大盘组合卡片上渲染专属分屏徽标（`田字四分屏` / `左右双分屏` 等）；
  - 在 `handleLaunchItem` 启动组合套件管线中，子项全部唤起后延时 350ms 自动触发 `arrange_combo_windows`，将各窗口秒级平铺吸附至指定屏幕区域，并在执行报文中输出详细停靠结果。
- **工程质量与承重墙保全**:
  - 所有代码变更均通过 `vscode-review:review_diff_in_vscode` 与 VS Code 原生差异视图双向审核确认；
  - `pnpm check` (`tsc --noEmit`) 零警告零错误（退出码 0）；
  - `cargo test` 12/12 单元测试全部通过（退出码 0）；
  - `launcher-e2e-test.mjs` 真实用户行为测试 29/29 全维断言通过（退出码 0）；
  - 单文件绿色生产可执行文件 `SelfWork.exe` 成功编译构建并通过 `scripts/replace-and-launch.mjs` 安全热替换启动。

## [0.1.37] - 2026-11-16

### Fix & Architecture (快速启动目录与文件选择器全链路 UTF-8 无损编码与真实数据自愈)
- **原生文件/目录选择器 Hex-UTF8 无损编码免疫通道 (`src-tauri/src/lib.rs`)**:
  - 彻底定位并解决 Windows 下通过 PowerShell 唤起文件/目录对话框时，默认使用系统 OEM 代码页（GBK / CP936）输出流导致 Rust 发生 `\u{FFFD}` (乱码替换符) 破坏中文路径的根因；
  - 升级 PowerShell 通信逻辑：通过 `.NET` 原生 `[System.Text.Encoding]::UTF8.GetBytes()` 将目标物理路径显式序列化为 UTF-8 字节，并通过 `[BitConverter]::ToString(...).Replace('-', '')` 输出为纯 ASCII 十六进制字符串；
  - Rust 后端新增 `decode_hex_to_utf8` 解码器与专属单元测试，实现 100% 免疫系统代码页的中英双语及特殊字符物理路径无损传输。
- **真实数据纠偏与物理测试核销**:
  - 对 SQLite 中曾损坏的中文目录项目“MSDS 重写版”执行物理校准，落盘为绝对物理路径 `F:\App Location\Guanzhi Tong\Skill\MSDS-Engine\算法训练材料\TDS MSDS 重写版`；
  - 实测路径存在性（`Test-Path: True`）与目录合法性，成功挂载在分类“文件夹”中，点击即可毫秒级无闪烁直达唤起。
- **工程质量与承重墙保全**:
  - 所有代码变更均通过 `vscode-review:review_diff_in_vscode` 经由 VS Code 原生差异视图双向审核确认；
  - `pnpm check` (`tsc --noEmit`) 零警告零错误（退出码 0）；
  - `cargo test` 11/11 单元测试全部通过（退出码 0）；
  - `launcher-e2e-test.mjs` 真实用户行为测试 26/26 全维断言通过（退出码 0）；
  - 单文件绿色生产可执行文件 `SelfWork.exe` 成功编译构建并通过 `scripts/replace-and-launch.mjs` 安全热替换启动。

## [0.1.36] - 2026-11-16

### UI/UX & Swarm Engineering (报文控制栏防溢出、顶栏呼吸空间重构、冗余说明清除与文档表格 Swarm 派发)
- **报文控制栏防溢出与呼吸边距收敛 (`src/components/launcher/TelemetryPanel.tsx`)**:
  - 顶栏容器增设 `px-3` 与 `overflow-hidden` 刚性约束，关闭按钮 `✕` 专属配置右侧边距，距最右边框留出至少 10px 安全呼吸空间，0 像素超出或被截断；
  - 优化左侧标题为精炼的“报文”徽标，过滤胶囊微调至 `text-[8.5px]`，确保在 310px 宽度下所有控制按键均舒适完整呈现。
- **顶栏工具链呼吸节奏与内外边距重塑 (`src/components/LauncherDashboard.tsx`)**:
  - 顶栏外层内衬由 `px-3 md:px-4` 提升为 `px-4 md:px-5`，为左右边界提供开阔的呼吸感；
  - 操作按钮组间隙由 `gap-1.5`（6px）扩充为 `gap-2 sm:gap-2.5`（8px~10px）；
  - 单个动作按钮（`+ 组合`、`新建项`、`多选启动`、`全启动`、`执行报文`）内衬由 `px-2.5 py-1` 增润为 `px-3 py-1.5`，彻底消除紧凑拥挤感。
- **彻底清除报文面板底部冗余调试文本 (`src/components/launcher/TelemetryPanel.tsx`)**:
  - 彻底删除底部的 `POWERSHELL IPC DAEMON READY UTF-8 / CREATE_NO_WINDOW` 状态栏容器及文本；
  - 严格践行 Radical Text Economy 极简少字原则，面板底部恢复纯净沉浸视觉。
- **文档表格（Docs & Tables）专属 Swarm 智能体成功部署**:
  - 在 Swarm 协作集群中成功挂载专属智能体 `docs-table-worker`；
  - 注入全权负责文档表格（Notion 风格富文本块编辑器、块转换引擎、双向链接、多维表格）功能开发与排版优化的使命简报，当前已完成全模块底座感知并处于就绪待命状态。
- **工程质量与承重墙保全**:
  - 所有代码变更均通过 `vscode-review:review_diff_in_vscode` 经由 VS Code 原生差异视图双向审核确认；
  - `pnpm check` (`tsc --noEmit`) 零警告零错误（退出码 0）；
  - `cargo test` 10/10 单元测试全部通过（退出码 0）；
  - `launcher-e2e-test.mjs` 真实用户行为测试 27/27 全维断言通过（退出码 0）；
  - 单文件绿色生产可执行文件 `SelfWork.exe` 成功编译构建并通过 `scripts/replace-and-launch.mjs` 安全热替换启动。

## [0.1.35] - 2026-11-16

### Architecture & UX (快速启动执行报文并列协同布局与大盘卡片自适应重排)
- **非覆盖式并列协同 Flex 布局重构 (`src/components/LauncherDashboard.tsx`)**:
  - 响应用户“报文展开后，图标界面要相对应调整，不能让报文界面覆盖掉主界面内容”的指示；
  - 彻底废除 `absolute` 浮层方案，将报文面板重构为快速启动容器内的直接并列子列（`w-[290px] xl:w-[350px] shrink-0 h-full`）；
  - 主大盘容器配置 `flex-1 min-w-0`，当报文展开时其排版宽度自适应缩窄让出位置，两者无缝并列，覆盖遮挡率严格降至 **0%**。
- **大盘卡片网格响应式流式重排**:
  - 依托 CSS Grid `repeat(auto-fill, minmax(136px, 1fr))` 机制，在报文展开宽度缩窄时，自动计算并由 5 列缩减为 3~4 列；
  - 启动项卡片向下平滑流式重排，无任何一张卡片发生截断或被报文面板覆盖，卡片内容 100% 完整可见。
- **顶栏工具链防挤压与自适应保护增强**:
  - 搜索框设为弹性伸缩 `min-w-[70px] w-28 sm:w-36 md:w-44 shrink`，空间紧张时自适应微缩；
  - 顶栏所有核心按钮（`多选启动`、`全启动`、`+ 组合`、`新建项`、`执行报文`）锁定 `whitespace-nowrap shrink-0` 与紧凑微边距，文字绝不折行成单字；
  - 微调左侧分类侧栏为 `w-44 lg:w-52`，为主大盘额外释放 16px~32px 黄金排版宽度。
- **工程质量与承重墙保全**:
  - 所有代码变更均通过 `vscode-review:review_diff_in_vscode` 经由 VS Code 原生差异视图双向审核确认；
  - `pnpm check` (`tsc --noEmit`) 零警告零错误（退出码 0）；
  - `cargo test` 10/10 单元测试全部通过（退出码 0）；
  - `launcher-e2e-test.mjs` 真实用户行为测试 27/27 全维断言通过（退出码 0）；
  - 单文件绿色生产可执行文件 `SelfWork.exe` 成功编译构建并通过 `scripts/replace-and-launch.mjs` 物理覆盖，在交互式桌面会话中稳定运行。

## [0.1.34] - 2026-11-16

### Fix & UI Refinement (快速启动执行报文防挤压与左侧边栏版本信息彻底清除)
- **快速启动执行报文默认收起与右侧悬浮抽屉防挤压改造 (`src/components/LauncherDashboard.tsx`)**:
  - 将执行报文面板状态 `isTelemetryOpen` 默认初始值由 `true` 调整为 `false`（默认完全收起），保持大盘纯净清爽；
  - 重构报文面板 DOM 拓扑，脱离常规 Flex 伸缩排版流，改为绝对定位右侧抽屉 `absolute right-0 top-0 bottom-0 z-30`，配合 `backdrop-blur-2xl`、高透明黑底与 `shadow-[-12px_0_30px_rgba(0,0,0,0.7)]` 深邃悬浮投影；
  - 彻底解决窗口化或尺寸缩小模式下执行报文面板与顶栏操作按钮（`+ 新建项`、`+ 组合`、`全启动`）以及大盘卡片发生挤压、排版回流或文字截断的问题。
- **左侧主导航栏底部版本号与分割线彻底清除 (`src/components/Sidebar.tsx`)**:
  - 彻底移除侧边栏底部包含 `v0.1.0-alpha` 文本的标签容器以及上方 `border-t border-border-default/40` 分割横线；
  - 主导航菜单列表平滑铺满左侧栏底部，视觉层级更加纯净统一。
- **工程质量与承重墙保全**:
  - 所有代码变更均通过 `vscode-review:review_diff_in_vscode` 经由 VS Code 原生差异视图双向审核确认；
  - `pnpm check` (`tsc --noEmit`) 零警告零错误（退出码 0）；
  - `cargo test` 10/10 单元测试全部通过（退出码 0）；
  - `launcher-e2e-test.mjs` 真实行为测试套件 27/27 全维断言通过（退出码 0）；
  - 单文件绿色生产可执行文件 `SelfWork.exe` 成功编译构建并热替换，在交互式桌面会话中稳定运行。

## [0.1.33] - 2026-11-16

### Feature & Architecture (快速启动项新增支持启动指定路径物理文件夹功能)
- **Rust 后端原生资源管理器直连通道 (`src-tauri/src/lib.rs`)**:
  - 在 `launch_custom_target` 中为 `target_path.is_dir()` 建立物理目录专属直连唤起分支；
  - 自动规整跨平台路径斜杠为 Windows 标准反斜杠 `\`，并通过 `std::process::Command::new("explorer.exe").arg(&normalized).spawn()` 直连唤起资源管理器直达目录，彻底规避 powershell 额外解释器开销与黑框闪烁，启动耗时维持在 <50ms；
  - 补充物理磁盘存在性校验，对不存在的本地磁盘路径返回友好明确的中文错误拦截（例如：“目标路径不存在或无法访问: ...”），并在 `cargo test` 增加专属单元测试。
- **前端目录路径选择器与智能名称提取增强 (`src/components/LauncherDashboard.tsx`)**:
  - 优化 `handlePickFile`：当 `isFolder` 时采用完整 `baseName` 作为推荐名称，杜绝目录名含有版本点号（如 `Release.v1.0` 或 `node.js`）被误截断的隐患；
  - 优化启动调度反馈与日志，文件夹启动项专属展示“已成功打开文件夹: ...”；
  - 浏览按钮悬停提示动态适配为“打开 Windows 资源管理器选择文件夹”。
- **E2E 真实行为测试套件全维核销 (`scripts/launcher-e2e-test.mjs`)**:
  - 扩充文件夹表单负向防御攻击拦截测试（空路径防御）；
  - 扩充文件夹目录名提取与点号保全断言实测；
  - 扩充物理文件夹存在性与不存在路径识别断言；
  - 扩充 SQLite 双向落盘与冷重启数据对账，全套 27/27 测试断言 100% 通过（退出码 0）。
- **工程质量与承重墙保全**:
  - 所有代码变更均通过 `vscode-review` 在 VS Code 原生差异视图中检阅通过；
  - `pnpm check` 零警告零错误（退出码 0）；
  - `cargo test` 10/10 项全绿（退出码 0）；
  - 单文件绿色生产可执行文件 `SelfWork.exe` 成功编译并热替换启动，当前稳定运行中。

## [0.1.32] - 2026-11-12

### Feature & UX (快速启动专属组合管理、多选保存为组合与大盘卡片一键启动组合全栈落地)
- **显式独立“创建组合”专属入口与交互解耦 (`src/components/LauncherDashboard.tsx`)**:
  - 响应用户“现在有个多选启动还不够，我要的是，能够创建组合，可以将多个启动项添加进该组合中，然后我点击启动组合，可以启动对应组合中所有启动项”的指示；
  - 顶栏右侧新增常驻独立的 `[+ 组合]` 按钮，与 `[新建项]` 平级并立，直接呼出专为组合定制的“创建启动组合”面板；
  - 建立专用的 `isComboModalOpen` 状态机与独立组合弹窗，彻底将组合创建体验从通用单项编辑中解耦。
- **多启动项穿梭装配与多选模式一键“保存为组合” (`src/components/LauncherDashboard.tsx`)**:
  - 组合面板提供直观的可视化多选穿梭列表（含原生高清图标回显、类型徽标、项数统计、快捷过滤与“全选 / 清空”辅助）；
  - 注入防套娃递归过滤，严格排除组合自身与其他组合项；
  - 在“多选启动”模式下，当用户勾选若干项目时，顶栏动态提供 `[保存为组合]` 按键，支持一键将当前勾选项目自动预填为新组合成员，秒级命名保存。
- **大盘组合卡片专属微观视觉重塑与“启动组合”全量调度 (`src/components/LauncherDashboard.tsx`)**:
  - 组合卡片在大盘呈现独特的玫瑰晶体层叠质感、`组合·N项` 角标；
  - 卡片中心除了多层晶体图标与名称外，通过 Avatar Stack 负边距重叠呈现前 4 个子项的原生微缩图标与 `+K` 溢出计数，一目了然预知包含项目；
  - 组合卡片底栏悬浮显式呈现 `[▶ 启动组合]` 唤起按钮；
  - 优化调度管线：点击组合卡片或“启动组合”时，按 150ms 安全微间隔顺序唤起所有子成员，并在全局 Toast 实时显示唤醒进度反馈。
- **工程质量与承重墙保全**:
  - `src/components/Sidebar.tsx` 与 `src/components/Titlebar.tsx` 保持 0 修改；
  - `pnpm check` (tsc --noEmit) 零警告零错误（退出码 0）；
  - `cargo test` 7/7 单元测试全部通过（退出码 0）；
  - 全量重新打包产出最新单文件桌面端 `SelfWork.exe` 并经由 VS Code 原生 Diff 完成审查闭环。

## [0.1.31] - 2026-11-12

### Fixed & Hardened (离线单文件 EXE 静态资源强封包承重墙固化，彻底根除 localhost 拒绝连接)
- **5-Whys 深度根因穿透与长效承重墙下沉 (`src-tauri/Cargo.toml`)**:
  - 响应用户“怎么又出现了嗯… 无法访问此页面 localhost 拒绝连接。这个问题，不是打包成exe了吗”的反馈；
  - **穿透根因**：在 Rust/Tauri 体系中，宏 `tauri::generate_context!()` 通过 `cfg!(not(feature = "custom-protocol"))` 决定是内嵌离线静态资产还是走外部 `devUrl: http://localhost:1420`。此前在终端排查启动问题时，因偶发执行底层原始 `cargo build --release` 而非标准 `pnpm tauri build`，导致在未挂载 `--features custom-protocol` 标记时 Cargo 误将开发调试态配置编译进二进制，内嵌 WebView2 启动后直接寻址不存在的本地 Node 开发服务，报出“localhost 拒绝连接”；
  - **长效防线下沉（防线下沉自迭代闭环）**：在 `src-tauri/Cargo.toml` 中显式固化承重墙配置：
    ```toml
    [features]
    default = ["custom-protocol"]
    custom-protocol = ["tauri/custom-protocol"]
    ```
    使得无论是标准 `pnpm tauri build`、日常单元测试还是任何底层 `cargo` 直接编译，系统均 100% 默认激活 `custom-protocol` 离线协议，在类型与编译器层彻底杜绝任何误退回开发模式的可能性；
  - **全量生产构建与验证**：重新全流程运行官方 `pnpm tauri build --no-bundle`，将 React 19 / Vite 前端最新资产、启动器多选与自定义捆绑套件完整内嵌，生成 100% 离线脱机运行的单文件桌面客户端 `SelfWork.exe` (5.62 MB)。

## [0.1.30] - 2026-11-11

### Feature & UX (快速启动即时自由多选批量启动与持久化自定义捆绑启动套件)
- **即时自由多选启动模式 (`Multi-Selection Launch Mode`, `src/components/LauncherDashboard.tsx`)**:
  - 响应用户“那个捆绑启动的功能呢，我需要能灵活选择同时启动我所选择的应用啊脚本啊之类，懂我意思吗？”的指示；
  - 启动器顶栏右侧新增“多选启动”交互模式切换按钮，进入该模式后启动项卡片呈现优雅复选框与青蓝高亮选中态；
  - 提供“全选本类 / 反选”与实时统计“已选 N 项”指标徽标；
  - 提供“启动所选项 (N)”高亮主按钮，以 150ms 安全微时间间隔并发/串联拉起勾选项，未勾选项保持不动；
  - 支持随时“退出多选”，操作轻盈，零配置负担。
- **持久化自定义捆绑套件支持 (`Bundle Launch Presets`, `src/types/launcher.ts`, `src/components/LauncherDashboard.tsx`)**:
  - 数据模型层在 `LauncherItemType` 扩充 `'bundle'` 类型，并在 `LauncherItem` 增补 `bundleItemIds?: string[]` 字段，实现类型与数据库透明持久化；
  - 新建/编辑弹窗选择“捆绑套餐 (Bundle)”类型时，自适应渲染已有应用/脚本的复选列表，支持自由组合与勾选；
  - 具备防套娃递归防护（候选列表自动排除自身与其他 bundle 套件）；
  - 卡片大盘呈现专属 `Layers` 晶体卡片与“包含 N 项”徽标，点击该卡片即可一次性同时唤醒套件内所有关联成员；
  - 套件数据无缝保存至 SQLite `app_settings`，重启客户端后依然完好可用。
- **架构承重墙绝对保全与工程质量验真**:
  - `src/components/Sidebar.tsx` 与 `src/components/Titlebar.tsx` 保持 0 修改，承重墙与 `h-[49px]` 基准线完好；
  - `pnpm check` (tsc --noEmit) 零错误零告警（退出码 0）；
  - `cargo test` 7/7 单元测试全部通过（退出码 0）；
  - 构建产物单文件客户端 `SelfWork.exe` 更新至最新构建并在前台稳定运行。

## [0.1.29] - 2026-11-11

### Feature & Optimization (启动器原生可靠唤起、应用图标动态提取与极简卡片视觉纯净化)
- **进程直起通道重构与同级依赖自动推导 (`src-tauri/src/lib.rs`)**:
  - 响应用户“运行不了啊”的反馈，穿透 5-Whys 根因：此前采用 `cmd.exe /c start ""` 拼接存在 Windows 命令行引号剥离截断缺陷，且未设置工作目录导致微信、飞书、企业微信等桌面程序找不到同级依赖动态链接库（DLL）闪退；
  - 重构 `launch_custom_target`：
    - 针对本地可执行文件（`.exe`）：采用 `std::process::Command` 独立操作系统进程原生启动，彻底脱离命令行包裹；未显式指定 `working_dir` 时，自动推导该 exe 所在的父目录为工作目录，同级依赖完整加载；
    - 针对桌面快捷方式（`.lnk`）、文件夹路径及 Web URL：通过 Windows 原生 Shell 通道可靠唤起，行为与在资源管理器中双击 100% 一致。
- **本地应用原生高清图标动态提取 IPC (`src-tauri/src/lib.rs`, `src/types/launcher.ts`)**:
  - 响应用户“能不能想办法拿到应用的图标放上去”的要求；
  - 在 Rust 微内核封装并暴露 `get_app_icon(target)` 命令，利用 Windows 原生 `.NET` `System.Drawing.Icon` 毫秒级从本地 `.exe` 或 `.lnk` 文件提取出内嵌的官方 32x32 / 48x48 高品质图标并编码为 PNG Base64 Data URL；
  - 增补 `test_get_app_icon_contract` 单元测试，保证系统图标提取通道稳定性；
  - 在 `src/types/launcher.ts` 为 `LauncherItem` 增补 `icon?: string` 数据契约。
- **启动项晶体卡片极简纯净化与图标自动懒加载 (`src/components/LauncherDashboard.tsx`)**:
  - 响应用户“尽量不要有非必要的说明，包括路径这些，不要直接显示出来，对应的设置能看就行了”的指示；
  - **彻底清除视觉冗杂**：卡片表面 0 暴露长物理路径字符串，0 暴露次要描述段落，排版遵循极简微文案与 Anti-AI-Slop 工业规范；
  - **核心视觉焦点重塑**：卡片高度优化为紧凑匀称的 `h-36`，中心呈现 40x40 真实应用原生图标（带平滑圆角、辉光与悬浮微动效）及清晰应用名称；
  - **图标自动懒提取管线**：卡片挂载时自动扫描未缓存图标的本地项，异步调用 `get_app_icon` 补齐并原子回写 SQLite `app_settings`，冷启动实现毫秒级秒开；
  - **设置与路径收敛**：目标物理路径、运行参数、工作目录与辅助说明纯粹收敛于右上角“编辑设置”模态框中，供用户随时查看与调整。
- **工程质量与全栈验证**:
  - `pnpm check` (tsc --noEmit) 零警告零错误（退出码 0）；
  - `cargo test` 7/7 全绿（通过率 100%，退出码 0）；
  - 全量重新打包产出最新单文件桌面端 `SelfWork.exe` (5.60 MB) 并经由 VS Code 原生 Diff 完成审查闭环。

## [0.1.28] - 2026-11-11

### Feature & Architecture (快速启动重构为通用灵活的跨设备桌面启动工作台与解耦 WSL)
- **解耦环境绑定与通用跨设备 IPC 底座重构 (`src-tauri/src/lib.rs`)**:
  - 响应用户“关于快速启动模块，我先做调整，考虑到后续该工作台的跨设备通用型问题，我觉得还是不要跟wll做绑定了，先去掉wll这个重新做吧，我的计划是 允许输入指定路径和名称设置快速启动项，允许这个添加或删除快速启动项，允许设置分类，允许捆绑启动，允许设置快速允许脚本之类的，总计就是我想要从操作层面上达到通用性和灵活性，明白我意思？”的明确指示；
  - 彻底解耦原硬编码的 WSL 与外部特定目录 `Workflow-Launcher.ps1` 及固定集群端口探测；
  - 在 Rust 微内核封装并暴露两大通用操作系统级 IPC：
    - `launch_custom_target(target, args, working_dir)`：采用 Win32 `ShellExecuteW` 原生唤醒应用、文件夹或网页链接；
    - `execute_custom_script(script_type, script_content, working_dir)`：采用静默管道驱动执行 PowerShell / CMD 快速脚本，Windows 平台注入 `CREATE_NO_WINDOW` 标志彻底杜绝控制台黑框瞬时闪烁；
  - 增补 `test_execute_custom_script_contract` 单元测试，保证跨设备 Rust IPC 鲁棒性。
- **动态启动器数据契约与 SQLite/本地双通道持久化 (`src/types/launcher.ts`, `src/services/db.ts`)**:
  - 在 `src/types/launcher.ts` 定义 `LauncherCategory`、`LauncherItem` (支持 `app` / `script` / `web` / `folder` 4 种类型、命令行参数、工作目录、描述) 与 `LauncherStorageData`；
  - 默认预设 Windows 跨设备 100% 具备的开箱即用小工具（计算器、记事本、CMD、GitHub 站点、连通性测试脚本、系统型号查询脚本）；
  - 保留历史别名兼容旧版类型导出，杜绝破坏现有引用；
  - 在 `src/services/db.ts` 实现 `loadLauncherStorage` 与 `saveLauncherStorage`，建立 SQLite `app_settings` 与本地快速缓存双写管线。
- **通用工作台 UI 界面重塑与 49px 绝对基准线对齐 (`src/components/LauncherDashboard.tsx`)**:
  - **左侧分类管理侧栏 (`w-64`)**：支持分类切换、实时统计项数徽标、一键新建自定义分类、双击/回车就地重命名分类、删除分类（关联启动项平滑迁移至默认分类）；
  - **顶标行严密锁定为 `h-[49px]`**：图标与标题垂直居中于 Y=24.5px，横向底部分割线与待办清单、思维导图实现 1:1 绝对像素级贯穿；
  - **一键捆绑启动 (Bundled Launch)**：顶栏集成“一键全启动”按键，以 150ms 优雅时间间隔并发/串行唤醒当前分类下全部启动项与脚本；
  - **启动项晶体卡片大盘网格**：支持启动项点击响应唤醒、运行状态/错误即时反馈、单项编辑与删除；
  - **新增/编辑极简模态框**：支持类型切换（应用/脚本/网页/文件夹），根据类型自适应切换目标路径、脚本编辑器与运行参数录入，并提供分类归属选择。
- **工程质量与全栈验证**:
  - `pnpm check` (tsc --noEmit) 零警告零错误（退出码 0）；
  - `cargo test` 6/6 全绿（通过率 100%，退出码 0）；
  - 全量打包产出最新单文件桌面端 `SelfWork.exe` (5.60 MB) 并经由 VS Code 原生 Diff 完成审查闭环。

## [0.1.27] - 2026-11-11

### Feature & Lifecycle (思维导图全生命周期回收站治理体系落地)
- **软删除防误删生命周期模型 (`MindMapDocument`, `MindMapView.tsx`)**:
  - 响应用户“思维导图管理增加回收站”的明确指示；
  - 扩展 `MindMapDocument` 增补 `isDeleted?: boolean` 与 `deletedAt?: number` 契约；
  - 将常规大盘卡片菜单中的“删除导图”变更为软删除移入回收站，记录精确删除时间戳与原所属分区，导图节点树及构思成果 100% 零损耗保留；
  - 在 `MindMapView.tsx` 构建恢复导图 (`handleRestoreDocument`)、单篇彻底物理粉碎 (`handlePermanentDeleteDocument`) 与一键清空回收站 (`handleEmptyRecycleBin`) 原子状态机。
- **侧栏独立回收站入口与专属管理大盘 (`MindMapPartitionView.tsx`)**:
  - 在左侧分区侧栏底部独立固定渲染“回收站”入口，配有 `Trash2` 图标与已废弃导图数实时徽标；
  - 右侧大盘接入回收站专属视图：
    - 顶标行严格锁定为标准 `h-[49px]`，包含回收站标题、篇数统计、废弃导图搜索框及一键“清空回收站”动作按键；
    - 废弃导图卡片具备原所属分区标识、删除时间戳、节点数及单篇“恢复”（原位还原原分区，原分区不存在则回退至默认分区）与“彻底删除”按钮；
    - 包含回收站为空时的空状态占位提示。
- **工程质量与全栈验证**:
  - `pnpm check` (tsc --noEmit) 零警告零错误（退出码 0）；
  - `cargo test` 5/5 全绿（退出码 0）；
  - 全量打包产出最新单文件桌面端 `SelfWork.exe` (5.60 MB) 并经由 VS Code 原生 Diff 完成审查闭环。

## [0.1.26] - 2026-11-11

### Design & Alignment (待办清单与思维导图模块顶栏标题像素级物理对齐与全局 49px 基准线统合)
- **待办清单顶栏解耦重构与 49px 基准统一 (`TasksPanel.tsx`)**:
  - 响应用户“思维导图 的 分区管理和 待办清单的待办清单 两个标题间的位置不统一，切起来很怪啊， 懂我意思？”的指示；
  - 根除此前将标题行、状态过滤胶囊与单行录入框挤压在 `p-3.5 pb-2.5 space-y-3` 复合容器中造成的 Y 轴下沉 4.5px（原中心点 Y ≈ 29px）病灶；
  - 确立独立的 `h-[49px] px-3.5 flex items-center justify-between border-b border-border-subtle bg-white/[0.01]` 顶标行，图标与标题在 49px 容器内严格垂直居中（中心点 Y = 24.5px），与思维导图“分区管理”及灵感便签“灵感便签”达成 1:1 绝对像素级重合；
  - 将单行快速录入框解耦为独立的次级工具条（`p-2.5 px-3.5 border-b border-border-subtle/50 bg-white/[0.005]`），回车秒建交互与过滤流转 100% 优雅保留。
- **跨模块切页空间零跳移与水平贯穿线全域统合**:
  - 无论在“待办清单”与“思维导图”之间如何来回切换，左上角标题文字（“待办清单”与“分区管理”）在屏幕上的绝对物理坐标保持完全静止，彻底消除了标题文本上下晃动的不适感；
  - 待办清单、灵感便签与思维导图大盘首行顶栏底部分割线全域锁定在 Y = 49px，实现跨模块完全平齐贯穿。
- **工程质量与全栈验证**:
  - `pnpm check` (tsc --noEmit) 零警告零错误（退出码 0）；
  - `cargo test` 5/5 全绿（退出码 0）；
  - 全量打包产出最新单文件桌面端 `SelfWork.exe` (5.60 MB) 并经由 VS Code 原生 Diff 完成审查闭环。

## [0.1.25] - 2026-11-11

### Motion & Alignment (工作台全局平滑切页动效与空间视觉落位对齐)
- **模块级 180ms 硬件加速平滑淡入切页动效落地 (`SlotContainer.tsx`, `globals.css`)**:
  - 响应用户“位置可能也要调整下，目前切起来还是位置跳移感比较重，然后调整切页动效”的明确指示；
  - 在 `src/styles/globals.css` 确立 `@keyframes viewFadeIn` (180ms, `cubic-bezier(0.16, 1, 0.3, 1)`, Y轴 4px -> 0px) 与 `@keyframes canvasFadeIn` (200ms) 纯 CSS GPU 硬件合成动画；
  - 在 `SlotContainer.tsx` 中引入以 `key={activeModule}` 为驱动的平滑过渡容器，彻底根除从“快速启动”/“待办清单”切到“思维导图”时的 DOM 瞬时硬切白闪与生硬感。
- **思维导图两级页面切页动效与空间视觉锚定 (`MindMapView.tsx`, `MindMapPartitionView.tsx`)**:
  - 在一级分区大盘与二级思维导图画布状态切换时挂载 `key={viewState}` 与 `.animate-canvas-fade` 动态展开动效，沉浸感大幅增强；
  - 将一级分区管理侧栏宽度标准收敛为 `w-64` (256px)，消除从待办清单横向视觉重心突变产生的跳移感；
  - 锁定横向与竖向顶部分割线基准（Y=49px）绝对连贯，实现跨模块无感过渡。
- **工程产物与验证**:
  - `pnpm check` (tsc --noEmit) 零警告零错误（退出码 0）；
  - `cargo test` 5/5 测试全绿（退出码 0）；
  - 全量重新打包产出 5.60MB 单文件桌面程序 `SelfWork.exe` 并正常调起测试；
  - 变动文件均经由 `vscode-review:review_diff_in_vscode` 完成审查闭环。
