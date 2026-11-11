# Tasks: 全局字体字号分类规范落地与跨模块布局基准线条严密对齐

- [x] Task 1: 落实思维导图一级页面 `MindMapPartitionView.tsx` 顶栏高度统一、横竖线条连续对齐与 5 级字阶收敛
  - 左侧顶栏与右侧顶栏均严格设定为 `h-[49px]`，保证 `border-b` 水平线 Y 轴零落差贯穿整屏，十字交叉处严丝合缝。
  - 模块标题收敛为 L1 标准 `text-xs font-semibold text-fg-primary tracking-tight`，微章收敛为 L2 标准 `text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-white/[0.06] text-fg-muted`。
  - 右侧顶栏与大盘网格内边距收敛至与 Tasks 一致的节奏（`px-5` / `p-5`），消除从待办清单切换至思维导图时的视觉突兀感。
  - 接入 VS Code 差异检阅 (`vscode-review:review_diff_in_vscode`)。
  - 验证命令: `pnpm --dir "F:/App Location/SelfWork" check`。

- [x] Task 2: 规范二级画布 `MindMapView.tsx` 悬浮药丸文字分类与全局承重墙保全
  - 左上角悬浮面包屑药丸与左下角快捷键状态条文字层级严格映射至 L1/L5 字阶标准。
  - 保全主侧边栏 `Sidebar.tsx` 与顶栏 `Titlebar.tsx` 零行改动。
  - 接入 VS Code 差异检阅 (`vscode-review:review_diff_in_vscode`)。
  - 验证命令: `pnpm --dir "F:/App Location/SelfWork" check`。

- [x] Task 3: 机械全检、编译构建与跨模块切换触觉验证
  - 运行 `pnpm --dir "F:/App Location/SelfWork" check` (0 errors, 0 warnings)。
  - 运行 `cargo test --manifest-path "F:/App Location/SelfWork/src-tauri/Cargo.toml"` (5/5 pass)。
  - 运行 `pnpm --dir "F:/App Location/SelfWork" tauri build --no-bundle` 生成最新桌面二进制 `SelfWork.exe`。
  - 验证运行视觉线条连贯性与字体规范性，提交 Git 记录并沉淀 CHANGELOG。
