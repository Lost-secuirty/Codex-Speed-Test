# LEARNINGS

Append-only log of gotchas, fixes, and API surprises. **Newest at top, dated.**
Grep this for the module you're about to edit (Working Agreement #11). When it
exceeds ~500 lines the `learnings-distill-due` audit check nags — distill
evergreen rules into `GOLDEN_RULES.md` via a Scott-reviewed PR.

## 2026-06-12

- **SPOKEY PR2 presenter shipped — the feature is playable.** `scene.ts` gained
  the LIGHTS OUT path: the board converts to a collectibles respin grid
  (ADR-0017), value tiles lock in (font-free seven-seg badges), the flashlight
  sweep reveals values (the `hiddenValues` A/B — covered vs shown), and it settles
  or blacks out on a jackpot. Proximity is wired (ADR-0012): each base spin
  advances the figure and arms the feature for the NEXT spin — never the current
  one, so the first spin is always a clean base spin and the generic `verify.mjs`
  smoke (one spin) still sees `spin-start`/`spin-settle`. Third visual baseline
  committed (`spokey-feature-visible`, the full-board jackpot end-state with
  values shown). `forceFeature` debug hook drives the feature deterministically;
  the browser test asserts feature-trigger → rollup → terminal-cue ordering.
- **Contract extended additively: `accumulator.values`** (parallel to `locked`,
  reveal order) — the presenter needs each captured value to render the reveal,
  and phases carry only cell indices. Same additive policy as PR1's `board`/
  `total`; the FROZEN part (phase/kind/cue vocabulary) is untouched. `resolveSpin`
  returns `values: []`, `resolveFeature` returns the per-tile values; the seed-7
  oracle now also pins `values.length===20` and their sum===316.
- **`sound.ts` gained 6 feature cues as placeholder beeps** (`feature-trigger`,
  `lights-out-tick`, `swarm-tick`, `rollup`, `win-celebrate`, `jackpot`) so the
  hook points + cue-ordering log are real in PR2; PR3 replaces the specs with the
  synthesized cue-model (ADR-0015, ≥120ms attack) behind the same names. Note:
  `sound.ts`'s `CueName` (placeholder/growing) and `contract.ts`'s `CueName` (the
  eventual full vocab) are two types that overlap — PR3 unifies them via the
  cue-model. The settle cue is narrowed (`=== 'jackpot' ? … : 'win-celebrate'`)
  because `phase.cue` is the broad contract type.
