# 任务分解与执行清单 (Tasks)

- [x] Task 1: 全局查找与替换微工具条 (`FindReplaceBar.tsx` & `Ctrl+F` 快捷键)
  - [x] 1.1 创建 `FindReplaceBar.tsx` 独立微光组件 (暗黑磨砂玻璃胶囊设计)
  - [x] 1.2 在 `BlockEditor.tsx` 接入 `Ctrl+F` 键盘监听、全文匹配高亮与 `Enter`/`Shift+Enter` 遍历
  - [x] 1.3 接入单次替换与带 Undo 栈保护的批量全部替换
  - [x] 1.4 验证机检退出码 0 (`pnpm check`)

- [x] Task 2: 块级拖拽重排与 6 点手柄 (Block Drag & Drop Reordering)
  - [x] 2.1 在 `BlockItem.tsx` 统一抽取 `renderSideHandle` 与 `renderDropIndicator`
  - [x] 2.2 改造所有块容器 (`p`, `h1`-`h3`, `quote`, `code`, `todo`, `bullet`, `numbered`, `callout`, `divider`, `table`, `mindmap`, `math`, `image`) 挂载 HTML5 拖拽事件与落点指示线
  - [x] 2.3 在 `BlockEditor.tsx` 接入 `handleDropBlock` 数组重排逻辑与 SQLite `sortOrder` 批量持久化
  - [x] 2.4 验证机检退出码 0 (`pnpm check`)

- [x] Task 3: 实时字数、字符数与阅读时长统计微光胶囊 (`DocStatsBadge.tsx`)
  - [x] 3.1 创建 `DocStatsBadge.tsx` 计算中英文字数、字符数与 300字/分阅读时长
  - [x] 3.2 接入 `selectionchange` 选区划选即时联动提示
  - [x] 3.3 在 `BlockEditor.tsx` 右下角微光磨砂玻璃胶囊挂载
  - [x] 3.4 验证机检退出码 0 (`pnpm check`)

- [x] Task 4: 目录大纲智能层级过滤与 ScrollSpy 导航
  - [x] 4.1 在大纲顶部增加「全部」/「仅 H1」/「H1 + H2」层级过滤胶囊切换
  - [x] 4.2 正文滚动区域接入 `onScroll={handleScrollContent}` 动态计算视口阅读位置
  - [x] 4.3 在大纲条目中实时高亮当前处于视口的章节标题
  - [x] 4.4 验证机检退出码 0 (`pnpm check`)

- [x] Task 5: 单元测试、构建打包与热替换部署发布
  - [x] 5.1 运行 Rust 单元测试 `cargo test` 确保 14/14 全绿
  - [x] 5.2 运行前端机检 `pnpm check` 确保 0 警告 0 错误
  - [x] 5.3 运行 `pnpm tauri build --no-bundle` 编译新版可执行文件
  - [x] 5.4 替换 `SelfWork.exe` 并热启动验证
  - [x] 5.5 更新 `CHANGELOG.md` 并推送到 GitHub `main` 分支
