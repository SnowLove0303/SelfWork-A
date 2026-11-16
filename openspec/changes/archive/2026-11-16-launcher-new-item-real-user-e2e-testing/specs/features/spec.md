# features Specification

## ADDED Requirements

### Requirement: 快速启动新建项端到端生命周期契约 (Launcher New Item E2E Lifecycle Contract)
The launcher dashboard SHALL allow users to create new items for types app, url, script, folder, and bundle, and persist them into the SQLite database.
系统必须支持用户在快速启动界面完整录入应用、网页、脚本、文件夹与捆绑组合五种启动项，并将其原子化持久写入 SQLite 数据库。

#### Scenario: 用户新建应用程序项
- **WHEN**: 用户在快速启动界面点击新建项，选择应用类型，录入可执行程序路径及名称并确认
- **THEN**: 系统生成唯一的 LauncherItem 记录并保存至存储，列表实时呈现该卡片

#### Scenario: 用户新建网页直达项
- **WHEN**: 用户选择网页类型，录入合规的 HTTPS 网址及名称并确认
- **THEN**: 系统自动识别域名并保存为 URL 类型启动项

#### Scenario: 用户新建脚本指令项
- **WHEN**: 用户选择脚本类型，输入待执行的命令行脚本及工作目录并确认
- **THEN**: 系统生成脚本启动项并支持后台静默执行与输出日志收集

### Requirement: 新建项边界校验与防空保护 (Launcher New Item Input Validation & Boundary Defense)
The system SHALL strictly validate required fields during item creation and prevent empty or invalid inputs from polluting the storage.
系统在新建项保存时，必须对必填字段执行确定性校验拦截，杜绝空名称、空目标或空组合写入存储。

#### Scenario: 缺少名称时点击保存
- **WHEN**: 用户未输入启动项名称直接点击确认添加
- **THEN**: 系统拦截保存请求，弹出错误提示并不发生状态变更

#### Scenario: 缺少目标路径时点击保存
- **WHEN**: 用户未输入目标路径直接点击确认添加
- **THEN**: 系统拦截保存请求，杜绝产生空目标脏卡片

### Requirement: 新建项原生图标提取与真实执行验证 (Launcher New Item Icon Extraction & Execution Witness)
The system SHALL automatically extract native high-res icons for executable targets and support direct execution of newly created items.
针对录入的 Windows 可执行文件，系统必须通过原生 IPC 可靠提取 32x32 关联图标并持久化，且新创建的项目能通过原生启动管道真实唤起。

#### Scenario: 自动提取可执行文件图标
- **WHEN**: 用户指定本地存在的 .exe 文件路径
- **THEN**: 系统调用 get_app_icon 返回以 data:image/png;base64, 开头的有效图像指纹

#### Scenario: 真实唤起新创建项
- **WHEN**: 用户点击执行新创建的应用程序或脚本项
- **THEN**: 系统调用原生启动通道启动对应目标，返回成功唤起状态
