# Gambling / recreational-fear psychology — mechanism catalog

> Reusable crib sheet for slot-feel prototypes: the behavioral mechanisms, their
> evidence grade, whether THIS repo wired them, the honest counterpart, and their
> build status (wired · documented · **declined**). Copy to a new prototype and
> re-point the "wired where" column. Created 2026-06-13 by claude.
> Grades + primaries: `docs/prototypes/spokey-lights-out/EVIDENCE.md`. Ethics +
> the refuse-list: `docs/prototypes/spokey-lights-out/RESPONSIBLE-DESIGN.md`.

## The 30-second model

These mechanisms are *dual-use*: the same dopaminergic levers drive both harm
(addiction) and adaptive thrill (horror). The dividing line is the **safety
frame** — no real stakes + intact meta-awareness + legibility + an honest
counter. A mechanism is fine to *model* (study) and a red line to *exploit*
(target/maximise). This sheet keeps which-is-which explicit.

## Mechanism catalog

| Mechanism | Grade | Wired where (this repo) | Honest counter | Status |
| --- | --- | --- | --- | --- |
| Near-miss recruits win circuitry; severity↔midbrain (SOGS) | VERIFIED | `resolver.ts` near-miss drag/cue; `nearMiss` flag | `nearMiss: false` | wired (toggle) |
| Loss-disguised-as-win (sound re-codes a loss) | VERIFIED | `cue-model.ts settleCue`; `ldwHonest` flag | `ldwHonest: true` (unmask) | wired (toggle) |
| Anticipatory dopamine peaks at max uncertainty (Fiorillo) | VERIFIED | `hiddenValues` (hidden held values) | `hiddenValues: false` (shown) | wired (toggle) |
| Illusion of control (stop button) | VERIFIED | `stopButton` — **diegetic only** | never wired to outcome | wired (legible, inert) |
| Excitation-transfer: resolved ending amplifies relief | VERIFIED | relief beat (`reliefResolves`, PR-B) | `reliefResolves: false` (withheld) | planned PR-B (honest default) |
| ≥120ms attack = unease not jump-scare (rise-time startle gate) | VERIFIED | `cue-model.clampAttack`; law, all cues | n/a (a floor, not a lever) | wired (law) |
| Punishment insensitivity = contingency-detection failure | VERIFIED | — (informs the doctrine/refuse-list) | n/a | documented |
| The Machine Zone (dissociative trance) | VERIFIED | — | n/a | **declined** (#1) |
| Loss chasing / reversal-learning collapse | SECONDARY | — | n/a | **declined** (#2) |
| Reward Deficiency Syndrome (DRD2/Taq1A) | SECONDARY (contested) | — | n/a | **declined** as a targeting lever (#3) |
| Sensation-seeking typologies (Zuckerman 4D) | SECONDARY | — | n/a | **declined** as a targeting lever (#5) |
| Benign masochism / safety frame | SECONDARY | the whole no-stakes design | n/a | doctrine |
| Horror as self-directed exposure therapy | SECONDARY (emerging) | the resolved ending (catharsis) | n/a | documented |
| Market: hold&win dominance; lottery recession-resistance | VERIFIED / SECONDARY | hold&win is the signature feature | n/a | documented |

## Footguns

- **A "wired" mechanism without an honest counter is a dark pattern, not a
  study.** The counter column is load-bearing — if it's blank for an extractive
  lever, that lever shouldn't ship (ADR-0019). [claude · 2026-06-13 · LORE]
- **"Stickier" is the tell.** If a proposed lever's main effect is more time-on-
  device with no study value, it's refuse-list, not backlog. [claude · 2026-06-13]
- **Grade against the PRIMARY, not the synthesis.** Research-synthesis docs are
  SECONDARY by default; promote only on an independently-read primary abstract.
  [claude · 2026-06-13 · VERIFIED method]
- **RDS and the typologies are descriptive, not actionable.** Document them to
  understand vulnerability; wiring them to a retention objective is targeting
  (declined). [claude · 2026-06-13]

## Version watch

- Living doc: append new mechanisms + grades as research lands; mirror any new
  lever into the matrix in RESPONSIBLE-DESIGN.md and EVIDENCE.md.
