## ADDED Requirements

### Requirement: REQ-DOC-FONTSIZE-01: 文档正文与各级块级内容默认字号适度放大
系统在渲染文档中心的编辑与阅读内容时，SHALL 将默认正文基础字号由原本的 14px 调整至舒适的 16px (text-base)，并按比例协调放大各级标题。

#### Scenario: 渲染普通正文、列表与待办块
- GIVEN 用户打开任意文档进行阅读或编辑
- WHEN 系统渲染正文（p）、无序列表（bullet）与待办清单（todo）块
- THEN 渲染的基础字号 SHALL 达到 16px (text-base)
- AND 行高 SHALL 采用 1.75 倍自然舒展比例 (leading-relaxed)

#### Scenario: 渲染各级标题与大标题
- GIVEN 文档中包含各级标题内容
- WHEN 系统渲染大标题输入框与 H1/H2/H3 标题块
- THEN 文档主标题字号 SHALL 达到 30px (text-3xl)
- AND 一级标题 (H1) 字号 SHALL 达到 28px (text-[28px])
- AND 二级标题 (H2) 字号 SHALL 达到 22px (text-[22px])
- AND 三级标题 (H3) 字号 SHALL 达到 18px (text-lg)

### Requirement: REQ-DOC-FONTFAMILY-02: 文档编辑主区域强制优先使用微软雅黑
系统在文档编辑主画布与所有文本呈现区域，SHALL 强制优先使用「微软雅黑 (Microsoft YaHei)」字体族。

#### Scenario: 中文字形与西文字体栈解析
- GIVEN 用户在文档中输入中文、英文、数字与标点符号
- WHEN 浏览器计算文本呈现字体 (Computed Font-Family)
- THEN 首选匹配字体 SHALL 为 `"Microsoft YaHei", "微软雅黑"`
- AND 文本呈现质感 SHALL 保持边缘清晰饱满，无生硬锯齿

### Requirement: REQ-DOC-TYPO-03: 行高、基线与垂直韵律呼吸感协同优化
系统在放大正文字号后，SHALL 对行高、段落间距与各行首前缀符号的垂直对齐基线进行协同适配。

#### Scenario: 待办清单复选框基线对齐
- GIVEN 块类型为待办清单 (todo)
- WHEN 系统渲染待办复选框与 16px 放大文本
- THEN 复选框与正文首行文字 SHALL 在垂直方向保持居中水平对齐
- AND 勾选完成状态下的划线样式 SHALL 准确穿过 16px 文字中线

### Requirement: REQ-DOC-AUDIT-04: 字体与排版自动化测试审计
系统 SHALL 配备覆盖字号阶梯、字体族声明与历史排版功能的自动化核销套件。

#### Scenario: 排版规格自动化断言全绿
- GIVEN 运行排版规格测试脚本 `scripts/doc-typography-test.mjs`
- WHEN 校验正文字号、各级标题比例与字体族优先级
- THEN 进程退出码 SHALL 为 0
- AND 每一个断言 SHALL 附带明确的通过证明
