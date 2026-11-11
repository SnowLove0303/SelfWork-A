# Feature Specification: 灵活多选批量启动与持久化捆绑套件

## 1. 即时多选批量启动规范 (Multi-Selection Quick Launch)

### Requirement: REQ-BUNDLE-01
- **SHALL**: 顶标工具行 **SHALL** 提供“多选启动”模式切换入口：
  - **WHEN** 用户点击“多选启动”时：
    - 系统 **SHALL** 进入多选模式状态，大盘卡片左上角浮现复选标记控件（Checkbox）；
    - 顶标工具栏 **SHALL** 动态展开多选操作面板：包含“已选 N 项”计数、全选/取消全选、执行“启动所选项 (N)”按键及“退出多选”按键；
  - **WHEN** 用户处于多选模式点击任意启动项卡片时：
    - 系统 **SHALL NOT** 立即单独拉起该应用，而是切换该卡片的勾选选中状态（Toggle Selection）；
    - 选中项卡片表面 **SHALL** 呈现青蓝高亮边框与柔和辉光，未选中项保持半透明弱化；
  - **WHEN** 用户点击“启动所选项”按键时：
    - **WHEN** 已选项列表为空，系统 **SHALL** 给出“请先勾选要启动的项目”提示；
    - **WHEN** 已选项不为空，系统 **SHALL** 依次调度执行每一个被勾选项（应用使用进程原生直起，脚本使用静默通道，间隔 150ms 避免瞬间拥堵），并在界面实时呈现拉起进度；
    - 执行完成后，系统 **SHALL** 自动重置勾选项并退出多选模式。

---

## 2. 持久化捆绑套件规范 (Persistent Bundled Preset Items)

### Requirement: REQ-BUNDLE-02
- **SHALL**: 数据模型 `LauncherItemType` **SHALL** 支持 `'bundle'` 类型，且 `LauncherItem` **SHALL** 支持可选字段 `bundleItemIds?: string[]`：
  - **WHEN** 用户在“添加/编辑启动项”中选择“组合/套件 (bundle)”类型时：
    - 表单 **SHALL** 隐藏单一物理路径输入框，展示“包含子项”多选列表；
    - 列表 **SHALL** 枚举当前数据库中的全部可用单体应用与脚本（排除当前正在编辑的 bundle 自身以杜绝递归循环），并展示真实图标与名称；
    - 用户 **SHALL** 能够自由复选勾选要绑定的成员项目；
  - **WHEN** 用户在大盘点击一个 `bundle` 类型的卡片时：
    - 系统 **SHALL** 读取其 `bundleItemIds`，解析其包含的所有有效启动项；
    - 系统 **SHALL** 依次、连续并发唤起该套件内所有项目，并给出“已成功批量唤起【XX】套件共 N 项”的全局 Toast 反馈；
  - **WHEN** 组合成员中的单体应用被删除时：
    - 系统 **SHALL** 优雅容错，自动忽略已不存在的子项 ID，不得导致整个组合启动失败崩溃。
