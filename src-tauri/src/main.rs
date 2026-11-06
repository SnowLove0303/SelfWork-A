// 彻底禁用 Windows 终端控制台黑框，无论 Debug 还是 Release 均以纯桌面窗口启动
#![windows_subsystem = "windows"]

fn main() {
    selfwork_desktop_lib::run();
}
