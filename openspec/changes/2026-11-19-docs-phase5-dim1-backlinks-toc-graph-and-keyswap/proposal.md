# 变更提案：阶段五（维度 1）知识网络与双向拓扑闭环 (P0 核心资产网)

## 一、需求背景与目标 (Why & What)
在完成阶段 1 至阶段 4 的排版、公式图表、查找拖拽、模板与导出闭环后，文档中心已具备高度成熟的单篇编辑体验。
然而在知识管理维度，当前的页面引用胶囊（`[[`）仅支持单向索引，缺乏被引用页面的“反向感知”，尚未建立完整的卡片盒双向拓扑网络。
同时，技术长文在正文内部缺少可交互的目录大纲块（`/toc`），且键盘流用户在微调段落顺序时缺少免鼠标的快速位移能力。

本期（维度 1）将全面落地知识网络与排版效率的闭环：
1. **REQ-D1.1 双向反向链接底栏 (`BacklinksPanel.tsx`)**：全库索引对当前页面的引用，在页面底部以微光卡片展示反向链接来源与上下文预览，点击一键穿透跳转；
2. **REQ-D1.2 正文内嵌动态目录卡片 (`TableOfContentsBlock.tsx` & `/toc`)**：支持行首 `/toc` 插入动态目录块，自动根据正文标题提取层级大纲树，支持平滑滚动与离线导出；
3. **REQ-D1.3 局部文档关联力导向图谱 (`DocLocalGraph.tsx`)**：在右侧大纲抽屉增设「关系图谱」选项卡，以中心辐射力导向图呈现当前文档的出度与入度拓扑，支持拖拽交互与双击跳转；
4. **REQ-D1.4 键盘流快速上下交换块 (`Alt + ↑/↓` Swap Blocks)**：光标在任意块中时，按下 `Alt + ArrowUp / ArrowDown` 瞬时与相邻块交换位置，保持光标与焦点连续，免去鼠标拖拽。

---

## 二、双清单因果自证 (Two Lists)

### 1. 拟变范围清单 (What will change)
- `src/types/docs.ts` [Root Source]：在 `BlockType` 扩展 `'toc'` 类型；
- `src/services/backlinks.ts` [Root Source]：新建反向链接索引服务，扫描工作区全量文档并计算引用出入度；
- `src/components/docs/editor/BacklinksPanel.tsx` [State Transition]：新建正文底部反向链接折叠面板组件；
- `src/components/docs/editor/TableOfContentsBlock.tsx` [State Transition]：新建正文内嵌动态目录块组件；
- `src/components/docs/editor/DocLocalGraph.tsx` [State Transition]：新建局部力导向图谱可视化组件；
- `src/components/docs/editor/BlockEditor.tsx` [State Transition]：接入反向链接面板、右侧图谱/大纲双选项卡切换、`handleSwapBlock` 键盘上下位移；
- `src/components/docs/editor/BlockItem.tsx` [State Transition]：接入 `blockType === 'toc'` 渲染、监听 `Alt + ↑/↓` 快捷位移；
- `src/components/docs/editor/SlashMenu.tsx` [State Transition]：追加 `/toc` 动态目录菜单项。

### 2. 保持现状承诺清单 (What will remain unchanged)
- 保持阶段 1 的垂直节奏、标题临近原则与 `pb-48` 打字机模式；
- 保持阶段 2 的思维导图、Mermaid、KaTeX 与 `[[` 页面双向引用胶囊；
- 保持阶段 3 的全局查找替换 (`Ctrl+F`)、块级 6 点拖拽抓手、大纲 ScrollSpy 与实时字数胶囊；
- 保持阶段 4 的四大技术模板库、多栏排版卡片、版本历史快照抽屉与独立 HTML/PDF 打印能力。
