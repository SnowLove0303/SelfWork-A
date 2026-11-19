# 任务分解与执行清单 (Tasks)

- [x] Task 1: 剥离卡片式外壳并将高亮精准下沉至文本流 (`BlockItem.tsx`)
  - [x] 1.1 从外层 `id={block-${block.id}}` 移除 `bg-sky-500/15 ring-1 rounded-xl` 卡片类名
  - [x] 1.2 将 `isCrossSelected` 高亮精准下沉至 `renderContent` 文本承载容器
  - [x] 1.3 拖拽划选期间设置侧边手柄 `pointer-events-none` 消除手势干扰
  - [x] 1.4 通过 `vscode-review` 提交代码差异比对
  - [x] 1.5 验证前端机检退出码 0 (`pnpm check`)

- [x] Task 2: 全局文字选区色调统一与划选手势自然度调优 (`BlockEditor.tsx` / `globals.css`)
  - [x] 2.1 确保单块原生 `::selection` 与跨块选区色调 100% 连贯贴合
  - [x] 2.2 验证大选区状态下 `Ctrl+C` 批量复制与 `Backspace` 批量删除无损保持
  - [x] 2.3 验证机检退出码 0 (`pnpm check`)

- [x] Task 3: 单元测试、构建打包与热替换部署发布 (v0.1.71)
  - [x] 3.1 运行 Rust 单元测试 `cargo test` 确保 14/14 全绿
  - [x] 3.2 运行生产构建 `pnpm tauri build --no-bundle`
  - [x] 3.3 替换 `SelfWork.exe` 并交互拉起前台验证
  - [x] 3.4 更新 `CHANGELOG.md` 记录 `[0.1.71]` 并推送到 GitHub `main` 分支
