# Implementation Tasks: mindmap-basic-editor

- [x] **Task 1: 建立思维导图数据模型与 SQLite 持久化管线** `req: REQ-MIND-01, REQ-MIND-04`
  - **1.1** 创建 `src/types/mindmap.ts`，定义 `MindMapNode`、`NodeLayout`、`MindMapTree` 等核心数据契约；
  - **1.2** 在 `src/services/db.ts` 增设 `loadMindMap()` 与 `saveMindMap(root: MindMapNode)` 持久化函数，复用 SQLite `db_get_setting` / `db_set_setting` 通道，提供本地缓存秒开与持久化。
  - **验证命令**：`pnpm --dir "F:/App Location/SelfWork" check`

- [x] **Task 2: 注册主窗口思维导图模块路由与导航项** `req: REQ-MIND-02`
  - **2.1** 在 `src/types/workbench.ts` 将 `ModuleId` 扩充为 `'launcher' | 'tasks' | 'mindmap'`；
  - **2.2** 在 `src/components/Sidebar.tsx` 增设思维导图导航按钮，配置 `GitFork` 图标与深色高亮反馈；
  - **2.3** 在 `src/components/SlotContainer.tsx` 挂载 `MindMapView` 根容器。
  - **验证命令**：`pnpm --dir "F:/App Location/SelfWork" check`

- [x] **Task 3: 实现思维导图树形布局计算与 SVG 贝塞尔连线渲染** `req: REQ-MIND-01, REQ-MIND-02`
  - **3.1** 创建 `src/components/mindmap/layout.ts`，实现递归子树高度测量与水平右向坐标排版；
  - **3.2** 创建 `src/components/mindmap/MindMapCanvas.tsx`，渲染平滑三次贝塞尔连接线与 HTML 节点卡片；
  - **3.3** 支持背景鼠标拖拽平移视口与重置居中。
  - **验证命令**：`pnpm --dir "F:/App Location/SelfWork" check`

- [x] **Task 4: 实现键盘快捷键流转与节点就地编辑交互** `req: REQ-MIND-03`
  - **4.1** 在 `MindMapView` 接入全局键盘监听：`Tab` 创建子节点并自动进入编辑；`Enter` 创建兄弟节点并自动进入编辑；`Delete`/`Backspace` 删除非根节点；
  - **4.2** 支持双击或 `Space`/`F2` 进入节点原地编辑，Enter 保存，Esc 取消；
  - **4.3** 节点选中状态与视觉青蓝聚焦环高亮。
  - **验证命令**：`pnpm --dir "F:/App Location/SelfWork" check`

- [x] **Task 5: 实现极简输入/输出模态框与工具栏** `req: REQ-MIND-04, REQ-MIND-05`
  - **5.1** 创建 `src/components/mindmap/MindMapToolbar.tsx`，提供纯粹的导出、导入、居中、添加子分支/同级分支基础按钮；
  - **5.2** 创建 `src/components/mindmap/MindMapIOModal.tsx`，支持 JSON 树与 Markdown 大纲纯文本导入/导出；
  - **5.3** 严格收敛功能边界，绝不添加复杂多余控件。
  - **验证命令**：`pnpm --dir "F:/App Location/SelfWork" check`

- [x] **Task 6: 全量编译、VS Code 检阅、产物更新与变更沉淀** `req: REQ-MIND-06`
  - **6.1** 通过 `review_diff_in_vscode` 提请用户在 VS Code 原生差异视图中检阅所有代码变更；
  - **6.2** 运行 `pnpm check` 与 `cargo test` 确保零错误零警告；
  - **6.3** 运行 `pnpm tauri build --no-bundle` 全量编译发布包并同步覆盖 `SelfWork.exe`；
  - **6.4** 在 `CHANGELOG.md` 追加 `[0.1.20]` 记录，执行 Git 提交与推送。
  - **验证命令**：
    - `pnpm --dir "F:/App Location/SelfWork" check`
    - `cargo test --manifest-path "F:/App Location/SelfWork/src-tauri/Cargo.toml"`
    - `Test-Path "F:/App Location/SelfWork/SelfWork.exe"`
    - `git -C "F:/App Location/SelfWork" status`
