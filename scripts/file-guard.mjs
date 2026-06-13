#!/usr/bin/env node
// =====================================================================
// scripts/file-guard.mjs — a content-addressed freeze over the repo's
// SAFETY MACHINERY (the gates, probes, lint plugins, secret scanner, and
// pre-commit hook).
//
// Ported in spirit from the dice-duel reliability lab's integrity guard:
// a sha256 baseline that screamed the moment a sub-agent edited a file
// that was supposed to be frozen. Here it makes the ADR-0007 invariant —
// "the audit system may not loosen itself" — a HARD tripwire, not a norm.
//
//   --check (default): hash every protected file, compare to the committed
//     baseline (.fileguard.json), and exit 1 on ANY add / remove / content
//     change. It works on the working tree, not a git range, so it bites
//     even when the drift audit's base ref is wrong (the vacuous-green hole
//     gate-canary.mjs already worries about).
//   --update (alias --snapshot): rewrite the baseline. The whole point is
//     that the baseline bump then lands IN THE DIFF, where a human reviewer
//     sees that the safety system changed — and why.
//
// This is tamper-EVIDENT, not tamper-proof: anyone may change a guarded
// file AND re-snapshot in the same commit. The guard only forces that pair
// into the reviewed diff. Detection is not prevention (ADR-0021).
//
// Relationship to audit-drift.mjs: its `sensitive-paths` check is a MEDIUM,
// ref-relative nag; this is the loud, content-addressed gate. Complementary.
//
// Stdlib only. Honors --root (default cwd) so gate-canary.mjs can drive it
// against a throwaway temp tree.
// =====================================================================

import { createHash } from 'node:crypto';
import { existsSync, globSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

// The protected set: the EXECUTABLE machinery that enforces the repo's
// rules. Prose contracts (AGENTS.md, SECURITY.md) stay under audit-drift's
// softer `sensitive-paths` nag on purpose — this guard freezes the code
// that ENFORCES the rules, not the rules themselves.
const PROTECTED_FILES = [
  'scripts/audit-drift.mjs',
  'scripts/audit-lib.mjs',
  'scripts/audit-lib.d.mts',
  'scripts/mutation-probe.mjs',
  'scripts/gate-canary.mjs',
  'scripts/determinism.mjs',
  'scripts/preflight.mjs',
  'scripts/file-guard.mjs',
  'verify.mjs',
  'biome.json',
  'vite.config.ts',
  'vitest.config.ts',
  'tsconfig.json',
  'tsconfig.node.json',
  'tools/scan_staged.py',
  '.githooks/pre-commit',
];
// Globs expand to whatever currently matches — so adding or deleting a
// footgun plugin is itself a drift event until the baseline is bumped.
const PROTECTED_GLOBS = ['biome-plugins/*.grit'];
const MANIFEST_NAME = '.fileguard.json';

const argv = process.argv.slice(2);
const flagVal = (flag) => {
  const i = argv.indexOf(flag);
  return i !== -1 && argv[i + 1] ? argv[i + 1] : null;
};
const root = flagVal('--root') || process.cwd();
const manifestPath = flagVal('--manifest') || join(root, MANIFEST_NAME);
const updating = argv.includes('--update') || argv.includes('--snapshot');

function expectedSet() {
  // Explicit files are ALWAYS expected — a missing one is a violation, not
  // a silent drop. Globs expand to the current matches.
  const set = new Set(PROTECTED_FILES);
  for (const g of PROTECTED_GLOBS) {
    for (const m of globSync(g, { cwd: root })) set.add(m.replace(/\\/g, '/'));
  }
  return set;
}

function sha256(rel) {
  return createHash('sha256')
    .update(readFileSync(join(root, rel)))
    .digest('hex');
}

function doUpdate() {
  const files = {};
  const missing = [];
  for (const rel of [...expectedSet()].sort()) {
    if (!existsSync(join(root, rel))) {
      missing.push(rel);
      continue;
    }
    files[rel] = sha256(rel);
  }
  if (missing.length) {
    console.error('file-guard: refusing to snapshot — protected files are missing:');
    for (const m of missing) console.error(`  - ${m}`);
    process.exit(1);
  }
  writeFileSync(manifestPath, `${JSON.stringify({ version: 1, files }, null, 2)}\n`);
  console.log(`file-guard: baseline written (${Object.keys(files).length} protected files).`);
}

function doCheck() {
  if (!existsSync(manifestPath)) {
    console.error(`file-guard: no baseline at ${manifestPath}. Run: npm run guard -- --update`);
    process.exit(2);
  }
  let baseline;
  try {
    baseline = JSON.parse(readFileSync(manifestPath, 'utf8')).files || {};
  } catch (err) {
    // A corrupt baseline is exactly the tampered/inert case the guard exists
    // for — fail with a NAMED error (exit 2), not an uncaught SyntaxError that
    // only exits non-zero by Node's default. Honour ADR-0021's own thesis.
    console.error(
      `file-guard: baseline ${manifestPath} is unreadable or corrupt (${err.message}). Re-create it with: npm run guard -- --update`,
    );
    process.exit(2);
  }
  const keys = new Set([...Object.keys(baseline), ...expectedSet()]);
  const drift = [];
  for (const rel of [...keys].sort()) {
    if (!existsSync(join(root, rel))) {
      drift.push(`REMOVED      ${rel}  (protected file is gone)`);
      continue;
    }
    const now = sha256(rel);
    if (!(rel in baseline)) {
      drift.push(
        `UNBASELINED  ${rel}  (present but absent from the baseline — run --update if intentional)`,
      );
    } else if (now !== baseline[rel]) {
      drift.push(`MODIFIED     ${rel}  (${baseline[rel].slice(0, 12)}… → ${now.slice(0, 12)}…)`);
    }
  }
  if (!drift.length) {
    console.log(
      `file-guard: OK — ${Object.keys(baseline).length} protected files match the baseline.`,
    );
    return;
  }
  console.error('file-guard: DRIFT — the repo safety machinery changed since the baseline:\n');
  for (const d of drift) console.error(`  ${d}`);
  console.error(
    '\nIf this change is intentional and reviewed, re-baseline so the bump shows in the diff:',
  );
  console.error(
    '  npm run guard -- --update    (then commit .fileguard.json alongside the change)',
  );
  console.error(
    'If you did NOT expect this, a gate may have been weakened — STOP and review (ADR-0007 / ADR-0021).',
  );
  process.exit(1);
}

if (updating) doUpdate();
else doCheck();
