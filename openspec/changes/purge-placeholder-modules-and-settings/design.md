# Design: 模块导航收敛与代码库净化方案

## 1. 架构拓扑收敛对比

### 1.1 变更前拓扑 (遗留大量未开发占位)
```
Sidebar
├── 快速启动 (launcher) [生产可用]
├── 待办清单 (tasks)    [生产可用]
├── 块级笔记 (notes)    [空白占位]
├── 思维导图 (mindmap)  [空白占位]
├── MCP 协议 (mcp)      [空白占位]
├── AI 助手  (ai)       [空白占位]
└── 设置     (settings) [半成品外观调节]
```

### 1.2 变更后拓扑 (100% 真实可用极简纯净工作台)
```
Sidebar
├── 快速启动 (launcher) ──> LauncherDashboard (集群开关 + Toolhelp 进程 + 端口探测 + 实时报文)
└── 待办清单 (tasks)    ──> TasksView (58% GTD 待办 + 42% 灵感便签 + SQLite 物理持久化)
```

## 2. 演进与重构步骤
1. **类型层收敛 (`src/types/workbench.ts`)**：
   - 将 `ModuleId` 从 7 值联合类型精简为 `'launcher' | 'tasks'`；
2. **侧栏导航层收敛 (`src/components/Sidebar.tsx`)**：
   - 过滤 `MODULES` 数组，仅保留 `launcher` 和 `tasks`；
   - 移除 `FileText`, `Network`, `Cpu`, `Bot`, `Settings` 等死代码图标导入；
3. **主舞台画板层收敛 (`src/components/SlotContainer.tsx`)**：
   - 彻底删除 `SettingsView` 导入与分支判断；
   - 彻底删除 `currentMod.name` 居中占位分支；
   - 仅保留 `activeModule === 'launcher' ? <LauncherDashboard /> : <TasksView />` 二选一极简确定性渲染；
4. **App 顶层与设置组件解耦 (`src/App.tsx`, `src/components/SettingsView.tsx`)**：
   - 移除不需要的设置更新回调穿透；
   - 将 `SettingsView.tsx` 安全归档或清理；
   - 保持全局默认暗黑磨砂玻璃与微流光背景；
5. **构建校验与端到端交付**：
   - `pnpm check` 零警告零错误；
   - `cargo test` 退出码 0；
   - 重新封包生成纯净版 `SelfWork.exe`。
