# Changelog - SelfWork (SW工作台)

All notable changes and architectural invariants for SelfWork will be documented in this file.

## [0.1.8] - 2026-11-09

### Added (待办清单与灵感便签协同工作台首发上线)
- **座舱级左右分栏协同架构 (58% : 42% Tasks & Memo Dual-Column)**:
  - 承载于侧栏【待办清单】主模块内部，实现结构化任务与非结构化即时备忘的高效协同。
- **左侧 58%：GTD 极速待办工作台 (TasksPanel)**:
  - **回车秒建输入流**：顶部单行极简快捷输入栏，支持键盘单手连续录入（默认常规 `p2`、`todo`）；
  - **微物理触觉复选框**：点击伴随内切高光与打勾动画，即时切换完成态并自动施加柔和中划线与透明度衰减；
  - **自明微光优先级**：采用高急红点（`p1`）、常规黄点（`p2`）、低优绿点（`p3`）自明色彩，点击即可顺畅循环切换，恪守少字原则；
  - **分类过滤胶囊**：提供【全部】、【今日】、【待办】、【已完成】4 大极简胶囊瞬切，带实时计数徽章；
  - **一键清理已完成**：底部提供轻量化已完成任务一键清理归档入口。
- **右侧 42%：灵感便签墙 (MemoBoard)**:
  - **即时自适应便签卡片**：支持多卡片网格流排布，支持就地自由编辑标题与多行自适应正文；
  - **置顶优先排序 (Pin)**：点击置顶图钉即可将核心备忘卡片自动置于首位展示；
  - **5 大冷调晶体底色**：支持深灰、深蓝、暗翠、暗紫、暗琥珀等半透明磨砂亚克力微冷色调循环切换；
  - **一键复制与微反馈**：卡片右下角提供一键复制全文至系统剪贴板，带即时 Tooltip 提示反馈。
- **本地优先持久化 (Local-First Persistence)**:
  - 待办数据与便签数据分别自动持久化到 `localStorage`（`selfwork_tasks_data` 与 `selfwork_memos_data`）；
  - 自动防抖保存（300ms），初次打开提供纯净自明的样例种子，脱离服务端断网秒开，零数据损耗。
- **工程产物交付**:
  - 更新便携单文件可执行程序 `SelfWork.exe`（4.4 MB，全静态资源内存内嵌，双击秒开，退出码 0）。

## [0.1.7] - 2026-11-09

### Refactored & Enhanced (落实少字原则与卡片单行紧凑座舱化重构)
- **严格遵循少字原则公理 (`RADICAL_TEXT_ECONOMY_AXIOM`)**:
  - 彻底移除了服务卡片内多余、常驻的副标题正文说明段落（如 FlClash 下方的“多协议高性能网络代理客户端”、微信下方的“腾讯微信 Windows 官方桌面版”等显而易见的 AI 模版废话）；
  - 辅助说明文本平滑降级为外层容器的原生 `title` 悬停提示气泡，主界面完全免于口水化文本污染；
  - 剔除了集群标头（如“日常办公”、“AI 协同”）中多余的副标题套话，界面视觉焦点纯粹聚焦于核心服务与指标。
- **工业级单行紧凑水平几何结构 (Single-Line Compact Row)**:
  - 服务条目高度收敛至 40~44px（`px-3 py-2`）；
  - 左侧：精炼图标容器（`w-5 h-5`）+ 服务名称 + 端口胶囊（`:9010` 带跳转箭头）+ 真实存活 PID 徽章（`PID: 12480`），单行完全水平对齐咬合；
  - 右侧：状态呼吸点 + 简练状态文本（`运行中` / `已停止` / `启动中`）+ 触觉启停按钮（微文案 `启动` / `停止`）；
  - 卡片垂直堆叠节奏优化为 `space-y-2.5`，首屏可视服务数量显著提升 ~35%，消除大面积垂直间隙浪费。
- **工程产物更新**:
  - 重新编译 Release 版便携单文件 `SelfWork.exe`（4.4 MB，全静态资源内存内嵌，离线秒开）。

## [0.1.6] - 2026-11-09

