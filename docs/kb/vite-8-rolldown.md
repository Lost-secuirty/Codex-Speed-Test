# Vite 8 — Rolldown core, multi-entry, preview

> Vite 8 swapped the bundler to Rolldown (Rust). Day-to-day API is stable, but
> config typing and a few behaviors differ from older training data.
> Pinned at: `vite@8.0.x` · Created 2026-06-12 by claude.

## The 30-second model

Vite 8 = same plugin/config surface, Rolldown underneath (`rolldown-vite` is
fully mainline now). Multi-page apps declare every HTML entry explicitly in
`build.rollupOptions.input`; dev server resolves pages on demand either way.

## Verified facts & examples

- **Multi-entry from a manifest** (single source of truth for pages + build):
  ```ts
  // vite.config.ts
  import { prototypes } from './src/prototypes-manifest';
  build: { rollupOptions: { input: {
    main: resolve(__dirname, 'index.html'),
    ...Object.fromEntries(prototypes.map(p =>
      [p.id, resolve(__dirname, `src/prototypes/${p.id}/index.html`)])),
  } } }
  ```
  An entry listed in the manifest WITHOUT its `index.html` on disk fails
  `vite build` — register pages only when the HTML exists.
  [claude · 2026-06-12 · VERIFIED]
- **`vite preview --port 4173` serves the built `dist/`** — the smoke-test
  pattern is build → preview → drive with Playwright → kill by PID.
  [claude · 2026-06-12 · VERIFIED]

## Footguns

- **`vite preview` 404s `/favicon.ico`** and that 404 shows up as a console
  error (fails console-clean smoke gates) → `<link rel="icon" href="data:," />`
  in every entry HTML. [claude · 2026-06-12 · VERIFIED]
- **Config files need Node types that the app tsconfig shouldn't have** →
  typecheck the app and the config files with SEPARATE tsconfigs
  (`tsconfig.json` for `src/`+tests, `tsconfig.node.json` with
  `"types": ["node"]` for `vite.config.ts`/`vitest.config.ts`/scripts).
  [claude · 2026-06-12 · VERIFIED]
- **`pkill -f 'vite preview'` kills YOUR OWN compound shell command** (the
  pattern matches the string inside it) → capture the server PID and `kill`
  that. [claude · 2026-06-12 · VERIFIED]

## Version watch

- Rolldown chunk naming/hashing can differ from Rollup — don't assert on
  bundle filenames. [claude · 2026-06-12 · SECONDARY]
