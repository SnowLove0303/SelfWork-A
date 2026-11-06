# Changelog - SelfWork (SW工作台)

All notable changes and architectural invariants for SelfWork will be documented in this file.

## [0.1.3] - 2026-11-06

### Added & Fixed (高透明度晶体玻璃、动态流光特效与文字定帧零抖动)
- **高透明度晶体玻璃 (High-Transparency Crystal Glass)**:
  - 侧栏与顶栏底色不透明度由 70%~80% 深度下调至轻盈晶透的 35% (`rgba(12, 16, 26, 0.35)`)，结合 `backdrop-blur-xl` (24px) 硬件加速大范围高斯模糊，空间通透感倍增。
- **灵动流光流动特效 (Fluid Ambient Sheen)**:
  - 在 `App.tsx` 全屏底层注入 GPU 硬件加速的柔和流光发生器（深冷海蓝与珠光微雾流光团，`animate-fluid-a/b`），在半透明玻璃后方平缓漫射流淌；
  - 激活项指示条注入呼吸流光光斑（`animate-sheen-pulse`），提升灵动质感。
- **彻底根除点击时文字缩放抖动 (Zero-Jitter Stationary Typography)**:
  - 彻底剔除 `.tactile-btn:active` 与 `.tactile-pill:active` 中的 `scale(0.975)` 与 `translateY(0.5px)` 物理形变；
  - 交互触觉反馈 100% 转移至纯光学深度变化（表面光影收暗 + 内凹加深 `inset 0 1px 3px rgba(0,0,0,0.6)`），文字与图标像素绝对静止，彻底消除视觉疲劳与晃眼感。
- **工程交付**:
  - 重新编译 Release 版 `SelfWork.exe` (体积 3.8MB，免黑框启动)。

## [0.1.2] - 2026-11-06

### Added & Enhanced (黑灰白半透明磨砂毛玻璃与微物理触觉质感升级)
- **黑灰白极简工业调色板 (Radical Monochrome)**:
  - 收敛主色调为深冷黑微底 (`#080b11`)、半透明深灰 (`rgba(13, 18, 28, 0.72)`) 与阶梯白，文字对比度严格达标 WCAG 2.2 AA。
- **亚克力磨砂玻璃材质 (Frosted Glass / Glassmorphism)**:
  - 侧边栏与顶部状态栏应用 `backdrop-blur-md` 结合 80% 半透明面板底色，呈现通透空气感与景深穿透；
  - 主舞台画板升级为 `backdrop-blur-xl` 悬浮亚克力实体，配合微弱环境冷光漫射，营造深邃空间层级。
- **按钮微物理触觉交互 (Tactile Button Mechanics)**:
  - 为侧栏导航按钮、折叠展开按钮及状态探测胶囊引入顶部内切高光 (`inset 0 1px 0 rgba(255, 255, 255, 0.12)`)；
  - 注入 `hover` 微光提亮与 `active:scale-[0.975]` 机械微下压反馈，手感清脆灵敏；
  - 激活项采用微透高光亚克力实体板效果 (`tactile-btn-active`)。
- **工程资产与发布**:
  - 重新编译 Release 版 `SelfWork.exe` (体积约 3.8MB，免黑框控制台启动)。

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
