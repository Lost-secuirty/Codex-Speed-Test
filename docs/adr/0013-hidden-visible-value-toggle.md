# 0013. Held values: hidden and visible, as a config A/B toggle

- **Status:** Accepted
- **Date:** 2026-06-12

## Context

The signature dread idea is hidden values: you watch the lock count climb on the
meters but not what each held symbol is *worth* until a final flashlight reveal —
"swarm scale rendered as an increasing count of things you cannot evaluate."
But the mechanics expert searched and found **no evidence that hidden-value
outperforms visible-value** hold&win; the genre's top-grossing progenitor
(Lightning Link) shows its values. Hidden-value is a designed hypothesis, not an
evidence-backed win.

## Decision

**Build both, behind a `hiddenValues` config flag.** Hidden-reveal is the
default dread path; visible-value is the market-proven control. `reveal.ts`
assigns values purely; the flag only changes *when* the value is shown, not the
outcome.

## Consequences

- This *is* the A/B harness the evidence asked for — in a repo whose entire
  purpose is measuring, the experiment is built in, not assumed away.
- It hands the visual-regression gate a third legitimate baseline (the visible
  variant) for free.
- Cost is one branch in the reveal presenter and one extra baseline; trivial
  given resolve-then-present.

## Alternatives considered

- **Hidden only** — rejected: bets the prototype on an unbacked hypothesis.
- **Visible only** — rejected: discards the signature dread idea and the chance
  to demonstrate the comparison.
