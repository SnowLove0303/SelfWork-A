# Tasks: 智能大纲目录与左对齐排版工程落地

- [x] 1. 重构 `src/components/docs/editor/BlockItem.tsx`：手柄改为绝对悬浮定位，正文起始水平输入光标与大标题像素级向左对齐 <!-- id: 1 -->
- [x] 2. 改造 `src/components/docs/editor/BlockEditor.tsx`：构建飞书/Notion 风格大纲目录索引栏，支持标题动态识别、点击平滑滚动跳转与自适应版心 <!-- id: 2 -->
- [x] 3. 运行 `cargo test` 与 `npm run build` 进行零警告、零错误验证并重新构建 `SelfWork.exe` <!-- id: 3 -->
- [x] 4. 逐条对账 REQ-TOC-01 ~ REQ-LAYOUT-03，呈报用户终审 <!-- id: 4 -->
