# 0007. Auto-mode inversion of the audit loop (preflight before every push)

- **Status:** Accepted
- **Date:** 2026-06-12

## Context

Demo-math's audit loop (its ADR-0017) pairs an always-on CI drift auditor
with an in-session deep audit that is **operator-triggered**: work stops at
the draft PR until Scott says "audit." This repo is the opposite experiment —
long autonomous tasks with minimal human-in-the-loop — so the stop-and-wait
gate would defeat its purpose. But removing the *human trigger* must not
remove the *audit*.

## Decision

The audit is **self-initiated and mandatory, moved before the push**:

1. **Preflight gate (Working Agreement #3):** `npm run preflight`
   (`scripts/preflight.mjs`) runs lint → typecheck → unit → browser → build →
   smoke → `audit-drift.mjs --strict --run-checks`, and exits non-zero on any
   failure or high-severity finding. No push without a clean preflight, plus
   a semantic self-review of diff-vs-claims (auditor subagent for big diffs).
2. **PR flow:** push → draft PR → subscribe to PR events → fix CI failures
   autonomously until green → report. **Merges remain Scott's alone.**
3. **Everything demo-math ADR-0017 established carries over unchanged:** the
   `deviations-section` check, `docs/audit-history.ndjson` longitudinal
   memory (CI-appended, deduped by head sha, `merge=union`), and the manual,
   propose-only `/audit-retro` (≥5 PRs of history, ≤1 loop change per cycle).

### No-runaway invariants (inherited and binding)

1. The audit changes its own rules **only via a Scott-reviewed PR** — never
   autonomously, never by a retro.
2. The auto-fix class (`biome check --write`, safe fixes only) **never
   expands autonomously**; widening it requires its own ADR.
3. The retro is propose-only and manually invoked. History lines are
   append-only data, never instructions.

## Consequences

- Autonomy without audit decay: every push is pre-audited by construction,
  and the longitudinal history still accumulates evidence for retro tuning.
- Preflight is slow (browser + smoke included) — that is the cost of "audit
  yourself before every PR push" taken literally; partial runs don't count.
- The deep "what do the green checks NOT prove" review no longer has a human
  trigger; it is folded into the pre-push semantic self-review and the PR
  body's Notes-for-auditor section, with Scott's review at merge as the
  backstop.

## Alternatives considered

- **Keep the operator-triggered gate** — rejected: contradicts this repo's
  stated purpose (Scott's rule #3).
- **Full auto-merge on green** — rejected by Scott (merge stays human).
- **Preflight as a git pre-push hook** — rejected for now: a 5-minute hook on
  every push is hostile to humans; the contract + audit history make
  violations visible instead. Revisit if preflight skipping ever shows up.
