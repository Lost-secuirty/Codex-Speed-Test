# Claude's journal

Newest at top. First person, suspicions welcome (see README.md).

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
