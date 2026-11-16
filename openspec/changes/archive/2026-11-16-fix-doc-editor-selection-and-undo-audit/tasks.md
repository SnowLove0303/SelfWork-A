# Tasks: 文档编辑交互全链路加固——Ctrl+Z 撤销实时生效、全量文本工具选区无损应用与深度交互审计

- [x] 1. 撤销/重做双模同步机制与聚焦状态下即时回滚治理 <!-- id: 1 -->
  - 在 `src/components/docs/editor/BlockItem.tsx` 中引入 `isLocalInputRef`，解耦本地打字输入与外部撤销重做状态同步
  - 彻底移除 `activeElement !== editorRef.current` 对撤销重做的阻断，确保在聚焦打字状态下按下 `Ctrl+Z` 屏幕文本实时回滚
  - 在 `src/components/docs/editor/BlockEditor.tsx` 中优化 Undo 快照分词策略（标点、空格与停顿分片），使撤销体验细腻平滑
  - 验证命令：`pnpm --dir "F:/App Location/SelfWork" check`

- [x] 2. 选区防失焦工具栏与全量文本排版工具无损应用 <!-- id: 2 -->
  - 在 `src/components/docs/editor/BlockContextMenu.tsx` 中为所有按钮加入 `onMouseDown={(e) => e.preventDefault()}`，彻底杜绝点击失焦与选区坍缩
  - 封装新建 `src/components/docs/editor/FloatingFormatToolbar.tsx`，实现划选文本后在选区上方自适应呈现轻量排版微光工具条
  - 全量排查加粗、斜体、下划线、删除线、行内代码与彻底清除格式，实现选区内 100% 字符完整生效
  - 优化块类型转换（Turn into），保全最新文本输入
  - 验证命令：`pnpm --dir "F:/App Location/SelfWork" check`

- [x] 3. 真实用户交互全链路测试套件与端到端场景审计 <!-- id: 3 -->
  - 升级 `scripts/docs-editor-interaction-test.mjs`，增加模拟真实用户交互全链路测试
  - 覆盖选区全量字符排版核销、混合标签清除格式、连续输入分词撤销重做与光标保全断言
  - 验证命令：`node "F:/App Location/SelfWork/scripts/docs-editor-interaction-test.mjs"`

- [x] 4. VS Code 原生差异审核、生产构建热替换与现场验证 <!-- id: 4 -->
  - 通过 `vscode-review:review_diff_in_vscode` 逐一提交代码差异供用户审核确认
  - 执行 `pnpm tauri build --no-bundle` 构建单文件生产程序并通过 `replace-and-launch.mjs` 热替换上线
  - 运行全量静态类型检查与后端 Cargo 测试，确保零告警零错误
  - 验证命令：`pnpm --dir "F:/App Location/SelfWork" check && cargo test --manifest-path "F:/App Location/SelfWork/src-tauri/Cargo.toml"`
