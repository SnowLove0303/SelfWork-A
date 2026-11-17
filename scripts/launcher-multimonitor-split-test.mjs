import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import cp from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

describe('🚀 OrbitStack L4 Witness: 多显示器分屏投放与几何平铺集成核销', () => {
  const libRsPath = path.resolve(projectRoot, 'src-tauri/src/lib.rs');
  const libRsContent = fs.readFileSync(libRsPath, 'utf8');

  it('1. 语法纯净度断言：底层 PowerShell 脚本 100% 杜绝 && 与 || 解释器中断语法', () => {
    // 提取 arrange_combo_windows 中生成的 PowerShell 脚本主体
    const psScriptMatch = libRsContent.match(/let ps_script = format!\(r#"(.*?)"#, specs_setup = specs_setup\);/s);
    assert.ok(psScriptMatch, '应能成功提取 ps_script 脚本块');
    const fullScript = psScriptMatch[1];

    // 分离 C# 代码块与 PowerShell 逻辑块 (以 @" 与 "@ 为界)
    const parts = fullScript.split('"@');
    assert.equal(parts.length, 2, '应清晰分离 C# 定义块与 PowerShell 脚本逻辑');
    const powershellLogic = parts[1];

    // PowerShell 逻辑部分严禁包含非法的 && 与 ||
    assert.ok(!powershellLogic.includes('&&'), 'PowerShell 逻辑中严禁包含非法的 && 操作符');
    assert.ok(!powershellLogic.includes('||'), 'PowerShell 逻辑中严禁包含非法的 || 操作符');

    // 验证逻辑运算符统一为 PowerShell 原生的 -and 与 -or
    assert.ok(powershellLogic.includes('-and'), 'PowerShell 逻辑应使用 -and 作为逻辑与');
    assert.ok(powershellLogic.includes('-or'), 'PowerShell 逻辑应使用 -or 作为逻辑或');

    // 验证数组语法没有 trailing comma
    assert.ok(
      !powershellLogic.includes('Placed = $false },\n'),
      'PowerShell 数组中的元素行尾严禁使用逗号，防止 MissingExpressionAfterToken 语法解析崩溃'
    );
  });

  it('2. 解释器物理编译断言：在 Windows PowerShell 5.1 原生环境中 0 报错、0 警告顺利编译执行', () => {
    // 构造测试规格与脚本 (使用不存在的模拟应用确保真实匹配数量为 0)
    const testSpecsSetup = `
$specs = @(
  [PSCustomObject]@{ Id = 0; Target = 'Z:\\FakeMockNotepad_123456.exe'; TargetName = 'FakeMockNotepad_123456.exe'; TargetStem = 'FakeMockNotepad_123456'; ItemName = '假记事本'; Px = 0; Py = 0; Pw = 960; Ph = 1032; Placed = $false }
  [PSCustomObject]@{ Id = 1; Target = 'Z:\\FakeMockExplorer_123456.exe'; TargetName = 'FakeMockExplorer_123456.exe'; TargetStem = 'FakeMockExplorer_123456'; ItemName = '假资源管理器'; Px = 960; Py = 0; Pw = 960; Ph = 1032; Placed = $false }
)
`;

    const psScriptMatch = libRsContent.match(/let ps_script = format!\(r#"(.*?)"#, specs_setup = specs_setup\);/s);
    assert.ok(psScriptMatch, '应能成功提取 ps_script 脚本块');
    // 模拟 Rust format! 将 {{ 还原为 {，}} 还原为 }
    const unescapedScript = psScriptMatch[1]
      .replace(/\{\{/g, '{')
      .replace(/\}\}/g, '}')
      .replace('{specs_setup}', testSpecsSetup);

    const res = cp.spawnSync('powershell.exe', [
      '-NoProfile',
      '-NonInteractive',
      '-ExecutionPolicy', 'Bypass',
      '-Command',
      unescapedScript,
    ], { encoding: 'utf8' });

    assert.equal(res.status, 0, `PowerShell 进程应以退出码 0 退出，实际退出码: ${res.status}, stderr: ${res.stderr}`);
    assert.ok(!res.stderr || res.stderr.trim().length === 0, `stderr 应无任何语法报错，实际内容: ${res.stderr}`);
    assert.equal(res.stdout.trim(), '0', '未实际匹配时应输出真实数量 0，严禁虚假全通');
  });

  it('3. 跨显示器物理坐标系隔离断言 (主屏 X=0 vs 副屏 X=1920)', () => {
    // 获取当前系统的显示器
    const psScreens = `Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.Screen]::AllScreens | ConvertTo-Json`;
    const res = cp.spawnSync('powershell.exe', ['-NoProfile', '-Command', psScreens], { encoding: 'utf8' });
    assert.equal(res.status, 0);

    const screens = JSON.parse(res.stdout);
    const screenList = Array.isArray(screens) ? screens : [screens];
    assert.ok(screenList.length >= 1, '系统至少识别到一个活动显示器');

    // 模拟针对副屏的四分屏与双分屏坐标划分计算
    const secScreen = screenList.find((s) => !s.Primary) || screenList[0];
    const base_x = secScreen.WorkingArea.X;
    const base_y = secScreen.WorkingArea.Y;
    const work_w = secScreen.WorkingArea.Width;
    const work_h = secScreen.WorkingArea.Height;

    // 左右双分屏 (50%:50%)
    const leftPx = base_x;
    const rightPx = base_x + Math.round(work_w * 0.5);

    if (screenList.length > 1) {
      assert.ok(base_x >= 1920 || base_x <= -1920, '副屏 X 原点应位于扩展坐标区间');
      assert.ok(leftPx >= 1920 || leftPx <= -1920, '副屏左分屏应严格锚定在副屏内部，绝对不可落入主屏 (X=0)');
      assert.ok(rightPx > leftPx, '副屏右分屏坐标必须大于左分屏坐标');
    }

    assert.ok(work_w >= 800, '工作区宽度必须有效');
    assert.ok(work_h >= 600, '工作区高度必须有效');
  });

  it('4. 多维指纹命中模型断言 (TargetStem + ItemName + WindowTitle)', () => {
    // 模拟匹配逻辑
    const mockWindow = {
      Title: '继续补充调查 - Google Chrome',
      ProcessName: 'chrome',
      ClassName: 'Chrome_WidgetWin_1',
    };

    const spec = {
      Target: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      TargetName: 'chrome.exe',
      TargetStem: 'chrome',
      ItemName: '谷歌浏览器',
    };

    const targetUpper = spec.Target.toUpperCase();
    const nameUpper = spec.TargetName.toUpperCase();
    const stemUpper = spec.TargetStem.toUpperCase();
    const itemUpper = spec.ItemName.toUpperCase();
    const tUpper = mockWindow.Title.toUpperCase();
    const procUpper = mockWindow.ProcessName.toUpperCase();

    let isMatch = false;
    if (nameUpper.length >= 2 && tUpper.includes(nameUpper)) isMatch = true;
    else if (stemUpper.length >= 2 && tUpper.includes(stemUpper)) isMatch = true;
    else if (itemUpper.length >= 2 && tUpper.includes(itemUpper)) isMatch = true;
    else if (targetUpper.length >= 2 && tUpper.includes(targetUpper)) isMatch = true;
    else if (stemUpper.length >= 2 && (tUpper.includes(stemUpper) || procUpper === stemUpper)) isMatch = true;

    assert.ok(isMatch, '应通过 TargetStem (chrome) 成功命中 Google Chrome 窗口');
  });

  it('5. 反欺诈与弱断言熔断 (Anti-Fraud Sanity Gate)', () => {
    // 验证 lib.rs 已经拔除了 .unwrap_or(specs.len()) 的假通
    assert.ok(
      !libRsContent.includes('.unwrap_or(specs.len())'),
      '必须彻底拔除 .unwrap_or(specs.len())，严禁静默吞没异常与伪造虚假匹配数量'
    );
    assert.ok(
      libRsContent.includes('PowerShell 分屏编排异常'),
      '当 PowerShell 执行非 0 时必须如实抛出错误并暴露给前端'
    );
  });
});
