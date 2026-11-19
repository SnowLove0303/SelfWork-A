# 任务分解与执行清单 (Tasks)

- [x] Task 1: 彻底清除大纲「仅H1、H2」过滤组件并简化推导状态机 (`BlockEditor.tsx`)
  - [x] 1.1 移除 `outlineFilter` 状态及大纲头部「全部 / 仅H1 / H1+H2」按钮组
  - [x] 1.2 简化 `filteredHeadings` 为纯粹的多层级折叠可见性推导
  - [x] 1.3 优化一键「全部折叠 / 全部展开」按钮布局
  - [x] 1.4 验证机检退出码 0 (`pnpm check`)

- [x] Task 2: 单元测试、构建打包与热替换部署发布
  - [x] 2.1 运行 Rust 单元测试 `cargo test` 确保 14/14 全绿
  - [x] 2.2 运行前端机检 `pnpm check` 确保 0 警告 0 错误
  - [x] 2.3 运行 `pnpm tauri build --no-bundle` 编译新版二进制 (v0.1.70)
  - [x] 2.4 替换 `SelfWork.exe` 并热启动验证
  - [x] 2.5 更新 `CHANGELOG.md` 并推送到 GitHub `main` 分支
