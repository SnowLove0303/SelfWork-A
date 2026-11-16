# Tasks: 快速启动屏幕分屏吸附精度与多窗口去重防重叠加固

- [x] 1. 目标显示器物理坐标系基准对齐与跨屏漂移治理 <!-- id: 1 -->
  - 在 `src-tauri/src/lib.rs` 中核实 `get_system_monitors_internal` 坐标与工作区偏移量
  - 在 `arrange_combo_windows` 中严格以目标屏幕基准点计算 `(px, py)`，杜绝主屏与副屏混落
  - 增强 `ShowWindow(hWnd, 9)` 与 `SetWindowPos` 状态重置，防止最大化状态锁定
  - 验证命令：`cargo test --manifest-path "F:/App Location/SelfWork/src-tauri/Cargo.toml"`

- [x] 2. 窗口句柄排他池与多轮自适应探测轮询管道重构 <!-- id: 2 -->
  - 在 `src-tauri/src/lib.rs` 的 `arrange_combo_windows` 中引入 `$usedHwnds` 句柄黑名单排他池
  - 重构自动化脚本为多轮增量轮询探测机制（最大 2.5s，每轮 250ms），确保并发异步启动的后置窗口完整就位
  - 在 `src-tauri/src/lib.rs` 的 `launch_custom_target` 唤起文件夹时注入 `/separate` 参数，规避 Windows 11 标签页吞并
  - 在 `src/components/LauncherDashboard.tsx` 中优化子项唤起与排版下发时序
  - 验证命令：`pnpm --dir "F:/App Location/SelfWork" check`

- [x] 3. 真实多屏与并发分屏全链路自动化测试套件 <!-- id: 3 -->
  - 编写并运行 `scripts/launcher-snap-tiling-test.mjs`
  - 覆盖副屏与主屏目标坐标计算、句柄去重互斥（重叠率 0%）、模糊匹配消歧与多轮轮询模拟断言
  - 验证命令：`node "F:/App Location/SelfWork/scripts/launcher-snap-tiling-test.mjs"`

- [x] 4. VS Code 原生差异审核、生产构建热替换与现场验证 <!-- id: 4 -->
  - 通过 `vscode-review:review_diff_in_vscode` 逐一提交代码差异供用户审核确认
  - 执行 `pnpm tauri build --no-bundle` 构建单文件生产程序并通过 `replace-and-launch.mjs` 热替换上线
  - 验证命令：`pnpm --dir "F:/App Location/SelfWork" check && cargo test --manifest-path "F:/App Location/SelfWork/src-tauri/Cargo.toml"`
