# 0006. Vitest Browser Mode visual regression as a required gate

- **Status:** Accepted
- **Date:** 2026-06-12

## Context

This is a UI/sound/juice repo — "correct" mostly means "looks and behaves
right on screen," which lint/unit gates can't see. Vitest 4 stabilized
Browser Mode (real Chromium via `@vitest/browser-playwright`) with built-in
screenshot comparison.

## Decision

`test/browser/` runs in real Chromium and compares screenshots against
**committed baselines** in `test/browser/__screenshots__/`. Policy:

- **CI compares, never updates.** Baselines regenerate only locally via
  `npm run test:visual:update`, in a commit whose message names the visual
  change.
- Baseline paths are on the drift audit's **sensitive-paths** list and the
  agent guard hook denies direct edits — unexplained baseline churn becomes
  an audit finding instead of a silent visual change.
- Snapshot scenes must be deterministic: fixed canvas size, no animation
  running at capture, devicePixelRatio pinned, comparison threshold tuned
  once and recorded in LEARNINGS.

## Consequences

- Visual changes become reviewable diffs (PNG before/after + CI diff
  artifacts) instead of vibes.
- Headless-WebGL rasterization can drift between environments; mitigations:
  same ubuntu image in CI, pinned Playwright Chromium, threshold + masks. If
  flakiness persists, narrow to DOM/index-page snapshots and keep canvas
  assertions behavioral — as a Scott-reviewed change.

## Alternatives considered

- **Playwright-only screenshots in verify.mjs** — kept too (smoke), but
  E2E-level shots are coarser and slower to localize than per-component ones.
- **No visual gate** — rejected: the repo's whole subject matter would be
  ungated.
