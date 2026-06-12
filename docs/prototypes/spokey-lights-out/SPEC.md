# SPOKEY: LIGHTS OUT — design spec

> Play-money art/feel prototype. **No real money, wagering, or payment — ever**
> (AGENTS.md, ADR-0001). Placeholder outcomes only; the slot *math* lives in the
> public demo-math repo, not here.

## One line

A 5×4 ways slot, *the invasion witnessed from inside the dark*: a near-black
board on a rusted cabinet, red eyes barely seen, a thin figure far down a forest
road who slowly **arrives** and at the road's end triggers the **LIGHTS OUT**
hold&win feature. The swarm is never shown — only counted, implied, and heard.

## How this was decided

Three Mixture-of-Experts panels (concept → evidence/research round → sound), a
ninth meta-audit agent that red-teamed all eight experts, and an operator
decision at every fork. The citation trail and the meta-audit record are in
[`EVIDENCE.md`](EVIDENCE.md). The architectural decisions are ADRs 0009–0015.

## Format & feature

- **Base:** 5×4, 1,024 ways. Twenty cells — swarm-mass readable, below the
  crowding floor (ADR-0009).
- **LIGHTS OUT (hold&win):** eye-pair and aftermath-evidence symbols lock and
  accumulate; the count climbs on mechanical meters. Triggered by 6+ scatter
  *or* the figure arriving (`proximity >= 1`). Full board = blackout jackpot.
- **Held values — both, `hiddenValues` toggle (ADR-0013):** hidden-reveal (watch
  the count, not the worth, until the flashlight sweep) is the default; visible
  is the market-proven control. The built-in A/B.

## Symbols (procedural / vector — no binary assets, no fonts in the snapshot)

| Symbol | Role |
| --- | --- |
| Eye-pair (two red dots, black frame) | the swarm unit; locks in the feature |
| Toppled mailbox / dead porch light / road webbing | aftermath "evidence" tiles |
| Main St plate | minor value |
| Radiation stamp | major value |
| The thin figure | premium / the arrival that triggers the feature |
| Alarm beacon | blackout-jackpot marker |

Readability floor (ADR-0011, FLOOR/WCAG 1.4.11): board may be near-black, the
*information* may not — ≥3:1 rim-lit silhouettes at rest, payout-relevant reads
exceed 4.5:1, symbols sized above the crowding threshold.

## Feel — classic extractive, within the no-wagering line (ADR-0014)

Near-miss late-reel beat, a stop button, celebratory tick-up including on
losses-disguised-as-wins — the real-floor psychology, replicated for a craft
study. De-extractive levers ship as documented toggles (`nearMiss`, `ldwHonest`,
stop-button), so the prototype can demonstrate *both* sides of the research.

## Look — diegetic dark cabinet

Rusted vector cabinet chrome (a machine you sit at, not darkness instead of a
machine), seven-segment phosphor-amber meters where the *change-flash* carries
the eye, structured darkness (faint road-edges at 4–8% luminance) that serves the
searching eye *and* the pixel-diff. Win = "the dark reacting to you": flashlight
holds the line, beacon rotates, meters clack up.

## Sound — synthesized, four buses, one proximity scalar (ADR-0015)

- **bed** (dread): detuned osc ~55–90Hz + missing-fundamental depth.
- **mid** (ambiguity): sparse minor/glass layer that blurs diegetic/non-diegetic.
- **events** (the slot juice): extractive contour + accelerating tick-up, in cold
  horror timbre, decaying into the bed; loudness scales *down* as the figure nears.
- **stingers**: Shepard endless-rise on figure proximity; the LIGHTS OUT peak.

The trigger escalates by **subtraction** (cut the bed to silence, then swell).
Universal **≥120ms attack** (100ms floor only if dull) = "unease, never
jump-scare." The bright fanfare is cut.

Cue vocabulary (the `verify.mjs` ordering contract): `drone-start`, `spin-loop`,
`reel-stop`, `near-miss`, `rollup`, `win-celebrate`, `ldw` / `ldw-honest`,
`figure-near`, `swarm-tick`, `feature-trigger`, `lights-out-tick`, `jackpot`.

## Config flags (all in the prototype's `config.ts`)

`hiddenValues` (ADR-0013) · `nearMiss` · `ldwHonest` (ADR-0014) · `reducedMotion`
· `stopButton` · `swarmVoiceCap` (tuned against the smoke budget) · `?lightsOn=1`
debug query (forces visibility 1.0 for the load-bearing baseline).

## Architecture

resolve-then-present (ADR-0010): a pure resolver emits the typed `ResolvedOutcome`
script ([`src/prototypes/spokey-lights-out/contract.ts`](../../../src/prototypes/spokey-lights-out/contract.ts));
a dumb presenter plays it. From PR2 on, the presenter is **one paused GSAP
timeline** with cues as `timeline.call()` at positions, driven deterministically
(`gsap.updateRoot`) — never raw `setTimeout`, or seeking to a fixed frame for
screenshots skips cues (research sweep, LEARNINGS 2026-06-12; PR1's
setTimeout scheduling was the scaffold-compatible interim). Darkness is data,
not shaders (ADR-0011). Proximity is seed-deterministic session state
(ADR-0012).

**Module placement** (reconciled to the PR1 deviation, LEARNINGS 2026-06-12):
SPOKEY-specific pure logic lives in the **prototype dir** — `ways.ts`,
`visibility.ts`, `resolver.ts` (merged), then `holdwin.ts`, `reveal.ts`,
`proximity.ts` (PR2) and `cue-model.ts` (PR3) follow the same pattern.
`src/lib/**` is for genuinely shared, prototype-agnostic code only (ADR-0004) —
so far just `rng.ts`; PR3's thin WebAudio `playback.ts` graduates only if it
stays free of SPOKEY types. Every pure module is unit-tested and
mutation-probed regardless of where it lives.

## Tensions surfaced & resolved (the meta-audit's point)

| Tension | Resolution |
| --- | --- |
| Near-miss persistence poorly replicated (REELS) vs extractive choice (operator) | Near-miss is a config toggle; the mechanic is accumulation, not near-miss. Operator owns the override; logged, A/B-able. |
| Calibrated arousal spikes needed (DREAD) vs swarm CPU-bound (SYNTH) | Spikes are pre-baked per-phase curves, not real-time modulation — survives the voice cap. |
| ≥120ms attack (FREQ) vs punchy slot juice (JINGLE) | Compatible: 120ms is still snappy; 100ms floor if play-feel is dull (never below — startle window). |
| Hidden-value unbacked (REELS) | Built as the A/B control, not assumed (ADR-0013). |
| FREQ's psychoacoustics all secondary/403-blocked | Design is config-forgiving — features are orthogonal to their justifications; cite the *implementable* facts (Shepard is algorithmic, missing-fundamental is standard, 120ms is conservative), not unread papers. |

## Build plan

Three phased PRs: **PR0** (this spec + EVIDENCE + ADRs + frozen contract) →
**PR1** (base game: board, cabinet, darkness, `?lightsOn=1` + both baselines) →
**PR2** (LIGHTS OUT feature + figure + value toggles) → **PR3** (the synthesized
soundscape). Each: `npm run preflight` green, gate-trip evidence in LEARNINGS,
draft PR, babysit CI, operator merges.
