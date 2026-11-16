# Proposal: 快速启动指定路径文件夹功能支持 (Launcher Folder Target Launch Support)

## 一、 背景与动机 (Why)

在日常工程研发与办公流转中，用户除了启动应用程序 (.exe)、执行脚本与打开网址外，频繁需要一键快速直达特定物理文件夹（如工程代码根目录、日常下载目录、编译输出目录、日志数据目录等）。用户明确提出核心需求：
> “快速启动项新增支持 启动快速启动指定路径文件夹的功能”

尽管数据模型中预留了 `'folder'` 类型，但此前系统在文件夹物理唤起管线、原生目录提取体验、异常路径处理及专属测试见证方面尚未形成严密闭环。本提案旨在通过系统级原生通道，赋予快速启动台一等公民级别的“文件夹极速唤起”能力：支持原生目录选择器、手动路径输入与规范化、专属琥珀色目录标识、Windows 文件资源管理器直接毫秒级唤起（免黑框免命令行停顿），并无缝兼容组合启动 (Bundle) 与批量调度。

## 二、 1:1 需求物理对账矩阵 (1:1 RTM Ingestion)

严格 1:1 守恒注入 Step 0 确立的 6 项核心法定需求：

| 需求编号 | 用户原始输入锚点 | 核心业务契约定义 |
| :--- | :--- | :--- |
| **REQ-LAUNCHER-FOLDER-01** | “快速启动项新增支持” | 弹窗中提供明确的“文件夹”专属类型选项，切换时表单自适应为文件夹目标配置模式。 |
| **REQ-LAUNCHER-FOLDER-02** | “指定路径文件夹” | 用户可手动输入绝对物理路径或点击“浏览选择”拉起系统原生目录选择器，支持路径自动规范化与目录名智能提取。 |
| **REQ-LAUNCHER-FOLDER-03** | “启动快速启动指定路径文件夹” | 点击文件夹卡片时，系统通过 Windows 原生通道直接唤起文件资源管理器 (File Explorer) 直达该物理目录，0 黑框闪烁。 |
| **REQ-LAUNCHER-FOLDER-04** | “启动项视觉呈现与图标标识” | 大盘卡片呈现“目录”专属琥珀金标签徽章与 FolderOpen 矢量图标，提供清晰的悬停触觉微动效。 |
| **REQ-LAUNCHER-FOLDER-05** | “组合套件与批量启动兼容” | 文件夹启动项可无缝加入组合套件 (Bundle) 或在多选模式下一键批量唤起，流水线调度顺畅稳定。 |
| **REQ-LAUNCHER-FOLDER-06** | “异常路径校验与优雅反馈” | 面对不存在或失效的文件夹路径时，执行时下发精准可读的错误反馈并记录日志，绝不导致应用白屏崩溃。 |

## 三、 法定双清单 (Dual-List Precondition)

### 1. 拟变范围清单 (Proposed Scope)
- `src-tauri/src/lib.rs` `[Root Source]`:
  在 `launch_custom_target` 中显式针对 `target_path.is_dir()` 引入 Windows 原生资源管理器直连通道 (`explorer.exe <normalized_dir>`)，规避 powershell 额外开销与黑框；确保路径斜杠跨平台统一规整。
- `src/components/LauncherDashboard.tsx` `[State Transition / UI]`:
  完善 `handlePickFile` 与表单联动，在选择文件夹时准确提取最后一级目录名（即使目录名包含点号也绝不误截断）；卡片渲染保持暖色调琥珀金微光。
- `scripts/launcher-e2e-test.mjs` `[Verification & Witness]`:
  为 E2E 真实行为测试套件扩充文件夹专属启动用例，包含实体文件夹与不存在文件夹的负向测试。
- `CHANGELOG.md` `[Knowledge Persistence]`:
  登记版本功能演进与避坑记录。

### 2. 保持现状承诺清单 (Preservation Commitments)
- **不可否定公理**：坚决保留既有应用程序 (.exe)、快捷方式 (.lnk)、脚本 (.bat/.cmd/.ps1) 与网页 (.url) 的全部调度逻辑与参数支持；
- **组合套件承重墙**：严格保全已有的 `bundle` 组合管理与 150ms 间隔调度机制，不篡改任何子项关联模型；
- **数据资产绝对保全**：用户现有 SQLite 数据库中的全部 11 个应用及自定义分类数据 100% 完整无损；
- **平台微内核防线**：`src/components/Sidebar.tsx`、`src/components/Titlebar.tsx` 保持 0 修改，严格对齐 `w-64` 与 `h-[49px]` 基准线。
