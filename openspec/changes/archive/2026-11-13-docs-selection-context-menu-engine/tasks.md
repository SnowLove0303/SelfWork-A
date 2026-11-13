# Tasks: 划选内容右键定制调整弹窗与富文本转换落地任务

- [x] 1. 新建 `src/components/docs/editor/BlockContextMenu.tsx`：构建深色磨砂玻璃右键调整弹窗，包含格式行、颜色调色盘、荧光高亮色盘与 Turn into 块转换列表 <!-- id: 1 -->
- [x] 2. 改造 `src/components/docs/editor/BlockItem.tsx`：接入 `onContextMenu` 选区捕获、防溢出坐标计算、行内样式包裹（粗体/斜体/代码/颜色/清除格式）与块类型无损转换 <!-- id: 2 -->
- [x] 3. 运行 `npm run check` 与 `cargo test` 进行静态机检与零告警零错误验证，重新编译打包 `SelfWork.exe` <!-- id: 3 -->
- [x] 4. 1:1 双向物理核销 REQ-DOCS-CONTEXT-MENU-POPOVER-01 ~ REQ-DOCS-TURN-INTO-BLOCK-04 并在 VS Code Diff 确认后呈报用户终审 <!-- id: 4 -->
