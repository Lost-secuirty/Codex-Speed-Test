#!/usr/bin/env node
// =====================================================================
// scripts/preflight.mjs — THE pre-push gate (Working Agreement #3,
// ADR-0007). Runs every gate in order and exits non-zero on any failure
// or any high-severity drift finding. No push without a clean preflight.
//
//   lint → typecheck → unit → mutation → browser (visual) → build →
//   smoke (verify.mjs) → drift audit (--strict)
//
// The audit runs WITHOUT --run-checks here: preflight already executed
// lint/typecheck/build itself (no duplicate work); CI's audit.yml keeps
// --run-checks because there it IS the health runner.
//
// Browser-dependent gates (browser, smoke) degrade to SKIPPED(env) ONLY
// when no Chromium exists in the environment (the pinned download is
// blocked in this dev container — docs/LEARNINGS.md 2026-06-12). A skip
// is printed loudly and must be recorded in the PR body, then verified
// via CI — it is never reported as green (Working Agreement #7).
//
// Output: summary to stdout + .audit/preflight-summary.md (gitignored)
// for pasting into the PR body.
// =====================================================================

import { spawn, spawnSync } from 'node:child_process';
import { existsSync, globSync, mkdirSync, writeFileSync } from 'node:fs';

const results = [];
const record = (name, status, note = '') => {
  results.push({ name, status, note });
  const icon = { PASS: '✅', FAIL: '❌', 'SKIPPED(env)': '⚠️' }[status];
  console.log(`\n${icon} preflight: ${name} — ${status}${note ? ` (${note})` : ''}`);
};

function run(name, cmd, args, env = {}) {
  console.log(`\n━━━ preflight: ${name} → ${cmd} ${args.join(' ')}`);
  const res = spawnSync(cmd, args, {
    stdio: 'inherit',
    env: { ...process.env, ...env },
  });
  record(name, res.status === 0 ? 'PASS' : 'FAIL');
  return res.status === 0;
}

// ---- resolve a Chromium for the browser-dependent gates -------------------
function resolveChromium() {
  if (process.env.PW_CHROMIUM) return { env: { PW_CHROMIUM: process.env.PW_CHROMIUM } };
  try {
    const probe = spawnSync(
      process.execPath,
      ['-e', "import('playwright').then(({chromium})=>console.log(chromium.executablePath()))"],
      { encoding: 'utf8' },
    );
    const p = (probe.stdout || '').trim();
    if (p && existsSync(p)) return { env: {} }; // pinned browser installed
  } catch {
    // fall through to the container-provisioned browsers
  }
  const hits = globSync('/opt/pw-browsers/chromium-*/chrome-linux/chrome').sort();
  const found = hits.at(-1);
  return found ? { env: { PW_CHROMIUM: found } } : null;
}

// ---- the gates, in order ---------------------------------------------------
let ok = true;
ok = run('lint', 'npm', ['run', 'lint:ci']) && ok;
ok = run('typecheck', 'npm', ['run', 'typecheck']) && ok;
ok = run('unit', 'npm', ['test']) && ok;
ok = run('mutation', 'npm', ['run', 'mutation']) && ok;
ok = run('gate canary', 'npm', ['run', 'canary']) && ok;

const chromium = resolveChromium();
if (chromium) {
  ok = run('browser (visual)', 'npm', ['run', 'test:browser'], chromium.env) && ok;
} else {
  record(
    'browser (visual)',
    'SKIPPED(env)',
    'no Chromium available (download blocked) — record in PR body, verify via CI',
  );
}

ok = run('build', 'npm', ['run', 'build']) && ok;

if (chromium) {
  console.log('\n━━━ preflight: smoke → vite preview + node verify.mjs');
  const server = spawn('npx', ['vite', 'preview', '--port', '4173'], { stdio: 'ignore' });
  let up = false;
  for (let i = 0; i < 30 && !up; i++) {
    try {
      const r = await fetch('http://localhost:4173/');
      up = r.ok;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  if (!up) {
    record('smoke', 'FAIL', 'preview server never came up');
    ok = false;
  } else {
    const res = spawnSync('node', ['verify.mjs'], {
      stdio: 'inherit',
      env: { ...process.env, ...chromium.env },
    });
    record('smoke', res.status === 0 ? 'PASS' : 'FAIL');
    ok = res.status === 0 && ok;
  }
  server.kill();
} else {
  record('smoke', 'SKIPPED(env)', 'no Chromium available — record in PR body, verify via CI');
}

// Drift audit, strict: any high-severity finding fails the preflight.
{
  console.log('\n━━━ preflight: drift audit (--strict)');
  spawnSync('git', ['fetch', 'origin', 'main', '--quiet'], { stdio: 'ignore' });
  const res = spawnSync(
    'node',
    ['scripts/audit-drift.mjs', '--base', 'origin/main', '--head', 'HEAD', '--strict'],
    { stdio: 'inherit' },
  );
  record('drift audit (strict)', res.status === 0 ? 'PASS' : 'FAIL');
  ok = res.status === 0 && ok;
}

// ---- summary ---------------------------------------------------------------
const skipped = results.filter((r) => r.status === 'SKIPPED(env)');
let md = `## Preflight summary (${new Date().toISOString()})\n\n`;
for (const r of results) {
  const icon = { PASS: '✅', FAIL: '❌', 'SKIPPED(env)': '⚠️' }[r.status];
  md += `- ${icon} ${r.name}: **${r.status}**${r.note ? ` — ${r.note}` : ''}\n`;
}
if (skipped.length) {
  md += `\n> ⚠️ ${skipped.length} gate(s) skipped for environment reasons — NOT green. Verify via CI and say so in the PR (Working Agreement #7).\n`;
}
mkdirSync('.audit', { recursive: true });
writeFileSync('.audit/preflight-summary.md', md);
console.log(`\n${md}`);
console.log(ok ? 'PREFLIGHT: PASS — pushable.' : 'PREFLIGHT: FAIL — do not push.');
process.exit(ok ? 0 : 1);
