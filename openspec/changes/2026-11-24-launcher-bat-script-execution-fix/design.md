# Design: 本地批处理 (.bat/.cmd/.ps1) 与带引号路径执行链路修复

## 1. 根因分析 (Root Cause Analysis)

经底座排查与 SQLite 数据库实测，故障根因完全定位：
1. 用户添加的启动项配置为：`type: 'script'`，`target: '"F:\\App Location\\脚本\\微信双开管理\\微信双开.bat"'`，`workingDir: null`。
2. 前端 `LauncherDashboard.tsx` 在处理 `item.type === 'script'` 时，无条件向后端发送 `scriptType: 'powershell'` 且将 `item.target` 原样作为 `scriptContent` 传入 `execute_custom_script`。
3. 后端 `execute_custom_script` 执行 `powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "\"F:\App Location\脚本\微信双开管理\微信双开.bat\""`。在 PowerShell 语法中，带双引号的路径字符串被求值为**字符串字面量**并直接回显输出，**完全没有运行该 `.bat` 文件**。
4. 即使在 `launch_custom_target` 中以 `app` 类型添加带首尾双引号的路径，Rust 的 `Path::new` 也会将引号视为路径字符导致 `exists()` 返回 `false`。

## 2. 架构与数据流修复方案

```text
[LauncherItem: type='script' | 'app', target='"F:\...\微信双开.bat"']
        │
        ▼ (1) 剥离外层双引号 cleanTarget = target.trim().replace(/^"+|"+$/g, '')
        │
        ├─▶ 若扩展名为 .bat / .cmd:
        │     ├─ 自动推导默认工作目录 parentDir (若 workingDir 为空)
        │     └─ 调用 execute_custom_script(scriptType: 'bat', scriptContent: cleanTarget, workingDir)
        │          └─ Rust 后端: cmd.exe /c "<cleanTarget>" (使用 raw_arg 精准传递含空格与中文的路径)
        │
        ├─▶ 若扩展名为 .ps1:
        │     ├─ 自动推导默认工作目录 parentDir
        │     └─ Rust 后端: powershell.exe -NoProfile -ExecutionPolicy Bypass -File "<cleanTarget>"
        │
        └─▶ 其他纯命令脚本 (如 `wll checkin`):
              └─ 保持原 powershell.exe -Command 通道执行
```

## 3. 编码与进程脱离考量
- Windows 中文环境下 `cmd.exe` 输出可能为 GBK (CP936) 或 UTF-8，后端读取输出时应先尝试 `String::from_utf8`，失败时按 Windows ANSI/GBK 解码（或提示输出），避免乱码报错；
- `cmd.exe /c` 执行批处理时，若批处理内部启动了独立的 GUI 子进程（如 `Start-Process Weixin.exe`），使用 `CREATE_NO_WINDOW (0x08000000)` 避免黑框闪烁，同时等待批处理自身返回（注意：`微信双开.bat` 在 `errorlevel 1` 时有 `pause`，正常退出码为 0 会立即结束；若发生错误为防止后台无窗口 `pause` 永久挂起，在 `cmd.exe /c` 中可确保stdin重定向为 `Stdio::null()`）。
