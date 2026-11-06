# Change Proposal: Align Workbench Layout Boundaries and Grid Hairlines

## 1. Summary
依据用户对工作台整体布局边界与分割线对齐的明确指令，系统性重构 `App.tsx`、`Sidebar.tsx`、`Header.tsx` 与 `SlotContainer.tsx` 的边界交汇关系。建立“单边框所有权（Single-Border Ownership）”与“连续对齐网格（Continuous Grid Alignment）”，彻底根治交汇处错位、边框叠加变粗、线段不连续及多余阴影交叉杂斑问题，实现像素级自然衔接的规整桌面应用布局。

## 2. Requirements Traceability Matrix (1:1 RTM)
- REQ-L01 (几何基准对齐): 统一顶部高度为严格一致的基准（44px / h-11），水平分割线 Y 轴零落差贯穿；
- REQ-L02 (交汇处拓扑规整): 规范垂直线与水平线的交汇拓扑，消除多重 box-shadow 阴影叠加产生的光斑重影与多余线头；
- REQ-L03 (统一线宽与色阶): 全局统一为 1px 单边框标准，相邻容器绝对禁止双边框叠加；
- REQ-L04 (盒模型精准核查): 强制 `box-sizing: border-box`，排除导致 1px 偏移的边距与溢出抖动；
- REQ-L05 (严禁魔数创可贴): 100% 依赖标准 Flexbox 容器边界约束，绝不使用负 margin 或绝对定位补丁；
- REQ-L06 (美学与功能守恒): 完整保留现有深色主题、流体发光 Logo、微软雅黑字体、侧栏折叠手感与顶栏单一展开按钮。

## 3. Preserved Commitments
- 保持既有交互功能完整无损；
- 保持暗色工业质感与纯粹无废话原则。
