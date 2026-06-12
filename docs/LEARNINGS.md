# LEARNINGS

Append-only log of gotchas, fixes, and API surprises. **Newest at top, dated.**
Grep this for the module you're about to edit (Working Agreement #11). When it
exceeds ~500 lines the `learnings-distill-due` audit check nags — distill
evergreen rules into `GOLDEN_RULES.md` via a Scott-reviewed PR.

## 2026-06-12

- **This dev container blocks `cdn.playwright.dev`** (network egress
  allowlist) — `npx playwright install chromium` fails. A pre-provisioned
  Chromium lives at `/opt/pw-browsers/chromium-*/chrome-linux/chrome`
  (v141): point `PW_CHROMIUM` at it (verify.mjs, vitest browser provider,
  and preflight all honor it; preflight auto-detects). CI downloads the
  pinned browser (Chrome-for-Testing 148) — local-vs-CI rasterization may
  differ, so if local baselines fail in CI, regenerate them on CI's browser
  via the manual `visual-baseline.yml` workflow (ADR-0006).
- **Equivalent mutant caught at scaffold time:** mutating
  `return fallback;` to `throw` inside `loadJSON`'s `try` block changes
  nothing — the catch returns the same fallback. Mutations must produce
  OBSERVABLE behavior change; the probe's storage mutation now skips the
  null-guard instead (JSON.parse(null) returns null — `'null'` parses!).
- **`vite preview` 404s favicon.ico** and that lands in the console-error
  smoke gate — `<link rel="icon" href="data:," />` in every entry HTML.
- **Biome formats `.grit` files** (its own plugin format) — the format
  hook covers them; don't fight it.
- **Biome false-positive avoided in the auditor:** `lint-suppress` and
  `todo-marker` scans are restricted to code files — ADRs/docs that
  *describe* the checks legitimately contain the trigger strings.

- **Repo scaffolded from the two blueprint repos** (`testing-kits` governance +
  `Demo-math-slot-test-only` audit loop), adapted for auto mode: the demo-math
  per-PR audit gate is inverted into a mandatory self-initiated
  `npm run preflight` before every push (ADR-0007). Stack researched and
  pinned at scaffold time: PixiJS 8.18+, Vite 8 (Rolldown), TS strict,
  Vitest 4 Browser Mode (visual regression), Biome 2.3 + GritQL footgun
  plugins, GSAP (free since 2025-04), @pixi/sound|ui|layout (ADRs 0001–0008).
- **Blueprint carry-over (demo-math, verified there):** GITHUB_TOKEN pushes
  from workflows don't retrigger workflows (audit.yml relies on this);
  workflow env-var indirection (`BASE_REF` via `env:`) avoids template
  injection; action pins use peeled SHAs from `git ls-remote`.
- **Pixi v8 footguns ported as Biome GritQL plugins** (originals were ESLint
  `no-restricted-syntax`, demo-math LEARNINGS 2026-06-01/-11): plain
  `'pointermove'` fires only over interactive objects — use
  `globalpointermove`; `generateTexture` with a plain-object `frame` breaks —
  use `new Rectangle(...)`; localStorage goes through `src/lib/storage.ts`
  only.
