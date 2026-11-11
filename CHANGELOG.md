# Changelog - SelfWork (SW工作台)

All notable changes and architectural invariants for SelfWork will be documented in this file.

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

## [0.1.24] - 2026-11-11

### Design & Alignment (全局字体字号分类规范落地与跨模块布局基准线条严密对齐)
- **全局 5 级字阶分类规范体系落地 (Typography Hierarchy Design Tokens)**:
  - 响应用户“全局的字体字号要做统一一些，做些分类，比如模块标题啊模块内容啊之类的分别要用什么字体字号”的指示；
  - 确立并全量收敛 5 级字阶标准：
    - **L1 顶栏主标题**：统一为 `text-xs font-semibold text-fg-primary tracking-tight` (12px / 600)；
    - **L2 统计徽标**：统一为 `text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-white/[0.06] text-fg-muted border border-white/[0.06]` (10px 等宽胶囊底)；
    - **L3 分类与标签**：统一为 `text-xs font-medium` (12px / 500)；
    - **L4 内容卡片标题**：统一为 `text-xs font-medium text-slate-200 truncate` (12px / 500 / 截断防溢)；
    - **L5 辅助微文案**：统一为 `text-[10px] text-slate-500 font-mono` (10px 弱对比用于时间戳与节点数)；
  - 彻底清理思维导图原先私自使用的放大字号（`text-base` 16px、`text-sm` 14px），与待办清单完全对齐。
- **思维导图顶栏线条与栏目间高低差彻底抹平 (`MindMapPartitionView.tsx`)**:
  - 响应用户“思维导图分区管理的栏目与栏目间的线条要对齐，这种线条问题之前有在其他地方强调过”的明确要求；
  - 严格将左侧分区顶栏与右侧导图顶栏的高度均锁定为固定的 `h-[49px]`，保证横向分割线（`border-b border-white/[0.08]`）在水平整屏以 Y=49px 零落差连贯贯穿；
  - 竖向分界线（`border-r`）与横向顶线（`border-b`）在交叉处实现严格垂直十字交汇，根除错位高低差与多重阴影线头。
- **跨模块切换平滑过渡与呼吸间距对齐**:
  - 消除从待办清单切到思维导图的突兀感：大盘卡片网格从过宽的 `px-8` 收敛至与任务面板一致的 `p-4 gap-4` 紧凑节奏；
  - 二级画布悬浮返回药丸内嵌至 `top-3.5 left-3.5` 标准网格，文字样式统合为 L1/L5 字阶标准。
- **工程产物交付**:
  - `pnpm check` 零警告零错误退出码 0；
  - `cargo test` 5/5 测试全绿退出码 0；
  - 全量重新打包产出 5.35MB 单文件桌面程序 `SelfWork.exe` 并正常运行测试。

## [0.1.23] - 2026-11-11

### Style & Refactor (思维导图背景颜色与工作台全局暗色晶体风格统一对齐)
- **根除思维导图实心底色，全景融入工作台晶体画板**:
  - 响应用户“背景颜色有点不对，要不统一一下？，与主导航和其他页面有点不一致啊”的反馈；
  - 穿透定位根因：此前思维导图硬编码实底 `bg-slate-950` 与 `bg-slate-900`，如死黑板遮挡了工作台主画板（`SlotContainer.tsx`）的 `rgba(12, 16, 26, opacity)` 半透明毛玻璃底与漂移折射流光（`animate-fluid`）；
  - 全面改造根容器为 `bg-transparent`，让工作台统领的主画板毛玻璃背景与底层流光自然透出，达成视觉风格 100% 浑然一体。
- **一级页面分区与网格质感对齐 (`MindMapPartitionView.tsx`)**:
  - 左侧分区管理侧栏改为 `bg-black/20 border-white/[0.08] backdrop-blur-md`；
  - 顶部搜索栏与工具栏采用 `bg-black/10 border-white/[0.08]`；
  - “+ 新建导图”卡片采用 `border-white/15 hover:border-cyan-500/50 bg-white/[0.02] hover:bg-cyan-500/[0.06]`；
  - 导图卡片网格采用与任务卡片一致的 `border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] hover:border-cyan-500/40` 晶体通透卡片。
