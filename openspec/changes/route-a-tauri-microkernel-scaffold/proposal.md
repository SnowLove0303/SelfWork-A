# Change Proposal: Route A - Tauri v2 Desktop Micro-Kernel Scaffold

## 1. Summary
依据用户对“路线 A 先做”的法定确认，启动 Ps-openspec 的 `desktop-exe-development` (Tauri v2 桌面生产体系) 与 `ui-ux-design-engineering` (现代工业级界面工程规范) 原子技能。在 `F:\App Location\SelfWork` 搭建极简微内核桌面宿主容器，配置 Rust stable 工具链，打通 Windows 原生窗口与前后端双向安全 IPC，并构建符合 Anti-AI-Slop 标准的极简现代导航与可插拔模块插槽布局。

## 2. Requirements Traceability Matrix (1:1 RTM)
- REQ-A1 (环境就绪): 激活配置 Rust stable 工具链，确保 `cargo --version` 与 `rustc --version` 本地执行退出码 0；
- REQ-A2 (极简桌面宿主): 初始化 Tauri v2 原生窗口应用骨架，打通 `ping` / `pong` 安全 IPC 管道，支持 Windows 托盘与窗口控制，无告警无错误；
- REQ-A3 (前端工程与插槽): 集成 React 19 + TypeScript (Strict) + Vite 6 + Tailwind CSS，注入 Design Tokens 令牌体系，构建侧边导航栏与候选功能纯净插槽，遵循少字原则与五态完备性。

## 3. Methodologies Bound (方法论绑定)
- `desktop-exe-development`: Tauri v2 双进程安全隔离、Rust 静态强类型 IPC、Windows 原生窗口配置与 NSIS 打包就绪；
- `ui-ux-design-engineering`: 8pt 空间网格、严格字阶标度、Anti-AI-Slop 界面工程硬防线、语义调色盘。

## 4. Preserved Invariants (保持现状承诺)
- 保持微内核纯粹性，不提前编写任何候选业务逻辑（启动器、笔记、脑图等仅保留类型与插槽）；
- 严格遵循零警告、零错误（`--max-warnings=0`），退出码 0 为解锁充要条件。
