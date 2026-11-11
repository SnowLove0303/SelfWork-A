# Feature Specification: 启动器原生可靠唤起、图标自动提取与极简纯净化视图

## 1. 原生可靠启动契约 (Native Reliable Launching)

### Requirement: REQ-FIX-01
- **SHALL**: 当系统接收到启动请求时，后端 `launch_custom_target` 命令必须根据目标路径类型采取相适应的启动策略：
  - **WHEN** 目标路径为本地可执行文件（`.exe`）：
    - 系统 **SHALL** 直接创建独立操作系统进程（`std::process::Command`），并将其与当前控制台彻底解绑；
    - **WHEN** 未显式指定 `working_dir` 时，系统 **SHALL** 自动将其工作目录设置为该目标可执行文件所在的父目录（`target.parent()`），以保障应用能正常加载同级动态链接库与资源；
    - 系统 **SHALL NOT** 使用多层嵌套的 `cmd.exe /c start ""` 拼接，防止命令行引号被截断与逃逸。
  - **WHEN** 目标路径为快捷方式（`.lnk`）、物理文件夹或 Web URL（`http://` / `https://`）：
    - 系统 **SHALL** 调用 Windows 原生 Shell API 或原生 Shell 唤醒通道，确保与用户在资源管理器中双击的行为 100% 一致。
- **THEN**: 前端在触发启动后，若成功唤起目标，**SHALL** 提供轻量的成功反馈（如“已成功唤起: 微信”）；若操作系统返回启动错误，**SHALL** 捕获并向用户展示清晰的错误原因。

---

## 2. 原生应用图标动态提取契约 (Native App Icon Extraction)

### Requirement: REQ-FIX-02
- **SHALL**: 后端 **SHALL** 暴露 `get_app_icon(target: String)` IPC 接口：
  - **WHEN** `target` 对应本地存在的 `.exe` 或 `.lnk` 文件：
    - 系统 **SHALL** 调用操作系统底层图形接口提取其关联的官方图标，并将其编码为标准 `data:image/png;base64,...` 格式的 Data URL；
  - **WHEN** `target` 为不存在的文件、Web 链接或脚本时：
    - 系统 **SHALL** 优雅返回 `None` 或错误信息，不得抛出系统恐慌崩溃。
- **SHALL**: 前端数据契约 `LauncherItem` **SHALL** 扩充可选字段 `icon?: string`：
  - **WHEN** 卡片挂载且当前项类型为 `app` 且无 `icon` 时，前端 **SHALL** 异步触发 `get_app_icon` 补全图标，并持久化回写至存储中，使后续冷启动实现零延迟渲染；
  - **WHEN** 卡片渲染时存在有效图标，前端 **SHALL** 在卡片视觉中心渲染 40x40 高清图标，具备平滑微圆角与阴影；
  - **WHEN** 项无图标或为脚本/网页，前端 **SHALL** 回退至标准 Lucide 语义晶体图标。

---

## 3. 卡片极简纯净化视觉契约 (Clean Card Visuals)

### Requirement: REQ-FIX-03
- **SHALL NOT**: 启动项常规卡片表面 **SHALL NOT** 直接渲染目标长文件路径（例如 `C:\Users\...` 或 `D:\APP\...`），亦不得展示多余的口水化占位段落；
- **SHALL**: 启动项卡片视觉结构 **SHALL** 严密收敛为以下要素：
  - 顶栏：左侧精致类型标签（应用/脚本/网页/文件夹），右侧悬浮出现的更多操作按钮（编辑、删除）；
  - 主体核心：居中展示 40x40 应用官方原生图标 + 下方清晰呈现应用名称（L4 规范，`truncate` 防溢出）；
  - 交互状态：悬浮时高亮青蓝微光与悬浮阴影，点击非操作区域即刻触发运行唤起；
- **SHALL**: 目标路径、运行参数、工作目录等全部底层属性，**SHALL** 仅在用户点击“编辑”操作调起的模态框中完整展示与编辑。