- **二级画布与悬浮药丸视觉对齐 (`MindMapView.tsx`)**:
  - 二级画布视口移除 `bg-slate-950` 实心底，透出主画板背景；
  - 左上角 `[ ← 返回分区 ]` 悬浮药丸采用与左下角快捷键状态条完全相同的材质规范：`bg-black/45 backdrop-blur-md border border-white/[0.08] shadow-lg`，消除材质与高光反差。
- **工程产物交付**:
  - `pnpm check` 零警告零错误退出码 0；
  - `cargo test` 5/5 测试全绿退出码 0；
  - 全量重新打包产出 5.35MB 单文件桌面程序 `SelfWork.exe` 并正常运行测试。

## [0.1.22] - 2026-11-11

### Added (SW工作台思维导图一级分区大盘与二级沉浸画布双级架构改造)
- **两级页面解耦架构落地 (Level-1 & Level-2 Hierarchical Architecture)**:
  - 响应用户“SW工作台 思维导图模块我需要把 当前的页面作为一级页面，用于思维导图的分区管理,用以创建和管理思维导图，然后通过这个一级页面点击对应思维导图进入二级页面后才是思维导图画布”的指示；
  - 建立“一级管理大盘”与“二级编辑画布”两级解耦状态机模型，彻底摆脱单一就地画布的局限性。
- **一级页面分区与导图管理大盘 (`src/components/mindmap/MindMapPartitionView.tsx`)**:
  - **左侧分区管理侧栏**：支持系统默认分区（不可删除），支持一键新建自定义分区、原地重命名分区与删除分区（关联导图安全平滑回退至默认分区），并显示实时导图统计角标；
  - **右侧导图网格大盘**：
    - 首卡固定为 `[ + 新建导图 ]`，具备青蓝微光高亮交互，点击立即创建初始导图并自动过渡进入二级画布；
    - 后续卡片展示该分区下思维导图列表，包含微缩节点结构示意、导图标题、最后更新时间（相对时间与精确日期）、节点总数统计徽标；
    - 顶部实时搜索过滤栏，支持按标题快速检索导图；
    - 卡片右侧快捷操作菜单：支持“重命名导图”、“移动至其他分区”、“删除导图”。
- **二级页面沉浸式编辑与雅致导航 (`src/components/MindMapView.tsx`)**:
  - 左上角悬浮极简暗色毛玻璃导航药丸：提供 `[ ← 返回分区 ]` 按钮及 `分区名 / 导图标题` 路径面包屑；
  - 点击返回分区大盘时，自动刷新并持久化最后修改时间戳，平滑退回一级页面；
  - 100% 保持原有全键盘流畅手感：`Tab`（子分支）、`Enter`（同级分支）、`Delete`（删除）、`Space`/`F2`（就地编辑）完全可用。
- **数据模型多分区多导图持久化与零损耗自动迁移 (`src/types/mindmap.ts` & `src/services/db.ts`)**:
  - 新增 `MindMapPartition`、`MindMapDocument`、`MindMapStorageData` 规范数据模型；
  - 拓展 SQLite `app_settings` 通道 (`sw_mindmap_storage_v2`) 与本地快速缓存；
  - 内置旧版单一导图自动迁移机制：初次启动自动将历史单图无损升级为默认分区下的导图文档。
- **承重墙绝对保全承诺 (Invariants Kept)**:
  - 工作台全局左侧主导航栏（`Sidebar.tsx`）100% 保持原样，呼吸流光条与尺寸样式零篡改；
  - 系统深色无边框标题栏（`Titlebar.tsx`）保持原样；
  - 待办清单与灵感便签模块完全保持现状。
- **遇到的问题与解法 (Problem & Resolution)**:
  - *问题 1*：TypeScript strict 模式下检测到 `MindMapPartitionView.tsx` 中 `DEFAULT_PARTITION_ID` 与 `MindMapView.tsx` 中 `useRef` 未使用报错。
    - *解法*：恪守“纠错两遍即立项为 Lint / 零警告零错误原则”，立即清理无用导入，通过 `pnpm check` 达到 0 错误 0 告警。
  - *问题 2*：构建或移动桌面二进制时遭遇正在运行的 `SelfWork.exe` 进程文件占用锁。
    - *解法*：构建前显式检测并安全结束驻留进程，构建完成后成功覆盖产出 5.35MB 纯净单文件桌面二进制 `SelfWork.exe`。

