# Tasks: 快速启动专属组合管理与全量一键启动体系

- [x] 1. 组合专用创建与编辑模态框解耦开发 <!-- id: 1 -->
  - 在 `src/components/LauncherDashboard.tsx` 建立专用的 `isComboModalOpen` 状态机与独立组合弹窗
  - 支持组合名称录入、所属分类选择与子启动项穿梭复选清单（带原生高清图标、项数徽标、全选与清空）
  - 严格注入防嵌套递归过滤（自动剔除 bundle 类型项与正在编辑的自身项）
  - 验证命令：`pnpm --dir "F:/App Location/SelfWork" check`

- [x] 2. 顶栏独立“新建组合”与多选模式“保存为组合”双通道入口集成 <!-- id: 2 -->
  - 在顶部工具栏（`h-[49px]`）右侧显著位置常驻挂载 `[+ 组合]` 独立动作按键
  - 在多选启动模式下，当 `selectedItemIds.length > 0` 时，动态提供 `[保存为组合]` 按键，支持将当前勾选项一键预填为新组合成员
  - 验证命令：`pnpm --dir "F:/App Location/SelfWork" check`

- [x] 3. 组合卡片专属视觉重塑与“启动组合”全量调度联动 <!-- id: 3 -->
  - 在卡片网格大盘中对 `item.type === 'bundle'` 的组合项定制专属视觉渲染：呈现层叠晶体徽标、项数标签与前 4 个子项的原生微缩图标堆叠预览
  - 卡片底栏悬浮提供显眼的 `[▶ 启动组合]` 唤起交互
  - 优化 `handleLaunchItem` 批量调度管线：按 150ms 安全微间隔顺序拉起所有有效成员并提供精准实时反馈
  - 验证命令：`pnpm --dir "F:/App Location/SelfWork" check`

- [x] 4. VS Code 原生差异审核、全栈回归机检与单文件 EXE 生产构建 <!-- id: 4 -->
  - 调用 `vscode-review:review_diff_in_vscode` 提交所有代码变动供用户在原生 Diff 视图中把控
  - 运行 `pnpm check` 与 `cargo test` 确认零错误零警告
  - 运行 `pnpm tauri build --no-bundle` 编译生成最新 100% 离线脱机 `SelfWork.exe` 桌面端
  - 验证命令：`pnpm --dir "F:/App Location/SelfWork" check && cargo test --manifest-path "F:/App Location/SelfWork/src-tauri/Cargo.toml"`
