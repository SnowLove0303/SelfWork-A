pub mod db;

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::net::{SocketAddr, TcpStream};
use std::path::Path;
use std::time::{Duration, SystemTime, UNIX_EPOCH};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PingResponse {
    pub status: String,
    pub version: String,
    pub server_time_ms: u128,
    pub os_family: String,
    pub arch: String,
}

#[tauri::command]
fn workbench_ping(client_time_ms: Option<u64>) -> Result<PingResponse, String> {
    let _ = client_time_ms;
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|e| e.to_string())?;

    Ok(PingResponse {
        status: "ready".into(),
        version: env!("CARGO_PKG_VERSION").into(),
        server_time_ms: now.as_millis(),
        os_family: std::env::consts::FAMILY.into(),
        arch: std::env::consts::ARCH.into(),
    })
}

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

#[cfg(windows)]
fn str_to_wide_null(s: &str) -> Vec<u16> {
    use std::ffi::OsStr;
    use std::os::windows::ffi::OsStrExt;
    OsStr::new(s).encode_wide().chain(std::iter::once(0)).collect()
}

/// 通用桌面启动命令：支持启动本地可执行程序、快捷方式 (.lnk)、目录或 URL 网址
/// 针对 Windows 下本地 .exe 优先通过原生 ShellExecuteW 委托桌面外壳 (explorer.exe) 独立拉起，彻底脱离父进程生命周期与作业容器限制
/// 针对物理文件夹，通过 Windows 原生 explorer.exe /separate 毫秒级直达独立窗口唤起
/// 针对 .lnk 快捷方式与 URL 网址，通过 Windows 原生 ShellExecuteW 秒级直达，消除 powershell 额外开销与黑框闪烁
/// 剥离用户从资源管理器"复制文件地址"粘贴时带有的外层引号
fn strip_outer_quotes(s: &str) -> &str {
    let t = s.trim();
    if t.len() >= 2
        && ((t.starts_with('"') && t.ends_with('"')) || (t.starts_with('\'') && t.ends_with('\'')))
    {
        &t[1..t.len() - 1]
    } else {
        t
    }
}

#[tauri::command]
async fn launch_custom_target(
    target: String,
    args: Option<String>,
    working_dir: Option<String>,
) -> Result<String, String> {
    tauri::async_runtime::spawn_blocking(move || {
        let trimmed_target = strip_outer_quotes(&target);
        if trimmed_target.is_empty() {
            return Err("目标路径不能为空".to_string());
        }

        #[cfg(windows)]
        {
            use std::os::windows::process::CommandExt;
            use std::path::Path;

            let target_path = Path::new(trimmed_target);
            let is_exe = target_path
                .extension()
                .map_or(false, |ext| ext.eq_ignore_ascii_case("exe"));

            if is_exe && target_path.exists() {
                // 1. 本地可执行文件 (.exe): 优先通过 Windows 原生 ShellExecuteW 委托桌面外壳 (explorer.exe) 独立拉起
                // 彻底脱离 SelfWork 的 Job Object 与进程树依赖，保证 SelfWork 关闭/退出时外部应用持续正常存活
                let effective_dir = if let Some(ref dir) = working_dir {
                    let trimmed_dir = dir.trim();
                    if !trimmed_dir.is_empty() {
                        Some(trimmed_dir.to_string())
                    } else {
                        target_path.parent().map(|p| p.display().to_string())
                    }
                } else {
                    target_path.parent().map(|p| p.display().to_string())
                };

                let op_wide = str_to_wide_null("open");
                let file_wide = str_to_wide_null(trimmed_target);
                let params_wide = args.as_ref().map(|a| str_to_wide_null(a.trim()));
                let dir_wide = effective_dir.as_ref().map(|d| str_to_wide_null(d.trim()));

                let ret = unsafe {
                    ShellExecuteW(
                        0,
                        op_wide.as_ptr(),
                        file_wide.as_ptr(),
                        params_wide.as_ref().map_or(std::ptr::null(), |v| v.as_ptr()),
                        dir_wide.as_ref().map_or(std::ptr::null(), |v| v.as_ptr()),
                        1, // SW_SHOWNORMAL
                    )
                };

                // ShellExecuteW 返回值 > 32 表示系统外壳成功拉起进程
                if ret > 32 {
                    Ok(format!("成功唤起应用程序: {}", trimmed_target))
                } else {
                    // 安全兜底：若系统外壳拉起受阻，降级使用注入脱离控制台与独立进程组标志的原生 Command
                    let mut cmd = std::process::Command::new(trimmed_target);
                    if let Some(ref arg_str) = args {
                        let trimmed_args = arg_str.trim();
                        if !trimmed_args.is_empty() {
                            cmd.args(trimmed_args.split_whitespace());
                        }
                    }
                    if let Some(ref dir) = effective_dir {
                        cmd.current_dir(dir);
                    }
                    // 0x00000200 = CREATE_NEW_PROCESS_GROUP, 0x00000008 = DETACHED_PROCESS
                    cmd.creation_flags(0x00000200 | 0x00000008);
                    cmd.spawn().map_err(|e| format!("启动应用程序失败: {}", e))?;
                    Ok(format!("成功唤起应用程序: {}", trimmed_target))
                }
            } else if target_path.is_dir() {
                // 2. 本地物理文件夹/目录：直接通过 Windows 原生 explorer.exe 毫秒级直达独立唤起，0 命令行窗口闪烁
                // 修复：Windows 资源管理器 explorer.exe 不支持 /separate 参数，传入会导致 explorer 解析失败并错误退回到默认的“此电脑/文档”；
                // 现直接以原生规范传递目录路径参数，彻底确保精准直达指定文件夹
                let normalized = trimmed_target.replace('/', "\\");
                let mut cmd = std::process::Command::new("explorer.exe");
                cmd.arg(&normalized);
                cmd.creation_flags(0x00000200 | 0x00000008);
                cmd.spawn().map_err(|e| format!("唤起文件资源管理器失败: {}", e))?;
                Ok(format!("成功打开文件夹: {}", normalized))
            } else {
                // 3. 快捷方式 (.lnk)、网页 URL 或脚本指令：优先通过 ShellExecuteW 委托原生通道秒级直达
                // 若包含本地磁盘绝对路径但物理不存在，返回明确的错误提示 (REQ-LAUNCHER-FOLDER-06)
                let is_url = trimmed_target.starts_with("http://")
                    || trimmed_target.starts_with("https://")
                    || trimmed_target.starts_with("ftp://")
                    || trimmed_target.starts_with("mailto:");

                let is_local_disk_path = !is_url
                    && (
                        (trimmed_target.len() >= 3
                            && trimmed_target.as_bytes()[1] == b':'
                            && (trimmed_target.as_bytes()[2] == b'\\' || trimmed_target.as_bytes()[2] == b'/'))
                        || trimmed_target.starts_with("\\\\")
                    );

                if is_local_disk_path && !target_path.exists() {
                    return Err(format!("目标路径不存在或无法访问: {}", trimmed_target));
                }

                // 优先通过 ShellExecuteW 唤起快捷方式与网页 URL，消除 powershell 启动开销与黑框闪烁
                let effective_dir = working_dir.as_deref().or_else(|| {
                    if target_path.exists() {
                        target_path.parent().and_then(|p| p.to_str())
                    } else {
                        None
                    }
                });

                let op_wide = str_to_wide_null("open");
                let file_wide = str_to_wide_null(trimmed_target);
                let params_wide = args.as_ref().map(|a| str_to_wide_null(a.trim()));
                let dir_wide = effective_dir.map(str_to_wide_null);

                let ret = unsafe {
                    ShellExecuteW(
                        0,
                        op_wide.as_ptr(),
                        file_wide.as_ptr(),
                        params_wide.as_ref().map_or(std::ptr::null(), |v| v.as_ptr()),
                        dir_wide.as_ref().map_or(std::ptr::null(), |v| v.as_ptr()),
                        1, // SW_SHOWNORMAL
                    )
                };

                if ret > 32 {
                    Ok(format!("成功唤起: {}", trimmed_target))
                } else {
                    // 降级使用 powershell Start-Process
                    let mut ps_script = format!("Start-Process -FilePath '{}'", trimmed_target.replace('\'', "''"));
                    if let Some(arg_str) = args {
                        let trimmed_args = arg_str.trim();
                        if !trimmed_args.is_empty() {
                            ps_script.push_str(&format!(" -ArgumentList '{}'", trimmed_args.replace('\'', "''")));
                        }
                    }
                    if let Some(dir) = working_dir {
                        let trimmed_dir = dir.trim();
                        if !trimmed_dir.is_empty() {
                            ps_script.push_str(&format!(" -WorkingDirectory '{}'", trimmed_dir.replace('\'', "''")));
                        }
                    } else if target_path.exists() {
                        if let Some(parent) = target_path.parent() {
                            ps_script.push_str(&format!(" -WorkingDirectory '{}'", parent.display().to_string().replace('\'', "''")));
                        }
                    }

                    let mut cmd = std::process::Command::new("powershell.exe");
                    cmd.creation_flags(0x08000000 | 0x00000200 | 0x00000008); // CREATE_NO_WINDOW | CREATE_NEW_PROCESS_GROUP | DETACHED_PROCESS
                    cmd.args(&["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", &ps_script]);
                    cmd.spawn().map_err(|e| format!("唤起目标失败: {}", e))?;
                    Ok(format!("成功唤起: {}", trimmed_target))
                }
            }
        }

        #[cfg(not(windows))]
        {
            let mut cmd = std::process::Command::new("sh");
            cmd.args(&["-c", &format!("xdg-open \"{}\"", trimmed_target)]);
            cmd.spawn().map_err(|e| format!("启动目标失败: {}", e))?;
            Ok(format!("成功唤起: {}", trimmed_target))
        }
    })
    .await
    .map_err(|e| format!("异步启动失败: {}", e))?
}

