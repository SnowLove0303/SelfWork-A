# Design: 快速启动新建项真实用户行为执行测试与全链路核销

## 1. 架构目标与验证全景 (Architecture & Verification Strategy)
快速启动模块采用「React 视图层表单 -> 内部防抖状态机 -> Tauri IPC 原生桥接 -> Windows 本地执行内核 + SQLite 物理落盘」四层架构。
为对「新建项」用户端进行真实用户行为执行测试，测试设计遵循 Layer 4 真实环境见证者 (Env-Authored Witness) 准则：

```text
┌──────────────────────────────────────────────────────────────┐
│                    真实用户行为测试驱动器                      │
│                 (scripts/launcher-e2e-test.mjs)              │
└──────────────┬───────────────────────────────┬───────────────┘
               │ 1. 表单录入与负向防御攻击      │ 2. 原生 IPC 接口调用
┌──────────────▼──────────────┐ ┌──────────────▼──────────────┐
│  React 状态机与校验逻辑模拟  │ │   Tauri Rust 宿主执行内核   │
│  - 必填项防御 (Name, Target)│ │   - get_app_icon (图标提取) │
│  - 域名自动推导 (URL 规则)  │ │   - launch_custom_target    │
│  - 唯一 ID 生成与时间戳注入 │ │   - execute_custom_script   │
└──────────────┬──────────────┘ └──────────────┬──────────────┘
               │                               │
               └──────────────┬────────────────┘
                              │ 3. 双向核销与落盘
┌─────────────────────────────▼────────────────────────────────┐
│               SQLite 数据库 (%APPDATA%\SelfWork)             │
│            表 app_settings: sw_launcher_storage_v2           │
└──────────────────────────────────────────────────────────────┘
```

## 2. 真实用户操作行为模拟设计 (User Behavior Scenarios)

### 用例 1: 录入真实本地应用 (App - notepad.exe / cmd.exe)
- 模拟用户在弹窗中选择类型为 `app`；
- 输入名称：`自动化记事本测试项`；
- 输入目标：`C:\Windows\System32\notepad.exe`；
- 调用后端原生 `get_app_icon`，断言返回包含 `data:image/png;base64,` 的真实图标数据，断言图标字符串长度 > 500；
- 模拟调用 `launch_custom_target`，验证原生进程启动退出码 0，并受控关闭创建的测试进程。

### 用例 2: 录入真实网页直达 (URL - GitHub Trending)
- 模拟用户选择类型为 `url`；
- 输入目标：`https://github.com/trending`；
- 验证域名解析推导逻辑：自动将 `formName` 提取为 `Github`；
- 校验保存格式符合规范。

### 用例 3: 录入真实脚本指令 (Script - 自定义状态探测)
- 模拟用户选择类型为 `script`；
- 输入目标指令：`echo "SelfWork Launcher E2E PASS"`；
- 调用后端 `execute_custom_script` 执行，断言控制台输出包含 `SelfWork Launcher E2E PASS`。

### 用例 4: 录入捆绑组合 (Bundle)
- 模拟用户选择类型为 `bundle`；
- 勾选至少 2 个现有应用；
- 校验保存时 `bundleItemIds` 数组完整，target 标注为 `捆绑启动组合`。

### 用例 5: 负向边界防御攻击 (Negative Validation)
- 攻击 A：name 为空或全空格时，拦截保存，抛出校验异常；
- 攻击 B：target 为空且非 bundle 时，拦截保存，抛出校验异常；
- 攻击 C：bundle 选区为空时，拦截保存，抛出校验异常。

### 用例 6: 物理数据库持久化与原子恢复对账
- 读取并备份当前 SQLite 数据库中的 `sw_launcher_storage_v2`；
- 将合法生成的新项写入数据模型并同步至 SQLite；
- 重新读取 SQLite 物理文件，断言新建项在表中 100% 存在，字段完全吻合；
- 最终清理测试项，确保用户原有数据 100% 原样恢复。
