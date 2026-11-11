# Tasks: 思维导图管理增加回收站

- [x] Task 1: 升级数据类型定义与 `MindMapView.tsx` 核心状态机生命周期
  - 在 `src/types/mindmap.ts` 扩展 `MindMapDocument` 增补 `isDeleted?: boolean` 与 `deletedAt?: number`。
  - 在 `MindMapView.tsx` 实现软删除 (`onSoftDelete`)、恢复 (`onRestore`)、彻底物理删除 (`onPermanentDelete`) 与全量清空 (`onEmptyRecycleBin`)。
  - 接入 VS Code 差异检阅 (`vscode-review:review_diff_in_vscode`)。
  - 验证命令: `pnpm --dir "F:/App Location/SelfWork" check`。

- [x] Task 2: 落地 `MindMapPartitionView.tsx` 侧栏回收站入口与专属卡片大盘视图
  - 左侧侧栏底部构建独立的“回收站”入口与动态数量徽标。
  - 右侧大盘构建回收站专属视图：标题、一键清空按键、废弃卡片属性（原所属分区、删除时间）、单篇恢复与彻底删除按键及空状态。
  - 接入 VS Code 差异检阅 (`vscode-review:review_diff_in_vscode`)。
  - 验证命令: `pnpm --dir "F:/App Location/SelfWork" check`。

- [x] Task 3: 机械全检、编译打包与端到端回收站生命周期验证
  - 运行 `pnpm --dir "F:/App Location/SelfWork" check` (0 errors, 0 warnings)。
  - 运行 `cargo test --manifest-path "F:/App Location/SelfWork/src-tauri/Cargo.toml"` (5/5 pass)。
  - 编译最新桌面单文件 `SelfWork.exe` 并启动测试删除、恢复、清空全链路。
  - 沉淀 `CHANGELOG.md`，执行 Git 提交与远程推送。
