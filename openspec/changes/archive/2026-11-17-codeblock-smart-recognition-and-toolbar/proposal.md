# Proposal: 文档中心代码块智能识别、悬浮操作胶囊栏与击键工学基建

## 1. 业务背景与问题痛点 (Problem Statement)
当前 SW工作台文档中心在编写技术笔记与代码时，代码块存在以下体验割裂与功能缺失：
1. **输入触发繁琐**：不支持业界标准 Markdown 行首 ```` ```<lang> ```` 快捷语法糖，用户必须依赖斜杠命令 `/` 翻找或手动转换；
2. **缺乏语言属性与操作工具栏**：代码块无右上角悬浮操作胶囊，无法指定或切换编程语言（如 Python、JavaScript、Rust 等），缺乏一键复制代码与横向滚动/自动换行切换能力；
3. **缺少专业击键工学保护**：在代码块内按 `Tab` 键会导致焦点失控跳出到页面外部按钮，破坏连续敲击心流；缺乏空块平滑回退段落机制。

参考 Notion 线上 Python 知识库与 GitHub 顶级开源文档项目（Obsidian、Logseq、AFFiNE）的标准设计，本提案确立第一阶段代码块基建：实现行首 ```` ```<lang> ```` 秒级蜕变、右上角悬浮微光操作胶囊栏与击键工学保护。

## 2. 1:1 需求物理对账矩阵 (Requirements Traceability Matrix)

| 需求 ID | 需求名称 | 对应 Spec-Kit 条目 | 验证指标 |
| :--- | :--- | :--- | :--- |
| **REQ-CODEBLOCK-TRIGGER-01** | Markdown 行首 ```` ```<lang> ```` 语法糖秒级蜕变与语言绑定 | 条目 1：行首语法糖识别与语言预设 | 输入 ```` ```python ```` + 空格/回车瞬间转为 Python 代码块 |
| **REQ-CODEBLOCK-TOOLBAR-02** | 代码块右上角悬浮微光操作胶囊栏 | 条目 2：语言切换、一键复制与换行切换 | 悬停浮现胶囊，一键复制变绿勾，支持语言切换与换行控制 |
| **REQ-CODEBLOCK-ERGONOMICS-03** | 代码块击键工学与编辑隔离保护 | 条目 3：Tab 缩进与换行保护 | Tab 键插入空格不跳焦，Enter 块内换行，空块退格平滑回退段落 |
| **REQ-CODEBLOCK-VERIFY-04** | 端到端自动化测试与全量功能零退化 | 条目 4：自动化测试与零退化 | 专用测试套件全绿，既有排版、分屏与快速启动 100% 正常 |

## 3. 核心方案与架构变更 (Proposed Changes)
1. **行首语法糖拦截扩展 (`BlockItem.tsx`)**：
   - 在 `handleKeyDown` 与 `handleInput` 中加入对 ```` ^```([a-zA-Z0-9_-]*)$ ```` 的正则捕获；
   - 在段落内敲击空格或回车时，瞬间清空文本并派发 `code` 块，将捕获的语言标识（如 `python`、`js` 等）注入 `properties.language`。
2. **构建右上角悬浮微光胶囊栏 (`BlockItem.tsx` / `CodeBlockHeader.tsx`)**：
   - 鼠标悬停（Hover）或处于编辑态时呈现：
     - **语言徽章与切换下拉**：展示当前语言，内置主流编程语言列表（Python, JS/TS, Rust, Go, SQL, Bash, HTML, CSS, JSON 等）；
     - **一键复制代码按钮**：点击提取纯文本写入剪贴板，呈现高辨识度变绿反馈；
     - **代码换行开关**：一键切换 `whitespace-pre overflow-x-auto` 与 `whitespace-pre-wrap break-words`。
3. **击键工学与缩进调度**：
   - 拦截 `Tab` 键注入空格缩进；
   - 隔离 `Enter` 保证单块内多行编辑；空块按 `Backspace` 降级为段落 `p`。
