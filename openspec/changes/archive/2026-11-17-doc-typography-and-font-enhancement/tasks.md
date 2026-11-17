# Tasks: 文档中心排版美学与字号阶梯升级——默认字号适度放大与优先微软雅黑绑定

- [x] 1. 字体族优先绑定微软雅黑与全局字号阶梯放大 <!-- id: 1 -->
  - 在 `src/styles/globals.css` 中注入 `.doc-typography`，优先锁定 `Microsoft YaHei`（微软雅黑）
  - 在 `src/components/docs/editor/BlockEditor.tsx` 中为文档主编辑区域赋予 `.doc-typography`，并将主标题升级为 `text-3xl font-bold`
  - 在 `src/components/docs/editor/BlockItem.tsx` 中升级 `getBlockStyle()`，正文/列表/待办提升为 `text-base` (16px)，H1/H2/H3 升级为 28px/22px/18px，代码块提升为 `text-sm`
  - 验证命令：`pnpm --dir "F:/App Location/SelfWork" check` (PASS)

- [x] 2. 行高比例、前缀符号垂直基线与段落间距协同优化 <!-- id: 2 -->
  - 在 `BlockItem.tsx` 中优化待办复选框、无序列表圆点与引用左竖线的基线对齐
  - 微调块级间距（`py-1 my-0.5`），确保大字号下文字舒展不拥挤
  - 调整底部添加段落提示文字为 `text-sm`
  - 验证命令：`pnpm --dir "F:/App Location/SelfWork" check` (PASS)

- [x] 3. 字体与排版自动化测试套件构建与全维核销 <!-- id: 3 -->
  - 编写并运行 `scripts/doc-typography-test.mjs`
  - 断言正文字号达到 16px、标题阶梯递增、字体族首项命中微软雅黑及行高比例
  - 运行历史全量交互测试，确保撤销重做与排版功能零破坏
  - 验证命令：`node "F:/App Location/SelfWork/scripts/doc-typography-test.mjs"` (PASS)

- [-] 4. VS Code 原生差异审核、生产构建热替换与现场验证 <!-- id: 4 -->
  - 通过 `vscode-review:review_diff_in_vscode` 逐一提交代码差异供用户审核确认 (APPROVED)
  - 执行 `pnpm tauri build --no-bundle` 构建单文件生产程序并通过 `replace-and-launch.mjs` 热替换上线
  - 验证命令：`pnpm --dir "F:/App Location/SelfWork" check && cargo test --manifest-path "F:/App Location/SelfWork/src-tauri/Cargo.toml"`