/// 提取本地可执行文件 (.exe) 或快捷方式 (.lnk) 的高品质原生图标，返回 Base64 Data URL
#[tauri::command]
async fn get_app_icon(target: String) -> Result<String, String> {
    tauri::async_runtime::spawn_blocking(move || {
        let trimmed = target.trim();
        if trimmed.is_empty() {
            return Err("目标路径不能为空".to_string());
        }
        let path = std::path::Path::new(trimmed);
        if !path.exists() {
            return Err(format!("文件不存在: {}", trimmed));
        }

        #[cfg(windows)]
        {
            use std::os::windows::process::CommandExt;
            // 利用 Windows 原生 System.Drawing.Icon 提取并转为 Base64 PNG
            let script = format!(
                "Add-Type -AssemblyName System.Drawing; \
                 $icon = [System.Drawing.Icon]::ExtractAssociatedIcon('{}'); \
                 if ($icon) {{ \
                     $ms = New-Object System.IO.MemoryStream; \
                     $bitmap = $icon.ToBitmap(); \
                     $bitmap.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png); \
                     [Convert]::ToBase64String($ms.ToArray()) \
                 }}",
                trimmed.replace('\'', "''")
            );

            let mut cmd = std::process::Command::new("powershell.exe");
            cmd.creation_flags(0x08000000); // CREATE_NO_WINDOW
            cmd.args(&["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", &script]);
            let output = cmd.output().map_err(|e| format!("提取图标进程失败: {}", e))?;
            let base64_str = String::from_utf8_lossy(&output.stdout).trim().to_string();

            if !base64_str.is_empty() {
                Ok(format!("data:image/png;base64,{}", base64_str))
            } else {
                Err("无法从目标提取关联图标".to_string())
            }
        }

        #[cfg(not(windows))]
        {
            Err("非 Windows 平台暂不支持图标提取".to_string())
        }
    })
    .await
    .map_err(|e| format!("异步提取图标失败: {}", e))?
}

/// 通用脚本执行命令：支持后台静默执行 PowerShell / CMD 脚本指令并返回输出
#[tauri::command]
async fn execute_custom_script(
    script_type: String,
    script_content: String,
    working_dir: Option<String>,
) -> Result<String, String> {
    tauri::async_runtime::spawn_blocking(move || {
        let raw_script = script_content.trim();
        if raw_script.is_empty() {
            return Err("脚本内容不能为空".to_string());
        }

        #[cfg(windows)]
        {
            use std::os::windows::process::CommandExt;
            use std::path::Path;
            use std::process::Stdio;

            let unquoted = strip_outer_quotes(raw_script);
            let unquoted_path = Path::new(unquoted);
            let ext = unquoted_path
                .extension()
                .and_then(|e| e.to_str())
                .unwrap_or("")
                .to_ascii_lowercase();

            let is_local_bat = (ext == "bat" || ext == "cmd") && unquoted_path.exists();
            let is_local_ps1 = ext == "ps1" && unquoted_path.exists();

            let mut cmd = if script_type.eq_ignore_ascii_case("cmd")
                || script_type.eq_ignore_ascii_case("bat")
                || is_local_bat
            {
                let mut c = std::process::Command::new("cmd.exe");
                if is_local_bat {
                    c.args(["/c", unquoted]);
                } else {
                    c.raw_arg(format!("/c {}", raw_script));
                }
                c
            } else if is_local_ps1 {
                let mut c = std::process::Command::new("powershell.exe");
                c.args(["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", unquoted]);
                c
            } else {
                let mut c = std::process::Command::new("powershell.exe");
                c.args([
                    "-NoProfile",
                    "-ExecutionPolicy",
                    "Bypass",
                    "-Command",
                    raw_script,
                ]);
                c
            };

            cmd.creation_flags(0x08000000); // CREATE_NO_WINDOW
            cmd.stdin(Stdio::null()); // 防止脚本内部 pause 等交互等待导致后台永久挂起

            let effective_dir = working_dir
                .as_deref()
                .map(strip_outer_quotes)
                .filter(|d| !d.is_empty())
                .map(|d| d.to_string())
                .or_else(|| {
                    if is_local_bat || is_local_ps1 {
                        unquoted_path.parent().map(|p| p.display().to_string())
                    } else {
                        None
                    }
                });

            if let Some(ref dir) = effective_dir {
                cmd.current_dir(dir);
            }

            let output = cmd.output().map_err(|e| format!("脚本执行失败: {}", e))?;
            let stdout = String::from_utf8_lossy(&output.stdout).trim().to_string();
            let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();

            if !output.status.success() && !stderr.is_empty() {
                if stdout.is_empty() {
                    return Err(stderr);
                } else {
                    return Err(format!("{}\n{}", stdout, stderr));
                }
            }

            if !output.status.success() {
                return Err(if stdout.is_empty() {
                    format!("脚本退出码异常: {:?}", output.status.code())
                } else {
                    stdout
                });
            }

            if !stdout.is_empty() {
                Ok(stdout)
            } else if !stderr.is_empty() {
                Ok(stderr)
            } else {
                Ok("执行成功 (无输出)".to_string())
            }
        }

        #[cfg(not(windows))]
        {
            let mut cmd = std::process::Command::new("sh");
            cmd.args(&["-c", raw_script]);
            let output = cmd.output().map_err(|e| format!("执行失败: {}", e))?;
            let stdout = String::from_utf8_lossy(&output.stdout).trim().to_string();
            Ok(stdout)
        }
    })
    .await
    .map_err(|e| format!("异步执行任务失败: {}", e))?
}

