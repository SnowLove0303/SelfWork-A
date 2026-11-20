# 规范定义：文档导入清洗、表格防畸变与列宽拖拽交互规范

## 1. 概述与适用范围
本规范遵循 RFC 2119 动词（SHALL, SHALL NOT, SHOULD, MUST），定义 SelfWork 文档模块在接收外部 Markdown、剪贴板富文本与表格渲染交互时的法定契约。

---

## 2. 行为契约 (Behavioral Contracts)

### 2.1 外部输入与 Notion 噪点清洗规范 (REQ-DOC-PARSE.1 & REQ-DOC-PARSE.2)
- **SHALL**: 解析器在处理传入文本流前，SHALL 首先执行 `sanitizeImportText` 语义净化流程。
- **SHALL**: 净化流程 SHALL 检测并剔除页面顶栏面包屑前缀（如 `^(?:废纸篓\s*)?(?:私人|工作区|空间)?\s*[\/／]\s*`）、块数元数据（如 `·\s*\d+\s*个块`）、大纲统计（如 `目录大纲\(\d+\)`）及操作按钮文本（如 `(?:🐍|🖼️)?(?:添加封面|添加图标|添加评论|移至废纸篓)`）。
- **SHALL**: 若净化流程从顶栏检测到有效图标（如 `🐍`）或标题（如 `02.3-02.5 集合类型...`），SHALL 自动将其提升为页面元数据 `icon` 与 `detectedTitle`。
- **SHALL**: 对代码块头部出现的复合工具栏噪点（如 `Python不换行行号复制123456...`），解析器 SHALL 提取真实语言类型（`python`），并剔除 `(?:不换行|换行)?(?:行号)?复制\d*` 伪文本，仅保留真实代码首行。
- **SHALL NOT**: 解析器 SHALL NOT 将 UI 按钮文本或行号序列作为普通段落、代码正文或标题块持久化至页面中。

### 2.2 表格解析与反畸变契约 (REQ-DOC-PARSE.3)
- **SHALL**: Markdown 表格行切分 SHALL 采用反斜杠后行断言 `/(?<!\\)\|/` 进行列切分，必须保护单元格内部的转义竖线（`\|`）。
- **SHALL**: 切分后，各单元格文本 SHALL 清理首尾多余空格，并对 `\|` 进行反转义还原或安全保留。
- **SHALL**: 表格各行单元格数量 SHALL 实施自适应对齐（Align & Pad），以表头列数为基准，短行自动补全空字符串，超长多余无效空列自动裁切。
- **SHALL**: 解析器 SHALL 过滤因多次错误导入产生的重复表头行，杜绝类似 `| 运算 | 运算 | Python 写法 | Python 写法 |` 的递归克隆列。

### 2.3 表格列宽交互与横向平滑滚动规范 (REQ-TABLE-INTERACT.4)
- **SHALL**: `TableBlock` 组件 SHALL 支持在 `block.properties.columnWidths: number[]` 中持久化每列像素宽度。
- **SHALL**: 若 `columnWidths` 缺失或列数发生变动，组件 SHALL 按当前列数自适应派生默认宽度（每列默认基准 160px，或自适应分配），确保表格列宽明确可控。
- **SHALL**: 表头每一列右边缘 SHALL 渲染带有 `col-resize` 样式的交互手柄（Resize Handle）。
- **SHALL**: 用户按住 Resize Handle 拖动时，组件 SHALL 实时计算并反馈当前列宽（设置最小宽度下限为 60px），且在 `mouseup` 释放时触发持久化保存。
- **SHALL**: 表格容器 SHALL 启用 `overflow-x-auto` 与平滑滚动，当表格总宽度超出编辑区视口时，用户可顺畅横向滚动查阅，表格单元格内容遵循 `break-words` 换行包裹，严禁被无理截断。

### 2.4 粘贴接管与多块分裂注入规范 (REQ-NOTION-ALIGN.5)
- **SHALL**: 当用户在可编辑块中粘贴包含多段落、代码块或表格的多行 Markdown/文本时，系统 SHALL 拦截原生扁平化粘贴行为。
- **SHALL**: 粘贴内容经由 `sanitizeImportText` 与 `parseMarkdownToBlocks` 结构化为独立块序列，首个块替换/补全当前焦点块，其余块有序顺次插入当前块下方，并自动保持光标焦点定位。
