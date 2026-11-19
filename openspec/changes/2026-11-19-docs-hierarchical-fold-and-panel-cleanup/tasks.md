# 任务分解与执行清单 (Tasks)

- [x] Task 1: 彻底清除大纲侧栏内部右上角冗余收起按钮 (`BlockEditor.tsx`)
  - [x] 1.1 移除大纲栏头部右侧的 `PanelRightClose` 图标按钮
  - [x] 1.2 调整大纲头部「大纲 / 图谱」标签页与容器对齐布局
  - [x] 1.3 验证机检退出码 0 (`pnpm check`)

- [x] Task 2: 实现智能多层级深度父子折叠系统 (`BlockEditor.tsx`)
  - [x] 2.1 引入 `getHeadingDepth` 语义编号启发自愈算法，精准纠正 `## 1.1` 为深度 3
  - [x] 2.2 赋予二级标题（H2）独立的父子管辖判定与下属子节计数 (`childCount`)
  - [x] 2.3 确保二级标题渲染折叠微箭头与折叠徽标，实现 H2 独立折叠其下属小节
  - [x] 2.4 一键全部折叠/展开联动 H1 与 H2 所有父级节点
  - [x] 2.5 验证机检退出码 0 (`pnpm check`)

- [x] Task 3: 单元测试、构建打包与热替换部署发布
  - [x] 3.1 运行 Rust 单元测试 `cargo test` 确保 14/14 全绿
  - [x] 3.2 运行前端机检 `pnpm check` 确保 0 警告 0 错误
  - [x] 3.3 运行 `pnpm tauri build --no-bundle` 编译新版二进制 (v0.1.68)
  - [x] 3.4 替换 `SelfWork.exe` 并热启动验证
  - [x] 3.5 更新 `CHANGELOG.md` 并推送到 GitHub `main` 分支
