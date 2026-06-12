# 0016. Gate canary: the trip-matrix as a standing check

- **Status:** Accepted
- **Date:** 2026-06-12

## Context

The scaffold review (PR #1) surfaced a bug class the gates cannot see in
themselves: **vacuous green** — a check that passes while inert. Three live
instances: the drift auditor reported "no drift ✅" on an unresolvable ref
(empty diff = no findings), the mutation probe silently shrank as target
strings moved (score stayed 100% with fewer teeth), and the visual comparator
at threshold 0.2 waved a dark-purple background swap straight through the dark
UI (0 of 332,800 pixels flagged — measured). Each gate was deliberately tripped
by hand once at scaffold time (the gate-trip matrix, LEARNINGS 2026-06-12), but
a hand trip only proves the gate was lethal *that day*. Config drift — a
loosened threshold, a dropped plugin, a renamed rule — re-opens the hole
silently.

## Decision

**`scripts/gate-canary.mjs` (`npm run canary`) makes the trip-matrix a standing
check**: each cheap gate runs against a known-bad fixture and the canary fails
unless the gate does. It runs in preflight (after mutation) and in CI's checks
job. Rules of construction:

- Canaries exercise the gate's **real tool with the repo's real config**
  (biome.json + the GritQL plugins copied verbatim; the repo tsconfig; visual
  thresholds parsed out of the live `vitest.config.ts`). A canary that tests a
  private copy of the config proves nothing.
- Fixtures are embedded strings written to a temp dir, so they never touch the
  real gates (a string literal is not an AST node — the GritQL plugins
  correctly don't match code inside strings).
- The visual canary re-stages the exact historical escape (near-black → dark
  purple `#3a0ca3`) against the live thresholds: loosening the comparator is
  the regression it exists to catch.
- A canary failure means **fix the gate, not the canary** (gates only
  strengthen, Working Agreement #6).

Covered: lint core rule, all three footgun plugins, typecheck, visual
comparator, drift-audit bad-ref refusal, secret-scanner self-test. Not
duplicated: the mutation probe already self-canaries (fails on survivors AND
skips), and every KILLED mutant proves the unit gate detects failure.
Known-uncovered: browser/smoke failure paths need a live Chromium — hand-trip
evidence stands, CI authoritative.

## Consequences

- Vacuous-green regressions in the cheap gates become loud within one
  preflight instead of surviving until the next hand audit. The canary itself
  was tripped at birth (threshold loosened to 0.2, one plugin removed → 2/10
  fail) — the trip evidence is in LEARNINGS.
- Preflight/CI gain ~10s; `pixelmatch` + `pngjs` become explicit devDependencies
  (they were transitive before — relying on hoisting was itself a silent seam).
- New gates owe the canary a fixture. The hand-trip at gate birth remains
  mandatory; the canary is its fossilization, not its replacement.

## Alternatives considered

- **Keep the hand trip-matrix only** — proves lethality once; config drift
  re-opens holes silently. This ADR exists because that already happened twice.
- **Full meta-testing framework (e.g. Stryker for everything)** — heavyweight;
  the mutation probe covers logic, the canary covers config/tooling for
  seconds of runtime.
- **Canary against private config copies** — rejected as vacuous by
  construction; it would test the canary's config, not the repo's.
