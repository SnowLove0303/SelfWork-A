# Tasks: Docs Table Self-Healing and Legacy Cleansing

## 1. 任务清单与单焦点执行锁 (Single-Focus Lock)

- [x] **Task 1: 实现通用数据自愈服务 (`src/services/docHealingService.ts`) 与单元规整逻辑**
  - **因果归属**: `[Service Layer]`
  - **拟变文件**: `src/services/docHealingService.ts`, `src/services/markdownImport.ts`
  - **执行内容**:
    - 实现 `isNotionFlatSummaryBlock` 与 `healTableRows`；
    - 在 `markdownImport.ts` 中增强前置清洗正则，阻断 Notion 扁平汇总行；
    - 编写纯逻辑自愈断言验证函数。
  - **实测验证命令**:
    - `pnpm check` (passed, exit code 0)

- [x] **Task 2: 在 `TableBlock.tsx` 挂载运行时自愈与在 `docsDb.ts` 挂载加载自愈护盾**
  - **因果归属**: `[UI & Data Layer]`
  - **拟变文件**: `src/components/docs/editor/TableBlock.tsx`, `src/services/docsDb.ts`
  - **执行内容**:
    - `TableBlock.tsx` 对传入的 `properties.rows` 运行 `healTableRows` 自愈规整；
    - `docsDb.ts` 在 `loadDocBlocks` 时自动过滤残屑段落并修复破损表格；
    - 通过 `review_diff_in_vscode` 呈报 Diff 检阅。
  - **实测验证命令**:
    - `pnpm check` (passed, exit code 0)

- [x] **Task 3: 执行物理存量数据原子清洗脚本并重新生成本地 Markdown 物理镜像**
  - **因果归属**: `[Database & Physical Mirror]`
  - **拟变文件**: SQLite 数据库表 `doc_blocks`（针对 `row_python_02_3_02_5_set_dict_types`）
  - **执行内容**:
    - 物理删除 Block 250（`| 运算 Python 写法 结果 ... |`）；
    - 物理更新 Block 251（规整为纯净 3 列 × 5 行表格）；
    - 重新调用 `sync_doc_markdown_file` 同步最新物理 `.md` 文件。
  - **实测验证命令**:
    - `python scratch/verify_healed_section.py` (passed, 3-col clean table confirmed)

- [x] **Task 4: 完整编译与应用热替换拉起 (v0.1.77)**
  - **因果归属**: `[Build & Release]`
  - **拟变文件**: `CHANGELOG.md`
  - **执行内容**:
    - 编译 `pnpm tauri build --no-bundle`；
    - 热替换拉起最新 `SelfWork.exe`；
    - 物理验证红框 1 与红框 2 在界面中彻底消失并呈现规整表格。
  - **实测验证命令**:
    - `Get-Process SelfWork` (PID: 27320 running)
