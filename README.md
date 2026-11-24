# SelfWork (SW工作台)

<p align="center">
  <strong>Local-First 个人效率桌面工作台 —— 快速启动调度 · 待办与便签 · 思维导图 · Notion 级块文档与多维表格</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Tauri-v2-24C8D8?style=flat-square&logo=tauri&logoColor=white" alt="Tauri v2" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Rust-2021-DEA584?style=flat-square&logo=rust&logoColor=black" alt="Rust" />
  <img src="https://img.shields.io/badge/SQLite-Local--First-003B57?style=flat-square&logo=sqlite&logoColor=white" alt="SQLite" />
  <img src="https://img.shields.io/badge/Version-v0.1.90-10B981?style=flat-square" alt="Version" />
</p>

---

## 🎯 为什么做 SelfWork？（直击四大日常痛点）

1. **解决“开工慢、收尾乱”的桌面调度痛点**
   - **开工繁琐**：每次进入特定工作场景（如日常研发、文档整理、多账号协作）都要在桌面、开始菜单、任务栏里挨个点开软件、网页、脚本和十几个深层文件夹，再手动拖拉分屏；SelfWork 通过**组合套件 + 多显示器自动分屏编排**实现“一键进入工作态”。
   - **收尾一地鸡毛**：任务结束后打开的软件和资源管理器窗口散落各处，不知道哪些还在跑、关闭还要切窗口逐个点；SelfWork 提供**白名单运行态感知 + 按启动项分类组织的运行清单**，只盯纳入管理的软件与目录（哪怕在目录里点进了子文件夹也能识别），支持按单项、按组合定向关闭或一键全部收尾，且绝不误杀系统桌面进程。
2. **解决效率工具碎片化与高频上下文切换损耗**
   - 把高频使用的**应用/脚本调度、待办清单与灵感便签、思维导图、块级文档与多维表格**收拢到同一个低延迟桌面入口中，告别在五六个独立客户端之间反复切换窗口导致的注意力断裂。
3. **解决云端工具卡顿、断网受限与数据锁定痛点**
   - 坚持 **Local-First（本地优先）**：核心数据落盘本地 `SQLite` 并同步生成干净的 `Markdown` 物理镜像，断网可用、毫秒级响应、完全掌控自己的数据资产（支持 Git 原生追踪），同时兼顾 Notion 级块编辑（公式/Mermaid/双链/同步块）与 Word 级表格排版体验。
4. **拒绝臃肿教程与视觉噪音过载**
   - 采用暗黑无边框晶体界面与**极简少字原则**，剔除一切无意义的副标题解释、冗余数字与弹窗说教，将高频操作收敛到直觉化的状态点、悬浮微交互与右键菜单中，让工具真正退回幕后、专注内容本身。

---

## 📖 项目简介

**SelfWork (SW工作台)** 是一款面向 Windows 桌面端的高颜值、低延迟、**Local-First（本地优先）** 个人综合效率工作台，基于 **Tauri v2 + Rust + React 19 + TypeScript + Tailwind CSS + SQLite** 构建，全部核心业务数据均默认持久化在本地。

---

## ✨ 核心功能模块

### 1. 🚀 快速启动与系统调度 (`LauncherDashboard`)
- **全类型启动载体**：支持本地应用（`.exe` / `.lnk`）、文件夹目录、网页 URL、批处理/脚本（`.bat` / `.cmd` / `.ps1` / PowerShell 指令）以及一键多项目**组合套件（Bundle Suite）**。
- **原生态图标提取与批处理支持**：Rust 后端自动提取原生 `.exe`/`.lnk` 高清图标缓存，并针对含空格/中文路径、外层双引号粘贴路径及相对工作目录（`%~dp0`）提供无黑框（`CREATE_NO_WINDOW`）可靠执行。
- **多显示器分屏窗口编排（Window Snap Tiling）**：
  - 支持 `田字四分屏`、`左右双分屏`、`上下双分屏`、`主辅三分屏` 等预设布局；
  - 组合启动或自由多选启动时，自动探测多显示器工作区坐标并将拉起的应用窗口及 Explorer 文件夹窗口精准停靠至指定象限。