### Added & Enhanced (快速启动巡检真实性强化 & Windows 原生进程快照扫描上线)
- **Windows 原生 Toolhelp 进程快照扫描 (Native Low-Latency Process Enumeration)**:
  - 在 Rust 后端通过 `windows-sys` 绑定 Windows 原生 Toolhelp32 API (`CreateToolhelp32Snapshot`, `Process32FirstW`, `Process32NextW`)；
  - 直接在内存中遍历系统进程列表（单次扫描耗时 $< 2\text{ms}$，零命令行弹窗、零外部脚本进程开销）；
  - 全面穿透微信（`weixin.exe`/`wechat.exe`）、企业微信（`wxwork.exe`）、FlClash（`flclash.exe`）、Antigravity（`antigravity.exe`）、Antigravity IDE（`antigravity ide.exe`）、ChatGPT（`chatgpt.exe`）、Cockpit（`cockpit-tools.exe`）、AIstudy（`aistudy.exe`）等无固定端口桌面工具；
  - 彻底终结“点击开关后本地虚假乐观状态”以及“用户在外部启闭无法感知”的盲区顽疾。
- **端口与进程双重见证存活判定 (Dual-Witness Health Inspection)**:
  - 针对核心 Web 平台与微服务（DSH、StudyPower、MSDS、Docker、飞书桥接），在 TCP 监听握手与进程存活两端做双重真实性校验；
  - 毫秒级返回真实活跃进程 PID，在前端卡片实时点亮呼吸指示灯与绿色 `PID: xxxxx` 真实存活凭据徽章。
- **全维巡检事实流与外部状态变动感知**:
  - 点击“🔍 探查”按钮时，右侧终端输出毫秒级耗时与详细活跃服务列表（扫描项数、存活进程及对应 PID、活跃端口）；
  - 后台每 4 秒静默巡检，一旦捕获到用户在操作系统外部手动开启或关闭了任一软件，即时输出 `[INFO] [inspect] 外部状态变动感知: <软件名> 状态变更为 [运行中/已停止]`，实现真正的零死角座舱级全维状态透视。
- **工程产物更新**:
  - 重新编译 Release 版便携单文件 `SelfWork.exe`（4.4 MB，无黑框免安装，离线秒开）。

## [0.1.5] - 2026-11-09

### Added (快速启动仪表盘与实时执行报文控制台首发上线)
- **左侧仪表盘开关阵列 (Dashboard Switchboard)**:
  - 完整映射 `D:\应用研究\统一启动器\System\Workflow-Launcher.ps1` 包含的 6 大业务集群与 20+ 项服务：
    1. **常用办公套件 (`apps`)**：微信、企业微信、FlClash、ChatGPT、GLaDOS 自动签到及全套一键拉起；
    2. **AI 协同套件 (`ai-suite`)**：Antigravity IDE、ChatGPT、Cockpit 5000 控制台（端口 5000 / CDP 9333）；
    3. **核心 Web 平台 (`web`)**：DeepSeek Harness (:9010)、StudyPower (:3100)、冠志通 Docker (:18765)、合规性判断工作台、MSDS 智能处理引擎 (:5173 / API :5174) 及 AI Study Tauri；
    4. **局域网安全控制 (`lan`)**：冠志通局域网接入与 Wi-Fi 防火墙规则启闭；
    5. **飞书双桥接服务 (`feishu`)**：核心根服务、OpenCode 2 飞书桥接 (:49374)、Antigravity 飞书集成与守护进程；
    6. **WSL 专区 (`wsl`)**：Ubuntu WSL 专区、DSH WSL 版 (:9011)、Antigravity WSL 及 Cockpit WSL 版。
  - **交互体验**：卡片式集群布局，支持单个子项独立拨动开关与集群一键总控；
  - **真实状态指示灯**：翠绿色呼吸微光（运行中）、深灰（未启动）、琥珀色闪烁（启动/停止过渡态）、玫瑰红（异常）；
  - **端口直达胶囊**：动态探测 `:9010`, `:3100`, `:5000`, `:5173`, `:18765`, `:7891`, `:49374`, `:9011`，运行中点击直达系统默认浏览器。
