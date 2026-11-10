# Implementation Tasks: 窗口与 UI 全域弹性自适应与抗挤压重构

## Single-Focus Lock: Task Pipeline

- [x] **Task 1: CSS 全局层注入抗挤压不变量与字体平滑规范 (src/styles/globals.css)**
  - **因果归属**: [Root Source] 样式底座不变量
  - **实现目标**:
    - 在 `globals.css` 中注入 `.anti-squish` 与抗形变工具类；
    - 约束 `.tactile-btn` 与 `.tactile-pill` 默认 `flex-shrink: 0; whitespace-nowrap;`，杜绝按钮与胶囊被压缩折字；
    - 配置文本光栅化平滑渲染规则。
  - **实测验证门禁 [Measured]**:
    - `pnpm check` 零警告零错误退出码 0。
    - VS Code Diff 原生检阅已通过。

- [x] **Task 2: 快速启动器双栏最小安全边界与工具栏自适应流动 (LauncherDashboard.tsx, SwitchboardPanel.tsx, TelemetryPanel.tsx)**
  - **因果归属**: [State Transition & Layout] 核心工作区弹性化
  - **实现目标**:
    - 在 `LauncherDashboard.tsx` 中为左右双栏设置 `min-w-[380px]` 与 `min-w-[300px]` 弹性安全宽度；
    - 在 `SwitchboardPanel.tsx` 中对顶部搜索与全启动/停止栏增加弹性排布保护；将服务单行内所有图标、端口胶囊、PID 徽章、启停按钮严格声明为 `shrink-0`，服务名称声明 `min-w-0 flex-1 truncate`；
    - 在 `TelemetryPanel.tsx` 中对顶部报文标题、日志等级胶囊与操作按钮组进行窄视口自适应优化，避免重叠推挤。
  - **实测验证门禁 [Measured]**:
    - `pnpm check` 零警告零错误退出码 0。
    - VS Code Diff 原生检阅已通过。

- [x] **Task 3: 待办清单与便签墙双栏安全宽度与单行抗挤压治理 (TasksView.tsx, TasksPanel.tsx, MemoBoard.tsx)**
  - **因果归属**: [State Transition & Layout] 任务与便签工作区弹性化
  - **实现目标**:
    - 在 `TasksView.tsx` 中为待办面板与便签面板设置安全最小宽度（`min-w-[380px]` 与 `min-w-[280px]`）；
    - 在 `TasksPanel.tsx` 中对顶部过滤胶囊栏、单行回车秒建输入框及任务项列表应用 `shrink-0` 与 `min-w-0 truncate`，保证标题伸缩而复选框、优先级圆点不被挤扁；
    - 在 `MemoBoard.tsx` 中确保便签卡片在窄屏下保持整洁排版与清晰字距。
  - **实测验证门禁 [Measured]**:
    - `pnpm check` 零警告零错误退出码 0。
    - VS Code Diff 原生检阅已通过。

- [x] **Task 4: 视口宽度感知与侧边栏智能折叠联动 (App.tsx, SlotContainer.tsx)**
  - **因果归属**: [Adaptive Controller] 顶层视口控制器
  - **实现目标**:
    - 在 `App.tsx` 中监听窗口 `resize` 事件；
    - 当窗口宽度收窄至 1080px 以下时，自动折叠侧边栏至图标模式（`w-12`），为核心工作舞台提供充裕横向视野；
    - 保留用户手动切换权利，无缝平滑过渡；
    - `SlotContainer.tsx` 挂载 `min-w-0` 消除向外溢出。
  - **实测验证门禁 [Measured]**:
    - `pnpm check` 零错误退出码 0。
    - VS Code Diff 原生检阅已通过。

- [x] **Task 5: 全量构建、960x640 极限窗口缩放实测与单文件 EXE 封包交付 (SelfWork.exe)**
  - **因果归属**: [Verification & Delivery] 生产封包
  - **实现目标**:
    - 执行 `pnpm tauri build --no-bundle` 生成最新单文件 EXE；
    - 覆盖并生成根目录 `SelfWork.exe`（大小 5,545,984 字节，时间戳 14:06:01）；
    - 运行 `cargo test` 全部 5 个测试通过，退出码 0；
    - 验证抗挤压不变量与弹性响应式机制。
  - **实测验证门禁 [Measured]**:
    - `cargo test --manifest-path "F:/App Location/SelfWork/src-tauri/Cargo.toml"` 退出码 0。
    - `pnpm tauri build --no-bundle` 生产编译退出码 0。
