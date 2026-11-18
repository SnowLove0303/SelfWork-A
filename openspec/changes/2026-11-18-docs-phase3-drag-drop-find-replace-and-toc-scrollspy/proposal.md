# 变更提案：阶段 3 写作交互与生产力增强 (P1.5 效率跃升与自由排版)

## 一、需求背景与目标 (Why & What)
在阶段 1 完成正文与大标题呼吸节奏重塑、阶段 2 完成思维导图/Mermaid/KaTeX/双向页面引用之后，根据四大阶段演进路线，进入**阶段 3：写作交互与生产力增强**。
核心目标包括：
1. **REQ-3.1 全局查找与替换 (`Ctrl+F`)**：实时高亮、上一个/下一个遍历、区分大小写匹配、单次替换与带 Undo 栈的全部替换；
2. **REQ-3.2 块级拖拽重排与 6 点手柄 (Block Drag & Drop)**：悬停显示 6 点抓手手柄，拖拽时目标块展示蓝色落点指示线，释放后重排 `sortOrder` 并持久化到 SQLite；
3. **REQ-3.3 实时字数、字符数与阅读时长统计 (DocStatsBadge)**：常驻右下角微光磨砂玻璃胶囊，计算中英文字数、字符数、预计阅读时长，划选选区即时联动显示；
4. **REQ-3.4 目录大纲智能层级过滤与 ScrollSpy 导航**：按全部 / 仅 H1 / H1 + H2 快速过滤，监听正文滚动并高亮当前阅读位置的章节标题。

## 二、双清单因果自证
### 1. 拟变范围清单
- `src/components/docs/editor/FindReplaceBar.tsx` (新组件)
- `src/components/docs/editor/DocStatsBadge.tsx` (新组件)
- `src/components/docs/editor/BlockEditor.tsx` (集成查找替换、拖拽重排、ScrollSpy 与统计)
- `src/components/docs/editor/BlockItem.tsx` (统一 6 点侧柄与拖拽事件/落点线)

### 2. 保持现状承诺清单
- 保持阶段 1 排版垂直节奏、大标题与正文呼吸过渡间距；
- 保持阶段 2 思维导图、Mermaid、KaTeX 与双向页面引用胶囊；
- 保持 SQLite 数据表结构与本地离线持久化机制不变。
