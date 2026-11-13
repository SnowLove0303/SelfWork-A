# Tasks: 原生文件选择与网页录入极简落地任务

- [x] 1. 改造 `src-tauri/src/lib.rs`：新增 `pick_launcher_file` 原生命令，支持一键拉起 Windows 资源管理器选择文件或目录 <!-- id: 1 -->
- [x] 2. 改造 `src/components/LauncherDashboard.tsx`：为添加启动项弹窗接入“浏览文件”按钮，支持路径与名称自动提取，网页类型极简模式与高级选项折叠 <!-- id: 2 -->
- [x] 3. 运行 `cargo test` 与 `npm run build` 进行零警告、零错误验证并重新构建 `SelfWork.exe` <!-- id: 3 -->
- [x] 4. 1:1 双向物理核销 REQ-LAUNCHER-NATIVE-PICKER-01 ~ REQ-LAUNCHER-URL-SIMPLIFY-02 并呈报用户终审 <!-- id: 4 -->
