# LEARNINGS

Append-only log of gotchas, fixes, and API surprises. **Newest at top, dated.**
Grep this for the module you're about to edit (Working Agreement #11). When it
exceeds ~500 lines the `learnings-distill-due` audit check nags — distill
evergreen rules into `GOLDEN_RULES.md` via a Scott-reviewed PR.

> Older entries (scaffold + PR0–PR3, `2026-06-12`) were distilled out on
> 2026-06-13 and live in [`LEARNINGS-archive.md`](LEARNINGS-archive.md); their
> still-biting rules are condensed under **Durable rules** at the bottom of this
> file. Grep both files when chasing a module's history.

## 2026-06-13

- **Slot-bundle salvage → durable storage + a determinism gate (ADR-0022).** Swept
  an uploaded Python slot build; the math-testing discipline was already stronger in
  demo-math (nothing to port), but two patterns landed here:
  - **`storage.ts` durable opt-in API** (`saveDurable`/`loadDurable`): version tag +
    validate-on-read + one previous-good `:prev` copy + an OBSERVABLE
    `durableFallbackCount()` counter (+ dev-mode warn) — the ADR-0021 silent-swallow
    fix. Silent `loadJSON`/`saveJSON` stay as the responsible default for
    non-load-bearing keys; 5 new mutants pin it. **Gotchas:** keep `globalThis.localStorage`
    (the storage-firewall grit plugin doesn't match it — a helper module would trip
    it); `import.meta.env?.DEV` accessed via `as unknown as { env?… }` so the `node`
    unit env can't throw; `:prev` is a RESERVED key suffix; durable records (`{v,data}`)
    are NOT `loadJSON`-readable (one-way door). Note: storage.ts has **no `src/`
    callers yet** — this is pre-emptive hardening.
  - **`scripts/determinism.mjs` (`npm run determinism`)**: runs the unit project twice
    under a different shuffle seed + a different `TZ`, fails loud naming any test whose
    pass/fail FLIPS (order/clock dependence). The `unit` project now shuffles (fixed
    seed `0xc0de`). Wired into preflight (after `mutation`) + CI, canaried by
    `canaryDeterminism` (a TZ-dependent `getTimezoneOffset()` test flips between the
    gate's UTC and Asia/Kolkata runs — a *guaranteed* bite; order-only fixtures are
    flaky in a 2-test tree). `mulberry32` got isolation tests (no global-`Math.random`
    coupling) — the isolation property has no mutant (absence-of-coupling, not a source
    line); the existing `randInt` mutant stays its teeth. file-guard now freezes 19
    files (added `determinism.mjs`). Verified: the real suite is invariant (128 tests).

- **Dice-lab harvest → `file-guard` + mutation provenance (ADR-0021).** Mined a
  Drive "dice-duel reliability lab" for reusable patterns. Three landed as one
  doctrine — *fail loud at the gates, fail safe-but-observable at runtime*:
  - **`scripts/file-guard.mjs` (`npm run guard`)** — sha256 freeze over the
    EXECUTABLE safety machinery (audit/probe/canary/preflight scripts, the
    `biome-plugins/*.grit` footguns, `tools/scan_staged.py`, `.githooks/pre-commit`,
    build/test configs, itself). Hard, working-tree, content-addressed tripwire;
    fails preflight on any byte change until `.fileguard.json` is re-snapshotted —
    the bump then shows in the diff. It's the loud complement to audit-drift's
    MEDIUM, ref-relative `sensitive-paths` nag (which goes vacuous on a bad base
    ref; the guard doesn't). Tamper-EVIDENT, not -proof (change + re-snapshot in
    one commit passes → the point is human review of the pair). Wired into BOTH
    the preflight gate (after the canary) and the CI `checks` job, and proven to
    bite by a new `canaryGuard()` case (a guard with no canary is the
    vacuous-green trap this repo obsesses over).
  - **Mutation provenance** — `mutation-probe.mjs` now REQUIRES each mutant to
    name the suite that kills it (`FILE_TO_TEST`) and prints it on SURVIVED. A new
    module with no registered suite fails the probe loud. Honest limit: it's
    EXISTENCE-checked, not kill-attributed — proves the suite exists, not that it
    is the test that fails on the mutant (kill attribution is a future option).
  - **storage.ts flagged, not fixed (ADR-0021 follow-up).** It degrades correctly
    (fallback on miss/corrupt/quota/private-mode) but SILENTLY — three empty
    catches, corruption indistinguishable from a missing key, no detection. A
    future PR adds dev-mode observability + an opt-in versioned/previous-good
    wrapper for load-bearing keys. Design-only this round, by scope.
  - **Not ported:** the lab's in-place idempotent test-patcher — git already gives
    traceable/revertible/reviewable test additions; importing it would re-solve a
    solved problem. Kept the essence (survivor ⇒ named committed test), dropped
    the mechanism.
  - **Deep self-audit (auditor subagent) → folded in before undraft.** It caught
    the "strengthened in name more than effect" class this PR exists to hunt:
    (M1) the provenance overclaim → tightened to existence-checked everywhere;
    (M2) `file-guard` crashed on a corrupt `.fileguard.json` with an unnamed
    `SyntaxError` → now a named exit 2; (L1) `canaryGuard` proved only MODIFIED →
    now also REMOVED + UNBASELINED; (L2) a misleading UNBASELINED message; (L3) a
    dormant guard/audit CI-flap → documented in ADR-0021. Lesson: a gate PR must
    audit its OWN gates for vacuous strengthening, not just the code under them.

