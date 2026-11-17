## ADDED Requirements

### Requirement: REQ-CODEBLOCK-TRIGGER-01: 行首快捷语法糖秒级识别与语言预设
系统在编辑普通段落块时，SHALL 支持识别行首以三个连续反引号开头的代码语法糖（如 ```` ```python ````、```` ``` ````），并在用户敲击空格键或回车键时即刻将其蜕变为代码块。

#### Scenario: 输入 ```python 加空格或回车蜕变 Python 代码块
- GIVEN 焦点位于普通段落块（p）且内容为 ```` ```python ````
- WHEN 用户按下空格键（Space）或回车键（Enter）
- THEN 系统 SHALL 阻止默认换行或空格插入
- AND 当前块的类型 SHALL 即刻变更为 `code`
- AND 当前块的 properties.language SHALL 自动预设为 `python`
- AND 编辑器内容 SHALL 清空并保持焦点在代码块内

#### Scenario: 输入 ``` 加回车生成默认代码块
- GIVEN 焦点位于普通段落块（p）且内容为 ```` ``` ````
- WHEN 用户按下回车键（Enter）
- THEN 当前块 SHALL 转换为 `code` 块，默认语言为 `plaintext`

### Requirement: REQ-CODEBLOCK-TOOLBAR-02: 代码块右上角悬浮微光操作胶囊栏
系统在代码块上方或聚焦时，SHALL 呈现右上角操作胶囊栏，提供语言选择切换、一键复制代码与代码换行开关。

#### Scenario: 悬浮显隐与复制代码
- GIVEN 文档中存在代码块并包含若干行代码
- WHEN 鼠标悬停在代码块区域或光标在代码块内聚焦
- THEN 右上角 SHALL 浮现暗色玻璃态微光操作胶囊栏
- AND 点击一键复制按钮时，系统 SHALL 提取纯文本写入剪贴板，并将按钮切换为绿色对勾图标给予视觉反馈

#### Scenario: 切换代码语言与换行模式
- GIVEN 用户打开代码块操作栏
- WHEN 用户点击语言徽章并选择新的编程语言（如 Rust）
- THEN 代码块的 properties.language SHALL 更新为选定语言并显示于界面
- WHEN 用户点击代码换行切换按钮
- THEN 代码容器的排版模式 SHALL 在横向水平滚动与自动折行之间无缝切换

### Requirement: REQ-CODEBLOCK-ERGONOMICS-03: 代码块击键工学与编辑隔离保护
系统在代码块内部编辑时，SHALL 提供专属键盘工学支持，隔离 Tab 键与回车键。

#### Scenario: Tab 键插入空格缩进
- GIVEN 焦点处于代码块内
- WHEN 用户按下 Tab 键
- THEN 系统 SHALL 阻止焦点跳离当前编辑器
- AND 在光标当前位置 SHALL 插入 2 个空格字符

#### Scenario: 回车多行换行与空块退格回退
- GIVEN 焦点处于代码块内
- WHEN 用户按下 Enter 键
- THEN 系统 SHALL 在代码块内插入换行符，绝不拆分或派生新的段落块
- WHEN 代码块内容为空且用户按下 Backspace 键
- THEN 当前代码块 SHALL 平滑降级回退为普通段落块（p）

### Requirement: REQ-CODEBLOCK-VERIFY-04: 端到端自动化测试与全量功能零退化
系统 SHALL 包含完整的端到端代码块交互测试，断言快捷输入、复制、缩进与换行保护功能完好，且既有功能零破坏。

#### Scenario: 自动化核销套件执行
- GIVEN 运行自动化测试套件 `scripts/doc-codeblock-test.mjs`
- WHEN 执行行首语法糖、剪贴板复制与击键工学断言
- THEN 所有测试断言 SHALL 全部通过，真实退出码为 0
