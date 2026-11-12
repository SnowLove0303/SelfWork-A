# Changelog - SelfWork (SW工作台)

All notable changes and architectural invariants for SelfWork will be documented in this file.

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
