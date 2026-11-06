# Tasks: High-Transparency Crystal Glass and Fluid Sheen

- [x] Task 1: 升级高透明度设计令牌与零抖动触觉样式 (`src/styles/globals.css`) [Root Source]
  - 调整面板底色透明度至 35% 高透光区间，提升高斯模糊基准
  - 彻底剔除 `:active` 状态的 `scale` 与 `translate`，实现文字绝对零抖动
  - 定义流光关键帧动画 (`@keyframes fluidDriftA`, `@keyframes fluidDriftB`)
  - 验证命令: `pnpm check` 退出码 0

- [x] Task 2: 注入底层灵动流光发生器 (`src/App.tsx`) [State Transition]
  - 在全视口根容器后置注入两组平滑缓动的深冷流光光团
  - 确保流光在全屏平稳漂移，透过高透明度玻璃自然漫射
  - 验证命令: `pnpm build` 退出码 0

- [x] Task 3: 优化 Sidebar、Header 与 SlotContainer 高透晶体质感与激活流光 [Consumer Sink]
  - 侧栏与顶栏采用 `bg-canvas-default/35 backdrop-blur-xl`
  - 激活项指示条升级为流光微呼吸渐变光晕
  - 主舞台画板升级为高透水晶亚克力
  - 验证命令: `pnpm build` 退出码 0

- [x] Task 4: 桌面 Release EXE 编译、全端验证与 GitHub 归档 [Milestone Archive]
  - 重新编译 Release 版 `SelfWork.exe`
  - 验证文字点击绝对零晃动、流光平滑无掉帧、免黑框 EXE 体积正常
  - Git commit 并推送至远程仓库
  - 验证命令: `git status && git log -1`
