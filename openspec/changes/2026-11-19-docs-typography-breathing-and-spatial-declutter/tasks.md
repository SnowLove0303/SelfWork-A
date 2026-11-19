# 任务分解与执行清单 (Tasks)

- [x] Task 1: 块级垂直外边距与黄金排版呼吸节奏解冻 (`BlockEditor.tsx` & `BlockItem.tsx`)
  - [x] 1.1 移除 `BlockEditor.tsx` 块流容器中的 `space-y-0.5` 类，彻底解冻垂直 margin
  - [x] 1.2 优化 `BlockItem.tsx` 中各块类型的垂直边距 `getBlockMarginClass` 与段落行高
  - [x] 1.3 确保 Callout 提示框等特殊块同样遵循独立外边距
  - [x] 1.4 验证机检退出码 0 (`pnpm check`)

- [x] Task 2: 编辑器水平空间舒展与大纲栏智能收展 (`BlockEditor.tsx`)
  - [x] 2.1 支持 `showOutline` 状态持久化于 `selfwork_doc_outline_visible`
  - [x] 2.2 大纲栏收起时自适应扩展正文编辑区最大宽度 (`max-w-4xl xl:max-w-5xl`)
  - [x] 2.3 优化收起时编辑区顶栏常驻极简微光大纲指示胶囊
  - [x] 2.4 优化展开时大纲栏为紧凑无侵入的 `w-52`
  - [x] 2.5 验证机检退出码 0 (`pnpm check`)

- [x] Task 3: 划选浮动格式工具条防遮挡与层级收敛 (`BlockItem.tsx` & `FloatingFormatToolbar.tsx`)
  - [x] 3.1 消除划选时与右键菜单的事件重叠
  - [x] 3.2 优化浮动工具条在选区上方的安全边距，避免遮挡被选文本与下方代码
  - [x] 3.3 验证机检退出码 0 (`pnpm check`)

- [x] Task 4: 单元测试、构建打包与热替换部署发布
  - [x] 4.1 运行 Rust 单元测试 `cargo test` 确保 14/14 全绿
  - [x] 4.2 运行前端机检 `pnpm check` 确保 0 警告 0 错误
  - [x] 4.3 运行 `pnpm tauri build --no-bundle` 编译新版二进制 (v0.1.66)
  - [x] 4.4 替换 `SelfWork.exe` 并热启动验证
  - [x] 4.5 更新 `CHANGELOG.md` 并推送到 GitHub `main` 分支
