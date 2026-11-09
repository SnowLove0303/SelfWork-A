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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            workbench_ping,
            run_launcher_command,
            check_service_ports
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
}
