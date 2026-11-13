# Feature Specification: 右键标题二级子弹窗、文档编辑MCP与Swarm众测审计

## ADDED Requirements

### Requirement: REQ-DOCS-HEADING-SUBMENU-01: 右键标题二级子弹窗收拢
- **SHALL**: 调整弹窗中的“转换为...”列表 SHALL 将 H1、H2、H3 收拢为统一的【标题 (Headings) ▷】条目，并在鼠标交互时展开二级子弹窗。

#### Scenario: 悬浮标题项展开二级子弹窗
- **WHEN**: 用户在右键调整弹窗中将鼠标移动至“标题 (Headings) ▷”条目
- **THEN**: 在该条目侧方平滑滑出二级子弹窗，清晰列出一级标题、二级标题与三级标题

#### Scenario: 视窗边界防溢出翻转
- **WHEN**: 主菜单位于屏幕右侧边界时
- **THEN**: 二级子弹窗自动向左翻转滑出，确保所有选项 100% 完整可见

#### Scenario: 选择子标题完成转换
- **WHEN**: 用户在二级子弹窗中点击“二级小节标题 (H2)”
- **THEN**: 当前块保持内容不变就地转换为 H2，两级弹窗平滑关闭

### Requirement: REQ-DOCS-EDITOR-MCP-02: 构建文档编辑与测试专属 MCP 工具集
- **SHALL**: 系统 SHALL 构建并注册专注文档编辑原子操作的测试 MCP 工具接口。

#### Scenario: 模拟富文本排版与格式断言
- **WHEN**: 自动化测试智能体调用文档编辑 MCP 工具
- **THEN**: 工具能够准确执行格式包裹、块类型推导与文本状态核验

### Requirement: REQ-DOCS-SWARM-COLLAB-03: 启用原生 Swarm 蜂群协同众测
- **SHALL**: 调度 Antigravity 原生 Swarm 工具组建蜂群，派发独立测试 Worker 对文档编辑功能进行全量边界实测。

#### Scenario: 派发 Swarm 测试 Worker
- **WHEN**: Coordinator 初始化 Swarm 看板并派发 `doc-tester` Worker
- **THEN**: Worker 独立执行排版组合、回车裂变、退格熔断与右键弹窗全量边界测试，并回传缺陷清算清单

### Requirement: REQ-DOCS-AUDIT-CLOSURE-04: 主协调员敌手式认知审计与缺陷根治闭环
- **SHALL**: Coordinator SHALL 对 Worker 报告的各项不到位缺陷进行敌手式认知审计与系统性修复。

#### Scenario: 根治编辑体验缺陷并最终核销
- **WHEN**: 针对 Worker 挑出的编辑不到位缺陷逐项落实代码根治方案
- **THEN**: 生产构建重新验证通过，且出具 1:1 双向物理核销报告