## [0.1.21] - 2026-11-11

### Refactored (思维导图顶部功能按键彻底剔除、纵向满屏沉浸画布与纯键盘流转落地)
- **思维导图顶部功能按键彻底剥离 (`src/components/MindMapView.tsx`)**:
  - 响应用户“上面这些功能按键先不要，子分支和同级分支、删除这些我在导图内用快捷键就行了，用不到按钮”的明确指令；
  - 彻底移除顶部左侧编辑按钮组（`[子分支]`、`[同级分支]`、`[删除]`）与右侧功能按钮组（`[居中]`、`[导入]`、`[导出]`），彻底杜绝视觉冗余与按钮点击干扰。
- **Zen Mode 沉浸画布视口纯净化**:
  - 卸载顶部 44px 工具条占位，解除高度限制，使 `MindMapCanvas` 纵向顶格 100% 满屏展开，极大拓展脑图构思视野；
  - 左下角极简快捷键状态条（Tab 子分支、Enter 同级分支、Delete 删除、双击/空格 改名）常驻清晰，提供纯净的键盘操作指引。
- **全键盘快捷键流转 100% 无损保全**:
  - 选中节点 Tab 极速派生子分支并就地编辑；
  - 选中非根节点 Enter 插入同级分支并就地编辑；
  - Delete / Backspace 快速修剪分支并平滑回退焦点；
  - 严格保持 300ms 防抖 SQLite 自动落盘与冷启动持久化恢复能力。
- **工程产物交付**:
  - `pnpm check` (`tsc --noEmit`) 零警告零错误退出码 0；
  - `cargo test` 5/5 底层测试全绿退出码 0；
  - `pnpm tauri build --no-bundle` 全量 Release 编译通过；
  - 同步更新根目录单文件可执行程序 `SelfWork.exe`。

## [0.1.20] - 2026-11-11

### Fixed (100% 物理回滚并保全侧边栏导航栏既有样式与流光呼吸指示柱)
- **侧边栏导航栏既有样式 100% 物理回滚与防篡改对齐 (`src/components/Sidebar.tsx`)**:
  - 穿透 5-Whys 根因：在挂载 `mindmap` 模块时发生误操作，重构覆盖了既有 JSX 结构，意外移除了侧边栏流光呼吸高亮条（`bg-gradient-to-b from-sky-400 via-cyan-300 to-indigo-400`）、折叠控制按钮微调尺寸、`font-mono` 微调字号及底部 `v0.1.0-alpha` 状态标识，并混入了多行 `shortDesc` 副标题；
  - 严格根据《既有逻辑与业务规范不可否定公理 (防自以为是重构禁令)》执行物理回滚：100% 还原既有 HTML/CSS 类名、动画与布局结构，仅最小化挂载 `{ id: 'mindmap', name: '思维导图', ... }` 节点数据与 `GitFork` 图标分支；
  - `git diff HEAD~1 src/components/Sidebar.tsx` 显示仅 3 行必要增量，零视觉降级、零样式篡改、零越界改动。

### Added (手脚层 REA 逆向 Xmind 工业实践与思维导图基础编辑模块落地)
- **手脚层 REA 逆向 Xmind.exe 事实凭据沉淀 (REA Reverse Engineering Evidence)**:
  - 穿透本地 Xmind 核心包（`app.asar`），提取标准脑图树形模型（`centralTopic` 中心主题、`mainTopic` 主分支、`subTopic` 子分支、`id`/`title`/`children` 节点拓扑）与三次贝塞尔圆角连接线几何规范（`org.xmind.branchConnection.roundedElbow`）；
  - 提炼出标准树形 JSON 与缩进式 Markdown 大纲的通用输入/输出序列化格式。
- **思维导图基础树形画布与三次贝塞尔连线渲染 (`MindMapCanvas.tsx` & `layout.ts`)**:
  - 实现基于递归子树边界测量的右向树形自适应排版算法，确保各级节点水平向右延展且垂直方向严格无重叠碰撞；
  - 采用平滑三次贝塞尔曲线绘制父子连接线，选中时高亮青蓝辉光；
  - 具备画布背景按住平移浏览与一键居中复位功能。