- **Gate-strengthening follow-up (the PR-B audit's latent item) — shipped.** Added
  an exhaustiveness `default` to `playback.ts`'s `switch (intent.kind)`: a future
  `SynthKind` added without a case is now a COMPILE error, not a silently-silent
  cue. Non-throwing on purpose (`const _exhaustive: never = intent.kind; void …`)
  — a cosmetic audio path should degrade to silence, never crash the scene, on an
  impossible value; the value is the compile-time guarantee. **Gate-trip evidence
  (WA #6, "trip each new gate once"):** with all cases handled, `intent.kind`
  narrows to `never` and typecheck passes; removing any one case (tested:
  `noise-tick`) yields `error TS2322: Type '"noise-tick"' is not assignable to
  type 'never'` → typecheck fails. Restored, green. This closes the silent-cue
  class the PR-B meta-audit flagged — gates only strengthen.

- **Research-ingestion arc, PR-B (the relief beat) — the one lever, shipped.**
  The excitation-transfer payoff (ADR-0020): the feature now ends on a `relief`
  cue — a warm consonant major-triad `resolve` synth that lands the endless rise
  and lets the player put it down. Additive only: `relief` is a new `CueName`
  riding the settle phase (no PhaseKind change), `resolve` a new `SynthKind`.
  `reliefResolves` defaults TRUE (responsible — completes the catharsis); FALSE
  withholds it (trapped arousal, the extractive A/B). Both paths are pinned in
  the browser cue-ordering tests (relief terminal when true, absent when false);
  a relief-specific OfflineAudioContext probe proves the slow non-startle onset;
  a cues.ts mutant (relief → cut-swell) is killed by the new design-law test.
  118 unit · 37/37 mutation · 16 browser · all green. The honest default leading
  the extractive opt-in (inverting ADR-0014's pattern) is the nice part — here
  the responsible choice is also the better craft, so it leads.
- **PR-B pre-push meta-audit: PASS, 0 high.** Verified the A/B is *not* vacuous —
  both flag paths are pinned by browser cue-order tests (relief terminal iff
  `reliefResolves`), the relief→cut-swell mutant is killed by the unit design-law
  (re-ran 37/37), the OfflineAudioContext probe rejects both silence and a
  jump-in onset, and the scene-level flag is honestly documented as browser-
  covered (not mutant-covered — no invented vacuous pure helper). **Latent
  follow-up (logged, not folded in per the auditor + ADR-0007):** `playback.ts`'s
  `switch (intent.kind)` has no `default`/`assertNever`, so a *future* SynthKind
  added without a case would render silent with no compile/test error — a
  one-line `assertNever` guard is a worthwhile separate gate-strengthening PR
  (WA #6, gates only strengthen). Not a PR-B defect (the `resolve` case exists
  and the render probe proves it audible).

- **Research-ingestion arc, PR-A (capture + govern) — the governance leads the
  code, by design.** Folded the operator's 7 research syntheses into graded
  evidence + responsible-design artifacts (no code this PR). EVIDENCE.md gained a
  Round-3 pass: 4 new § sections (Addiction & persistence; Individual
  differences; Recreational fear & the safety frame; Market) and 3 held rows
  updated. **4 primaries independently web-verified → VERIFIED:** punishment-
  insensitivity = instrumental-contingency-detection failure (eLife PMC8177883 —
  the humane reframe: pain felt, action→harm mapping broken); near-miss↔SOGS
  severity (Chase & Clark 2010); excitation-transfer (Zillmann — resolved endings
  maximise relief); the Machine Zone (Schüll). Everything else graded SECONDARY
  (synthesis-sourced) — held the line against overclaiming (R3 risk #1).
- **The differentiator shipped: `RESPONSIBLE-DESIGN.md` + ADR-0019.** The artifact
  almost nobody writes — a lever matrix (default · honest counter · grade · harm
  · reversible), the safety-frame doctrine (no stakes + intact frame + legible +
  honest counter = study, not trap), and the **refuse-list**: levers the same
  research describes that we DECLINE, each with mechanism + why-it-crosses + what-
  it'd-take (Machine-Zone trance loop; loss-chasing reinforcement; per-player RDS
  tuning; covert player measurement = human-subjects/IRB; typology targeting).
  Rule of thumb encoded: "if the main effect is *stickier* with no study value,
  it's refuse-list, not backlog."
- **ADR-0020 (excitation-transfer / Machine-Zone thesis):** a horror aesthetic
  structurally *resists* the dissociative trance → the **relief beat** (PR-B): the
  Shepard resolves, a relief cue lands; `reliefResolves` defaults TRUE — a
  deliberate inversion of ADR-0014's extractive-default, because here the honest
  ending is also the better craft. Recorded as a testable *thesis*, not a finding.
- **Method note for future ingestion:** research-synthesis docs are SECONDARY by
  default; promote only on an independently-read primary abstract. Grading
  against the synthesis would have silently inflated the whole evidence base — the
  meta-audit checks each grade against its actual source.
- **Pre-push meta-audit (PR-A): 0 high, evidence base held.** Confirmed exactly
  the 4 named primaries graded VERIFIED with citations consistent across all 6
  docs; refuse-list #1–#5 numbering + rationales aligned; matrix counters all
  non-empty; the `reliefResolves` default-TRUE inversion logged vs ADR-0014. One
  MED drift caught + fixed: the KB mechanism sheet (whose whole job is wired-vs-
  declined) marked the relief beat "wired" though it's PR-B/unbuilt → corrected to
  "planned PR-B." The sheet that tracks ship-state is exactly where a false
  wired-flag matters most.

## Durable rules (distilled 2026-06-13 from the archive)

The scaffold + PR0–PR3 narrative (`## 2026-06-12`) moved to
[`LEARNINGS-archive.md`](LEARNINGS-archive.md). The lessons that still bite,
condensed (full detail + evidence in the archive / the linked ADR / `docs/kb`):

- **Vacuous green is the signature bug class** (→ GOLDEN_RULES #18, ADR-0016): a
  gate/test/mutant that passes while inert. Coverage is per-TARGET — a new pure
  module isn't mutation-probed until it has its OWN mutant; a unit-tested/probed
  helper with ZERO callers tests nothing (a pure helper isn't the source of truth
  until the presenter CALLS it); a tautological assert (`x === x`,
  `clampAttack(x) ≥ 120`) can never fail. Canaries/fixtures run the REAL config,
  never a private copy.
- **Mutations must produce OBSERVABLE change** — an equivalent mutant (`throw`
  where the `catch` returns the same fallback) tests nothing.
- **`lint:fix` FIRST, then copy mutation-probe find-strings from the formatted
  file** — Biome reformatting (incl. `.grit`) orphans a single-line find-string;
  the probe's skip-fail rule catches it, but late.
- **A self-committing workflow needs an actor guard IN the workflow**
  (`github.actor != 'github-actions[bot]'`): here GITHUB_TOKEN pushes create
  `action_required` HELD runs (not none) — those on `audit:` commits are safe to
  ignore. Every workflow carries a per-ref `concurrency` group (cancel-in-progress;
  serialize-never-cancel for commit-pushing ones like `visual-baseline`).
- **`src/lib` is shared/prototype-agnostic only (ADR-0004)** — prototype logic
  lives in the prototype dir (a `src/lib` module importing a prototype's
  `contract.ts` is dependency inversion); it's still fully unit-tested + probed.
- **A dark UI hides dark drift** — pixelmatch `threshold: 0.05` (not 0.2), with
  cross-machine AA absorbed by the 1% mismatched-pixel ratio. Never hand-edit
  baselines; regenerate on CI's browser via `visual-baseline.yml` (ADR-0006/0011).
- **Environment:** `cdn.playwright.dev` is egress-blocked — use
  `PW_CHROMIUM=/opt/pw-browsers/chromium-*/chrome-linux/chrome` (v141 local; CI
  uses Chrome-for-Testing 148, so local↔CI rasterization can differ). Audio tests
  RENDER via OfflineAudioContext and assert metric tolerances, never golden
  buffers (`docs/kb/webaudio.md`).
- **CodeQL + Dependency Review are `workflow_dispatch`-only (for now)** — at
  scaffold time GHAS wasn't on this then-private repo; a check that can never
  pass is worse than absent (alarm fatigue). The repo is now public (`STATUS.md`)
  where both run free, so the premise flipped — auto-runs can be re-enabled in a
  follow-up PR (verify green, then add to branch protection).
- **Tool facts → `docs/kb`; project gotchas stay here** — distill tool-facts out
  of this log into the matching kb sheet and link back.
