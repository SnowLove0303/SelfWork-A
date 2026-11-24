# Proposal: 修复快速启动模块对本地批处理 (.bat/.cmd/.ps1) 脚本与带引号路径的执行故障

## 1. 原始需求与事实指纹
> 我刚才把"F:\App Location\脚本\微信双开管理\微信双开.bat" 添加进启动项，但好像无法正常使用，你去排一下，这是一个启动微信双开的脚本

## 2. 1:1 需求物理对账矩阵 (RTM)

| 需求编号 | 需求描述 | 因果定位 | 对应任务 |
|---|---|---|---|
| **REQ-BAT-EXEC-01** | 修复快速启动模块点击 `.bat`/`.cmd`/`.ps1` 本地脚本启动项时未真正执行（仅在 PowerShell 中被当成字符串回显）的阻断故障 | 前端脚本分发路由 + 后端脚本/批处理执行器 | Task 1, Task 2 |
| **REQ-WECHAT-DUAL-02** | 确认并保障 `微信双开.bat` / `wechat_multi_open.ps1` 在微信 4.2.0.53 环境下能够被工作台正确拉起并完成双开 | 实测验证端到端唤起链路 | Task 3 |
| **REQ-DIR-ISOLATION-03** | 当用户粘贴带首尾双引号的 Windows 文件路径且未手填工作目录时，自动清洗引号并绑定脚本所在目录为工作目录 | 前端路径标准化 + 后端工作目录兜底 | Task 1, Task 2 |
| **REQ-PROC-DETECT-04** | 保持既有单品/组合启动项与进程白名单检测、多开功能 100% 不受影响 | 回归验证 | Task 3 |

## 3. 法定双清单 (Dual-Checklist)

### 3.1 拟变范围清单 (Scope of Changes)
1. `F:\App Location\SelfWork\src-tauri\src\lib.rs` `[Root Backend Execution Engine]`：
   - 增强 `launch_custom_target` 与 `execute_custom_script`：剥离路径外层双引号；识别 `.bat`/`.cmd` 走 `cmd.exe /c` 原生批处理执行（配合 `raw_arg` 处理含空格中文路径与引号）；识别 `.ps1` 走 `-File` 执行；自动推导物理父目录为默认 `working_dir`；兼容 Windows CMD 中文 GBK/UTF-8 编码输出解码。
2. `F:\App Location\SelfWork\src\components\LauncherDashboard.tsx` `[Frontend Dispatch & Form UX]`：
   - 修复 `handleLaunchItem` 中 `item.type === 'script'` 的执行路由：当目标为本地 `.bat`/`.cmd`/`.ps1` 脚本文件路径（含带引号情况）时，自动清洗外层引号、推导父目录作为 `workingDir`，并准确传递 `scriptType: 'bat'` 或 `'powershell'`；
   - 在启动项创建/编辑弹窗保存与输入失焦时，自动去除路径首尾多余双引号，若目标为 `.bat`/`.cmd`/`.ps1` 且工作目录为空，自动补全其父目录。

### 3.2 保持现状承诺清单 (Leave-As-Is Commitment)
- 保持 `detect_launcher_processes` 与 `terminate_launcher_processes` 白名单进程侦测与终止逻辑原封不动；
- 保持 `arrange_combo_windows` 多显示器分屏编排逻辑原封不动；
- 保持单品/组合卡片 UI 布局及右键菜单既有功能原封不动；
- 不修改用户本地脚本 `F:\App Location\脚本\微信双开管理\微信双开.bat` 与 `wechat_multi_open.ps1`（经实测该脚本逻辑本身可在正常命令行下正确解锁并双开微信 4.2.0.53）。
