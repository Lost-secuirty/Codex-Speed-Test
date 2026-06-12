# LEARNINGS

Append-only log of gotchas, fixes, and API surprises. **Newest at top, dated.**
Grep this for the module you're about to edit (Working Agreement #11). When it
exceeds ~500 lines the `learnings-distill-due` audit check nags — distill
evergreen rules into `GOLDEN_RULES.md` via a Scott-reviewed PR.

## 2026-06-12

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
