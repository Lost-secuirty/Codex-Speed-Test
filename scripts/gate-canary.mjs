#!/usr/bin/env node
// =====================================================================
// gate-canary.mjs — do the gates still BITE?
//
// The PR #1 review surfaced a bug class the gates themselves can't see:
// VACUOUS GREEN — a check that passes while inert (the drift auditor's
// empty-diff "no drift ✅" on a bad ref; the mutation probe silently
// shrinking as targets moved; a 0.2 visual threshold waving dark-purple
// drift through a dark UI). Every gate was deliberately tripped by hand
// once at scaffold time (LEARNINGS 2026-06-12, the gate-trip matrix) —
// this script makes that trip-matrix a STANDING check: each gate runs
// against a known-bad fixture and the canary fails unless the gate does.
//
// Fixtures are embedded as strings and written to a temp dir, so they
// never touch the real gates (a string literal is not an AST node — the
// GritQL plugins correctly don't match code inside strings). Each canary
// runs the gate's REAL tool with the repo's REAL config; a canary that
// tests a private copy of the config proves nothing.
//
// Covered:   lint core rule, all 3 GritQL footgun plugins, typecheck,
//            visual comparator thresholds (the dark-drift probe),
//            drift-audit bad-ref refusal, secret-scanner self-test.
// Self-canarying elsewhere (not duplicated here): the mutation probe
//            fails on survivors AND on skipped mutants; every KILLED
//            mutant already proves the unit gate detects failure.
// Known-uncovered: browser + smoke failure paths need a live Chromium —
//            hand-tripped at scaffold time, authoritative in CI.
// =====================================================================

import { spawnSync } from 'node:child_process';
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

const REPO = process.cwd();
const results = [];
const record = (name, pass, note = '') => {
  results.push({ name, pass, note });
  console.log(`${pass ? 'PASS' : 'FAIL'}  | ${name}${note ? ` — ${note}` : ''}`);
};

