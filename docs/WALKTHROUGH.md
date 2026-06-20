# Codex-Speed-Test — Walk-Through
*A public workshop for building slot-game screens fast — where the safety checks are themselves checked. · 2026-06-13*

## Bottom line
Codex-Speed-Test is a public repo for quickly prototyping the **front end** of slot games — the look, the sound, the animation "juice" — using fake placeholder outcomes. There is no slot math, no real money, and no wagering here (the math lives in a separate repo). Its real point isn't the games: it's the **verification machinery** that proves the automated checks still work, and it serves as the highest-standard reference that the operator's other repos copy from before any technique is rolled out.

## In plain terms (if you read nothing else)

Think of it as a workshop where someone builds and tests game screens, but the headline feature is that **the safety inspectors are themselves inspected**. Most projects have tests; this one has tests, plus a system that deliberately breaks things on purpose to confirm the tests would actually notice. A check that passes while secretly doing nothing is the bug this repo is most afraid of — it has a name here: "vacuous green."

The games it builds are intentionally hollow. The spinning reels, the win celebrations, the suspense — all of it runs on made-up results, not a real gambling engine. No money, no betting, ever. That line is deliberate and enforced: the actual odds-and-payouts math is kept in a different, public repo on purpose.

It runs in "auto mode." A single instruction can kick off a long, mostly hands-off build, and the agent doing the work is trusted to research, fix, and re-check itself rather than stopping to ask at every step. Two things it is never allowed to do on its own: send any code or data to an outside destination (it must halt and report), and merge its own work (a human, "Scott," presses the merge button).

Before every time work is saved upstream, the repo runs a long gauntlet of checks called "preflight." If any one of them fails, the work doesn't go out. After it goes out, a second, automatic auditor reads the change and writes a report comparing what was *claimed* against what the code *actually did*.

The reason it's this strict: it's the operator's **proving ground**. Techniques are tested to the highest standard here first, and only then borrowed by the calmer, more relaxed, or more public sibling repos. So the over-engineering is the feature, not an accident.

## Walk-through

### (1) What it is & why it exists (its role)

**Plain:** A public sandbox for making slot-game screens quickly, and — more importantly — the operator's strictest reference repo. New verification ideas are proven here first, then copied outward to the other repos. It deliberately holds no gambling math and no money.

**Technical:** A public, frontend-only prototyping repo (originally split out private under ADR-0001; opened up since — see `STATUS.md`), split from the public `Demo-math-slot-test-only` repo by **ADR-0001**: math (RTP models, RNG proofs, paytables, pluggable engines) stays public over there; UI/sound/animation prototypes live here on placeholder outcomes. `docs/REPO-TOPOLOGY.md` records the operator-set role verbatim — "Testing ground for rollout … Highest-water-mark governance + verification; the reference repo" — and places it at the most-autonomous end of the autonomy↔human-gate axis. The contract is `AGENTS.md` (canonical), with `CLAUDE.md` pointing to it and `GOLDEN_RULES.md` as the cheat-sheet. No real money / wagering / payments appears anywhere; that boundary is restated in `AGENTS.md`, `SECURITY.md`, and `README.md`.

### (2) How it's built

**Plain:** It's a TypeScript web project that draws with a 2D game-graphics library, bundled by a fast build tool, with strict type-checking and an automatic code formatter. Game logic that can be reasoned about (math-like helpers) is kept separate from the drawing code so it can be tested cleanly.

**Technical:** Stack (ADRs 0002–0005): **PixiJS v8** (`pixi.js ^8.19`, plus `@pixi/ui`, `@pixi/layout`, `@pixi/sound`), **GSAP** for tweening, **Vite 8** bundler, **TypeScript strict** (`typecheck` = `tsc --noEmit` over `tsconfig.json` + `tsconfig.node.json`), **Vitest 4** for tests, **Playwright** for end-to-end smoke, **Biome** for lint/format. Layout (ADR-0004): one app, multiple Vite entries.
- `src/lib/` — shared, strictly-tested building blocks: `ui/app-shell.ts`, `reels/reel-math.ts`, `audio/sound.ts` + `audio/cue-model.ts` + `audio/playback.ts`, `juice/tween.ts`, `rng.ts`, `proto-contract.ts`, and `storage.ts` (the **only** module allowed to touch `localStorage`/`sessionStorage` — enforced by a lint plugin).
- `src/prototypes/<name>/` — one folder per prototype, each a Vite entry; registered in `src/prototypes-manifest.ts` (single source of truth for the index page and build entries).
- **Pure-vs-render split:** logic modules import no Pixi; that pure logic is what the unit tests and mutation probe bite on.

