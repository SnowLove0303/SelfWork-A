# 任务分解与执行清单 (Tasks)

- [x] Task 1: 划选即时浮动工具条深度补全 (`FloatingFormatToolbar.tsx` 增强)
  - [x] 1.1 优化 `HIGHLIGHT_COLORS` 为 5 色柔和微光荧光色系并支持选区着色
  - [x] 1.2 增强行内代码与清除格式一键按钮
  - [x] 1.3 在浮动工具条增加「💬 添加批注」按钮与回调契约
  - [x] 1.4 验证机检退出码 0 (`pnpm check`)

- [x] Task 2: 行内划词批注与文档评论流 (`DocCommentDrawer.tsx` & `docComments.ts`)
  - [x] 2.1 在 `src/types/docs.ts` 定义 `DocComment` 与 `DocCommentReply` 接口
  - [x] 2.2 编写 `src/services/docComments.ts` 实现本地批注 CRUD 与状态持久化
  - [x] 2.3 编写 `src/components/docs/editor/DocCommentDrawer.tsx` 侧滑抽屉与卡片流
  - [x] 2.4 在 `BlockEditor.tsx` 挂载批注抽屉与顶栏微光小红点徽标
  - [x] 2.5 验证机检退出码 0 (`pnpm check`)

- [x] Task 3: 全局折叠块一键展开与收起 (`DocFoldControl` 全文展开/收拢)
  - [x] 3.1 在 `BlockEditor.tsx` 实现 `handleToggleFoldAll(isOpen: boolean)` 批量更新逻辑
  - [x] 3.2 当存在折叠块时，在顶栏或目录大纲顶部动态呈现「展开全部 / 收起全部」控制胶囊
  - [x] 3.3 验证机检退出码 0 (`pnpm check`)

- [x] Task 4: 细粒度阅读指标与字数透视卡片 (`DocStatsBadge.tsx` 升级)
  - [x] 4.1 在 `DocStatsBadge.tsx` 扩展多维指标计算（中英、代码行、多媒体块数、预估默读/朗读时长）
  - [x] 4.2 实现点击微光胶囊弹出全景透视卡片与 `Esc` 退出
  - [x] 4.3 验证机检退出码 0 (`pnpm check`)

- [x] Task 5: 单元测试、构建打包与热替换部署发布
  - [x] 5.1 运行 Rust 单元测试 `cargo test` 确保 14/14 全绿
  - [x] 5.2 运行前端机检 `pnpm check` 确保 0 警告 0 错误
  - [x] 5.3 运行 `pnpm tauri build --no-bundle` 编译新版二进制
  - [x] 5.4 替换 `SelfWork.exe` 并热启动验证
  - [x] 5.5 更新 `CHANGELOG.md` 并推送到 GitHub `main` 分支