// ---------------------------------------------------------------------
// 1. lint — biome core rule + the three GritQL footgun plugins.
//    Real biome.json + real plugins copied into a temp dir; vcs disabled
//    by flag only (the temp dir has no git repo).
// ---------------------------------------------------------------------
function canaryLint() {
  const dir = mkdtempSync(join(tmpdir(), 'cst-canary-lint-'));
  try {
    cpSync(join(REPO, 'biome.json'), join(dir, 'biome.json'));
    cpSync(join(REPO, 'biome-plugins'), join(dir, 'biome-plugins'), { recursive: true });
    const fixtures = {
      // core recommended rule (the scaffold trip: unused var)
      'unused-var.ts': 'const unusedCanaryVar = 1;\nexport {};\n',
      // storage-firewall.grit
      'storage-direct.ts': "export const v = localStorage.getItem('k');\n",
      // pixi-globalpointermove.grit
      'pointermove.ts':
        "declare const sprite: { on: (e: string, f: () => void) => void };\nsprite.on('pointermove', () => {});\n",
      // pixi-generate-texture-region.grit
      'texture-frame.ts':
        'declare const renderer: { generateTexture: (o: object) => unknown };\ndeclare const g: object;\nexport const t = renderer.generateTexture({ target: g, frame: { x: 0, y: 0, width: 1, height: 1 } });\n',
    };
    for (const [name, src] of Object.entries(fixtures)) writeFileSync(join(dir, name), src);

    const res = spawnSync(
      join(REPO, 'node_modules', '.bin', 'biome'),
      ['lint', '--vcs-enabled=false', '.'],
      { cwd: dir, encoding: 'utf8' },
    );
    const out = `${res.stdout}\n${res.stderr}`;
    record('lint: gate fails on bad fixtures', res.status !== 0, `exit ${res.status}`);
    record('lint: core rule fired (unused var)', out.includes('noUnusedVariables'));
    record('lint: storage-firewall plugin fired', out.includes('src/lib/storage.ts only'));
    record('lint: globalpointermove plugin fired', out.includes('globalpointermove'));
    record('lint: generateTexture plugin fired', out.includes('new Rectangle'));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

// ---------------------------------------------------------------------
// 2. typecheck — real tsconfig.json (strict et al), one type error.
// ---------------------------------------------------------------------
function canaryTypecheck() {
  const dir = mkdtempSync(join(tmpdir(), 'cst-canary-tsc-'));
  try {
    cpSync(join(REPO, 'tsconfig.json'), join(dir, 'tsconfig.json'));
    mkdirSync(join(dir, 'src'));
    writeFileSync(join(dir, 'src', 'bad.ts'), "export const n: number = 'oops';\n");
    symlinkSync(
      join(REPO, 'node_modules'),
      join(dir, 'node_modules'),
      process.platform === 'win32' ? 'junction' : 'dir',
    );
    const res = spawnSync(
      process.execPath,
      [join(REPO, 'node_modules', 'typescript', 'bin', 'tsc'), '--noEmit', '-p', 'tsconfig.json'],
      { cwd: dir, encoding: 'utf8' },
    );
    record(
      'typecheck: gate fails on a type error',
      res.status !== 0 && res.stdout.includes('TS2322'),
      `exit ${res.status}`,
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

// ---------------------------------------------------------------------
// 3. visual comparator — THE DARK-DRIFT PROBE. Re-stages the exact
//    regression that escaped at threshold 0.2 (near-black background
//    repainted dark purple #3a0ca3) against the LIVE thresholds parsed
//    out of vitest.config.ts. If someone loosens the comparator, this is
//    the line that screams.
// ---------------------------------------------------------------------
function canaryVisual() {
  const cfg = readFileSync(join(REPO, 'vitest.config.ts'), 'utf8');
  const thr = cfg.match(/threshold:\s*([\d.]+)/);
  const ratio = cfg.match(/allowedMismatchedPixelRatio:\s*([\d.]+)/);
  if (!thr || !ratio) {
    record('visual: live thresholds parsed from vitest.config.ts', false, 'pattern not found');
    return;
  }
  const threshold = Number(thr[1]);
  const allowed = Number(ratio[1]);

  const baselinePath = join(
    REPO,
    'test/browser/__screenshots__/spokey.test.ts/spokey-idle-dark-chromium-linux.png',
  );
  const base = PNG.sync.read(readFileSync(baselinePath));
  const { width, height } = base;

  // sanity: identical frames must produce zero mismatch (comparator wired
  // the right way round).
  const same = pixelmatch(base.data, base.data, null, width, height, { threshold });
  record('visual: identical frames match', same === 0);

  // the historical escape: repaint every near-black pixel dark purple.
  const drifted = new PNG({ width, height });
  base.data.copy(drifted.data);
  let repainted = 0;
  for (let i = 0; i < drifted.data.length; i += 4) {
    const [r, g, b] = [drifted.data[i], drifted.data[i + 1], drifted.data[i + 2]];
    if (Math.max(r, g, b) < 0x20) {
      drifted.data[i] = 0x3a;
      drifted.data[i + 1] = 0x0c;
      drifted.data[i + 2] = 0xa3;
      repainted++;
    }
  }
  const total = width * height;
  const mismatched = pixelmatch(base.data, drifted.data, null, width, height, { threshold });
  const caught = mismatched / total > allowed;
  record(
    `visual: dark-purple drift caught at live threshold ${threshold}`,
    caught,
    `${mismatched}/${total} px (${((mismatched / total) * 100).toFixed(1)}%) > allowed ${allowed * 100}%; ${repainted} repainted`,
  );
  // informational, not gating: the same drift at the OLD threshold 0.2 —
  // documents why 0.05 is load-bearing (LEARNINGS 2026-06-12).
  const atOld = pixelmatch(base.data, drifted.data, null, width, height, { threshold: 0.2 });
  console.log(
    `       (info: at the old 0.2 threshold the same drift flags ${atOld}/${total} px — ${
      atOld / total > allowed ? 'would now be caught' : 'would still slip through'
    })`,
  );
}

// ---------------------------------------------------------------------
// 4. drift audit — must REFUSE to run on an unresolvable ref (exit 2),
//    never report vacuous "no drift" (the seam closed after PR #1).
// ---------------------------------------------------------------------
function canaryAudit() {
  const res = spawnSync(
    process.execPath,
    ['scripts/audit-drift.mjs', '--base', 'canary-no-such-ref', '--head', 'HEAD'],
    { cwd: REPO, encoding: 'utf8' },
  );
  record(
    'audit: refuses an unresolvable base ref (exit 2)',
    res.status === 2,
    `exit ${res.status}`,
  );
}

// ---------------------------------------------------------------------
// 5. secret scanner — its built-in self-test asserts the blocklist still
//    catches every embedded secret/PII case.
// ---------------------------------------------------------------------
function canaryScanner() {
  const res = spawnSync('python3', ['tools/scan_staged.py', '--self-test'], {
    cwd: REPO,
    encoding: 'utf8',
  });
  record(
    'scanner: --self-test green (catches all embedded cases)',
    res.status === 0,
    (res.stdout || '').trim().split('\n').at(-1) || `exit ${res.status}`,
  );
}

// ---------------------------------------------------------------------
// 6. file guard — must BITE when a protected file is tampered. Stage the
//    real safety machinery into a temp root, baseline it, confirm a clean
//    check passes, then flip one byte and confirm the guard fails. Runs the
//    REAL scripts/file-guard.mjs against the copy (--root), so a guard gone
//    soft can't hide behind a private fixture.
// ---------------------------------------------------------------------
function canaryGuard() {
  const dir = mkdtempSync(join(tmpdir(), 'cst-canary-guard-'));
  try {
    // Containers of every protected path (whole dirs catch new members for
    // free; only a brand-new ROOT-level protected file would need adding).
    const stage = [
      'scripts',
      'biome-plugins',
      'tools',
      '.githooks',
      'biome.json',
      'vite.config.ts',
      'vitest.config.ts',
      'tsconfig.json',
      'tsconfig.node.json',
      'verify.mjs',
    ];
    for (const p of stage) cpSync(join(REPO, p), join(dir, p), { recursive: true });
    const guard = (...extra) =>
      spawnSync(
        process.execPath,
        [
          join(REPO, 'scripts', 'file-guard.mjs'),
          '--root',
          dir,
          '--manifest',
          join(dir, '.fileguard.json'),
          ...extra,
        ],
        { cwd: dir, encoding: 'utf8' },
      );
    record('guard: baseline writes over the protected set', guard('--update').status === 0);
    record('guard: clean check passes on an untouched tree', guard().status === 0);

    // MODIFIED: flip one byte in a guarded file, then restore it from REPO.
    const victim = join(dir, 'scripts', 'preflight.mjs');
    writeFileSync(victim, `${readFileSync(victim, 'utf8')}\n// canary tamper\n`);
    record('guard: BITES on a MODIFIED protected file', guard().status === 1);
    cpSync(join(REPO, 'scripts', 'preflight.mjs'), victim);

    // UNBASELINED: add a file matching a protected glob but absent from the
    // baseline, then remove it.
    const intruder = join(dir, 'biome-plugins', 'zz-canary.grit');
    writeFileSync(intruder, '// canary\n');
    record('guard: BITES on an UNBASELINED glob match', guard().status === 1);
    rmSync(intruder, { force: true });

    // REMOVED: delete a guarded file (last case — no restore needed).
    rmSync(join(dir, 'tools', 'scan_staged.py'), { force: true });
    record('guard: BITES on a REMOVED protected file', guard().status === 1);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

// ---------------------------------------------------------------------
console.log('GATE CANARY — proving every gate still fails on known-bad input\n');
canaryLint();
canaryTypecheck();
canaryVisual();
canaryAudit();
canaryScanner();
canaryGuard();

const failed = results.filter((r) => !r.pass);
console.log(`\n--- SUMMARY: ${results.length - failed.length}/${results.length} canaries pass ---`);
if (failed.length) {
  console.log('A gate has gone soft (vacuous green) — fix the GATE, not this script:');
  for (const f of failed) console.log(`- ${f.name}`);
  process.exit(1);
}
