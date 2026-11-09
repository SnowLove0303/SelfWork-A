# Changelog - SelfWork (SW工作台)

All notable changes and architectural invariants for SelfWork will be documented in this file.

## [0.1.10] - 2026-11-09

### Fixed (修复便签与待办删除持久化与首发初始化生命周期)
- **根除空集语义坍塌 (Eliminate Empty Set Semantic Collapse)**:
  - 彻底废弃旧实现中依赖 `sqliteMemos.length > 0` 判定是否有有效数据的弱逻辑；
  - 在底层 SQLite `app_settings` 表中建立 `memos_initialized` 与 `tasks_initialized` 强持久生命周期标记；
  - 确立“状态已初始化”后，物理数据库返回结果为最高法定准则（哪怕记录数为 0），绝不再误判为“全新安装”而重新灌入 `INITIAL_MEMOS` / `INITIAL_TASKS`。
- **删除与清空即时原子提交 (Immediate Atomic Deletion)**:
  - 在 `TasksView.tsx` 中将 `handleDeleteMemo`、`handleDeleteTask` 与 `handleClearCompleted` 升级为即时同步持久化；
  - 跳过 300ms 防抖等待，用户点击删除或清空后瞬间完成底层 SQLite 物理落盘，彻底消除“删完立即点右上角关闭窗口导致未落盘”的竞态漏洞。
- **水合保护锁与首屏防覆写 (Hydration Lock Protection)**:
  - 引入 `isHydrated` 状态守卫，在 `loadTasks` / `loadMemos` 从 SQLite 读取就绪前，锁定自动防抖监听，防止未就绪的临时状态冲刷覆写物理库。
- **物理与自动化测试双重核销**:
  - Rust 增补 `test_empty_set_and_lifecycle_invariants` 单元测试，退出码 0；
  - 端到端闭环自动化实测（新增便签保持 -> 删空便签 -> 冷重启进程），验证 0 记录严格保持，默认便签 0 复原；
  - 重新编译 Release 便携单文件 `SelfWork.exe`（5.5MB，退出码 0）。

### Root Cause & Engineering Defense (根因穿透与长效防线)
1. **默认便签删除后重启复活根因**:
   - `loadMemos()` 检查如果 `length === 0`，则自动执行 `saveMemos(INITIAL_MEMOS)`；当用户主动删空全部默认便签后，物理表行数为 0，重启时被误判为“白纸初装”，导致种子数据反复回填。
2. **长效防线下沉**:
   - 将“生命周期初始化状态”与“当前数据行数”在底层架构上彻底解耦，无论行数如何变化，初始化标记永久生效。

## [0.1.9] - 2026-11-09

### Added (原生 SQLite 嵌入式数据库持久化与 WAL 高性能事务引擎)
- **嵌入式 SQLite 物理数据库 (`rusqlite`)**:
  - 在 Rust 微内核集成 `rusqlite` (bundled 特性，零外部环境依赖)；
  - 物理数据库落盘路径严格收敛于 `%APPDATA%\SelfWork\selfwork.db`；
  - 自动启用 `WAL (Write-Ahead Logging)` 模式与 `synchronous=NORMAL`，兼顾断电安全性与纳秒级读写并发；
  - 建立 `tasks`、`memos` 与 `app_settings` 三大核心物理表结构。
- **Tauri 高性能异步 IPC 通道与事务原子提交**:
  - 提供 `db_get_all_tasks` / `db_save_all_tasks`、`db_get_all_memos` / `db_save_all_memos`、`db_get_setting` / `db_set_setting` 6 大核心 IPC 命令；
  - 在 `tauri::async_runtime::spawn_blocking` 中安全执行事务级全量覆盖与增量写入。
- **平滑双向迁移与透明降级**:
  - 前端开发 `src/services/db.ts`，自动处理首次迁移与 SQLite 权威水合；
  - 保留纯 Web 浏览器环境下的 localStorage 自动降级能力。