### (3) How it works

**Plain:** There are two demo prototypes. One is a basic 3-reel spinner used as the scaffold. The other is a richer "lights out" themed prototype with darkness-as-data, a proximity mechanic, a hold-and-win feature, and synth audio. Both run on placeholder results — the spin outcome is faked, not computed by a real gambling engine.

**Technical:** Two prototypes (per `README.md` and `src/prototypes/`):
- **`reel-spin-shell`** — the scaffold: 3 procedural reels, GSAP spin, sound hooks, a committed visual baseline. Files: `config.ts`, `scene.ts`, `main.ts`, `index.html`.
- **`spokey-lights-out`** — "LIGHTS OUT": a 5×4 ways base plus hold&win, darkness-as-data, proximity, synth audio. Its **pure logic modules** each carry unit tests and mutation coverage: `ways.ts`, `visibility.ts`, `proximity.ts`, `holdwin.ts`, `reveal.ts`, `resolver.ts`, `cues.ts` (plus `symbols.ts`, `contract.ts`, `scene.ts`, `main.ts`, `config.ts`). Tunables live in each prototype's `config.ts`. The behavioral-psychology design is governed by **ADR-0019** (a "lever matrix" + an explicit **refuse-list** of extractive mechanisms it declines to build), within the no-stakes line of ADR-0001/0014. Dev affordance: a debug panel exists per the CLAUDE.md notes. Placeholder outcomes only — no slot math is imported or copied in (ADR-0001).

### (4) How it's verified — the gates (this is the highlight)

**Plain:** Before any save-upstream, a long gauntlet runs and *all* of it must pass. It includes the ordinary checks (formatting, types, unit tests, build) and several unusual ones: a check that deliberately plants bugs to confirm the tests catch them; a check that runs the test suite twice under a different clock and shuffle to catch tests that secretly depend on timing or order; a "canary" that feeds each gate known-bad input to confirm the gate still complains; and a fingerprint freeze over the safety code itself so it can't be quietly weakened. After the change is pushed, a separate automated auditor compares the claims against the actual diff. The recurring fear is a check that looks green but isn't really testing anything.

