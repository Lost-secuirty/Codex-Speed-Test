# 0014. Classic extractive feel, within the hard no-wagering line

- **Status:** Accepted
- **Date:** 2026-06-12

## Context

The evidence round surfaced an emergent convergence: three unrelated literatures
all pointed *away* from extractive slot dark-patterns — engineered near-misses
(persistence effect poorly replicated), stop buttons (inflate illusion-of-control
beliefs; Ladouceur & Sévigny 2005), and celebratory sound on losses-disguised-as-
wins (Dixon et al.). The panel's default recommendation was "responsible by
construction." The operator deliberately chose the opposite: replicate the real-
floor psychology for authenticity.

## Decision

**Reproduce the classic extractive game-*feel* — near-miss beats, a stop button,
celebratory tick-up including on losses-disguised-as-wins — as the default.** This
is a play-money art/craft study; replicating the psychology to understand it
harms no one *because the hard no-real-wagering / no-payment line in AGENTS.md
and ADR-0001 stays absolute*. The choice is the operator's, made with the
evidence in front of them, and is recorded here so it is auditable.

To keep the study honest, the de-extractive levers ship as documented toggles,
not as the discarded road not taken: `nearMiss` (off disables the beat),
`ldwHonest` (a negative/quiet tone that *unmasks* losses-disguised-as-wins, per
Dixon 2020), and the stop button is a config option. The prototype can therefore
demonstrate *both* sides of the research.

## Consequences

- The extractive juice supplies exactly the calibrated arousal spikes the
  inverted-U fun-fear model (Andersen/Clasen 2020) says sustained dread needs —
  the operator's choice cleanly resolves a design tension rather than creating one.
- The decision is transparent and reversible by flag; a future build can default
  to the responsible configuration without code changes.
- Hard boundary, restated: no real money, wagering, payment, or account data —
  ever. This ADR governs *feel*, not stakes.

## Alternatives considered

- **Responsible-by-construction default** — the evidence-backed path; preserved as
  the toggle set, not the default, per the operator.
- **Extractive with no honest toggles** — rejected: a study repo should be able to
  show the contrast.
