# Tasks: Custom Background and Appearance Settings

- [x] Task 1: 建立外观设置类型定义与滑动条样式 (`src/types/settings.ts`, `src/styles/globals.css`) [Root Source]
  - 定义 `AppearanceSettings` 接口、枚举与 `DEFAULT_APPEARANCE_SETTINGS`
  - 在 CSS 中定制轻量高透亚克力滑动条 (Range Slider) 与分段开关样式
  - 验证命令: `pnpm check` 退出码 0

- [x] Task 2: 构建可扩展设置中心组件与「外观与背景」配置面板 (`src/components/SettingsView.tsx`) [State Transition]
  - 构建左侧子分类导航（外观与背景、通用设置、快捷键、关于）
  - 构建高保真参数控制面板（作用域切换、背景模式、文件选择与 URL 输入、透明度/模糊度/遮罩滑块、重置按钮）
  - 验证命令: `pnpm build` 退出码 0

- [x] Task 3: 改造 App.tsx 与 SlotContainer.tsx 实现双模实时渲染与持久化 [Consumer Sink]
  - 将 `appearanceSettings` 接入全局状态与 `localStorage` 同步
  - 实现 `scope === 'window'` 与 `scope === 'stage'` 双模平滑切换
  - 当 `activeModule === 'settings'` 时在主舞台挂载 `SettingsView`
  - 验证命令: `pnpm build` 退出码 0

- [x] Task 4: 桌面 Release EXE 编译、全端回归验证与 GitHub 归档 [Milestone Archive]
  - 重新编译 Release 版 `SelfWork.exe`（通过官方标准 `pnpm tauri build --no-bundle` 实现 100% 静态内嵌，彻底根除对 localhost:1420 的依赖）
  - 验证壁纸切换、滑块拉动即时响应、重启状态恢复
  - Git commit 并推送至远程仓库
  - 验证命令: `git status && git log -1`
