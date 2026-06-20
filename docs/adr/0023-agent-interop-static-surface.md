# 0023. Agent-interop: a static A2A + MCP surface for the verification gate set

- **Status:** Accepted
- **Date:** 2026-06-20

## Context

A deterministic, no-LLM "agent-interop" surface is being rolled out across the
operator's repos: a static A2A **Agent Card** plus static **MCP tool
definitions** that let other agents discover (and eventually call) existing
deterministic capabilities. It shipped first in `Demo-math-slot-test-only`
(slot-math) and `Health-Prototype` (`detect_recurrence`).

This repo is different from those two: it is a **frontend-prototyping** repo
(UI/sound/animation on placeholder outcomes, **no slot math**, no real money),
and it has no naturally callable library function. What it does have, and what is
genuinely worth describing, is its **deterministic verification machinery** — the
`preflight` gate set (`scripts/preflight.mjs`): lint, typecheck, unit, mutation,
determinism, gate-canary, file-guard, build, browser visual-regression, smoke,
and a strict drift-audit, all no-LLM and fail-loud.

The honesty risk here is specific: this machinery verifies **this repo's own**
prototypes; it is not a hosted service that runs on external code. The card must
not read as such.

## Decision

Add a **phase-A, static-only** agent-interop surface — no server, no live
endpoint, therefore no authentication:

- `public/.well-known/agent-card.json` — A2A discovery card advertising the
  single skill `gate-verify` (Vite copies `public/` → `dist/`, so it lands at the
  RFC 8615 path if built). `url` points to the repository; `capabilities.streaming`
  is `false`; `x-lifecycle` records `interopPhase: "A"`, `liveEndpoint: false`,
  and the growing-not-frozen status. The skill description states **explicitly**
  that it is self-verification machinery, not a service for external code.
- `tools/mcp/tools.json` — one MCP tool-def, `gate_verify`, whose output schema
  mirrors `preflight.mjs`'s real `record(name, status, note)` results shape.
- `scripts/agent-card-validate.mjs` — a stdlib validator (`npm run agent-card`)
  that checks the A2A required fields, kebab-case skill ids, the lifecycle block,
  and the MCP tool schemas, and enforces the **no-overclaim honesty rule**: while
  `STATUS.md` records `agent_interop_phase: A`, the card may not advertise a live
  endpoint or streaming, and its `interopPhase` must match `STATUS.md`.
- `scripts/gate-canary.mjs` gains `canaryAgentCard()` — proves the gate bites:
  the real surface validates AND overclaiming/broken variants fail. This keeps
  the new gate non-vacuous, consistent with ADR-0016.
- Wiring: `npm run agent-card` added to the `checks` CI job and to
  `scripts/preflight.mjs`; the validator is added to the file-guard
  `PROTECTED_FILES` and `.fileguard.json` is re-baselined **in the same diff**
  (the tamper-evident pair, ADR-0007).
- `docs/agent-interop.md` — the machine-readability discovery sheet (where the
  card + tool-defs live, and what is intentionally NOT claimed). It is a *project*
  surface, so it lives here, not in `docs/kb/` (which is stack/tool sheets only).

Phase B (a live A2A/MCP endpoint plus machine-to-machine auth) is explicitly
deferred and out of scope here.

## Consequences

- The repo is discoverable via the standard `/.well-known/agent-card.json` path,
  with its deterministic, no-LLM verification capability described in
  machine-readable form — and the self-verification (not-a-service) boundary
  stated, so the card can't drift into overclaiming.
- The honesty rule is enforced, not just written: the validator + `canaryAgentCard`
  fail the build if the card claims a live or external capability while phase A.
- No new runtime dependency, no new runtime attack surface (static files only).
- The card describes `preflight`; if that gate set changes, the tool-def should be
  updated alongside it (the validator checks shape, not that the description still
  matches the gates — that stays a review responsibility).

## Alternatives considered

- **No card for this repo** (treat it like the game repo) — reasonable, since
  Codex has no callable library function. Rejected for now: the verification gate
  set is a real, honestly-describable deterministic capability, and describing it
  (clearly bounded as self-verification) is within the rollout's intent. The
  framing is the safeguard; if it ever reads as a service claim, the card is wrong.
- **A live `preflight` endpoint** — that is phase B; it would need auth and an
  expanded threat model, and is deferred.
- **Put the discovery sheet in `docs/kb/`** — rejected: `docs/kb/` is scoped to
  stack/tool crib sheets (ADR-0018), not project surfaces.
