# Tasks: 快速启动重构为通用灵活的跨设备桌面启动工作台

- [x] Task 1: 扩展 Tauri Rust 后端通用启动与脚本执行 IPC 接口
  - 在 `src-tauri/src/lib.rs` 剥离专属脚本硬编码，实现 `launch_custom_target` 与 `execute_custom_script` 通用跨设备 IPC。
  - 注册并导出新命令，编写 Rust 单元测试验证其鲁棒性。
  - 接入 VS Code 差异检阅 (`vscode-review:review_diff_in_vscode`)。
  - 验证命令: `cargo test --manifest-path "F:/App Location/SelfWork/src-tauri/Cargo.toml"`。

- [x] Task 2: 升级前端启动器类型模型、存储服务与默认跨设备预设
  - 重构 `src/types/launcher.ts`，定义 `LauncherCategory`、`LauncherItem` 与 `LauncherStorageData`。
  - 在 `src/services/db.ts` 增补启动器数据的 SQLite 异步加载与防抖持久化管线。
  - 接入 VS Code 差异检阅 (`vscode-review:review_diff_in_vscode`)。
  - 验证命令: `pnpm --dir "F:/App Location/SelfWork" check`。

- [x] Task 3: 重构快速启动界面为通用分类+动态卡片工作台
  - 重构 `src/components/LauncherDashboard.tsx` 及子组件：
    - 左侧分类管理侧栏（分类切换、添加、编辑、删除）；
    - 顶标行严密锁定为 `h-[49px]` 基准线，承载分类标题、项数统计、一键全启动与快速搜索；
    - 启动项晶体卡片网格与新增/编辑弹窗（支持类型切换：应用/脚本/网页/文件夹）；
    - 点击启动响应、一键全启动批量唤醒与单项编辑/删除。
  - 接入 VS Code 差异检阅 (`vscode-review:review_diff_in_vscode`)。
  - 验证命令: `pnpm --dir "F:/App Location/SelfWork" check`。

- [x] Task 4: 双栈机械全检、编译打包与跨设备通用性实测
  - 运行 `pnpm --dir "F:/App Location/SelfWork" check` (0 errors, 0 warnings)。
  - 运行 `cargo test --manifest-path "F:/App Location/SelfWork/src-tauri/Cargo.toml"` (通过率 100%)。
  - 重新编译桌面单文件程序 `SelfWork.exe` 并测试启动与脚本执行。
  - 沉淀 `CHANGELOG.md`，执行 Git 提交与远程推送。
