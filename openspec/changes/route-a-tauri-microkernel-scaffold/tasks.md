# Tasks: Route A - Tauri v2 Desktop Micro-Kernel Scaffold

- [x] Task 1: 激活 Rust stable 默认工具链 [Root Source]
  - 运行 `rustup default stable`
  - 验证 `rustc --version` 与 `cargo --version` 真实退出码 0

- [x] Task 2: 配置前端核心工程与 Design Tokens 样式基底 [Root Source]
  - 写入 `package.json` (React 19, Vite 6, Tailwind CSS, @tauri-apps/api v2)
  - 写入 `tsconfig.json` (严格类型检查模式)
  - 写入 `vite.config.ts` 与 Tailwind 工业级设计令牌配置
  - 执行 `pnpm install` 安装依赖
  - 验证命令: `pnpm tsc --noEmit` 真实退出码 0

- [-] Task 3: 搭建 Tauri v2 原生桌面宿主与 IPC 核心 [State Transition]
  - 创建 `src-tauri/Cargo.toml` 与 `src-tauri/tauri.conf.json`
  - 编写 `src-tauri/src/main.rs` 与 `src-tauri/src/lib.rs` (实现强类型 `ping` 指令)
  - 验证命令: `cargo check --manifest-path src-tauri/Cargo.toml` 真实退出码 0

- [ ] Task 4: 构建符合 Anti-AI-Slop 的工作台主界面与模块插槽 [Consumer Sink]
  - 编写 `src/components/Sidebar.tsx` (折叠导航栏，挂载启动器/待办/笔记/脑图/MCP/AI插槽)
  - 编写 `src/components/Header.tsx` (状态指示灯、微内核心跳探测)
  - 编写 `src/components/SlotContainer.tsx` (极简模块容器，支持各候选模块待命状态)
  - 编写 `src/App.tsx` 与入口渲染
  - 验证命令: `pnpm build` (零告警零错误退出码 0)

- [ ] Task 5: 全链路联调、触觉检阅与 GitHub 同步 [Milestone Archive]
  - 全量机检与类型验证
  - 提交 Git Commit 并推送到 GitHub 远程仓库 `SnowLove0303/SelfWork-A`
  - 验证命令: `git status && git log -1`
