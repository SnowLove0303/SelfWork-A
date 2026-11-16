# Design: 快速启动目录与文件选择器全链路 UTF-8 编码无损与既有数据纠偏

## 架构因果拓扑与编码通道硬防护

### 1. 根因穿透分析 (5-Whys Root Cause Analysis)
1. **Why 目录卡片点击无法启动？**
   - 错误提示：`目标路径不存在或无法访问: F:\App Location\Guanzhi Tong\Skill\MSDS-Engine\炼v\TDS MSDS A`。路径物理不存在。
2. **Why 路径物理不存在？**
   - 路径字符串中包含 Unicode 替换字符 `\u{FFFD}`（``），导致物理路径判定 `path.exists()` 失败。
3. **Why 路径字符串会含有替换字符？**
   - 在选择器命令 `pick_launcher_file` 中，Rust 执行 `String::from_utf8_lossy(&output.stdout)` 将标准输出字节流当作 UTF-8 解析。
4. **Why 标准输出字节流不是合法的 UTF-8？**
   - Windows 平台下 `powershell.exe`（Windows PowerShell 5.1）默认输出流采用系统 OEM 代码页（简体中文 Windows 为 CodePage 936 / GBK），多字节中文字符以 GBK 编码输出。
5. **Why 系统此前未能防范？**
   - 此前未对子进程通信管道建立代码页免疫机制（CodePage Immune Channel）。

### 2. 十六进制无损编码通道方案 (Hex-UTF8 Immune Channel)
通过十六进制（Hexadecimal）中转，彻底消除控制台代码页干扰：
1. **PowerShell 端**：
   - 获取用户选取的字符串对象 `$path`；
   - 显式通过 `.NET` 原生方法转为 UTF-8 字节：`$bytes = [System.Text.Encoding]::UTF8.GetBytes($path)`；
   - 转换为纯 ASCII 十六进制字符串：`[System.BitConverter]::ToString($bytes).Replace('-', '')`；
   - 该字符串仅包含字符 `[0-9A-F]`，无论终端代码页为何物，传输 100% 不失真。
2. **Rust 端**：
   - 读取 ASCII 十六进制字符串，每 2 字符解析为一个 `u8`；
   - 将字节切片通过 `String::from_utf8` 转为 Rust 原生 `String`；
   - 0 第三方库依赖，100% 确定性。

### 3. 数据自愈修复方案
编写一次性安全修复脚本，扫描并校正包含替换字符的 `MSDS 重写版` 项目，恢复其正确的物理路径。
