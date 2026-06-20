# 0001. Private frontend-prototyping repo, split from the public math repo

- **Status:** Accepted
- **Date:** 2026-06-12

## Context

`Demo-math-slot-test-only` is publicly visible and holds the slot math: RTP
models, RNG/property proofs, pluggable engines, par sheets. Scott wants to
prototype slot-game **frontends** (UI, sound, animation, juice) quickly,
without exposing those experiments publicly and without entangling them with
the math repo's proof obligations. This repo is also the arena for testing
long autonomous one-prompt builds.

## Decision

Codex-Speed-Test is a **private**, frontend-only prototyping repo. No slot
math lives here — prototypes use placeholder outcomes. No real-money or
wagering code, ever. Public-facing artifacts from the blueprint repos are
dropped: no GitHub Pages / `deploy.yml`, no `DISCLAIMER.md`/`CHANGELOG.md`
(folded into README/AGENTS), no public demo URL.

## Consequences

- Frontend experiments iterate fast, away from public eyes and away from the
  math repo's proof-test gates.
- When a prototype needs real math, it imports from (or is ported to) the
  math repo via an explicit, reviewed step — never by copying math here.
- The privacy rule is enforced socially + by `SETTINGS-CHECKLIST.md` (the
  visibility switch is GitHub-side; agents cannot flip it).

## Alternatives considered

- **Prototyping inside demo-math** — rejected: public repo, and its per-PR
  human gate is the opposite of this repo's auto mode.
- **One private monorepo for everything** — rejected: the public demo repo
  already has history, CI, and an audience of one (Scott) happy with it.

## Update (2026-06-20) — repo is now public

This repo's **visibility has changed from private to public.** Current
lifecycle/visibility is recorded authoritatively in [`STATUS.md`](../../STATUS.md);
the "private" framing throughout this record is the historical context at the
time of the decision and is left intact. **The frontend↔math split decided here
still stands** — no slot math, real money, or wagering lives in this repo; the
math remains in the public `Demo-math-slot-test-only` repo. Only the privacy
constraint (and its dropped public-facing artifacts) is superseded by this update.
