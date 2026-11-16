# Specs: 快速启动网页 URL 直达目标判定与修复

## ADDED Requirements

### Requirement: REQ-FIX-URL-01 网页 URL 协议精准识别与放行
系统在校验启动目标时，SHALL 优先检测是否具备网络 URL 协议特征。WHEN 目标以 `http://`、`https://`、`ftp://` 等标准协议开头时，系统 SHALL NOT 将其判定为本地磁盘物理路径，且 SHALL NOT 执行本地文件系统物理存在性检测。

#### Scenario: 点击 Web URL 直达项目不被误拦截
- GIVEN 用户在大盘中配置或点击了包含 `https://` 的网页卡片（如 `https://chatgpt.com/...`）
- WHEN 系统执行 `launch_custom_target` 命令
- THEN 系统不得抛出“目标路径不存在或无法访问”异常，并成功通过系统协议关联拉起默认浏览器。

### Requirement: REQ-FIX-URL-03 本地物理不存在路径防御拦截保全
WHEN 启动目标属于本地磁盘盘符路径或网络共享 UNC 路径且该路径在本地物理文件系统中确实不存在时，系统 SHALL 严格保持防御性拦截并返回明确错误提示。

#### Scenario: 不存在的物理磁盘路径被可靠拦截
- GIVEN 用户配置了一个不存在的本地路径（如 `Z:\NonExistentMockFolder_123456`）
- WHEN 系统执行 `launch_custom_target` 命令
- THEN 系统必须返回包含 `目标路径不存在或无法访问` 的错误提示，防止静默假死。
