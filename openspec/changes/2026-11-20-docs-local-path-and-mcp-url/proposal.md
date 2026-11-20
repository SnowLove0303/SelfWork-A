# Proposal: Docs Local Physical Path Mirroring (MCP+AI Oriented) and Online URL Adaptive Switching

## 1. 提案背景与问题陈述 (Context & Problem Statement)

在之前的版本迭代中，系统实现的“复制路径”功能输出的是文档的分类层级逻辑面包屑文本（例如：`私人 / 02.3-02.5 集合类型、映射类型与其他内置类型`）。
然而，用户给出了严肃而明确的指示：
> “我要的不是这个路径：私人 / 02.3-02.5 集合类型、映射类型与其他内置类型，我要的是本地路径，如果上线的话那就是URL路径了”
> “默认使用本地路径，上线后我将改用URL 路径，因为到时候会涉及MCP+AI”

经过 5-Whys 深度根因穿透，查明：
- 逻辑面包屑仅具备人眼界面的分类展示价值，无法作为机器、脚本和外部 Agent 的输入；
- 用户的核心使用场景即将引入 **MCP (Model Context Protocol) 与本地/云端 AI 协同生态**；
- 在本地桌面运行环境下，本地 AI Agent 与外部 MCP 工具（如 Filesystem MCP、CLI 脚本、外部编辑器）必须依赖**真实存在于磁盘上的物理文件绝对路径**（例如 `C:\Users\Administrator\AppData\Roaming\SelfWork\documents\02.3-02.5 集合类型、映射类型与其他内置类型.md`），以执行 `read_file`、文本解析与语义索引；
- 在未来系统部署上线（Web / Server 架构）后，物理路径失效，必须平滑无缝切换为**标准的网络资源定位符（URL 路径）**（例如 `https://your-domain.com/docs/${pageId}`），以支撑云端 MCP Server 或 Web 客户端调用。

## 2. 变更目标与 1:1 需求对账矩阵 (Requirements Traceability Matrix)

| 需求项 ID | 用户原始需求 (Spec-Kit 1:1 摄入) | 变更目标与技术落地 | 验证标准 (Acceptance Criteria) |
|---|---|---|---|
| **REQ-1** | 废弃分类面包屑文本作为路径输出 | 彻底将复制路径目标由 `私人 / 分类 / 标题` 替换为面向机器与 AI 可直接寻址的真实定位符 | 点击复制不再产生形如 `私人 / ...` 的纯展示文本 |
| **REQ-2** | 默认使用真实本地物理文件路径（面向 MCP+AI） | 建立本地文档物理镜像落盘机制，在页面保存/导出/复制时将标准 Markdown 写入 `%APPDATA%\SelfWork\documents\${safeTitle}.md`，返回真实 Windows 绝对物理路径 | 返回的绝对路径在 Windows 资源管理器、命令行、MCP 工具中真实存在且内容为最新 Markdown |
| **REQ-3** | 预留并支持上线后改用 URL 路径 | 抽象统一路径解析服务 `getDocumentResourcePath`，内置本地与在线双模式配置；配置为 URL 模式时自适应输出标准 Web URL | 切换模式后，复制路径输出符合 Web 规范的 URL（如 `http://localhost:1420/#/docs/${pageId}` 或配置的域名） |
| **REQ-4** | 全局交互与 Toast 明确提示 | 统一顶部面包屑右侧快捷复制、顶部操作栏“复制路径”及侧边栏项目悬停微复制；复制成功后弹出精准 Toast（标明已写入本地 Markdown 镜像及绝对路径） | 所有入口点击后剪贴板内容一致，Toast 提示明确且不遮挡操作 |

## 3. 架构影响与风险评估 (Impact Analysis)

1. **对原有文档存储数据库的影响**：
   - 零破坏：SQLite 数据库（`selfwork.db`）中的 `doc_pages` 和 `doc_blocks` 继续作为单一法定数据真理源（Single Source of Truth）；
   - 本地物理 `.md` 文件作为受控物理只读/镜像导出缓存（Physical Mirror Projection），专供外部工具、本地 MCP 及 AI Agent 消费。
2. **对既有业务功能的影响**：
   - 面包屑视觉组件继续保留在顶部作为导航标识；
   - 自由调整列宽、多块选区、标题缩进与层级折叠等既有功能 100% 保持现状。
