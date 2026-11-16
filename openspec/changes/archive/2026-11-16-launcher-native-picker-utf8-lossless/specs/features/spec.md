# Spec: 快速启动目录与文件选择器全链路 UTF-8 编码无损与既有数据纠偏

## ADDED Requirements

### Requirement: REQ-LAUNCHER-PICKER-HEX-UTF8 选择器通道十六进制无损编码传输契约
The system SHALL transfer selected file and folder paths via hexadecimal UTF-8 encoding across the PowerShell process boundary to ensure 100% lossless multi-byte character preservation regardless of system code pages.

#### Scenario: 选取中文物理路径文件夹无乱码
- **WHEN** 用户通过“浏览选择”选取包含中文字符的目录或文件时
- **THEN** The system SHALL serialize the path as UTF-8 bytes and output as an ASCII hex string from PowerShell
- **THEN** The Rust backend SHALL decode the hex string into raw UTF-8 bytes and reconstruct the path without replacement characters (`\u{FFFD}`)
- **THEN** The returned path SHALL strictly match the physical path on disk

### Requirement: REQ-LAUNCHER-CORRUPTED-TARGET-REPAIR 既有损坏目录启动项数据自愈契约
The system SHALL repair existing corrupted launcher item targets in SQLite database to restore launchability.

#### Scenario: 自愈修复 MSDS 重写版中文目录项
- **WHEN** 检查启动项存储数据时
- **THEN** The system SHALL rectify the corrupted path of `MSDS 重写版` to `F:\App Location\Guanzhi Tong\Skill\MSDS-Engine\算法训练材料\TDS MSDS 重写版`
- **THEN** Clicking the card SHALL successfully launch Windows Explorer to open the physical directory
