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
