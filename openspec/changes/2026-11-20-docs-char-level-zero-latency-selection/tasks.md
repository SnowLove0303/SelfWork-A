# 任务分解与执行清单 (Tasks)

- [x] Task 1: 引入 W3C CSS Custom Highlight 样式与硬件加速通道 (`globals.css`)
  - [x] 1.1 在 `globals.css` 中声明 `::highlight(word-selection)` 样式规则
  - [x] 1.2 确保其背景透明度、文本前景色与原生暗黑主题完美融合

- [x] Task 2: 字符级精准锚定与零延迟即划即现引擎实现 (`BlockEditor.tsx`)
  - [x] 2.1 引入 `activeSelectionRangeRef` 与 `anchorCaretRef` 纯引用状态，彻底脱离 React 重复渲染循环
  - [x] 2.2 在 `mousedown` 中通过 `caretRangeFromPoint` 锁定起点字符，在 `mousemove` 中实时更新 `Highlight`
  - [x] 2.3 消除 `mousemove` 中的频繁 `setState`，使更新延迟降至 16ms 以内（120Hz 跟手）
  - [x] 2.4 实现剪贴板 `copy` 事件基于 `range.toString()` 的字符级所见即所得复制
  - [x] 2.5 清理 `BlockItem.tsx` 中已弃用的粗暴整块高亮残留
  - [x] 2.6 通过 `vscode-review` 提交代码检阅并通过 `pnpm check` 机检（退出码 0）

- [x] Task 3: 单元测试、生产构建与热替换部署发布 (v0.1.72)
  - [x] 3.1 运行 Rust 单元测试 `cargo test` 确保 14/14 全绿
  - [x] 3.2 运行生产构建 `pnpm tauri build --no-bundle`
  - [x] 3.3 替换 `SelfWork.exe` 并交互拉起前台验证
  - [x] 3.4 更新 `CHANGELOG.md` 记录 `[0.1.72]` 并推送到 GitHub `main` 分支
