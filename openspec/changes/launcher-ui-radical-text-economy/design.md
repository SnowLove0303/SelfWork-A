# Design Document: Launcher UI Radical Text Economy & Compact Cockpit Refactoring

## 1. Visual Comparison (Before vs. After)

### Before (AI-Slop Prose Pollution & Loose Vertical Padding):
```
┌────────────────────────────────────────────────────────┐
│ [Icon]  微信 (WeChat)  [:port]                         │
│         腾讯微信 Windows 官方桌面版                    │ <── 废话说明段落，浪费垂直空间
│                                🟢 运行中  [ 停止 ]     │
└────────────────────────────────────────────────────────┘ (行高 ~64px)
```

### After (Radical Text Economy & Single-Line Cockpit Row):
```
┌────────────────────────────────────────────────────────┐
│ [Icon] 微信 (WeChat) [PID: 14208]    🟢 运行中 [ 停止 ] │ <── 单行咬合，干净利落
└────────────────────────────────────────────────────────┘ (行高 ~40px)
```

---

## 2. Component Layout & Refactoring Details

### 2.1 Refactoring `SwitchboardPanel.tsx`
1. **Item Row**:
   - Replace the stacked `<div className="min-w-0 flex-1"><div className="flex...">...</div><p className="description">...</p></div>`
   - With a compact single-line flex row:
     ```tsx
     <div
       key={item.id}
       title={item.description}
       className="px-3 py-2 flex items-center justify-between gap-2.5 hover:bg-white/[0.03] transition-colors"
     >
       <div className="flex items-center gap-2 min-w-0 flex-1">
         <div className="...">...</div>
         <span className="text-xs font-medium text-fg-primary truncate">{item.name}</span>
         {item.port && <PortCapsule ... />}
         {isRunning && item.pids && <PidBadge ... />}
       </div>
       <div className="flex items-center gap-2.5 shrink-0">
         <StatusIndicator ... />
         <ActionButton ... />
       </div>
     </div>
     ```
2. **Cluster Header**:
   - Strip `cluster.description` from cluster header.
   - Keep cluster icon, cluster title, running badge, and master batch start/stop buttons.
   - Compact padding to `py-2 px-3`.

---

## 3. Benefits & Metrics

1. **Text Economy**: Removes 20+ lines of redundant prose text from the primary UI view.
2. **Screen Density**: Increases vertical card density by ~35%, allowing 8-10 services visible without scrolling.
3. **Cognitive Load**: Eliminates reading fatigue; users can scan service names, ports, and states instantly.
