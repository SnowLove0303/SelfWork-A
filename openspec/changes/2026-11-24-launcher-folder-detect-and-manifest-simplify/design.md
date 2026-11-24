# Design: 文件夹窗口探测与运行清单去技术化方案

1. **文件夹窗口探测**：在 `detect_launcher_processes` 中，仅当请求列表含 `item_type == "folder"` 时，调用一次无窗 PowerShell 查询 `(New-Object -ComObject Shell.Application).Windows()`，提取每个资源管理器窗口的 `HWND` 与 `Document.Folder.Self.Path`，规范化路径后与配置的 `folder` 目标做精确比对，填入 `window_handles`。
2. **安全关闭文件夹**：在 `close_launcher_windows` 中调用 `windows_sys::Win32::UI::WindowsAndMessaging::PostMessageW(hwnd as _, WM_CLOSE, 0, 0)`，安全通知目标资源管理器窗口关闭。
3. **UI 极简去技术化**：遵循 `ui-ux-design-engineering`，使用“运行清单”代替“进程清单”，移除“多开”按钮、展开箭头及“进程/实例/PID”文本。