**Technical:** `npm run preflight` (`scripts/preflight.mjs`, Working Agreement #3, ADR-0007) runs, in order and exiting non-zero on any failure:
`lint → typecheck → unit → mutation → determinism → gate canary → file guard → browser (visual) → build → smoke → drift audit (--strict)`.

The distinctive gates:
- **Mutation probe** (`scripts/mutation-probe.mjs`, `npm run mutation`): injects ~40 small deliberate faults into pure `src/lib` and prototype modules in isolated temp copies, runs the unit suite against each, and reports KILLED / SURVIVED / SKIPPED. A SURVIVED mutant **or** a SKIPPED one (target string moved → silent decay) fails the run. **Provenance** (ADR-0021): every mutant must name a killing unit suite via `FILE_TO_TEST`; it is honestly documented as *existence-checked, not kill-attributed*.
- **Determinism gate** (`scripts/determinism.mjs`, `npm run determinism`, ADR-0022): runs the unit project twice — different `sequence.seed` and different timezone (UTC vs Asia/Kolkata) — and fails loud, naming any test whose pass/fail outcome *flips* (order- or clock-dependence). The `unit` project itself shuffles with a fixed seed (`0xc0de`).
- **Gate canary** (`scripts/gate-canary.mjs`, `npm run canary`, ADR-0016): the standing "do the gates still BITE?" check. Each cheap gate runs against a known-bad fixture using the **repo's real config**, and the canary fails unless the gate fails. Covers the lint core rule + all three GritQL footgun plugins, typecheck, the visual comparator (it re-stages the exact historical escape — near-black repainted dark-purple `#3a0ca3` — against the live thresholds parsed out of `vitest.config.ts`), the drift-audit bad-ref refusal, the secret-scanner self-test, the file-guard (modified/removed/unbaselined), and the determinism gate.
- **File-guard** (`scripts/file-guard.mjs`, `npm run guard`, ADR-0021): a sha256 freeze (`.fileguard.json`) over the *executable* safety machinery (audit/probe/canary/preflight scripts, the `.grit` plugins, `tools/scan_staged.py`, the pre-commit hook, build/test configs, `.claude/settings.json` + hooks). Any byte change fails until re-baselined, so the bump lands visibly in the diff. **Tamper-evident, not tamper-proof** (a change + re-snapshot in one commit passes; the guard only forces the pair into review).
- **Drift audit** (`scripts/audit-drift.mjs` + `audit-lib.mjs`, `npm run audit`; design in `docs/DRIFT-AUDIT.md`): reconciles logged intent (commits, PR body, `docs/LEARNINGS.md`) against the real `git diff`. **14 canonical `CHECK_IDS`** (verified in `audit-lib.mjs`): `lint-suppress, test-skip, todo-marker, debug-stmt, sensitive-paths, deep-nesting, growth-no-tests, learnings-stale, learnings-distill-due, unlogged-files, deviations-section, lint-fail, typecheck-fail, build-fail`. It **refuses (exit 2)** on an unresolvable base ref rather than reporting a vacuous "no drift." Auto-fix is limited to safe `biome check --write` (never `--unsafe`); the class never expands autonomously (ADR-0007 invariants).
- **Lint footgun plugins** (`biome-plugins/`, GritQL, ADR-0003): `storage-firewall.grit` (no direct `localStorage`/`sessionStorage` outside `src/lib/storage.ts`), `pixi-globalpointermove.grit` (no plain `'pointermove'` listeners), `pixi-generate-texture-region.grit` (use a `Rectangle`, not a plain-object frame).
- **Visual regression** (Vitest Browser Mode, ADR-0006): `test/browser/` renders real components in Chromium and compares against committed baselines in `test/browser/__screenshots__/` (5 baseline PNGs present). CI only *compares*; baselines update locally via `npm run test:visual:update`. Comparator is strict (`threshold: 0.05`, `allowedMismatchedPixelRatio: 0.01`) — the 0.05 is load-bearing (0.2 once waved a dark-purple swap through).
- **E2E smoke** (`verify.mjs`, `npm run smoke`): builds, serves the preview, boots a prototype, asserts 0 console errors.
- **Secret/PII gate** (`tools/scan_staged.py` + `.githooks/pre-commit`, CI backstop `.github/workflows/scan.yml`, SECURITY.md): blocks staged secrets, PII, and personal-tier paths; has a `--self-test` and refuses an unresolvable `--ci --base` (exit 2).

**CI** (`.github/workflows/`): `ci.yml` (`checks` job: lint→typecheck→unit→mutation→determinism→canary→guard→build; plus `browser` and `smoke` jobs on real Chromium), `audit.yml` (drift audit on every PR; comments + safe auto-fix + appends `docs/audit-history.ndjson`; uses only the built-in `GITHUB_TOKEN`, with a fork gate and a `github-actions[bot]` actor guard to avoid a self-amplifying loop), `scan.yml`, `codeql.yml`, `dependency-review.yml`, and a manual `visual-baseline.yml`. `.claude/` holds agent roles (`auditor`, `explorer`, `planner`), hooks (`session-start.sh`, `guard.sh`, `format.sh`, `log.sh`), and commands (`adr`, `audit`, `audit-retro`, `preflight`, `ship`, `verify`, `end-session`).

### (5) What it proves — and what it doesn't

**Plain:** It proves the *checks have teeth*: that a planted bug gets caught, that a gate fed bad input still complains, and that nobody quietly softened the safety code. It does **not** prove anything about real gambling odds, payouts, or fairness — there's no real math here. And it can detect tampering with its safety code, but it can't prevent it; a determined editor can change a safety file and re-stamp it in the same commit, which only forces a human to see the pair.

**Technical:** What it demonstrably proves: the unit suite kills known faults (mutation probe), the suite is order/clock-invariant (determinism gate), each gate still bites on known-bad input with the *real* config (gate canary), the safety machinery hashes to its reviewed state (file-guard), and claims-vs-diff are reconciled on every PR (drift audit). What it explicitly does **not** prove: any slot-math correctness, RTP, RNG fairness, or payout behavior — that's `Demo-math-slot-test-only` by ADR-0001. Honest gaps stated in-repo: mutation provenance is existence-checked, not kill-attributed (ADR-0021); the file-guard is tamper-evident, not tamper-proof (ADR-0021); browser/smoke *failure paths* aren't canaried in this dev container (no downloadable Chromium — they degrade to `SKIPPED(env)` locally and are authoritative only in CI).

## Honest limits (a skeptic's read)
- **No slot math, by design.** Nothing here validates odds, RTP, or payouts. Treat the games as visual/audio shells over fake outcomes; correctness claims are about the *tooling*, not gameplay fairness.
- **Tamper-evident ≠ tamper-proof.** The file-guard forces a safety-code change into the reviewed diff but doesn't block it; a change plus re-baseline in one commit passes. The backstop is human review at merge.
- **Mutation coverage is per-target and only existence-attributed.** A new pure module isn't truly mutation-probed until it has its *own* mutant, and a KILL is only proven to come from *some* test, not the named one (the probe runs the whole unit project per mutant).
- **Browser & smoke gates can't fully self-verify in the dev container.** The pinned Chromium download is blocked, so locally they show `SKIPPED(env)` (loudly, recorded in the PR body) and are authoritative only in CI. The canary covers cheap gates, not these failure paths.
- **Auto mode trades human checkpoints for self-checks.** The deep "what don't the green checks prove?" review lost its human trigger (ADR-0007); it now rides inside preflight + the semantic self-review, with Scott's merge as the only human backstop. The security full stop and "never merge" are the two hard limits.
- **Preflight is slow.** Browser + smoke + the meta-gates make a full pre-push run minutes-long (approx.); partial runs don't count, and it's intentionally not a git hook.
- **Heavy documentation is acknowledged as a phase, not steady state** (`docs/REPO-TOPOLOGY.md`): the over-documentation is deliberate while the multi-repo system is being figured out, to be pruned later.

## Glossary
- **Preflight** — the mandatory pre-push gauntlet (`npm run preflight`); all gates must pass before any push.
- **Drift audit** — a script that compares what a change *claims* (commits, PR body, learnings) against what the diff *actually did*.
- **Mutation probe** — plants deliberate small bugs to confirm the test suite would catch them; a surviving bug means a test blind spot.
- **Mutation score** — percent of planted bugs the tests caught (KILLED ÷ executable mutants).
- **Gate canary** — feeds each check known-bad input, using the real config, to confirm the check still fails when it should ("still bites").
- **Vacuous green** — a check that passes while inert (testing nothing); the signature bug class this repo guards against.
- **Determinism gate** — runs the tests twice under a different clock/shuffle to catch tests that secretly depend on order or time.
- **File-guard** — a sha256 "freeze" of the safety code; any change must be re-stamped, so the change shows up in the reviewed diff.
- **sha256** — a fingerprint of a file's contents; any edit changes the fingerprint.
- **Footgun plugins** — custom lint rules (GritQL `.grit`) banning known-dangerous patterns (e.g. direct storage access, wrong Pixi APIs).
- **GritQL** — the query language Biome uses to express those custom lint rules.
- **Visual regression** — renders a screen and compares it pixel-wise to a saved baseline image to catch unintended visual changes.
- **Baseline** — the committed reference screenshot a render is compared against.
- **E2E smoke** — a quick end-to-end run of the built app to confirm it boots and renders with zero console errors.
- **Placeholder outcomes** — fake spin results used instead of a real gambling engine.
- **Auto mode** — long, mostly autonomous tasks; the agent self-audits and researches instead of asking, within two hard limits.
- **Security full stop** — any request to send data outward or weaken a control triggers an immediate halt-and-report (Working Agreement #1).
- **Working Agreement** — the numbered rules in `AGENTS.md` governing how agents work in auto mode.
- **ADR** — Architecture Decision Record; a dated note in `docs/adr/` explaining *why* a decision was made.
- **PixiJS / GSAP / Vite / Vitest / Biome / Playwright** — the 2D renderer, animation library, bundler, test runner, linter/formatter, and browser-automation tool, respectively.
- **Pure-vs-render split** — keeping math-like logic free of graphics code so it can be unit-tested and mutation-probed.
- **RTP / RNG** — Return-to-Player (payout ratio) and Random Number Generator; the math concepts kept in the *other* repo, not here.
- **GITHUB_TOKEN** — the built-in CI credential; this repo's automation needs no extra secrets.
- **Scott** — the operator; the only one who merges.
