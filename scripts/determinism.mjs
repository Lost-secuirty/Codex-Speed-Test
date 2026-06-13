#!/usr/bin/env node
// =====================================================================
// determinism.mjs — is the unit suite hermetic? (ADR-0022, gap A1)
//
// Runs the unit project TWICE under perturbation — a different test-order
// shuffle seed AND a different timezone — and fails loud if any test's
// pass/fail OUTCOME flips between the runs. A flip means the test secretly
// depends on test order or wall-clock: a green that doesn't mean what you
// think. (Web-validated: randomize order to surface inter-test deps; inject
// the clock so time-readers are caught.)
//
// Stable failures are the unit gate's job (it runs first in preflight); this
// gate hunts FLIPS. Honors --root (default cwd) so gate-canary.mjs can drive
// it against a throwaway tree with a planted non-hermetic test. Stdlib only.
// =====================================================================

import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const argv = process.argv.slice(2);
const flag = (f) => {
  const i = argv.indexOf(f);
  return i !== -1 && argv[i + 1] ? argv[i + 1] : null;
};
const ROOT = flag('--root') || process.cwd();
const SCRATCH = mkdtempSync(join(tmpdir(), 'cst-determ-'));

function runOnce(label, seed, tz) {
  const out = join(SCRATCH, `${label}.json`);
  const bin = join(ROOT, 'node_modules', 'vitest', 'vitest.mjs');
  const res = spawnSync(
    process.execPath,
    [
      bin,
      'run',
      '--project',
      'unit',
      '--sequence.shuffle',
      `--sequence.seed=${seed}`,
      '--reporter=json',
      `--outputFile=${out}`,
    ],
    { cwd: ROOT, encoding: 'utf8', timeout: 180000, env: { ...process.env, TZ: tz } },
  );
  const map = new Map();
  let parseError = null;
  try {
    const json = JSON.parse(readFileSync(out, 'utf8'));
    for (const file of json.testResults || []) {
      for (const a of file.assertionResults || []) {
        const id = `${file.name}::${[...(a.ancestorTitles || []), a.title].join(' > ')}`;
        map.set(id, a.status);
      }
    }
  } catch (err) {
    parseError = err.message;
  }
  return { status: res.status, map, parseError, stderr: res.stderr || '' };
}

console.log('DETERMINISM GATE — the unit suite must be order- and clock-invariant\n');
const r1 = runOnce('run1', 1, 'UTC');
const r2 = runOnce('run2', 999983, 'Asia/Kolkata');
rmSync(SCRATCH, { recursive: true, force: true });

let ok = true;
if (r1.parseError || r2.parseError || r1.map.size === 0) {
  console.error("determinism: could not parse a run's JSON results — failing safe.");
  if (r1.parseError) console.error(`  run1: ${r1.parseError}`);
  if (r2.parseError) console.error(`  run2: ${r2.parseError}`);
  if (r1.stderr) console.error(r1.stderr.slice(0, 1500));
  ok = false;
}

const flips = [];
for (const k of new Set([...r1.map.keys(), ...r2.map.keys()])) {
  const s1 = r1.map.get(k) ?? 'absent';
  const s2 = r2.map.get(k) ?? 'absent';
  if (s1 !== s2) flips.push(`${k}  [seed1/UTC=${s1}  seed2/Kolkata=${s2}]`);
}
if (flips.length) {
  console.error(
    `determinism: ${flips.length} test(s) FLIPPED outcome under perturbation (non-hermetic):`,
  );
  for (const f of flips) console.error(`  - ${f}`);
  console.error(
    '\nA flip = the test depends on order or wall-clock. Fix the TEST (inject the seed/clock), not this gate.',
  );
  ok = false;
}

if (ok) {
  console.log(
    `determinism: OK — ${r1.map.size} unit tests, identical outcomes across two shuffle seeds + two timezones.`,
  );
  process.exit(0);
}
process.exit(1);
