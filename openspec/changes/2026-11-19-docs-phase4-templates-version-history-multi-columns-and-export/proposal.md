# 变更提案：阶段 4 块级流转、模板库与历史版本 (P2 旗舰能力)

## 一、需求背景与目标 (Why & What)
在阶段 1 完成垂直节奏与打字机呼吸空间、阶段 2 完成图表/公式/导图/双向引用、阶段 3 完成查找替换/拖拽重排/大纲ScrollSpy/字数统计之后，文档中心已具备高度成熟的编辑与阅读体验。
根据《四大阶段演进路线》，第四阶段（Phase 4）为**块级流转与架构扩展（P2 旗舰能力）**，将 SelfWork 文档中心推向企业级专业知识工作台水准。

本期涵盖四大核心能力：
1. **REQ-4.1 开箱即用技术文档模板库 (`template:doc-templates`)**：空白文档一键呈现 4 大技术模板（RFC方案规范、Bug 5-Whys 复盘、研发周报/发布日志、知识点卡片），点击瞬时注入富文本块流；
2. **REQ-4.2 文档历史快照与时间轴版本回滚 (`history:version-timeline`)**：自动与手动保存文档历史快照（时间戳、块数、字数变化），支持右侧时间轴抽屉只读预览与一键无损回滚；
3. **REQ-4.3 多栏排版布局卡片 (`layout:multi-columns`)**：斜杠指令 `/columns` 极速插入左右双栏或三栏对比布局，支持左右独立编辑与小屏响应式优雅折叠；
4. **REQ-4.4 高保真独立 HTML 与打印/PDF 导出 (`export:print-pdf-html`)**：导出可脱机独立阅读的完整 CSS 高保真 HTML 文档，并注入专属打印媒体查询样式表，支持 `window.print()` / `Ctrl+P` 一键输出纯净 PDF。

---

## 二、双清单因果自证 (Two Lists)

### 1. 拟变范围清单 (What will change)
- `src/types/docs.ts` [Root Source]：扩展 `BlockType` 增加 `'columns'` 类型，定义 `ColumnsBlockProperties` 与 `DocSnapshot` 接口；
- `src/services/docHistory.ts` [Root Source]：新建历史快照存储与回滚服务，支持快照的保存、查询、预览与还原；
- `src/services/docTemplates.ts` [Root Source]：新建预置模板定义库，输出四大工业级模板的块模型结构；
- `src/services/htmlExport.ts` [Root Source]：新建单文件独立 HTML 高保真导出引擎；
- `src/components/docs/editor/MultiColumnBlock.tsx` [State Transition]：多栏布局块组件，支持 2 栏/3 栏并排编辑与切换；
- `src/components/docs/editor/DocTemplatePicker.tsx` [State Transition]：空白文档模板选择卡片组件；
- `src/components/docs/editor/DocHistoryDrawer.tsx` [State Transition]：右侧历史版本时间轴抽屉组件；
- `src/components/docs/editor/BlockEditor.tsx` [State Transition]：集成模板卡片、历史抽屉按钮、多栏渲染与打印/HTML导出菜单；
- `src/components/docs/editor/BlockItem.tsx` [State Transition]：接入 `'columns'` 块类型的统一侧柄与拖拽容器；
- `src/styles/globals.css` [State Transition]：追加 `@media print` 打印专属样式，隐蔽所有 UI 控件。

### 2. 保持现状承诺清单 (What will remain unchanged)
- 保持阶段 1 排版垂直节奏、大标题与正文过渡留白与底部打字机留白不变；
- 保持阶段 2 思维导图、Mermaid 图表、KaTeX 数学公式与双向引用胶囊 100% 正常；
- 保持阶段 3 全局查找替换、块级拖拽重排、目录大纲智能过滤与 ScrollSpy 导航不变；
- 保持既有 Markdown 导出与 SQLite 底层数据表兼容，绝不破坏现有存储数据。
