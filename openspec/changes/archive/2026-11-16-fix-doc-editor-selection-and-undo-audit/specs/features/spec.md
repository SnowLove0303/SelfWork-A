# Spec: 文档编辑交互全链路加固规范

## ADDED Requirements

### Requirement: REQ-DOC-UNDO-01: Ctrl+Z 撤销与 Ctrl+Y 重做全场景实时生效
系统 SHALL 支持用户在文档编辑过程中的连续撤销与重做，无论光标当前是否处于聚焦打字状态。

#### Scenario: 正在编辑的段落中按下 Ctrl+Z 撤销
- GIVEN 用户正在当前文档段落中编辑并输入了新内容
- WHEN 用户按下键盘快捷键 `Ctrl+Z` 或点击顶栏撤销按钮
- THEN 系统 SHALL 立即将当前编辑块的文本内容回滚到上一历史快照
- AND 屏幕上的可视文字 SHALL 实时发生变化，光标自动平滑保持在文本末尾
- AND 再次按下 `Ctrl+Z` SHALL 继续逐步回退直至初始空内容

#### Scenario: 按下 Ctrl+Y 或 Ctrl+Shift+Z 重做步进
- GIVEN 用户刚刚执行了一次或多次撤销操作
- WHEN 用户按下 `Ctrl+Y`、`Ctrl+Shift+Z` 或点击顶栏重做按钮
- THEN 系统 SHALL 立即重新应用撤销的历史步进，恢复被撤销的内容

### Requirement: REQ-DOC-FORMAT-02: 选中文本后排版格式全量生效无损保全
系统在用户划选文本并应用任何格式时，SHALL 确保整个选区内的所有文字 100% 完整生效，严禁部分生效或选区破坏。

#### Scenario: 划选长句并应用加粗
- GIVEN 用户在任意块中用鼠标划选了包含 10 个字符以上的整句文本
- WHEN 用户点击加粗工具按钮或按下 `Ctrl+B`
- THEN 系统 SHALL 将选区内的全部 10 个字符统一转换为加粗格式
- AND 绝不允许出现仅前几个字加粗或断裂问题
- AND 点击工具按钮的过程 SHALL NOT 窃取编辑框焦点，选区状态 SHALL 保持稳定

#### Scenario: 划选包含局部既有样式的混合文本并应用格式
- GIVEN 选区内部分文字原本已有斜体或颜色修饰
- WHEN 用户对整段选区执行加粗操作
- THEN 系统 SHALL 将选区整体包裹为加粗状态，既有内联属性平滑共存或正确覆盖

### Requirement: REQ-DOC-TOOLS-03: 全量文本工具排查与彻底清除格式
系统 SHALL 提供健全的文本工具集，包括行内排版、选区浮动工具栏、块类型转换与彻底清除格式。

#### Scenario: 彻底清除选区内的所有格式
- GIVEN 选区内包含加粗、斜体、删除线以及行内代码混合装饰
- WHEN 用户点击“清除格式”工具
- THEN 系统 SHALL 彻底移除选区内的所有 HTML 样式标签与修饰类
- AND 将选中文本恢复为纯粹的无格式文本

#### Scenario: 鼠标划选文本弹出即时浮动工具条
- GIVEN 用户在文本块中完成一段文字划选 (Selection range > 0)
- WHEN 用户释放鼠标左键 (MouseUp)
- THEN 系统 SHALL 在选区上方自适应弹出行内微光工具条
- AND 呈现加粗、斜体、下划线、删除线、行内代码与清除格式按钮
- AND 点击任意按钮 SHALL 在不失焦的前提下即刻生效

### Requirement: REQ-DOC-AUDIT-04: 基于真实用户交互视角的端到端测试审计
系统 SHALL 配备针对文本输入、连续选区、所有工具项生效与撤销重做交互路径的自动化测试套件。

#### Scenario: 自动化交互套件全链路核销
- GIVEN 运行交互测试脚本 `scripts/docs-editor-interaction-test.mjs`
- WHEN 执行针对 Undo 栈更新、选区覆盖、代码块与清除格式的端到端测试
- THEN 进程退出码 SHALL 为 0
- AND 每一个断言 SHALL 附带明确的通过证明