- **白名单运行状态感知与快捷关闭**：
  - 仅针对纳入快速启动配置的白名单应用与文件夹目录进行低功耗前台节流检测；
  - 卡片右上角呈现绿色呼吸状态点（悬停平滑切换为红色 `✕` 一键关闭），不干扰重复多开启动；
  - **文件夹安全关闭**：精确匹配资源管理器窗口（支持进入子目录后的最长前缀归属匹配），通过 `WM_CLOSE` 安全关闭目标文件夹窗口，绝不误杀系统 `explorer.exe`。
- **动态分类运行清单 (`ProcessManifestModal`)**：
  - 根据快速启动已有分类文件夹动态生成筛选 Tab，直观汇总运行中的应用、文件夹与组合套件，支持一键全部关闭（带二次确认防误触）及按单项/组合定向关闭。
- **执行报文终端 (`TelemetryPanel`)**：实时记录指令下发、脚本输出与耗时日志。

### 2. ✅ 待办清单与灵感便签 (`TasksView` / `TasksPanel` / `MemoBoard`)
- **待办事项看板**：支持回车秒建、优先级标记、今日聚焦（Today）、截止日期与状态流转。
- **灵感便签墙**：轻量卡片式记录与快速检索，与待办清单共享统一基准线布局与本地 SQLite 持久化。

### 3. 🧠 思维导图 (`MindMapView`)
- **分区管理与回收站 (`MindMapPartitionView`)**：支持按分区整理导图，删除的导图暂存回收站支持原位还原或彻底粉碎。
- **交互式画布与样式引擎 (`MindMapCanvas` / `MindMapStylePanel`)**：支持节点增删、折叠、自由缩放平移、主题配色定制，以及导出/导入结构化数据（`MindMapIOModal`）。

### 4. 📝 块级文档与多维表格 (`DocsView` / `BlockEditor`)
- **Notion 级块编辑器 (`BlockItem` / `SlashMenu`)**：
  - 支持 `/` 斜杠命令唤起多维块：段落、多级标题、待办块、代码块、数学公式（KaTeX）、Mermaid 流程图/架构图、音视频嵌入、思维导图内嵌、同步块（`SyncedBlock`）、分栏布局（`MultiColumnBlock`）与目录（`TableOfContentsBlock`）；
  - 支持划选浮动格式工具栏（`FloatingFormatToolbar`）、全局查找替换（`FindReplaceBar`）、页面双链引用（`PageMentionMenu`）与局部关系图谱（`DocLocalGraph`）。
- **Word / Notion 级表格引擎 (`TableBlock`)**：
  - 支持二维框选跨格操作、Notion 式列头/行侧抓手与悬停行列插入器；
  - 右键沉浸式上下文菜单与 Mini Toolbar：支持 Word 标志性 **3×3 九宫格对齐**、莫兰迪低饱和度单元格底纹、隔行斑马纹、首行表头开关与 Markdown 同步。
- **多维数据库视图 (`TableDatabaseView`)**：支持自定义列类型与结构化记录管理。
- **全库能力与本地镜像**：内置全库搜索（`DocGlobalSearchModal`）、版本历史快照（`DocHistoryDrawer`）、行内批注（`DocCommentDrawer`）、废纸篓（`DocTrashDrawer`）、批量导入导出及本地 Markdown 物理镜像同步。

---

## 🏗️ 技术架构与目录结构

### 技术栈
- **前端界面**：React 19, TypeScript 5.7, Vite 6, Tailwind CSS 3.4, Lucide Icons, KaTeX, Mermaid
- **桌面内核**：Tauri v2 (`tauri 2.1.1`), Rust (2021 Edition)
- **Windows 原生互操作**：`windows-sys` 0.59 (`ShellExecuteW`, `Toolhelp32Snapshot`, `OpenProcess`, `TerminateProcess`, `PostMessageW`, `Dwm`)
- **本地持久化**：`rusqlite` (Bundled SQLite, WAL 模式) + 本地 Markdown/JSON 文件镜像

