# 0002. TypeScript strict on the stable 6.x line, `tsc --noEmit` as a gate

- **Status:** Accepted
- **Date:** 2026-06-12

## Context

The blueprint repos are vanilla JS ES modules. This repo's purpose is
measuring how *correct* autonomous builds can be — more machine-checkable
constraints mean more measurable correctness. As of scaffold time
(June 2026), TypeScript 7 ("Corsa"/tsgo, the Go-native 10x compiler) is in
beta; the stable line is 6.x/5.9-era `tsc`.

## Decision

TypeScript **strict** for all `src/`, `test/`, and config code. Vite 8
transpiles; type checking is a separate explicit gate: `npm run typecheck`
(`tsc --noEmit`), wired into `preflight`, CI, and the drift audit as the
`typecheck-fail` check. Stay on the stable compiler; do **not** gate on the
TS 7 beta — revisit when 7.0 is GA.

## Consequences

- A whole class of agent mistakes (wrong arg shapes, nulls, API drift across
  Pixi/GSAP versions) becomes a deterministic gate instead of a review find.
- Slightly slower prototyping per-file; net faster per-task (less debugging).
- Deviation from the blueprints' vanilla-JS style is intentional and recorded
  here; ported JS (audit scripts) stays `.mjs` — porting working audited code
  for style points is churn (only its tests are TS).

## Alternatives considered

- **Vanilla JS + JSDoc** — rejected: weaker inference, no strictness gate.
- **tsgo/TS 7 beta as the gate** — rejected: beta compiler in a gate violates
  "gates must be trustworthy"; noted for later adoption.
