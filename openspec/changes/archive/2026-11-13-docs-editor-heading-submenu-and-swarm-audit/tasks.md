# Tasks: 标题二级子弹窗收拢、文档编辑MCP与Swarm众测审计落地任务

- [x] 1. 改造 `src/components/docs/editor/BlockContextMenu.tsx`：将 H1、H2、H3 收拢为“标题 (Headings) ▷”聚合项，实现带自适应防溢出翻转的二级子弹窗交互 <!-- id: 1 -->
- [x] 2. 构建专用文档编辑 MCP 测试服务 `scripts/doc-editor-mcp.mjs`，封装排版标记切片、块转换与键盘流状态断言工具 <!-- id: 2 -->
- [x] 3. 启用原生 `swarm` 工具初始化协同蜂群，派发 `doc-tester` Worker 执行文档编辑全功能自动化实测与缺陷收集 <!-- id: 3 -->
- [x] 4. Coordinator 接收 Swarm 报告，执行敌手式认知审计与 5-Whys 根因穿透，针对不到位功能实施系统性修复 <!-- id: 4 -->
- [x] 5. 运行 `npm run check` 与 `cargo test` 静态机检，重新编译打包 `SelfWork.exe` 并进行 1:1 双向物理核销交付 <!-- id: 5 -->
