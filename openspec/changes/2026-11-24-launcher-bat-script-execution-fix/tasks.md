# Tasks: 修复快速启动模块对本地批处理 (.bat/.cmd/.ps1) 脚本与带引号路径的执行故障

- [x] **Task 1: 修复 Rust 后端 `execute_custom_script` 与 `launch_custom_target` 的脚本路径、引号与编码处理 (`launcher:rust-script-exec`)**
  - **因果角色**: [Root Backend Execution Engine]
  - **关联需求**: REQ-BAT-EXEC-01, REQ-DIR-ISOLATION-03
  - **核心动作**:
    1. 在 `src-tauri/src/lib.rs` 中新增路径引号清洗辅助函数，在 `launch_custom_target` 和 `execute_custom_script` 中正确剥离首尾双引号；
    2. 在 `execute_custom_script` 中针对 `bat`/`cmd` 模式使用 `cmd.exe /c` + `raw_arg` 精准执行含空格中文的批处理文件，配置 `Stdio::null()` 防止 `pause` 死锁挂起；
    3. 针对 `script_type` 为 `powershell` 且内容为 `.ps1` 文件路径时，改用 `-File` 执行；
    4. 若未提供 `working_dir` 且目标为本地存在的文件路径，自动将其父目录设为 `current_dir`；
    5. 补充单元测试验证带引号与含空格 `.bat` 路径解析契约。
  - **实测验证**: `cargo test --manifest-path src-tauri/Cargo.toml` 与 `cargo check` 零警告零错误通过。

- [x] **Task 2: 修复前端 `LauncherDashboard.tsx` 脚本路由分发与表单路径规范化 (`launcher:fe-script-route`)**
  - **因果角色**: [Frontend Dispatch & UX]
  - **关联需求**: REQ-BAT-EXEC-01, REQ-DIR-ISOLATION-03
  - **核心动作**:
    1. 在 `handleLaunchItem` 中识别 `item.type === 'script'` 且目标为本地 `.bat`/`.cmd` 文件（含带引号路径）时，清洗引号、推导父目录作为 `workingDir`，并传参 `scriptType: 'bat'`；
    2. 在启动项添加/编辑保存逻辑中，自动去除目标路径首尾多余双引号，若为 `.bat`/`.cmd`/`.ps1` 且工作目录为空则自动补全其所在目录。
  - **实测验证**: `pnpm check` 零警告零错误通过。

- [x] **Task 3: 全量构建、端到端实测 `微信双开.bat` 与部署发布 (`launcher:verify-release`)**
  - **因果角色**: [E2E Verification & Release]
  - **关联需求**: REQ-WECHAT-DUAL-02, REQ-PROC-DETECT-04
  - **核心动作**:
    1. 执行 `pnpm check`、`pnpm build`、`pnpm tauri build --no-bundle`；
    2. 热替换更新 `SelfWork.exe` 并验证进程存活；
    3. 实测调用 `微信双开.bat` 验证 `last_run.log` 更新及执行退出码为 0；
    4. 更新 `CHANGELOG.md` 并执行 Git 原子提交。
  - **实测验证**: 真实编译退出码 0，实测日志确认脚本正常执行。
