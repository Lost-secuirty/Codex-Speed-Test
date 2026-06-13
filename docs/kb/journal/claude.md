# Claude's journal

Newest at top. First person, suspicions welcome (see README.md).

## 2026-06-13 (cross-repo governance + research verification) · multi-repo · claude/cool-dirac-q7aivm

A wider-scope session than the PR-A/B/C arc: harmonized the shared-governance core across all
five connected repos, then ran the 2026 research + verification thread. For my next codex session:
- **The shared core was drifting and lying about it.** testing-kits/lostsouls/health claimed the
  numbered Working Agreement was "identical in every repo" while the lists were 8/9/12. Fixed by
  promoting a byte-identical **Rule 0 — Security full stop** banner *above* the numbered list
  (zero renumbering) and correcting the claim. codex was the reference/superset (our 12-item
  auto-mode WA) and stayed untouched in that rollout.
- **The kb contract is portable and it took** — demo-math + testing-kits adopted it; lostsouls
  (ADR-0005) and health-prototype (chat-only-diary ADR-0024) correctly did NOT. The
  "no foreign-stack sheets" rule held: I did NOT push a retrieval/RAG sheet into any repo, because
  RRF/ColBERT/BGE-M3/sqlite-vec belong to Scott's Exoskeleton/M2M system, not these stacks.
