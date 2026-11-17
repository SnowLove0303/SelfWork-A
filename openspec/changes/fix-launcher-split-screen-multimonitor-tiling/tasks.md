# Implementation Tasks: 快速启动分屏多显示器精准投送与几何平铺 (fix-launcher-split-screen-multimonitor-tiling)

## 任务执行清单 (严格遵循 Roo-Code/Cline [-] 单焦点执行锁)

- [x] 1. 语法纯净化与 Rust 底座健壮性重构 (src-tauri/src/lib.rs)
  - [x] 1.1 修复嵌入 PowerShell 脚本中第 834 行非法的 `&&` 与 `||` 操作符，全面改写为 PowerShell 5.1 原生兼容的 `-and` 与 `-or`；
  - [x] 1.2 扩展 `WindowPlacementSpec` 契约，新增 `pub item_name: Option<String>`；
  - [x] 1.3 提取 `target_stem`（剥离扩展名），升级 Layer 2 与 Layer 3 的多维模糊匹配（支持条目名、程序词干、窗口标题及进程名）；
  - [x] 1.4 拔除 `.unwrap_or(specs.len())` 假通逻辑，当脚本执行失败或抛出错误时返回真实错误，输出真实 `matched_count`；
  - [x] 1.5 运行 `cargo test` 确保 14/14 单元测试全部通过。

- [x] 2. 前端参数透传与时序平滑升级 (src/components/LauncherDashboard.tsx)
  - [x] 2.1 在多选即时分屏（`handleLaunchSelectedWithTiling`）与组合分屏调用中，将 `selectedItems[idx].name` / `targetItem.name` 作为 `item_name` 注入 `specs`；
  - [x] 2.2 确保 `targetMonitorIndex` 稳定传递并校验；
  - [x] 2.3 运行 `pnpm check` 验证 TypeScript 零警告、零错误。

- [x] 3. 编写物理见证者实测套件并执行双屏/单屏真实核销
  - [x] 3.1 编写 `scripts/launcher-multimonitor-split-test.mjs`，包含：
    - 解释器 0 语法报错与原生 PowerShell 5.1 解析实测；
    - 真实桌面多窗口（CabinetWClass / 应用窗口）在副屏物理坐标系（X=1920）下的移动与几何划分断言；
    - 弱断言防御：模拟变异注入，确保非零退出码被正确捕获；
  - [x] 3.2 运行并全绿通过。

- [x] 4. 生产二进制重新打包、热替换上线与用户实测验证
  - [x] 4.1 执行 `pnpm tauri build --no-bundle` 编译生产 Release 包；
  - [x] 4.2 执行 `replace-and-launch.mjs` 热替换上线；
  - [x] 4.3 验证进程 PID 存活并记录 CHANGELOG.md。
