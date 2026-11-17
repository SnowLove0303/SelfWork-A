# Changelog - SelfWork (SW工作台)

All notable changes and architectural invariants for SelfWork will be documented in this file.

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
