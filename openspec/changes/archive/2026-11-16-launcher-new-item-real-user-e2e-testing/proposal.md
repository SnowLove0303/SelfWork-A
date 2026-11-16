# Proposal: 快速启动新建项真实用户行为执行测试与全链路核销

## 1. 业务背景与测试目标 (Why & Objectives)
快速启动（Launcher Dashboard）是 SelfWork 桌面工作台的核心效率模块。为了验证用户在前端点击“新建项”按钮后的完整生命周期交互真实有效，必须对【新建项】用户端进行**真实用户行为端到端（E2E）执行测试**。
测试覆盖：
1. **模态框交互触达**：新建项弹窗的唤起、各控件初始状态、ESC 键与取消关闭流；
2. **多类型真实录入与功能契约**：
   - 应用程序 (`app`)：真实录入 Windows 本地程序（如 `cmd.exe` / `notepad.exe`），验证原生 IPC 图标提取（`get_app_icon`）及路径推导；
   - 网页直达 (`url`)：录入合规的 HTTPS 网址，验证 URL 协议校验及域名默认名称推导；
   - 脚本指令 (`script`)：录入 Shell 指令及工作目录配置，验证静默/终端执行流；
   - 捆绑组合 (`bundle`)：录入多个基础应用的组合卡片，验证关联勾选；
3. **负向边界防御攻击 (Negative Cases)**：空名称、空目标路径、空组合勾选等情况下的前置表单拦截；
4. **真实唤起与执行验证**：对新建出的应用、网页与脚本执行真实唤起，验证进程状态与日志；
5. **SQLite 物理持久化对账**：验证新建项在 SQLite `app_settings` 表（`sw_launcher_storage_v2`）中真实落盘，冷重启后数据不丢失。

## 2. 核心方案与实施路径 (What Changes & Plan)
- 编写专用的快速启动新建项自动化测试与执行验证脚本 `scripts/launcher-e2e-test.mjs`；
- 调用 Tauri 后端原生 IPC（`get_app_icon`, `launch_custom_target`, `execute_custom_script`, `db_get_setting`, `db_set_setting`）；
- 全面运行测试套件，出具包含真实退出码、断言结果、图标数据指纹与 SQLite 落盘凭证的测试报告。

## 3. 拟变范围与保持现状承诺 (Scope & Invariants)
- **测试与验证范围**：
  - `scripts/launcher-e2e-test.mjs` (专用端到端测试与真实用户行为模拟器)
- **保持现状承诺**：
  - 严禁篡改用户已有的正常启动项数据；
  - 严禁破坏既有 SQLite 存储结构与分类体系；
  - 测试创建的临时测试项在验证完成后安全归档并清洗，保持工作区清爽。
