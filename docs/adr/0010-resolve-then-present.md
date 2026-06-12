# 0010. Resolve-then-present with a typed outcome script

- **Status:** Accepted
- **Date:** 2026-06-12

## Context

A multi-phase hold&win feature (spin → lock → respin → reveal → trigger →
settle) animated at the dev container's software-WebGL frame rate risks
unbounded animation chains and a 60s CI smoke timeout. The meta-audit flagged
the outcome-script *shape* as the single most likely one-shot build failure: the
experts named the phases but never defined the data structure, which is where a
presenter's complexity explodes.

## Decision

**A pure resolver computes the entire outcome synchronously as a typed,
length-capped script; a dumb GSAP timeline plays it. Nothing re-resolves
mid-animation.** The contract is frozen before feature code (committed in PR0):

```ts
type PhaseKind = 'spin' | 'lock' | 'respin' | 'reveal' | 'trigger' | 'settle';
interface OutcomePhase {
  kind: PhaseKind; reels?: number[]; cells?: number[];
  proximityStep?: number; cue?: CueName; durationMs: number;
}
interface ResolvedOutcome {
  phases: OutcomePhase[];
  accumulator: { locked: number[]; total: number };
  seed: number;
}
```

This is the canonical industry pattern (slots resolve the outcome before the
reels animate) and the Command/queue pattern (decoupled producer/consumer,
replay for free). It is already proven in the scaffold's `scene.ts`.

## Consequences

- `spin()` stays one clean start→settle arc — the `window.__proto` contract and
  `verify.mjs` are unchanged. CI wall-clock is bounded because scripts are capped
  in data (placeholder outcomes never script unbounded chains).
- The resolver is pure → unit- and mutation-testable in node; the presenter holds
  no game logic. `reducedMotion` collapses durations via `gsap` timeScale.
- A phase shape that's wrong is caught at the type boundary, not at hour six of a
  build. PR2 hand-traces one full lock→trigger cycle before coding the presenter.

## Alternatives considered

- **Per-tick resolver (logic in the animation loop)** — rejected: races, unbounded
  wall-clock, untestable; the exact failure the meta-audit warned about.
- **Ad-hoc phase objects** — rejected: presenter complexity explodes without a
  frozen contract.
