# Raw Requirements Repository (第一门禁原始需求归档库)

> **法定地位**：本目录为 Ps-openspec 轨道工程体系中专门保存 **Step 0 门禁 1 (Spec-Kit Ingestion)** 原始需求的唯一法定归档目录。
> 任何业务需求、UI调整或功能迭代，在动工前必须在此目录生成不可篡改的 `.md` 归档文件，经用户在门禁 1 确认通过后，作为后续 OpenSpec 变更（门禁 2）与 SubAgent 开发派发的法定事实源头。

---

## 📋 文件命名规范与生命周期

1. **文件命名格式**：`REQ-<YYYYMMDD>-<requirement-slug>.md`（例如：`REQ-20261106-high-transparency-glass.md`）。
2. **法定四大内容要素**：
   - **事实指纹 (Fact Fingerprint)**：100% 逐字留存用户原始 prompt，严禁截断与过度修饰；
   - **1:1 需求物理对账矩阵 (RTM)**：逐条拆解独立条目（REQ-xxx-01, REQ-xxx-02...）；
   - **Spec-Kit 三要素展开**：每个条目对应场景故事、RFC 2119 行为契约、独立验收指标；
   - **下游绑定与执行链路**：显式关联对应的 OpenSpec 变更目录（`openspec/changes/<change-slug>/`）及派发的 SubAgent 标识。

---

## 🔄 产品经理 (PM) 与 SubAgent 协同协作流水线

```text
[ 用户输入需求 ]
       │
       ▼
[ PM: Step 0 原始需求立案 ] ──> 写入 openspec/raw-requirements/REQ-xxx.md
       │
       ▼
[ 🚨 门禁 1: 需求全量确认 ] ──> 呈报《需求全量对账备忘录》，等待用户确认回复
       │ (用户确认)
       ▼
[ PM: Step 1/2 规格立法 ] ───> 编写 openspec/changes/<slug>/ (proposal/specs/design/tasks)
       │
       ▼
[ 🚨 门禁 2: 规格双清单授权 ] ─> 呈报拟变清单与承诺保持现状清单，等待用户动工授权
       │ (用户批准)
       ▼
[ PM: 任务打包与编组派发 ] ───> 封装任务胶囊，调用 invoke_subagent 派发开发任务
       │
       ▼
[ SubAgent: 单步施工执行 ] ───> 单焦点锁 [-]，代码修改触发 review_diff_in_vscode，跑通机检
       │
       ▼
[ PM: 终审对账与归档核销 ] ───> 接收 SubAgent 成果，执行 1:1 双向物理核销，呈报用户终审
```
