# Design: 右键标题二级子弹窗收拢、专属文档编辑MCP与Swarm众测审计架构设计

## 1. 右键二级子弹窗架构设计 (Submenu Architecture)

```text
 ┌───────────────────────────────────────────────┐
 │ 🔤 快捷排版                                   │
 ├───────────────────────────────────────────────┤
 │ 🎨 颜色与荧光笔高亮                           │
 ├───────────────────────────────────────────────┤
 │ 🔄 转换为... (Turn into)                      │
 │   ¶  普通正文                                 │
 │  [H  标题 (Headings) ▷ ] ────────Hover───────►┌────────────────────────────┐
 │   ☑️  待办清单 (To-do)                         │ H1 一级大标题 (Heading 1)  │
 │   •  项目符号 (Bullet)                        │ H2 二级小节 (Heading 2)    │
 │   💬 引用区块 (Quote)                         │ H3 三级重点 (Heading 3)    │
 │   💻 技术代码 (Code)                          └────────────────────────────┘
 └───────────────────────────────────────────────┘
```

### 1.1 碰撞防溢出算法 (Submenu Collision Flip)
- 二级子弹窗默认在父项右侧：`left = parentRect.right + 4`，`top = itemRect.top`；
- 若 `parentRect.right + submenuWidth > window.innerWidth - 12`，则自动翻转至左侧：`left = parentRect.left - submenuWidth - 4`；
- 若 `top + submenuHeight > window.innerHeight - 12`，则向上对齐：`top = Math.max(12, top - submenuHeight + itemRect.height)`。

## 2. 文档编辑专属 MCP 工具服务设计 (Doc Editor MCP)
- 脚本位置：`scripts/doc_editor_mcp.mjs`
- 提供原子能力：
  1. `doc_editor_parse_markdown_spans`: 解析富文本内联标记并验证 AST 合法性；
  2. `doc_editor_simulate_key_flow`: 模拟输入 `# `, `## `, `[] `, `> ` 时的原地蜕变行为；
  3. `doc_editor_test_selection_format`: 模拟选区切片并断言加粗、斜体、代码、高亮颜色包裹逻辑；
  4. `doc_editor_verify_turn_into`: 校验各种块类型转换（Paragraph $\leftrightarrow$ H1/H2/H3/Todo/Code）的无损守恒度。

## 3. Swarm 协同拓扑模型 (Swarm Collaborative Topology)
```text
┌────────────────────────────────────────────────────────┐
│             Coordinator (主协调员 / 架构审计)           │
│  - 负责 Step 0~Step 5 法定门禁把控与立法               │
│  - 负责代码落地与最终两阶双轨敌手式认知审计            │
└───────────────────────────┬────────────────────────────┘
                            │ 原生 Swarm 看板 (board_post / swarm)
┌───────────────────────────▼────────────────────────────┐
│          Swarm Worker (doc-tester 专职测试员)          │
│  - 运行专属文档编辑 MCP 进行组合压力测试               │
│  - 探测输入流畅度、Markdown 语法糖、右键二级弹窗、选区上色 │
│  - 抓出“不到位的编辑功能”并向 Coordinator 呈报问题清单  │
└────────────────────────────────────────────────────────┘
```
