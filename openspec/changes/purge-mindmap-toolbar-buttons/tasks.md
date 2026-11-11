# Tasks: 彻底剔除思维导图顶部功能按钮与沉浸画布落地

- [x] **Task 1: 精简 MindMapView 视口结构并移除顶部按键工具栏** `req: REQ-PURGE-01`
  - 在 `src/components/MindMapView.tsx` 中移除 `<MindMapToolbar ... />` 组件挂载；
  - 净化视口布局，使 `MindMapCanvas` 纵向全高满屏展开；
  - 保留左下角极简快捷键指引提示条；
  - 验证命令：`pnpm --dir "F:/App Location/SelfWork" check`

- [x] **Task 2: 全键盘操作闭环自验证与状态机契约核销** `req: REQ-PURGE-02`
  - 验证纯键盘在思维导图中的完整流转：Tab 新建子分支、Enter 新建同级分支、Delete/Backspace 删除分支、Space/F2 改名；
  - 确保输入框打字时不冲突，失焦后快捷键秒级响应；
  - 验证命令：`cargo test --manifest-path "F:/App Location/SelfWork/src-tauri/Cargo.toml"`

- [x] **Task 3: 全量构建、VS Code 检阅、可执行文件更新与知识沉淀** `req: REQ-PURGE-01, REQ-PURGE-02`
  - 调用 `vscode-review` 进行代码修改审核；
  - 运行 `pnpm tauri build --no-bundle` 完成 Release 编译；
  - 同步复制产物更新根目录 `SelfWork.exe`；
  - 更新 `CHANGELOG.md` 记录本次精简与长效防线；
  - 提交并推送 Git `origin/main`。
