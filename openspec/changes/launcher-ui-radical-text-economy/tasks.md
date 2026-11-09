# Implementation Tasks: Launcher UI Radical Text Economy & Compact Cockpit Refactoring

## Single-Focus Lock: Task Pipeline

- [ ] **Task 1: 重构 SwitchboardPanel 条目为单行紧凑水平结构并清除废话正文**
  - **因果归属**: [State Transition] UI 几何与微文案净化
  - **实现目标**:
    - 移除服务条目中的 `<p>{item.description}</p>` 正文段落；
    - 将 `item.description` 降级转为外层容器的原生 `title` 悬停提示；
    - 采用单行水平平齐结构（【图标】+【名称】+【端口/PID 胶囊】+【状态指示灯】+【触觉开关】），高度控制在 40~44px；
    - 集群标题栏同样剔除副标题说明，仅保留名称、计数与总控开关。
  - **实测验证门禁 [Measured]**:
    - `pnpm tsc --noEmit` 静态类型检查退出码 0。

- [ ] **Task 2: 全量机检、构建打包与端到端实测**
  - **因果归属**: [Verification & Delivery] 生产交付
  - **实现目标**:
    - `pnpm check` 零警告、零错误，退出码 0；
    - `pnpm build` 前端打包退出码 0；
    - `pnpm tauri build --no-bundle` 重新封包 `SelfWork.exe`，退出码 0；
    - 启动独立单文件可执行文件，核验界面紧凑美观、废话清零且真实巡检功能完好。
  - **实测验证门禁 [Measured]**:
    - 离线独立运行验证，卡片布局紧凑，零废话文本。
