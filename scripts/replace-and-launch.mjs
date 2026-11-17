import { execSync } from 'child_process';
import fs from 'fs';

console.log('[1/4] Killing running SelfWork.exe instances...');
try {
  execSync('taskkill /F /IM SelfWork.exe', { stdio: 'pipe' });
  console.log('Killed existing SelfWork.exe');
} catch (e) {
  console.log('No active SelfWork.exe found or already stopped');
}

// Wait 1 second for OS file lock to release
Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1000);

const src = 'F:/App Location/SelfWork/src-tauri/target/release/selfwork-desktop.exe';
const dst = 'F:/App Location/SelfWork/SelfWork.exe';

console.log('[2/4] Copying binary from', src, 'to', dst);
fs.copyFileSync(src, dst);

const stat = fs.statSync(dst);
console.log('[3/4] Copy complete! Destination mtime:', stat.mtime.toISOString(), 'size:', stat.size);

console.log('[4/4] Launching via schtasks...');
try {
  execSync('schtasks /create /tn "SelfWorkRun" /tr "F:\\APPLOC~1\\SelfWork\\SelfWork.exe" /sc once /st "00:00" /it /f', { stdio: 'inherit' });
  execSync('schtasks /run /tn "SelfWorkRun"', { stdio: 'inherit' });
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 2000);
  execSync('schtasks /delete /tn "SelfWorkRun" /f', { stdio: 'inherit' });
  console.log('SelfWork.exe launched successfully via interactive task!');
} catch (err) {
  console.error('schtasks error:', err);
}
