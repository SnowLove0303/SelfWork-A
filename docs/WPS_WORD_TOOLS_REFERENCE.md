# WPS Word 全模块与工具终极逆向总清单（研发参考）

> **逆向靶标**：`WPS Office 12.1.0.28043`（`D:\APP\WPS\WPS Office\12.1.0.28043\office6\`）  
> **多维证据源**：  
> 1. **UI 配置树**：实测解析 `wpsongmani.kui` + `commands/wps/ongmani/CT_*.kuip`（40+ 模块）+ `WordTools.kuip` + `PopupMenu.kuip`（805 条右键/浮动菜单）；  
> 2. **原生二进制符号**：`wpswordtool.dll`（RTTI/命令类提取：`AVK*Command` / `OnClick_*`）；  
> 3. **Web 标准对照**：Microsoft Word Ribbon Fluent `idMso` 规范与 WPS 官方文字/排版/公文/快捷键手册。  
> **适用对象**：SelfWork（SW工作台）文档编辑器（`BlockEditor` / `TableBlock` / `TableDatabaseView`）后续工具设计、功能取舍与排期总纲。

---

## 📊 图例与研发决策标识

- **覆盖状态**：`✅ 已实现` | `🟡 部分实现` | `⬜ 未实现`
- **SelfWork 采纳策略**：
  - `🟢 [纳入 P0]`：高频刚需，直接进入近期迭代；
  - `🔵 [纳入 P1/P2]`：实用增强，按需分阶段接入；
  - `⚪ [裁剪不做]`：重纸张打印/传统办公包袱（违背 SelfWork 轻量块文档定位），明确不引入以防界面臃肿。

---

## 一、全局模块拓扑总览 (Ribbon & Context Tabs)

```text
WPS Word (Writer) 界面功能架构
├── 主功能区选项卡 (Main Tabs)
│   ├── 1. 文件 (CT_File.kuip)
│   ├── 2. 开始 (CT_Home.kuip · 212 commands)
│   ├── 3. 插入 (CT_Insert.kuip · 134 commands)
│   ├── 4. 页面布局 (CT_PageLayout.kuip · 107 commands)
│   ├── 5. 引用 (CT_References.kuip · 44 commands)
│   ├── 6. 审阅 (CT_Review.kuip · 112 commands)
│   ├── 7. 视图 (CT_View.kuip · 49 commands)
│   ├── 8. 邮件 (CT_Mailings.kuip · 33 commands)
│   ├── 9. 安全 (CT_Security.kuip · 38 commands)
│   ├── 10. 工具与特色应用 (CT_Tools / CT_WorkSpace · 166 commands)
│   ├── 11. 开发工具 / 加载项 (CT_DevelopTools / CT_AddOns)
│   └── 12. 公文模式 (CT_OfficialMode · 97 commands)
├── 上下文专属选项卡 (Contextual Tabs - 选中特定对象激活)
│   ├── A. 表格工具 + 表格样式 (CT_TableTools + CT_Design · 119 commands)
│   ├── B. 图片工具 (CT_PictureTools · 219 commands)
│   ├── C. 绘图 / 图形 / 艺术字 (CT_DrawingTools / CT_GraphicTool / CT_WordArt)
│   ├── D. 公式工具 (CT_EquationTools · 43 commands)
│   ├── E. 图表 / SmartArt (CT_ChartTools / CT_SmartArt*)
│   ├── F. 页眉页脚 (CT_HeaderFooter · 68 commands)
│   └── G. 大纲 / 段落布局 (CT_Outline / CT_Paragraph)
└── 右键上下文与浮动微工具栏 (PopupMenu.kuip · 805 definitions)
    ├── 正文与选区右键 / 拼写建议 / 浮动 Mini Toolbar
    ├── 表格右键 (整表 / 行 / 列 / 单元格 / 表格内文字)
    ├── 图片右键 (嵌入型 / 浮动型 / 快捷悬浮条 Picture QuickBar)
    └── 超链接 / 批注 / 脚注尾注右键
