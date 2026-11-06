# Tasks: Align Workbench Layout Boundaries

- [x] Task 1: 统一设计令牌中的基础边框线与交接线规范 [Root Source]
  - 检查并在 `src/styles/globals.css` 中精简规范 `border-border-default` 与交接线定义
  - 剔除交汇处容易产生阴影叠加重影的冗余伪类
  - 验证命令: `pnpm check` 退出码 0

- [x] Task 2: 重构 Sidebar 与 Header 水平垂直基准与单边框归属 [State Transition]
  - 严格统一 `Sidebar` 顶栏与 `Header` 的高度为 `h-11` (44px)
  - 统一底部分割线样式为 `border-b border-border-default`
  - 规范 `Sidebar` 右侧分割线为全屏主干 `border-r border-border-default`
  - 消除交界处十字交叉多余阴影与线头
  - 验证命令: `pnpm build` 退出码 0

- [x] Task 3: 优化 SlotContainer 视口与画板嵌合边界 [Consumer Sink]
  - 确保主舞台与顶栏下边缘及侧栏右边缘无缝贴合
  - 规范画板内边距与 1px 细线边框，杜绝双层边框叠加
  - 验证命令: `pnpm build` 退出码 0

- [x] Task 4: 桌面 EXE 与全端回归验证并归档 [Milestone Archive]
  - 重新编译 Release 版 `SelfWork.exe`
  - Git commit 并推送到远程仓库 `SnowLove0303/SelfWork-A`
  - 验证命令: `git status && git log -1`
