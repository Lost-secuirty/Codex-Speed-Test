# LEARNINGS

Append-only log of gotchas, fixes, and API surprises. **Newest at top, dated.**
Grep this for the module you're about to edit (Working Agreement #11). When it
exceeds ~500 lines the `learnings-distill-due` audit check nags — distill
evergreen rules into `GOLDEN_RULES.md` via a Scott-reviewed PR.

## 2026-06-12

- **Two silent-failure seams closed after Scott's review (fold-in):**
  (1) `audit-drift.mjs` now refuses to run on an unresolvable base/head ref
  (exit 2) — previously a bad ref produced an empty diff and a vacuous
  "no drift detected ✅"; (2) `mutation-probe.mjs` now FAILS on any skipped
  mutant — previously moved target strings silently shrank the probe's
  teeth while the score stayed green. Both were disclosed as residual
  seams during the silent-failure review; gates only strengthen (WA #6).
- **The anti-runaway loop ran away (caught live on PR #1, human-throttled).**
  Demo-math's audit design assumes GITHUB_TOKEN pushes create NO workflow
  runs. In this environment they create **approval-held** runs
  (`action_required`). Approving one ran the audit on the bot's own
  `audit:` commit; history dedupe is by head sha (new every time), so it
  appended another line and pushed another bot commit → another held run.
  Three junk commits before the guard landed. Fix: audit.yml job condition
  now includes `github.actor != 'github-actions[bot]'`. Rule of thumb: a
  self-committing workflow needs an actor guard IN the workflow — never
  rely on platform retrigger behavior, it varies by repo settings.
  Held `action_required` runs on `audit:` commits are safe to ignore.
- **Gate-trip matrix (scaffold PR): every gate deliberately tripped once,
  verified firing, then reverted.** Evidence (all observed in-session):
  - lint: unused var → `biome ci` fails (`noUnusedVariables`) ✓
  - GritQL plugins: direct `localStorage` → storage-firewall diagnostic ✓;
    `'pointermove'` + plain-object `generateTexture` frame → diagnostics ✓
    (fixture-tested); `globalThis.localStorage` escape stays clean ✓
  - typecheck: string-to-number assignment → `tsc` 2 errors ✓
  - unit: flipped `wrapIndex` expectation → vitest fails ✓
  - mutation: 6/6 mutants killed (100%) after replacing one EQUIVALENT
    mutant (see below) ✓
  - visual: bright-red background → screenshot mismatch fails ✓; dark
    purple #3a0ca3 PASSED at threshold 0.2 → **tightened to 0.05** (dark
    UI hides dark drift; AA absorbed by 1% mismatched-pixel ratio) ✓
  - smoke: `exposeProto` removed → verify.mjs boots-check fails ✓
  - audit diff checks: scratch commit with `biome-ignore`/`TODO`/
    `console.log` in src/lib → `lint-suppress`+`todo-marker`+`debug-stmt` ✓;
    body without the section → `deviations-section` ✓; type error under
    `--run-checks` → `typecheck-fail` + `lint-fail` ✓; `sensitive-paths`
    fired on the scaffold's own config changes ✓
  - scanner: staged AWS example key → pre-commit hook BLOCKS the commit ✓
    (`--self-test`: 6 secret + 3 PII + 7 clean ✓)
  - guard hook: Edit on `package-lock.json` and on `__screenshots__/*` →
    exit 2 deny ✓; format hook: messy file auto-formatted on edit ✓
- **Vitest browser failure artifacts land in `.vitest-attachments/`** —
  gitignore it (one PNG snuck into the prototype commit via `git add -A`;
  removed). Also: `git reset --hard` for scratch-commit cleanup eats
  UNRELATED uncommitted work — stash or commit first.
- **`pkill -f 'vite preview'` matches the compound shell command that
  contains the string** and kills your own batch — capture the server PID
  instead.
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
