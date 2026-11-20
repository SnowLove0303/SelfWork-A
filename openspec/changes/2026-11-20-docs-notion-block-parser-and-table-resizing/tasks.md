# 任务分解与执行清单 (Tasks & Verification)

## 原子任务规划

- [x] **Task 1: 重构 `src/services/markdownImport.ts` 实现语义净化与安全表格解析**
  - **实现目标**：
    1. 增加 `sanitizeImportText(rawText: string)`：净化 Notion 面包屑、元数据、大纲统计、操作按钮及代码块/表格工具栏噪点；
    2. 重构表格解析：采用 `/(?<!\\)\|/` 安全切分，保护 `\|` 转义竖线，反转义单元格内容，对齐补全列数并去重重复表头；
  - **验证命令**：
    `node -e "const { parseMarkdownToBlocks } = require('./dist-test/markdownImport.js'); ..."` 或运行针对样本的自动化 Node 测试脚本，验证退出码为 0。

- [x] **Task 2: 重构 `src/components/docs/editor/TableBlock.tsx` 实现列宽拖拽与平滑横向滚动**
  - **实现目标**：
    1. 在 `block.properties` 中读写 `columnWidths: number[]`；
    2. 使用 `<colgroup>` 和 `table-fixed` 锁定列宽，添加自适应总宽度；
    3. 在表头右侧渲染交互拖拽手柄（`cursor-col-resize`），绑定 `onMouseDown`、`mousemove` 与 `mouseup` 全局监听；
    4. 增加优化的横向平滑滚动条样式（`overflow-x-auto custom-scrollbar`）；
  - **验证命令**：
    调用 `vscode-review` 审阅 Diff，运行 `pnpm check`，验证退出码为 0。

- [x] **Task 3: 在 `BlockItem.tsx` 与 `BlockEditor.tsx` 中打通智能多块粘贴接管**
  - **实现目标**：
    1. 在 `BlockEditor.tsx` 中暴露 `handleInsertBlocks(currentBlockId, newBlocks)` 方法；
    2. 在 `BlockItem.tsx` 针对普通可编辑块接管 `onPaste`：若粘贴文本含多行或 Markdown 语法，自动调用净化与解析器分裂插入多个块；
  - **验证命令**：
    调用 `vscode-review` 审阅 Diff，运行 `pnpm check`，验证退出码为 0。

- [x] **Task 4: 全局类型检查、单元测试、打包与热替换交付 (v0.1.74)**
  - **实现目标**：
    1. 运行 `pnpm check` 零警告零错误（退出码 0）；
    2. 运行 `cd src-tauri; cargo test` 14 项单元测试全绿（退出码 0）；
    3. 运行 `pnpm tauri build --no-bundle`；
    4. 杀死旧实例，拉起全新 `SelfWork.exe` 验证；
    5. 更新 `CHANGELOG.md` 并提交 git。
  - **验证命令**：
    `cargo test` 退出码 0，`pnpm check` 退出码 0。
