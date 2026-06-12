# 0003. Biome as the single lint/format tool, GritQL footgun plugins

- **Status:** Accepted
- **Date:** 2026-06-12

## Context

The blueprints use ESLint flat-config + Prettier, including three "footgun"
`no-restricted-syntax` rules that encode hard-won Pixi v8 lessons (demo-math
LEARNINGS 2026-06-01 / 2026-06-11). Scott asked for the latest current stack.
As of June 2026, Biome v2.3 is the production-ready single replacement
(~423 rules, 10–25x faster, one config) and its v2 GritQL plugin system
supports custom rules.

## Decision

**Biome** is the only lint/format tool: `biome check` in preflight/CI,
`biome format` in the on-edit hook, `biome check --write` (safe fixes only,
never `--unsafe`) as the audit's auto-fix class. The three Pixi footgun rules
are ported as GritQL plugins in `biome-plugins/`:

1. `pixi-globalpointermove.grit` — plain `'pointermove'` listeners fire only
   over interactive objects; use `globalpointermove`.
2. `pixi-generate-texture-region.grit` — `generateTexture` with a
   plain-object frame breaks in v8; use `new Rectangle(...)`.
3. `storage-firewall.grit` — `localStorage`/`sessionStorage` only inside
   `src/lib/storage.ts`.

The drift audit's `lint-suppress` check detects `biome-ignore*` (and keeps
the `eslint-disable` patterns for the fallback path).

## Consequences

- One tool, one config, fast enough to run on every edit via the hook.
- GritQL is younger than `no-restricted-syntax`; if a plugin can't express a
  rule (or hits upstream regressions, e.g. override-scoping bugs), the
  fallback is ESLint flat + Prettier for that rule class — as its own
  Scott-reviewed PR, with the audit already dual-detecting suppressions.
- Custom-rule evasions (aliasing, `globalThis`) are known-uncovered; the
  rules are tripwires, not walls — same scope posture as demo-math.

## Alternatives considered

- **ESLint + Prettier (blueprint parity)** — rejected as primary: two tools +
  plugin sprawl vs. one current tool; kept as the named fallback.
- **Oxlint** — rejected: fastest pure linter but no formatter and no custom
  rules story comparable to GritQL at scaffold time.
