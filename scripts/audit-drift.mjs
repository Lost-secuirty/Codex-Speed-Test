#!/usr/bin/env node
// =====================================================================
// scripts/audit-drift.mjs — deterministic PR "drift" auditor.
//
// Ported from demo-math and adapted for this repo (TS sources, Biome,
// the typecheck gate, lib-vs-prototypes strictness — ADR-0007). No
// external deps, NO API key. Compares the LOGGED INTENT (commit
// messages, PR body, docs/LEARNINGS.md — the externalized "world
// state") against the ACTUAL diff, and flags drift. With --fix it
// applies only safe, reversible fixes (`biome check --write`, never
// --unsafe). Logic-affecting smells (console.log, suppressions, skipped
// tests, TODO) are report-only so the auditor never drifts the code
// itself.
//
// Usage:
//   node scripts/audit-drift.mjs [--base <ref>] [--head <ref>]
//                                [--fix] [--run-checks] [--strict]
//                                [--history <ndjson>] [--pr-body-file <md>]
// Defaults: base=origin/main head=HEAD. Writes audit-report.md + stdout.
// Exit 0 always, unless --strict and a high-severity finding exists.
// --history appends one line per audited head to the longitudinal log
// (CI passes docs/audit-history.ndjson); --pr-body-file feeds a PR body
// for local runs. Pure logic lives in scripts/audit-lib.mjs (unit-tested).
// =====================================================================

import { execSync } from 'node:child_process';
import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { checkDeviationSection, hasHead, historyLine, learningsDistillDue } from './audit-lib.mjs';

const argv = process.argv.slice(2);
const opt = {
  base: val('--base') || process.env.AUDIT_BASE || 'origin/main',
  head: val('--head') || process.env.AUDIT_HEAD || 'HEAD',
  fix: argv.includes('--fix'),
  runChecks: argv.includes('--run-checks'),
  strict: argv.includes('--strict'),
  history: val('--history'), // CI: append one ndjson line per audited head
  prBodyFile: val('--pr-body-file'), // local runs: PR body markdown file
};

function val(flag) {
  const i = argv.indexOf(flag);
  return i !== -1 && argv[i + 1] ? argv[i + 1] : null;
}
function sh(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch {
    return '';
  }
}

const findings = [];
const add = (id, severity, confidence, title, detail, evidence = []) =>
  findings.push({ id, severity, confidence, title, detail, evidence });

// ---- resolve the commit range -------------------------------------------
const mergeBase = sh(`git merge-base ${opt.base} ${opt.head}`).trim() || opt.base;
const range = `${mergeBase}..${opt.head}`;

const nameStatus = sh(`git diff --name-status ${range}`)
  .trim()
  .split('\n')
  .filter(Boolean)
  .map((l) => {
    const [status, ...rest] = l.split('\t');
    return { status, path: rest.join('\t') };
  });
const changedPaths = nameStatus.map((f) => f.path);

const commitText = sh(`git log --format=%s%x00%b ${range}`).toLowerCase();
const prBodySource = opt.prBodyFile || '.audit/pr-body.md';
const prBody = (process.env.GITHUB_PR_BODY || readIf(prBodySource) || '').toLowerCase();
// the deviation check only runs when a body was actually provided — in
// Actions GITHUB_PR_BODY is SET even when empty (check fires, correct);
// a bodyless local run skips silently instead of nagging.
const bodyProvided = 'GITHUB_PR_BODY' in process.env || existsSync(prBodySource);
const claims = `${commitText}\n${prBody}`;

function readIf(p) {
  return existsSync(p) ? readFileSync(p, 'utf8') : '';
}

// ---- parse ADDED lines (unified=0, lockfile excluded) -------------------
const rawDiff = sh(`git diff --unified=0 ${range} -- . ":(exclude)package-lock.json"`);
const added = [];
{
  let file = null;
  let newLine = 0;
  for (const line of rawDiff.split('\n')) {
    if (line.startsWith('diff --git')) {
      file = null;
    } else if (line.startsWith('+++ b/')) {
      file = line.slice(6);
    } else if (line.startsWith('+++ ')) {
      file = null;
    } else {
      const m = line.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
      if (m) {
        newLine = parseInt(m[1], 10);
      } else if (line.startsWith('+') && !line.startsWith('+++')) {
        if (file) added.push({ file, line: newLine, text: line.slice(1) });
        newLine++;
      }
    }
  }
}

