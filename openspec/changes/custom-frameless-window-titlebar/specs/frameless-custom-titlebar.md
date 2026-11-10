# Specification: frameless-custom-titlebar

## 1. 窗口样式与装饰规格 (Window Decoration & Visual Spec)

### 1.1 窗口无装饰规范 (Frameless Invariant)
- **WHEN** 应用程序在 Windows 环境下启动；
- **THEN** Tauri 配置文件 `tauri.conf.json` **SHALL** 设置 `"decorations": false`；
- **THEN** 系统 **SHALL NOT** 绘制 Windows 浅灰色原生标题栏及系统默认窗口控制条；
- **THEN** 窗口根视口容器 **SHALL** 应用与深色科技风格一致的底色，并在非最大化状态下渲染 1px 细微边界轮廓（`border border-white/[0.08]`），最大化状态下自动取消边界轮廓。

### 1.2 顶部单层一体化规范 (Single-Tier Header Invariant)
- **WHEN** 顶部导航与自定义标题栏渲染；
- **THEN** 顶部高度 **SHALL** 严格保持 44px（`h-11`），与左侧边栏 Brand 区域基准水平线精确对齐；
- **THEN** 系统 **SHALL NOT** 在顶部额外增加一层独立的标题栏行；
- **THEN** 顶部左侧与侧栏联动展示页面标题，正中展示可拖拽区域，右侧集成状态胶囊与窗口控制三按键。

## 2. 窗口控制按钮契约 (Window Control Button Contract)

### 2.1 按钮功能与几何图标规格
- **WHEN** 用户查看右上角控制区；
- **THEN** 右上角 **SHALL** 包含三个独立按钮：
  1. **最小化按钮 (Minimize)**: 细线条水平减号图标，点击触发 `window_minimize`；
  2. **最大化/还原按钮 (Maximize/Restore)**:
     - 当窗口未最大化时，显示单层矩形图标，点击触发 `window_toggle_maximize` 使窗口最大化；
     - 当窗口处于最大化时，显示双层叠放矩形图标，点击触发 `window_toggle_maximize` 使窗口还原；
  3. **关闭按钮 (Close)**: 细线条等比例 X 叉号图标，点击触发 `window_close`。

### 2.2 视觉与反馈规范
- **WHEN** 鼠标未悬停于控制按钮时；
- **THEN** 按钮图标颜色 **SHALL** 呈现低对比度的柔和文字色（`text-fg-muted`），融入深色背景；
- **WHEN** 鼠标悬停于最小化或最大化/还原按钮时；
- **THEN** 按钮背景 **SHALL** 呈现柔和半透明浅白反光（`bg-white/[0.08] text-fg-primary`）；
- **WHEN** 鼠标悬停于关闭按钮时；
- **THEN** 按钮背景 **SHALL** 呈现克制柔和暗红警示背景（`bg-rose-500/20 text-rose-300`）。

## 3. 窗口原生交互契约 (Window Native Interaction Contract)

### 3.1 拖拽与双击最大化
- **WHEN** 用户鼠标在顶部导航非交互空白区域长按拖拽；
- **THEN** 该区域带 `data-tauri-drag-region` 属性，系统 **SHALL** 顺畅执行 Windows 原生窗口移动；
- **WHEN** 用户双击顶部拖拽区域；
- **THEN** 系统 **SHALL** 切换最大化与还原状态（Toggle Maximize）；
- **WHEN** 用户在侧栏顶部 Brand 区域长按拖拽；
- **THEN** 该区域同样具备拖拽抓手能力。

### 3.2 交互防吞没与边缘拉伸
- **WHEN** 用户点击侧边栏展开按钮、状态探测胶囊或右上角窗口控制按钮；
- **THEN** 这些控件 **SHALL NOT** 挂载拖拽行为，事件 **SHALL** 正常冒泡并触发各自的交互回调，绝不被窗口拖拽机制吞没；
- **WHEN** 用户鼠标移至窗口四周边缘（左、右、上、下及四个角）；
- **THEN** Windows 系统边缘拉伸光标 **SHALL** 正常激活，支持拖拽调整窗口尺寸。
