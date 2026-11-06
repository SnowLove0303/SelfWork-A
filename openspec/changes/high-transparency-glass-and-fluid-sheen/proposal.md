# Proposal: High-Transparency Crystal Glass and Fluid Sheen

## 1. Context & Motivation
根据用户审美反馈，对界面质感进行二次深度精进：
1. **高透明度晶体玻璃 (High-Transparency Crystal Glass)**：将面板底色不透明度由偏沉重的 70%~80% 调整为轻盈晶透的 25%~40% 高透区间，极大释放背景景深与通透度；
2. **灵动流光特效 (Fluid Light & Ambient Sheen)**：在背景与关键交互元素中注入优雅缓动的液态流光（Fluid Ambient Mesh & Shimmer Sweep），使玻璃材质如 Apple Liquid Glass 般流光溢彩；
3. **消除点击时文字缩放抖动 (Rock-Solid Stationary Typography on Click)**：彻底废除点击时的 `scale()` 与 `translate()` 物理位移，文字像素绝对定帧锁定，通过内切阴影深度与高透光泽变化传递清脆手感，彻底根除眩晕与晃眼感。

## 2. 1:1 需求物理对账矩阵 (Spec-Kit RTM)

| 需求编号 | 需求事实与目标定义 | 规范与实现方案 (RFC 2119) | 物理验收充要指标 [Measured] |
| :--- | :--- | :--- | :---: |
| **REQ-GLOW-01** | 高透明度晶体玻璃材质 | 侧栏、顶栏与主舞台采用高透配方（25%~40% 不透明度），结合 `backdrop-blur-xl` 增强折射通透感 | 界面通透感显著提升，能够直观看到背景流光穿透玻璃的深邃折射效果 |
| **REQ-GLOW-02** | 灵动流光流动特效 | 注入柔和优雅的流光动效（背景深冷漫射液态流光 + 激活状态灵动光流） | 界面呈现丝滑流淌的流光漫射，无突兀跳帧与光斑溢出 |
| **REQ-GLOW-03** | 彻底消除点击时文字缩放抖动 | 废除 `:active` 状态下的任何 `transform` 缩放/位移，文字像素绝对静止，点击手感通过纯光影深度表达 | 连续点击任意按钮，内部文字 100% 绝对静止，零抖动、零晃眼 |
| **REQ-GLOW-04** | 既有几何骨架与品牌资产守恒 | 严格保持 44px 绝对平齐基准线、单边框正交 T 型咬合、微软雅黑字体、流体发光 SW Logo 及免黑框 EXE 特性 | 变更后所有既有功能正常可用，无几何退化 |
