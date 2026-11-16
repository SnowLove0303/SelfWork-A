# Specs: 快速启动卡片文字去噪、新建项按钮统一与组合排版极简

## ADDED Requirements

### Requirement: REQ-UNIFY-NEW-BTN-01 顶栏新建项按钮风格均一化
系统顶栏右侧的 `+ 新建项` 按钮 SHALL 采用与 `多选启动`、`全启动`、`分屏组合` 相同的 Secondary Ghost 暗晶体设计规范。该按钮 SHALL 保持 `h-8 rounded-xl`，背景采用 `bg-white/[0.04] hover:bg-white/[0.08]`，边框采用 `border-white/10 hover:border-cyan-500/30`，文字采用 `text-slate-300 hover:text-white`，且 SHALL NOT 采用高亮纯色实心背景。

#### Scenario: 顶栏按钮均一呈现
- GIVEN 用户打开快速启动大盘顶栏
- WHEN 用户审视顶栏右侧全部操作按钮
- THEN `+ 新建项` 按钮与相邻按钮在外观材质和高度上完全一致，无单独刺眼高亮。

### Requirement: REQ-REFINE-COMBO-META-02 组合卡片元数据排版去冗余
置顶分屏专区的组合卡片标题区域 SHALL 移除散落裸露的纯文本应用数量计数（如 `6 个应用`）。卡片标题下方 SHALL 仅保留一个统一规范的胶囊徽标展示其分屏布局或唤起模式。套件内成员项数统计 SHALL 仅在底栏启动按钮及中栏预览区呈现。

#### Scenario: 组合卡片顶栏信息呈现
- GIVEN 存在一个包含 6 个应用的组合卡片
- WHEN 用户查看该卡片头部
- THEN 标题下方仅展示模式胶囊（如 `常规顺序唤起` 或 `屏幕 1 · 四分屏`），不出现脱节的 `6 个应用` 裸露文本。

### Requirement: REQ-PURGE-TYPE-BADGES-03 单品卡片类型文字标签清除
系统在大盘网格中渲染单品卡片（应用、网页、脚本、文件夹）时，SHALL NOT 在卡片左上角渲染 `[应用]`、`[网址]`、`[脚本]`、`[文件夹]` 等类型文字徽标。卡片 SHALL 仅保留高清原生图标、居中名称及底部悬浮操作，多选模式下在左侧显示勾选框。

#### Scenario: 单品卡片极简展示
- GIVEN 大盘中的各种快速启动项
- WHEN 用户以常规模式浏览大盘
- THEN 每张卡片左上角均无文字徽标标签遮挡，整体卡片清爽无杂音。