- **键盘流转就地编辑与快捷键系统 (`MindMapView.tsx`)**:
  - **Tab**：在选中节点下极速创建新子分支并自动原地获得焦点编辑；
  - **Enter**：在选中节点旁插入同级兄弟分支并自动获得焦点编辑；
  - **Delete / Backspace**：删除选中的非根分支节点，焦点自动回退到父级；
  - **双击 / 空格 / F2**：直接就地开启节点文字编辑，Enter 保存，Esc 取消。
- **基础输入/输出模态框与极简工具栏 (`MindMapToolbar.tsx` & `MindMapIOModal.tsx`)**:
  - 严格遵循“先给普通的输入输出分支功能等就行了，先不要有其他的功能”的收敛禁令，不堆砌预设主题、色彩盘、复杂图标或装饰外框；
  - 提供标准 Markdown 大纲与结构化 JSON 双格式互转导入与导出，支持一键复制到剪贴板与导入即时重绘画布。
- **SQLite 自动防抖持久化与本地秒开 (`src/services/db.ts`)**:
  - 新建/修改/删除节点后，300ms 防抖自动落盘至 SQLite 物理数据库；
  - 冷启动时优先从本地同步缓存瞬时秒开，消除等待与白屏。
- **工程产物交付**:
  - `pnpm check` (`tsc --noEmit`) 零警告零错误退出码 0；
  - `cargo test` 5/5 底层测试全绿退出码 0；
  - `pnpm tauri build --no-bundle` 全量 Release 编译通过；
  - 同步更新根目录单文件可执行程序 `SelfWork.exe`（5.60MB）。

### Root Cause & Engineering Defense (5-Whys 根因穿透与长效防线)
1. **侧边栏样式意外篡改根因**:
   - 施工 Agent 在修改 `src/components/Sidebar.tsx` 挂载新模块路由时，未遵循“微编辑最小因果集”原则，使用了全文件覆写模式引入了未经批准的旧模板结构，导致用户调校的流光呼吸高亮柱、无衬线字体与折叠动画被覆盖破坏。
2. **长效防线下沉**:
   - 任何涉及已有组件（尤其是导航栏、顶栏、状态栏等核心骨架）的模块增补，严禁整文件重写或重构样式；必须使用微补丁模式仅追加数据行（如 `MODULES` 数组项）与图标映射，所有既有 CSS 类名、DOM 层级、动画属性必须保持 100% 零修改。

## [0.1.19] - 2026-11-10

### Added & Enhanced (待办清单与灵感便签拖拽重排、Tauri 底座解禁与全卡片长按拖拽)
- **Tauri v2 底座解禁 HTML5 原生拖拽 (`dragDropEnabled: false`)**:
  - 穿透 5-Whys 根因：Windows 下 Tauri v2 默认启用 `dragDropEnabled: true` 捕获系统文件外拖入事件，导致全局拦截并吞没了 WebView2 内部所有 HTML5 DOM 原生拖拽事件（`dragstart`, `dragover`, `drop`）；
  - 在 `src-tauri/tauri.conf.json` 中为主窗口显式配置 `"dragDropEnabled": false`，彻底卸载底层拦截钩子，释放浏览器引擎原生拖拽全能力。
- **待办清单 GTD 全卡片热区与长按拖拽重排 (Tasks Full-Card Drag & Reorder)**:
  - 在 `src/components/tasks/TasksPanel.tsx` 将拖拽监听由单一 Grip 图标拓展至整个待办项卡片，支持长按或抓取卡片任意非按钮区域自由拖动换位；
  - 接入完整 HTML5 拖拽事件流，拖拽中卡片呈半透明（`opacity-30`），目标落点呈现明晰的青蓝外边框高亮指引（`border-sky-500/60 ring-1 ring-sky-500/30`）；
  - 严格物理隔离复选框（Checkbox）、优先级切换（Priority Dot）、今日待办切换与删除等交互控件，配置 `onMouseDown` 冒泡拦截，点击与切换体验 100% 独立稳定。
