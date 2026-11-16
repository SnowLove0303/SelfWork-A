# Proposal: 文档编辑交互全链路加固——Ctrl+Z 撤销实时生效、全量文本工具选区无损应用与深度交互审计

## 1. 需求来源与背景 (Background)
用户在实际使用文档中心编辑功能时反馈：
1. `Ctrl+Z` 撤销修改依然失效，在编辑状态下按下快捷键屏幕内容毫无变化；
2. 文本工具存在选区应用缺陷，划选一段文本后点击文本工具，仅有部分文本生效或选区坍塌；
3. 需要对系统内所有文本工具进行全面排查优化，并建立以真实用户交互视角为核心的测试审计链。

## 2. 1:1 需求物理对账矩阵 (Requirement Traceability Matrix)

| 需求编号 | 需求名称 | 核心规范与验收目标 | 对应任务 |
| :--- | :--- | :--- | :--- |
| **REQ-DOC-UNDO-01** | Ctrl+Z/Ctrl+Y 撤销重做实时生效 | 根治输入与编辑聚焦时 DOM 内容不响应 Undo 的问题，确保无论光标处于何种状态，`Ctrl+Z` 与 `Ctrl+Y` 均能实时在屏幕上回退与前进 | Task 1 |
| **REQ-DOC-FORMAT-02** | 选中文本后工具应用全覆盖 | 消除点击工具按钮引起的失焦与选区坍塌，确保任意划选文本在应用格式时 100% 完整生效，零截断、零漏改 | Task 2 |
| **REQ-DOC-TOOLS-03** | 全量文本工具排查优化与选区浮动工具栏 | 排查加粗、斜体、下划线、删除线、行内代码、彻底清除格式、块类型转换等所有文本工具，提供选区浮动工具条与防失焦保护 | Task 2 |
| **REQ-DOC-AUDIT-04** | 基于真实用户交互路径的深度审计 | 构建涵盖真实按键、选区划选、多工具覆盖、连续撤销与重做的端到端交互测试套件，出具真实运行退出码 0 凭据 | Task 3 |

## 3. 拟变范围与不变量约束 (Scope & Invariants)
- **拟变范围**：
  - `src/components/docs/editor/BlockEditor.tsx`: 优化撤销栈压栈策略与全局按键分发，处理聚焦状态下状态下发与防抖同步；
  - `src/components/docs/editor/BlockItem.tsx`: 消除 `document.activeElement !== editorRef.current` 对撤销重做的阻断，通过本地输入标记区分外部更新与打字，实现选区防失焦与全量格式应用；
  - `src/components/docs/editor/BlockContextMenu.tsx`: 按钮全量增加 `onMouseDown={(e) => e.preventDefault()}`，彻底杜绝选区塌缩；
  - `src/components/docs/editor/FloatingFormatToolbar.tsx` (新增): 鼠标划选文本后在选区上方自适应呈现的即时排版微光工具条；
  - `scripts/docs-editor-interaction-test.mjs`: 扩展真实交互自动化测试套件。
- **保持现状承诺**：
  - SQLite 底层数据库与存储层结构完全保持现状；
  - 页面树形结构（分项目录、文档树）、侧边抽屉与多维表格完全保持现状；
  - 启动项与控制台大盘逻辑保持现状。
