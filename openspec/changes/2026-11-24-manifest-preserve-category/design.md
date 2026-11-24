# Design: 运行清单分类展示方案

在 `ProcessManifestModal.tsx` 中：
1. 对 `runningItems` 按 `categories` 定义顺序 + 名称排序，使同分类项自然聚合；
2. 在每个单项与组合名称旁恢复极简低扰动的分类标签（`text-[10px] px-1.5 py-0.5 rounded-md bg-white/[0.05] text-slate-400 border border-white/[0.08] shrink-0`），不添加其他多余文本。
