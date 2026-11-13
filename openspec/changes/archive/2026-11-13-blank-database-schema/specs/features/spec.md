# Specification: features

## ADDED Requirements

### Requirement: 通用空白数据库初始结构契约 (Blank Database Initial Schema Invariant)
The system SHALL NOT inject any domain-specific columns when creating a new database, and SHALL provide only a single universal title column.
新建数据库时，系统严禁注入任何特定业务领域的预置字段，必须仅且只提供单一的通用主列（名称）。

#### Scenario: 用户创建新数据库
- **WHEN**: 用户在侧栏或主视口点击新建笔记数据库
- **THEN**: 生成的 DbCollection 的 schema 仅包含一个 `col_title` 列（显示名称为“名称”，类型为 text），其余列完全由用户在表头点击 + 自由扩展
