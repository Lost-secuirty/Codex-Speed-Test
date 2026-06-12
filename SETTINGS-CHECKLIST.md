# SETTINGS-CHECKLIST.md — GitHub-side switches Scott must flip

These live in GitHub repo **Settings**, not in files — an agent cannot set
them from a commit. Sequenced so the scaffold PR isn't stranded.

## Now (before/while the scaffold PR is open)

- [ ] **Visibility → Private.** Rule #1 of this repo. (Settings → General →
      Danger Zone → Change visibility.)
- [ ] **Actions permissions:** Settings → Actions → General →
      "Allow GitHub Actions to create and approve pull requests" can stay
      OFF; workflow permissions = "Read repository contents" (the audit
      workflow elevates itself via its own `permissions:` block).
- [ ] **Dependency graph:** Settings → Security → enable (free on private
      repos). Required by `dependency-review.yml` and Dependabot.
- [ ] **Dependabot alerts + security updates:** enable (free).
- [ ] **Secret scanning + push protection:** enable if the plan allows.
      On private repos this may require GitHub Secret Protection (paid).
      The repo's own `scan.yml` + pre-commit gate runs regardless.

## CodeQL + Dependency Review: manual-only (decided 2026-06-12)

Both require **GitHub Advanced Security / Code Security** on a private repo
— confirmed live on PR #1 (entitlement errors on every run, before and
after the free security toggles). Scott's call: the repo stays private and
GHAS isn't worth it for a client-side play-money sandbox, so both
workflows are **`workflow_dispatch`-only** — installed and runnable, never
auto-red. Supply-chain coverage that runs free on private repos remains
on: Dependabot alerts + grouped monthly updates with 7-day cooldown, and
`npm audit`.

**To re-enable automatic runs** (repo goes public, gains a backend, or
GHAS is purchased): restore the commented-out triggers at the top of
`codeql.yml` / `dependency-review.yml` — three lines each.

## After the scaffold PR is merged

- [ ] **Branch protection on `main`** (Settings → Branches → Add rule):
      require PRs, require status checks: `checks`, `browser`, `smoke`,
      `audit`, `scan` (NOT CodeQL until proven working on this plan),
      no force pushes. Add required checks only AFTER each has run green at
      least once, or every later PR is stuck.
- [ ] Optionally: require conversation resolution; restrict deletions.

## Standing decisions encoded in files (no action needed)

- Merge policy: agents never merge; you do (AGENTS.md WA #12).
- Pages/deploy: none — private repo, no `deploy.yml` (ADR-0001).
- Dependabot: monthly, grouped, 7-day cooldown (`.github/dependabot.yml`).
