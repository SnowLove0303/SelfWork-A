# 任务分解与执行清单 (Tasks)

- [x] Task 1: 建立跨块选区协同器与多块连续划选状态机 (`BlockEditor.tsx` & `BlockItem.tsx`)
  - [x] 1.1 在 `BlockEditor.tsx` 中建立 `crossSelectedBlockIds` 状态，并在块容器层接入 `mousedown`, `mousemove`, `mouseup` 拖选手势捕获
  - [x] 1.2 在 `BlockItem.tsx` 中接入 `isCrossSelected` 属性与沉浸式选中视觉高亮样式
  - [x] 1.3 验证机检退出码 0 (`pnpm check`)

- [x] Task 2: 实现跨块批量操作（复制、删除、输入替换与点击重置）(`BlockEditor.tsx`)
  - [x] 2.1 监听全局 `copy` 事件 (`Ctrl+C` / `Cmd+C`)，实现多块文本合并写入系统剪贴板
  - [x] 2.2 监听键盘 `Backspace` / `Delete` 事件，实现多块批量删除与平滑留白接合
  - [x] 2.3 支持单击空白处或单块即刻重置跨块选区状态
  - [x] 2.4 验证机检退出码 0 (`pnpm check`)

- [x] Task 3: 单元测试、构建打包与热替换部署发布
  - [x] 3.1 运行 Rust 单元测试 `cargo test` 确保 14/14 全绿
  - [x] 3.2 运行前端机检 `pnpm check` 确保 0 警告 0 错误
  - [x] 3.3 运行 `pnpm tauri build --no-bundle` 编译新版二进制 (v0.1.69)
  - [x] 3.4 替换 `SelfWork.exe` 并热启动验证
  - [x] 3.5 更新 `CHANGELOG.md` 并推送到 GitHub `main` 分支
