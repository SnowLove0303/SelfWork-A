# Changelog - SelfWork (SW工作台)

All notable changes and architectural invariants for SelfWork will be documented in this file.

## [0.1.1] - 2026-11-06

### Fixed & Optimized (布局边界与分割线无缝咬合重构)
- **边框所有权公理 (Single-Border Ownership)**:
  - 侧边栏垂直右边框作为主干贯穿全屏 (`border-r border-border-default`)，右侧容器不再重复设置左边框，彻底杜绝相邻模块边框叠加导致的 2px 粗线问题。
- **水平基准线绝对平齐 (Y=44px)**:
  - 侧边栏 Brand 区域高度与顶部状态栏 Header 高度严格锁定为 `h-11` (44px) 并添加 `box-border`，底部分割线统一采用 `border-b border-border-default`，形成由左向右绝对水平贯通的连续基准线。
- **消除十字交汇处阴影光斑与断裂**:
  - 从 `globals.css` 中彻底剔除旧的 `.chiseled-border-r` / `.chiseled-border-b` 中基于 `box-shadow` 的外部投影线，统一使用纯净 1px 细线 `border-border-default` (`rgba(255, 255, 255, 0.08)`)，直角 T 型相交处再无交叉重叠光斑与线头。
- **主舞台无缝嵌合**:
  - `SlotContainer` 主舞台容器直接紧贴顶部 Header 底边与左侧 Sidebar 右边，内部画板边框规范为精准 1px 细线。
- **构建与发布**:
  - 重新编译 Release 版免控制台黑框可执行程序 `SelfWork.exe` (体积约 3.8MB)。

### Root Cause & Engineering Defense (根因与长效工程防线)
1. **交汇点光斑叠加根因**: 旧实现使用了 `box-shadow: 1px 0 0 0 ...` 来模拟边缘切削，在横竖两条线交界处产生阴影重叠加倍光晕。
   - *防御措施*: 确立单发色 1px 边框规范，禁用伪类投影模拟主结构边框。
2. **像素级错位根因**: 原顶栏和侧栏未显式声明 `box-border`，且内联样式与工具类混合。
   - *防御措施*: 统一使用 Tailwind 标准盒模型，禁止通过负 margin 或绝对定位做视觉创可贴。