/// 执行 Workflow-Launcher.ps1 脚本指令 (向前兼容保留)
/// 在 Windows 下配置 CREATE_NO_WINDOW 标志彻底杜绝命令行黑框闪烁
#[tauri::command]
async fn run_launcher_command(action: String, target: String) -> Result<String, String> {
    tauri::async_runtime::spawn_blocking(move || {
        let script_path = r"D:\应用研究\统一启动器\System\Workflow-Launcher.ps1";
        if !Path::new(script_path).exists() {
            return Err(format!("未找到启动器脚本文件: {}", script_path));
        }

        let mut cmd = std::process::Command::new("powershell.exe");
        let mut args = vec![
            "-NoProfile".to_string(),
            "-ExecutionPolicy".to_string(),
            "Bypass".to_string(),
            "-File".to_string(),
            script_path.to_string(),
        ];

        let trimmed_action = action.trim();
        if !trimmed_action.is_empty() {
            args.push(trimmed_action.to_string());
        }

        let trimmed_target = target.trim();
        if !trimmed_target.is_empty() {
            args.push(trimmed_target.to_string());
        }

        cmd.args(&args);

        #[cfg(windows)]
        {
            use std::os::windows::process::CommandExt;
            cmd.creation_flags(0x08000000); // CREATE_NO_WINDOW
        }

        let output = cmd.output().map_err(|e| format!("执行命令失败: {}", e))?;
        let stdout = String::from_utf8_lossy(&output.stdout).trim().to_string();
        let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();

        if !output.status.success() && !stderr.is_empty() {
            if stdout.is_empty() {
                return Err(stderr);
            } else {
                return Err(format!("{}\n{}", stdout, stderr));
            }
        }

        if !stdout.is_empty() {
            Ok(stdout)
        } else if !stderr.is_empty() {
            Ok(stderr)
        } else {
            Ok("执行成功 (无回显报文)".to_string())
        }
    })
    .await
    .map_err(|e| format!("异步执行任务失败: {}", e))?
}

