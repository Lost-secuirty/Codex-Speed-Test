# 0015. Audio: pure cue-model + thin playback seam, Shepard cue, ≥120ms attack

- **Status:** Accepted
- **Date:** 2026-06-12

## Context

The soundscape must be synthesized at runtime (no binary assets yet), headless-
testable (CI Chromium may have a suspended/absent `AudioContext`), deterministic
(must not affect the visual snapshot), and sustain unease without ever jump-
scaring. The scaffold's `sound.ts` already logs every cue unconditionally and
only touches WebAudio when available — the seam to preserve.

## Decision

**Split audio into a pure intent model and a thin playback layer.**
`src/lib/audio/cue-model.ts` (no `AudioContext` import) owns the cue→intent spec
table, the proximity scalar, the cue log, and reduced-audio resolution — it is
unit- and mutation-tested like `reel-math`. `src/lib/audio/playback.ts` is the
only file that builds the WebAudio graph; `sound.ts` stays the facade
(`playCue`/`playedCues`/`setMuted`). Four buses (bed / mid / events / stingers)
driven by the one proximity scalar.

Two craft laws are load-bearing:
- **≥120ms attack on every cue** (100ms floor only if play-feel is dull). Startle
  is gated by rise-time; slow onset = sustained dread, fast onset = jump-scare.
  This single envelope rule *is* "unease, never jump-scare" in milliseconds.
- **Reinforcement is contour/timing, not key.** Extractive win-juice keeps its
  rising contour and accelerating tick-up but is rendered in cold minor/glass
  timbres that decay into the bed; win loudness scales *down* as proximity rises.
- Figure proximity drives a **Shepard endless-rise** (dread that never resolves);
  low-end uses the **missing fundamental**, not true infrasound (browser speakers
  can't reproduce ~19Hz, and the "fear frequency" is myth — see EVIDENCE.md).

## Consequences

- Determinism: the cue log is pure and unconditional; the snapshot reads pixels,
  never audio; `verify.mjs` asserts cue *ordering* with the context suspended.
- The drone resumes on the first-spin gesture (autoplay policy). The granular
  swarm is voice-capped in config and tuned against the smoke budget.
- The cue-model joins the mutation-probe surface — audio logic is measured, not
  just played.

## Alternatives considered

- **One stateful audio manager touching WebAudio throughout** — rejected: not
  headless-testable, not deterministic.
- **True infrasound for dread** — rejected: browser-impractical and myth-grade
  (the 19Hz fear frequency is a single unreplicated anecdote).
