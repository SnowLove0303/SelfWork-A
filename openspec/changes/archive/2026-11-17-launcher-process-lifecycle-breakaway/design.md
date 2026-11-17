# Design: 快速启动外部进程生命周期解耦与 Windows Shell 独立脱壳技术架构

## 1. 进程生命周期与父子拓扑演进图 (Process Topology Evolution)

```mermaid
flowchart TD
    subgraph 改造前 (劣质强绑定 - 随同退出)
        SW1["SelfWork.exe (PID: A, InJob=true)"] -->|CreateProcess / Flags=0| APP1["Weixin / Chrome / Notepad (PID: B, PPID: A, InJob=true)"]
        SW1 -.->|Task Manager 结束任务 / taskkill /T| KILL1["全部子进程一同被操作系统强制杀死 💥"]
    end

    subgraph 改造后 (工业级脱壳 - 永续独立存活)
        SW2["SelfWork.exe (PID: C)"] -->|ShellExecuteW / open| EXPLORER["Windows Shell (explorer.exe / DCOM)"]
        EXPLORER -->|独立派生| APP2["Weixin / Chrome / Notepad (PID: D, PPID: explorer.exe)"]
        SW2 -.->|用户关闭窗口 X / 退出| DIE["SelfWork.exe 正常关闭 退出码 0"]
        APP2 -->|完全不受影响| ALIVE["目标程序持续在用户桌面独立正常运行 🟢"]
    end
```

## 2. 核心架构设计与实现策略

### 2.1 Win32 原生 `ShellExecuteW` 绑定
在 `src-tauri/src/lib.rs` 中：
```rust
#[cfg(windows)]
#[link(name = "shell32")]
extern "system" {
    fn ShellExecuteW(
        hwnd: isize,
        lpOperation: *const u16,
        lpFile: *const u16,
        lpParameters: *const u16,
        lpDirectory: *const u16,
        nShowCmd: i32,
    ) -> isize;
}
```
辅助编码函数：
```rust
#[cfg(windows)]
fn to_wide(s: &str) -> Vec<u16> {
    use std::ffi::OsStr;
    use std::os::windows::ffi::OsStrExt;
    OsStr::new(s).encode_wide().chain(std::iter::once(0)).collect()
}
```

### 2.2 `launch_custom_target` 多态分支增强
1. **本地可执行文件 (`.exe`)**：
   - 提取参数字符串并转为宽字符；
   - 提取工作目录（显式指定或默认回退至父目录）并转为宽字符；
   - 调用 `ShellExecuteW(0, "open", target, args, work_dir, SW_SHOWNORMAL)`；
   - 当返回值 `> 32` 时，代表成功由系统桌面外壳接管；
   - 若返回值 `<= 32`（极罕见），降级至原生 `Command` 并注入脱壳进程组标志：
     `cmd.creation_flags(0x00000200 /* CREATE_NEW_PROCESS_GROUP */ | 0x00000008 /* DETACHED_PROCESS */);`
2. **快捷方式 (`.lnk`) 与网络 URL (`https://...`)**：
   - `ShellExecuteW` 原生支持直接解析 `.lnk` 与 URL，毫秒级无缝直达，无需启动繁重的 `powershell.exe Start-Process`；
   - 消除命令行黑框闪烁，彻底消除 PowerShell 额外开销。
3. **物理文件夹 (`target_path.is_dir()`)**：
   - 继续保持 Windows 原生 `explorer.exe /separate` 独立窗口唤起机制，无缝适配分屏快速启动。

### 2.3 运维管理脚本净化 (`replace-and-launch.mjs`)
- 将 `taskkill /F /IM SelfWork.exe /T` 精准修正为 `taskkill /F /IM SelfWork.exe`；
- 杜绝向子进程级联下发 SIGKILL，确保系统维护与版本热更时用户业务程序零干扰。
