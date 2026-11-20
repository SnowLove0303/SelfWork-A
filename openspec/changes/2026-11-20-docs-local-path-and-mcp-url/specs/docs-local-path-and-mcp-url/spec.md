# Specification: Docs Local Physical Path Mirroring and URL Adaptive Switching

## 1. 规范概述 (Overview)

本规范遵循 RFC 2119 关键词（SHALL, SHALL NOT, MUST, SHOULD），确立 SelfWork 文档模块在面向 MCP (Model Context Protocol) 与 AI 协同环境下的路径计算与物理镜像同步契约。

## 2. 核心行为契约 (Behavioral Contracts)

### 2.1 路径模式抽象契约 (Path Mode Abstraction)
1. 系统 **SHALL** 支持两种路径计算模式：`'local'`（本地物理路径模式，默认）与 `'url'`（在线网络 URL 模式）。
2. 在 Tauri 桌面环境下，系统默认模式 **MUST** 为 `'local'`。
3. 系统 **SHOULD** 支持通过配置项 `VITE_DOCS_PATH_MODE` 或用户设置覆盖该模式。

### 2.2 本地物理路径与镜像落盘契约 (Local Physical Mirroring Contract)
1. 当处于 `'local'` 模式时，文档的物理目标目录 **MUST** 位于 `%APPDATA%\SelfWork\documents\`。
2. 物理文件名 **MUST** 进行 Windows 非法字符过滤（替换 `\ / : * ? " < > |` 为下划线），命名规则为 `${sanitizedTitle}.md`；若标题为空，**SHALL** 降级为 `untitled_${pageId}.md`。
3. 当用户触发“复制路径”或系统执行页面保存时，系统 **SHALL** 将页面对应的 Markdown 内容原子同步写入该物理文件，确保外部 MCP 工具通过路径访问时文件真实存在且内容为最新。
4. 复制到系统剪贴板的内容 **MUST** 为 Windows 风格的绝对文件路径（例如：`C:\Users\Administrator\AppData\Roaming\SelfWork\documents\02.3-02.5 集合类型、映射类型与其他内置类型.md`），**SHALL NOT** 包含分类面包屑或非路径文本。

### 2.3 在线 URL 路径契约 (Online URL Contract)
1. 当处于 `'url'` 模式时，系统 **SHALL** 按照基础域名配置输出标准文档 URL：`${BASE_URL}/docs/${pageId}`（默认基础地址为当前应用 Base Origin 或 `http://localhost:1420/#`）。
2. 复制到系统剪贴板的内容 **MUST** 为符合 RFC 3986 的标准 URL 字符串。

### 2.4 用户交互契约 (User Interface Contract)
1. 顶部面包屑右侧的复制图标、顶部工具栏的“复制路径”按钮、以及侧边栏文档项悬停的微复制图标，其复制行为 **MUST** 严格统一调用底座路径解析服务。
2. 复制触发后，系统 **SHALL** 弹出轻量 Toast 提示，明确展示“已复制本地物理路径: ...”或“已复制文档链接: ...”。
3. 复制按钮状态 **SHALL** 呈现 1.8 秒的即时绿勾视觉反馈。