- **灵感便签墙卡片拖拽重排与跨区自适应 (Memos Full-Card Drag & Pinned Sync)**:
  - 在 `src/components/tasks/MemoBoard.tsx` 将拖拽热区拓展至便签卡片全域与顶部水平 Grip 抓手，支持长按或抓取卡片在瀑布流网格中自由拖拽换位；
  - 严格隔离标题输入框（`<input>`）、正文编辑框（`<textarea>`）、置顶图标、调色盘菜单与删除按钮，文字编辑与光标选中完全无冲突；
  - 升级 `handleDropMemo` 重排算法：在基于 `sortedMemos` 重排的同时，自适应同步目标位置的 `isPinned` 置顶属性，拖拽位置与渲染视图 100% 绝对契合。
- **SQLite 数据库零丢失原子落盘与自定义顺序长效记忆 (Atomic SQLite Order Persistence)**:
  - 在 `src/components/TasksView.tsx` 接入 `onReorderTasks` 与 `onReorderMemos` 事件管线，拖拽换位后即时原子提交至底层 SQLite 数据库持久化存储；
  - 借助 SQLite `save_all_tasks_atomic` 与 `save_all_memos_atomic` 事务保证，按新顺序重排并自增 `rowid`，应用冷启动通过 `ORDER BY rowid ASC` 1:1 绝对保真还原用户自定义顺序。
- **工程产物交付**:
  - `pnpm check` (`tsc --noEmit`) 零警告零错误退出码 0；
  - `cargo test` 5/5 底层测试全绿退出码 0；
  - `pnpm tauri build --no-bundle` 全量 Release 编译通过；
  - 同步更新根目录单文件可执行程序 `SelfWork.exe`（5.59MB）。

### Root Cause & Engineering Defense (5-Whys 根因穿透与长效防线)
1. **HTML5 拖拽事件无响应根因**:
   - Tauri v2 默认开启的系统级文件拖入拦截器在 Windows WebView2 下劫持了原生 Drag/Drop 消息循环，导致前端 DOM 事件无法被派发。
2. **长效防线下沉**:
   - 在应用内存在富交互拖拽（如看板、清单排序）时，必须在 `tauri.conf.json` 中显式设置 `"dragDropEnabled": false`；
   - 拖拽热区不可仅依赖小图标（如 14px Grip），必须支持全卡片（排除输入框与操作按钮）或卡片 Header，以契合用户的拖拽直觉与长按习惯。

## [0.1.18] - 2026-11-10

### Refactored (顶部控制台栏极致减噪：移除冗余侧栏折叠按钮与 Desktop 状态胶囊)
- **彻底移除顶部栏重复的侧栏折叠按钮 (Duplicate Toggle Purged)**:
  - 剔除 `src/components/Titlebar.tsx` 左侧的 `PanelLeft` 折叠按钮，消除“顶栏与侧栏两个折叠键”的重复堆叠，仅保留侧边栏原有的收起/展开机制作为全局唯一控制入口；
  - 顶栏左侧无缝贴合纯净品牌文字 `SW工作台`（`#E6EDF7`）与模块信息（`#8FA3BF`），自然左对齐，呼吸留白舒朗。
- **彻底移除右侧 Desktop 状态指示胶囊 (Desktop Pill Purged)**:
  - 剔除常驻于顶栏右侧的“Desktop / Web Preview”状态探测胶囊与状态小圆点，彻底消灭技术性指示造成的视觉杂音；
  - 右侧仅纯粹保留最小化、最大化/向下还原、克制暗调且悬浮柔和暗红的关闭三按键。
- **最大化扩展原生物理拖拽抓手面积 (Expanded Drag Surface)**:
  - 在剥离左侧按钮与右侧胶囊后，顶部栏中间 `data-tauri-drag-region` 获得更宽阔平整的水平抓手，硬件级窗口拖动与双击最大化响应极为畅快。
- **工程产物交付**:
  - `pnpm check` (`tsc --noEmit`) 零警告零错误退出码 0；
  - `cargo test` 5/5 底层测试全绿退出码 0；
  - `pnpm tauri build --no-bundle` 全量 Release 编译通过；
  - 同步更新根目录单文件可执行程序 `SelfWork.exe`（5.59MB）。

## [0.1.17] - 2026-11-10

