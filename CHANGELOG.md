# Changelog - SelfWork (SW工作台)

All notable changes and architectural invariants for SelfWork will be documented in this file.

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
