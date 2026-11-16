# Specification: features

## ADDED Requirements

### Requirement: 快速启动项文件夹模式与表单交互契约 (REQ-LAUNCHER-FOLDER-01 & REQ-LAUNCHER-FOLDER-02)
The system SHALL support `folder` as an explicit launcher item type in the creation/editing modal, and SHALL provide both manual input and native directory browsing capabilities without truncating directory names containing dots.

#### Scenario: 用户在新建启动项中配置文件夹目标
- **WHEN**: 用户在新建启动项模态框中选中“文件夹 (folder)”类型
- **THEN**: 系统将表单输入项自适应为“文件夹路径 *”，并提供“点击右侧按钮选择文件夹，或输入绝对路径...”占位提示
- **WHEN**: 用户点击“浏览选择”按钮
- **THEN**: 系统唤起 Windows 原生 `FolderBrowserDialog`，仅允许选择目录，并将所选完整物理路径回填至表单；若名称为空，则自动填入不带误截断的目录名

### Requirement: Windows 原生文件资源管理器直达唤起契约 (REQ-LAUNCHER-FOLDER-03 & REQ-LAUNCHER-FOLDER-06)
The system SHALL launch the target physical directory directly via the native Windows Explorer channel with zero console window flickering, and SHALL return explicit, user-friendly errors when the directory does not exist.

#### Scenario: 用户点击启动文件夹项
- **WHEN**: 用户在大盘网格中点击一个已配置的文件夹启动项
- **THEN**: 后端检查目标路径，若目标为物理目录，则以原生 `explorer.exe <normalized_path>` 方式直接唤起文件资源管理器打开该目录，无 PowerShell 命令行窗口闪烁
- **WHEN**: 目标文件夹在物理磁盘上已被删除或不存在
- **THEN**: 系统拦截并返回明确中文错误提示（如“目标文件夹不存在: <路径>”），并记录至运行日志，绝不导致应用崩溃白屏

### Requirement: 文件夹专属视觉呈现与组合批量调度契约 (REQ-LAUNCHER-FOLDER-04 & REQ-LAUNCHER-FOLDER-05)
The system SHALL render folder items with an amber category badge and `FolderOpen` icon, and SHALL support folder items as first-class members in bundle and batch launch pipelines.

#### Scenario: 文件夹项在大盘展示与组合调度
- **WHEN**: 文件夹项呈现在仪表盘卡片网格中
- **THEN**: 卡片右上角显示专属“目录”琥珀金色徽标，中央显示 `FolderOpen` 矢量图标与平滑微动效
- **WHEN**: 用户将文件夹项加入组合套件 (Bundle) 或在多选启动中批量触发
- **THEN**: 系统将文件夹项按流水线顺序以 150ms 安全微间隔唤起，实时展示调度反馈与耗时记录