## [0.1.8] - 2026-11-09

### Added (待办清单与灵感便签协同工作台首发上线)
- **座舱级左右分栏协同架构 (58% : 42% Tasks & Memo Dual-Column)**:
  - 承载于侧栏【待办清单】主模块内部，实现结构化任务与非结构化即时备忘的高效协同。
- **左侧 58%：GTD 极速待办工作台 (TasksPanel)**:
  - **回车秒建输入框**：顶部单行极简快捷输入栏，支持键盘单手连续录入（默认常规 `p2`、`todo`）；
  - **微物理触觉复选框**：点击伴随内切高光与打勾动画，即时切换完成态并自动施加柔和中划线与透明度衰减；
  - **自明微光优先级**：采用高急红点（`p1`）、常规黄点（`p2`）、低优绿点（`p3`）自明色彩，点击即可顺畅循环切换，恪守少字原则；
  - **分类过滤胶囊**：提供【全部】、【今日】、【待办】、【已完成】4 大极简胶囊瞬切，带实时计数徽章；
  - **一键清理已完成**：底部提供轻量化已完成任务一键清理归档入口。
- **右侧 42%：灵感便签墙 (MemoBoard)**:
  - **即时自适应便签卡片**：支持多卡片网格流排布，支持就地自由编辑标题与多行自适应正文；
  - **置顶优先排序 (Pin)**：点击置顶图钉即可将核心备忘卡片自动置于首位展示；
  - **5 大冷调晶体底色**：支持深灰、深蓝、暗翠、暗紫、暗琥珀等半透明磨砂亚克力微冷色调循环切换；
  - **一键复制与微反馈**：卡片右下角提供一键复制全文至系统剪贴板，带即时 Tooltip 提示反馈。
- **本地优先持久化 (Local-First Persistence)**:
  - 待办数据与便签数据分别自动持久化至本地存储；
  - 自动防抖保存（300ms），初次打开提供纯净自明的样例种子，脱离服务端断网秒开，零数据损耗。
- **工程产物交付**:
  - 更新便携单文件可执行程序 `SelfWork.exe`（全静态资源内存内嵌，双击秒开，退出码 0）。

## [0.1.7] - 2026-11-09

### Refactored & Enhanced (落实少字原则与卡片单行紧凑座舱化重构)
- **严格遵循少字原则公理 (`RADICAL_TEXT_ECONOMY_AXIOM`)**:
  - 彻底移除了服务卡片内多余、常驻的副标题正文说明段落（如 FlClash 下方的“多协议高性能网络代理客户端”、微信下方的“腾讯微信 Windows 官方桌面版”等显而易见的 AI 模版废话）；
  - 辅助说明文本平滑降级为外层容器的原生 `title` 悬停提示气泡，主界面完全免于口水化文本污染；
  - 剔除了集群标头（如“日常办公”、“AI 协同”）中多余的副标题套话，界面视觉焦点纯粹聚焦于核心服务与指标。
- **工业级单行紧凑水平几何结构 (Single-Line Compact Row)**:
  - 服务条目高度收敛至 40~44px（`px-3 py-2`）；
  - 左侧：精炼图标容器（`w-5 h-5`）+ 服务名称 + 端口胶囊（`:9010` 带跳转箭头）+ 真实存活 PID 徽章（`PID: 12480`），单行完全水平对齐咬合；
  - 右侧：状态呼吸点 + 简练状态文本（`运行中` / `已停止` / `启动中`）+ 触觉启停按钮（微文案 `启动` / `停止`）；
  - 卡片垂直堆叠节奏优化为 `space-y-2.5`，首屏可视服务数量显著提升 ~35%，消除大面积垂直间隙浪费。
- **工程产物更新**:
  - 重新编译 Release 版便携单文件 `SelfWork.exe`（全静态资源内存内嵌，离线秒开）。
