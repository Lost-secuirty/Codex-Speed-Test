# 0005. Hand-rolled thin Pixi scaffold over the create-pixi template

- **Status:** Accepted
- **Date:** 2026-06-12

## Context

`npm create pixi.js@latest` offers Creation Templates with screen management,
asset handling, and audio pre-wired. Tempting for speed — but it imports a
body of unaudited boilerplate into a maximal-gates repo, its screen-manager
layout fights the multi-entry `src/prototypes/<name>` design (ADR-0004), and
every line of it would be subject to our own audit/coverage rules from day
one.

## Decision

Hand-roll a thin scaffold: `src/lib/ui/app-shell.ts` (Pixi `Application`
init + resize), `src/lib/audio/sound.ts`, `src/lib/juice/tween.ts`. Lift
*patterns* from the template and the pixi open-games repo (init flow, resize
handling) — not files. Sound placeholders are runtime-generated WebAudio
beeps behind the sound wrapper: zero binary assets, zero licensing, real
hook points.

## Consequences

- Every line in the repo is ours, typed strict, and under our tests.
- We re-implement small conveniences the template ships for free; accepted —
  they accrete in `src/lib` as actual needs appear.
- Binary assets stay out until a prototype genuinely needs one; when that
  happens it goes through an asset pipeline + license note, as its own PR.

## Alternatives considered

- **create-pixi Creation Template** — rejected: unaudited boilerplate +
  structural mismatch (above).
- **Bundler-only template** — closer, but it's ~nothing beyond `npm create
  vite` anyway; hand-rolling costs the same and matches our layout.
