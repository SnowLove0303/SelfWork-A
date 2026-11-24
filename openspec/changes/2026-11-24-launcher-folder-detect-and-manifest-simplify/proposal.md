# Proposal: 纳入文件夹运行检测关闭并极简化运行清单

## 1. 原始需求与事实指纹
> 文件夹的进程检测与快速关闭要纳入，另外，取消进程清单的 进程啊实例啊之类的表述，取消进程检测清单的多开功能

## 2. 1:1 需求物理对账矩阵 (RTM)

| 需求编号 | 需求描述 | 因果定位 | 对应任务 |
|---|---|---|---|
| **REQ-FOLDER-01** | 纳入文件夹运行检测与快速关闭（安全关闭指定文件夹窗口，不误杀 `explorer.exe`） | Rust `detect_launcher_processes` / `close_launcher_windows` + 前端单品/组合/清单适配 | Task 1, Task 2 |
| **REQ-JARGON-02** | 取消清单内“进程”“实例”“PID”“活跃”等技术表述 | `ProcessManifestModal.tsx` & `LauncherDashboard.tsx` | Task 2, Task 3 |
| **REQ-NO-MULTI-03** | 取消清单内的“多开”按钮与可展开 PID 明细栏 | `ProcessManifestModal.tsx` | Task 3 |

## 3. 法定双清单

### 3.1 拟变范围清单
1. `F:\App Location\SelfWork\src-tauri\src\lib.rs` `[Backend Folder Window Detection & Close]`：
   - 扩展 `LauncherProcessInfo` 增加 `window_handles: Vec<isize>`；
   - 在 `detect_launcher_processes` 中对 `item_type == "folder"` 探测当前已打开的文件夹资源管理器窗口路径与对应 `HWND`；
   - 新增 `close_launcher_windows(hwnds: Vec<isize>)` 命令，通过原生 `PostMessageW(hwnd, WM_CLOSE, 0, 0)` 安全关闭指定文件夹窗口（绝不触碰 `explorer.exe` 进程）。
2. `F:\App Location\SelfWork\src\components\LauncherDashboard.tsx` `[Frontend State & Actions]`：
   - `refreshProcessStatus` 纳入 `folder` 类型；
   - 单品卡片、组合聚合、全部关闭均支持文件夹 `window_handles` 关闭；
   - 顶栏按钮标签 `进程清单` 改为 `运行清单`。
3. `F:\App Location\SelfWork\src\components\launcher\ProcessManifestModal.tsx` `[UI Clean & Simplify]`：
   - 去除“进程”“实例”“PID”“活跃”等词汇；
   - 去除“多开”按钮与展开 PID 明细栏；
   - 统一纳管运行中的应用、文件夹与组合。

### 3.2 保持现状承诺清单
- 100% 保持应用主卡片的多开启动能力不受影响；
- 100% 保持桌面 `explorer.exe` 与无关窗口不受影响。
