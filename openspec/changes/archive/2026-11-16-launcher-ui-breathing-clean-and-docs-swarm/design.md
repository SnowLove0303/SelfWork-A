# Design: 报文控制栏防溢出、顶栏呼吸空间重构、冗余文本剔除与文档表格 Swarm 派发

## 架构因果拓扑与界面工程美学规范

### 1. 报文顶栏几何约束与防溢出收敛 (`TelemetryPanel.tsx`)
- 原结构：顶栏 `px-2.5`，过滤胶囊与 4 个图标按钮（滚动、复制、清屏、关闭）排列在一行，总宽度约 327px，在 290px~300px 容器中产生约 27px 的水平超出，导致最右侧 `✕` 紧贴甚至溢出边框。
- 新结构：
  - 顶栏容器：`h-11 px-3.5 border-b border-white/[0.08] flex items-center justify-between gap-2 bg-black/40 min-w-0 overflow-hidden`；
  - 左侧标题区保持精简（`Terminal` 图标 + `报文` + 计数徽标，约 75px）；
  - 右侧控制区采用紧凑过滤胶囊（文字缩减，内边距调优）+ 图标按键（`h-6 w-6`），右侧关闭 `✕` 按钮保留 `ml-1 mr-0.5` 独立边距，距离右边框预留 $\ge 10\text{px}$ 安全呼吸边距；
  - 容器严格设置 `overflow-hidden`，绝对杜绝任何按键切出边框。

### 2. 快速启动顶栏呼吸节奏重构 (`LauncherDashboard.tsx`)
- 原结构：顶栏内边距 `px-3 md:px-4`，按键间距 `gap-1.5`（6px），各按键紧密挤在右侧；
- 新结构：
  - 顶栏外层内衬提升为 `px-4 md:px-5`，为左右边界提供自然呼吸感；
  - 动作按键组间距扩大为 `gap-2 sm:gap-2.5`（8px~10px）；
  - 单个按键内边距由 `px-2.5 py-1` 提升为 `px-2.5 sm:px-3 py-1.5`，字体维持清爽 `text-[11.5px]`，具有更舒缓的手感反馈与视觉层次。

### 3. Radical Text Economy 极简少字原则与去废话化
- 彻底移除 `TelemetryPanel.tsx` 底部原有的 28px 高度底部状态栏（`POWERSHELL IPC DAEMON READY UTF-8 / CREATE_NO_WINDOW`）；
- 日志区域垂直拉伸占满底部，彻底消除非业务核心的开发者底层口水信息。

### 4. Swarm 协同智能体编组拓扑
- 注册专属 Swarm 智能体：`docs-table-worker`；
- 赋予专属领域上下文：
  - 职责：承接工作台「文档表格」（Docs & Tables）全生命周期功能演进；
  - 关键资产：`src/components/DocsEditor.tsx`、`src/components/docs/`、`src/services/db.ts`；
  - 核心领域能力：Notion 风格富文本块编辑器、块转换引擎、右键上下文菜单、双向链接与多维数据表格；
  - 工作状态：就绪待命（Waiting / Idle），等待派发具体需求。
