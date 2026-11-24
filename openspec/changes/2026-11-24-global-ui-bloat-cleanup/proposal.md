# Proposal: 全工作台各功能模块非必要说明全面去噪

## 1. 原始需求与事实指纹
> 无用的说明太多了，重点去排下各个功能模块，找无用的说明，通通去掉

## 2. 1:1 需求物理对账矩阵 (RTM)

| 需求编号 | 需求描述 | 因果定位 | 对应任务 |
|---|---|---|---|
| **REQ-CLEAN-01** | 清理全进程状态清单冗余路径、分类标签与分组长引导语 | `ProcessManifestModal.tsx` | Task 1 |
| **REQ-CLEAN-02** | 清理快速启动模块及弹窗中的冗余副标题与操作说明 | `LauncherDashboard.tsx` | Task 2 |
| **REQ-CLEAN-03** | 清理文档编辑器、同步块、图谱、批注、废纸篓与多维表格冗余说明 | `docs/` 目录下 7 个组件 | Task 3 |
| **REQ-CLEAN-04** | 清理思维导图与待办/便签冗余提示文案 | `mindmap/` 与 `tasks/` | Task 4 |

## 3. 法定双清单

### 3.1 拟变范围清单
- `src/components/launcher/ProcessManifestModal.tsx`
- `src/components/LauncherDashboard.tsx`
- `src/components/docs/editor/DocTemplatePicker.tsx`
- `src/components/docs/editor/SyncedBlock.tsx`
- `src/components/docs/editor/BlockItem.tsx`
- `src/components/docs/editor/DocLocalGraph.tsx`
- `src/components/docs/editor/DocCommentDrawer.tsx`
- `src/components/docs/DocTrashDrawer.tsx`
- `src/components/docs/database/TableDatabaseView.tsx`
- `src/components/mindmap/MindMapPartitionView.tsx`

### 3.2 保持现状承诺清单
- 100% 保持各模块所有交互功能、快捷键、状态管理与持久化逻辑不变；
- 100% 保持 `src-tauri/` 后端逻辑不变。
