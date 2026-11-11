# Spec: 思维导图回收站管理与生命周期契约规范

## 1. 数据模型与契约 (RFC 2119)

### SHALL Requirements
1. `MindMapDocument` **SHALL** 增加可选字段 `isDeleted?: boolean` 与 `deletedAt?: number`。当 `isDeleted === true` 时，该文档被视为处于回收站中。
2. 常规分区大盘与文档计数 **SHALL** 仅统计与过滤 `!doc.isDeleted` 的活跃文档，处于回收站中的文档不得在常规分区中展示。
3. `MindMapPartitionView.tsx` 左侧侧栏 **SHALL** 在分区列表下方设立固定的“回收站”入口，动态显示 `docs.filter(d => d.isDeleted).length`。
4. 当用户选择回收站时，右侧大盘 **SHALL** 呈现回收站视图：
   - 顶栏高度 **SHALL** 保持 `h-[49px]`，标题显示为“回收站”，并提供“清空回收站”按钮；
   - 卡片网格 **SHALL** 显示处于回收站的导图，每张卡片必须具备：文档标题、原所属分区名称、删除时间、节点总数，以及“恢复”与“彻底删除”按钮。
5. 导图恢复操作 **SHALL** 将 `isDeleted` 设为 `false` 并清除 `deletedAt`；若原 `partitionId` 已不存在，**SHALL** 自动回退迁移至默认分区 `DEFAULT_PARTITION_ID`。
6. 彻底删除操作与清空回收站操作 **SHALL** 物理抹除对应的文档记录（从数组中移除），并即时保存至 SQLite 数据库。

### WHEN / THEN Contracts
- **WHEN** 用户在常规导图卡片菜单点击“删除导图”时；
- **THEN** 该导图的 `isDeleted` 被标记为 `true`，`deletedAt` 记录为当前时间戳，导图从当前分区大盘消失，回收站徽标加 1。
- **WHEN** 用户在回收站卡片中点击“恢复”时；
- **THEN** 该导图从回收站消失，重新出现在原分区的大盘中，回收站徽标减 1。
