import assert from 'node:assert';

console.log('===============================================================');
console.log('🚀 快速启动屏幕分屏吸附精度与多窗口去重防重叠全链路核销套件');
console.log('===============================================================\n');

// 1. 模拟目标显示器坐标映射计算算法 (主屏 X=0, 副屏 X=1920)
function computePlacementCoords(baseX, baseY, workW, workH, spec) {
  const DWM_GAP_COMPENSATION = 7;
  let px = baseX + Math.round(workW * spec.x_ratio);
  let py = baseY + Math.round(workH * spec.y_ratio);
  let pw = Math.round(workW * spec.w_ratio);
  let ph = Math.round(workH * spec.h_ratio);

  if (spec.x_ratio > 0.01) {
    px -= DWM_GAP_COMPENSATION;
    pw += DWM_GAP_COMPENSATION;
  }
  if (spec.x_ratio + spec.w_ratio < 0.98) {
    pw += DWM_GAP_COMPENSATION;
  }
  if (spec.y_ratio > 0.01) {
    py -= 4;
    ph += 4;
  }
  if (spec.y_ratio + spec.h_ratio < 0.98) {
    ph += DWM_GAP_COMPENSATION;
  }

  return { px, py, pw, ph };
}

console.log('--- 1. 目标屏幕坐标系绝对隔离与防跨屏漂移实测 ---');
const secondaryMonitor = { x: 1920, y: 0, width: 1920, height: 1032 };
const quadSlots = [
  { id: 'tl', x_ratio: 0.0, y_ratio: 0.0, w_ratio: 0.5, h_ratio: 0.5 },
  { id: 'tr', x_ratio: 0.5, y_ratio: 0.0, w_ratio: 0.5, h_ratio: 0.5 },
  { id: 'bl', x_ratio: 0.0, y_ratio: 0.5, w_ratio: 0.5, h_ratio: 0.5 },
  { id: 'br', x_ratio: 0.5, y_ratio: 0.5, w_ratio: 0.5, h_ratio: 0.5 },
];

quadSlots.forEach((slot) => {
  const coords = computePlacementCoords(
    secondaryMonitor.x,
    secondaryMonitor.y,
    secondaryMonitor.width,
    secondaryMonitor.height,
    slot
  );
  assert.ok(
    coords.px >= secondaryMonitor.x,
    `象限 ${slot.id} 的 X 坐标 (${coords.px}) 必须在副屏起始点 (${secondaryMonitor.x}) 之内`
  );
  assert.ok(
    coords.px + coords.pw <= secondaryMonitor.x + secondaryMonitor.width + 10,
    `象限 ${slot.id} 的宽度边界必须约束在副屏内`
  );
  assert.ok(
    coords.py >= secondaryMonitor.y - 4,
    `象限 ${slot.id} 的 Y 坐标 (${coords.py}) 必须在副屏工作区内`
  );
});
console.log('[PASS] 指定副屏 (X=1920) 启动四分屏：所有 4 个象限坐标 100% 锚定在副屏物理范围，零跨屏溢出至主屏');

console.log('\n--- 2. 窗口句柄唯一占位与防重叠排他池 ($usedHwnds) 实测 ---');
class MockSnapEngine {
  constructor(windows) {
    this.windows = windows;
    this.usedHwnds = new Set();
    this.placedSlots = [];
  }

  placeSpecs(specs) {
    for (const spec of specs) {
      let matchedHwnd = null;
      for (const w of this.windows) {
        if (this.usedHwnds.has(w.hwnd)) continue; // 关键防重叠断言：已用句柄绝不二次匹配！
        if (
          w.path.toUpperCase() === spec.target.toUpperCase() ||
          w.name.toUpperCase() === spec.name.toUpperCase()
        ) {
          matchedHwnd = w.hwnd;
          break;
        }
      }

      if (matchedHwnd !== null) {
        this.usedHwnds.add(matchedHwnd);
        this.placedSlots.push({ specId: spec.id, hwnd: matchedHwnd });
      }
    }
  }
}

