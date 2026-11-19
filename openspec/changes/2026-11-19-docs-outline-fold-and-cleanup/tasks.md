# 任务分解与执行清单 (Tasks)

- [x] Task 1: 移除编辑区冗余大纲展开按钮并完善顶栏双向 Toggle (`BlockEditor.tsx`)
  - [x] 1.1 彻底移除正文主容器右侧悬浮的大纲胶囊按钮 (`absolute right-4 top-4 z-20`)
  - [x] 1.2 改造顶栏右侧「目录大纲」按钮为常驻双向切换（展开时高亮激活，点击收起；收起时正常状态，点击展开）
  - [x] 1.3 验证机检退出码 0 (`pnpm check`)

- [x] Task 2: 实现目录父子级标题折叠系统与树状导航交互 (`BlockEditor.tsx`)
  - [x] 2.1 引入 `collapsedHeadingIds` 状态，实现线性标题序列父子归属与可见性状态机解析
  - [x] 2.2 为拥有子标题的父节点渲染折叠微箭头按钮，实现点击折叠与正文滚动解耦
  - [x] 2.3 在大纲顶栏增加一键「全部折叠/展开」便捷微按钮
  - [x] 2.4 确保折叠状态与「全部/仅H1/H1+H2」过滤器正交兼容
  - [x] 2.5 验证机检退出码 0 (`pnpm check`)

- [x] Task 3: 单元测试、构建打包与热替换部署发布
  - [x] 3.1 运行 Rust 单元测试 `cargo test` 确保 14/14 全绿
  - [x] 3.2 运行前端机检 `pnpm check` 确保 0 警告 0 错误
  - [x] 3.3 运行 `pnpm tauri build --no-bundle` 编译新版二进制 (v0.1.67)
  - [x] 3.4 替换 `SelfWork.exe` 并热启动验证
  - [x] 3.5 更新 `CHANGELOG.md` 并推送到 GitHub `main` 分支
