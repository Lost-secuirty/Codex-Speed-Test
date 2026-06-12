# 0009. SPOKEY: LIGHTS OUT — 5×4 ways base with a hold&win signature

- **Status:** Accepted
- **Date:** 2026-06-12

## Context

The first real prototype fuses two operator concept cabinets — a daylight
spider-swarm invasion and a near-black analog-horror road — into "the invasion
witnessed from inside the dark." A format had to be chosen that conveys swarm
*scale* through what you can't see, sustains unease (never jump-scares), and is
buildable one-shot under the repo's gates. A 3×3 was ruled out by the operator.
Decision driven by a Mixture-of-Experts panel (mechanics, horror, Pixi
feasibility, player UX) plus an evidence round and a meta-audit.

## Decision

**5×4, 1,024-ways base game with a hold&win feature ("LIGHTS OUT") as the
signature.** Eye-pair and aftermath-evidence symbols lock and accumulate; a
count climbs on mechanical meters; a thin figure on the road advances across
spins and, on arrival, triggers the feature. Full board = blackout jackpot.
Placeholder outcomes only — no RTP/math (ADR-0001).

## Consequences

- Hold&win's core verb is *waiting* — accumulation toward an uncertain outcome —
  the best mechanical fit to suspense (anticipation-under-uncertainty is the
  dread engine; see EVIDENCE.md). Twenty cells read as swarm mass while staying
  below the visual-crowding floor a denser grid would hit on a dark board.
- The feature is a multi-phase state machine — the build's highest-risk seam.
  Mitigated by the typed outcome contract (ADR-0010) and a phased PR split.
- Ways (vs lines) adds little narrative value but is a slot standard; accepted.

## Alternatives considered

- **Cluster-pays 6×6/7×7 + cascades** — richest pure-logic surface, but cascade
  rhythm is cheerful perpetual motion (anti-dread), 36–49 dark symbols is a
  crowding/readability problem, and cascade chains strain CI wall-clock. The
  three design experts rejected it unanimously.
- **Megaways dynamic reel heights** — sells chaos but its identity is
  information *overload*; dread is information *starvation*. Unstable frame
  destroys the deterministic snapshot; per-spin mask rebuilds double the build.
- **5×3 lines** — the player-UX dissent: most readable, least signature. Hold&win
  stays the centerpiece either way; the operator chose the larger ways board for
  swarm-scale.
