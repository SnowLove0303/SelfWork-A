# Design: 文档编辑器行内实时渲染与撤销重做架构

## 1. 架构流转拓扑 (Architecture Topology)

```mermaid
flowchart TD
    subgraph UI[行内实时富文本块 BlockItem]
        DOM[持久化 ContentEditable 容器]
        KeyEvt[按键事件捕获 KeyDown]
        SelectEvt[选区捕获 SelectionChange]
        FormatCmd[排版指令 Ctrl+B / ContextMenu]
        
        KeyEvt -->|Ctrl+B| ExecBold[document.execCommand 'bold']
        KeyEvt -->|Ctrl+I| ExecItalic[document.execCommand 'italic']
        KeyEvt -->|Ctrl+Z / Ctrl+Y| BubbleUndo[上报 BlockEditor 历史栈]
        FormatCmd --> ExecCmd[原生富文本排版指令\n零星号残留 / 选区实时保留]
    end

    subgraph State[块编辑器状态与历史栈 BlockEditor]
        BlocksState[当前块状态 blocks]
        UndoStack[撤回栈 undoStack]
        RedoStack[重做栈 redoStack]
        HistoryManager[历史快照管理器\n防抖 800ms 记录输入\n即时记录结构与格式变更]
        
        BubbleUndo --> HistoryManager
        HistoryManager -->|Ctrl+Z 弹出| BlocksState
        HistoryManager -->|Ctrl+Y 推进| BlocksState
    end

    subgraph DB[SQLite 数据库持久化]
        DebounceTimer[500ms 智能防抖合并计时器]
        BlocksState --> DebounceTimer
        DebounceTimer --> SQLiteWrite[db_save_blocks_batch 批量落盘]
    end
```

## 2. 关键技术细节与反欺诈保证

1. **彻底消除 DOM 切换**:
   - 彻底废除之前的 `!isFocused ? <div> : <textarea>` 模式；
   - 块内容容器保持单一、持久挂载的 `contentEditable` 元素，彻底避免由于 DOM 卸载挂载带来的失焦与光标瞬移至末尾问题。
2. **零星号排版呈现**:
   - 排版指令使用 `document.execCommand` / DOM Selection 精准在选区包裹 `<strong>`, `<em>`, `<del>`, `<code>`；
   - 选中文本即刻视觉生效，用户绝不接触到未转义的 Markdown 代码；
3. **分层 Undo/Redo**:
   - 块内部微观文字输入：享受浏览器原生光标级别的撤回重做；
   - 块级宏观操作（格式应用、块新建、块删除、块类型转换）：由 `BlockEditor` 的全局 `HistoryManager` 严格管理。
4. **防抖持久化**:
   - 引入 `useRef<NodeJS.Timeout>` 500ms 防抖，将频繁击键合并为单一批处理事务，内存状态 0ms 响应，写库无感静默。
