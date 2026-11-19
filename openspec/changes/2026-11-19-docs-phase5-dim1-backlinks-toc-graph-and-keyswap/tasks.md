# 任务分解与执行清单 (Tasks)

- [x] Task 1: 键盘流快速上下交换块 (`keyboard:swap-blocks` & `Alt + ↑/↓`)
  - [x] 1.1 在 `BlockEditor.tsx` 实现 `handleSwapBlock(blockId, 'up' | 'down')` 数组原子对调与 `sortOrder` 更新
  - [x] 1.2 在 `BlockItem.tsx` 键盘事件中监听 `Alt + ArrowUp / ArrowDown`，拦截默认行为并触发交换
  - [x] 1.3 确保位移后焦点保持在当前块并压入 Undo 栈
  - [x] 1.4 验证机检退出码 0 (`pnpm check`)

- [x] Task 2: 正文内嵌动态目录卡片 (`TableOfContentsBlock.tsx` & `/toc`)
  - [x] 2.1 在 `src/types/docs.ts` 扩展 `BlockType` 增加 `'toc'` 类型
  - [x] 2.2 编写 `src/components/docs/editor/TableOfContentsBlock.tsx` 动态提取 H1/H2/H3 目录树
  - [x] 2.3 在 `BlockItem.tsx` 挂载 `toc` 渲染分支与 6 点侧柄
  - [x] 2.4 在 `SlashMenu.tsx` 增补 `/toc` 菜单项与图标
  - [x] 2.5 验证机检退出码 0 (`pnpm check`)

- [x] Task 3: 双向反向链接底栏 (`backlinks.ts` & `BacklinksPanel.tsx`)
  - [x] 3.1 编写 `src/services/backlinks.ts`，实现全库页面块反向链接扫描与上下文提取
  - [x] 3.2 编写 `src/components/docs/editor/BacklinksPanel.tsx`，设计微光折叠引用卡片
  - [x] 3.3 在 `BlockEditor.tsx` 正文底端挂载反向链接面板并支持跨文档点击跳转
  - [x] 3.4 验证机检退出码 0 (`pnpm check`)

- [x] Task 4: 局部文档关联力导向图谱 (`DocLocalGraph.tsx`)
  - [x] 4.1 编写 `src/components/docs/editor/DocLocalGraph.tsx`，基于轻量 SVG 与弹簧物理学实现力导向关系图
  - [x] 4.2 在 `BlockEditor.tsx` 右侧大纲栏顶部增加「大纲 (TOC)」与「图谱 (Graph)」选项卡切换
  - [x] 4.3 支持节点物理拖拽、高亮辐射与双击穿透跳转
  - [x] 4.4 验证机检退出码 0 (`pnpm check`)

- [x] Task 5: 单元测试、构建打包与热替换部署发布
  - [x] 5.1 运行 Rust 单元测试 `cargo test` 确保 14/14 全绿
  - [x] 5.2 运行前端机检 `pnpm check` 确保 0 警告 0 错误
  - [x] 5.3 运行 `pnpm tauri build --no-bundle` 编译新版可执行文件
  - [x] 5.4 替换 `SelfWork.exe` 并热启动验证
  - [x] 5.5 更新 `CHANGELOG.md` 并推送到 GitHub `main` 分支
