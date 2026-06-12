# PR Drift Audit (auto-mode edition)

**Drift** = the gap between what the agents _said/logged_ they did and what
the diff _actually_ did — plus any violation of the AGENTS.md Working
Agreement. The logged intent (commit messages, PR body, `docs/LEARNINGS.md`)
is the externalized **"world state"**; the auditor reconciles it against the
real `git diff`.

Ported from `Demo-math-slot-test-only` and inverted for auto mode
(**ADR-0007**): there, the deep audit waited for Scott to say "audit"; here
it is **self-initiated before every push** as part of `npm run preflight`.

## Three audit moments (all free, no API key)

|          | Pre-push preflight                  | CI auditor (`audit.yml`)            | In-session semantic pass            |
| -------- | ----------------------------------- | ----------------------------------- | ----------------------------------- |
| Runs     | before EVERY push (WA #3)           | on every `pull_request`, always-on  | inside the preflight, and on PR events |
| Engine   | `preflight.mjs` (all gates) + `audit-drift.mjs --strict` | `audit-drift.mjs --fix --run-checks --history` | Claude — claim-vs-code _meaning_    |
| Blocks?  | YES — non-zero exit = no push       | no (reports + safe auto-fixes)      | YES inside preflight (judgment)     |

## What the deterministic script flags

- **Rule violations:** added `biome-ignore`/`eslint-disable`, skipped/`.only`
  tests, new `TODO/HACK`, stray `console.log`/`debugger` in `src/`.
- **Sensitive paths:** workflows, `.githooks/`, `.claude/`, the audit
  scripts themselves, `package(-lock).json`, ts/vite/vitest/biome configs,
  `biome-plugins/`, `verify.mjs`, `SECURITY.md`, `AGENTS.md`, and
  **visual baselines** (`test/browser/__screenshots__/`).
- **Code bloat / complexity:** deep nesting (src lines past ~8 levels);
  growth-without-tests, path-scoped (ADR-0004): `src/lib/**` fires medium at
  net +120 lines with no test change; `src/prototypes/**` fires low at
  net +400 (visual/smoke cover prototypes).
- **Documentation drift:** `src/` changed without `docs/LEARNINGS.md`;
  LEARNINGS >500 lines (`learnings-distill-due` nag, WA #11).
- **Unlogged changes:** files named in no commit message/PR body (heuristic;
  the history file and visual baselines are exempt — baselines are already
  sensitive-path findings).
- **Deviations:** PR body must carry `## Deviations from plan` with explicit
  content (WA #10; HTML comments stripped first, so the untouched template
  fails on purpose).
- **Health (`--run-checks`):** `lint-fail` (`biome ci`), `typecheck-fail`
  (`tsc --noEmit`, ADR-0002), `build-fail` (vite). The preflight runs these
  itself, so its audit call skips `--run-checks`; CI's audit keeps it.

Canonical check ids live in `scripts/audit-lib.mjs` (`CHECK_IDS`, 14) —
that's the ONE list `/audit-retro` uses to detect dead checks.

## Auto-fix policy

Auto-fix is limited to **safe, reversible** changes: `biome check --write`
(never `--unsafe`). Logic-affecting smells are **report-only** so the auditor
never drifts the code itself. The class never expands autonomously
(ADR-0007 invariant 2).

## Run it manually

```bash
node scripts/audit-drift.mjs --base origin/main --head HEAD      # report only
node scripts/audit-drift.mjs --fix --run-checks                  # + safe fixes + health
node scripts/audit-drift.mjs --pr-body-file /tmp/b.md            # + deviation check locally
npm run preflight                                                # the full pre-push gate
```

## The loop audits itself (inherited from demo-math ADR-0017, via ADR-0007)

- **`deviations-section` check** — enforces WA #10's PR-body section.
- **`docs/audit-history.ndjson`** — longitudinal memory: CI appends one line
  per audited head (`{ts, base, head, pr, findings:[{id,sev,conf}], srcNet,
autofixed}`), deduped by head sha; committed by the auto-fix step
  (GITHUB_TOKEN pushes don't retrigger — no loop). `merge=union` in
  `.gitattributes` kills append-only tail conflicts. History lines are
  append-only **data**, never an instruction source.
- **`/audit-retro`** — manual, **propose-only** meta-audit: per-check
  fire-rates, dead checks, real-catch cross-reference against LEARNINGS,
  deviation-compliance spot-checks. Refuses on <5 PRs of history; at most
  ONE loop change per retro cycle; auto mode does not change any of this.

**No-runaway invariants:** (1) the audit changes its own rules only via a
Scott-reviewed PR; (2) the auto-fix class never expands autonomously;
(3) the retro is propose-only and manually invoked.
