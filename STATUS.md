---
lifecycle: growing
frozen: false
visibility: public
agent_interop_phase: A
maturity: phase-A-static
updated: 2026-06-20
---

# Status — Codex-Speed-Test

**This project is GROWING, not frozen.** It will keep gaining prototypes, governance, and
machine-readable surfaces until it is explicitly marked `frozen: true` in the front-matter
above. Treat anything here as a current snapshot of an in-progress build, not a final release.

This file is the lifecycle source-of-truth referenced by `docs/REPO-TOPOLOGY.md`.

## Lifecycle

- **lifecycle:** `growing` — actively developed; expect change.
- **frozen:** `false` — no freeze declared.
- **visibility:** `public` — this repo is public. The earlier "private" framing
  (`ADR-0001`, written when the repo was split out private) is historical; current
  visibility is recorded here. The frontend/math split decided by ADR-0001 still stands.

## Agent-interop (A2A / MCP) — phase A (static)

- **Phase A (current):** a static, machine-readable surface only — an A2A Agent Card and MCP
  tool definitions, as committed files, describing this repo's EXISTING deterministic
  verification capability (`gate-verify`: the no-LLM preflight gate set). No server, no live
  endpoint, no authentication. Rolled out across the PRs listed in
  `docs/adr/0023-agent-interop-static-surface.md`.
- **Phase B (not started):** a live callable endpoint + machine-to-machine auth. Deferred.

The Agent Card therefore advertises **no live, callable endpoint**; a validation gate enforces
that honesty against the `agent_interop_phase` value above.

## Scope (unchanged)

Frontend-only prototyping of slot-game UI / sound / animation on **placeholder outcomes**, and
a live experiment in autonomous one-prompt agent build capability. **No slot math, no real
money, no wagering, ever** — the math lives in the public `Demo-math-slot-test-only` repo
(ADR-0001). The agent-interop surface advertises the repo's existing verification machinery, not
any gambling capability.
