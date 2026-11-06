# SelfWork 个人工作台：项目工程宪法 (Project Governance Constitution)

> **最高法定地位**：本文件为 `SelfWork` 个人工作台项目的最高法定总纲。所有在此代码库工作的智能体与开发者必须无条件遵守本宪法，任何违背本宪法的变更将被一票否决。

---

## 🏛️ 一、 核心工程哲学：Lauren Tan 五层信任与防御金字塔

### Layer 1: 架构与类型承重墙 (Architecture Invariants)
1. **微内核与可插拔设计 (Micro-Kernel & Pluggable Architecture)**：
   - 核心平台（Tauri 原生桥、统一事件总线、本地数据底座）保持极简与强健；
   - 脑图、块级笔记、快速启动器、待办事项、MCP 服务与 AI 自动化等业务功能均作为**独立、可选、可插拔模块 (Optional / Pluggable Modules)** 存在，严禁形成交叉硬依赖。
2. **状态机显式建模 (Explicit State Machine)**：
   - 非法状态在类型层必须不可表达；严格区分 `None/Empty` 与“未获取/加载中”，杜绝隐式假设与防御性兜底。
3. **源码级防篡改封印 (@ANTIGRAVITY_INVARIANT_LOCK)**：
   - 核心稳定底座使用源码级封印，非用户指名道姓要求严禁擅自修改。

### Layer 2: 编译器与静态检查硬门禁 (Hard Blocker)
1. **零警告、零错误原则 (Zero Warnings, Zero Errors)**：
   - TypeScript 编译 (`tsc --noEmit`) 与 Rust 检查 (`cargo check`) 拥有最高一票否决权，强制 `--max-warnings=0`；
   - 严禁使用 `@ts-ignore`、`eslint-disable` 或 `as any` 绕过检查。
2. **纠错两遍即立项为硬规则 (Two-Strike Escalation)**：
   - 人工纠错两次的模式，必须机械化下沉为 Lint 规则或测试断言。

### Layer 3: 契约立法与剧本库 (Contracts & Playbooks)
1. **OpenSpec 增量生命周期**：
   - 任何非琐碎变更，动工前必须在 `openspec/changes/<change-name>` 下编制 `proposal.md`、`specs/`、`design.md` 与 `tasks.md`。
2. **正向行动化准则**：
   - 规范采用封闭作用域与明确准入指标，避免模糊负向禁令。

### Layer 4: 两阶双轨深度审计 (Two-Step Dual-Scope Audit)
1. **第一步（机械审计）**：测试套件退出码必须为真实的 0，负向异常用例占比 $\ge 30\%$；
2. **第二步（认知审计）**：终审阶段由独立子 Agent 进行反向边界审查与变异杀伤力验证。

### Layer 5: 人机双门禁与触觉检阅 (Dual Gates & Tactile Review)
1. **门禁 1 (需求零损耗立案)**：需求 1:1 对账确认后方可设计；
2. **门禁 2 (双清单前置授权)**：动工前呈报拟变清单与保持现状承诺清单，获批后方可编码；
3. **触觉检阅**：代码变更必须拉起 VS Code 原生 Diff 供人类审核。

---

## ⚡ 二、 候选功能演进原则 (Potential Features Evolution Policy)

工作台规划中的各项功能（思维导图、Notion笔记、快速启动器、待办看板、MCP/API协议、AI自动化）被统一定义为**候选能力池 (Potential Capability Pool)**：
1. **按需激活**：未被用户明文指令要求开发的功能，保持接口预留与架构解耦，不提前编写臃肿业务代码；
2. **独立沙箱**：每个模块具备独立的生命周期（注册、挂载、卸载、状态持久化），单一模块崩溃绝不波及工作台主进程；
3. **本地优先 (Local-First)**：所有数据以标准通用格式（Markdown, JSON, SQLite）落盘于本地，支持 Git 版本追踪。