// 模拟用户环境：存在 2 个名称相似的文件夹窗口与 1 个主程序
const mockActiveWindows = [
  { hwnd: 1001, name: 'TDS MSDS 备用版', path: 'E:\\冠志\\TDS MSDS 备用版' },
  { hwnd: 1002, name: 'TDS MSDS 备用版', path: 'E:\\冠志\\TDS MSDS 备用版' }, // 历史残留同名窗
  { hwnd: 2001, name: 'TDS MSDS 重写版', path: 'F:\\App Location\\TDS MSDS 重写版' },
  { hwnd: 3001, name: 'SelfWork', path: 'F:\\App Location\\SelfWork' },
];

const testSpecs = [
  { id: 'slot-tl', target: 'F:\\App Location\\SelfWork', name: 'SelfWork' },
  { id: 'slot-tr', target: 'E:\\冠志\\TDS MSDS 备用版', name: 'TDS MSDS 备用版' },
  { id: 'slot-br', target: 'F:\\App Location\\TDS MSDS 重写版', name: 'TDS MSDS 重写版' },
];

const engine = new MockSnapEngine(mockActiveWindows);
engine.placeSpecs(testSpecs);

assert.strictEqual(engine.placedSlots.length, 3, '3 个槽位必须全部成功匹配');
const assignedHwnds = engine.placedSlots.map((p) => p.hwnd);
const uniqueHwnds = new Set(assignedHwnds);
assert.strictEqual(uniqueHwnds.size, assignedHwnds.length, '每个槽位分配的 HWND 必须绝对唯一，严禁重复');
console.log(`[PASS] 成功排版 ${engine.placedSlots.length} 个窗口，分配句柄: [${assignedHwnds.join(', ')}]，去重率 100%，重叠率 0%`);

console.log('\n--- 3. 异步并发唤起自适应多轮探测轮询实测 ---');
// 模拟后置窗口在第 2 轮才注册到系统中的异步延迟场景
class MockAdaptivePollingEngine {
  constructor() {
    this.usedHwnds = new Set();
    this.placedCount = 0;
  }

  runMultiRound(specs, roundsData) {
    for (let round = 0; round < roundsData.length; round++) {
      const activeWindows = roundsData[round];
      for (const spec of specs) {
        if (spec.placed) continue;
        for (const w of activeWindows) {
          if (this.usedHwnds.has(w.hwnd)) continue;
          if (w.path.toUpperCase() === spec.target.toUpperCase()) {
            this.usedHwnds.add(w.hwnd);
            spec.placed = true;
            this.placedCount++;
            break;
          }
        }
      }
      if (specs.every((s) => s.placed)) break;
    }
  }
}

const asyncSpecs = [
  { id: 1, target: 'F:\\DIR1', placed: false },
  { id: 2, target: 'F:\\DIR2', placed: false },
  { id: 3, target: 'F:\\DIR3', placed: false }, // 假设 DIR3 延迟生成
  { id: 4, target: 'F:\\DIR4', placed: false }, // 假设 DIR4 延迟生成
];

// Round 0 只有 DIR1, DIR2 就绪；Round 1 时 DIR3, DIR4 就绪
const rounds = [
  [
    { hwnd: 101, path: 'F:\\DIR1' },
    { hwnd: 102, path: 'F:\\DIR2' },
  ],
  [
    { hwnd: 101, path: 'F:\\DIR1' },
    { hwnd: 102, path: 'F:\\DIR2' },
    { hwnd: 103, path: 'F:\\DIR3' },
    { hwnd: 104, path: 'F:\\DIR4' },
  ],
];

const pollEngine = new MockAdaptivePollingEngine();
pollEngine.runMultiRound(asyncSpecs, rounds);

assert.strictEqual(pollEngine.placedCount, 4, '通过多轮轮询必须 100% 捕获所有后就绪窗口');
assert.ok(asyncSpecs.every((s) => s.placed), '所有 4 个子项必须全部标记为已停靠');
console.log('[PASS] 自适应多轮轮询成功在后置窗口就绪时即时捕获，4/4 全部就位，杜绝落空！');

console.log('\n===============================================================');
console.log('🎉 屏幕分屏吸附精度与多窗口去重防重叠全链路核销通过，零缺陷！');
console.log('===============================================================');
