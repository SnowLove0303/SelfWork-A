# Specification: 生命周期里程碑与删除物理持久化规范

## 1. 范围与术语
- 本规范定义便签（Memos）与待办事项（Tasks）的数据加载、首发播种（Seeding）、删除与清空持久化生命周期。
- 关键字 SHALL、MUST、MUST NOT、SHOULD 遵从 RFC 2119 规范。

## 2. 行为契约 (Behavioral Contracts)

### 2.1 生命周期初始化契约 (Initialization Milestone)
- **WHEN** 应用启动并调用 `loadMemos()` 时：
  - 系统 **SHALL** 首先通过 `db_get_setting("memos_initialized")` 查询生命周期初始化状态；
  - **IF** `memos_initialized` 值为 `"true"`：
    - 系统 **SHALL** 直接读取并返回 `db_get_all_memos()` 的全部结果；
    - 系统 **MUST NOT** 以便签数量为 0 或空数组为由重新注入 `INITIAL_MEMOS`；
    - 空数组 `[]` **SHALL** 被视为合法的权威数据状态并直接呈现给用户。
  - **IF** `memos_initialized` 不存在或不为 `"true"`：
    - 系统 **SHALL** 检查本地历史缓存是否有数据；
    - 若有历史数据，系统 **SHALL** 将其无损迁移至 SQLite 并将 `memos_initialized` 设为 `"true"`；
    - 若无历史数据，系统 **SHALL** 首次将 `INITIAL_MEMOS` 写入 SQLite 并将 `memos_initialized` 设为 `"true"`。

### 2.2 待办事项生命周期契约 (Tasks Initialization Milestone)
- **WHEN** 应用启动并调用 `loadTasks()` 时：
  - 系统 **SHALL** 首先通过 `db_get_setting("tasks_initialized")` 查询初始化状态；
  - **IF** `tasks_initialized` 值为 `"true"`：
    - 系统 **SHALL** 直接读取并返回 `db_get_all_tasks()` 的查询结果，即使结果为空数组；
    - 系统 **MUST NOT** 重新灌入 `INITIAL_TASKS`。
  - **IF** `tasks_initialized` 不为 `"true"`：
    - 系统 **SHALL** 执行首次迁移或播种，并将 `tasks_initialized` 持久化为 `"true"`。

### 2.3 删除操作即时提交契约 (Immediate Atomic Deletion)
- **WHEN** 用户点击删除单条便签（`handleDeleteMemo`）或单条待办（`handleDeleteTask`）时：
  - 系统 **SHALL** 立即计算排除该项后的最新集合，并在状态更新的同时直接触发底层物理落盘持久化（`saveMemos` / `saveTasks`）；
  - 系统 **MUST NOT** 仅依赖异步防抖计时器（如 300ms 延迟），以避免用户在微秒级时间内关闭窗口导致数据未落盘。

### 2.4 水合守卫与防覆写契约 (Hydration Guard)
- **WHEN** `TasksView` 挂载时：
  - 系统 **SHALL** 维持 `isHydrated = false`，直到 `loadTasks()` 与 `loadMemos()` 完全就绪；
  - 在 `isHydrated === false` 期间，系统的通用自动防抖监听器 **MUST NOT** 向数据库回写初始临时状态，避免空态或初始假数据覆写物理库中的有效数据。
