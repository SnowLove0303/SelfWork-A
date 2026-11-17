# Tasks: 快速启动外部进程生命周期解耦与 Windows Shell 独立脱壳架构

- [x] 1. Rust 微内核 `launch_custom_target` 引入 `ShellExecuteW` 桌面外壳托管与脱壳安全兜底 <!-- id: 1 -->
  - 在 `src-tauri/src/lib.rs` 中声明 Win32 `ShellExecuteW` 原生函数与宽字符转换辅助函数
  - 重构 `.exe` 唤起分支，优先通过 Windows Shell 外壳服务拉起，并将工作目录与启动参数精准传递
  - 为异常情况补充 Detached Process 进程组独立标志安全兜底
  - 对 `.lnk` 快捷方式与 URL 网络链接接入 `ShellExecuteW` 原生直达，消除 PowerShell 额外开销
  - 验证命令：`cargo test --manifest-path "F:/App Location/SelfWork/src-tauri/Cargo.toml"` (PASS: 14/14 tests)

- [x] 2. 进程清理脚本净化与防级联杀死加固 <!-- id: 2 -->
  - 在 `scripts/replace-and-launch.mjs` 中移除 `taskkill` 的 `/T` 级联参数，避免误杀子进程
  - 确保运维热替换只针对 `SelfWork.exe` 进程单体
  - 验证命令：`node -e "const fs = require('fs'); const s = fs.readFileSync('F:/App Location/SelfWork/scripts/replace-and-launch.mjs', 'utf8'); if (s.includes('/T')) throw new Error('/T still present');"` (PASS)

- [x] 3. 进程独立生命周期与存活断言自动化测试套件构建与核销 <!-- id: 3 -->
  - 编写专用自动化核销测试套件 `scripts/launcher-lifecycle-test.mjs`
  - 模拟唤起测试进程并在父进程退出后，实测断言子进程持续正常存活
  - 运行全量 14/14 Rust 单元测试与既有分屏、排版测试套件
  - 验证命令：`node "F:/App Location/SelfWork/scripts/launcher-lifecycle-test.mjs"` (PASS)

- [x] 4. VS Code 原生差异审核、生产构建热替换与现场端到端终审 <!-- id: 4 -->
  - 通过 `vscode-review:review_diff_in_vscode` 逐一提交 `src-tauri/src/lib.rs` 与 `replace-and-launch.mjs` 差异供用户把控 (APPROVED)
  - 执行 `pnpm tauri build --no-bundle` 构建单文件生产程序并通过 `replace-and-launch.mjs` 热替换上线 (PASS, PID: 7700)
  - 验证命令：`pnpm --dir "F:/App Location/SelfWork" check && cargo test --manifest-path "F:/App Location/SelfWork/src-tauri/Cargo.toml"` (PASS)
