# Spec: 通用灵活快速启动工作台行为契约规范

## 1. 数据模型与契约 (RFC 2119)

### SHALL Requirements
1. `LauncherItem` **SHALL** 具备以下核心属性：
   - `id: string`: 唯一标识；
   - `categoryId: string`: 所属分类 ID；
   - `name: string`: 显示名称；
   - `type: 'app' | 'script' | 'url' | 'folder'`: 启动目标类型；
   - `target: string`: 目标路径、URL 或脚本命令；
   - `args?: string`: 启动参数（可选）；
   - `workingDir?: string`: 工作目录（可选）；
   - `description?: string`: 辅助说明（可选）；
   - `createdAt: number`: 创建时间；
   - `updatedAt: number`: 更新时间。
2. `LauncherCategory` **SHALL** 具备以下核心属性：
   - `id: string`: 唯一标识；
   - `name: string`: 分类名称；
   - `description?: string`: 分类描述；
   - `createdAt: number`: 创建时间；
   - `isDefault?: boolean`: 是否为默认分类。
3. Tauri Rust 后端 **SHALL** 提供跨平台的通用调用指令：
   - `launch_custom_target(target, args, working_dir)`: 启动本地应用程序、打开文件夹或在默认浏览器打开 URL；
   - `execute_custom_script(script_type, script_content, working_dir)`: 执行自定义 PowerShell / CMD 指令，并回传执行输出与退出码。
4. 快速启动主顶栏 **SHALL** 严格保持 `h-[49px]` 基准高度，保证与待办清单、灵感便签及思维导图的坐标与底部分割线绝对统一对齐。
5. 启动项删除 **SHALL** 从持久化集合中完全剔除；分类删除时，其下启动项 **SHALL** 自动重定向至默认分类。
6. 分类“一键全启动” **SHALL** 遍历当前分类下的所有启动项并依次调度拉起。

### WHEN / THEN Contracts
- **WHEN** 用户点击“+ 添加启动项”并提交有效名称与路径时；
- **THEN** 系统立即在当前分类下创建卡片，并自动持久化至 SQLite 数据库中。
- **WHEN** 用户点击某张启动项卡片时；
- **THEN** 系统根据其类型（应用/目录/URL/脚本）调用原生 IPC 引擎执行，同时在卡片上触发触觉动效与状态通知。
- **WHEN** 用户点击分类顶部的“一键全启动”时；
- **THEN** 该分类下的所有项目按顺序依次唤醒执行。