### Added & Refactored (统一深色控制台顶栏重塑与左上角占位小图标彻底移除)
- **左上角突兀占位小图标移除与纯净排版重构 (Placeholder Icon Purged)**:
  - 彻底移除最顶部左上角的 22px 占位小图标，根除视觉杂质与结构干扰；
  - 重构左侧区域布局对齐：主标 `SW工作台` 采用高亮浅色 `#E6EDF7`，模块信息采用沉稳弱化色 `#8FA3BF`，保持自然留白与严格基线对齐，杜绝结构错位或排版塌陷。
- **全窗体贯穿的统一深色控制台色彩体系 (Unified Dark Console Palette)**:
  - 顶部栏背景色精确采用比主视口略显微蓝灰的深色 `#0D1422`，完美融入整体科技感、冷静克制的深色控制台设计语言，彻底消除“系统默认窗口栏”的断层外挂感；
  - 底部分隔线采用 `rgba(80, 140, 200, 0.15)` 极弱冷调描边，实现清晰可感知但低存在感的分层；
  - 控件 Hover 状态采用柔和深蓝灰提亮（`rgba(80, 140, 200, 0.12)`），与主页面的青蓝/天蓝高亮元素浑然天成。
- **克制窗口控制与柔和暗红关闭交互 (Restrained Window Controls)**:
  - 窗口右上角集成极简细线条最小化、最大化/还原、关闭三按键；
  - 关闭按钮默认保持与整体一致的克制暗调，仅在鼠标悬浮时触发柔和暗红（`hover:bg-rose-500/20 hover:text-rose-300`），移出即刻平滑恢复，绝不刺眼。
- **硬件级零延迟窗口物理拖拽 (Zero-Latency Hardware Dragging)**:
  - 在 `src-tauri/tauri.conf.json` 中配置 `"decorations": false` 与 `"shadow": true`；
  - 顶部栏通过原生 `data-tauri-drag-region` 属性驱动，由底层 WebView2 与 Windows 消息循环直接接管拖拽与双击最大化，零 JS 异步微任务阻塞；
  - 在 Rust 微内核（`src-tauri/src/lib.rs`）中注册 `window_minimize`、`window_toggle_maximize`、`window_close`、`window_is_maximized` 原生命令，与前端形成双通道高可用容灾。
- **工程产物交付**:
  - `pnpm check` (`tsc --noEmit`) 零警告零错误退出码 0；
  - `cargo test` 5/5 底层测试全绿退出码 0；
  - `pnpm tauri build --no-bundle` 全量 Release 编译通过；
  - 同步更新根目录单文件可执行程序 `SelfWork.exe`（5.59MB）。

## [0.1.16] - 2026-11-10

### Added & Refactored (Windows 原生标题栏纯净化：剔除文字与图标，纯净深黑拖拽栏落地)
- **清空原生标题栏图文杂质 (Clean Native Caption Bar)**:
  - 在 `src-tauri/tauri.conf.json` 中配置主窗口 `"title": ""`，并在 Rust 内核启动时显式调用 `window.set_title("")`，彻底清除系统原生标题栏上的任何文字；
  - 在 `src-tauri/Cargo.toml` 中为 `windows-sys` 开启 `"Win32_UI_WindowsAndMessaging"` 特性依赖；
  - 在 `src-tauri/src/lib.rs` 的 `.setup` 生命周期中，通过 Win32 API 向 HWND 发送 `WM_SETICON (ICON_SMALL, 0)` 与 `WM_SETICON (ICON_BIG, 0)` 清除图标句柄，并在 `GWL_EXSTYLE` 扩展样式中注入 `WS_EX_DLGMODALFRAME` 阻止系统回退读取 class 图标，配合 `SWP_FRAMECHANGED` 立即刷新 DWM 客户区与非客户区；
  - 原生标题栏左侧完全无图标、无文本，变为一条深邃极简、沉浸感拉满的纯黑物理拖拽条。
- **100% 保留原生硬件级物理交互与控制按键 (Native Interaction Preserved)**:
  - 完整保留 Windows 10/11 原生硬件级拖动、双击最大化、Aero Snap 贴靠吸附、Snap Layouts 布局菜单；
  - 右上角完整保留 Windows 原生沉浸深色的最小化、最大化与关闭三按键。
