# 任务分解与执行清单 (Tasks)

- [x] Task 1: 开箱即用技术文档模板库 (`docTemplates.ts` & `DocTemplatePicker.tsx`)
  - [x] 1.1 编写 `src/services/docTemplates.ts`，定义四大标准工业级模板块结构
  - [x] 1.2 编写 `src/components/docs/editor/DocTemplatePicker.tsx`，设计现代暗黑毛玻璃卡片组
  - [x] 1.3 在 `BlockEditor.tsx` 空白文档状态下挂载模板选择区，点击实现块流原子注入
  - [x] 1.4 验证机检退出码 0 (`pnpm check`)

- [x] Task 2: 多栏排版布局卡片 (`MultiColumnBlock.tsx` & `/columns`)
  - [x] 2.1 在 `src/types/docs.ts` 扩展 `BlockType` 增加 `'columns'` 与 `ColumnsBlockProperties`
  - [x] 2.2 创建 `src/components/docs/editor/MultiColumnBlock.tsx`，支持 2 栏与 3 栏自由切换、响应式折叠与独立编辑
  - [x] 2.3 在 `BlockItem.tsx` 挂载 `columns` 块类型与 6 点侧柄/拖拽容器
  - [x] 2.4 在斜杠菜单与插入选项中提供 `/columns` 入口
  - [x] 2.5 验证机检退出码 0 (`pnpm check`)

- [x] Task 3: 文档历史快照与时间轴回滚 (`docHistory.ts` & `DocHistoryDrawer.tsx`)
  - [x] 3.1 编写 `src/services/docHistory.ts`，实现快照增删查与基于 LocalStorage/SQLite 的多版本管理
  - [x] 3.2 编写 `src/components/docs/editor/DocHistoryDrawer.tsx`，实现时间轴列表、版本信息、只读预览与一键恢复
  - [x] 3.3 在 `BlockEditor.tsx` 顶栏增加“历史版本”时钟入口与抽屉联动
  - [x] 3.4 验证机检退出码 0 (`pnpm check`)

- [x] Task 4: 独立 HTML 导出与高保真打印/PDF 样式 (`htmlExport.ts` & `@media print`)
  - [x] 4.1 编写 `src/services/htmlExport.ts`，生成内嵌高质感排版 CSS 的单文件独立 HTML
  - [x] 4.2 在 `src/styles/globals.css` 完善 `@media print` 样式表，隐匿所有交互控件与背景重设
  - [x] 4.3 在 `BlockEditor.tsx` 顶栏将导出按钮升级为下拉微卡片，提供 Markdown、HTML 与 打印/PDF 三大选项
  - [x] 4.4 验证机检退出码 0 (`pnpm check`)

- [x] Task 5: 单元测试、构建打包与热替换部署发布
  - [x] 5.1 运行 Rust 单元测试 `cargo test` 确保 14/14 全绿
  - [x] 5.2 运行前端机检 `pnpm check` 确保 0 警告 0 错误
  - [x] 5.3 运行 `pnpm tauri build --no-bundle` 编译新版可执行文件
  - [x] 5.4 替换 `SelfWork.exe` 并热启动验证
  - [x] 5.5 更新 `CHANGELOG.md` 并推送到 GitHub `main` 分支
