# Specification: features

## ADDED Requirements

### Requirement: 智能大纲目录索引栏契约 (Auto-Generated Outline & TOC Contract)
The system SHALL dynamically extract headings (H1, H2, H3) from document blocks and render a clickable table of contents on the left pane.
系统必须从文档块流中自动提取各级标题，在左侧区域渲染出层级缩进的大纲目录索引面板，并支持平滑滚动锚点定位。

#### Scenario: 实时目录生成与点击跳转
- **WHEN**: 用户在文档中键入或修改 H1、H2 或 H3 标题块时
- **THEN**: 左侧大纲目录栏必须实时同步呈现对应标题条目，且当用户点击任一条目时，编辑视口平滑滚动至对应正文块

### Requirement: 正文行与标题绝对左对齐契约 (Flush-Left Text Alignment Contract)
The text input baseline of blocks SHALL align horizontally flush with the document title without artificial indentation.
正文文本输入块的水平起点必须与文档大标题的左边缘保持严格平齐，绝对禁止因侧边手柄而产生内部缩进。

#### Scenario: 正文输入起始位置验证
- **WHEN**: 用户聚焦到第一行正文段落开始输入文字时
- **THEN**: 其文本起始光标必须与上方文档标题处于同一垂直基准线，水平偏移量为 0

### Requirement: 大屏响应式视野与版心契约 (Responsive Fluid Workspace Contract)
The workspace layout SHALL adapt to maximized window dimensions without gaping empty voids.
工作台编辑版面必须自适应最大化窗口尺寸，扩展阅读版心并消除左侧巨大空洞。

#### Scenario: 窗口最大化自适应
- **WHEN**: 应用窗口由普通尺寸切换为最大化全屏尺寸时
- **THEN**: 大纲目录栏与正文版心自适应扩展，左右边距自然对称，维持饱满视觉体验
