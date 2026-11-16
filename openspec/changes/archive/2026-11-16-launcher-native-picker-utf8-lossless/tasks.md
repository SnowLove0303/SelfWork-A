# Tasks: 快速启动目录与文件选择器全链路 UTF-8 编码无损与既有数据纠偏

- [x] 1. 选择器通道升级为十六进制无损编码传输 <!-- id: 1 -->
  - 在 `src-tauri/src/lib.rs` 的 `pick_launcher_file` 中，通过 `.NET` UTF-8 字节转换与纯 ASCII 十六进制输出
  - 在 Rust 端实现纯标准库十六进制反解为 UTF-8 字符串，确保绝对免疫任何系统代码页影响
  - 验证命令：`cargo test --manifest-path "F:/App Location/SelfWork/src-tauri/Cargo.toml"`

- [x] 2. 既有损坏目录启动项数据物理纠偏与自愈 <!-- id: 2 -->
  - 执行针对性纠偏脚本，将 SQLite 中 `MSDS 重写版` 的目标路径修正为 `F:\App Location\Guanzhi Tong\Skill\MSDS-Engine\算法训练材料\TDS MSDS 重写版`
  - 验证命令：运行测试脚本验证目标物理路径存在且为有效目录

- [x] 3. VS Code 原生差异审核、全栈回归机检、安全热替换与单文件 EXE 验证 <!-- id: 3 -->
  - 调用 `vscode-review:review_diff_in_vscode` 逐一提交代码变动供用户在原生两栏 Diff 视图中审核
  - 运行 `pnpm check` 与 `cargo test` 确认全绿（退出码 0）
  - 运行 `pnpm tauri build --no-bundle` 编译最新生产包并通过 `scripts/replace-and-launch.mjs` 安全热替换当前运行的 `SelfWork.exe`
  - 验证命令：`pnpm --dir "F:/App Location/SelfWork" check && cargo test --manifest-path "F:/App Location/SelfWork/src-tauri/Cargo.toml"`
