<!-- This template structures the PR body so the drift auditor can reconcile
     "claims" against the diff. Fill every section. -->

## What & why

<!-- What does this PR change, and why? Link the issue/ADR if any. -->

## Changes

<!-- Bullet the notable changes, by area/file. Mention anything sensitive
     (config, CI, deps, .claude/, visual baselines). -->

-

## Deviations from plan

<!-- Mandatory (Working Agreement #10). Any mid-task change of tactic or
     approach vs. the stated plan — said in the work log when it happened,
     recorded here. Write "None." explicitly if there were none; an untouched
     template fails the deviations-section audit check on purpose.
     Significant deviations also go to docs/LEARNINGS.md. -->

## AI assistance

- [ ] No AI-assisted code
- [ ] AI-assisted code present

## Risk area

- [ ] Docs only
- [ ] UI/render/animation behavior
- [ ] Sound behavior
- [ ] Shared lib (`src/lib/`)
- [ ] Visual baselines (`test/browser/__screenshots__/`)
- [ ] Dependency, build, or CI
- [ ] Governance / audit system / `.claude/`

## Testing

<!-- How was this verified? `npm run preflight` covers the lot. -->

- [ ] `npm run preflight` passes locally (lint, typecheck, unit, browser,
      build, smoke, strict drift audit)
- [ ] `npm run mutation` passes (CI gates on it)
- [ ] Visual baseline changes (if any) were made via
      `npm run test:visual:update` and are named in a commit message
- [ ] Reviewer checked silent-failure risk

## Records

- [ ] Added/updated an **ADR** in `docs/adr/` (if an architectural decision)
- [ ] Updated **`docs/LEARNINGS.md`** (if I hit a gotcha/workaround)

## Notes for reviewers / auditor

<!-- Anything the drift audit should know (intentional sensitive changes,
     baseline updates, etc.). -->
