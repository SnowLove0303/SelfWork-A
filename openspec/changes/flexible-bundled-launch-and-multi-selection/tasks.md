# Tasks: 快速启动灵活多选启动与自定义持久化捆绑套件开发任务清单

- [x] Task 1: 升级前端启动器类型模型支持 Bundle 复合套件
  - 在 `src/types/launcher.ts` 扩充 `LauncherItemType` 包含 `'bundle'`；
  - 为 `LauncherItem` 增补 `bundleItemIds?: string[]` 契约；
  - 增补 `renderTypeBadge` 组合类型专属徽标与图标配置；
  - 接入 VS Code 差异检阅 (`vscode-review:review_diff_in_vscode`)；
  - 验证命令: `pnpm --dir "F:/App Location/SelfWork" check`。

- [x] Task 2: 实现大盘即时自由多选批量启动交互
  - 在 `src/components/LauncherDashboard.tsx` 引入多选状态机（`isSelectionMode`, `selectedItemIds`）；
  - 顶栏增补“多选启动”模式切换及“已选计数、全选、启动所选、退出”控制条；
  - 卡片在多选模式下展示复选控件与选中青蓝辉光，点击切换勾选；
  - 接入“启动所选项”批量调度管线并附带安全微间隔；
  - 接入 VS Code 差异检阅 (`vscode-review:review_diff_in_vscode`)；
  - 验证命令: `pnpm --dir "F:/App Location/SelfWork" check`。

- [x] Task 3: 实现持久化捆绑套件创建、编辑与一键唤醒
  - 在启动项模态框支持选择 `bundle` 类型，并渲染子项复选列表（排除自身防死循环）；
  - 大盘渲染 `bundle` 专属层叠晶体卡片与项数统计；
  - 实现点击 `bundle` 复合项时自动解析其绑定的全部子项并依次并发唤起；
  - 接入 VS Code 差异检阅 (`vscode-review:review_diff_in_vscode`)；
  - 验证命令: `pnpm --dir "F:/App Location/SelfWork" check`。

- [x] Task 4: 双端编译打包、实测启动与发布沉淀
  - 运行全量机检（`pnpm check` 零警告零错误，`cargo test` 100% 通过）；
  - 打包生成最新 `SelfWork.exe` 桌面端单文件程序；
  - 调起实测多选启动与持久化套餐启动；
  - 更新 `CHANGELOG.md` 并提交推送到 GitHub 远程仓库。
