# Tasks: 工作台全局平滑切页动效与空间视觉落位对齐

- [x] Task 1: 在 `SlotContainer.tsx` 中落地模块级 180ms 硬件加速平滑切页动效
  - 引入基于 `key={activeModule}` 的 CSS 硬件加速淡入淡出动画包装层（`opacity` + 微小 `translateY`）。
  - 确保切换“快速启动”、“待办清单”与“思维导图”时视觉过渡丝滑柔和，彻底告别瞬间闪现。
  - 接入 VS Code 差异检阅 (`vscode-review:review_diff_in_vscode`)。
  - 验证命令: `pnpm --dir "F:/App Location/SelfWork" check`。

- [x] Task 2: 在 `MindMapView.tsx` 中落地两级页面切页动效与空间落位平滑锚定
  - 在一级分区大盘与二级导图画布切换时挂载平滑展开/淡入动效，营造沉浸构思手感。
  - 优化一级分区侧栏宽度比例与大盘网格起步位置，使视觉落脚点与待办模块自然衔接。
  - 接入 VS Code 差异检阅 (`vscode-review:review_diff_in_vscode`)。
  - 验证命令: `pnpm --dir "F:/App Location/SelfWork" check`。

- [x] Task 3: 机械全检、桌面程序编译构建与端到端切页触觉实测
  - 运行 `pnpm --dir "F:/App Location/SelfWork" check` (0 errors, 0 warnings)。
  - 运行 `cargo test --manifest-path "F:/App Location/SelfWork/src-tauri/Cargo.toml"` (5/5 pass)。
  - 运行 `pnpm --dir "F:/App Location/SelfWork" tauri build --no-bundle` 生成最新桌面二进制 `SelfWork.exe`。
  - 验证运行切页丝滑度与位置稳定性，提交 Git 记录并沉淀 CHANGELOG。
