# Backlog — Codex-Speed-Test

A running parking lot for deferred work, known gaps, and out-of-scope items, so the working tree
stays clean and nothing gets lost. Not a roadmap or a promise. Add items as
`- [ ] <item> — <why deferred / owner / status>`. Done work + gotchas live in `docs/LEARNINGS.md`;
decisions in `docs/adr/`; current lifecycle in `STATUS.md`.

## Free coverage now available (repo went public 2026-06-20)

- [ ] **Reconcile the two CodeQL paths.** Going public auto-enabled GitHub **CodeQL default setup**
  (the `Analyze (...)` jobs now run on PRs), so the dormant `workflow_dispatch`-only `codeql.yml`
  (advanced setup) is now redundant. Decide: delete `codeql.yml` (default setup covers it) or adopt
  advanced setup; then add CodeQL to branch protection once green. (Scott's call — settings + CI.)
- [ ] **Re-enable Dependency Review.** It runs **free on public repos**; restore the trigger in
  `dependency-review.yml` and add it to branch protection once green. (Adds coverage; Scott's call.)
- [ ] **Secret scanning + push protection** — free on public repos; enable in Settings if not already
  (the repo's own `scan.yml` + pre-commit gate runs regardless). See `SETTINGS-CHECKLIST.md`.

## Cross-repo / org

- [ ] **Dedicated logging repo (org-wide idea).** Scott wants a single repo just for logs/history
  later, to keep the prototyping repos clean (the `audit-history.ndjson` append is a candidate to
  relocate there). Out of scope here; logged so it isn't lost.
