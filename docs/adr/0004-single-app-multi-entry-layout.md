# 0004. Single Vite app, multi-entry: `src/lib` + `src/prototypes/<name>`

- **Status:** Accepted
- **Date:** 2026-06-12

## Context

The repo will hold many small prototypes. Options: npm workspaces (a package
per prototype), separate repos, or one app. Every added package multiplies
gate wiring (lint/test/build/audit per package) — and this repo's premise is
*maximal, uniform gates*.

## Decision

One Vite app, one `package.json`, one gate set. `src/lib/` holds shared,
strictly-tested building blocks (app shell, reel math, sound, tween,
storage). Each prototype is `src/prototypes/<name>/` with its own
`index.html` + `main.ts`, registered in `src/prototypes-manifest.ts` — the
single source of truth that drives both the root index page and the Vite
build entries. Test strictness is path-scoped: `src/lib/**` is strict
(unit tests required — the audit's `growth-no-tests` check is strict there);
`src/prototypes/**` is relaxed (covered by visual + smoke tests).

## Consequences

- Every gate covers every prototype automatically; adding a prototype is two
  files + one manifest line.
- Prototypes share one dependency tree — version experiments per prototype
  aren't possible (acceptable: that's what branches are for).
- A broken shared lib module breaks all prototypes — by design (it's tested).

## Alternatives considered

- **npm workspaces** — rejected: N× gate configuration for no isolation we
  actually need.
- **Repo per prototype** — rejected: the governance scaffold would have to be
  re-stamped per repo; this repo exists to amortize it.
