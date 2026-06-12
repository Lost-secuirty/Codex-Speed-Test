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

## CodeQL caveat (read before trusting that check)

`codeql.yml` is included per the maximal-gates rule, but **code scanning on a
private repo requires GitHub Advanced Security / Code Security**, which a
personal free plan does not have. Expected outcomes:

- Repo public: CodeQL runs free and works.
- Repo private without GHAS: the workflow will fail with an entitlement
  error. This is **expected and documented** — do not let an agent "fix" it
  by deleting the workflow; leave it as a visible reminder, and do NOT mark
  it a required status check.

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
