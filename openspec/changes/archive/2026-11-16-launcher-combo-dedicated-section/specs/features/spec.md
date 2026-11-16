# Spec: 分屏组合单拎专区分栏与宽幅卡片契约 (Dedicated Combo Section)

## ADDED Requirements

### Requirement: REQ-COMBO-DEDICATED-SECTION 大盘置顶分屏组合专区分栏契约
The system SHALL separate multi-item combo items from the standard item grid and present them in a dedicated top section of the launcher dashboard.

#### Scenario: 当前分类下包含分屏组合时激活置顶专区
- **WHEN** 用户处于任意包含 `bundle` 类型启动项的分类视图时
- **THEN** The dashboard SHALL render a distinct header section: "屏幕分屏与工作流套件 (Combo Suites)" above the standard grid
- **THEN** All bundle items belonging to the active category SHALL render exclusively within this dedicated section
- **THEN** Standard item types (`app`, `folder`, `url`, `script`) SHALL render in the grid below
- **WHEN** 当前分类下没有 `bundle` 类型项时
- **THEN** The top combo section SHALL gracefully hide without consuming vertical space

### Requirement: REQ-COMBO-WIDE-CARD-LAYOUT 宽幅组合卡片布局与全要素保全契约
The system SHALL render combo launcher suites as spacious horizontal cards to eliminate all overlapping and truncated content.

#### Scenario: 宽幅组合卡片完整展示全要素
- **WHEN** 组合卡片在专属分栏中渲染时
- **THEN** The card SHALL have sufficient width (`min-w-[280px]` or adaptive multi-column grid) and generous height
- **THEN** The card SHALL present:
  - Top row: Combo title, layout badge (`田字四分屏`), target screen indicator (`屏幕 1` / `屏幕 2`), and kebab menu
  - Middle row: Member preview tags listing the names of contained child items (with type icons)
  - Bottom row: Prominent tactile "启动组合 / 平铺" button and item count indicator
- **THEN** All text elements, badges, tags, and action buttons SHALL be 100% visible with zero text clipping or overlapping

### Requirement: REQ-COMBO-SEAMLESS-ACTION 交互与平铺调度统一契约
The system SHALL ensure clicking anywhere on the dedicated combo card or its primary action button executes full sequential launch and window placement.

#### Scenario: 用户点击宽幅卡片上的启动按钮
- **WHEN** 用户点击组合卡片或其内置的“一键启动”按钮时
- **THEN** The system SHALL trigger `handleLaunchItem` with identical behavior and telemetry feedback
- **THEN** The system SHALL sequentially launch child items and call `arrange_combo_windows`
- **THEN** The kebab menu on the wide card SHALL provide "编辑组合" and "删除组合" actions