/// 快速检测本地端口连通性 (短超时 150ms，多端口并行检测)
#[tauri::command]
async fn check_service_ports(ports: Vec<u16>) -> Result<HashMap<u16, bool>, String> {
    tauri::async_runtime::spawn_blocking(move || {
        let results = std::thread::scope(|s| {
            let mut handles = Vec::with_capacity(ports.len());
            for port in ports {
                handles.push(s.spawn(move || {
                    let addr = SocketAddr::from(([127, 0, 0, 1], port));
                    let is_open = TcpStream::connect_timeout(&addr, Duration::from_millis(150)).is_ok();
                    (port, is_open)
                }));
            }
            let mut map = HashMap::with_capacity(handles.len());
            for h in handles {
                if let Ok((port, is_open)) = h.join() {
                    map.insert(port, is_open);
                }
            }
            map
        });
        Ok(results)
    })
    .await
    .map_err(|e| format!("端口并发检测失败: {}", e))?
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HealthInspectionPayload {
    pub ports: Vec<u16>,
    pub process_names: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemHealthSnapshot {
    pub ports: HashMap<u16, bool>,
    pub processes: HashMap<String, Vec<u32>>,
    pub duration_ms: u64,
}

/// 全维系统健康真实巡检 (合并端口并发扫描与进程快照枚举，单线程秒级完成)
#[tauri::command]
async fn inspect_system_health(payload: HealthInspectionPayload) -> Result<SystemHealthSnapshot, String> {
    tauri::async_runtime::spawn_blocking(move || {
        let start_time = std::time::Instant::now();

        // 1. 并发扫描所有目标端口
        let (ports, processes) = std::thread::scope(|s| {
            let port_handle = s.spawn(|| {
                let mut p_map = HashMap::with_capacity(payload.ports.len());
                for port in payload.ports {
                    let addr = SocketAddr::from(([127, 0, 0, 1], port));
                    let is_open = TcpStream::connect_timeout(&addr, Duration::from_millis(150)).is_ok();
                    p_map.insert(port, is_open);
                }
                p_map
            });

            // 2. Windows Toolhelp32Snapshot 原生进程快照枚举
            let proc_handle = s.spawn(|| {
                let mut map: HashMap<String, Vec<u32>> = HashMap::new();
                for name in &payload.process_names {
                    map.insert(name.to_lowercase(), Vec::new());
                }

                #[cfg(windows)]
                {
                    use windows_sys::Win32::Foundation::CloseHandle;
                    use windows_sys::Win32::System::Diagnostics::ToolHelp::{
                        CreateToolhelp32Snapshot, Process32FirstW, Process32NextW, PROCESSENTRY32W,
                        TH32CS_SNAPPROCESS,
                    };

                    unsafe {
                        let snapshot = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0);
                        if snapshot != windows_sys::Win32::Foundation::INVALID_HANDLE_VALUE {
                            let mut entry: PROCESSENTRY32W = std::mem::zeroed();
                            entry.dwSize = std::mem::size_of::<PROCESSENTRY32W>() as u32;

                            if Process32FirstW(snapshot, &mut entry) != 0 {
                                loop {
                                    let len = entry.szExeFile.iter().position(|&c| c == 0).unwrap_or(entry.szExeFile.len());
                                    let exe_name = String::from_utf16_lossy(&entry.szExeFile[..len]).to_lowercase();

                                    if let Some(pids) = map.get_mut(&exe_name) {
                                        pids.push(entry.th32ProcessID);
                                    }

                                    if Process32NextW(snapshot, &mut entry) == 0 {
                                        break;
                                    }
                                }
                            }
                            CloseHandle(snapshot);
                        }
                    }
                }
                map
            });

            let port_map = port_handle.join().unwrap_or_default();
            let proc_map = proc_handle.join().unwrap_or_default();

            (port_map, proc_map)
        });

        let duration_ms = start_time.elapsed().as_millis() as u64;

        Ok(SystemHealthSnapshot {
            ports,
            processes,
            duration_ms,
        })
    })
    .await
    .map_err(|e| format!("全维巡检任务失败: {}", e))?
}

/// 窗口原生最小化
#[tauri::command]
async fn window_minimize(window: tauri::Window) -> Result<(), String> {
    window.minimize().map_err(|e| e.to_string())
}

/// 窗口原生最大化/还原切换
#[tauri::command]
async fn window_toggle_maximize(window: tauri::Window) -> Result<bool, String> {
    let is_max = window.is_maximized().map_err(|e| e.to_string())?;
    if is_max {
        window.unmaximize().map_err(|e| e.to_string())?;
        Ok(false)
    } else {
        window.maximize().map_err(|e| e.to_string())?;
        Ok(true)
    }
}

/// 检查窗口是否已处于最大化状态
#[tauri::command]
async fn window_is_maximized(window: tauri::Window) -> Result<bool, String> {
    window.is_maximized().map_err(|e| e.to_string())
}

/// 窗口原生关闭
#[tauri::command]
async fn window_close(window: tauri::Window) -> Result<(), String> {
    window.close().map_err(|e| e.to_string())
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct RectDto {
    pub x: i32,
    pub y: i32,
    pub width: i32,
    pub height: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemMonitorInfo {
    pub index: usize,
    pub name: String,
    pub is_primary: bool,
    pub work_area: RectDto,
    pub bounds: RectDto,
}

pub fn get_system_monitors_internal() -> Vec<SystemMonitorInfo> {
    #[cfg(windows)]
    {
        use std::process::Command;
        use std::os::windows::process::CommandExt;

        let ps_code = r#"Add-Type -AssemblyName System.Windows.Forms; $screens = [System.Windows.Forms.Screen]::AllScreens | Sort-Object -Property @{Expression = { -not $_.Primary }}, @{Expression = { $_.Bounds.X }}; $idx = 0; $list = @($screens | ForEach-Object { $p = $_.Primary; $name = if ($p) { "屏幕 $($idx + 1) (主屏 $($_.Bounds.Width)×$($_.Bounds.Height))" } else { "屏幕 $($idx + 1) (副屏 $($_.Bounds.Width)×$($_.Bounds.Height))" }; $obj = [PSCustomObject]@{ index = $idx; name = $name; is_primary = $p; work_area = [PSCustomObject]@{ x = [int]$_.WorkingArea.X; y = [int]$_.WorkingArea.Y; width = [int]$_.WorkingArea.Width; height = [int]$_.WorkingArea.Height }; bounds = [PSCustomObject]@{ x = [int]$_.Bounds.X; y = [int]$_.Bounds.Y; width = [int]$_.Bounds.Width; height = [int]$_.Bounds.Height } }; $idx++; $obj }); $list | ConvertTo-Json -Compress"#;

        let mut cmd = Command::new("powershell.exe");
        cmd.creation_flags(0x08000000); // CREATE_NO_WINDOW
        cmd.args(["-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-Command", ps_code]);

        if let Ok(output) = cmd.output() {
            if output.status.success() {
                let stdout = String::from_utf8_lossy(&output.stdout).trim().to_string();
                if let Ok(list) = serde_json::from_str::<Vec<SystemMonitorInfo>>(&stdout) {
                    if !list.is_empty() {
                        return list;
                    }
                }
                if let Ok(single) = serde_json::from_str::<SystemMonitorInfo>(&stdout) {
                    return vec![single];
                }
            }
        }
    }

    vec![SystemMonitorInfo {
        index: 0,
        name: "默认主显示器 (1920×1080)".to_string(),
        is_primary: true,
        work_area: RectDto { x: 0, y: 0, width: 1920, height: 1032 },
        bounds: RectDto { x: 0, y: 0, width: 1920, height: 1080 },
    }]
}

/// 获取系统连接的所有活动物理显示器及其工作区与主副屏标记 (REQ-MULTIMONITOR-01)
#[tauri::command]
async fn get_system_monitors() -> Result<Vec<SystemMonitorInfo>, String> {
    tauri::async_runtime::spawn_blocking(move || {
        Ok(get_system_monitors_internal())
    })
    .await
    .map_err(|e| format!("获取系统显示器信息失败: {}", e))?
}

/// 屏幕窗口分屏编排槽位定义契约 (Window Snap Tiling)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WindowPlacementSpec {
    pub target: String, // 文件夹绝对路径或应用关键字
    #[serde(default)]
    pub item_name: Option<String>, // 前端条目友好显示名称 (如 "Chrome 浏览器", "微信", "代码仓库")
    pub x_ratio: f64,   // 0.0 ~ 1.0 (屏幕横向起始占比)
    pub y_ratio: f64,   // 0.0 ~ 1.0 (屏幕纵向起始占比)
    pub w_ratio: f64,   // 0.0 ~ 1.0 (屏幕宽度占比)
    pub h_ratio: f64,   // 0.0 ~ 1.0 (屏幕高度占比)
}

/// 智能窗口吸附编排：将指定目标窗口自动平铺吸附至指定屏幕工作区，并消除 DWM 大缝隙 (REQ-SNAP-TARGET-01 & REQ-SNAP-DEDUP-02 & REQ-SNAP-RETRY-03)
#[tauri::command]
async fn arrange_combo_windows(
    specs: Vec<WindowPlacementSpec>,
    target_monitor_index: Option<usize>,
) -> Result<usize, String> {
    tauri::async_runtime::spawn_blocking(move || {
        #[cfg(windows)]
        {
            use std::path::Path;
            use std::process::Command;
            use std::os::windows::process::CommandExt;

            if specs.is_empty() {
                return Ok(0);
            }

            // 1. 获取目标显示器真实可用工作区
            let monitors = get_system_monitors_internal();
            let target_monitor = target_monitor_index
                .and_then(|idx| monitors.get(idx))
                .or_else(|| monitors.iter().find(|m| m.is_primary))
                .or_else(|| monitors.first());

            let (base_x, base_y, work_w, work_h) = if let Some(m) = target_monitor {
                (m.work_area.x, m.work_area.y, m.work_area.width.max(800), m.work_area.height.max(600))
            } else {
                (0, 0, 1920, 1032)
            };

            // DWM 隐形阴影边框补偿量 (像素) 消除缝隙实现紧密无缝拼接
            const DWM_GAP_COMPENSATION: i32 = 7;

            // 2. 构造规格数据与多轮自适应探测轮询脚本
            let mut specs_setup = String::new();
            specs_setup.push_str("$specs = @(\n");
            for (idx, spec) in specs.iter().enumerate() {
                let mut px = base_x + (work_w as f64 * spec.x_ratio).round() as i32;
                let mut py = base_y + (work_h as f64 * spec.y_ratio).round() as i32;
                let mut pw = (work_w as f64 * spec.w_ratio).round() as i32;
                let mut ph = (work_h as f64 * spec.h_ratio).round() as i32;

                // 消除缝隙：为内部相邻边缘引入微重叠补偿
                if spec.x_ratio > 0.01 {
                    px -= DWM_GAP_COMPENSATION;
                    pw += DWM_GAP_COMPENSATION;
                }
                if spec.x_ratio + spec.w_ratio < 0.98 {
                    pw += DWM_GAP_COMPENSATION;
                }
                if spec.y_ratio > 0.01 {
                    py -= 4;
                    ph += 4;
                }
                if spec.y_ratio + spec.h_ratio < 0.98 {
                    ph += DWM_GAP_COMPENSATION;
                }

                let escaped_target = spec.target.trim().replace('\'', "''").replace('/', "\\");
                let target_path = Path::new(&spec.target);
                let target_name = target_path
                    .file_name()
                    .and_then(|n| n.to_str())
                    .unwrap_or("")
                    .replace('\'', "''");
                let target_stem = target_path
                    .file_stem()
                    .and_then(|n| n.to_str())
                    .unwrap_or("")
                    .replace('\'', "''");
                let item_name = spec
                    .item_name
                    .as_deref()
                    .unwrap_or("")
                    .trim()
                    .replace('\'', "''");

                specs_setup.push_str(&format!(
                    "  [PSCustomObject]@{{ Id = {idx}; Target = '{escaped_target}'; TargetName = '{target_name}'; TargetStem = '{target_stem}'; ItemName = '{item_name}'; Px = {px}; Py = {py}; Pw = {pw}; Ph = {ph}; Placed = $false }}\n"
                ));
            }
            specs_setup.push_str(")\n");

            let ps_script = format!(r#"
Add-Type -TypeDefinition @"
using System;
using System.Text;
using System.Collections.Generic;
using System.Runtime.InteropServices;

public class WinSnap {{
    [DllImport("user32.dll")]
    public static extern bool SetWindowPos(IntPtr hWnd, IntPtr hWndInsertAfter, int X, int Y, int cx, int cy, uint uFlags);
    [DllImport("user32.dll")]
    public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
    [DllImport("user32.dll")]
    public static extern bool IsZoomed(IntPtr hWnd);
    [DllImport("user32.dll", SetLastError = true)]
    public static extern IntPtr OpenWindowStation(string lpszWinSta, bool fInherit, uint dwDesiredAccess);
    [DllImport("user32.dll", SetLastError = true)]
    public static extern bool SetProcessWindowStation(IntPtr hWinSta);
    [DllImport("user32.dll", SetLastError = true)]
    public static extern IntPtr OpenDesktop(string lpszDesktop, uint dwFlags, bool fInherit, uint dwDesiredAccess);
    [DllImport("user32.dll", SetLastError = true)]
    public static extern bool EnumDesktopWindows(IntPtr hDesktop, EnumWindowsProc lpEnumFunc, IntPtr lParam);
    public delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);
    [DllImport("user32.dll", CharSet = CharSet.Unicode)]
    public static extern int GetWindowText(IntPtr hWnd, StringBuilder lpString, int nMaxCount);
    [DllImport("user32.dll", CharSet = CharSet.Unicode)]
    public static extern int GetClassName(IntPtr hWnd, StringBuilder lpString, int nMaxCount);
    [DllImport("user32.dll")]
    public static extern bool IsWindowVisible(IntPtr hWnd);
    [DllImport("user32.dll")]
    public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint lpdwProcessId);

    public class WinEntry {{
        public IntPtr Hwnd;
        public uint Pid;
        public string ClassName;
        public string Title;
    }}

    public static List<WinEntry> TopWindows = new List<WinEntry>();

    private static bool EnumCallback(IntPtr hWnd, IntPtr lParam) {{
        if (!IsWindowVisible(hWnd)) return true;
        uint pid = 0;
        GetWindowThreadProcessId(hWnd, out pid);
        StringBuilder sbT = new StringBuilder(256);
        GetWindowText(hWnd, sbT, 256);
        StringBuilder sbC = new StringBuilder(256);
        GetClassName(hWnd, sbC, 256);
        string t = sbT.ToString();
        string c = sbC.ToString();
        if (t.Length > 0 && c != "Progman" && c != "WorkerW" && !c.Contains("IME")) {{
            TopWindows.Add(new WinEntry {{ Hwnd = hWnd, Pid = pid, ClassName = c, Title = t }});
        }}
        return true;
    }}

    public static WinEntry[] SnapshotTopWindows() {{
        TopWindows.Clear();
        IntPtr hWinsta = OpenWindowStation("WinSta0", false, 0x00020000 | 0x037F);
        if (hWinsta != IntPtr.Zero) {{
            SetProcessWindowStation(hWinsta);
            IntPtr hDesk = OpenDesktop("Default", 0, false, 0x00020000 | 0x01FF);
            if (hDesk != IntPtr.Zero) {{
                EnumDesktopWindows(hDesk, new EnumWindowsProc(EnumCallback), IntPtr.Zero);
            }}
        }}
        return TopWindows.ToArray();
    }}
}}
"@

{specs_setup}
$shell = New-Object -ComObject Shell.Application
$usedHwnds = New-Object 'System.Collections.Generic.HashSet[int]'

# 自适应多轮增量轮询探测管道 (最多 6 轮，最大 2.5s，每轮间隔 300ms)
for ($round = 0; $round -lt 6; $round++) {{
    $unplaced = @($specs | Where-Object {{ -not $_.Placed }})
    if ($unplaced.Count -eq 0) {{
        break
    }}

    $shellWindows = @($shell.Windows())
    $procs = @(Get-Process | Where-Object {{ $_.MainWindowHandle -ne 0 }})
    $topWins = @([WinSnap]::SnapshotTopWindows())

    foreach ($spec in $unplaced) {{
        $targetUpper = $spec.Target.TrimEnd('\').ToUpper()
        $nameUpper = $spec.TargetName.ToUpper()
        $stemUpper = $spec.TargetStem.ToUpper()
        $itemUpper = $spec.ItemName.ToUpper()
        $foundHwnd = 0

        # Layer 1: 优先通过 Shell.Application 精确匹配文件夹物理路径
        foreach ($w in $shellWindows) {{
            try {{
                $hwnd = [int]$w.HWND
                if ($hwnd -eq 0 -or $usedHwnds.Contains($hwnd)) {{
                    continue
                }}
                $p = $w.Document.Folder.Self.Path
                if ($p) {{
                    $pUpper = $p.TrimEnd('\').ToUpper()
                    if ($pUpper -eq $targetUpper -or ($nameUpper.Length -ge 2 -and $pUpper.EndsWith($nameUpper))) {{
                        $foundHwnd = $hwnd
                        break
                    }}
                }}
                if ($nameUpper.Length -ge 2 -and $w.LocationName -and $w.LocationName.ToUpper() -eq $nameUpper) {{
                    $foundHwnd = $hwnd
                    break
                }}
            }} catch {{}}
        }}

        # Layer 2: 遍历 WinSta0/Default 桌面顶级窗口（覆盖原生 CabinetWClass 文件夹窗口及所有活动应用窗口）
        if ($foundHwnd -eq 0) {{
            foreach ($tw in $topWins) {{
                $hwnd = [int]$tw.Hwnd
                if ($hwnd -eq 0 -or $usedHwnds.Contains($hwnd)) {{
                    continue
                }}
                $tUpper = $tw.Title.ToUpper()
                $isMatch = $false
                if ($nameUpper.Length -ge 2 -and $tUpper.Contains($nameUpper)) {{ $isMatch = $true }}
                elseif ($stemUpper.Length -ge 2 -and $tUpper.Contains($stemUpper)) {{ $isMatch = $true }}
                elseif ($itemUpper.Length -ge 2 -and $tUpper.Contains($itemUpper)) {{ $isMatch = $true }}
                elseif ($targetUpper.Length -ge 2 -and $tUpper.Contains($targetUpper)) {{ $isMatch = $true }}

                if ($isMatch) {{
                    $foundHwnd = $hwnd
                    break
                }}
            }}
        }}

        # Layer 3: 若仍未匹配，退回到系统顶层进程主窗口 (MainWindowHandle)
        if ($foundHwnd -eq 0) {{
            foreach ($p in $procs) {{
                $hwnd = [int]$p.MainWindowHandle
                if ($hwnd -eq 0 -or $usedHwnds.Contains($hwnd)) {{
                    continue
                }}
                $titleUpper = if ($p.MainWindowTitle) {{ $p.MainWindowTitle.ToUpper() }} else {{ "" }}
                $procUpper = if ($p.ProcessName) {{ $p.ProcessName.ToUpper() }} else {{ "" }}
                $isMatch = $false
                if ($nameUpper.Length -ge 2 -and ($titleUpper.Contains($nameUpper) -or $procUpper -eq $nameUpper)) {{ $isMatch = $true }}
                elseif ($stemUpper.Length -ge 2 -and ($titleUpper.Contains($stemUpper) -or $procUpper -eq $stemUpper)) {{ $isMatch = $true }}
                elseif ($itemUpper.Length -ge 2 -and $titleUpper.Contains($itemUpper)) {{ $isMatch = $true }}

                if ($isMatch) {{
                    $foundHwnd = $hwnd
                    break
                }}
            }}
        }}

        if ($foundHwnd -ne 0) {{
            $usedHwnds.Add($foundHwnd) | Out-Null
            # 还原窗口尺寸，解除 Windows 最大化状态对 SetWindowPos 坐标的锁定 (SW_RESTORE = 9)
            [void][WinSnap]::ShowWindow([IntPtr]$foundHwnd, 9)
            # 0x0040 = SWP_SHOWWINDOW
            [void][WinSnap]::SetWindowPos([IntPtr]$foundHwnd, [IntPtr]::Zero, $spec.Px, $spec.Py, $spec.Pw, $spec.Ph, 0x0040)
            $spec.Placed = $true
        }}
    }}

    $stillUnplaced = @($specs | Where-Object {{ -not $_.Placed }})
    if ($stillUnplaced.Count -gt 0 -and $round -lt 5) {{
        Start-Sleep -Milliseconds 300
    }}
}}

$placedCount = @($specs | Where-Object {{ $_.Placed }}).Count
Write-Output $placedCount
"#, specs_setup = specs_setup);

            let mut cmd = Command::new("powershell");
            cmd.creation_flags(0x08000000); // CREATE_NO_WINDOW
            cmd.args(["-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-Command", &ps_script]);
            let output = cmd.output().map_err(|e| format!("执行分屏窗口编排进程失败: {}", e))?;

            if !output.status.success() {
                let stderr = String::from_utf8_lossy(&output.stderr);
                return Err(format!("PowerShell 分屏编排异常: {}", stderr.trim()));
            }

            let stdout = String::from_utf8_lossy(&output.stdout);
            let matched_count = stdout
                .trim()
                .lines()
                .last()
                .and_then(|l| l.trim().parse::<usize>().ok())
                .unwrap_or(0);

            Ok(matched_count)
        }
        #[cfg(not(windows))]
        {
            let _ = specs;
            let _ = target_monitor_index;
            Ok(0)
        }
    })
    .await
    .map_err(|e| format!("分屏窗口编排任务失败: {}", e))?
}

/// 将纯 ASCII 十六进制字符串无损还原为 UTF-8 字符串
/// 彻底规避 Windows 控制台 OEM 代码页 (GBK / CP936) 导致的中文路径截断或乱码
fn decode_hex_to_utf8(raw_hex: &str) -> Option<String> {
    let trimmed = raw_hex.trim();
    if trimmed.is_empty() || trimmed.len() % 2 != 0 {
        return None;
    }
    let mut bytes = Vec::with_capacity(trimmed.len() / 2);
    for i in (0..trimmed.len()).step_by(2) {
        let byte = u8::from_str_radix(&trimmed[i..i + 2], 16).ok()?;
        bytes.push(byte);
    }
    String::from_utf8(bytes).ok()
}

/// 原生文件/目录选择器：唤起 Windows 资源管理器文件/目录选择窗口，并返回选中物理路径
#[tauri::command]
async fn pick_launcher_file(is_folder: Option<bool>) -> Result<Option<String>, String> {
    tauri::async_runtime::spawn_blocking(move || {
        #[cfg(windows)]
        {
            use std::process::Command;
            use std::os::windows::process::CommandExt;

            let script = if is_folder == Some(true) {
                r#"Add-Type -AssemblyName System.Windows.Forms; $d = New-Object System.Windows.Forms.FolderBrowserDialog; $d.Description = '选择目标文件夹'; if ($d.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) { $bytes = [System.Text.Encoding]::UTF8.GetBytes($d.SelectedPath); [BitConverter]::ToString($bytes).Replace('-', '') }"#
            } else {
                r#"Add-Type -AssemblyName System.Windows.Forms; $d = New-Object System.Windows.Forms.OpenFileDialog; $d.Title = '选择启动目标文件或快捷方式'; $d.Filter = '常用启动目标 (*.exe;*.lnk;*.bat;*.cmd;*.ps1)|*.exe;*.lnk;*.bat;*.cmd;*.ps1|可执行文件 (*.exe)|*.exe|快捷方式 (*.lnk)|*.lnk|脚本文件 (*.bat;*.cmd;*.ps1)|*.bat;*.cmd;*.ps1|所有文件 (*.*)|*.*'; if ($d.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) { $bytes = [System.Text.Encoding]::UTF8.GetBytes($d.FileName); [BitConverter]::ToString($bytes).Replace('-', '') }"#
            };

            let output = Command::new("powershell")
                .args(["-NoProfile", "-NonInteractive", "-Command", script])
                .creation_flags(0x08000000) // CREATE_NO_WINDOW
                .output()
                .map_err(|e| format!("唤起文件选择窗口失败: {}", e))?;

            if output.status.success() {
                let stdout_str = String::from_utf8_lossy(&output.stdout).trim().to_string();
                if stdout_str.is_empty() {
                    Ok(None)
                } else if let Some(path) = decode_hex_to_utf8(&stdout_str) {
                    if path.trim().is_empty() {
                        Ok(None)
                    } else {
                        Ok(Some(path.trim().to_string()))
                    }
                } else {
                    // 降级兼容：如果不是十六进制，使用原始字符串
                    Ok(Some(stdout_str))
                }
            } else {
                Ok(None)
            }
        }
        #[cfg(not(windows))]
        {
            Ok(None)
        }
    })
    .await
    .map_err(|e| format!("执行文件选择异常: {}", e))?
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LauncherTargetPayload {
    pub id: String,
    pub target: String,
    pub item_type: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LauncherProcessInfo {
    pub id: String,
    pub is_running: bool,
    pub pids: Vec<u32>,
    pub window_handles: Vec<isize>,
    pub instance_count: usize,
}

/// 快速启动模块专用：白名单进程运行状态快速巡检
#[tauri::command]
async fn detect_launcher_processes(
    items: Vec<LauncherTargetPayload>,
) -> Result<HashMap<String, LauncherProcessInfo>, String> {
    tauri::async_runtime::spawn_blocking(move || {
        let mut result_map: HashMap<String, LauncherProcessInfo> = HashMap::with_capacity(items.len());

        let mut exe_to_items: HashMap<String, Vec<String>> = HashMap::new();
        for item in &items {
            let trimmed = item.target.trim();
            if trimmed.is_empty() {
                continue;
            }
            let path_obj = std::path::Path::new(trimmed);
            if let Some(file_name) = path_obj.file_name().and_then(|n| n.to_str()) {
                let lower = file_name.to_lowercase();
                let exe_name = if lower.ends_with(".exe") {
                    lower
                } else if item.item_type == "app" {
                    format!("{}.exe", lower)
                } else {
                    lower
                };
                exe_to_items.entry(exe_name).or_default().push(item.id.clone());
            }
        }

        let mut exe_to_pids: HashMap<String, Vec<u32>> = HashMap::new();

        #[cfg(windows)]
        {
            use windows_sys::Win32::Foundation::CloseHandle;
            use windows_sys::Win32::System::Diagnostics::ToolHelp::{
                CreateToolhelp32Snapshot, Process32FirstW, Process32NextW, PROCESSENTRY32W,
                TH32CS_SNAPPROCESS,
            };

            unsafe {
                let snapshot = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0);
                if snapshot != windows_sys::Win32::Foundation::INVALID_HANDLE_VALUE {
                    let mut entry: PROCESSENTRY32W = std::mem::zeroed();
                    entry.dwSize = std::mem::size_of::<PROCESSENTRY32W>() as u32;

                    if Process32FirstW(snapshot, &mut entry) != 0 {
                        loop {
                            let len = entry
                                .szExeFile
                                .iter()
                                .position(|&c| c == 0)
                                .unwrap_or(entry.szExeFile.len());
                            let exe_name = String::from_utf16_lossy(&entry.szExeFile[..len]).to_lowercase();

                            if exe_to_items.contains_key(&exe_name) {
                                exe_to_pids.entry(exe_name).or_default().push(entry.th32ProcessID);
                            }

                            if Process32NextW(snapshot, &mut entry) == 0 {
                                break;
                            }
                        }
                    }
                    CloseHandle(snapshot);
                }
            }
        }

        // 若纳入了文件夹项，查询当前打开的 Windows 资源管理器窗口路径与句柄（支持精确匹配与最长前缀子目录归属匹配）
        let mut opened_folders: Vec<(isize, String)> = Vec::new();
        let mut folder_item_targets: Vec<(String, String)> = Vec::new();

        for it in &items {
            if it.item_type == "folder" {
                let norm = strip_outer_quotes(&it.target)
                    .replace('/', "\\")
                    .trim_end_matches('\\')
                    .to_lowercase();
                if !norm.is_empty() {
                    folder_item_targets.push((it.id.clone(), norm));
                }
            }
        }

        #[cfg(windows)]
        if !folder_item_targets.is_empty() {
            use std::os::windows::process::CommandExt;
            let ps_script = r#"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
try {
  $shell = New-Object -ComObject Shell.Application
  foreach ($w in $shell.Windows()) {
    try {
      $p = $w.Document.Folder.Self.Path
      if ($p) {
        Write-Output ("$($w.HWND)|$p")
      }
    } catch {}
  }
} catch {}
"#;
            let mut cmd = std::process::Command::new("powershell.exe");
            cmd.creation_flags(0x08000000);
            cmd.args(["-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-Command", ps_script]);
            if let Ok(output) = cmd.output() {
                if output.status.success() {
                    let stdout = String::from_utf8_lossy(&output.stdout);
                    for line in stdout.lines() {
                        if let Some((hwnd_str, path_str)) = line.split_once('|') {
                            if let Ok(hwnd) = hwnd_str.trim().parse::<isize>() {
                                let norm_path = path_str
                                    .trim()
                                    .replace('/', "\\")
                                    .trim_end_matches('\\')
                                    .to_lowercase();
                                if !norm_path.is_empty() && hwnd != 0 {
                                    opened_folders.push((hwnd, norm_path));
                                }
                            }
                        }
                    }
                }
            }
        }

        // 最长前缀归属映射：每个已打开的窗口路径优先归属到路径最长的配置目录项
        let mut folder_id_to_hwnds: HashMap<String, Vec<isize>> = HashMap::new();
        for (hwnd, open_path) in &opened_folders {
            let mut best_match_id: Option<String> = None;
            let mut best_len: usize = 0;

            for (fid, ftarget) in &folder_item_targets {
                let is_exact = open_path == ftarget;
                let is_sub = open_path.len() > ftarget.len()
                    && open_path.starts_with(ftarget.as_str())
                    && open_path.as_bytes().get(ftarget.len()) == Some(&b'\\');
                if (is_exact || is_sub) && ftarget.len() > best_len {
                    best_len = ftarget.len();
                    best_match_id = Some(fid.clone());
                }
            }

            if let Some(fid) = best_match_id {
                folder_id_to_hwnds.entry(fid).or_default().push(*hwnd);
            }
        }

        for item in items {
            let mut pids = Vec::new();
            let mut window_handles = Vec::new();
            let trimmed = strip_outer_quotes(&item.target);

            if item.item_type == "folder" {
                if let Some(found_hwnds) = folder_id_to_hwnds.get(&item.id) {
                    window_handles = found_hwnds.clone();
                }
            } else {
                let path_obj = std::path::Path::new(trimmed);
                if let Some(file_name) = path_obj.file_name().and_then(|n| n.to_str()) {
                    let lower = file_name.to_lowercase();
                    let exe_name = if lower.ends_with(".exe") {
                        lower
                    } else if item.item_type == "app" {
                        format!("{}.exe", lower)
                    } else {
                        lower
                    };
                    if let Some(found_pids) = exe_to_pids.get(&exe_name) {
                        pids = found_pids.clone();
                    }
                }
            }

            let is_running = !pids.is_empty() || !window_handles.is_empty();
            let instance_count = if item.item_type == "folder" {
                window_handles.len()
            } else {
                pids.len()
            };

            result_map.insert(
                item.id.clone(),
                LauncherProcessInfo {
                    id: item.id,
                    is_running,
                    pids,
                    window_handles,
                    instance_count,
                },
            );
        }

        Ok(result_map)
    })
    .await
    .map_err(|e| format!("进程检测任务异常: {}", e))?
}

/// 快速启动模块专用：安全终止指定启动项关联的活动进程
#[tauri::command]
async fn terminate_launcher_processes(pids: Vec<u32>) -> Result<usize, String> {
    tauri::async_runtime::spawn_blocking(move || {
        let mut terminated_count = 0;
        let current_pid = std::process::id();

        #[cfg(windows)]
        {
            use windows_sys::Win32::Foundation::CloseHandle;
            use windows_sys::Win32::System::Threading::{OpenProcess, TerminateProcess, PROCESS_TERMINATE};

            for pid in pids {
                // 自卫保护：绝不终止自身进程或 PID 0 / 4 等系统内核保留进程
                if pid == 0 || pid == 4 || pid == current_pid {
                    continue;
                }

                unsafe {
                    let handle = OpenProcess(PROCESS_TERMINATE, 0, pid);
                    if !handle.is_null() && handle != windows_sys::Win32::Foundation::INVALID_HANDLE_VALUE {
                        if TerminateProcess(handle, 1) != 0 {
                            terminated_count += 1;
                        }
                        CloseHandle(handle);
                    }
                }
            }
        }

        Ok(terminated_count)
    })
    .await
    .map_err(|e| format!("终止进程异常: {}", e))?
}

/// 快速启动模块专用：安全关闭指定的资源管理器文件夹窗口（绝不终止 explorer.exe 主进程）
#[tauri::command]
async fn close_launcher_windows(hwnds: Vec<isize>) -> Result<usize, String> {
    tauri::async_runtime::spawn_blocking(move || {
        let mut closed_count = 0;

        #[cfg(windows)]
        {
            use windows_sys::Win32::UI::WindowsAndMessaging::{IsWindow, PostMessageW, WM_CLOSE};

            for hwnd in hwnds {
                if hwnd == 0 {
                    continue;
                }
                unsafe {
                    if IsWindow(hwnd as _) != 0 {
                        if PostMessageW(hwnd as _, WM_CLOSE, 0, 0) != 0 {
                            closed_count += 1;
                        }
                    }
                }
            }
        }

        Ok(closed_count)
    })
    .await
    .map_err(|e| format!("关闭文件夹窗口异常: {}", e))?
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            #[cfg(windows)]
            {
                use tauri::Manager;
                if let Some(window) = app.get_webview_window("main") {
                    if let Ok(hwnd) = window.hwnd() {
                        unsafe {
                            use windows_sys::Win32::Graphics::Dwm::DwmSetWindowAttribute;
                            let use_dark: i32 = 1;
                            // 20: DWMWA_USE_IMMERSIVE_DARK_MODE (Windows 11 & Windows 10 20H1+)
                            DwmSetWindowAttribute(
                                hwnd.0 as _,
                                20,
                                &use_dark as *const _ as _,
                                std::mem::size_of::<i32>() as u32,
                            );
                            // 19: DWMWA_USE_IMMERSIVE_DARK_MODE (Windows 10 1809~1909)
                            DwmSetWindowAttribute(
                                hwnd.0 as _,
                                19,
                                &use_dark as *const _ as _,
                                std::mem::size_of::<i32>() as u32,
                            );
                        }
                    }
                }
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            workbench_ping,
            launch_custom_target,
            get_app_icon,
            execute_custom_script,
            run_launcher_command,
            check_service_ports,
            inspect_system_health,
            window_minimize,
            window_toggle_maximize,
            window_is_maximized,
            window_close,
            pick_launcher_file,
            detect_launcher_processes,
            terminate_launcher_processes,
            close_launcher_windows,
            get_system_monitors,
            arrange_combo_windows,
            db::db_get_all_tasks,
            db::db_save_all_tasks,
            db::db_get_all_memos,
            db::db_save_all_memos,
            db::db_get_setting,
            db::db_set_setting,
            db::db_get_all_partitions,
            db::db_save_partition,
            db::db_delete_partition,
            db::db_get_all_pages,
            db::db_save_page,
            db::db_delete_page,
            db::db_get_blocks_for_page,
            db::db_save_blocks_for_page,
            db::db_get_all_collections,
            db::db_save_collection,
            db::db_delete_collection,
            db::db_get_collection_rows,
            db::db_save_collection_row,
            db::db_delete_collection_row,
            db::db_sync_doc_markdown_file,
            db::db_get_doc_local_path
        ])
        .run(tauri::generate_context!())
        .expect("error while running SelfWork desktop core");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_workbench_ping_contract() {
        let res = workbench_ping(Some(123456)).expect("ping command failed");
        assert_eq!(res.status, "ready");
        assert!(!res.version.is_empty());
        assert!(res.server_time_ms > 0);
        assert!(!res.os_family.is_empty());
        assert!(!res.arch.is_empty());
    }

    #[test]
    fn test_execute_custom_script_contract() {
        #[cfg(windows)]
        {
            let res = tauri::async_runtime::block_on(execute_custom_script(
                "cmd".to_string(),
                "echo SelfWorkLauncherReady".to_string(),
                None,
            ))
            .expect("execute_custom_script failed");
            assert!(res.contains("SelfWorkLauncherReady"));
        }
    }

    #[test]
    fn test_get_app_icon_contract() {
        #[cfg(windows)]
        {
            let res = tauri::async_runtime::block_on(get_app_icon(
                "C:\\Windows\\System32\\cmd.exe".to_string(),
            ));
            assert!(res.is_ok(), "提取 cmd.exe 图标失败: {:?}", res.err());
            let data_url = res.unwrap();
            assert!(data_url.starts_with("data:image/png;base64,"));
        }
    }

    #[test]
    fn test_check_service_ports() {
        let ports = vec![59991, 59992];
        let res = tauri::async_runtime::block_on(check_service_ports(ports)).expect("check_service_ports failed");
        assert_eq!(res.len(), 2);
        assert!(res.contains_key(&59991));
        assert!(res.contains_key(&59992));
    }

    #[test]
    fn test_inspect_system_health() {
        let payload = HealthInspectionPayload {
            ports: vec![59991, 59992],
            process_names: vec![
                "explorer.exe".to_string(),
                "nonexistent_mock_service_process.exe".to_string(),
            ],
        };
        let res = tauri::async_runtime::block_on(inspect_system_health(payload))
            .expect("inspect_system_health failed");
        assert_eq!(res.ports.len(), 2);
        assert!(res.ports.contains_key(&59991));
        assert!(res.ports.contains_key(&59992));
        assert!(res.processes.contains_key("explorer.exe"));
        assert!(res.processes.contains_key("nonexistent_mock_service_process.exe"));
        assert!(res
            .processes
            .get("nonexistent_mock_service_process.exe")
            .unwrap()
            .is_empty());
    }

    #[test]
    fn test_arrange_combo_windows_contract() {
        let specs = vec![
            WindowPlacementSpec {
                target: "F:\\App Location\\SelfWork".to_string(),
                item_name: Some("SelfWork".to_string()),
                x_ratio: 0.0,
                y_ratio: 0.0,
                w_ratio: 0.5,
                h_ratio: 0.5,
            },
            WindowPlacementSpec {
                target: "F:\\App Location\\Guanzhi Tong\\Skill\\MSDS-Engine".to_string(),
                item_name: Some("MSDS-Engine".to_string()),
                x_ratio: 0.5,
                y_ratio: 0.0,
                w_ratio: 0.5,
                h_ratio: 0.5,
            },
        ];
        let res = tauri::async_runtime::block_on(arrange_combo_windows(specs, Some(0)));
        assert!(res.is_ok(), "arrange_combo_windows 应当正常执行并返回匹配数量: {:?}", res.err());
    }

    #[test]
    fn test_get_system_monitors_contract() {
        let res = tauri::async_runtime::block_on(get_system_monitors());
        assert!(res.is_ok(), "get_system_monitors 应当成功返回系统屏幕列表");
        let monitors = res.unwrap();
        assert!(!monitors.is_empty(), "系统至少存在一个主显示器");
        assert!(monitors.iter().any(|m| m.is_primary), "必有一个显示器为主屏");
    }

    #[test]
    fn test_decode_hex_to_utf8_chinese_path() {
        let hex = "463A5C417070204C6F636174696F6E5C4775616E7A686920546F6E675C536B696C6C5C4D5344532D456E67696E655CE7AE97E6B395E8AEADE7BB83E69D90E696995C544453204D53445320E9878DE58699E78988";
        let path = decode_hex_to_utf8(hex).expect("Failed to decode hex");
        assert_eq!(path, "F:\\App Location\\Guanzhi Tong\\Skill\\MSDS-Engine\\算法训练材料\\TDS MSDS 重写版");
    }

    #[test]
    fn test_launch_custom_target_nonexistent_path() {
        #[cfg(windows)]
        {
            let res = tauri::async_runtime::block_on(launch_custom_target(
                "Z:\\NonExistentMockFolder_123456".to_string(),
                None,
                None,
            ));
            assert!(res.is_err(), "不存在的物理路径应当返回错误拦截");
            let err_msg = res.unwrap_err();
            assert!(err_msg.contains("不存在或无法访问"), "错误提示需包含明确描述: {}", err_msg);
        }
    }

    #[test]
    fn test_execute_quoted_bat_script_contract() {
        #[cfg(windows)]
        {
            let temp_dir = std::env::temp_dir().join("selfwork bat test");
            let _ = std::fs::create_dir_all(&temp_dir);
            let bat_path = temp_dir.join("echo_test.bat");
            std::fs::write(&bat_path, "@echo off\r\necho BAT_EXEC_OK_%CD%\r\n").expect("write temp bat");

            let quoted_target = format!("\"{}\"", bat_path.display());
            let res = tauri::async_runtime::block_on(execute_custom_script(
                "powershell".to_string(),
                quoted_target,
                None,
            ))
            .expect("execute quoted bat failed");

            let _ = std::fs::remove_file(&bat_path);
            let _ = std::fs::remove_dir(&temp_dir);

            assert!(res.contains("BAT_EXEC_OK_"), "应当真实执行 bat 脚本并输出内容, 实际: {}", res);
            assert!(res.contains("selfwork bat test"), "应当自动绑定批处理所在目录为工作目录, 实际: {}", res);
        }
    }

    #[test]
    fn test_launch_custom_target_url_bypass_disk_check() {
        #[cfg(windows)]
        {
            // 验证带 ":/" 的标准网络链接不会被误判为本地物理磁盘路径而抛出 "不存在或无法访问" 错误
            let res = tauri::async_runtime::block_on(launch_custom_target(
                "https://chatgpt.com/c/6af57c45-9840-83ea-84c2-1018ec7ed633".to_string(),
                None,
                None,
            ));
            if let Err(ref e) = res {
                assert!(!e.contains("目标路径不存在或无法访问"), "URL 链接绝不能触发本地磁盘不存在拦截: {}", e);
            }
        }
    }
}
