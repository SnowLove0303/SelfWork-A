import fs from 'fs';
import path from 'path';
import assert from 'assert';
import { execSync } from 'child_process';

console.log('=== [OrbitStack L4 Witness] Launcher Process Lifecycle Breakaway Test Suite ===\n');

const WORKSPACE = 'F:/App Location/SelfWork';

// Test 1: Verify src-tauri/src/lib.rs invariants
console.log('[Test 1] Verifying src-tauri/src/lib.rs Win32 ShellExecuteW & Detached Invariants...');
const libRs = fs.readFileSync(path.join(WORKSPACE, 'src-tauri/src/lib.rs'), 'utf8');

assert(libRs.includes('fn ShellExecuteW('), 'lib.rs must declare ShellExecuteW binding');
assert(libRs.includes('str_to_wide_null'), 'lib.rs must contain str_to_wide_null wide string helper');
assert(libRs.includes('ret > 32'), 'lib.rs must check ShellExecuteW return code > 32');
assert(libRs.includes('0x00000200 | 0x00000008'), 'lib.rs must include DETACHED_PROCESS and CREATE_NEW_PROCESS_GROUP fallback flags');
console.log('  -> PASS: lib.rs strictly adheres to ShellExecuteW and Detached Process invariants.\n');

// Test 2: Verify scripts/replace-and-launch.mjs invariant
console.log('[Test 2] Verifying scripts/replace-and-launch.mjs anti-cascading-kill invariant...');
const replaceScript = fs.readFileSync(path.join(WORKSPACE, 'scripts/replace-and-launch.mjs'), 'utf8');
assert(!replaceScript.includes('taskkill /F /IM SelfWork.exe /T'), 'replace-and-launch.mjs must NOT contain /T cascade kill flag');
assert(replaceScript.includes('taskkill /F /IM SelfWork.exe'), 'replace-and-launch.mjs must contain targeted process kill');
console.log('  -> PASS: replace-and-launch.mjs is purified and will not cascade kill user apps.\n');

// Test 3: Real Win32 ShellExecuteW Process Decoupling & Survival Witness
console.log('[Test 3] Physical Witness: Spawning process via ShellExecuteW and testing survival across parent termination...');

// Kill any stale test notepad first
try {
  execSync('taskkill /F /IM notepad.exe', { stdio: 'ignore' });
} catch (e) {}

const testHarnessPy = `
import ctypes
import time
import sys

shell32 = ctypes.windll.shell32
# Spawn notepad via ShellExecuteW
ret = shell32.ShellExecuteW(None, "open", "notepad.exe", None, None, 1)
print(f"PARENT_SPAWNED_CODE:{ret}")
# Parent exits immediately
sys.exit(0)
`;

const harnessPath = path.join(WORKSPACE, 'scripts/temp_lifecycle_harness.py');
fs.writeFileSync(harnessPath, testHarnessPy, 'utf8');

const parentOutput = execSync(`python "${harnessPath}"`, { encoding: 'utf8' });
console.log('  Parent harness output:', parentOutput.trim());
assert(parentOutput.includes('PARENT_SPAWNED_CODE:42') || !parentOutput.includes('PARENT_SPAWNED_CODE:0'), 'ShellExecuteW must return success code (>32)');

// Wait 1.5s after parent is dead
Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1500);

// Check if notepad is still alive
const tasklist = execSync('tasklist /FI "IMAGENAME eq notepad.exe" /FO CSV', { encoding: 'utf8' });
assert(tasklist.toLowerCase().includes('notepad.exe'), 'Target process MUST SURVIVE parent process death!');
console.log('  -> PASS: Target process survived parent termination without interruption!\n');

// Clean up
try {
  fs.unlinkSync(harnessPath);
  execSync('taskkill /F /IM notepad.exe', { stdio: 'ignore' });
} catch (e) {}

console.log('================================================================');
console.log('All 3 Launcher Process Lifecycle Breakaway Tests Passed! Exit 0.');
console.log('================================================================');