- **右侧执行报文控制台 (Telemetry Log Console)**:
  - 高透晶体暗黑等宽排版（`#070a0f` 背景），极客终端质感；
  - 格式化展示毫秒级时间戳（`HH:mm:ss.SSS`）、彩色日志级别徽章（`[INFO]` 浅蓝、`[SUCCESS]` 翠绿、`[WARN]` 琥珀、`[ERROR]` 玫瑰红）、目标分类标签与正文；
  - 提供清空报文、一键复制全部日志至剪贴板、自动滚屏锁定/解锁切换功能；
  - 点击开关与执行报文无缝联动，执行前后追加耗时计算与回显。
- **Rust 后端微内核异步调度管道 (Tauri IPC Engine)**:
  - `run_launcher_command`：通过 `std::process::Command` 异步安全执行外部 PowerShell 启动脚本，配置 Windows `CREATE_NO_WINDOW` 彻底杜绝命令行黑框闪烁；
  - `check_service_ports`：基于 `std::thread::scope` 并行执行本地短超时（150ms）TCP 端口探查，每 4 秒无感巡检，毫秒级点亮服务呼吸灯。
- **工程产物交付**:
  - 更新便携版 `SelfWork.exe`（4.4 MB，全静态资源嵌入，离线秒开，退出码 0）；
  - 生成官方安装包 `SelfWork-Setup.exe`（1.9 MB，Windows NSIS 一键安装向导，退出码 0）。

## [0.1.4] - 2026-11-09

### Added & Fixed (设置中心「外观与背景」首发上线 & 彻底修复离线单文件 EXE 静态封包)
- **彻底根治“localhost 拒绝连接”问题 (Offline Embedded Assets)**:
  - *根因*：此前直接使用 `cargo build --release` 编译，未通过 Tauri CLI 注入生产静态资产映射，导致二进制内部残留 `devUrl: http://localhost:1420`，脱离本地 Node 服务时弹出连接失败；
  - *解决*：规范使用 `pnpm tauri build --no-bundle` 官方标准封包命令，将全部前端 HTML/CSS/JS/图标**100% 静态内嵌（Embedded Assets）进单个 `SelfWork.exe` 文件内部**，彻底脱离对本地 Node 服务的依赖，实现随时双击均可 100% 离线秒开。
- **自定义背景与设置中心「外观与背景」子模块上线**:
  - **双模背景作用域切换**：支持“全视口贯穿 (`window`)”与“仅主工作台画板 (`stage`)”即时平滑切换；
  - **多样化背景源**：支持“系统预设流光 (`fluid`)”、“本地图片上传 (FileReader Base64 离线安全存储)”与“网络图片直链 (`image_url`)”；
  - **高精光学滑块控制器**：定制开发极简亚克力磨砂滑动条（画板透光度 0%~100%、高斯磨砂模糊 0px~40px、深色防眩遮罩暗度 0%~80%）；
  - **实时响应与状态持久化**：滑动即时零延迟生效，自动同步落盘至 `localStorage`，重启程序自动完美还原；
  - **可扩展二级设置导航骨架**：设置视图内置左侧二级分类栏（首发“外观与背景”，预留“通用设置”、“快捷键”、“关于”）。

## [0.1.3] - 2026-11-06

### Added & Fixed (高透明度晶体玻璃、动态流光特效与文字定帧零抖动)
- **高透明度晶体玻璃 (High-Transparency Crystal Glass)**:
  - 侧栏与顶栏底色不透明度由 70%~80% 深度下调至轻盈晶透的 35% (`rgba(12, 16, 26, 0.35)`)，结合 `backdrop-blur-xl` (24px) 硬件加速大范围高斯模糊，空间通透感倍增。
- **灵动流光流动特效 (Fluid Ambient Sheen)**:
  - 在 `App.tsx` 全屏底层注入 GPU 硬件加速的柔和流光发生器（深冷海蓝与珠光微雾流光团，`animate-fluid-a/b`），在半透明玻璃后方平缓漫射流淌；
  - 激活项指示条注入呼吸流光光斑（`animate-sheen-pulse`），提升灵动质感。
