---
description: The mandatory pre-push gate (WA #3, ADR-0007) — every gate strict, plus the semantic self-review. Run before EVERY push; zero failures and zero high-severity findings required.
allowed-tools: Bash(npm run preflight:*), Bash(node scripts/preflight.mjs:*), Bash(git fetch:*), Bash(git diff:*), Bash(git log:*), Read, Grep
---

Run the full pre-push gate:

1. `git fetch origin main --quiet` (so the audit range is honest).
2. `npm run preflight` — lint → typecheck → unit → browser → build → smoke →
   `audit-drift.mjs --strict --run-checks`. Non-zero exit = NOT pushable.
3. **Semantic self-review** (what the script can't see): read the full diff
   vs. the claims you're about to put in the commits/PR body. Hunt for what
   the green checks DON'T prove — phantom claims, scope creep, weakened
   gates, uncovered seams. For large diffs, spawn the auditor subagent.
4. If the environment can't run a gate (e.g. browser blocked — see
   docs/LEARNINGS.md), the preflight output says SKIPPED(env): record that
   verbatim in the PR body's Testing section and verify via CI after pushing.
   Never report a skipped gate as green (WA #7).
5. Paste the preflight summary into the PR body; fill `## Deviations from
   plan` honestly (WA #10).

Only when 1–5 are clean: push. This gate is self-initiated, every push, no
exceptions (WA #3).