### 目录结构
```text
SelfWork/
├── src/                          # 前端 React + TypeScript 源码
│   ├── components/
│   │   ├── LauncherDashboard.tsx # 快速启动主视图与调度中心
│   │   ├── launcher/             # 运行清单 (ProcessManifestModal)、执行报文 (TelemetryPanel)、Switchboard
│   │   ├── TasksView.tsx         # 待办与便签主视图
│   │   ├── tasks/                # TasksPanel, MemoBoard
│   │   ├── MindMapView.tsx       # 思维导图主视图
│   │   ├── mindmap/              # 画布、分区管理、工具栏、样式与导入导出
│   │   ├── DocsView.tsx          # 文档工作区主视图
│   │   └── docs/                 # 块级编辑器 (BlockEditor/TableBlock)、多维表格、搜索/历史/批注/废纸篓
│   ├── services/                 # SQLite 桥接与本地持久化服务 (db.ts)
│   ├── types/                    # 各模块 TypeScript 类型契约
│   └── App.tsx / Sidebar.tsx / Titlebar.tsx
├── src-tauri/                    # Tauri v2 + Rust 后端源码
│   ├── src/
│   │   ├── lib.rs                # 核心 IPC 命令（应用/脚本拉起、进程与目录窗口探测/关闭、分屏编排、图标提取）
│   │   ├── db.rs                 # SQLite 初始化、表结构迁移与 CRUD / 文档物理镜像同步
│   │   └── main.rs               # 桌面入口
│   ├── Cargo.toml
│   └── tauri.conf.json
├── openspec/                     # OpenSpec 增量规格与变更档案
├── AGENTS.md                     # 项目工程治理宪法
├── ARCHITECTURE.md               # 微内核架构与模块边界契约
├── CHANGELOG.md                  # 版本演进记录 (v0.1.0 ~ v0.1.90)
└── package.json
```

---

## 🛠️ 本地开发与构建指南

### 环境前置要求
- **Node.js**：v20+（推荐 v22+）与 **pnpm**
- **Rust**：1.75+（含 `cargo` 与 MSVC 工具链）
- **Windows 环境**：WebView2 Runtime（Windows 10/11 通常已内置）

### 常用命令

```bash
# 1. 安装前端依赖
pnpm install

# 2. 启动桌面端开发模式（Vite 热更新 + Tauri 窗口）
pnpm tauri dev

# 3. 静态类型检查（零警告零错误门禁）
pnpm check

# 4. 后端 Rust 编译检查与单元测试
cargo check --manifest-path src-tauri/Cargo.toml
cargo test --manifest-path src-tauri/Cargo.toml

# 5. 构建前端生产产物
pnpm build

# 6. 编译 Windows 桌面单文件可执行程序（产物位于 src-tauri/target/release/selfwork-desktop.exe）
pnpm tauri build --no-bundle
```

---

## 💾 数据存储位置

SelfWork 坚持 **Local-First（本地优先）** 原则，所有业务数据均存储于本地用户目录，不依赖任何外部云端服务器：
- **SQLite 主数据库**：`%APPDATA%\SelfWork\selfwork.db`
- **文档 Markdown 本地物理镜像**：`%APPDATA%\SelfWork\documents\`

---

## 📜 工程规范与版本记录

- 项目遵循 **OrbitStack (Ps-openspec)** 增量规格驱动开发流程，所有功能变更均在 [`openspec/`](./openspec) 留存规格与任务追踪，代码改动遵循 [`AGENTS.md`](./AGENTS.md) 工程宪法与 `ui-ux-design-engineering` 界面少字原则。
- 完整迭代历史请查阅 [`CHANGELOG.md`](./CHANGELOG.md)。
