# 0011. Darkness as data (no shaders) + dual visual baselines

- **Status:** Accepted
- **Date:** 2026-06-12

## Context

The game is near-black by design. Two forces collide: a dark board is the
*worst* case for visual-regression (the repo already learned that a dark-purple
background passed at threshold 0.2 — "dark UI hides dark drift" — and tightened
to 0.05), and shader/filter-driven lighting rasterizes differently across the
container's Chromium 141 and CI's Chrome 148, which bites hardest at a tight
threshold.

## Decision

**Darkness is data, not post-processing.** A pure `visibility.ts` computes
per-cell light (0..1) from the flashlight cone, ember falloff, and red-eye
self-illumination; the renderer maps that to sprite `tint`/`alpha` — plain vertex
math, byte-stable. The flashlight cone is banded concentric vector polygons (3–4
alpha steps); vignette is layered `Graphics`. **No `BlurFilter`, no shaders.**

**Two committed baselines:** (a) a deterministic `?lightsOn=1` debug frame
(visibility forced to 1.0) that actually proves the symbol art — the load-bearing
baseline; (b) the real dark idle frame (seeded eye placement, flicker disabled at
t=0) guarding the mood. Structured-dark luminance anchors (faint road-edges at
4–8%) make even the dark frame diffable.

## Consequences

- The visual gate has real evidence at both light states; the dark frame is no
  longer weak evidence that hides drift.
- No filter output to vary across Chromium versions; the comparison stays stable.
- Cross-machine raster drift, if any, is handled by regenerating baselines on
  CI's browser via `visual-baseline.yml` — never by loosening the threshold.

## Alternatives considered

- **Shader/filter lighting** — prettier soft light, but non-deterministic across
  browsers at 0.05; rejected.
- **Snapshot only the dark frame** — rejected: hides drift (the 0.2 lesson); the
  lights-on frame is what proves the art didn't silently break.
