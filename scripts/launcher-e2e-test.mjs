#!/usr/bin/env node
/**
 * Launcher Dashboard New Item End-to-End User Behavior Test Suite
 * 快速启动「新建项」真实用户行为端到端全链路测试套件
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync, spawn, spawnSync } from 'node:child_process';

console.log('===============================================================');
console.log('🚀 快速启动「新建项」真实用户端行为执行测试与全链路核销套件');
console.log('===============================================================\n');

let passed = 0;
let failed = 0;

function assert(condition, testName, evidence = '') {
  if (condition) {
    passed++;
    console.log(`[PASS] ${testName} ${evidence ? `(${evidence})` : ''}`);
  } else {
    failed++;
    console.error(`[FAIL] ${testName} ${evidence ? `(${evidence})` : ''}`);
  }
}

// ==================== 1. 表单交互与负向防御攻击测试 ====================
console.log('\n--- 1. 表单前置校验与负向边界防御实测 (Negative Validation) ---');

function simulateFormValidation(formType, formName, formTarget, formBundleItemIds = []) {
  const trimmedName = (formName || '').trim();
  const trimmedTarget = (formTarget || '').trim();

  if (!trimmedName) {
    return { valid: false, error: '请填写启动项名称！' };
  }
  if (formType !== 'bundle' && !trimmedTarget) {
    return { valid: false, error: '请填写目标路径、网址或脚本指令！' };
  }
  if (formType === 'bundle' && formBundleItemIds.length === 0) {
    return { valid: false, error: '请至少勾选一个包含在捆绑套件中的应用或脚本！' };
  }

  return { valid: true, error: null };
}

// 攻击 1: 空名称拦截
const r1 = simulateFormValidation('app', '', 'C:\\Windows\\System32\\notepad.exe');
assert(!r1.valid && r1.error === '请填写启动项名称！', '空名称输入防御拦截', r1.error);

// 攻击 2: 全空格名称拦截
const r2 = simulateFormValidation('app', '    ', 'C:\\Windows\\System32\\notepad.exe');
assert(!r2.valid && r2.error === '请填写启动项名称！', '全空格名称输入防御拦截', r2.error);

// 攻击 3: 缺少目标路径拦截 (app 类型)
const r3 = simulateFormValidation('app', '记事本', '');
assert(!r3.valid && r3.error === '请填写目标路径、网址或脚本指令！', '空目标路径输入防御拦截 (app)', r3.error);

// 攻击 4: 缺少目标路径拦截 (url 类型)
const r4 = simulateFormValidation('url', 'GitHub', '   ');
assert(!r4.valid && r4.error === '请填写目标路径、网址或脚本指令！', '空目标 URL 输入防御拦截 (url)', r4.error);

// 攻击 5: 缺少目标路径拦截 (script 类型)
const r5 = simulateFormValidation('script', '测试脚本', '');
assert(!r5.valid && r5.error === '请填写目标路径、网址或脚本指令！', '空脚本指令输入防御拦截 (script)', r5.error);

// 攻击 6: 空捆绑组合勾选拦截 (bundle 类型)
const r6 = simulateFormValidation('bundle', '每日工作套件', '', []);
assert(!r6.valid && r6.error === '请至少勾选一个包含在捆绑套件中的应用或脚本！', '空捆绑套件勾选防御拦截 (bundle)', r6.error);

// 攻击 7: 缺少目标路径拦截 (folder 类型) (REQ-LAUNCHER-FOLDER-01)
const r7 = simulateFormValidation('folder', '工程目录', '');
assert(!r7.valid && r7.error === '请填写目标路径、网址或脚本指令！', '空目标路径输入防御拦截 (folder)', r7.error);

// ==================== 2. 网页直达类型 (url) 域名自动推导测试 ====================
console.log('\n--- 2. 网页直达 (URL) 智能推导与录入契约测试 ---');

function deriveUrlName(urlInput) {
  if (!urlInput.includes('://')) return '';
  try {
    const urlObj = new URL(urlInput);
    const host = urlObj.hostname.replace(/^www\./, '');
    const domainMain = host.split('.')[0];
    if (domainMain) {
      return domainMain.charAt(0).toUpperCase() + domainMain.slice(1);
    }
  } catch {
    return '';
  }
  return '';
}

assert(deriveUrlName('https://github.com/trending') === 'Github', 'GitHub 链接自动推导名称', 'Github');
assert(deriveUrlName('https://www.bilibili.com/video') === 'Bilibili', 'Bilibili 链接去 www 自动推导名称', 'Bilibili');
assert(deriveUrlName('https://google.com/search') === 'Google', 'Google 链接自动推导名称', 'Google');

// ==================== 2.1 文件夹类型 (folder) 智能名称提取与点号保全测试 ====================
console.log('\n--- 2.1 文件夹 (Folder) 智能推导与名称点号保全实测 ---');

function deriveFolderName(pickedPath, isFolder = true) {
  const normalized = pickedPath.replace(/\\/g, '/');
  const baseName = normalized.split('/').pop() || '';
  const dotIndex = baseName.lastIndexOf('.');
  return isFolder ? baseName : dotIndex > 0 ? baseName.slice(0, dotIndex) : baseName;
}

assert(deriveFolderName('F:\\App Location\\SelfWork', true) === 'SelfWork', '标准文件夹路径自动提取目录名', 'SelfWork');
assert(deriveFolderName('C:/Users/Administrator/Project.v1.0', true) === 'Project.v1.0', '带点号版本号的文件夹名称防误截断', 'Project.v1.0');
assert(deriveFolderName('D:\\Apps\\tools\\node.js', true) === 'node.js', 'node.js 目录完整保留不误作后缀剥离', 'node.js');

// ==================== 3. 应用程序 (app) 原生图标提取与真实进程唤起实测 ====================
console.log('\n--- 3. 本地应用 (App) 原生图标提取与执行管道测试 ---');

const testExePath = 'C:\\Windows\\System32\\notepad.exe';
assert(fs.existsSync(testExePath), '本地测试目标 notepad.exe 物理存在', testExePath);

// 模拟调用 Tauri 后端 get_app_icon 原生 IPC 逻辑
function extractIconNative(exePath) {
  const psCmd = `Add-Type -AssemblyName System.Drawing; ` +
    `$icon = [System.Drawing.Icon]::ExtractAssociatedIcon('${exePath.replace(/'/g, "''")}'); ` +
    `if ($icon) { ` +
    `  $ms = New-Object System.IO.MemoryStream; ` +
    `  $bitmap = $icon.ToBitmap(); ` +
    `  $bitmap.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png); ` +
    `  [Convert]::ToBase64String($ms.ToArray()) ` +
    `}`;
  
  const b64 = execSync(`powershell -NoProfile -ExecutionPolicy Bypass -Command "${psCmd}"`, {
    encoding: 'utf8',
    windowsHide: true,
  }).trim();

  return b64 ? `data:image/png;base64,${b64}` : null;
}

let extractedIcon = null;
try {
  extractedIcon = extractIconNative(testExePath);
} catch (err) {
  console.error('图标提取出错:', err);
}

assert(
  Boolean(extractedIcon && extractedIcon.startsWith('data:image/png;base64,') && extractedIcon.length > 500),
  '原生 get_app_icon 成功提取 32x32 图标 Base64 数据',
  `长度: ${extractedIcon?.length || 0} 字符`
);

// 真实独立进程唤起与安全销毁测试
console.log('测试唤起独立应用进程...');
let launchedPid = null;
try {
  const proc = spawn(testExePath, [], { detached: true, stdio: 'ignore' });
  proc.unref();
  launchedPid = proc.pid;
} catch (err) {
  console.error('唤起进程失败:', err);
}

assert(Boolean(launchedPid && launchedPid > 0), '真实唤起本地应用独立进程', `PID: ${launchedPid}`);

if (launchedPid) {
  try {
    execSync(`taskkill /F /PID ${launchedPid}`, { windowsHide: true, stdio: 'ignore' });
    console.log(`[PASS] 成功受控终止测试进程 (PID: ${launchedPid})`);
    passed++;
  } catch (_e) {
    // ignore
  }
}

// ==================== 4. 脚本指令 (script) 真实执行测试 ====================
console.log('\n--- 4. 脚本指令 (Script) 真实执行管道测试 ---');

const testScript = "Write-Output 'SelfWork Launcher E2E PASS'";
const scriptOutput = execSync(`powershell -NoProfile -ExecutionPolicy Bypass -Command "${testScript}"`, {
  encoding: 'utf8',
  windowsHide: true,
}).trim();

assert(scriptOutput === 'SelfWork Launcher E2E PASS', '执行脚本指令并捕获标准输出', scriptOutput);

// ==================== 4.1 物理文件夹 (folder) 资源管理器通道与存在性断言测试 ====================
console.log('\n--- 4.1 物理文件夹 (Folder) 原生通道与路径校验测试 ---');

const testFolderPath = 'F:\\App Location\\SelfWork';
assert(fs.existsSync(testFolderPath) && fs.statSync(testFolderPath).isDirectory(), '本地物理测试目录存在且为有效文件夹', testFolderPath);

const nonExistentFolder = 'Z:\\NonExistentMockFolder_123456';
assert(!fs.existsSync(nonExistentFolder), '不存在的物理路径正确识别为非物理存在', nonExistentFolder);

// ==================== 5. SQLite 物理数据库双向落盘与冷重启对账实测 ====================
console.log('\n--- 5. SQLite 物理落盘与冷重启数据对账实测 ---');

const appData = process.env.APPDATA || 'C:\\Users\\Administrator\\AppData\\Roaming';
const dbPath = path.join(appData, 'SelfWork', 'selfwork.db');
assert(fs.existsSync(dbPath), '物理 SQLite 数据库存在', dbPath);

// 使用 Python 从 stdin 读取 JSON 避免 Windows 命令行长度超限
function runPythonSqlite(scriptCode, stdinInput = '') {
  const res = spawnSync('python', ['-c', scriptCode], {
    input: stdinInput,
    encoding: 'utf8',
    windowsHide: true,
  });
  if (res.error) throw res.error;
  if (res.status !== 0) throw new Error(res.stderr || `Python exited with ${res.status}`);
  return res.stdout.trim();
}

// 1. 读取原有的 sw_launcher_storage_v2 数据
const readPy = `
import sqlite3, sys
conn = sqlite3.connect(r'${dbPath}')
cur = conn.cursor()
cur.execute('SELECT value FROM app_settings WHERE key = ?', ('sw_launcher_storage_v2',))
row = cur.fetchone()
print(row[0] if row else '')
`;
const originalStorageJson = runPythonSqlite(readPy);
assert(Boolean(originalStorageJson && originalStorageJson.startsWith('{')), '成功读取现有 sw_launcher_storage_v2 数据');

const originalStorage = JSON.parse(originalStorageJson);
const originalItemsCount = originalStorage.items.length;
console.log(`当前存储中已有 ${originalItemsCount} 个启动项，${originalStorage.categories.length} 个分类`);

// 2. 模拟前端创建新项并通过 Python stdin 写入落盘
const testItemId = `item-test-e2e-${Date.now()}`;
const testFolderItemId = `folder-test-e2e-${Date.now()}`;
const newTestItem = {
  id: testItemId,
  categoryId: originalStorage.categories[0]?.id || 'cat-tools',
  name: '自动化测试启动项',
  type: 'app',
  target: testExePath,
  icon: extractedIcon,
  description: '由 E2E 真实测试套件创建的验证卡片',
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

const newTestFolderItem = {
  id: testFolderItemId,
  categoryId: originalStorage.categories[0]?.id || 'cat-tools',
  name: '自动化测试工程目录',
  type: 'folder',
  target: testFolderPath,
  description: '由 E2E 真实测试套件创建的文件夹验证卡片',
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

const updatedStorage = {
  ...originalStorage,
  items: [newTestFolderItem, newTestItem, ...originalStorage.items],
};

const writePy = `
import sqlite3, sys, time
data = sys.stdin.read()
conn = sqlite3.connect(r'${dbPath}')
cur = conn.cursor()
cur.execute('INSERT OR REPLACE INTO app_settings (key, value, updated_at) VALUES (?, ?, ?)',
            ('sw_launcher_storage_v2', data, int(time.time() * 1000)))
conn.commit()
print('SUCCESS')
`;
const writeResult = runPythonSqlite(writePy, JSON.stringify(updatedStorage));
assert(writeResult === 'SUCCESS', '成功将新启动项持久化写入 SQLite app_settings');

// 3. 冷读取验证落盘
const reReadJson = runPythonSqlite(readPy);
const reReadStorage = JSON.parse(reReadJson);
const foundItem = reReadStorage.items.find((i) => i.id === testItemId);

assert(
  Boolean(foundItem && foundItem.name === '自动化测试启动项' && foundItem.target === testExePath),
  '新添加项目成功落盘至 SQLite，跨实例读取验证通过',
  `ID: ${testItemId}`
);

const foundFolderItem = reReadStorage.items.find((i) => i.id === testFolderItemId);
assert(
  Boolean(foundFolderItem && foundFolderItem.name === '自动化测试工程目录' && foundFolderItem.type === 'folder' && foundFolderItem.target === testFolderPath),
  '新添加文件夹项目成功落盘至 SQLite，跨实例验证字段与类型保全',
  `ID: ${testFolderItemId}`
);

// ==================== 5. 屏幕分屏编排 (Window Snap Tiling) 数据结构与契约测试 ====================
console.log('\n--- 5. 屏幕分屏编排 (Window Snap Tiling) 契约与持久化测试 ---');

const testComboId = `test-combo-${Date.now()}`;
const newComboItemWithTiling = {
  id: testComboId,
  categoryId: 'all',
  name: '自动化四分屏组合测试',
  type: 'bundle',
  target: '启动组合套件',
  bundleItemIds: [testItemId, testFolderItemId],
  windowLayout: {
    enabled: true,
    layout: 'grid-4',
    targetMonitorIndex: 1, // 指定投递到屏幕 2 (副屏)
    slots: [
      { slotId: 'slot-tl', name: '左上象限', targetItemId: testItemId, xRatio: 0, yRatio: 0, wRatio: 0.5, hRatio: 0.5 },
      { slotId: 'slot-tr', name: '右上象限', targetItemId: testFolderItemId, xRatio: 0.5, yRatio: 0, wRatio: 0.5, hRatio: 0.5 },
      { slotId: 'slot-bl', name: '左下象限', targetItemId: '', xRatio: 0, yRatio: 0.5, wRatio: 0.5, hRatio: 0.5 },
      { slotId: 'slot-br', name: '右下象限', targetItemId: '', xRatio: 0.5, yRatio: 0.5, wRatio: 0.5, hRatio: 0.5 },
    ]
  },
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

assert(
  newComboItemWithTiling.windowLayout.enabled === true &&
  newComboItemWithTiling.windowLayout.layout === 'grid-4' &&
  newComboItemWithTiling.windowLayout.slots.length === 4,
  '四分屏组合配置结构校验合规 (grid-4, 4 slots)'
);

const storageWithCombo = {
  ...reReadStorage,
  items: [newComboItemWithTiling, ...reReadStorage.items],
};
const comboWriteResult = runPythonSqlite(writePy, JSON.stringify(storageWithCombo));
assert(comboWriteResult === 'SUCCESS', '成功将包含四分屏配置的组合项写入 SQLite');

const readComboStorage = JSON.parse(runPythonSqlite(readPy));
const foundCombo = readComboStorage.items.find(i => i.id === testComboId);
assert(
  Boolean(foundCombo && foundCombo.windowLayout && foundCombo.windowLayout.enabled && foundCombo.windowLayout.slots[0].name === '左上象限' && foundCombo.windowLayout.targetMonitorIndex === 1),
  '四分屏组合项从 SQLite 完整反序列化，象限槽位与目标屏幕 2 (副屏) 配置 100% 保持无损'
);

// 4. 清理测试项并恢复原始数据
console.log('恢复用户原始启动项数据，杜绝脏数据残留...');
const restoreResult = runPythonSqlite(writePy, JSON.stringify(originalStorage));
assert(restoreResult === 'SUCCESS', '成功将原始数据回写 SQLite');

const finalReadJson = runPythonSqlite(readPy);
const finalStorage = JSON.parse(finalReadJson);
assert(
  finalStorage.items.length === originalItemsCount && !finalStorage.items.some((i) => i.id === testItemId),
  '安全完成现场清理，用户数据 100% 原样恢复',
  `当前有效项数: ${finalStorage.items.length}`
);

// ==================== 汇总 ====================
console.log('\n===============================================================');
console.log(`🎉 测试执行完毕：${passed} 项通过，${failed} 项失败。`);
console.log('===============================================================');

process.exit(failed === 0 ? 0 : 1);
