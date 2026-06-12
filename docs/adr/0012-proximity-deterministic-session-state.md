# 0012. Figure proximity as seed-deterministic session state

- **Status:** Accepted
- **Date:** 2026-06-12

## Context

The thin figure on the road advances toward the player across spins and, on
arrival, triggers the LIGHTS OUT feature; it also drives the audio mix (the
Shepard rise, swarm density, win darkening). The meta-audit flagged that nobody
specified *who owns* the proximity variable — time-driven, animation-ticker-
driven, or event-driven — and warned that an async or wall-clock owner races the
lock/hold/trigger sequence and breaks snapshot determinism.

## Decision

**Proximity (0→1) is session state advanced by spin outcomes, computed by a pure
`proximity.ts` from the seeded RNG — never wall-clock or ticker driven.** Each
spin's resolver step may emit a `proximityStep`; the presenter animates the
figure to the new value via GSAP, but the *value* is pure data. Audio reads the
same scalar. The idle frame is proximity at spin 0 (figure at maximum distance,
fixed).

## Consequences

- Deterministic: the same seed yields the same figure position, so the dark
  baseline and the smoke test are reproducible; no race between movement and the
  feature trigger.
- The figure's arrival → feature trigger is a pure predicate (`proximity >=
  1`), unit- and mutation-testable.
- Persistence (figure position across a session) routes through `storage.ts`
  if it survives reloads; in-session it is plain state.

## Alternatives considered

- **Wall-clock / GSAP-ticker ownership** — rejected: non-deterministic, poisons
  the snapshot, and races the phase machine (the meta-audit's specific warning).
- **External/event-driven (player aims at the figure)** — deferred: a richer
  interaction (the player-aimed flashlight) is a documented future feature, not
  the one-shot scope.
