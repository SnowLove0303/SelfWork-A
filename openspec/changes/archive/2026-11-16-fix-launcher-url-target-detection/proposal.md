# Proposal: 快速启动网页 URL 直达目标协议判定与错误拦截修复

## Why

在快速启动大盘中，用户点击「常用网页直达」分类中的网址项（如 `https://chatgpt.com/c/6af57c45-9840-83ea-84c2-1018ec7ed633`、`https://github.com` 等）时，系统弹出错误提示：
`启动失败: 目标路径不存在或无法访问: https://chatgpt.com/...`。

**根本原因归因 (Root Cause Analysis)**：
在 Rust 后端 `launch_custom_target` 命令实现中，用于检测本地绝对路径是否物理存在的判定逻辑为：
```rust
let is_local_path = trimmed_target.contains(":\\") || trimmed_target.contains(":/") || trimmed_target.starts_with("\\\\");
if is_local_path && !target_path.exists() {
    return Err(format!("目标路径不存在或无法访问: {}", trimmed_target));
}
```
由于网络 URL（如 `https://`、`http://` 等）包含 `":/"`，导致其被错误判定为 `is_local_path` 为 true；紧接着在本地文件系统中进行 `target_path.exists()` 检查时自然返回 false，从而错误地触发了本地磁盘物理路径不存在的防御性拦截，阻止了默认浏览器的拉起。

## What Changes

1. **协议解耦与精准识别**:
   - 显式定义并检测网络协议前缀（`http://`, `https://`, `ftp://`, `mailto:`）；
   - 本地磁盘路径检查仅对真正的盘符驱动路径（如 `C:\`, `C:/`）与 UNC 共享路径（`\\`）生效，绝对排除网络 URL。
2. **默认浏览器直达拉起保全**:
   - 确保网络 URL 顺利路由至原生 `Start-Process` 或相关系统通道，无阻碍唤起系统默认浏览器。
3. **本地不存在路径拦截承重墙保全**:
   - 对真正不存在的本地文件/目录（如 `Z:\NotExist`），保持强拦截并返回清晰报错，杜绝静默失败。

## RTM Matrix (1:1 需求物理对账)

| 需求编号 | 需求名称 | 验收标准 | 对应 Task |
| :--- | :--- | :--- | :--- |
| **REQ-FIX-URL-01** | 网页 URL 协议精准识别与放行 | 点击任意标准 Web URL 时，绝对不触发磁盘路径不存在拦截 | Task 1 |
| **REQ-FIX-URL-02** | 默认浏览器无感拉起直达 | 顺利下发并调用系统默认浏览器打开完整链接 | Task 1 |
| **REQ-FIX-URL-03** | 本地物理路径不存在强拦截保全 | 不存在的本地磁盘绝对路径持续保持拦截并出具明确错误 | Task 2 |
