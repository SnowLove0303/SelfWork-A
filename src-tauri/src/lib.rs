use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};

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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![workbench_ping])
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
}
