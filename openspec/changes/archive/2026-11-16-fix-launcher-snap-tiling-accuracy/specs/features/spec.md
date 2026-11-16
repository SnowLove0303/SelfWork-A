## ADDED Requirements

### Requirement: REQ-SNAP-TARGET-01: 各分屏窗口目标屏幕与象限 100% 精准锚定
系统在执行分屏启动或组合启动时，SHALL 将所有参与分屏的子窗口严格定位到用户选定的目标显示器（Target Monitor）可用工作区内，零跨屏溢出。

#### Scenario: 指定副屏（屏幕 2）启动四分屏组合
- GIVEN 用户选择目标屏幕为副屏（索引为 1）并启动包含 4 个项目的四分屏组合
- WHEN 系统执行窗口吸附编排
- THEN 系统 SHALL 以副屏工作区原点与宽高作为坐标计算基准
- AND 4 个窗口的坐标 (X, Y) SHALL 绝对落在副屏可用物理坐标区间内
- AND 主屏上 SHALL NOT 出现属于该组合的误落窗口

#### Scenario: 指定主屏（屏幕 1）启动二分屏组合
- GIVEN 用户选择目标屏幕为主屏（索引为 0）并启动二分屏组合
- WHEN 系统执行窗口吸附编排
- THEN 系统 SHALL 将左侧窗口吸附在主屏左半侧 (x_ratio = 0, w_ratio = 0.5)
- AND 将右侧窗口吸附在主屏右半侧 (x_ratio = 0.5, w_ratio = 0.5)

### Requirement: REQ-SNAP-DEDUP-02: 多窗口唯一占位互斥与防重叠机制
系统在为多个象限槽位分配物理窗口时，SHALL 维护已分配句柄排他池，确保每个物理窗口仅能被分配给一个槽位，杜绝重复与堆叠。

#### Scenario: 两个相似文件夹分屏时各自独立平铺
- GIVEN 组合中包含路径相似但不同的两个文件夹（如重写版与备用版）
- WHEN 系统查找并定位这两个文件夹的资源管理器窗口
- THEN 系统 SHALL 依据物理路径精准消歧，分别分配给左右两个不同象限
- AND 已分配给左象限的窗口句柄 SHALL NOT 再次被右象限匹配
- AND 两个窗口在屏幕上的重叠率 SHALL 为 0%

### Requirement: REQ-SNAP-RETRY-03: 异步并发启动自适应重试与平滑就绪轮询
系统在处理多应用/多文件夹并发启动时，SHALL 具备自适应就绪轮询机制，确保因系统负载或磁盘延迟较晚生成的窗口也能被完整排版。

#### Scenario: 后就绪窗口在轮询中被捕获并定位
- GIVEN 启动 4 个子项时，第 3 和第 4 个文件夹窗口在 800ms 后才完成渲染创建
- WHEN 系统执行分屏吸附编排
- THEN 系统 SHALL 保持持续轮询探测直到所有目标窗口就位或超时（最大 3.0s）
- AND 在第 3 和第 4 个窗口就绪后 SHALL 立即将其吸附到对应象限
- AND 最终成功停靠计数 SHALL 达到 4/4

### Requirement: REQ-SNAP-AUDIT-04: 多显示器与分屏全场景自动化测试审计
系统 SHALL 配备覆盖多显示器坐标偏移、已用句柄互斥去重、路径消歧匹配与并发就绪重试的端到端自动化测试套件。

#### Scenario: 分屏吸附自动化测试套件核销
- GIVEN 运行测试脚本 `scripts/launcher-snap-tiling-test.mjs`
- WHEN 执行跨屏计算、句柄去重互斥与坐标区间断言
- THEN 进程退出码 SHALL 为 0
- AND 每一个断言 SHALL 附带明确的通过凭据
