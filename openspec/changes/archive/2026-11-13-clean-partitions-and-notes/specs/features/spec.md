# Specification: features

## ADDED Requirements

### Requirement: 纯净分区与子分区治理 (Clean Partitions & Sub-Partitions)
系统界面上必须彻底清除所有无业务支撑的占位假入口，确立三大核心根模块，并支持在私人模块下任意创建子分区。

#### Scenario: 建立子分区
- **WHEN**: 用户在私人头部或子分区行右侧点击新建子分区
- **THEN**: 系统生成新的分区记录并允许内联重命名

### Requirement: 笔记数据库与独立笔记双轨创建 (Note Database & Standalone Note)
子分区与私人根目录下支持创建容纳多篇笔记的多维数据库与单篇独立笔记。

#### Scenario: 创建笔记数据库
- **WHEN**: 用户在子分区下点击新建数据库
- **THEN**: 系统生成 DbCollection 并在主工作区打开多维表格视图

#### Scenario: 创建独立笔记
- **WHEN**: 用户在子分区下点击新建笔记
- **THEN**: 系统生成 DocPage 并在主工作区打开块级编辑器
