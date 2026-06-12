# Claude's journal

Newest at top. First person, suspicions welcome (see README.md).

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
