# features Specification

## ADDED Requirements

### Requirement: 纯净富文本排版与原始HTML标签绝不泄露 (Clean Rich Text & No Raw HTML Invariant)
The system SHALL NOT inject verbose HTML markup containing CSS class strings (such as `<span class="...">` or `<mark class="...">`) into block plain text content.
系统在文档编辑、右键格式化及内容输入过程中，严禁向块的纯文本内容中注入包含冗长 CSS 类名字符串的原始 HTML 标签；所有排版必须保持干净清爽，杜绝尖括号代码与类名泄露到用户编辑视野中。

#### Scenario: 划选文本应用排版格式
- **WHEN**: 用户在编辑器中划选一段文字并通过右键菜单应用格式
- **THEN**: 系统仅应用标准 Markdown 语义标记或纯净内联格式，绝对不插入任何 `<span class="...">` 或 `<mark class="...">` 原始 HTML 代码标签

#### Scenario: 聚焦块进入编辑状态
- **WHEN**: 用户点击任意块进入编辑光标态
- **THEN**: 编辑框内呈现干净的自然文本，绝不出现未解析的 HTML 标签屑

### Requirement: 智能大纲纯文本清洗与防污染 (Clean Outline Plain Text Extraction)
The system SHALL strip all formatting tokens, markdown markers, and tag remnants when extracting headings for the table of contents outline.
系统在动态提取右侧目录大纲条目时，必须自动剥除所有格式控制符与标记符号，保证目录索引呈现清晰、高可读性的纯文本标题。

#### Scenario: 标题块包含格式标记时提取大纲
- **WHEN**: 标题块内容包含加粗、斜体或特殊标点
- **THEN**: 右侧目录大纲栏中呈现的内容为过滤掉标记符号后的纯文本，不包含代码碎片

### Requirement: 顶层文档标题与正文首块去重规范 (Page Title & Block Header Deduplication)
The page title header in BlockEditor SHALL serve as the unique canonical document title, and the document body SHALL NOT duplicate the exact same title as an immediately following H1 block.
页面顶部的文档大标题输入框为当前文档的唯一权威总标题；系统与模板初始化时严禁在正文第一块插入完全重复的 H1 标题与图标，消除视觉上的双重堆叠。

#### Scenario: 载入或初始化文档
- **WHEN**: 用户查看或初始化一篇新文档
- **THEN**: 顶部展示文档图标与页面大标题，正文内容区第一块直接开启章节或段落，不存在重复的相同大标题块
