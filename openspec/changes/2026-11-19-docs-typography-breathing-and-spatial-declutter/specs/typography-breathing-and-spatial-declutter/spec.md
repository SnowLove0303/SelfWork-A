# 规格定义: 文档排版呼吸感与空间挤压优化

## 1. 块级外边距与字阶韵律契约 (Typographic Rhythm Specifications)

### 1.1 块级垂直外边距系统 (Vertical Margins)
1. **父容器约束**：
   - `BlockEditor` 块流容器 **SHALL NOT** 使用 `space-y-*` 属性，确保所有子元素的外边距由块自身语义决定；
2. **块级外边距映射表**：
   - `h1`: `mt-10 mb-3 pt-2`（章节大留白，约 40px 顶部间距）；
   - `h2`: `mt-8 mb-2.5 pt-1.5`（小节明确留白，约 32px 顶部间距）；
   - `h3`: `mt-5 mb-2`（子项适度留白，约 20px 顶部间距）；
   - `p`: `my-2 py-0.5`，行高升级为 `leading-[1.75]`（黄金阅读行高）；
   - `code`: `my-4`；
   - `table`: `my-4`；
   - `quote`: `my-3.5 py-1`；
   - `callout`: `my-3.5`；
   - `todo` / `bullet` / `numbered`: `my-1 py-0.5`；
   - `divider`: `my-6`。

---

## 2. 行为契约 (RFC 2119 Statements)

### REQ-SPACE.1 块级垂直外边距与黄金排版呼吸节奏解冻
1. **SHALL** 移除 `BlockEditor.tsx` 中块流容器的 `space-y-0.5` 类；
2. **SHALL** 调整 `BlockItem.tsx` 中各块类型的垂直边距与行高样式；
3. **SHALL** 确保任意标题紧随段落、代码块或表格之后时，顶部自动产生舒适的视觉停顿（$\ge 24px$）。

### REQ-SPACE.2 编辑器水平空间舒展与大纲栏智能收展
1. **SHALL** 在本地存储持久化大纲栏收起偏好（`selfwork_doc_outline_visible`）；
2. **SHALL** 当大纲栏收起时，编辑区容器自适应由 `max-w-3xl` 扩展为宽屏自适应 `max-w-4xl xl:max-w-5xl`；
3. **SHALL** 当大纲栏收起时，在编辑区右上角或边缘常驻呈现极简微光指示胶囊，点击平滑展开大纲；
4. **SHALL** 展开大纲时，采用紧凑现代宽度（`w-52`），减少对中间正文的水平压迫。

### REQ-SPACE.3 划选浮动格式工具条层级与防遮挡优化
1. **SHALL** 确保划选文字时仅弹出单行极简格式条；
2. **SHALL** 避免划选事件与右键 ContextMenu 重叠触发双层浮窗；
3. **SHALL** 浮动工具条在视口上方留出充足边界缓冲，避免遮蔽被划选词句与邻近代码块。
