# Tasks: 思维导图一级页面分区管理与二级画布落地

- [x] Task 1: 扩展数据模型与本地 SQLite 持久化支持多分区多导图
  - 在 `src/types/mindmap.ts` 中新增 `MindMapPartition`、`MindMapDocument` 与 `MindMapStorageData` 类型。
  - 在 `src/services/db.ts` 中实现分区与多导图的本地加载、保存与旧数据自动平滑迁移函数。
  - 验证命令: `pnpm --dir "F:/App Location/SelfWork" check`，确保 TypeScript 类型 0 错误 0 告警。

- [x] Task 2: 独立实现一级页面分区与思维导图卡片大盘组件 (`MindMapPartitionView.tsx`)
  - 实现左侧分区管理侧栏：支持默认分区、分区切换、新建分区、重命名分区与删除分区。
  - 实现右侧主区域：顶部搜索过滤栏、网格首卡固定为 `[ + 新建导图 ]`、导图卡片列表（包含标题、更新时间、节点统计、操作菜单：重命名/移动分区/删除）。
  - 接入 VS Code 差异检阅 (`vscode-review:review_diff_in_vscode`)。
  - 验证命令: `pnpm --dir "F:/App Location/SelfWork" check`。

- [x] Task 3: 改造 `MindMapView.tsx` 根协调器与两级页面状态流转
  - 维系 `currentView: 'partitions' | 'canvas'` 与 `activeDocumentId`。
  - 默认展示 `MindMapPartitionView`；点击导图卡片或新建导图时无缝切换至 `MindMapCanvas` 并传入当前导图数据。
  - 接入 VS Code 差异检阅 (`vscode-review:review_diff_in_vscode`)。
  - 验证命令: `pnpm --dir "F:/App Location/SelfWork" check`。

- [x] Task 4: 增强二级画布 `MindMapCanvas.tsx` 接入面包屑与克制返回
  - 在画布左上角增加雅致返回导航栏：`[ ← 返回分区大盘 ]` 以及 `[分区名] / [导图标题]` 面包屑。
  - 点击返回时保存当前导图内容并平滑退回一级页面。
  - 确保画布内现有 `Tab`、`Enter`、`Delete`、`Space`、`F2` 等纯键盘交互 100% 正常工作。
  - 接入 VS Code 差异检阅 (`vscode-review:review_diff_in_vscode`)。
  - 验证命令: `pnpm --dir "F:/App Location/SelfWork" check`。

- [x] Task 5: 机械全检、二进制编译构建与端到端触觉验证
  - 运行 `pnpm --dir "F:/App Location/SelfWork" check`，必须通过 (0 errors, 0 warnings)。
  - 运行 `cargo test --manifest-path "F:/App Location/SelfWork/src-tauri/Cargo.toml"`，必须全绿通过 (5/5 pass)。
  - 运行 `pnpm --dir "F:/App Location/SelfWork" tauri build --no-bundle`，编译生成 5.6MB 原生 Windows 桌面程序 `SelfWork.exe`。
  - 验证运行无报错，提交 Git 记录并沉淀 CHANGELOG。
