# Implementation Tasks: clean-titlebar-purge-redundant-controls

- [x] **Task 1: 前端 Titlebar 与 App 接口精简化重构** `req: REQ-PURGE-TOP-01, REQ-PURGE-TOP-02, REQ-PURGE-TOP-03`
  - **1.1** 修改 `src/components/Titlebar.tsx`：
    - 移除顶部栏左侧的 `PanelLeft` 折叠展开按钮与相关属性；
    - 移除顶部栏右侧的 `Desktop / Web Preview` 状态探测胶囊及对应垂直分割线；
    - 重新排版左侧品牌文字（`SW工作台 / 模块名 · 说明`）内边距，确保文字自然对齐；
    - 最大化扩展中间 `data-tauri-drag-region` 拖拽区域，右侧纯净保留三按键。
  - **1.2** 修改 `src/App.tsx`：
    - 简化 `<Titlebar />` 的调用传参，仅传递 `activeModule={activeModule}`；
    - 保留侧边栏自带的收起/展开唯一控制机制与底层状态轮询。
  - **验证命令**：`pnpm --dir "F:/App Location/SelfWork" check` (已验证：tsc --noEmit 退出码 0)

- [x] **Task 2: 代码检阅与全量双环境工程构建编译** `req: REQ-PURGE-TOP-04`
  - **2.1** 通过 `vscode-review`（`review_diff_in_vscode`）提请用户在 VS Code 原生差异视图中审查 `Titlebar.tsx` 与 `App.tsx` 的精简变更。
  - **2.2** 运行前端静态检查：`pnpm check`，确保零错误零警告 (已验证：退出码 0)。
  - **2.3** 运行 Rust 测试：`cargo test`，确保 5/5 项单元测试全绿 (已验证：5 passed, 0 failed, 退出码 0)。
  - **2.4** 杀死运行中进程并运行 `pnpm tauri build --no-bundle` 全量编译发布包 (已验证：release 构建成功，退出码 0)。
  - **2.5** 覆盖同步更新至根目录单文件交付物 `F:\App Location\SelfWork\SelfWork.exe` (已验证：5,597,184 字节同步完成)。
  - **验证命令**：
    - `pnpm --dir "F:/App Location/SelfWork" check` (PASS)
    - `cargo test --manifest-path "F:/App Location/SelfWork/src-tauri/Cargo.toml"` (PASS)
    - `Test-Path "F:/App Location/SelfWork/SelfWork.exe"` (PASS)

- [x] **Task 3: 变更记录更新与 Git 提交推送** `req: REQ-PURGE-TOP-04`
  - **3.1** 更新 `CHANGELOG.md`，追加 `[0.1.18]` 版本发布记录。
  - **3.2** 提请用户在 VS Code 中审查 `CHANGELOG.md` 的变更 (已通过 review_diff_in_vscode 检阅完成)。
  - **3.3** 提交 Git 并推送到远程仓库 `origin/main`。
  - **验证命令**：`git -C "F:/App Location/SelfWork" status`
