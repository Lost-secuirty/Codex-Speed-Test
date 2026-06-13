# 0020. Excitation-transfer & the Machine-Zone thesis: the resolved ending

- **Status:** Accepted
- **Date:** 2026-06-13

## Context

Two research findings ingested in the R3 pass sit in productive tension:

- **The Machine Zone** (Schüll 2012, VERIFIED): high-speed continuous slot play
  pulls players into a dissociative trance — they play *not to win but to keep
  playing*. The transition to disorder is overwhelmingly **negative
  reinforcement** (escape, affect-regulation); the machine is engineered for
  "continuous productivity."
- **Excitation-transfer** (Zillmann, VERIFIED): residual sympathetic arousal
  outlasts the appraisal that caused it, so when a threat **resolves**, leftover
  fear-arousal transfers to the relief and amplifies it. **Resolved/"happy"
  endings maximise the payoff;** unresolved endings leave arousal trapped in
  negative affect.

This raises a design question SPOKEY had not answered: how does the LIGHTS OUT
climax *end*? PR3 shipped the dread (the Shepard endless-rise, the cut-swell
trigger) but the rise simply stopped — arousal left hanging.

## Decision

Adopt the thesis that **a horror aesthetic structurally resists the Machine
Zone**: startle/dread keep the player *present and zoned-in*, the opposite of the
numb, dissociative *zoned-out* trance that calm, ergonomic slot design cultivates.
SPOKEY leans into that — it is the design's built-in counter to the #1 declined
lever.

Its design consequence is **the relief beat** (PR-B): when the feature settles,
the Shepard **resolves** (lands on a tonic) and a `relief` cue completes the
excitation transfer — the night ends, the player can put it *down*. This is the
exposure-therapy shape (feel the dread fully, then process and move on).

`reliefResolves` defaults **TRUE** — the responsible behavior is the default;
the withheld-resolution (trapped-arousal) variant is the extractive opt-in. This
is a deliberate **inversion** of ADR-0014's extractive-default pattern, recorded
here: a resolved ending is both better craft *and* the less harmful choice, so it
leads.

## Consequences

- The climax gains a real ending (catharsis), not just a stop — better feel,
  backed by Zillmann.
- `reliefResolves` becomes the lever's A/B: resolved (default) vs. withheld
  (study-only), each legible per ADR-0019.
- The "horror resists the trance" claim is a **testable hypothesis**, recorded as
  such — the prototype is the rig that could one day test it; it is not asserted
  as settled (EVIDENCE.md grades the dissociation-resistance idea as a thesis,
  not a finding).
- Additive only: `relief` is a new `CueName` riding the settle phase; no
  PhaseKind change, no frozen-contract break.

## Alternatives considered

- **Leave the rise unresolved (PR3 behavior)** — rejected: it leaves arousal
  trapped (the stickier, harm-aligned shape) and wastes the excitation-transfer
  payoff. Preserved as the `reliefResolves: false` study variant.
- **Default to withheld resolution (match ADR-0014's extractive default)** —
  rejected: here the honest behavior is also the better craft, so it leads; the
  inversion is intentional and logged.
- **Build a Machine-Zone trance loop to "complete" the dissociation study** —
  rejected, refuse-list #1 (ADR-0019): that is the core harm vector, not a
  feature.
