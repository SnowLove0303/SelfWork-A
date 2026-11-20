# Tasks: Docs Local Physical Path Mirroring and URL Architecture

## 1. 任务清单与单焦点执行锁 (Single-Focus Lock)

- [x] **Task 1: Rust 端物理文档镜像目录与 Tauri Commands 落地**
  - **因果归属**: `[Root Source]`
  - **拟变文件**: `src-tauri/src/db.rs`, `src-tauri/src/lib.rs`
  - **执行内容**:
    - 在 `db.rs` 中实现 `get_documents_dir`、`sanitize_filename` 与物理落盘逻辑；
    - 在 `lib.rs` 中注册 `db_sync_doc_markdown_file` 与 `db_get_doc_local_path` 并挂载至 `invoke_handler!`;
    - 在 `db.rs` 中编写单元测试验证物理文件写入与路径计算契约。
  - **实测验证命令**:
    - `cd src-tauri; cargo test test_doc_markdown_file_sync -- --nocapture` (15/15 passed)

- [x] **Task 2: 前端通用路径解析服务 (`src/services/docPathService.ts`) 封装**
  - **因果归属**: `[Service Layer]`
  - **拟变文件**: `src/services/docPathService.ts`
  - **执行内容**:
    - 接入 `exportBlocksToMarkdown`；
    - 实现本地物理路径（面向 MCP+AI）与在线 URL 路径双轨解析与模式切换；
    - 提供原子剪贴板写入与统一返回结构。
  - **实测验证命令**:
    - `pnpm check`（验证 TS 类型严格守恒，零告警零错误 - passed）

- [x] **Task 3: 重构 `DocsView.tsx` 交互集成与 VS Code 原生 Diff 检阅**
  - **因果归属**: `[UI & Interaction]`
  - **拟变文件**: `src/components/DocsView.tsx`
  - **执行内容**:
    - 解耦视觉面包屑与可寻址资源路径；
    - 改造顶部操作栏“复制路径”按钮、面包屑快捷按钮及侧边栏微复制按钮；
    - 升级 Toast 视觉反馈，展示实际复制的 Windows 绝对物理路径或 URL；
    - 通过 `review_diff_in_vscode` 提供差异检阅。
  - **实测验证命令**:
    - `pnpm check` (tsc --noEmit passed, exit code 0)

- [x] **Task 4: 完整编译与应用热替换拉起 (v0.1.76)**
  - **因果归属**: `[Build & Release]`
  - **拟变文件**: `src-tauri/Cargo.toml`, `package.json`, `CHANGELOG.md`
  - **执行内容**:
    - 执行 `pnpm tauri build --no-bundle`；
    - 运行热替换脚本无缝替换 `SelfWork.exe` 进程并拉起运行；
    - 物理实测验证生成的 `.md` 文件在磁盘上的真实存在性与内容完整性。
  - **实测验证命令**:
    - `Test-Path "$env:APPDATA\SelfWork\documents\*.md"` (passed, 物理目录与文件真实落盘)
