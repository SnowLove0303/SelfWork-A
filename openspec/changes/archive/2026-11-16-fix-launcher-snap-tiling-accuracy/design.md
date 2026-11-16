# Design: 快速启动屏幕分屏吸附精度与多窗口去重防重叠架构

## 1. 根本原因穿透与时序因果拓扑 (Causal Architecture)

### 1.1 屏幕落点错误与窗口堆叠因果链
```mermaid
flowchart TD
    subgraph Old Flawed Mechanism
        A1[并发唤起 4 个子项] --> B1[等待 350ms 即单次调用 arrange_combo_windows]
        B1 --> C1[第 3/4 个文件夹窗口尚未完成 Explorer 注册]
        C1 --> D1[未被排版的窗口滞留于系统默认的屏幕 1!]
        B1 --> E1[缺少已分配句柄 HWND 排他池]
        E1 --> F1[槽位 1 匹配了窗口 A, 槽位 2 因路径未就绪也匹配到窗口 A!]
        F1 --> G1[窗口 A 被重复移动至槽位 2, 多个窗口堆叠在一起!]
    end

    subgraph New Reliable Mechanism
        A2[并发唤起 4 个子项 + 注入 explorer /separate 参数] --> B2[自适应多轮轮询探测管道 max 3.0s]
        B2 --> C2[维护 $usedHwnds 排他池，已占位窗口严禁二次分配]
        C2 --> D2[每个槽位精确锁定独立的物理 HWND]
        D2 --> E2[未就绪槽位在下一轮轮询中继续捕获新生成窗口]
        E2 --> F2[所有窗口 100% 映射至目标屏幕工作区基准，零溢出零重叠!]
    end
```

---

## 2. 核心架构升级 (Core Improvements)

### 2.1 引入已分配窗口句柄排他池 (Claimed HWND Pool)
在 PowerShell / Win32 探测管道中，维护 `$usedHwnds = New-Object 'System.Collections.Generic.HashSet[int]'`：
1. 当某个槽位匹配到 `$w.HWND`（或进程主句柄）后，先检查 `$usedHwnds.Contains($hwnd)`；
2. 若已包含，则跳过该窗口，继续寻找下一个可用物理窗口；
3. 匹配成功后，立即执行 `$usedHwnds.Add($hwnd)`；
4. 保证每个物理窗口在全生命周期内与单一象限槽位绝对 1:1 互斥绑定，彻底消除多窗口叠罗汉。

### 2.2 自适应多轮轮询探测管道 (Adaptive Polling Loop)
由前端单次 350ms 盲等改为后端自适应多轮轮询：
- 后端脚本在最大 2.5 秒内进行最多 5 轮增量重试（每轮间隔 250ms）；
- 每轮仅针对“尚未找到物理窗口”的槽位重新查询 `$shell.Windows()` 与系统进程；
- 一旦全部槽位均成功锁定（`unresolved.Count == 0`），立即跳出轮询完成排版，兼顾极速响应与延迟就绪容灾。

### 2.3 物理路径精准规范化与 Windows 11 Explorer 标签隔离
1. **多目录消歧**：路径统一规整为大写并移除尾部斜杠（`$normTarget = $target.TrimEnd('\').ToUpper()`），同时比对 `$w.Document.Folder.Self.Path` 与 `$w.LocationURL`；
2. **标签页隔离防吞并**：在 `launch_custom_target` 中唤起目录时，使用 `explorer.exe /separate, "路径"`，强制 Windows 11 在独立窗口中打开新目录，防止被合并入已有窗口的 Tabs 中导致句柄共享。

### 2.4 显示器可用工作区原点对齐
- 计算公式：
  $$\text{TargetX} = \text{BaseX} + \text{Round}(\text{WorkW} \times \text{x\_ratio})$$
  $$\text{TargetY} = \text{BaseY} + \text{Round}(\text{WorkH} \times \text{y\_ratio})$$
- 显式调用 `ShowWindow(hWnd, 9 /* SW_RESTORE */)` 还原窗口尺寸状态，消除 Windows 最大化状态锁定；
- 紧随调用 `SetWindowPos(hWnd, HWND_TOP, TargetX, TargetY, Width, Height, SWP_SHOWWINDOW)`。