const isSrc = (p) => p?.startsWith('src/');
const isCode = (p) => p && /\.(ts|tsx|js|mjs)$/.test(p);
// Files allowed to contain the trigger strings (they implement the checks).
const inAudit = (p) =>
  p === 'scripts/audit-drift.mjs' || p === 'scripts/preflight.mjs' || p === 'verify.mjs';

// ---- checks --------------------------------------------------------------
function scan(id, re, predicate, sev, conf, title, detail) {
  const hits = added.filter((a) => predicate(a) && re.test(a.text));
  if (hits.length) {
    add(
      id,
      sev,
      conf,
      title,
      detail,
      hits.slice(0, 12).map((h) => `${h.file}:${h.line}  ${h.text.trim().slice(0, 100)}`),
    );
  }
}

// rule violations (Working Agreement). Suppression/TODO scans cover CODE
// files only — docs legitimately *mention* these strings (the ADRs and
// DRIFT-AUDIT.md describe the checks; a suppression in markdown isn't one).
scan(
  'lint-suppress',
  /eslint-disable|biome-ignore/,
  (a) => isCode(a.file) && !inAudit(a.file),
  'high',
  'high',
  'Lint suppression added',
  'New `biome-ignore`/`eslint-disable` — rules should be fixed, not silenced (Working Agreement #6).',
);
scan(
  'test-skip',
  /\b(xit|xdescribe)\s*\(|\.(skip|only)\s*\(/,
  () => true,
  'high',
  'medium',
  'Test skipped / focused',
  'A test was skipped or `.only`-focused — tests must not be gutted to pass (Working Agreement #6).',
);
scan(
  'todo-marker',
  /\b(TODO|FIXME|HACK|XXX)\b/,
  (a) => isCode(a.file) && !inAudit(a.file),
  'medium',
  'medium',
  'TODO/HACK marker added',
  'Unfinished-work marker introduced — confirm it is intended, not a shortcut.',
);
scan(
  'debug-stmt',
  /console\.log\(|^\s*debugger\s*;?\s*$/,
  (a) => isSrc(a.file),
  'medium',
  'high',
  'Debug statement in src/',
  'Stray `console.log`/`debugger` left in shipped code.',
);

// sensitive paths — gates, agent config, deps, build config, baselines.
const SENSITIVE_RE =
  /^\.github\/|^\.githooks\/|^\.claude\/|^tools\/scan_staged\.py$|^scripts\/(audit-(drift|lib)\.mjs|preflight\.mjs|mutation-probe\.mjs)$|(^|\/)package(-lock)?\.json$|^tsconfig[^/]*\.json$|^vite\.config\.ts$|^vitest\.config\.ts$|^verify\.mjs$|^biome\.json$|^biome-plugins\/|^\.gitattributes$|^SECURITY\.md$|^AGENTS\.md$|^test\/browser\/__screenshots__\//;
const sensitive = changedPaths.filter((p) => SENSITIVE_RE.test(p));
if (sensitive.length) {
  add(
    'sensitive-paths',
    'medium',
    'high',
    'Sensitive files changed',
    'Gates/CI/agent-config/deps/baselines changed — review intentionality and that it was logged.',
    sensitive,
  );
}

// code bloat / complexity ---------------------------------------------------
// AI-generated code tends to bloat and over-nest even when it passes tests.
// Deterministic diff heuristics — a language-agnostic complexity proxy.

// 1) Deep nesting: added src lines indented past ~8 levels (2-space style).
scan(
  'deep-nesting',
  /^ {16,}\S/,
  (a) => isSrc(a.file) && isCode(a.file),
  'low',
  'low',
  'Deep nesting added (complexity smell)',
  'Added code nested past ~8 levels — a cognitive-complexity smell; consider extracting helpers.',
);

// 2) Net code growth without accompanying tests. Path-scoped strictness
// (ADR-0004): src/lib is the tested core — growth there without test changes
// is a medium finding at a low threshold; prototypes are covered by
// visual/smoke tests, so only large growth fires, and only as a nag.
const numstat = sh(`git diff --numstat ${range} -- src`)
  .trim()
  .split('\n')
  .filter(Boolean)
  .map((l) => l.split('\t'))
  .filter(([, , p]) => isCode(p));
let srcAdded = 0;
let srcRemoved = 0;
let libNet = 0;
let protoNet = 0;
for (const [a, d, p] of numstat) {
  const net = (parseInt(a, 10) || 0) - (parseInt(d, 10) || 0);
  srcAdded += parseInt(a, 10) || 0;
  srcRemoved += parseInt(d, 10) || 0;
  if (p.startsWith('src/lib/')) libNet += net;
  else if (p.startsWith('src/prototypes/')) protoNet += net;
}
const srcNet = srcAdded - srcRemoved;
const testChanged = changedPaths.some((p) => p.startsWith('test/'));
if (libNet > 120 && !testChanged) {
  add(
    'growth-no-tests',
    'medium',
    'medium',
    'src/lib grew without tests',
    `src/lib grew by net ${libNet} lines with no test changes — the shared core must stay tested (ADR-0004).`,
    [],
  );
} else if (protoNet > 400 && !testChanged) {
  add(
    'growth-no-tests',
    'low',
    'low',
    'Large prototype growth without tests',
    `src/prototypes grew by net ${protoNet} lines with no test changes — check for logic that belongs in src/lib (tested).`,
    [],
  );
}

// documentation drift
const srcChanged = changedPaths.some(isSrc);
const learningsChanged = changedPaths.includes('docs/LEARNINGS.md');
if (srcChanged && !learningsChanged) {
  add(
    'learnings-stale',
    'low',
    'medium',
    'LEARNINGS not updated',
    'Source changed but `docs/LEARNINGS.md` was not touched — capture any decision/gotcha (Working Agreement #4).',
    [],
  );
}

// memory hygiene (Working Agreement #11): repo-state check, not a diff check —
// it nags on every PR while LEARNINGS.md stays over the limit, which is the
// point (the distillation pass itself is Scott-gated, see AGENTS.md).
const distill = learningsDistillDue(readIf('docs/LEARNINGS.md'));
if (distill) {
  add(
    'learnings-distill-due',
    'low',
    'high',
    'LEARNINGS.md due for distillation',
    `docs/LEARNINGS.md is ${distill.lines} lines (>500) — promote evergreen rules to GOLDEN_RULES.md and mark superseded entries historical (Working Agreement #11).`,
    [],
  );
}

// unlogged files (heuristic): changed file never named in commits/PR body.
// Exempt the audit's own bookkeeping (history file) and visual baselines —
// baselines are PNG sets named per test/browser/platform; they're already
// covered by the stronger sensitive-paths check.
const unlogged = changedPaths.filter((p) => {
  if (p === 'docs/audit-history.ndjson') return false;
  if (p.includes('__screenshots__/')) return false;
  const stem = p
    .split('/')
    .pop()
    .replace(/\.[^.]+$/, '')
    .toLowerCase();
  return stem.length > 2 && !claims.includes(stem) && !claims.includes(p.toLowerCase());
});
if (unlogged.length) {
  add(
    'unlogged-files',
    'low',
    'low',
    'Possibly unlogged changes',
    'These files are not referenced in any commit message or PR body (heuristic).',
    unlogged.slice(0, 20),
  );
}

// deviation surfacing (Working Agreement #10): the PR body must carry a
// "## Deviations from plan" section with explicit content ("None." is
// fine; an untouched template comment is not). Medium on purpose —
// --strict stays a logic gate, not a paperwork gate.
if (bodyProvided) {
  const dev = checkDeviationSection(prBody);
  if (dev) {
    add(
      'deviations-section',
      'medium',
      'high',
      'Deviations section missing/empty',
      dev.reason === 'missing'
        ? 'PR body has no "## Deviations from plan" section — required even if "None." (AGENTS.md Working Agreement #10).'
        : 'The "## Deviations from plan" section is empty — write "None." explicitly or list the deviations.',
      [],
    );
  }
}

// ---- optional: build/lint/typecheck health --------------------------------
let checks = '';
if (opt.runChecks) {
  const lint = trySh('npm run lint:ci');
  const typecheck = trySh('npm run typecheck');
  const build = trySh('npm run build');
  checks =
    '\n## Build, lint & typecheck\n' +
    `- lint (biome ci): ${lint.ok ? '✅ pass' : '‼️ FAIL'}\n` +
    `- typecheck (tsc): ${typecheck.ok ? '✅ pass' : '‼️ FAIL'}\n` +
    `- build (vite): ${build.ok ? '✅ pass' : '‼️ FAIL'}\n`;
  if (!lint.ok)
    add('lint-fail', 'high', 'high', 'Lint failing', '`npm run lint:ci` failed on this PR.', []);
  if (!typecheck.ok)
    add(
      'typecheck-fail',
      'high',
      'high',
      'Typecheck failing',
      '`npm run typecheck` (tsc --noEmit) failed on this PR (ADR-0002).',
      [],
    );
  if (!build.ok)
    add('build-fail', 'high', 'high', 'Build failing', '`npm run build` failed on this PR.', []);
}
function trySh(cmd) {
  try {
    execSync(cmd, { stdio: 'ignore' });
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

// ---- optional: safe auto-fixes -------------------------------------------
// The auto-fix class is `biome check --write` (safe fixes only) and NOTHING
// else; it never expands autonomously (ADR-0007 invariant 2).
let fixNote = '';
let autofixDirty = false; // hoisted: the history line records it, and must
// be computed BEFORE the history append dirties the tree itself
if (opt.fix) {
  sh('npx biome check --write . > /dev/null 2>&1');
  const dirty = sh('git status --porcelain').trim();
  autofixDirty = Boolean(dirty);
  fixNote = dirty
    ? `\n## Auto-fixes applied\nSafe formatting/lint fixes (biome check --write) were applied:\n\n\`\`\`\n${dirty}\n\`\`\`\n`
    : '\n## Auto-fixes applied\nNone needed — formatting and lint were already clean.\n';
}

// ---- optional: longitudinal history (CI only) -----------------------------
// One ndjson line per audited head; dedupe makes workflow re-runs
// idempotent. Findings are diff-range based, so they're pre-autofix by
// construction. The workflow's existing commit step persists the file.
if (opt.history) {
  const headSha = sh(`git rev-parse ${opt.head}`).trim();
  if (headSha && !hasHead(readIf(opt.history), headSha)) {
    appendFileSync(
      opt.history,
      historyLine({
        ts: new Date().toISOString(),
        base: mergeBase,
        head: headSha,
        pr: Number(process.env.GITHUB_PR_NUMBER) || null,
        findings,
        srcNet,
        autofixed: opt.fix && autofixDirty,
      }),
    );
  }
}

// ---- report --------------------------------------------------------------
const order = { high: 0, medium: 1, low: 2 };
findings.sort((a, b) => order[a.severity] - order[b.severity]);
const emoji = { high: '🔴', medium: '🟠', low: '🟡' };
const highCount = findings.filter((f) => f.severity === 'high').length;

let md = '## 🔍 Drift Audit\n\n';
md += `Range \`${range}\` · ${changedPaths.length} file(s) changed · `;
md += findings.length
  ? `**${findings.length} finding(s)** (${highCount} high)\n`
  : '**no drift detected** ✅\n';

if (findings.length) {
  md += '\n| | Finding | Severity | Confidence | Evidence |\n|---|---|---|---|---|\n';
  for (const f of findings) {
    const ev = f.evidence.length ? f.evidence.map((e) => `\`${e}\``).join('<br>') : f.detail;
    md += `| ${emoji[f.severity]} | **${f.title}** | ${f.severity} | ${f.confidence} | ${ev} |\n`;
  }
  md += '\n_Details:_\n';
  for (const f of findings) md += `- **${f.title}** (\`${f.id}\`) — ${f.detail}\n`;
}
md += checks + fixNote;
md += `\n## Code size\n- \`src/\` net change this range: **${srcNet >= 0 ? '+' : ''}${srcNet}** lines (+${srcAdded}/-${srcRemoved}; lib ${libNet >= 0 ? '+' : ''}${libNet}, prototypes ${protoNet >= 0 ? '+' : ''}${protoNet})\n`;
md +=
  '\n<sub>Generated by `scripts/audit-drift.mjs` — deterministic, no API key. Semantic claim-vs-code review happens in the pre-push preflight (see docs/DRIFT-AUDIT.md, ADR-0007).</sub>\n';

writeFileSync('audit-report.md', md);
process.stdout.write(`${md}\n`);

if (opt.strict && highCount > 0) process.exit(1);
