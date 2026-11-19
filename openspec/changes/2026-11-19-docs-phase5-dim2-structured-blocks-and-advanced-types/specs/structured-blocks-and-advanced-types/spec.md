# 规格定义: 阶段五（维度 2）结构化排版与高级块类型

## 1. 块模型扩充契约 (Block Schema Extension)

### 1.1 类型定义
```typescript
export type BlockType =
  | 'p' | 'h1' | 'h2' | 'h3' | 'todo' | 'bullet' | 'numbered'
  | 'callout' | 'quote' | 'code' | 'divider' | 'table' | 'toggle'
  | 'image' | 'mindmap' | 'math' | 'columns' | 'toc'
  | 'media'   // 新增：音视频与富媒体外链卡片
  | 'synced';  // 新增：跨文档双向同步引用块
```

### 1.2 块属性扩展契约
- **`code` 增强属性**：
  - `properties.showLineNumbers?: boolean`（默认 true）
  - `properties.language?: string`（默认 'javascript'）
- **`media` 属性**：
  - `properties.url: string`
  - `properties.mediaType?: 'video' | 'audio' | 'embed'`
  - `properties.title?: string`
- **`synced` 属性**：
  - `properties.syncId: string`（全局唯一 UUID）
  - `properties.isOriginal?: boolean`

---

## 2. 行为契约 (RFC 2119 Statements)

### REQ-D2.1 多级折叠列表块 (`/toggle`)
1. **SHALL** 在用户触发 `/toggle` 或在空块输入 `> ` 时转换为折叠列表块；
2. **SHALL** 拥有可点击折叠小三角，并在折叠与展开状态切换时伴随顺滑 CSS 旋转动画；
3. **SHALL** 在 `BlockItem.tsx` 标准管道中统一挂载 6 点拖拽手柄、拖拽指示线与快捷键换块监听；
4. **SHALL** 折叠状态以 `properties.isOpen` 持久化，关闭文档重新打开保持原状。

### REQ-D2.2 专业代码块深度增强 (`Enhanced CodeBlock`)
1. **SHALL** 在代码块右上角呈现微光悬浮胶囊栏：语言下拉、行号切换按钮、一键复制代码按钮、全屏沉浸阅读按钮；
2. **SHALL** 点击复制代码后，系统剪贴板存入纯净代码文本，并在按钮上即时展示绿色 Check 图标与复制成功状态持续 1.5 秒；
3. **SHALL** 行号左侧固定宽度对齐，具有 `select-none` 属性，鼠标框选代码时绝不选中行号文本；
4. **SHALL** 全屏阅读模式以固定模态层居中展开，支持滚动与语法高亮，按 `Esc` 或关闭按钮退出。

### REQ-D2.3 音视频与多媒体外链卡片 (`/media`)
1. **SHALL** 在斜杠菜单输入 `/media`、`/video` 或 `/audio` 插入多媒体块；
2. **SHALL** 当用户输入直链时，若为音频格式（mp3, wav, ogg, flac）渲染紧凑声波微光播放条；若为视频格式（mp4, webm）渲染圆角等比播放器；
3. **SHALL** 针对多栏布局自适应缩放，播放状态受浏览器原生媒体引擎安全沙箱托管。

### REQ-D2.4 双向同步只读引用嵌入块 (`/synced`)
1. **SHALL** 在斜杠菜单输入 `/synced` 时，允许选择“新建同步源块”或“粘贴 Sync ID 嵌入引用”；
2. **SHALL** 源块与所有引用块共享同一个全局 `syncId`，内容持久化于 `selfwork_synced_blocks_${syncId}` 缓存与数据库中；
3. **SHALL** 同步块呈现专属翡翠青色微光外框并标注「🔗 同步块 (Sync Block)」；
4. **SHALL** 编辑同步块时自动广播或持久化更新，使全库所有引用处在切换或只读浏览时保持绝对一致。
