# Proposal: 文档中心排版美学与字号阶梯升级——默认字号适度放大与优先微软雅黑绑定

## 1. 需求来源与背景 (Background)
用户在文档中心撰写与查阅文档时反馈：
1. 文档默认字号偏小（当前正文为 14px，长时间阅读容易视觉疲劳），需要稍微再大一些；
2. 字体需要优先使用「微软雅黑 (Microsoft YaHei)」，保证中文字形饱满清晰、排版专业舒适。

## 2. 1:1 需求物理对账矩阵 (Requirement Traceability Matrix)

| 需求编号 | 需求名称 | 核心规范与验收目标 | 对应任务 |
| :--- | :--- | :--- | :--- |
| **REQ-DOC-FONTSIZE-01** | 文档正文与各级块级内容默认字号适度放大 | 将普通正文、列表、待办由 14px (text-sm) 提升至 16px (text-base)，标题与代码块等同比例协调放大 | Task 1 |
| **REQ-DOC-FONTFAMILY-02** | 文档编辑主区域强制优先使用微软雅黑 | 文档编辑工作区、大标题输入框与所有块级元素强制显式优先使用 `Microsoft YaHei`（微软雅黑）字体族 | Task 1 |
| **REQ-DOC-TYPO-03** | 行高、基线与垂直韵律呼吸感协同优化 | 伴随字号放大，将正文行高配置为 1.75 倍黄金阅读比例，优化待办复选框基线居中与块间距 | Task 2 |
| **REQ-DOC-AUDIT-04** | 字体与排版自动化测试审计 | 构建排版字号阶梯、字体族声明与行高垂直韵律自动化核销脚本，出具退出码 0 凭据 | Task 3 |

## 3. 拟变范围与不变量约束 (Scope & Invariants)
- **拟变范围**：
  - `src/styles/globals.css`: 注册 `.doc-typography` 专业文档排版字体类，声明优先 `Microsoft YaHei` / `微软雅黑`；
  - `src/components/docs/editor/BlockItem.tsx`: 升级 `getBlockStyle()` 中正文、各级标题、引用与代码块的字号及行高，调整待办复选框对齐基线；
  - `src/components/docs/editor/BlockEditor.tsx`: 为主标题输入框升级为 `text-3xl font-bold`，将文档正文阅读容器绑定 `.doc-typography` 字体族；
  - `scripts/doc-typography-test.mjs`: 编写排版规范自动化断言脚本。
- **保持现状承诺**：
  - 富文本加粗/斜体/下划线/删除线/代码/清除格式等编辑交互逻辑绝对保持现状；
  - 撤销/重做（Undo/Redo）历史栈与 500ms 防抖保存逻辑绝对保持现状；
  - 启动项、控制台与 SQLite 存储绝对保持现状。
