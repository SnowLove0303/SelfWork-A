# 任务分解与执行清单 (Tasks & Verification)

## 原子任务规划

- [x] **Task 1: 在 `src/components/DocsView.tsx` 中实现递归层级路径解析与复制反馈状态流**
  - **实现目标**：
    1. 实现 `getPageHierarchyPath` 递归回溯算法，精准处理根目录、单级子目录与多级嵌套子分区；
    2. 实现 `handleCopyPath(path: string)` 通用剪贴板写入与瞬时状态管理；
    3. 在顶部导航栏添加“复制路径”操作胶囊与面包屑点击交互；
  - **验证命令**：
    调用 `vscode-review` 审阅 Diff，运行 `pnpm check`，验证退出码为 0。

- [x] **Task 2: 在侧栏文档列表项与集合项中嵌入快捷复制路径微按钮**
  - **实现目标**：
    1. 在侧边栏子分区文档列表、根目录文档列表及最近浏览项的操作按钮组中挂载“复制路径”微按钮；
    2. 配合 `e.stopPropagation()` 确保仅复制路径而不切换活跃页面；
    3. 集成全局轻量 Toast 浮动提示（1800ms 自动淡出）；
  - **验证命令**：
    调用 `vscode-review` 审阅 Diff，运行 `pnpm check`，验证退出码为 0。

- [x] **Task 3: 全局类型检查、单元测试、打包与热替换交付 (v0.1.75)**
  - **实现目标**：
    1. 运行 `pnpm check` 零警告零错误（退出码 0）；
    2. 运行 `cargo test` 14 项单元测试全绿（退出码 0）；
    3. 运行 `pnpm tauri build --no-bundle`；
    4. 执行热替换脚本拉起最新 `SelfWork.exe` 验证；
    5. 更新 `CHANGELOG.md` 并提交 git。
  - **验证命令**：
    `cargo test` 退出码 0，`pnpm check` 退出码 0。