- **Grade-against-primary, vindicated twice** (same lesson as PR-A's R2/R3). The 2026 report was
  built under a 403 fetch-block (snippet-only); a follow-up session with egress re-pulled the
  primaries (testing-kits #29). Two snippet-era calls flipped: "Pocket RAG" (arXiv 2602.13229) I'd
  called likely-fabricated is **real** (403 = false negative; "couldn't find" ≠ "fabricated"), and
  the FDA CDS "independent-review bright line" I leaned on is **stale** (Jan-2026 final guidance
  softened it). Both corrections folded into the report.
- **Folded the corrected report into THIS repo** (`docs/2026-directional-report.md`) so it stops
  dying with the container. codex is now the locked working repo; the other four are read-only for
  now. — claude

## 2026-06-13 (PR-C) · Codex-Speed-Test · claude/wonderful-darwin-tdjbtr · dice-lab harvest

Scott pointed me at a Drive folder (`dice_duel_lab`) and asked what was worth
pulling out. The game was throwaway; the *reliability workflow* around it wasn't.
I web-checked first (his ask: "does this matter / where are the gaps / how to
LOUDLY fail and where you don't") and three patterns survived the check, fusing
into one doctrine I then shipped as ADR-0021 + two gate strengthenings.

Notes to my next session:
- **The file-guard's value is the diff, not the lock.** It's tamper-EVIDENT, not
  tamper-proof — change a guarded file + re-snapshot in the same commit and it
  passes. I almost over-built it toward prevention; the right altitude is forcing
  the `.fileguard.json` bump in front of Scott. "Detection is not prevention"
  is the same lesson the lab's crash probe taught about durability.
- **I deliberately did NOT port the lab's idempotent patcher.** It existed because
  the lab edited files in-place on Drive with no git. Here a PR *is* the
  traceable/revertible patch. Porting it would've been cargo-culting. Naming what
  you decline (and why) is as much the deliverable as what you build — same lesson
  as PR-A's refuse-list.
- **storage.ts is the honest counter-example I left flagged, not fixed.** It's the
  *correct* fail-safe shape (don't crash a play-money UI) with the *wrong*
  loudness (silent swallow, no corruption detection). Fixing it in-PR would've
  blown the design-only scope Scott picked. The versioned/previous-good wrapper
  wants its own responsible-default-vs-extractive-opt-in review.
- Suspicion (unverified): `canaryGuard()` stages whole dirs (scripts, biome-
  plugins, tools, .githooks) so new *members* are caught for free, but a brand-new
  ROOT-level protected file would slip the canary's copy list while still being
  guarded for real. Low risk, but if root-level gate files proliferate, derive the
  stage list from the guard's own PROTECTED set instead of hand-maintaining it.

## 2026-06-13 (PR-B) · Codex-Speed-Test · claude/happy-cannon-efuv5h · the relief beat

Shipped the one code lever of the arc. The night now resolves — a warm major
triad lands the Shepard's endless rise. Clean and additive exactly as PR-A's
ADR-0020 designed it: `relief` CueName rides settle, `resolve` SynthKind, default
TRUE. Notes:
- The A/B is in the cue LOG, not wall-clock: I fire `relief` synchronously right
  after the settle cue (before `spinning=false`) so the log order is
  deterministic and there's no race with the test's `poll(!spinning)`. The 600ms
  audio attack makes it *sound* like it lands after, while the log stays exact.
- The relief logic lives in `scene.ts` (presenter, not mutation-probed), so its
  coverage is the browser A/B (present iff flag), and the *cue-table* character
  (kind 'resolve') carries the mutation target. That's the honest split — don't
  invent a vacuous pure `shouldFireRelief(flag)=flag` just to have a mutant.

## 2026-06-13 · Codex-Speed-Test · claude/happy-cannon-efuv5h · research-ingestion PR-A

The operator handed me ~7 research syntheses and a thesis: their governance
outpaces their code because the meticulous attention operators pour into hooks,
they pour into integrity. PR-A made that literal — capture all the evidence
(graded), then lead with the responsible-design ledger + the refuse-list.

Notes to my next session:
- **The refuse-list is the highest-leverage artifact I've written in this repo.**
  Documenting what we *won't* build, with the harm rationale, is what separates a
  study instrument from a how-to. When future research arrives, the first question
  is "matrix lever (ships with an honest counter) or refuse-list (declined, with
  rationale)?" — not "can we build it?"
- **Grade against the primary, never the synthesis.** I web-verified 4 load-
  bearing primaries and left the rest SECONDARY. It was tempting to ride the
  synthesis's confident prose; that would have inflated the whole base. The R2/R3
  rubric (VERIFIED only on an independently-read abstract) is the guardrail.
- I fat-fingered an Edit early (replaced the "## Game design" heading with
  "false"). Caught + reverted immediately via a context-anchored re-edit. Lesson:
  when an Edit's new_string is suspiciously short, re-read before moving on.
- The relief beat is PR-B's one code piece (designed, not yet built): `relief`
  will be an additive CueName riding the settle phase, `reliefResolves` default
  TRUE. The honest default leading the extractive opt-in is a nice inversion to
  remember.

## 2026-06-12 (later) · Codex-Speed-Test · claude/happy-cannon-efuv5h · PR3

Built the synthesized soundscape the same day. Notes to my next session:

- **The Biome formatter is part of the mutation probe's threat model.** It
  reformatted `cues.ts` to multi-line and silently invalidated a probe find-
  string — the skip-fail rule caught it within minutes. When adding mutants,
  run `lint:fix` FIRST, then copy find-strings from the formatted file.
- **OfflineAudioContext probes are the audio equivalent of visual baselines**
  but cheaper and steadier: RMS-window ratios proved the attack law and the
  proximity duck in actual samples. Pattern worth reusing for any future
  envelope/mix law.
- Suspicion (unverified): the `cut-swell` bed automation
  (`cancelScheduledValues` on the bed bus) could interact badly with a
  rapid-fire second trigger before the bed restore completes — the ramp
  restore targets gain 1 regardless of the arousal level a future PR might
  set. Revisit when bed levels become dynamic.
- My earlier suspicion about preflight wall-time: confirmed direction — the
  probe now runs 35 mutants (~100s). Not painful yet; shard before it is.

## 2026-06-12 · Codex-Speed-Test · claude/happy-cannon-efuv5h

Built SPOKEY PR2 (the LIGHTS OUT hold&win feature) end-to-end today, plus the
governance upgrades (gate canary, plan reconciliation) and this knowledge base.

What I'd tell my next session:

- **The two-stage audit rhythm worked twice — keep it.** Pure logic first,
  meta-audit it, THEN the presenter, then audit the diff. Both rounds found
  vacuous-green the gates couldn't see (zero mutants on new modules; a tested
  helper with no callers). The pattern beats any single gate we have.
- **My own hand-trace echo was wrong** (claimed RESET, printed a decrement)
  and the auditor caught it, not me. When I narrate what code does, I should
  EXECUTE the narration — prose-only traces drift.
- **I keep over-trusting my premises in tests.** The "no-hold strip can't
  jackpot" test premise was simply false (respins land on free cells by RNG
  regardless of strip). Write the counter-seed search BEFORE the assertion.
- Suspicion (unverified): the dark-frame baselines matching across
  Chromium 141/148 twice is luck concentrated in our flat-color vector art.
  The moment we add gradients or text-adjacent AA (PR3 UI?), expect the
  visual-baseline.yml regeneration path to become routine, not exceptional.
- Suspicion (unverified): preflight wall-time is creeping (mutation probe
  grows linearly with mutants). If PR3 adds ~10 audio mutants, consider
  sharding the probe or running it on changed-module mutants locally and the
  full set in CI.

## How I use this file

Read on session start for continuity. Promote verified suspicions per
README.md. Don't rewrite history — append.
