# Architecture Decision Records

Append-only history; supersede, don't rewrite. New ADR: copy
[`0000-template.md`](0000-template.md) to the next number (`/adr <title>`
scaffolds it).

| # | Title | Status | Date |
| --- | --- | --- | --- |
| [0001](0001-private-frontend-prototyping-split.md) | Private frontend-prototyping repo, split from the public math repo | Accepted | 2026-06-12 |
| [0002](0002-typescript-strict-with-typecheck-gate.md) | TypeScript strict on the stable 6.x line, `tsc --noEmit` as a gate | Accepted | 2026-06-12 |
| [0003](0003-biome-with-gritql-footgun-plugins.md) | Biome as the single lint/format tool, GritQL footgun plugins | Accepted | 2026-06-12 |
| [0004](0004-single-app-multi-entry-layout.md) | Single Vite app, multi-entry: `src/lib` + `src/prototypes/<name>` | Accepted | 2026-06-12 |
| [0005](0005-hand-rolled-pixi-scaffold.md) | Hand-rolled thin Pixi scaffold over the create-pixi template | Accepted | 2026-06-12 |
| [0006](0006-visual-regression-gate.md) | Vitest Browser Mode visual regression as a required gate | Accepted | 2026-06-12 |
| [0007](0007-autonomous-audit-loop-inversion.md) | Auto-mode inversion of the audit loop (preflight before every push) | Accepted | 2026-06-12 |
| [0008](0008-security-full-stop.md) | The security full stop is the sole hard stop in auto mode | Accepted | 2026-06-12 |
| [0009](0009-spokey-format-ways-holdwin.md) | SPOKEY: LIGHTS OUT — 5×4 ways base with a hold&win signature | Accepted | 2026-06-12 |
| [0010](0010-resolve-then-present.md) | Resolve-then-present with a typed outcome script | Accepted | 2026-06-12 |
| [0011](0011-darkness-as-data-dual-baseline.md) | Darkness as data (no shaders) + dual visual baselines | Accepted | 2026-06-12 |
| [0012](0012-proximity-deterministic-session-state.md) | Figure proximity as seed-deterministic session state | Accepted | 2026-06-12 |
| [0013](0013-hidden-visible-value-toggle.md) | Held values: hidden and visible, as a config A/B toggle | Accepted | 2026-06-12 |
| [0014](0014-extractive-feel-within-no-wagering.md) | Classic extractive feel, within the hard no-wagering line | Accepted | 2026-06-12 |
| [0015](0015-audio-cue-model-seam.md) | Audio: pure cue-model + thin playback seam, Shepard, ≥120ms attack | Accepted | 2026-06-12 |
| [0016](0016-gate-canary.md) | Gate canary: the trip-matrix as a standing check | Accepted | 2026-06-12 |
| [0017](0017-feature-respin-grid-collectibles.md) | LIGHTS OUT respin grid renders collectibles, not entry symbols | Accepted | 2026-06-12 |
