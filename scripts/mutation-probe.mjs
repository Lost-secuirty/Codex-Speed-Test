#!/usr/bin/env node
// =====================================================================
// mutation-probe.mjs — does the unit suite actually catch bugs?
//
// Ported from demo-math. Injects small, deliberate faults into the pure
// src/lib modules, runs the unit suite against each mutant in an
// isolated temp copy, and reports a mutation score:
//   KILLED   = the suite failed on the mutant (good — tests have teeth)
//   SURVIVED = the suite still passed (blind spot — add/strengthen a test)
//   SKIPPED  = the target source text was not found
//
// Only the *unit* project runs against mutants — the browser project
// needs Chromium and snapshots, which a logic mutant shouldn't touch.
// Standalone (not part of `npm test`) so the inner loop stays fast; the
// preflight and CI gate on it. The working tree is never mutated — every
// run happens in a temp dir with node_modules symlinked.
// =====================================================================

import { spawnSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const REPO = process.cwd();
// The temp copy must include every file the unit suite imports, or vitest
// errors on the baseline run and the probe fails (config FILES must be
// copied; node_modules is symlinked).
const COPY = [
  'src',
  'test',
  'scripts',
  'biome.json',
  'biome-plugins',
  'package.json',
  'tsconfig.json',
  'tsconfig.node.json',
  'vite.config.ts',
  'vitest.config.ts',
];

// Each mutation: a single targeted source edit that SHOULD break a test.
// Targets live in src/lib (the tested core — ADR-0004).
const MUTATIONS = [
  {
    name: 'reel-math: strip wraps to a fixed index instead of modulo',
    file: 'src/lib/reels/reel-math.ts',
    find: 'return ((index % count) + count) % count;',
    replace: 'return 0;',
  },
  {
    name: 'reel-math: spin distance ignores the extra turns',
    file: 'src/lib/reels/reel-math.ts',
    find: 'const distance = turns * count + delta;',
    replace: 'const distance = delta;',
  },
  {
    name: 'reel-math: settle duration loses the per-reel stagger',
    file: 'src/lib/reels/reel-math.ts',
    find: 'return base + reelIndex * stagger;',
    replace: 'return base;',
  },
  {
    name: 'reel-math: cell offset drops the symbol gap',
    file: 'src/lib/reels/reel-math.ts',
    find: 'return index * (cellHeight + gap);',
    replace: 'return index * cellHeight;',
  },
  {
    name: 'storage: reads stop parsing JSON (returns raw string)',
    file: 'src/lib/storage.ts',
    find: 'return JSON.parse(raw) as T;',
    replace: 'return raw as unknown as T;',
  },
  {
    // NOT `throw` here — a throw inside the try lands in the catch and
    // returns the same fallback (equivalent mutant; caught at scaffold
    // time, docs/LEARNINGS.md 2026-06-12). Skipping the null-guard makes
    // JSON.parse(null) return null instead of the fallback — observable.
    name: 'storage: missing-key guard skipped (parses null)',
    file: 'src/lib/storage.ts',
    find: 'if (raw === null) return fallback;',
    replace: 'if (false) return fallback;',
  },
  // --- SPOKEY: LIGHTS OUT pure modules (PR1) ---
  {
    name: 'rng: randInt rounds up (escapes the [0,n) bound)',
    file: 'src/lib/rng.ts',
    find: 'return Math.floor(rng() * n);',
    replace: 'return Math.ceil(rng() * n);',
  },
  {
    name: 'spokey ways: a reel gap no longer stops the ways count',
    file: 'src/prototypes/spokey-lights-out/ways.ts',
    find: 'if (c === 0) break;',
    replace: 'if (c === 0) continue;',
  },
  {
    name: 'spokey ways: ways adds per-reel counts instead of multiplying',
    file: 'src/prototypes/spokey-lights-out/ways.ts',
    find: 'ways *= c;',
    replace: 'ways += c;',
  },
  {
    name: 'spokey ways: pays below the minimum reel span',
    file: 'src/prototypes/spokey-lights-out/ways.ts',
    find: 'if (reels < MIN_REELS) continue;',
    replace: 'if (reels < 0) continue;',
  },
  {
    name: 'spokey visibility: falloff inverted (dark center, bright edge)',
    file: 'src/prototypes/spokey-lights-out/visibility.ts',
    find: 'return 1 - dist / radius;',
    replace: 'return dist / radius;',
  },
  {
    name: 'spokey visibility: ambient floor dropped (pure black dark frame)',
    file: 'src/prototypes/spokey-lights-out/visibility.ts',
    find: 'let light = ambient;',
    replace: 'let light = 0;',
  },
  {
    name: 'spokey resolver: reel-stop stagger lost',
    file: 'src/prototypes/spokey-lights-out/resolver.ts',
    find: '(p.reelDurationMs + r * p.reelStaggerMs) * drag',
    replace: 'p.reelDurationMs * drag',
  },
  // --- SPOKEY: LIGHTS OUT feature modules (PR2) ---
  // Added after the meta-audit flagged ZERO mutants on any PR2 module — the
  // 100% score was vacuous for everything PR2 shipped (docs/LEARNINGS.md
  // 2026-06-12). A new pure module is not "mutation-probed" until it has its
  // own mutant; the score is per-target, not per-repo.
  {
    name: 'holdwin: respin counter increments instead of decrements (no-new path)',
    file: 'src/prototypes/spokey-lights-out/holdwin.ts',
    find: 'fresh.length > 0 ? respins : state.respinsLeft - 1',
    replace: 'fresh.length > 0 ? respins : state.respinsLeft + 1',
  },
  {
    name: 'holdwin: dedupe inverted — already-held cells lock again',
    file: 'src/prototypes/spokey-lights-out/holdwin.ts',
    find: 'const fresh = landed.filter((t) => !held.has(t.index));',
    replace: 'const fresh = landed.filter((t) => held.has(t.index));',
  },
  {
    name: 'holdwin: isComplete off-by-one (respinsLeft < 0 instead of <= 0)',
    file: 'src/prototypes/spokey-lights-out/holdwin.ts',
    find: 'return state.respinsLeft <= 0 || isJackpot(state);',
    replace: 'return state.respinsLeft < 0 || isJackpot(state);',
  },
  {
    name: 'holdwin: jackpot off-by-one (> instead of >= boardSize)',
    file: 'src/prototypes/spokey-lights-out/holdwin.ts',
    find: 'return state.tiles.length >= state.boardSize;',
    replace: 'return state.tiles.length > state.boardSize;',
  },
  {
    name: 'holdwin: holdTotal subtracts instead of summing',
    file: 'src/prototypes/spokey-lights-out/holdwin.ts',
    find: 'reduce((sum, t) => sum + t.value, 0)',
    replace: 'reduce((sum, t) => sum - t.value, 0)',
  },
  {
    name: 'holdwin: lockableCells matches NON-hold symbols (predicate inverted)',
    file: 'src/prototypes/spokey-lights-out/holdwin.ts',
    find: "if (holdSymbols.includes(col[row] ?? '')) out.push(cellIndex(reel, row, rows));",
    replace: "if (!holdSymbols.includes(col[row] ?? '')) out.push(cellIndex(reel, row, rows));",
  },
  {
    name: 'holdwin: cellCoord uses ceil — breaks the index inverse',
    file: 'src/prototypes/spokey-lights-out/holdwin.ts',
    find: 'return { reel: Math.floor(index / rows), row: index % rows };',
    replace: 'return { reel: Math.ceil(index / rows), row: index % rows };',
  },
  {
    name: 'proximity: step multiplies instead of dividing',
    file: 'src/prototypes/spokey-lights-out/proximity.ts',
    find: 'return sightingCount / stepsToArrive;',
    replace: 'return sightingCount * stepsToArrive;',
  },
  {
    name: 'proximity: advance subtracts the step (figure retreats)',
    file: 'src/prototypes/spokey-lights-out/proximity.ts',
    find: 'return clamp01(current + step);',
    replace: 'return clamp01(current - step);',
  },
  {
    name: 'proximity: arrival off-by-one (> instead of >= ARRIVE)',
    file: 'src/prototypes/spokey-lights-out/proximity.ts',
    find: 'return proximity >= ARRIVE;',
    replace: 'return proximity > ARRIVE;',
  },
  {
    name: 'reveal: hidden tile shown when NOT swept (condition inverted)',
    file: 'src/prototypes/spokey-lights-out/reveal.ts',
    find: 'if (hidden && !revealed) return null;',
    replace: 'if (hidden && revealed) return null;',
  },
  {
    name: 'reveal: visibleTotal accrual off-by-one (<= leaks the next tile)',
    file: 'src/prototypes/spokey-lights-out/reveal.ts',
    find: 'i < revealedCount && i < ordered.length',
    replace: 'i <= revealedCount && i < ordered.length',
  },
  {
    name: 'reveal: sweep order reversed (descending instead of reading order)',
    file: 'src/prototypes/spokey-lights-out/reveal.ts',
    find: '[...tiles].sort((a, b) => a.index - b.index)',
    replace: '[...tiles].sort((a, b) => b.index - a.index)',
  },
  {
    name: 'resolveFeature: jackpot/win settle cues swapped',
    file: 'src/prototypes/spokey-lights-out/resolver.ts',
    find: "cue: jackpot ? 'jackpot' : 'win-celebrate',",
    replace: "cue: jackpot ? 'win-celebrate' : 'jackpot',",
  },
  {
    name: 'resolveFeature: respin loop never runs (cap mutated to < 0)',
    file: 'src/prototypes/spokey-lights-out/resolver.ts',
    find: '!isComplete(state) && respins < p.maxRespins',
    replace: '!isComplete(state) && respins < 0',
  },
  // --- SPOKEY audio pure layer (PR3, ADR-0015) — every law gets a mutant ---
  {
    name: 'audio: the startle gate stops clamping (attack floor dropped)',
    file: 'src/lib/audio/cue-model.ts',
    find: 'return attackMs < floor ? floor : attackMs;',
    replace: 'return attackMs;',
  },
  {
    name: 'audio: win gain RISES with proximity (dread inverted)',
    file: 'src/lib/audio/cue-model.ts',
    find: 'return 1 - (1 - f) * p;',
    replace: 'return f + (1 - f) * p;',
  },
  {
    name: 'audio: swarm voice cap dropped (CPU budget unbounded)',
    file: 'src/lib/audio/cue-model.ts',
    find: 'return wanted > cap ? cap : Math.floor(wanted);',
    replace: 'return Math.floor(wanted);',
  },
  {
    name: 'audio: LDW threshold inclusive (at-threshold win flagged ldw)',
    file: 'src/lib/audio/cue-model.ts',
    find: "if (total < ldwThreshold) return honest ? 'ldw-honest' : 'ldw';",
    replace: "if (total <= ldwThreshold) return honest ? 'ldw-honest' : 'ldw';",
  },
  {
    name: 'audio: shepard window inverted (loud edges, silent center)',
    file: 'src/lib/audio/cue-model.ts',
    find: 'return 0.5 - 0.5 * Math.cos(2 * Math.PI * p);',
    replace: 'return 0.5 + 0.5 * Math.cos(2 * Math.PI * p);',
  },
  {
    name: 'audio: arousal curve collapses at approach (0.8 → 0.3)',
    file: 'src/lib/audio/cue-model.ts',
    find: 'approach: 0.8,',
    replace: 'approach: 0.3,',
  },
  {
    name: 'spokey cues: the trigger becomes a bright fanfare (arp, not cut-swell)',
    file: 'src/prototypes/spokey-lights-out/cues.ts',
    find: "kind: 'cut-swell',\n    freq: 66,",
    replace: "kind: 'arp',\n    freq: 66,",
  },
  {
    name: 'spokey resolver: LDW params ignored at settle',
    file: 'src/prototypes/spokey-lights-out/resolver.ts',
    find: 'cue: settleCue(total, p.ldwThreshold ?? 0, p.ldwHonest ?? false),',
    replace: 'cue: settleCue(total, 0, false),',
  },
];

function makeTemp() {
  const dir = mkdtempSync(join(tmpdir(), 'cst-mut-'));
  for (const item of COPY) cpSync(join(REPO, item), join(dir, item), { recursive: true });
  symlinkSync(
    join(REPO, 'node_modules'),
    join(dir, 'node_modules'),
    process.platform === 'win32' ? 'junction' : 'dir',
  );
  return dir;
}

function runSuite(dir) {
  const bin = join(dir, 'node_modules', 'vitest', 'vitest.mjs');
  const res = spawnSync(process.execPath, [bin, 'run', '--project', 'unit'], {
    cwd: dir,
    encoding: 'utf8',
    timeout: 180000,
  });
  return {
    status: res.status,
    stdout: res.stdout || '',
    stderr: res.stderr || '',
    error: res.error,
  };
}

function run() {
  console.log('MUTATION PROBE — proving the unit suite catches injected bugs\n');

  const baseDir = makeTemp();
  let baseStatus;
  try {
    baseStatus = runSuite(baseDir);
  } finally {
    rmSync(baseDir, { recursive: true, force: true });
  }
  if (baseStatus.status !== 0) {
    console.error('BASELINE FAILED: the clean unit suite does not pass. Fix tests first.');
    if (baseStatus.error) console.error(baseStatus.error);
    if (baseStatus.stdout) console.error(baseStatus.stdout);
    if (baseStatus.stderr) console.error(baseStatus.stderr);
    process.exit(1);
  }
  console.log('Baseline (clean unit suite) passed.\n');

  let killed = 0;
  let survived = 0;
  let skipped = 0;
  const survivors = [];

  MUTATIONS.forEach((m, i) => {
    const dir = makeTemp();
    try {
      const path = join(dir, m.file);
      if (!existsSync(path)) {
        skipped++;
        console.log(`${String(i + 1).padStart(2)}. SKIPPED  | ${m.name} (file missing)`);
        return;
      }
      const source = readFileSync(path, 'utf8');
      if (!source.includes(m.find)) {
        skipped++;
        console.log(`${String(i + 1).padStart(2)}. SKIPPED  | ${m.name}`);
        return;
      }
      writeFileSync(path, source.replace(m.find, m.replace));
      const result = runSuite(dir);
      if (result.status !== 0) {
        killed++;
        console.log(`${String(i + 1).padStart(2)}. KILLED   | ${m.name}`);
      } else {
        survived++;
        survivors.push(m.name);
        console.log(`${String(i + 1).padStart(2)}. SURVIVED | ${m.name}`);
      }
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  const executable = MUTATIONS.length - skipped;
  console.log('\n--- SUMMARY ---');
  console.log(
    `Total: ${MUTATIONS.length}  Killed: ${killed}  Survived: ${survived}  Skipped: ${skipped}`,
  );
  console.log(`Mutation score: ${executable ? ((killed / executable) * 100).toFixed(1) : 'n/a'}%`);
  if (survivors.length) {
    console.log('\nSURVIVED (test blind spots — add a test):');
    for (const s of survivors) console.log(`- ${s}`);
    process.exit(1);
  }
  if (skipped) {
    // A skipped mutant means its target string moved — left silent, the
    // probe decays toward all-SKIPPED while staying green (silent failure,
    // caught in the PR #1 review; LEARNINGS 2026-06-12). Repointing the
    // find strings is part of the refactor that moved them.
    console.log('\nFAIL: skipped mutants — the targets moved; repoint the find strings (drift).');
    process.exit(1);
  }
}

run();