- **品牌视觉标识收敛与单点独家呈现 (Brand Single Source of Truth)**:
  - 应用程序流体发光 S-W Logo 与“SW工作台”名称纯粹收敛在左侧边栏顶端 BrandHeader 中独家展示，彻底根除“顶部标题栏 + 侧栏顶端”垂直堆叠的“视觉双胞胎”冗余。
- **工程产物交付**:
  - `pnpm check` (`tsc --noEmit`) 零警告零错误退出码 0；
  - `cargo test` 5/5 底层测试全绿退出码 0；
  - `pnpm tauri build --no-bundle` 全量 Release 编译通过；
  - 同步更新根目录单文件可执行程序 `SelfWork.exe`（5.57MB）。

## [0.1.15] - 2026-11-10

### Added & Refactored (Windows 原生标题栏回归与 DWM 沉浸式深色模式工程落地)
- **100% 原始窗口硬件级拖拽移动回归 (100% Native Windows Window Dragging)**:
  - 在 `src-tauri/tauri.conf.json` 中恢复 `"decorations": true`；
  - 窗口移动彻底交由 Windows 操作系统桌面窗口管理器（DWM）与硬件级消息循环接管，彻底根除 Webview2 内部软件模拟拖拽的所有卡顿、延迟与断触缺陷；
  - 100% 原生支持 Windows 10/11 的 Aero Snap（拖拽至屏幕左右半屏分屏）、Snap Layouts 贴靠菜单、Alt+Space 系统窗口菜单与硬件级多显示器流转。
- **Win32 DWM 沉浸式深色标题栏注入 (DWM Immersive Dark Mode)**:
  - 在 `src-tauri/Cargo.toml` 中为 `windows-sys` 开启 `"Win32_Graphics_Dwm"` 特性支持；
  - 在 `src-tauri/tauri.conf.json` 配置 `"theme": "Dark"`；
  - 在 `src-tauri/src/lib.rs` 的 `.setup` 生命周期中获取主窗口 HWND 句柄，精准调用 `DwmSetWindowAttribute` 注入常量 20（Win11/Win10 20H1+）与常量 19（Win10 1809~1909）沉浸式暗黑属性；
  - 将 Windows 原生标题栏由刺眼的白灰色强行刷为深邃的沉浸深黑色，白字清晰自明，彻底根除深色科技风界面与浅色标题栏的视觉割裂。
- **前端顶栏去重与纯净空间重塑 (Clean Frontend Header)**:
  - 在 `src/components/Header.tsx` 中剔除自定义的最小化、最大化、关闭三按键与垂直分割线，坚决避免出现“两套控制按钮”的混乱堆砌；
  - 剔除 `Header.tsx` 与 `Sidebar.tsx` 中冗余的 `handleStartDragging` 软件模拟拖拽代码与相关 DOM 标记；
  - 顶栏精炼呈现模块名称、副标说明与状态胶囊，专注于工作台业务与状态感知；
  - 净化 `src/App.tsx` 根视口，让操作系统原生接管窗口外轮廓与最大化贴边。
- **工程产物交付**:
  - `pnpm check` (`tsc --noEmit`) 零警告零错误退出码 0；
  - `cargo test` 5/5 项单元测试全绿；
  - 全量生产编译更新单文件可执行程序 `SelfWork.exe`（5.57MB，退出码 0，原始丝滑拖拽与深色沉浸标题栏完美结合）。

### Root Cause & Engineering Defense (根因穿透与长效防线)
1. **无边框模拟拖拽无法达到“原生自然”根因**:
   - Webview 内部的 `startDragging()` 受限于 JavaScript 与原生 IPC 的异步通信及 DOM 事件捕获机制，且无法拥有 Windows 硬件级的 Aero Snap 边缘物理阻尼。用户真正反感的是“浅白色白条割裂”，而非原生标题栏本身。
2. **长效防线下沉**:
   - 建立“保留操作系统原生外壳保障 100% 物理交互 + Win32 DWM 沉浸暗黑属性注入解决色彩割裂 + 前端顶栏专注业务去重”的标准工业级桌面沉浸式工程架构。
