# Web Audio API — synthesis, testing, CI

> Synthesized game audio with zero binary assets, and how to TEST it in
> headless CI without flake. Created 2026-06-12 by claude (PR3 build).
> Pinned at: browser API (no package) · Chrome 141/148 verified.

## The 30-second model

One `AudioContext` per page, a graph of nodes (osc → gain → destination).
Param ramps (`linearRampToValueAtTime`) are the envelopes. For tests, render
the same graph into an `OfflineAudioContext` — it's deterministic and exempt
from the user-gesture rule.

## Verified facts & examples

- **OfflineAudioContext is gesture-exempt** — no autoplay hacks needed in CI:
  ```ts
  const ctx = new OfflineAudioContext(1, 44100 * 2, 44100);
  createPlayback(ctx).play(intent);
  const buf = await ctx.startRendering(); // assert on buf.getChannelData(0)
  ```
  Type code against `BaseAudioContext` so live + offline share the path.
  [claude · 2026-06-12 · VERIFIED]
- **Assert on RMS windows, not exact samples** — window ratios (early-ramp RMS
  vs peak RMS) prove envelope laws (e.g. a ≥120ms attack) without
  cross-browser sample flake. Verified passing on Chromium 141.
  [claude · 2026-06-12 · VERIFIED]
- **Headless/test AudioContexts start `running`, not `suspended`** — autoplay
  policy won't block CI, but REAL users still need `ctx.resume()` from a
  gesture; keep the resume path and treat its absence in tests as a coverage
  gap, not proof. (playwright#33590 wants an option to simulate the real
  suspended start.) [claude · 2026-06-12 · SECONDARY]
- **`exponentialRampToValueAtTime` cannot reach 0** — ramp to `0.0001`, and
  `setValueAtTime(current, t0)` before re-automating a param or the prior
  curve keeps running (`cancelScheduledValues` first when overriding).
  [claude · 2026-06-12 · VERIFIED]
- **Shepard recipe:** octave-spaced layers, raised-cosine gain over
  log-frequency position, glide all layers and wrap — the rise never
  resolves. A *step* (one half-octave glide, window rotated by a scalar) works
  as a repeatable cue. [claude · 2026-06-12 · VERIFIED (implemented)]
- **Missing fundamental:** play harmonics 2f/3f/4f without f — the ear infers
  the absent low fundamental; replaces the (mythical) 19Hz "fear frequency"
  and survives small speakers. [claude · 2026-06-12 · VERIFIED (implemented)]
- **AudioBufferSourceNodes are one-shot, cheap, auto-GC'd** — for granular
  textures reuse ONE noise buffer and cap concurrent voices by design
  (config, not hope); no hard Chrome voice limit is documented.
  [claude · 2026-06-12 · SECONDARY]

## Footguns

- **Seed your grain scatter** — `Math.random()` in audio paths makes renders
  non-reproducible; a 10-line LCG keeps offline renders byte-stable.
  [claude · 2026-06-12 · VERIFIED]
- **Don't snapshot audio buffers across browser versions** — assert window
  RATIOS and ordering (the cue log), never absolute sample values.
  [claude · 2026-06-12 · VERIFIED]
- **A duration-less node rings forever** — always `osc.stop(t)`; untracked
  releases leak into later offline renders sharing a context.
  [claude · 2026-06-12 · VERIFIED]

## Version watch

- Chrome 148 showed no WebAudio behavior change vs 141 in our render probes;
  re-check this sheet if CI's pinned browser majors again. [claude · 2026-06-12 · VERIFIED]
