# Implementation Tasks: 清理虚假占位模块与设置页面，收敛纯净双主航道工作台

## Single-Focus Lock: Task Pipeline

- [x] **Task 1: 收敛 ModuleId 领域类型与侧栏导航项 (src/types/workbench.ts, src/components/Sidebar.tsx)**
  - **因果归属**: [Root Source] 模块领域模型与导航入口
  - **实现目标**:
    - 在 `src/types/workbench.ts` 中将 `ModuleId` 精简为 `'launcher' | 'tasks'`；
    - 在 `src/components/Sidebar.tsx` 中清理 `MODULES` 列表，只保留【快速启动】与【待办清单】；
    - 移除无用的 Lucide 图标引用。
  - **实测验证门禁 [Measured]**:
    - `pnpm check` 零警告零错误（将在 Task 2 路由对接后全绿核销）。

- [x] **Task 2: 主舞台 SlotContainer 剔除设置与文字占位，直连实体视图 (src/components/SlotContainer.tsx)**
  - **因果归属**: [State Transition & Routing] 画板渲染路由
  - **实现目标**:
    - 移除 `SettingsView` 导入与渲染分支；
    - 移除 `currentMod.name` 居中文字占位代码；
    - 简化为确定性的 `activeModule === 'launcher' ? <LauncherDashboard /> : <TasksView />`；
    - 清理多余 Props。
  - **实测验证门禁 [Measured]**:
    - 视图代码收敛完成（待 Task 3 App 适配后整体通过 `pnpm check`）。

- [x] **Task 3: App 顶层与设置组件解耦净化 (src/App.tsx, src/components/SettingsView.tsx)**
  - **因果归属**: [Cleanup & Decoupling] 顶层容器净化
  - **实现目标**:
    - 简化 `App.tsx` 中传给 `SlotContainer` 的参数；
    - 安全清理或移除 `src/components/SettingsView.tsx`；
    - 保持全局默认暗黑亚克力磨砂玻璃背景稳定运行。
  - **实测验证门禁 [Measured]**:
    - `pnpm check` (`tsc --noEmit`) 零警告零错误退出码 0；
    - `pnpm build` (`tsc && vite build`) 生产打包完全通过，退出码 0。

- [x] **Task 4: 全量构建与单文件 EXE 封包交付 (SelfWork.exe)**
  - **因果归属**: [Verification & Delivery] 生产封包
  - **实现目标**:
    - 执行 `cargo test` 确保底层 5 项测试全部通过，退出码 0；
    - 执行 `pnpm tauri build --no-bundle` 生成最新单文件 EXE；
    - 覆盖并生成根目录 `SelfWork.exe`；
    - 验证侧栏只剩快速启动与待办清单，无任何空态占位。
  - **实测验证门禁 [Measured]**:
    - `cargo test` 5 项全部通过，退出码 0；
    - `pnpm tauri build --no-bundle` 编译打包退出码 0；
    - 根目录单文件可执行程序 `SelfWork.exe` (5.5MB) 交付就绪。
