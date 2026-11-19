# 任务分解与执行清单 (Tasks)

- [x] Task 1: 全库块级全局模糊检索引擎 (`DocGlobalSearchModal.tsx`)
  - [x] 1.1 编写 `src/components/docs/DocGlobalSearchModal.tsx` 实现跨文档跨块模糊检索弹窗
  - [x] 1.2 支持按块类型过滤（全部、代码、表格、待办、段落、标题）与关键词高亮
  - [x] 1.3 支持键盘 `↑` / `↓` 焦点穿梭与 `Enter` 键平滑直达目标页面
  - [x] 1.4 在 `DocsView.tsx` 挂载 `Ctrl+Shift+F` 全局监听与顶部搜索框联动
  - [x] 1.5 验证机检退出码 0 (`pnpm check`)

- [x] Task 2: 文档废纸篓与软删除恢复机 (`DocTrashDrawer.tsx` & `docTrash.ts`)
  - [x] 2.1 在 `src/types/docs.ts` 扩展 `DocPage` 增加 `isDeleted?: boolean; deletedAt?: number;`
  - [x] 2.2 编写 `src/services/docTrash.ts` 实现软删除、恢复、彻底粉碎与清空逻辑
  - [x] 2.3 编写 `src/components/docs/DocTrashDrawer.tsx` 侧滑抽屉与 30 天保留倒计时展示
  - [x] 2.4 在 `DocsView.tsx` 侧边栏列表过滤已软删除页面，并在侧栏底部挂载常驻废纸篓入口
  - [x] 2.5 验证机检退出码 0 (`pnpm check`)

- [x] Task 3: 文档侧栏多选批量管理 (`DocBatchManager.tsx`)
  - [x] 3.1 在 `DocsView.tsx` 增加多选模式切换开关与选中 ID 集合管理
  - [x] 3.2 编写 `src/components/docs/DocBatchManager.tsx` 底部浮动手柄工具栏
  - [x] 3.3 实现批量移动到分区、批量移入废纸篓、批量导出为 Markdown 与批量收藏
  - [x] 3.4 验证机检退出码 0 (`pnpm check`)

- [x] Task 4: 外部 Markdown 批量导入还原器 (`DocBatchImporter.tsx` & `markdownImport.ts`)
  - [x] 4.1 编写 `src/services/markdownImport.ts` 实现高保真 Markdown 行状态机解析器
  - [x] 4.2 编写 `src/components/docs/DocBatchImporter.tsx` 支持本地文件多选上传与进度解析
  - [x] 4.3 批量持久化存入当前分区并自动刷新侧栏页面列表
  - [x] 4.4 验证机检退出码 0 (`pnpm check`)

- [x] Task 5: 单元测试、构建打包与热替换部署发布
  - [x] 5.1 运行 Rust 单元测试 `cargo test` 确保 14/14 全绿
  - [x] 5.2 运行前端机检 `pnpm check` 确保 0 警告 0 错误
  - [x] 5.3 运行 `pnpm tauri build --no-bundle` 编译新版二进制 (v0.1.65)
  - [x] 5.4 替换 `SelfWork.exe` 并热启动验证
  - [x] 5.5 更新 `CHANGELOG.md` 并推送到 GitHub `main` 分支
