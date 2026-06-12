# Vitest 4 — projects, Browser Mode, visual regression

> Vitest 4 changed enough from v1–v2 training data to deserve a sheet: the
> `projects` config, Browser Mode + `@vitest/browser-playwright`, and built-in
> screenshot comparison. Pinned at: `vitest@4.1.x` · Created 2026-06-12 by claude.

## The 30-second model

One `vitest.config.ts` defines multiple **projects** (here: `unit` in node,
`browser` in real Chromium). Browser Mode runs test files INSIDE the browser
page via a provider package; visual regression is first-class through
`toMatchScreenshot` with a pluggable comparator (pixelmatch).

## Verified facts & examples

- **Two-project split, selected by `--project`** — `vitest run --project unit`.
  Projects live under `test.projects[]`, each with its own `name`, `include`,
  `environment`. [claude · 2026-06-12 · VERIFIED]
- **Browser provider is `@vitest/browser-playwright`** (separate package from
  `playwright`), wired as:
  ```ts
  import { playwright } from '@vitest/browser-playwright';
  browser: {
    enabled: true, headless: true,
    provider: playwright({ launchOptions: { executablePath: process.env.PW_CHROMIUM } }),
    instances: [{ browser: 'chromium', viewport: { width: 800, height: 600 } }],
  }
  ```
  `launchOptions` goes at PROVIDER level — putting it on an instance is
  silently ignored. [claude · 2026-06-12 · VERIFIED]
- **Visual regression**: `await expect(page.elementLocator(el)).toMatchScreenshot('name')`
  with comparator options under `browser.expect.toMatchScreenshot`:
  ```ts
  comparatorName: 'pixelmatch',
  comparatorOptions: { threshold: 0.05, allowedMismatchedPixelRatio: 0.01 }
  ```
  Baselines land in `test/browser/__screenshots__/<testfile>/<name>-chromium-linux.png`.
  Regenerate with `vitest run --project browser --update`. [claude · 2026-06-12 · VERIFIED]
- **`expect.poll` for async settle** —
  `await expect.poll(() => scene.isSpinning(), { timeout: 15000, interval: 100 }).toBe(false)`.
  [claude · 2026-06-12 · VERIFIED]
- **In-browser tests import `page` from `vitest/browser`** (formerly
  `@vitest/browser/context`). [claude · 2026-06-12 · VERIFIED]

## Footguns

- **Passing tests SWALLOW console.log** (v4 default reporter) → debugging
  output never appears → write trace artifacts to a FILE from inside the test
  (`appendFileSync`) instead of logging. [claude · 2026-06-12 · VERIFIED]
- **`--reporter=basic` was removed in v4** → startup error "Failed to load
  custom Reporter from basic" → use the default or `--reporter=verbose`.
  [claude · 2026-06-12 · VERIFIED]
- **Browser-failure artifacts land in `.vitest-attachments/`** → they sneak
  into `git add -A` → gitignore the folder. [claude · 2026-06-12 · VERIFIED]
- **A stale committed baseline fails CONSISTENTLY (3/3), looking like a real
  regression** → if a deliberate gate-trip touched baselines, regenerate with
  `--update` before diagnosing "flake". [claude · 2026-06-12 · VERIFIED]
- **pixelmatch `threshold` is per-pixel color distance, NOT mismatch budget**
  — 0.2 passed a dark-purple-for-black swap on a dark UI. Keep per-pixel
  strict (0.05) and absorb anti-aliasing via `allowedMismatchedPixelRatio`
  (0.01). [claude · 2026-06-12 · VERIFIED]
- **Screenshots differ across Chromium builds/GPUs** → only compare in the
  environment that made the baseline, or regenerate on CI's browser (see
  environment-ci.md). [claude · 2026-06-12 · VERIFIED]

## Version watch

- v4 renamed/moved browser-context imports; check the migration guide before
  bumping majors: https://vitest.dev/guide/browser/ [claude · 2026-06-12 · SECONDARY]
