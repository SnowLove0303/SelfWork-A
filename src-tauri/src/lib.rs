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

/// 执行 Workflow-Launcher.ps1 脚本指令
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
    .map_err(|e| format!("检测端口任务失败: {}", e))?
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HealthInspectionPayload {
    pub ports: Vec<u16>,
    pub process_names: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemHealthSnapshot {
    pub ports: HashMap<u16, bool>,
    pub processes: HashMap<String, Vec<u32>>, // lowercase_name -> [PIDs]
    pub duration_ms: u64,
}

/// 基于 Windows Toolhelp32 原生快照的毫秒级进程扫描 (< 2ms)
fn scan_target_processes(target_names: &[String]) -> HashMap<String, Vec<u32>> {
    let mut result: HashMap<String, Vec<u32>> = HashMap::new();
    let targets: Vec<String> = target_names.iter().map(|s| s.trim().to_lowercase()).collect();
    for target in &targets {
        result.entry(target.clone()).or_default();
    }

    #[cfg(windows)]
    {
        use windows_sys::Win32::Foundation::{CloseHandle, INVALID_HANDLE_VALUE};
        use windows_sys::Win32::System::Diagnostics::ToolHelp::{
            CreateToolhelp32Snapshot, Process32FirstW, Process32NextW, PROCESSENTRY32W,
            TH32CS_SNAPPROCESS,
        };

        unsafe {
            let snapshot = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0);
            if snapshot != INVALID_HANDLE_VALUE {
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
                        let pid = entry.th32ProcessID;

                        if let Some(pids) = result.get_mut(&exe_name) {
                            pids.push(pid);
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

    result
}

/// 全维巡检：极速原生进程快照枚举 + 多端口并发连通性探测
#[tauri::command]
async fn inspect_system_health(
    payload: HealthInspectionPayload,
) -> Result<SystemHealthSnapshot, String> {
    tauri::async_runtime::spawn_blocking(move || {
        let start_time = std::time::Instant::now();

        let (ports, processes) = std::thread::scope(|s| {
            let mut handles = Vec::with_capacity(payload.ports.len());
            for port in payload.ports {
                handles.push(s.spawn(move || {
                    let addr = SocketAddr::from(([127, 0, 0, 1], port));
                    let is_open =
                        TcpStream::connect_timeout(&addr, Duration::from_millis(150)).is_ok();
                    (port, is_open)
                }));
            }

            // 在等待端口网络握手的同时，本线程执行超高速 Toolhelp 进程扫描 (< 2ms)
            let proc_map = scan_target_processes(&payload.process_names);

            let mut port_map = HashMap::with_capacity(handles.len());
            for h in handles {
                if let Ok((port, is_open)) = h.join() {
                    port_map.insert(port, is_open);
                }
            }

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
            run_launcher_command,
            check_service_ports,
            inspect_system_health,
            window_minimize,
            window_toggle_maximize,
            window_is_maximized,
            window_close,
            db::db_get_all_tasks,
            db::db_save_all_tasks,
            db::db_get_all_memos,
            db::db_save_all_memos,
            db::db_get_setting,
            db::db_set_setting
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
}
