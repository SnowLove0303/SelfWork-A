# 任务分解与执行清单 (Tasks)

- [x] Task 1: 折叠列表块重塑与统一管道接入 (`BlockToggle.tsx` & `/toggle`)
  - [x] 1.1 在 `src/components/docs/editor/SlashMenu.tsx` 增补 `/toggle` 菜单项与对应折叠图标
  - [x] 1.2 将 `BlockToggle.tsx` 统合接入 `BlockItem.tsx` 内部，继承 6 点抓手、拖拽高亮与 `Alt + ↑/↓` 换块监听
  - [x] 1.3 在 `BlockEditor.tsx` 中移除原本绕过 `BlockItem` 的孤立特判分支
  - [x] 1.4 验证机检退出码 0 (`pnpm check`)

- [x] Task 2: 专业代码块深度增强 (`Enhanced CodeBlock`：行号/复制/全屏)
  - [x] 2.1 在 `BlockItem.tsx` 增强代码块渲染：支持行号动态自适应计算与无干扰显示开关
  - [x] 2.2 实现一键复制代码纯文本功能，并附带 1.5 秒绿色 Check 动画反馈
  - [x] 2.3 实现代码块沉浸式全屏放大浮窗浏览与 `Esc` 快捷退出
  - [x] 2.4 扩展支持主流编程语言选择下拉菜单
  - [x] 2.5 验证机检退出码 0 (`pnpm check`)

- [x] Task 3: 音视频与多媒体外链卡片 (`MediaEmbedBlock.tsx` & `/media`)
  - [x] 3.1 在 `src/types/docs.ts` 扩展 `BlockType` 增加 `'media'`
  - [x] 3.2 编写 `src/components/docs/editor/MediaEmbedBlock.tsx`，支持直链音视频识别与暗黑毛玻璃播放器
  - [x] 3.3 在 `SlashMenu.tsx` 增补 `/media`, `/video`, `/audio` 快捷插入项
  - [x] 3.4 在 `BlockItem.tsx` 挂载 `media` 块类型渲染分支
  - [x] 3.5 验证机检退出码 0 (`pnpm check`)

- [x] Task 4: 双向同步只读引用嵌入块 (`SyncedBlock.tsx` & `syncedBlocks.ts` & `/synced`)
  - [x] 4.1 在 `src/types/docs.ts` 扩展 `BlockType` 增加 `'synced'`
  - [x] 4.2 编写 `src/services/syncedBlocks.ts` 实现全局 Sync ID 读写与全库检索
  - [x] 4.3 编写 `src/components/docs/editor/SyncedBlock.tsx`，支持晶体青色微框、Sync ID 复制与跨文档同步更新
  - [x] 4.4 在 `SlashMenu.tsx` 增补 `/synced` 快捷插入项并在 `BlockItem.tsx` 挂载渲染分支
  - [x] 4.5 验证机检退出码 0 (`pnpm check`)

- [x] Task 5: 单元测试、构建打包与热替换部署发布
  - [x] 5.1 运行 Rust 单元测试 `cargo test` 确保 14/14 全绿
  - [x] 5.2 运行前端机检 `pnpm check` 确保 0 警告 0 错误
  - [x] 5.3 运行 `pnpm tauri build --no-bundle` 编译新版二进制
  - [x] 5.4 替换 `SelfWork.exe` 并热启动验证
  - [x] 5.5 更新 `CHANGELOG.md` 并推送到 GitHub `main` 分支
