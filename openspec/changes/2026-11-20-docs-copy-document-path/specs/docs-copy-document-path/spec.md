# 规范定义：文档路径复制与层级解析规范 (Specification)

## 1. 概述与适用范围
本规范遵循 RFC 2119 动词（SHALL, SHALL NOT, MUST, SHOULD），定义 SelfWork 文档模块在提取、解析并复制文档路径至剪贴板时的法定行为契约。

---

## 2. 行为契约 (Behavioral Contracts)

### 2.1 层级路径解析契约 (REQ-PATH-COPY.3)
- **SHALL**: 系统 SHALL 提供纯函数 `getPagePath(page: DocPage, partitions: DocPartition[]): string` 用于解析任意文档的完整层级路径。
- **SHALL**: 路径拼接 SHALL 自根分区开始向叶子节点推进，各级之间统一采用 `' / '` 作为标准分隔符。
- **SHALL**: 当文档位于根分区（`partitionId === 'part_private'` 或空）时，路径 SHALL 规范化为：`私人 / ${page.title || '未命名笔记'}`。
- **SHALL**: 当文档位于某子分区时，系统 SHALL 递归回溯该分区及其所有上级父分区的名字，按祖先顺序排列：`私人 / [祖父分区] / [父分区] / [当前分区] / ${page.title || '未命名笔记'}`。
- **SHALL NOT**: 解析器 SHALL NOT 在文档无标题时输出连续斜杠或空字符（必须降级保护为 `未命名笔记`）。

### 2.2 顶部操作栏与面包屑复制交互 (REQ-PATH-COPY.1)
- **SHALL**: 当处于活跃文档视图（`activeId` 存在）时，顶部操作条右侧 SHALL 渲染“复制路径”操作胶囊，包含图标与文本提示。
- **SHALL**: 顶部面包屑文本区域 SHALL 支持鼠标悬停高亮与点击事件，点击时 SHALL 触发复制当前全路径动作。
- **SHALL**: 复制成功后，按钮状态 SHALL 瞬时转为绿色勾选图标与 `'已复制路径'` 字样，并在 1800ms 后自动平滑复原为初始状态。

### 2.3 侧边栏列表快捷复制交互 (REQ-PATH-COPY.2)
- **SHALL**: 在左侧文档列表项（包括子分区项、根分区项与最近浏览项）悬停操作组中，SHALL 挂载微型复制图标按钮（`title="复制文档路径"`）。
- **SHALL**: 点击侧栏复制按钮 SHALL 仅执行剪贴板写入与轻量提示，SHALL NOT 强制改变当前编辑器的活跃打开页面，避免打断用户的当前写作心流。

### 2.4 剪贴板与 Toast 反馈契约 (REQ-PATH-COPY.4)
- **SHALL**: 路径写入 SHALL 优先调用浏览器标准 `navigator.clipboard.writeText(path)`。
- **SHALL**: 触发复制后，系统 SHALL 弹出一枚不遮挡核心编辑区域的轻量级浮动 Toast，显示具体复制的路径预览（例如：`已复制路径: 私人 / 学习 / Python笔记`）。
- **SHALL**: Toast SHALL 在停留 1800ms 后平滑淡出并卸载。
