# Design: 快速启动目标路径协议解耦与状态机流转

## 1. 目标分类与流转状态机

```mermaid
flowchart TD
    Start[launch_custom_target(target)] --> Trim[去除首尾空格]
    Trim --> CheckEmpty{是否为空?}
    CheckEmpty -- 是 --> ErrEmpty[返回: 目标路径不能为空]
    CheckEmpty -- 否 --> CheckExe{是否为存在的可执行文件 .exe?}
    
    CheckExe -- 是 --> SpawnExe[原生独立进程启动 spawn\n自动推导父工作目录]
    CheckExe -- 否 --> CheckDir{是否为本地存在的文件夹目录?}
    
    CheckDir -- 是 --> SpawnExplorer[调用 explorer.exe 毫秒级直达]
    CheckDir -- 否 --> ParseProtocol[协议解耦判定]
    
    ParseProtocol --> IsUrl{是否为 URL 协议?\nhttp:// | https:// | ftp://}
    IsUrl -- 是 --> LaunchUrl[Windows 默认浏览器协议通道唤起\nStart-Process FilePath URL]
    IsUrl -- 否 --> CheckDiskPath{是否为本地绝对磁盘路径?\n盘符冒号斜杠 或 UNC}
    
    CheckDiskPath -- 是 --> CheckExists{target_path.exists()?}
    CheckExists -- 否 --> ErrNotExist[拦截返回: 目标路径不存在或无法访问]
    CheckExists -- 增大/是 --> LaunchOther[原生通道唤起 .lnk 快捷方式等]
    CheckDiskPath -- 否 --> LaunchOther
```

## 2. 核心技术选型与实现细节

在 `src-tauri/src/lib.rs` 中：
```rust
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
```

- 彻底解除 `trimmed_target.contains(":/")` 对网络协议的误伤；
- 保持严格的盘符判定（索引 1 为 `:`，索引 2 为 `\` 或 `/`）与网络 UNC 共享路径判定。