- **彻底根除点击时文字缩放抖动 (Zero-Jitter Stationary Typography)**:
  - 彻底剔除 `.tactile-btn:active` 与 `.tactile-pill:active` 中的 `scale(0.975)` 与 `translateY(0.5px)` 物理形变；
  - 交互触觉反馈 100% 转移至纯光学深度变化（表面光影收暗 + 内凹加深 `inset 0 1px 3px rgba(0,0,0,0.6)`），文字与图标像素绝对静止，彻底消除视觉疲劳与晃眼感。
- **工程交付**:
  - 重新编译 Release 版 `SelfWork.exe` (体积 3.8MB，免黑框启动)。

## [0.1.2] - 2026-11-06

### Added & Enhanced (黑灰白半透明磨砂毛玻璃与微物理触觉质感升级)
- **黑灰白极简工业调色板 (Radical Monochrome)**:
  - 收敛主色调为深冷黑微底 (`#080b11`)、半透明深灰 (`rgba(13, 18, 28, 0.72)`) 与阶梯白，文字对比度严格达标 WCAG 2.2 AA。
- **亚克力磨砂玻璃材质 (Frosted Glass / Glassmorphism)**:
  - 侧边栏与顶部状态栏应用 `backdrop-blur-md` 结合 80% 半透明面板底色，呈现通透空气感与景深穿透；
  - 主舞台画板升级为 `backdrop-blur-xl` 悬浮亚克力实体，配合微弱环境冷光漫射，营造深邃空间层级。
- **按钮微物理触觉交互 (Tactile Button Mechanics)**:
  - 为侧栏导航按钮、折叠展开按钮及状态探测胶囊引入顶部内切高光 (`inset 0 1px 0 rgba(255, 255, 255, 0.12)`)；
  - 注入 `hover` 微光提亮与 `active:scale-[0.975]` 机械微下压反馈，手感清脆灵敏；
  - 激活项采用微透高光亚克力实体板效果 (`tactile-btn-active`)。
- **工程资产与发布**:
  - 重新编译 Release 版 `SelfWork.exe` (体积约 3.8MB，免黑框控制台启动)。

## [0.1.1] - 2026-11-06

### Fixed & Optimized (布局边界与分割线无缝咬合重构)
- **边框所有权公理 (Single-Border Ownership)**:
  - 侧边栏垂直右边框作为主干贯穿全屏 (`border-r border-border-default`)，右侧容器不再重复设置左边框，彻底杜绝相邻模块边框叠加导致的 2px 粗线问题。
- **水平基准线绝对平齐 (Y=44px)**:
  - 侧边栏 Brand 区域高度与顶部状态栏 Header 高度严格锁定为 `h-11` (44px) 并添加 `box-border`，底部分割线统一采用 `border-b border-border-default`，形成由左向右绝对水平贯通的连续基准线。
- **消除十字交汇处阴影光斑与断裂**:
  - 从 `globals.css` 中彻底剔除旧的 `.chiseled-border-r` / `.chiseled-border-b` 中基于 `box-shadow` 的外部投影线，统一使用纯净 1px 细线 `border-border-default` (`rgba(255, 255, 255, 0.08)`)，直角 T 型相交处再无交叉重叠光斑与线头。
- **主舞台无缝嵌合**:
  - `SlotContainer` 主舞台容器直接紧贴顶部 Header 底边与左侧 Sidebar 右边，内部画板边框规范为精准 1px 细线。
- **构建与发布**:
  - 重新编译 Release 版免控制台黑框可执行程序 `SelfWork.exe` (体积约 3.8MB)。

### Root Cause & Engineering Defense (根因与长效工程防线)
1. **交汇点光斑叠加根因**: 旧实现使用了 `box-shadow: 1px 0 0 0 ...` 来模拟边缘切削，在横竖两条线交界处产生阴影重叠加倍光晕。
   - *防御措施*: 确立单发色 1px 边框规范，禁用伪类投影模拟主结构边框。
2. **像素级错位根因**: 原顶栏和侧栏未显式声明 `box-border`，且内联样式与工具类混合。
   - *防御措施*: 统一使用 Tailwind 标准盒模型，禁止通过负 margin 或绝对定位做视觉创可贴。
