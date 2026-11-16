# Specs: 快速启动全局按钮设计体系与调色板收敛

## ADDED Requirements

### Requirement: REQ-UNIFY-BTN-01 按钮视觉三级主次分级与调色板收敛
系统顶栏操作区域 SHALL 实施严格的 Primary / Secondary 视觉分级。WHEN 用户进入快速启动大盘时，`+ 新建项` 按钮 SHALL 作为 Primary 按钮以科技青实体高亮呈现；`分类`、`多选启动`、`全启动`、`分屏组合` 与 `执行报文` SHALL 作为 Secondary 按钮统一使用半透明深色晶体质感，且 SHALL NOT 在静态常驻状态下使用高饱和红、绿大底色。

#### Scenario: 顶栏按钮视觉呈现
- GIVEN 用户打开快速启动大盘顶栏
- WHEN 用户审视操作按钮群
- THEN `+ 新建项` 具有最高对比度与发光质感，其余操作按钮风格统一度保持在同一暗晶体基线。

### Requirement: REQ-UNIFY-COMBO-03 分屏套件专区视觉融入暗晶体
置顶分屏专区的容器背景板与卡片内部按钮 SHALL 遵循全局暗色控制台设计规范。系统 SHALL 将分屏专区主色调从玫瑰粉红调整为深邃暗夜磨砂晶体，卡片启动按钮 SHALL 采用科技青蓝微渐变实体风格。

#### Scenario: 分屏套件卡片呈现
- GIVEN 当前分类下存在已配置的分屏组合套件
- WHEN 用户查看置顶专区
- THEN 卡片呈现暗夜晶体风格，与下方单品网格浑然一体，消除局部突兀红粉色。

### Requirement: REQ-UNIFY-GEOM-04 刚性几何尺度与基线对齐
顶栏所有操作按钮及搜索输入框 SHALL 严格锁定在 `32px (h-8)` 物理高度，且圆角 SHALL 统一为 `rounded-xl (12px)`，图文间距 SHALL 保持 `6px (gap-1.5)`。

#### Scenario: 几何对齐基线
- GIVEN 顶栏从左至右的操作按钮与搜索框
- WHEN 在任意屏幕缩放下渲染
- THEN 所有顶栏交互元素上下外边距与垂直中心线像素级对齐。
