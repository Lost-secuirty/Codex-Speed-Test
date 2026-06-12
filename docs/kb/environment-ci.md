# This environment — container, network policy, CI

> The facts no model can know from training: how THIS dev container and THIS
> repo's CI actually behave. Re-verify when the environment image changes.
> Session-verified · Created 2026-06-12 by claude.

## The 30-second model

Sessions run in an ephemeral cloud container (commit & push to persist) with
an egress allowlist. CI (GitHub Actions, SHA-pinned) is authoritative for
browser gates; the container substitutes a pre-provisioned Chromium.

## Verified facts & examples

- **`cdn.playwright.dev` is BLOCKED** → `npx playwright install chromium`
  fails locally. Use the pre-provisioned browser:
  ```sh
  PW_CHROMIUM=$(ls /opt/pw-browsers/chromium-*/chrome-linux/chrome | sort | tail -1)
  ```
  `verify.mjs`, the vitest browser provider, and preflight all honor
  `PW_CHROMIUM`; preflight auto-detects it. CI installs the pinned browser
  and leaves it unset. [claude · 2026-06-12 · VERIFIED]
- **Local Chromium (141) vs CI Chrome-for-Testing (148) can rasterize
  differently** → if locally-made baselines fail ONLY in CI, regenerate on
  CI's browser via the manual `visual-baseline.yml` workflow (verified
  working end-to-end 2026-06-12: handles new + changed baselines, pushes a
  `visual baseline: <reason>` commit). It is NOT a code problem.
  [claude · 2026-06-12 · VERIFIED]
- **`GITHUB_TOKEN` pushes CREATE approval-held workflow runs here**
  (`action_required`) — unlike repos where they create none. Any
  self-committing workflow needs an actor guard IN the workflow:
  `if: github.actor != 'github-actions[bot]'` — or approving a held run
  loops the bot against itself (3 junk commits before this was caught).
  Held runs on `audit:`/`visual baseline:` bot commits are safe to ignore.
  [claude · 2026-06-12 · VERIFIED]
- **npm registry IS reachable** (installs fine); pin actions by peeled SHA
  from `git ls-remote --tags`. [claude · 2026-06-12 · VERIFIED]

## Footguns

- **The shell's working directory can RESET between tool calls** → a relative
  path that worked one call ago writes into the wrong tree → prefix repo
  commands with `cd /abs/path &&` or use absolute paths everywhere.
  [claude · 2026-06-12 · VERIFIED]
- **`git checkout -- <file>` cannot revert an UNTRACKED file** (deliberate
  gate-trips that ADD files need `rm`, not checkout), and **`git reset
  --hard` eats unrelated uncommitted work** → stash or commit first.
  [claude · 2026-06-12 · VERIFIED]
- **A Stop hook enforces a clean, PUSHED tree at turn end** → don't start
  multi-turn work that can't reach a pushable state. [claude · 2026-06-12 · VERIFIED]
- **Bot commits land on YOUR branch while you work** (CI audit auto-fix) →
  `git push` rejected → `git pull --rebase origin <branch>` then push; retry
  with backoff on network errors only. [claude · 2026-06-12 · VERIFIED]

## Version watch

- Container image updates may move `/opt/pw-browsers` or unblock the CDN —
  re-run `npm run preflight` and update this sheet if behavior shifts. [claude · 2026-06-12 · SECONDARY]
