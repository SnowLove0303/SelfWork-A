# Tasks: 文档中心代码块智能识别、悬浮操作胶囊栏与击键工学基建

- [x] 1. 行首 Markdown 代码语法糖识别与秒级蜕变扩展 <!-- id: 1 -->
  - 在 `src/components/docs/editor/BlockItem.tsx` 的 `handleKeyDown` 与 `handleInput` 中加入对 ```` ^```([a-zA-Z0-9_-]*)$ ```` 的正则捕获
  - 支持按下空格或回车时，瞬间将段落蜕变为 `code` 块，并将捕获的语言绑定至 `properties.language`
  - 验证命令：`pnpm --dir "F:/App Location/SelfWork" check` (PASS)

- [x] 2. 代码块右上角悬浮微光操作胶囊栏与交互构建 <!-- id: 2 -->
  - 在 `src/components/docs/editor/BlockItem.tsx` 中为 `code` 块注入右上角悬浮操作胶囊
  - 实现语言选择器（支持 Python、JS/TS、Rust、SQL、Shell、JSON 等切换）
  - 实现一键复制代码（支持变绿对勾视觉反馈）与代码换行开关（横向滚动 vs 自动折行）
  - 验证命令：`pnpm --dir "F:/App Location/SelfWork" check` (PASS)

- [x] 3. 代码块击键工学加固（Tab 缩进与空块退格回退） <!-- id: 3 -->
  - 拦截代码块内 `Tab` 键，插入 2 个空格缩进并维持光标位置，阻止浏览器焦点跳出
  - 拦截代码块内 `Backspace` 键，空块时平滑降级回退为普通段落 `p`
  - 验证命令：`pnpm --dir "F:/App Location/SelfWork" check` (PASS)

- [x] 4. 自动化交互核销测试套件构建与全维终审 <!-- id: 4 -->
  - 编写并运行专用自动化测试套件 `scripts/doc-codeblock-test.mjs`
  - 运行全量历史测试套件（文档排版、分屏吸附、生命周期脱壳）
  - 通过 `vscode-review:review_diff_in_vscode` 逐一提交代码差异供用户把控 (APPROVED)
  - 执行 `pnpm tauri build --no-bundle` 构建单文件生产程序并通过 `replace-and-launch.mjs` 热替换上线
  - 验证命令：`node "F:/App Location/SelfWork/scripts/doc-codeblock-test.mjs"` (PASS)
