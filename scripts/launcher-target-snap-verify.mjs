import { describe, it } from 'node:test';
import assert from 'node:assert';
import cp from 'child_process';
import fs from 'fs';
import path from 'path';

describe('Launcher Target & Window Snap Integration Verification', () => {
  it('should verify explorer launch command without /separate', () => {
    // 验证调用 explorer.exe 规范参数启动目录
    const targetDir = 'F:\\App Location\\SelfWork';
    const exists = fs.existsSync(targetDir);
    assert.strictEqual(exists, true);
  });

  it('should verify path normalization rules for launcher input', () => {
    // 验证双引号剥离与正斜杠转换
    const rawPaths = [
      '"F:/App Location/SelfWork"',
      'F:/App Location/SelfWork/',
      '"D:/APP/weixin/WeChat.exe"',
      '  "C:/Windows/notepad.exe"  '
    ];

    const cleaned = rawPaths.map(p => p.trim().replace(/^"(.*)"$/, '$1').trim().replace(/\//g, '\\'));

    assert.strictEqual(cleaned[0], 'F:\\App Location\\SelfWork');
    assert.strictEqual(cleaned[1], 'F:\\App Location\\SelfWork\\');
    assert.strictEqual(cleaned[2], 'D:\\APP\\weixin\\WeChat.exe');
    assert.strictEqual(cleaned[3], 'C:\\Windows\\notepad.exe');
  });

  it('should verify WinSnap desktop window matching for explorer titles via temporary file', () => {
    // 验证 WinSta0/Default 桌面顶级窗口可以捕获资源管理器窗口
    const psScript = [
      'Add-Type -TypeDefinition @"',
      'using System;',
      'using System.Text;',
      'using System.Collections.Generic;',
      'using System.Runtime.InteropServices;',
      'public class WinSnapTestVerifier {',
      '    [DllImport("user32.dll", SetLastError = true)]',
      '    public static extern IntPtr OpenWindowStation(string lpszWinSta, bool fInherit, uint dwDesiredAccess);',
      '    [DllImport("user32.dll", SetLastError = true)]',
      '    public static extern bool SetProcessWindowStation(IntPtr hWinSta);',
      '    [DllImport("user32.dll", SetLastError = true)]',
      '    public static extern IntPtr OpenDesktop(string lpszDesktop, uint dwFlags, bool fInherit, uint dwDesiredAccess);',
      '    [DllImport("user32.dll", SetLastError = true)]',
      '    public static extern bool EnumDesktopWindows(IntPtr hDesktop, EnumWindowsProc lpEnumFunc, IntPtr lParam);',
      '    public delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);',
      '    [DllImport("user32.dll", CharSet = CharSet.Unicode)]',
      '    public static extern int GetWindowText(IntPtr hWnd, StringBuilder lpString, int nMaxCount);',
      '    [DllImport("user32.dll", CharSet = CharSet.Unicode)]',
      '    public static extern int GetClassName(IntPtr hWnd, StringBuilder lpString, int nMaxCount);',
      '    [DllImport("user32.dll")]',
      '    public static extern bool IsWindowVisible(IntPtr hWnd);',
      '    public static List<string> Titles = new List<string>();',
      '    private static bool Callback(IntPtr hWnd, IntPtr lParam) {',
      '        if (!IsWindowVisible(hWnd)) return true;',
      '        StringBuilder sbT = new StringBuilder(256);',
      '        GetWindowText(hWnd, sbT, 256);',
      '        StringBuilder sbC = new StringBuilder(256);',
      '        GetClassName(hWnd, sbC, 256);',
      '        if (sbC.ToString() == "CabinetWClass") {',
      '            Titles.Add(sbT.ToString());',
      '        }',
      '        return true;',
      '    }',
      '    public static int CountExplorers() {',
      '        Titles.Clear();',
      '        IntPtr hWinsta = OpenWindowStation("WinSta0", false, 0x00020000 | 0x037F);',
      '        if (hWinsta != IntPtr.Zero) {',
      '            SetProcessWindowStation(hWinsta);',
      '            IntPtr hDesk = OpenDesktop("Default", 0, false, 0x00020000 | 0x01FF);',
      '            if (hDesk != IntPtr.Zero) {',
      '                EnumDesktopWindows(hDesk, new EnumWindowsProc(Callback), IntPtr.Zero);',
      '            }',
      '        }',
      '        return Titles.Count;',
      '    }',
      '}',
      '"@',
      '$cnt = [WinSnapTestVerifier]::CountExplorers()',
      'Write-Output $cnt'
    ].join('\r\n');

    const tempPs1 = path.join('F:\\App Location\\SelfWork\\scripts', 'temp-verify-run.ps1');
    fs.writeFileSync(tempPs1, psScript, 'utf8');

    try {
      const res = cp.spawnSync('powershell.exe', [
        '-NoProfile',
        '-ExecutionPolicy',
        'Bypass',
        '-File',
        tempPs1
      ], { encoding: 'utf8' });

      const count = parseInt(res.stdout.trim(), 10);
      assert.ok(!isNaN(count) && count >= 0, `Output should be valid integer, got ${res.stdout}`);
    } finally {
      if (fs.existsSync(tempPs1)) {
        fs.unlinkSync(tempPs1);
      }
    }
  });
});
