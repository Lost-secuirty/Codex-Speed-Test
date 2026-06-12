# Biome 2 — config, ci vs check, GritQL plugins

> Biome 2 added GritQL lint plugins (how this repo ports its custom ESLint
> rules) and reworked file matching. Pinned at: `@biomejs/biome@2.4.x` ·
> Created 2026-06-12 by claude.

## The 30-second model

One `biome.json` drives format + lint + import-organize. `biome check` fixes
locally (`--write`), `biome ci` is the strict no-write CI form. Custom rules
are `.grit` files registered under `plugins` — pattern-match the AST, call
`register_diagnostic`.

## Verified facts & examples

- **File matching**: `files.includes` with `!` negations (`"**"`,
  `"!dist"`, …) plus `vcs.useIgnoreFile: true` to respect `.gitignore`.
  [claude · 2026-06-12 · VERIFIED]
- **A minimal GritQL plugin**:
  ```grit
  `$target.on($event, $handler)` where {
    $event <: or { `'pointermove'`, `"pointermove"` },
    register_diagnostic(span=$event, message="use 'globalpointermove' for drags")
  }
  ```
  Multiple shapes via `or { ... } as $hit`; object-literal match via
  `$options <: contains \`frame: $value\`, $value <: \`{ $fields }\``.
  Plugin paths in `biome.json` resolve relative to the config file.
  [claude · 2026-06-12 · VERIFIED]
- **Severity**: lint rules like `noNonNullAssertion` emit WARNINGS by default —
  `biome ci` exits 0 on warnings. Don't read "ci passed" as "zero findings".
  [claude · 2026-06-12 · VERIFIED]
- **Testing a plugin fires**: copy a bad fixture + `biome.json` + the plugin
  dir into a temp dir and run `biome lint` there, asserting non-zero / the
  diagnostic string (the gate-canary pattern, `scripts/gate-canary.mjs`).
  [claude · 2026-06-12 · VERIFIED]

## Footguns

- **Biome FORMATS `.grit` files itself** → a format hook will rewrite your
  plugin; don't fight the style it picks. [claude · 2026-06-12 · VERIFIED]
- **Scanning docs/ADRs with content-based checks false-positives** — prose
  *describing* `// biome-ignore` or `TODO` triggers naive greps → restrict
  custom scans to code files. [claude · 2026-06-12 · VERIFIED]
- **GritQL metavariable patterns don't cross statement boundaries** — a value
  built in a variable beforehand escapes `contains` matching. Treat plugins as
  tripwires, not walls; document the known-uncovered shapes in the plugin
  header. [claude · 2026-06-12 · VERIFIED]

## Version watch

- Schema URL is version-pinned (`biomejs.dev/schemas/2.4.x/schema.json`) —
  bump it with the package or editors complain. [claude · 2026-06-12 · VERIFIED]
