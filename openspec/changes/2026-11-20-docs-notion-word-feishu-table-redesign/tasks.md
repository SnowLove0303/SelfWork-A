# Tasks: Notion/Feishu/Word Grade Table Architecture Redesign

## 1. 任务实施概览与执行锁状态

- [x] **Task 1: 重构 `TableBlock.tsx` 边框几何系统，彻底剔除假操作列**
  - **因果角色**: [Root Source]
  - **关联需求**: REQ-1
  - **核心动作**:
    1. 彻底删除 `<col style={{ width: '52px' }}>` 与每行末尾透明操作列 `<td className="w-13 border-transparent">`；
    2. 删除表头右侧与行末的外挂删除/清空/插入按钮；
    3. 统一采用 `border-collapse: collapse` 配合统一暗黑边框色 `rgba(255,255,255,0.08)` 与外部封闭边框，消除一切内框线断点与毛刺；
  - **实测验证**: `cd "F:\App Location\SelfWork" ; pnpm check` 零警告零错误。

- [x] **Task 2: 实现 Notion / 飞书式边框吸附插入微手柄 (Hover Line Inserters)**
  - **因果角色**: [Interactive UX]
  - **关联需求**: REQ-2
  - **核心动作**:
    1. 在表头垂直分割线处挂载悬停吸附手柄（16px 圆形微按钮，带 `+` 图标），点击即在当前两列之间插入列；
    2. 在行间水平分割线处挂载悬停吸附手柄（16px 圆形微按钮，带 `+` 图标），点击即在当前两行之间插入行；
    3. 在表格最右侧边缘和最底部边缘提供极简微扩展触发区；
    4. 保证吸附手柄与现有的列宽拖拽手柄互不干扰、平滑共存。
  - **实测验证**: `cd "F:\App Location\SelfWork" ; pnpm check` 零警告零错误。

- [x] **Task 3: 实现飞书 / Notion 式暗黑沉浸式右键上下文菜单 (`TableContextMenu`)**
  - **因果角色**: [Contextual Operations]
  - **关联需求**: REQ-3
  - **核心动作**:
    1. 监听表格单元格与表头的 `onContextMenu`，阻止浏览器默认右键行为；
    2. 在光标位置渲染现代化暗黑毛玻璃上下文菜单；
    3. 收敛整合对齐控制（左中右）、行列插入（上下左右）、行列清空、行列与整表删除；
    4. 全局监听点击外部区域与 `Escape` 键自动瞬时关闭菜单。
  - **实测验证**: `cd "F:\App Location\SelfWork" ; pnpm check` 零警告零错误。

- [x] **Task 4: Word 式键盘录入流与快捷键打磨**
  - **因果角色**: [Keyboard Flow]
  - **关联需求**: REQ-4
  - **核心动作**:
    1. 完善单元格键盘事件处理：`Enter` 聚焦下行同列，末行自动新增行；
    2. `Shift + Enter` 换行；`Tab` / `Shift + Tab` 单元格间平滑切换；
    3. 修复文本选中与编辑状态下的交互体验。
  - **实测验证**: `cd "F:\App Location\SelfWork" ; pnpm check` 零警告零错误。

- [x] **Task 5: 全量构建、应用热替换拉起与 1:1 双向物理核销**
  - **因果角色**: [Build & Verification]
  - **关联需求**: REQ-1, REQ-2, REQ-3, REQ-4
  - **核心动作**:
    1. 执行完整编译 `pnpm tauri build --no-bundle`；
    2. 运行热替换并重启 `SelfWork.exe` (v0.1.79)；
    3. 核销内框线对齐无断点、吸附微手柄交互与右键菜单；
    4. 提交 git 原子提交并更新 `CHANGELOG.md`。
  - **实测验证**: 真实编译退出码 0，进程稳定启动 (PID: 6300, 11296)。
