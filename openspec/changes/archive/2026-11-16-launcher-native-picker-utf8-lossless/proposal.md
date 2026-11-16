# Proposal: 快速启动目录与文件选择器全链路 UTF-8 编码无损与既有数据纠偏

## Why
在 Windows 环境下，通过快速启动新建项的“浏览选择”选取包含中文路径的文件夹或文件时，底层的 PowerShell 对话框默认使用系统 OEM 代码页（GBK / CP936）输出标准输出流，而 Rust 端采用 `String::from_utf8_lossy` 解码，导致非 ASCII 中文字符被破坏为替换符（`\u{FFFD}` 即 ``），路径被破坏后写入 SQLite 数据库，最终触发“启动失败: 目标路径不存在或无法访问”的错误。用户明确要求解决目录启动项乱码与无法启动问题。

## What Changes
1. **选择器通信通道改造为十六进制无损编码传输 (`src-tauri/src/lib.rs`)**:
   - 在 `pick_launcher_file` 中，PowerShell 脚本在用户完成文件/文件夹选取后，显式将路径转为 UTF-8 字节流并通过 `[BitConverter]::ToString(...).Replace('-', '')` 输出为纯 ASCII 十六进制字符串；
   - Rust 端接收后进行无损十六进制反解，并以 UTF-8 还原为字符串，彻底消除对系统终端代码页的依赖，实现全球语言（中/日/韩/特殊字符）100% 无损传输。
2. **既有损坏数据物理纠偏与自愈**:
   - 编写针对性修复逻辑，将当前 SQLite 数据库中已被截断损坏的“MSDS 重写版”路径 `F:\App Location\Guanzhi Tong\Skill\MSDS-Engine\炼v\TDS MSDS A` 纠偏恢复为真实的物理绝对路径 `F:\App Location\Guanzhi Tong\Skill\MSDS-Engine\算法训练材料\TDS MSDS 重写版`。
3. **文件夹直通唤起核销**:
   - 验证路径纠偏后，点击该目录卡片能够毫秒级成功拉起资源管理器并准确定位。

## 1:1 需求物理对账矩阵 (RTM)
| 需求编号 | 原始需求条目 | 落地实现目标 | 验收指标 |
| :--- | :--- | :--- | :--- |
| **REQ-LAUNCHER-FOLDER-UTF8-01** | “目录的启动项有乱码且无法启动” | 1. 选择器管道采用 Hex-UTF8 无损编解码，消除乱码根因<br>2. 修复已损坏的 MSDS 重写版路径<br>3. 恢复点击成功直达打开文件夹 | 选取中文路径无乱码，MSDS 重写版点击成功打开 |