- **Deviation (WA #10): the presenter uses `setTimeout` scheduling, not a paused
  GSAP timeline.** The plan/PR body said GSAP-timeline-driven; but the
  load-bearing visual proof is a STATIC end-state frame (`?feature=1`), which
  needs no mid-animation seek, so the timeline's seek-determinism benefit doesn't
  apply here. setTimeout matches PR1's `spin()` and is `motionScale`-capped for
  CI. GSAP-timeline deferred to if/when we screenshot mid-animation. Also: the
  feature-trigger assertion lives in the SPOKEY browser test (deterministic
  `forceFeature`), not the generic smoke (which only does one base spin).

- **SPOKEY PR2 pure feature logic shipped + meta-audited before the presenter.**
  Prototype-local (ADR-0004): `proximity.ts` (seed-deterministic figure approach,
  ADR-0012), `holdwin.ts` (the classic reset-on-new / decrement-on-none respin
  machine, jackpot at full board), `reveal.ts` (hidden↔visible A/B, ADR-0013),
  and `resolveFeature` in `resolver.ts` (the whole hold&win sequence as a typed,
  `maxRespins`-bounded phase script, ADR-0010). 95 unit tests; hand-trace of
  seed 7 executed (18 phases → full-board jackpot, total 316).
- **The pre-presenter meta-audit (standing step E) caught 2 HIGH seams the green
  checks hid — the gate earned its keep again.** (1) **Mutation probe had ZERO
  mutants on any PR2 module** — the 100% was vacuous for everything PR2 added.
  This is the same vacuous-green class the retro built `canary` to kill, defeated
  by *adding* logic without a probe rather than moving a target. Rule going
  forward: a new pure module is not "mutation-probed" until it has its own mutant;
  the score is per-target, not per-repo. Fixed: +15 PR2 mutants, 28/28 killed.
  (2) **The hand-trace's appended "state-machine echo" was wrong** — it landed a
  tile on an already-locked cell (index 1) and mislabeled the resulting decrement
  as a "RESET". The committed phase-script was faithful (re-executed: seed 7 → 18
  phases / 316 / jackpot) and the corrupt echo was never committed, but ADR-0010
  makes the hand-trace load-bearing evidence, so a wrong echo is worse than none.
  Fixed by replacing the printed echo with an **executable seed-7 oracle**
  (`spokey-feature.test.ts`): total=316, locked=[0..19], 18 phases, jackpot pinned
  as literals — a real independent oracle, stronger than a printed trace.
- **MED findings folded in too:** a test passed for a FALSE reason — "no-hold
  strip → board can never fill" is false because `rollRespin` lights free cells by
  RNG regardless of symbol (seeds 49/63 DO jackpot that strip); replaced with a
  `maxNewPerRespin:0` guaranteed-non-jackpot case. Removed a tautological
  assertion (`accumulator.total === total` compares one variable to itself).
- **Respins are symbol-blind — recorded as a DECISION, not patched (ADR-0017).**
  The figure-arrival feature replaces the entry board with a respin grid: locked
  cells render as captured-value collectibles, free cells go dark, entry filler is
  left behind (as real hold&win reels work). This removes the "eye-pair locking
  onto a mailbox" contradiction by construction and is the render rule the
  presenter builds against. Added `cellCoord` (the tested inverse of `cellIndex`)
  so the scene can map `accumulator.locked` back to `(reel,row)`.
- **Clean under the red-team (held up):** boundedness for 3000 seeds, the
  reset/decrement off-by-one, contract kind/cue validity (0 violations/3000), and
  crucially proximity is pure + draws ZERO rng, so the base-spin `proximityStep`
  hook does NOT shift the RNG stream — PR1 boards and the resolver test are
  unaffected (verified: 95 green).

- **Pre-PR2 retrospective + upgrade pass (Scott: "what did u learn and how can
  we upgrade").** Five durable lessons from PR #1/#2/#3: (1) a gate you've never
  seen fail is unverified — the trip-matrix is the asset, not the gates; (2)
  **vacuous green** is its own bug class (a check that passes while inert) — two
  shipped (audit on a bad ref, mutation probe decaying as targets move), both
  now fail loudly; (3) don't port platform assumptions across environments (the
  audit loop ran away because GITHUB_TOKEN pushes create approval-held runs
  here, not none); (4) the ninth meta-auditor red-teaming the eight experts was
  the highest-ROI design move (found 3 spec gaps the panel missed); (5) when
  evidence is weak, ship a toggle not a claim. Honest caveat: the cross-Chromium
  dark-frame green was partly luck (matched twice, never stress-tested).
- **NEW GATE — `npm run canary` (gate-canary, ADR-0016).** Fossilizes the
  trip-matrix: each cheap gate runs against a known-bad fixture and the canary
  FAILS unless the gate does. Covers lint core rule + all 3 GritQL plugins,
  typecheck, the visual comparator (re-stages the historical dark-purple escape
  against the LIVE thresholds parsed from vitest.config.ts), the drift-audit
  bad-ref refusal, and the scanner self-test. Wired into preflight (after
  mutation) and CI's checks job. Tripped at birth: loosen threshold to 0.2 +
  drop a plugin → 2/10 canaries fail, as designed. Construction rule: canaries
  use the REAL config (copied verbatim / parsed live), never a private copy —
  testing a private copy is itself vacuous. `pixelmatch`+`pngjs` promoted from
  transitive to explicit devDeps (relying on hoisting was a silent seam).
- **Plan/SPEC reconciled to the PR1 deviation (no more re-litigating mid-build).**
  PR2's `{holdwin,reveal,proximity}.ts` and PR3's `cue-model.ts` are
  **prototype-local**, NOT `src/lib/feature/**` as the original plan said —
  `src/lib` is shared/prototype-agnostic only (ADR-0004); a src/lib module
  importing the prototype's `contract.ts` is dependency inversion. Amended in
  the plan file + SPEC.md so PR2 starts from the right tree.
- **Research sweep (stack freshness, before PR2/PR3).** pixi.js 8.19.0 and
  vitest 4.1.8 are the latest published (verified vs npm registry); Biome 2.4.16
  current; no PixiJS v9. (a) **Vitest browser flake** vitest-dev/vitest#9635 —
  "Vitest failed to find the current suite" ~1 in 5 GH-Actions runs, never local,
  rerun passes; if CI shows that exact error, rerun, don't weaken baselines. (b)
  **PR2 determinism:** drive GSAP manually — `gsap.ticker.remove(gsap.updateRoot)`
  + `gsap.updateRoot(t)` on a fixed clock; build lock/respin as ONE paused
  timeline with cues as `timeline.call()` at positions; raw setTimeout breaks
  seek-to-frame, so move the scaffold's setTimeout scheduling to a timeline in
  PR2. (c) **PR3 audio testing:** OfflineAudioContext is deterministic per-engine
  but NOT bit-exact across browsers — assert derived metrics with tolerance
  (attack ≥120ms from the rendered envelope, per-bus RMS, spectra), never golden
  buffers; `AudioContext.setSinkId({type:'none'})` (Chrome 110+) gives a silent
  sink with a running clock for device-less CI. (d) **Shepard–Risset** =
  octave-spaced oscillators under a Gaussian log-frequency envelope, exp ramps,
  wrap an octave down at the edge; **missing-fundamental bass** = synth integer
  harmonics + high-pass the true low end (commercial "virtual bass"); granular
  voice-cap = implement steal-oldest (no public pattern). (e) **Watch item: Skia
  Graphite** — Chrome's new rasterizer, Linux not yet default; when CI's
  Chrome-for-Testing flips it on, expect wholesale dark-baseline drift → that's a
  regenerate-on-CI event (visual-baseline.yml, ADR-0011), not a code bug.
- **EVIDENCE round 2 (before/after) — 9 promotions, 3 citation fixes.** Scott's
  "source from studies + popularity polls, before and after" rule run as a
  re-verification pass. Tooling gotcha: WebFetch was globally 403-blocked
  (every host); promotions rest on WebSearch snippet synthesis from independent
  hosts. Promoted to VERIFIED (abstract): Carleton 2016 (vol corrected 39→41),
  Grupe & Nitschke 2013, Lehne & Koelsch 2015, Andersen/Clasen 2020, Piepenbrock
  2013, Dixon 2013 (24/15%, n=96), Plomp & Levelt 1965, Trevor/Arnal/Frühholz
  2020, Blumenthal 1986; hold&win market → VERIFIED (trade-press, EKG/GGB
  #1/#2 premium-leased). **3 citation errors fixed in EVIDENCE.md:** the
  scream-roughness paper is Trevor/Arnal/Frühholz 2020 not "Trevino/Blumstein";
  the near-miss 2024 reps are Palmer/Ferrari/Clark 2024 *Psych. Addict. Behav.*
  not Barton/Sescousse in *J. Gambling Studies*; and "near-miss persistence
  fails to replicate" overstated it — Palmer 2024 replicated motivation/speed/
  bet-size, only valence flipped (reframed "mixed"). No design decision
  contradicted; Blumenthal 1986 newly quantifies the ≥120ms rule (full
  mitigation ~141–220ms).

- **SPOKEY PR1 (base game) shipped.** 5×4 ways board, diegetic rusted cabinet,
  seven-segment vector meters, darkness-as-data lighting, the `?lightsOn=1`
  debug toggle, both visual baselines. Pure modules (`src/lib/rng.ts` +
  prototype-local `ways.ts`/`visibility.ts`/`resolver.ts`) fully unit-tested
  (62 unit tests) and added to the mutation probe (13/13 killed, 100% after
  fixing one redundant-guard survivor — the `MIN_REELS` check only bites when
  the paytable would actually pay below the minimum, so the test now uses a
  greedy paytable). Smoke walks both prototypes: 12/12.
- **Deviation from the plan (logged, WA #10):** SPOKEY-specific pure logic
  lives in the prototype dir, not `src/lib/feature/` as the plan/SPEC said.
  Reason: it isn't shared across prototypes (ADR-0004 scopes `src/lib` to
  *shared* code), and a `src/lib` module importing the prototype's
  `contract.ts` would be a dependency inversion. Only the generic seeded RNG
  graduated to `src/lib/rng.ts`. The modules are still fully tested + mutation-
  probed, so the strict-gate's intent (no untested logic) is met regardless of
  the relaxed prototype threshold.
- **`ResolvedOutcome` gained a `board` + `total` field** (additive, non-breaking)
  — the presenter needs the final layout to render. The frozen *phase* shape
  (the meta-audit's risk) is unchanged.
- **Dark-frame visual baseline determinism:** with a correctly-captured
  baseline the dark + lit frames pass 3/3 locally. Gotcha learned: `git
  checkout <file>` can't revert an UNTRACKED new file (use sed/manual revert),
  and a sloppy trip-and-revert on an untracked source left a stale baseline
  that failed consistently until `--update`. The soft translucent flashlight-
  cone gradient is the cross-Chromium risk (141 local vs 148 CI); the data-
  driven cell alpha is the real lighting, the cone is cosmetic. If CI's dark
  frame drifts >1%, regenerate on CI's browser via `visual-baseline.yml`
  (ADR-0011) — not a code change.

- **SPOKEY: LIGHTS OUT design locked via 3 MoE panels + an evidence round + a
  meta-audit (PR0 = spec/ADRs first).** A 5×4 ways hold&win horror slot, "the
  invasion witnessed from inside the dark." Full design in
  `docs/prototypes/spokey-lights-out/SPEC.md`; graded citation trail in
  `EVIDENCE.md`; decisions in ADRs 0009–0015. Method note for future
  prototypes: a two-round MoE (opinion → forced evidence/before-after) plus a
  ninth meta-auditor that red-teams the experts caught three "incomplete-spec
  handoffs" the panel missed (outcome-script shape, proximity ownership, the
  missing lights-on baseline). The meta-audit pattern is worth repeating —
  experts converge and groupthink; a dedicated red-team finds the seams.
- **Frozen the outcome contract BEFORE feature code** (`contract.ts`:
  `OutcomePhase`/`ResolvedOutcome`/`CueName`). The hold&win presenter's
  complexity explodes without a typed outcome shape — the meta-audit's #1
  one-shot failure risk (ADR-0010). resolve-then-present is already proven in
  the scaffold's `scene.ts`.
- **Deviation from plan:** PR0 does NOT register the prototype in
  `src/prototypes-manifest.ts` yet. The manifest drives Vite's build entries,
  so registering it before `index.html` exists would fail `npm run build`.
  Registration moves to PR1 alongside the entry HTML. (Logged per WA #10.)
- **Evidence honesty (carried from the panels):** many primary PDFs 403'd this
  session, so psychology/psychoacoustics sources are SECONDARY; the "19Hz fear
  frequency" is a busted myth (use the missing fundamental). The design is
  config-forgiving by construction — weak-evidence levers ship as toggles
  (`nearMiss`, `ldwHonest`, `hiddenValues`), so the prototype is also an A/B
  harness for the contested claims.

- **CodeQL + Dependency Review demoted to manual-only (Scott's call).**
  Both need GHAS on a private repo — verified live: dependency review
  errors "Dependency graph … along with GitHub Advanced Security", CodeQL
  *scans* fine but the results upload is refused ("Resource not accessible
  by integration"). Free toggles don't unlock them. A check that can never
  pass is worse than an absent one (alarm fatigue); both workflows keep
  their SHA-pinned jobs behind `workflow_dispatch` with re-enable
  instructions in-file. Supply-chain coverage stays: Dependabot
  alerts/updates + cooldown, `npm audit`.
- **Two silent-failure seams closed after Scott's review (fold-in):**
  (1) `audit-drift.mjs` now refuses to run on an unresolvable base/head ref
  (exit 2) — previously a bad ref produced an empty diff and a vacuous
  "no drift detected ✅"; (2) `mutation-probe.mjs` now FAILS on any skipped
  mutant — previously moved target strings silently shrank the probe's
  teeth while the score stayed green. Both were disclosed as residual
  seams during the silent-failure review; gates only strengthen (WA #6).
- **The anti-runaway loop ran away (caught live on PR #1, human-throttled).**
  Demo-math's audit design assumes GITHUB_TOKEN pushes create NO workflow
  runs. In this environment they create **approval-held** runs
  (`action_required`). Approving one ran the audit on the bot's own
  `audit:` commit; history dedupe is by head sha (new every time), so it
  appended another line and pushed another bot commit → another held run.
  Three junk commits before the guard landed. Fix: audit.yml job condition
  now includes `github.actor != 'github-actions[bot]'`. Rule of thumb: a
  self-committing workflow needs an actor guard IN the workflow — never
  rely on platform retrigger behavior, it varies by repo settings.
  Held `action_required` runs on `audit:` commits are safe to ignore.
- **Gate-trip matrix (scaffold PR): every gate deliberately tripped once,
  verified firing, then reverted.** Evidence (all observed in-session):
  - lint: unused var → `biome ci` fails (`noUnusedVariables`) ✓
  - GritQL plugins: direct `localStorage` → storage-firewall diagnostic ✓;
    `'pointermove'` + plain-object `generateTexture` frame → diagnostics ✓
    (fixture-tested); `globalThis.localStorage` escape stays clean ✓
  - typecheck: string-to-number assignment → `tsc` 2 errors ✓
  - unit: flipped `wrapIndex` expectation → vitest fails ✓
  - mutation: 6/6 mutants killed (100%) after replacing one EQUIVALENT
    mutant (see below) ✓
  - visual: bright-red background → screenshot mismatch fails ✓; dark
    purple #3a0ca3 PASSED at threshold 0.2 → **tightened to 0.05** (dark
    UI hides dark drift; AA absorbed by 1% mismatched-pixel ratio) ✓
  - smoke: `exposeProto` removed → verify.mjs boots-check fails ✓
  - audit diff checks: scratch commit with `biome-ignore`/`TODO`/
    `console.log` in src/lib → `lint-suppress`+`todo-marker`+`debug-stmt` ✓;
    body without the section → `deviations-section` ✓; type error under
    `--run-checks` → `typecheck-fail` + `lint-fail` ✓; `sensitive-paths`
    fired on the scaffold's own config changes ✓
  - scanner: staged AWS example key → pre-commit hook BLOCKS the commit ✓
    (`--self-test`: 6 secret + 3 PII + 7 clean ✓)
  - guard hook: Edit on `package-lock.json` and on `__screenshots__/*` →
    exit 2 deny ✓; format hook: messy file auto-formatted on edit ✓
- **Vitest browser failure artifacts land in `.vitest-attachments/`** —
  gitignore it (one PNG snuck into the prototype commit via `git add -A`;
  removed). Also: `git reset --hard` for scratch-commit cleanup eats
  UNRELATED uncommitted work — stash or commit first.
- **`pkill -f 'vite preview'` matches the compound shell command that
  contains the string** and kills your own batch — capture the server PID
  instead.
- **This dev container blocks `cdn.playwright.dev`** (network egress
  allowlist) — `npx playwright install chromium` fails. A pre-provisioned
  Chromium lives at `/opt/pw-browsers/chromium-*/chrome-linux/chrome`
  (v141): point `PW_CHROMIUM` at it (verify.mjs, vitest browser provider,
  and preflight all honor it; preflight auto-detects). CI downloads the
  pinned browser (Chrome-for-Testing 148) — local-vs-CI rasterization may
  differ, so if local baselines fail in CI, regenerate them on CI's browser
  via the manual `visual-baseline.yml` workflow (ADR-0006).
- **Equivalent mutant caught at scaffold time:** mutating
  `return fallback;` to `throw` inside `loadJSON`'s `try` block changes
  nothing — the catch returns the same fallback. Mutations must produce
  OBSERVABLE behavior change; the probe's storage mutation now skips the
  null-guard instead (JSON.parse(null) returns null — `'null'` parses!).
- **`vite preview` 404s favicon.ico** and that lands in the console-error
  smoke gate — `<link rel="icon" href="data:," />` in every entry HTML.
- **Biome formats `.grit` files** (its own plugin format) — the format
  hook covers them; don't fight it.
- **Biome false-positive avoided in the auditor:** `lint-suppress` and
  `todo-marker` scans are restricted to code files — ADRs/docs that
  *describe* the checks legitimately contain the trigger strings.

- **Repo scaffolded from the two blueprint repos** (`testing-kits` governance +
  `Demo-math-slot-test-only` audit loop), adapted for auto mode: the demo-math
  per-PR audit gate is inverted into a mandatory self-initiated
  `npm run preflight` before every push (ADR-0007). Stack researched and
  pinned at scaffold time: PixiJS 8.18+, Vite 8 (Rolldown), TS strict,
  Vitest 4 Browser Mode (visual regression), Biome 2.3 + GritQL footgun
  plugins, GSAP (free since 2025-04), @pixi/sound|ui|layout (ADRs 0001–0008).
- **Blueprint carry-over (demo-math, verified there):** GITHUB_TOKEN pushes
  from workflows don't retrigger workflows (audit.yml relies on this);
  workflow env-var indirection (`BASE_REF` via `env:`) avoids template
  injection; action pins use peeled SHAs from `git ls-remote`.
- **Pixi v8 footguns ported as Biome GritQL plugins** (originals were ESLint
  `no-restricted-syntax`, demo-math LEARNINGS 2026-06-01/-11): plain
  `'pointermove'` fires only over interactive objects — use
  `globalpointermove`; `generateTexture` with a plain-object `frame` breaks —
  use `new Rectangle(...)`; localStorage goes through `src/lib/storage.ts`
  only.
