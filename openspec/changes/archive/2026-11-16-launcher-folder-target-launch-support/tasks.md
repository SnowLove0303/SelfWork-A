# Tasks: 快速启动指定路径文件夹功能支持

- [x] 1. Rust 后端原生资源管理器极速直连唤起管线开发 <!-- id: 1 -->
  - 在 `src-tauri/src/lib.rs` 的 `launch_custom_target` 中为 `target_path.is_dir()` 建立原生直连通道
  - 自动规范化反斜杠并调用 `std::process::Command::new("explorer.exe").arg(&normalized)`
  - 补充物理路径存在性校验，对不存在的目录路径返回友好明确的中文错误描述
  - 验证命令：`cargo test --manifest-path "F:/App Location/SelfWork/src-tauri/Cargo.toml"`

- [x] 2. 前端目录路径选择器与智能名称提取增强 <!-- id: 2 -->
  - 在 `src/components/LauncherDashboard.tsx` 的 `handlePickFile` 中优化目录名称提取：当 `isFolder` 时直接采用 `baseName` 避免带点目录名被误截断
  - 确保新建/编辑模态框在 `folder` 模式下的输入提示、占位符与标签精准匹配
  - 验证命令：`pnpm --dir "F:/App Location/SelfWork" check`

- [x] 3. E2E 真实行为测试套件扩充与文件夹端到端见证 <!-- id: 3 -->
  - 在 `scripts/launcher-e2e-test.mjs` 中追加文件夹类型项的生命周期测试（创建有效文件夹项、不存在文件夹项、组合套件包含文件夹）
  - 验证 SQLite 数据持久化、参数结构完整性与唤起契约
  - 验证命令：`node "F:/App Location/SelfWork/scripts/launcher-e2e-test.mjs"`

- [x] 4. VS Code 原生差异审核、全栈回归机检与单文件 EXE 生产构建 <!-- id: 4 -->
  - 调用 `vscode-review:review_diff_in_vscode` 逐一提交代码变动供用户在原生 Diff 视图中把控
  - 运行 `pnpm check` 与 `cargo test` 确认零错误零警告
  - 运行 `pnpm tauri build --no-bundle` 编译生成最新 100% 离线脱机 `SelfWork.exe` 桌面端
  - 验证命令：`pnpm --dir "F:/App Location/SelfWork" check && cargo test --manifest-path "F:/App Location/SelfWork/src-tauri/Cargo.toml"`