```

---

## 二、主功能区全量原子工具清单

### 1. 文件 (`CT_File.kuip`, 75 elements)
| 分组 | 原子工具 | `idMso` / `ksoCmd` | SelfWork 状态 & 策略 |
|---|---|---|---|
| **新建与打开** | 新建空白文档 (`Ctrl+N`)、从默认/其他模板新建、新建公文、打开 (`Ctrl+O`)、云文档打开/保存 | `NewBlankFile` / `OpenFile` | ✅ `🟢 [纳入 P0]` 已支持模板卡片 `DocTemplatePicker` |
| **保存与备份** | 保存 (`Ctrl+S`)、另存为 (`F12`)、自动保存、备份中心、历史版本、文档修复/数据恢复 | `SaveFile` / `AutoSave` / `DocumentFix` | ✅ `🟢 [纳入 P0]` 已有 SQLite 自动保存 + `DocHistoryDrawer` 快照 |
| **导出与转换** | **输出为 PDF**、输出为图片（长图/逐页）、**导出为 PPT**、打印 (`Ctrl+P`)、打印预览、批量打印 | `FileSaveAsPdfOrXps` / `Print2022Dialog` | 🟡 `🟢 [纳入 P0]` 已有 MD 导入导出，需补齐 **PDF / DOCX 单篇精美导出** |
| **分享与设置** | 文件分享、以 PDF 分享、选项设置 | `Options` | ⚪ 分享依赖云账号，单机版暂裁剪 |

---

### 2. 开始 (`CT_Home.kuip`, 212 commands)
| 分组 | 原子工具与子项 | `idMso` / 快捷键 | SelfWork 状态 & 策略 |
|---|---|---|---|
| **剪贴板**<br>(`Clipboard`) | • **粘贴**（保留源格式 / 匹配当前格式 / 仅保留文本 / 选择性粘贴 / 设置默认粘贴 / 历史剪贴板）<br>• 剪切、复制<br>• **格式刷**（单击单次 / 双击连续） | `PasteMenu` (`Ctrl+V`)<br>`PasteKeepSourceFormat`<br>`PasteMatchCurrentFormat`<br>`Cut` (`Ctrl+X`) / `Copy` (`Ctrl+C`)<br>`FormatPainter` | 🟡 `🟢 [纳入 P0]` 需增强 **无格式纯文本粘贴 (`Ctrl+Shift+V`)** 与 **格式刷** |
| **字体**<br>(`Font`) | • 字体族、字号下拉、增大字号 (`Ctrl+]`) / 减小字号 (`Ctrl+[`)<br>• **基础修饰**：加粗 (`Ctrl+B`)、倾斜 (`Ctrl+I`)、下划线 (`Ctrl+U` · 线型/下划线颜色/取色器)、删除线、着重号<br>• **上下标**：上标 (`Superscript`)、下标 (`Subscript`)<br>• **中文字符装饰**：文字效果（艺术字/阴影/映像/发光/三维旋转/转换）、字符边框、字符底纹<br>• **颜色**：文本突出显示色 (Highlight)、字体颜色（调色板/标准色/取色器）<br>• **中文版式与辅助**：拼音指南、**更改大小写**（句首/小写/大写/首字母大写/半角全角）、带圈字符、**清除所有格式** | `Font` / `FontSize` (`Ctrl+D`)<br>`FontSizeIncreaseWord` / `DecreaseWord`<br>`Bold` / `Italic` / `UnderlineGallery`<br>`Strikethrough` / `EmphasisMark`<br>`Superscript` / `Subscript`<br>`TextEffectsGallery` / `CharacterBorder` / `CharacterShading`<br>`TextHighlightColorPicker` / `FontColorPicker`<br>`AsianLayoutPhoneticGuide` / `ChangeCaseGallery`<br>`AsianLayoutCharactersEnclose` / `ClearFormatting` | 🟡 `🟢 [纳入 P0]` 已有加粗/斜体/下划线/删除线/字色/底色/代码；需补齐 **上下标、一键清除格式、更改大小写**；文字三维特效/带圈/拼音 ⚪ 裁剪 |
| **段落**<br>(`Paragraph`) | • **列表**：项目符号（多级符号样式）、编号（数字/罗马/汉字/自动编号控制）、多级列表<br>• **缩进与方向**：减少缩进量、增加缩进量、文字方向（从左到右 / 从右到左）<br>• **对齐**：左对齐 (`Ctrl+L`)、居中 (`Ctrl+E`)、右对齐 (`Ctrl+R`)、两端对齐 (`Ctrl+J`)、分散对齐 (`Ctrl+Shift+J`)<br>• **行距与间距**：`1.0` (`Ctrl+1`) / `1.5` (`Ctrl+5`) / `2.0` (`Ctrl+2`) / `2.5` / `3.0` / 段前段后间距<br>• **框线底纹**：段落边框（下/上/左/右/无/全/外/内框线）、段落底纹颜色<br>• **编辑控制**：制表位 (`Tabs`)、**显示/隐藏编辑标记 (`¶`)** | `Bullets` / `Numbering` / `MultilevelList`<br>`IndentDecreaseWord` / `IndentIncrease`<br>`AlignLeft` / `AlignCenter` / `AlignRight` / `AlignJustify` / `ParagraphDistributed`<br>`LineSpacingGallery`<br>`ShadingColorPicker` / `BordersAndShading`<br>`Tabs` / `EastAsianEditingMarks` | 🟡 `🟢 [纳入 P0]` 已有列表/对齐/缩进；需补齐 **行距快速切换（1.0/1.5/2.0）** 与段落级复制/转换流畅度 |
| **样式**<br>(`Styles`) | 快速样式库（正文/标题1~9/副标题/引用/强调）、新建样式、清除样式、显示更多样式面板、保存为我的样式集 | `QuickStylesGallery` / `ClearFormatting` | ✅ `🟢 [纳入 P0]` 已有 `/` 斜杠命令与块转换菜单 |
| **编辑与查找**<br>(`Find`) | 查找 (`Ctrl+F`)、替换 (`Ctrl+H`)、定位 (`Ctrl+G`)、跨文件批量查找替换、**选择**（全选 `Ctrl+A` / 选择对象 / 选择格式相似文本 / 选择窗格 / 虚线选表） | `FindAndReplaceDialog` / `ReplaceDialog` / `GoTo`<br>`SelectMenu` / `SelectAll` / `SelectionPane` | ✅ `🟢 [纳入 P0]` 已有 `FindReplaceBar` 与全库检索弹窗 |
| **排版与文字工具**<br>(`Typography / WordTools`) | 见下文**专章四：《文字工具与一键排版批处理逆向》**（删除空行/多余空格/软回车、段首缩进2字符、重排段落、智能排版、对象对齐分布） | `WordTools` / `AITypeset` / `TextWrappingMenu` / `AlignJustifyMenu` | ⬜ `🟢 [纳入 P0]` 文字工具清洗批处理极度契合粘贴整理场景 |

---

### 3. 插入 (`CT_Insert.kuip`, 134 commands)
| 分组 | 原子工具与子项 | `idMso` / 快捷键 | SelfWork 状态 & 策略 |
|---|---|---|---|
| **页面 (`Pages`)** | 空白页（竖向/横向）、封面页库、**分隔符**（分页符 `Ctrl+Enter` / 分栏符 / 换行符 / 下一页分节符 / 连续分节符 / 偶数页·奇数页分节符） | `BlankPageInsertGallery` / `CoverPageInsertGallery`<br>`PageBreakInsertWord` / `ColumnBreakInsertWord` / `NextPageSectionBreakInsertWord` | 🟡 块编辑器流式排版用分割线替代物理分节，⚪ 物理分页符裁剪 |
| **表格 (`Table`)** | 行列网格快速插入、自定义插入、绘制表格 (`Draw Table`)、**文本转换成表格** (`ConvertTextToTable`)、表格转换成文本、AI 文本转表格 | `TableInsertGallery` / `TableDrawTable`<br>`ConvertTextToTable` / `ConvertTableToText` | 🟡 `🟢 [纳入 P0]` 已支持插入表格；补齐 **文本↔表格互转** |
| **插图与可视化**<br>(`Common Object`) | • **图片**：本地文件、AI 生图、在线图库、扫描仪、截屏 (`Screen Grab`) + **屏幕识图 OCR**<br>• **图形与文本框**：形状库（线条/矩形/箭头/流程图/标注）、绘制画布、图标库、横排/竖排文本框、艺术字 (`WordArt`)<br>• **专业图表**：图表 (`Chart`)、动态图表、SmartArt 智能图形、**ProcessOn 流程图**、**ProcessOn 思维导图** | `PictureInsertFromFile` / `InsertScreenGrab`<br>`ShapesInsertGallery` / `TextBoxDrawMenu`<br>`WordArtInsertGallery` / `ChartInsert`<br>`SmartArtInsert` | ✅ `🔵 [纳入 P1]` 已具备本地/外链图片、`Mermaid` 图表与 **内置思维导图嵌入 (`MindMapEmbedBlock`)** |
| **链接 (`Links`)** | **超链接** (`Ctrl+K`)、书签 (`Ctrl+Shift+F5`)、交叉引用 | `HyperlinkInsert` / `BookmarkInsert` | ✅ 已有外链 + `#/page/` 双链；🔵 补齐锚点定位 |
| **页眉页脚** | 页眉、页脚、页码（插入页码 / 删除页码） | `HeaderFooterGallery` / `HeaderFooterPageNumberInsertGallery` | ⚪ 流式块文档不依赖打印页眉页脚，裁剪 |
| **文档部件与窗体**<br>(`Component / Forms`) | • **快速部件**：日期和时间、自动图文集（第 X 页共 Y 页）、域 (`Fields`)、文档域、**代码块 (`Code Block`)**<br>• **窗体域**：文字型窗体域、**复选框窗体域**、下拉型窗体域、窗体保护<br>• **首字下沉**、对象 (OLE)、插入文件中的文字 (`TextFromFileInsert`) | `QuickPartsInsertGallery` / `DateAndTimeInsert`<br>`FieldInsert` / `FieldText` / `FieldCheckBox`<br>`DropCapOptionsDialog` / `TextFromFileInsert` | ✅ 已有代码块、Todo 复选框、折叠块、同步块、多栏块；🔵 可加日期快捷插入 |
| **符号与公式**<br>(`Symbol`) | 特殊符号、**公式 (`Alt+=`)**（插入公式 / **插入 LaTeX** / 公式识别 `Ctrl+Alt+=` / 手写公式 / 常用数学·物理·化学公式模板）、MathType | `EquationInsert` (`Alt+=`) / `EquationInsertNew` | ✅ `🔵 [纳入 P1]` 已有 `MathBlock` (KaTeX)，可加 **常用公式模板与符号快选栏** |
| **媒体 (`Media`)** | 声音、影片嵌入 | — | ✅ 已有 `MediaEmbedBlock` 音视频卡片 |

---

### 4. 页面布局 (`CT_PageLayout.kuip`, 107 commands)
| 分组 | 原子工具与子项 | `idMso` / 快捷键 | SelfWork 状态 & 策略 |
|---|---|---|---|
| **结构 (`Structure`)** | 空白页、目录、分隔符（分页/分栏/分节）、节导航窗格、删除节 | `BreaksMenu` / `SectionDelete` | ⚪ 传统纸张节管理裁剪 |
| **页面效果 (`Effects`)** | 文档主题（配色/字体/效果集）、封面页、页面边框、**页面颜色**（纯色/取色/图片/渐变/纹理/图案）、**水印**（插入/删除）、稿纸设置 (`Genko`)、行号（无/连续/每页重编/每节重编） | `ThemesGallery` / `PageBorderAndShadingDialog`<br>`PageColorGallery` / `WatermarkGallery`<br>`GenkoSettingDialog` / `LineNumbersMenu` | 🟡 `🔵 [纳入 P2]` 可借鉴 **页面宽度（标准/宽屏）** 与封面样式 |
| **页面设置 (`Page Setup`)** | 页边距（上下左右数值/自定义）、纸张方向（纵/横）、纸张大小、分栏（一/二/三/更多栏）、文字方向（横排/竖排） | `PageMarginsGallery` / `PageOrientationGallery`<br>`PageSizeGallery` / `TableColumnsGallery` | ⚪ 纸张打印属性在导出 PDF 时配置即可，不堆砌在编辑器顶栏 |

---

### 5. 引用 (`CT_References.kuip`, 44 commands)
| 分组 | 原子工具与子项 | `idMso` / 快捷键 | SelfWork 状态 & 策略 |
|---|---|---|---|
| **目录 (`Table of Contents`)** | 插入目录、移除目录、AI 提取目录、**目录级别设置**（1~9 级 / 正文文本） | `TableOfContentsDialog` / `TOCLevelGallery` | ✅ 已有 `TableOfContentsBlock` 目录块 + 右侧实时大纲 |
| **脚注与尾注** | 插入脚注、上/下一条脚注、插入尾注、上/下一条尾注、分隔线 | `FootnoteInsert` / `EndnoteInsertWord` | 🔵 可作为 P2 学术长文能力考虑 |
| **题注、引文与索引** | 插入题注（图/表自动编号）、插入图表目录、**交叉引用**、标记索引、插入/更新索引 | `CaptionInsert` / `TableOfFiguresInsert`<br>`CrossReferenceInsert` / `IndexInsert` | ⚪ 学术重排版暂缓 |

---

### 6. 审阅 (`CT_Review.kuip`, 112 commands)
| 分组 | 原子工具与子项 | `idMso` / 快捷键 | SelfWork 状态 & 策略 |
|---|---|---|---|
| **校对与语言**<br>(`Proofing / Language`) | • 拼写检查、**字数统计** (`WordCount`)、AI 校对（通用/公文/英文校对）、AI 润色<br>• **文档比较 (`Compare`)**（显示原文档/修订文档/双栏同步对比）<br>• **语言转换**：划词翻译 (`F6`)、全文同步翻译、**简体中文 ↔ 繁体中文转换**<br>• **语音朗读**：语音朗读 (`TextSpeech`)、输出语音文件 | `WordCount` / `ReviewCompareTwoVersions`<br>`TranslateToTraditionalChinese` / `TranslateToSimplifiedChinese` | 🟡 `🔵 [纳入 P1/P2]` 已有字数统计 `DocStatsBadge`；**历史版本 Diff 对比** 与 **简繁互转** 极具实用性 |
| **批注 (`Comments`)** | 新建批注、手写批注、删除单条/全部批注、上一条/下一条批注 | `ReviewNewComment` / `ReviewDeleteComment` | ✅ 已有划选行内批注抽屉 `DocCommentDrawer` |
| **修订与更改**<br>(`Track Changes`) | • **修订模式 (`Ctrl+Shift+E`)**、修订选项、更改用户名<br>• 显示方式（批注框内显示 / 嵌入显示 / 按审阅人筛选 / 审阅窗格）<br>• **更改处置**：接受更改 / 接受格式更改 / 接受所有、拒绝更改 / 拒绝所有、上一处 / 下一处 | `ReviewTrackChangesMenu` (`Ctrl+Shift+E`)<br>`ReviewDisplayForReview` / `ReviewAcceptChangeMenu` / `ReviewRejectChangeMenu` | ⚪ 单人 Local-First 场景重修订链较复杂，暂用版本历史替代 |
| **文档保护 (`Security`)** | 限制编辑（格式/内容/仅批注）、限制可编辑区域、权限校验、定稿 | `ReviewRestrictFormatting` / `ReviewDocumentsFinalized` | 🔵 可加轻量“文档只读锁定开关”防误改 |

---

### 7. 视图 (`CT_View.kuip`, 49 commands)
| 分组 | 原子工具与子项 | `idMso` / 快捷键 | SelfWork 状态 & 策略 |
|---|---|---|---|
| **文档视图 (`Views`)** | **全屏** (`Ctrl+Alt+F`)、**阅读视图** (`Ctrl+Alt+R`)、页面视图 (`Ctrl+Alt+G`)、大纲视图、Web 版式、公文版式、**护眼模式** | `ViewFullScreenView` / `ViewFullScreenReadingView`<br>`ViewPrintLayoutView` / `ViewOutlineView` / `ProtectEyes` | 🟡 `🔵 [纳入 P1]` 增加 **沉浸专注模式 / 只读锁定视图** |
| **显示与窗口**<br>(`Show / Window / Zoom`) | • **导航窗格**（放左/放右/隐藏）、文档语义树、导图大纲模式<br>• 标尺、网格线、表格虚框、标记、任务窗格<br>• 缩放比例 (`100%` / 页宽 / 单页 / 双页)<br>• **多窗口**：新建窗口、全部重排（水平/垂直/层叠）、**并排比较 + 同步滚动**、切换窗口 | `NavigationPaneShowHide` / `ViewRulerWord`<br>`ZoomDialog` / `ZoomCurrent100` / `ZoomPageWidth`<br>`WindowsArrangeAll` / `WindowSideBySide` / `WindowSideBySideSynchronousScrolling` | ✅ 已有右侧大纲栏与 `DocLocalGraph` 图谱 |

---

### 8. 其他特色专业选项卡 (`Mailings / Security / Tools / WorkSpace / Develop / OfficialMode`)
| 模块 | 核心原子能力 | 备注 |
|---|---|---|
| **邮件合并 (`CT_Mailings`)** | 打开/关闭数据源 (Excel/CSV)、选择收件人、插入合并域、匹配域、预览结果（首/前/下一条/跳转）、合并至新文档/打印机/邮件/微信群发 | 批量套打通知/证书核心工具（SelfWork 合规/文档引擎若做批量模板生成可借鉴） |
| **安全 (`CT_Security`)** | 账号加密、普通/核心加密、保密关键词识别、文档防外发管控、脱敏与批量解密、密保管理 | 企业内控安全特性 |
| **特色应用 (`CT_WorkSpace`)** | **PDF 互转拆分合并**（PDF↔Word/Excel/PPT、图片转PDF）、OCR 文字提取、**文档瘦身**、文档比较、批量删除/打印/转换、电子签名、论文查重/AIGC检测 | 办公全能工具集 |
| **开发工具 (`CT_DevelopTools`)** | 加载项管理、COM 加载项、WPS JS 加载项 (`JsAddInsDialog`)、宏与 VBA | 开发者生态扩展入口 |
| **公文模式 (`CT_OfficialMode`)** | 红头模板、公文要素（版记/发文机关/签发人/发文字号）、**公文一键排版**（行距/2字缩进/悬挂对齐/版记至偶数页）、公文专有词校对与敏感词校验 | 党政国企标书/公文垂直场景 |

---

## 三、上下文专属工具栏清单 (Contextual Tabs)

### A. 表格工具与表格样式 (`CT_TableTools.kuip` + `CT_Design.kuip`, 119 commands)
> **SelfWork `TableBlock` 重点对标参考**

| 分组 | 原子工具与子项 | `idMso` / Alt 热键 | SelfWork 状态 & 策略 |
|---|---|---|---|
| **属性与视图** | 表格属性（行高/列宽/文字环绕）、显示虚框 (`ShowGridlines`) | `TableShowGridlines` (`TG`) | 🟡 补齐整表边框虚框切换与单元格内边距调节 |
| **行和列**<br>(`Rows and Columns`) | 绘制表格、擦除框线、**插入**（在上方/下方插入 N 行、在左侧/右侧插入 N 列、插入单元格）、**删除**（删除单元格/列/行/整表） | `TableDrawTable` / `TableEraser`<br>`CellsDelete` / `TableColumnsDelete` / `TableRowsDelete` / `TableDelete` | ✅ 已全部覆盖插入与删除（支持多行/多列及悬停 `+` 插入器） |
| **合并与拆分**<br>(`Merge And Split`) | **合并单元格 (`Merge Cells`)**、**拆分单元格 (`Split Cells`)**、**拆分表格**（按行拆分 / 按列拆分） | `SplitCells` / `SplitTableByRow` / `SplitTableByColumn` | ⬜ `🟢 [纳入 P0]` 已有 `selectedRange` 二维选区，直接支持合并/拆分！ |
| **单元格大小**<br>(`Cell Size`) | 精确设置行高/列宽、AI 表格美化、自动调整（适应窗口 / 适应内容 / 适应版心宽度）、**行列转置 (`Switch Row/Column`)**、平均分布各行、平均分布各列 | `TableAutoFitWindow` / `TableAutoFitContents`<br>`TableRowsDistribute` / `TableColumnsDistribute` | 🟡 `🟢 [纳入 P0]` 已支持平均分布各行/列；补齐 **行列转置** 与 **自动适应内容** |
| **数据 (`Data`)** | 公式 (`Formula`)、**快速计算（求和 Sum / 平均值 Average / 最大值 Max / 最小值 Min）**、**排序（升序/降序）**、在各页顶端以标题行重复出现 (`RepeatHeaderRows`)、**表格转换成文本** | `RepeatHeaderRows` / `ConvertTableToText` | ⬜ `🟢 [纳入 P0]` 补齐 **列排序 + 快速求和/均值统计汇总** |
| **选择与对齐**<br>(`Select / Alignment`) | 选择（单元格/列/行/整表/虚线选表）、**3×3 九宫格对齐**（顶左/顶中/顶右、中左/正中/中右、底左/底中/底右）、文字方向（横排/竖排） | — | ✅ **3×3 九宫格对齐**与列/行抓手全选已完美实现 |
| **表格样式与边框**<br>(`CT_Design`) | 样式选项（标题行/汇总行/镶边行/第一列/最后一列/镶边列）、表格样式库、**底纹色板**、**边框线型/粗细/颜色**、快速边框（下/上/左/右/无/全/外/内/内横/内竖框线）、绘制斜线表头、**清除表格样式** | `BordersAll` / `BorderOutside` / `BorderBottomNoToggle` | 🟡 已实现标题行、斑马纹、8色莫兰迪底纹；可增强单边边框与一键清除表格样式 |

---

### B. 图片 / 图形 / 公式 / 页眉页脚 / 大纲上下文
1. **图片工具 (`CT_PictureTools.kuip`, 219 commands)**：
   - **调整**：插入/替换图片、裁剪（自由裁剪 / 按形状裁剪 / 按比例裁剪）、设置透明色、色彩/滤镜、压缩图片、AI 抠图/擦除/清晰化、重置图片；
   - **样式与大小**：图片边框/效果/透明度、精确尺寸 + 锁定纵横比；
   - **排列**：文字环绕（嵌入型/四周型/紧密型/浮于文字上方/衬于文字下方/上下型/穿越型）、对齐、旋转（自由/左转90°/右转90°/水平翻转/垂直翻转）、组合/取消组合、上移/下移一层、选择窗格。
2. **公式工具 (`CT_EquationTools.kuip`, 43 commands)**：
   - **插入与转换**：常用公式 (`Alt+=`)、手写公式、公式识别 (`Ctrl+Alt+=`)、**LaTeX ↔ OMML 互转**、公式字体/编号设置；
   - **符号面板**：基础数学、希腊字母、字母类符号、求反关系运算符、运算符、手写体、箭头、几何符号；
   - **结构面板**：分式、上下标、根式、积分、大型运算符、括号、函数、导数符号、极限和对数、运算符、矩阵。
3. **页眉页脚 (`CT_HeaderFooter.kuip`, 68 commands)**：页眉/页脚/页码库、横线开关、插入日期时间/图片/域、奇偶页不同、首页不同、链接到前一条页眉、页眉/页脚顶端距底端距。
4. **大纲 (`CT_Outline.kuip`, 21 commands)**：显示级别（1~9 级）、升级为标题、降级为正文、上移/下移段落、展开/折叠、更新目录。

---

## 四、文字工具与一键排版批处理逆向 (`WordTools.kuip` + `wpswordtool.dll`)

> 实测自 `wpswordtool.dll`（`AVK*Command` / `OnClick_*`）与 `WordTools.kuip`，堪称中文排版最实用的工具包，**极度适合借鉴进 SelfWork 作为“一键排版清理”菜单**：

| 工具类别 | 具体命令与原生实现符号 | 核心功能与正则清洗逻辑 |
|---|---|---|
| **清理删除类**<br>(`WordToolDeleteCategory`) | • 删除空段 (`DeleteBlankParagraph`)<br>• 删除段前空格 (`DeletePrefixSpaces`)<br>• 删除空格 (`DeleteSpaces`)<br>• 删除换行符/软回车 (`DeleteSoftReturn`)<br>• 删除空白页 | 一键清除从网页/PDF复制文本带来的大量空行、行首全角/半角缩进空格、句间多余空格、硬/软换行混杂 |
| **段落重构类** | • **智能重排段落** (`SmartRearrange`)<br>• **重排段落** (`RearrangeParagraphs`)<br>• 换行符转为回车 (`CovertSoftReturnToReturn`)<br>• 改为间隔空行分段 (`ToBlankParagraphSplitMode`) | 自动修复 PDF 复制造成的“每行断成一段”碎行问题，智能合并语义段落 |
| **缩进与间距调整类** | • **段落首行缩进 2 字符** (`ParagraphIndent2Spaces`)<br>• 段落缩进转为空格 (`InsertParagraphIndent`)<br>• 增加空段 (`InsertBlankParagraphs`)<br>• 段落垂直间距微调 (`ParagraphVerticalAdjust`)<br>• 文字悬挂对齐 (`TextHangAlignment`) | 一键统一整篇或选中段落的中文首行 2 字符缩进、段间空行规范化 |

---

## 五、右键上下文菜单与浮动栏全树 (`PopupMenu.kuip`)

| 触发场景 | 右键菜单结构 | 顶部浮动栏 (Mini Toolbar) |
|---|---|---|
| **正文 / 选区** | 剪切 / 复制 / 粘贴（保留源格式/匹配格式/无格式文本/历史粘贴）· 字体 · 段落 · 项目符号和编号 · 格式刷 · 超链接 · 新建批注 · 同义词 · 划词翻译 · 拼写建议（忽略/加入词典/AI校对） | 字体、字号、增大/减小字号、编号、加粗、倾斜、下划线、高亮、字体颜色、对齐、行距、格式刷、AI 改写/翻译 |
| **表格**（整表/行/列/单元格） | 剪切 / 复制 / 粘贴（支持**粘贴为嵌套表**）· 插入（左列/右列/上行/下行/插入多行/单元格）· 删除（单元格/行/列/整表）· **合并单元格 / 拆分单元格 / 拆分表格（按行/按列）** · 选择（整表）· **自动调整（适应窗口/适应内容/行列转置/平均分布各行·各列）** · 单元格对齐（9 宫格）· 文字方向 · 边框和底纹 · 表格属性 · 题注 | 字体、字号、增减字号、加粗/倾斜/下划线、高亮/字色、**单元格底纹**、**快速边框**、对齐方式、行距、格式刷 |
| **图片** | 剪切 / 复制 / 粘贴 · 更改图片（本地/AI生图/在线）· **另存为图片 / 提取文档全部图片** · 裁剪 · 旋转（左右90°/水平垂直翻转）· 环绕方式 · 组合/置于顶层底层 · 题注 · 超链接 · 设置对象格式 | 图片快捷条 (`Picture QuickBar`)：环绕方式、裁剪、大图预览、旋转、图上识字 OCR、图转 PDF、擦除去水印 |
| **超链接 / 批注** | 编辑/打开/复制/取消超链接 · 回复/完成/取消完成/删除批注 | — |

---

## 六、高频快捷键全景对照表

| 场景 | WPS Word 原生快捷键 | 动作描述 | SelfWork 适配状态 |
|---|---|---|---|
| **基础编辑** | `Ctrl+C` / `Ctrl+X` / `Ctrl+V` | 复制 / 剪切 / 粘贴 | ✅ 浏览器原生支持 |
| **无格式粘贴** | `Ctrl+Shift+V` | 仅粘贴无格式纯文本 | 🟡 建议全块编辑器显式接管保障 |
| **查找替换定位** | `Ctrl+F` / `Ctrl+H` / `Ctrl+G` | 查找 / 替换 / 定位 | ✅ 已有 `FindReplaceBar` (`Ctrl+F`/`H`) |
| **字体修饰** | `Ctrl+B` / `Ctrl+I` / `Ctrl+U` | 加粗 / 斜体 / 下划线 | ✅ 已有；可补 `Ctrl+]`/`[` 调字号 |
| **字号微调** | `Ctrl+]` / `Ctrl+[`（或 `Ctrl+Shift+>`/`<`） | 增大 / 减小字号 | ⬜ 建议加入 |
| **段落对齐** | `Ctrl+L` / `Ctrl+E` / `Ctrl+R` / `Ctrl+J` | 左 / 居中 / 右 / 两端对齐 | 🟡 建议全块接管支持 |
| **行距调节** | `Ctrl+1` / `Ctrl+5` / `Ctrl+2` | 1.0 / 1.5 / 2.0 倍行距 | ⬜ 建议加入 |
| **插入对象** | `Ctrl+K` / `Alt+=` / `Ctrl+Alt+=` | 超链接 / 插入公式 / 公式识别 | 🟡 `Ctrl+K` 超链接、`Alt+=` 插入公式块 |
| **审阅视图** | `Ctrl+Shift+E` / `Ctrl+Alt+F` / `Ctrl+Alt+R` | 修订 / 全屏 / 阅读视图 | 🟡 可接入专注阅读快捷键 |

---

## 七、SelfWork 文档引擎后续开发落地总蓝图

结合 **SelfWork（Local-First + 极简少字 + 块级编辑器 + Word 级表格）** 核心定位，建议按以下清单取舍演进：

### 1. 🟢 P0 级高优先迭代（最直观提升生产力）
1. **表格引擎终极闭环 (`TableBlock.tsx`)**：
   - **合并与拆分单元格**（基于已有 `selectedRange` 二维选区扩展 `rowSpan` / `colSpan`）；
   - **列排序与快速统计**（单列升序/降序排列；底栏或列右键支持数值列 `求和 / 均值 / 计数`）；
   - **表格 ↔ 文本/Markdown 互转**（粘贴多行制表符/Markdown文本自动生成表格、表格一键复制为 Markdown/CSV）。
2. **选区微工具栏与段落加强 (`FloatingFormatToolbar.tsx` / `BlockItem.tsx`)**：
   - 补充 **上标 / 下标**、**一键清除格式 (`ClearFormatting`)**；
   - 补充 **段落行距调节**（紧凑 1.25 / 标准 1.5 / 宽松 2.0）与 **大小写/全半角转换**；
   - 保障全局 **`Ctrl+Shift+V` 无格式纯文本粘贴**。

### 2. 🔵 P1 级效率与排版增强
1. **“一键排版清理”微工具集（源自 `wpswordtool.dll`）**：
   - 一键删除多余空行（`DeleteBlankParagraph`）；
   - 一键清理段首/句间多余空格（`DeletePrefixSpaces` + `DeleteSpaces`）；
   - 一键合并断行（软回车/硬碎行智能重排 `SmartRearrange`）。
2. **格式刷 (`FormatPainter`) & 公式模板快选**：
   - 单次/双击格式刷复制选中块或文字样式；
   - `MathBlock` 内嵌常用分式、根号、上下标、希腊字母快速点击面板。
3. **跨格式导入导出 (`DocBatchManager.tsx`)**：
   - 单篇/批量文档一键导出为排版规范的 **PDF** 与 **Word (`.docx`)**。

### 3. 🔵 P2 级长文与协作辅助
1. **版本对比与阅读体验**：`DocHistoryDrawer` 支持当前版本与历史快照的 Diff 高亮；文档顶栏增加“沉浸阅读/专注模式”与“只读锁定开关”。
2. **简繁中文互转**：选中文本或整篇文档一键 `简体 ↔ 繁体` 转换。

### 4. ⚪ 明确裁剪不做（防止工作台臃肿）
- 传统物理纸张打印相关（稿纸网格、奇偶页分节、多级纸张装订线/页边距、印刷水印）；
- 繁重的企业级多人权限加密体系、WordArt 3D 艺术字特效、邮件合并微信群发、OLE 控件嵌入等。
