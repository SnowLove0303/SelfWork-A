# Proposal: 思维导图背景颜色与工作台全局暗色晶体风格统一对齐

## Why (变更背景与问题陈述)
用户提出明确反馈：
> “背景颜色有点不对，要不统一一下？，与主导航和其他页面有点不一致啊”

经底座感知核查：
1. SW工作台主画板（`SlotContainer.tsx`）采用的是动态玻璃画板（`rgba(12, 16, 26, settings.opacity)`），底层具备缓缓漂移的微弱环境折射流光（`animate-fluid-a` / `animate-fluid-b`），主导航（`Sidebar.tsx`）与快速启动仪表盘（`LauncherDashboard`）、待办事项（`TasksView`）均继承此统一通透画板；
2. 但思维导图一级页面（`MindMapPartitionView.tsx`）与二级画布页面（`MindMapView.tsx`）中硬编码了实心不透明的 `bg-slate-950/90`、`bg-slate-900/60` 与 `bg-slate-950`，导致思维导图页面像一块死黑的盖板遮挡了所有底层通透流光，视觉基底与其他模块出现明显割裂。

---

## What (1:1 需求物理对账矩阵与法定契约)

| 需求 ID | 用户原始诉求与核心意图 | 规格契约覆盖 (RFC 2119) | 对应任务 |
| :--- | :--- | :--- | :--- |
| **REQ-BG-01** | **思维导图与工作台全局背景调性统一**：消除割裂感，全模块融为一体 | 思维导图根容器 **SHALL** 移除实心 `bg-slate-950`，继承主画板的通透暗色背景，使环境流光自然透出。 | Task 1, Task 2 |
| **REQ-BG-02** | **一级管理大盘背景与分栏风格对齐**：分区侧栏与导图卡片区风格统一 | 分区侧栏 **SHALL** 使用半透明毛玻璃 `bg-white/[0.02]` 与 `border-white/[0.08]`，导图卡片使用通透晶体卡片 `bg-white/[0.03]`。 | Task 1 |
| **REQ-BG-03** | **二级编辑画布与悬浮控件视觉对齐**：画布底色与悬浮药丸风格统一 | 二级画布视口 **SHALL** 移除实心底色，左上角返回药丸与左下角快捷键状态条统一采用 `bg-black/40 backdrop-blur-md border-white/10` 晶体规范。 | Task 2 |
| **REQ-BG-04** | **全局承重墙绝对锁定**：主侧边栏与既有模块完全保持现状 | 系统 **SHALL** 绝对封印全局主侧边栏（`Sidebar.tsx`）、无边框顶栏（`Titlebar.tsx`）与待办/启动器模块。 | Task 3 |

---

## Impact & Blast Radius (受控爆炸半径与法定双清单)

### 1. 拟变范围清单 (Proposed Mutation Scope)
| 文件路径 | 因果角色类型 | 变更内容与防破坏承诺 |
| :--- | :--- | :--- |
| `src/components/mindmap/MindMapPartitionView.tsx` | `[Style Alignment Root]` | 移除根节点与分栏的硬编码 `bg-slate-950` / `bg-slate-900` 实底，改为通透的 `bg-transparent`，侧栏采用 `bg-black/15 backdrop-blur-md border-white/[0.06]`，卡片采用 `bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.08]`，与工作台其它卡片完全对齐。 |
| `src/components/MindMapView.tsx` | `[Style Alignment Root]` | 移除二级画布外层的 `bg-slate-950` 实底，左上角返回药丸与左下角快捷键提示条统一为与系统一致的精细晶体毛玻璃风格，保持纯键盘交互逻辑 100% 不变。 |

### 2. 保持现状承诺清单 (Preservation Commitments)
- **承重墙 1 (`src/components/Sidebar.tsx`)**：工作台主导航侧栏绝对只读，呼吸流光条与既有结构严禁修改；
- **承重墙 2 (`src/components/Titlebar.tsx`)**：窗口顶栏与拖拽区绝对只读；
- **承重墙 3 (`src/components/SlotContainer.tsx` & `src/App.tsx`)**：全局画板与底层流光发生器完全保持现状；
- **业务逻辑与交互**：思维导图分区管理、多导图增删改查、纯键盘交互（Tab/Enter/Delete/Space/F2）100% 保持现状。
