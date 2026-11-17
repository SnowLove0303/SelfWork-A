# Design Document: 快速启动分屏多显示器精准投送与几何平铺架构设计

## 1. 架构因果拓扑与状态机

```mermaid
flowchart TD
    UI[用户触发分屏启动 / 组合启动] --> Param[收集 LauncherItem 清单 & 目标屏幕 targetMonitorIndex]
    Param --> LaunchLoop[异步依次拉起外部应用 / 文件夹 / 脚本]
    LaunchLoop --> WaitDelay[自适应等待 400ms 窗口 Handle 创建]
    WaitDelay --> InvokeBackend[Tauri IPC: arrange_combo_windows(specs, targetMonitorIndex)]
    
    subgraph Rust & Win32 调度平面
        InvokeBackend --> GetMon[get_system_monitors_internal: 提取目标显示器工作区 (base_x, base_y, work_w, work_h)]
        GetMon --> GenScript[生成纯正 PowerShell 5.1 兼容编排脚本 (-and / -or)]
        GenScript --> WinSnapEngine[WinSnap 原生引擎: WinSta0/Default 桌面枚举]
        WinSnapEngine --> MultiRound[自适应多轮探测: 最多 6 轮 × 300ms]
        MultiRound --> MatchWin[多维匹配: FolderPath | Title | ProcessStem | ItemName]
        MatchWin --> RestoreWin[ShowWindow(SW_RESTORE=9) 解除最大化]
        RestoreWin --> MoveWin[SetWindowPos(Px, Py, Pw, Ph) 物理几何就位]
        MoveWin --> ReturnCount[真实退出码与精准匹配计数统计]
    end
    
    ReturnCount --> AuditCheck{是否全部就绪?}
    AuditCheck -- 是 --> LogSuccess[前端上报: 成功停靠 M/M 个窗口至 目标屏幕]
    AuditCheck -- 否 --> LogWarn[前端如实告警: 仅停靠 K/M 个窗口]
```

## 2. 关键根治措施

### 2.1 解释器语法纯净化（Windows PowerShell 5.1 绝对兼容）
- 彻底纠正 `src-tauri/src/lib.rs` 中嵌入的脚本逻辑：
  将：
  ```powershell
  if ($nameUpper.Length -ge 2 && ($tUpper.Contains($nameUpper) || ...))
  ```
  纠正为符合 PS 5.1 规范的纯正语法：
  ```powershell
  if ($nameUpper.Length -ge 2 -and ($tUpper.Contains($nameUpper) -or ...))
  ```
- 杜绝一切 `&&` 和 `||` 语句分隔符与逻辑符，保证在任何版本的 Windows 上解析退出码均为 0。

### 2.2 扩展 `WindowPlacementSpec` 结构与多维模糊指纹比对
- 在 `WindowPlacementSpec` 中新增可选字段 `pub item_name: Option<String>`，前端传入用户定义的展示名称（例如“Chrome 浏览器”、“微信”）；
- 后端提取 `target_stem`（即去掉 `.exe` 的主名，如 `chrome`、`msedge`、`Code`）；
- 在匹配时实施多维命中模型：
  1. 文件夹路径完全匹配或末尾目录名匹配；
  2. 窗口标题包含 `item_name` 或包含 `target_name` 或包含 `target_stem`；
  3. 窗口归属进程名称等于 `target_stem` 或 `target_name`；
- 命中即占位并加入 `$usedHwnds` 排除集合，防止不同窗口发生重叠。

### 2.3 根除弱断言伪通，建立真实物理退出码机制
- 移除 `Rust` 中的 `.unwrap_or(specs.len())` 假通逻辑；
- 当 `powershell.exe` 执行异常或返回解析失败时，直接返回错误并在日志中真实体现，严禁虚假报喜；
- 输出真实放置成功的窗口数 `placedCount`。

### 2.4 最大化还原与无缝缝隙补偿
- 调用 `[WinSnap]::ShowWindow([IntPtr]$foundHwnd, 9)`（`SW_RESTORE`），消除 Windows 窗口最大化时锁定坐标的问题；
- 保留 `DWM_GAP_COMPENSATION`，对内部相邻边缘进行 6~8 像素扩展微调，消除 Windows 11 DWM 投影大缝隙。
