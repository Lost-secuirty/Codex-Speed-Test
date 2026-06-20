# SETTINGS-CHECKLIST.md — GitHub-side switches Scott must flip

These live in GitHub repo **Settings**, not in files — an agent cannot set
them from a commit. Sequenced so the scaffold PR isn't stranded.

## Now (before/while the scaffold PR is open)

- [x] **Visibility → Public.** This repo is **public** (was private at
      scaffold time; opened up since — see [`STATUS.md`](STATUS.md)).
      (Settings → General → Danger Zone → Change visibility.)
- [ ] **Actions permissions:** Settings → Actions → General →
      "Allow GitHub Actions to create and approve pull requests" can stay
      OFF; workflow permissions = "Read repository contents" (the audit
      workflow elevates itself via its own `permissions:` block).
- [ ] **Dependency graph:** Settings → Security → enable (free). Required by
      `dependency-review.yml` and Dependabot.
- [ ] **Dependabot alerts + security updates:** enable (free).
- [ ] **Secret scanning + push protection:** enable. **Free on public repos**
      (no GitHub Secret Protection purchase needed now the repo is public).
      The repo's own `scan.yml` + pre-commit gate runs regardless.

## CodeQL + Dependency Review: now free (repo went public 2026-06-20)

At scaffold time (decided 2026-06-12) both required **GitHub Advanced
Security / Code Security** on a **private** repo — confirmed live on PR #1
(entitlement errors on every run, before and after the free security
toggles). Scott's call then: stay private, GHAS isn't worth it for a
client-side play-money sandbox, so both workflows were made
**`workflow_dispatch`-only** — installed and runnable, never auto-red.

**That premise has flipped — the repo is now public, where CodeQL code
scanning and Dependency Review run FREE.** Re-enabling automatic runs is now
available (Scott's call, its own PR): restore the commented-out triggers at
the top of `codeql.yml` / `dependency-review.yml` (three lines each), enable
Code scanning in Settings, then add them to branch protection once each has
run green. Until then they stay dispatch-only. Free supply-chain coverage
already on regardless: Dependabot alerts + grouped monthly updates with
7-day cooldown, and `npm audit`.

## After the scaffold PR is merged

- [ ] **Branch protection on `main`** (Settings → Branches → Add rule):
      require PRs, require status checks: `checks`, `browser`, `smoke`,
      `audit`, `scan` (NOT CodeQL until proven working on this plan),
      no force pushes. Add required checks only AFTER each has run green at
      least once, or every later PR is stuck.
- [ ] Optionally: require conversation resolution; restrict deletions.

## Standing decisions encoded in files (no action needed)

- Merge policy: agents never merge; you do (AGENTS.md WA #12).
- Pages/deploy: none — no `deploy.yml` (ADR-0001); stays a source-only repo
  regardless of visibility.
- Dependabot: monthly, grouped, 7-day cooldown (`.github/dependabot.yml`).
