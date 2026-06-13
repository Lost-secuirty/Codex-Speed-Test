# 0019. Responsible-design governance: the lever matrix, the safety-frame doctrine, and the refuse-list

- **Status:** Accepted
- **Date:** 2026-06-13

## Context

SPOKEY reproduces extractive slot psychology *to study and counter it* (ADR-0014),
inside a hard no-stakes line (ADR-0001). The research-ingestion arc folded a body
of behavioral-science evidence into `EVIDENCE.md` (R3) — including mechanisms that
would make the prototype materially *stickier* if built (the Machine Zone, loss-
chasing reinforcement, per-player tuning). Until now the ethics lived scattered
across ADR-0001/0013/0014/0015; there was no single artifact defining *when a
behavioral lever may ship*, and — more importantly — no record of the levers we
deliberately decline. A study instrument that only documents what it builds is
indistinguishable from a how-to.

## Decision

Adopt a single governance record,
[`docs/prototypes/spokey-lights-out/RESPONSIBLE-DESIGN.md`](../prototypes/spokey-lights-out/RESPONSIBLE-DESIGN.md),
with three parts and one policy:

1. **The safety-frame doctrine.** SPOKEY is a responsible instrument iff all four
   hold: (a) no real stakes ever; (b) the safety frame is preserved, never
   exploited; (c) every mechanism is legible; (d) every extractive lever ships
   beside an honest counterpart.
2. **The lever matrix** — every shipped behavioral lever with its default, honest
   counter, evidence grade, modelled harm, and reversibility (consolidating the
   ADR-0013/0014/0015 toggles into one auditable table).
3. **The refuse-list** — levers the research describes that we **decline**, each
   with mechanism, why it crosses study→harm, and what it would technically
   require. Current entries: Machine-Zone trance loop; loss-chasing
   reinforcement; per-player RDS tuning; covert player-behavior measurement
   (human-subjects/IRB); sensation-seeking typology targeting.

**Policy:** a behavioral lever may ship only if it satisfies the four criteria
*and* carries an honest counterpart + a graded source. Any lever that would
dissolve the safety frame, exploit a named neurocognitive deficit, profile the
player, or measure real people is refuse-list, documented with rationale. **No
human-subjects measurement in the prototype.**

## Consequences

- The "what we won't build, and why" record becomes a first-class, auditable
  artifact — the differentiator the operator asked for; rigor pointed at
  integrity rather than retention.
- The standing pre-push meta-audit gains a checklist: new levers are reconciled
  against RESPONSIBLE-DESIGN.md, and evidence grades are checked against their
  actual sources (no SECONDARY-as-VERIFIED).
- Adding a lever is now slightly heavier (it must declare default, counter,
  grade, harm). Accepted — the friction is the point.
- The whole extractive default set remains flag-reversible to a responsible
  configuration (ADR-0014), so the study can become the safe demo with no code
  change.

## Alternatives considered

- **Leave the ethics scattered across ADRs** — rejected: no single place defines
  the shipping bar, and the declined levers go unrecorded (the most important
  omission).
- **Document only what we build** — rejected: that is what a how-to does; the
  refuse-list is the artifact that makes this a study.
- **Forbid extractive levers entirely** — rejected (ADR-0014): a study repo must
  be able to demonstrate both sides; the honest counters + legibility + no-stakes
  frame are what keep it safe.
