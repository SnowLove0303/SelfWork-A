# Tasks: Docs Table Clean UI and Instant Selection Dismiss

## 1. 任务实施概览与执行锁状态

- [x] **Task 1: 实现选区即时坍缩与全局外部脱离侦测器 (`table:selection-dismiss`)**
  - **因果角色**: [Selection Lifecycle Machine]
  - **关联需求**: REQ-SELECTION-DISMISS
  - **核心动作**:
    1. 在 `TableBlock.tsx` 单元格普通 `onMouseDown` 中，无 Shift 键时立即清空 `selectedRange`；
    2. 注册容器外 `mousedown` 侦测器，点击表格外部时自动清空 `selectedRange` 与 `activeCell`；
    3. 全局监听 `Escape` 键，秒速取消多空格选区与所有浮动微面板。
  - **实测验证**: `cd "F:\App Location\SelfWork" ; pnpm check` 零警告零错误。

- [x] **Task 2: 表格抬头与底部界面极致净化与去繁留简 (`table:clean-ui`)**
  - **因果角色**: [Clean UI & Anti-AI-Slop]
  - **关联需求**: REQ-CLEAN-TABLE-HEADER
  - **核心动作**:
    1. 移除表格抬头常驻的密集功能按钮群（对齐、底纹、斑马纹、表头、复制MD等）；
    2. 移除表格底部的冗长文本说明，恢复干净透亮的画布外观；
    3. 仅保留极简尺寸指示与悬停微操作点。
  - **实测验证**: `cd "F:\App Location\SelfWork" ; pnpm check` 零警告零错误。

- [x] **Task 3: 右键菜单收敛升级（增设“表格样式”与全功能闭环）(`table:rightclick-convergence`)**
  - **因果角色**: [Context Menu Convergence]
  - **关联需求**: REQ-RIGHTCLICK-CONVERGENCE
  - **核心动作**:
    1. 在 `TableContextMenu` 增设“🎨 表格样式 ▸”二级折叠子菜单，收纳“首行表头开关”与“隔行斑马纹开关”；
    2. 完善复制 Markdown 与删除整表等操作的就地呼出体验；
    3. 保证 Word 9 宫格对齐微面板与莫兰迪底色卡在右键 Mini Toolbar 中 100% 顺畅唤出。
  - **实测验证**: `cd "F:\App Location\SelfWork" ; pnpm check` 零警告零错误。

- [x] **Task 4: 全量编译、应用部署、1:1 双向物理核销与发布**
  - **因果角色**: [Build & Verification]
  - **关联需求**: REQ-SELECTION-DISMISS, REQ-CLEAN-TABLE-HEADER, REQ-RIGHTCLICK-CONVERGENCE
  - **核心动作**:
    1. 执行前端与 Tauri Release 完整编译；
    2. 部署替换 `SelfWork.exe` 并验证进程；
    3. 更新 `CHANGELOG.md` 并执行 git 原子提交；
    4. 呈报 1:1 双向核销交付报告。
  - **实测验证**: 真实编译退出码 0，桌面端进程稳定存活。
