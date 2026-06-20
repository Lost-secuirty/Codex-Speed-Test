# Agent-interop (A2A / MCP) — discovery sheet

The machine-readability layer: where this repo's agent-interop surface lives and, just as
importantly, what it does **not** claim. Decision + rationale: `docs/adr/0023-agent-interop-static-surface.md`.
Lifecycle/phase: `STATUS.md` (`agent_interop_phase`). (This is a *project* surface — it lives here,
not in `docs/kb/`, which holds stack/tool crib sheets only, ADR-0018.)

## Where the surface lives

| Artifact | Path | What it is |
|---|---|---|
| A2A Agent Card | `public/.well-known/agent-card.json` | Static discovery card (Vite copies `public/`→`dist/`; RFC 8615 path). Skill `gate-verify`. |
| MCP tool-defs | `tools/mcp/tools.json` | Static tool-def for `gate_verify`; output schema mirrors `preflight.mjs`'s results. |
| Honesty validator | `scripts/agent-card-validate.mjs` | `npm run agent-card` — checks the card/tool-defs + enforces the no-overclaim rule. |
| Canary (teeth) | `scripts/gate-canary.mjs` → `canaryAgentCard()` | Proves the gate bites: real surface passes, overclaim variants fail. |

Pinned versions: **A2A v1.0** (the top-level `protocolVersion` field was removed in v1.0; lifecycle
lives in the custom `x-lifecycle` block) · **MCP 2025-06-18**.

## The one skill: `gate-verify`

Describes this repo's deterministic, no-LLM **preflight gate set** (`scripts/preflight.mjs`): lint,
typecheck, unit, mutation, determinism, gate-canary, file-guard, build, browser visual-regression,
smoke, and a strict drift-audit — fail-loud on any regression.

## What this is NOT (the boundary)

- **Not a service for external code.** `gate-verify` verifies **this repo's own** frontend
  prototypes. It does not run on, or accept, external code/inputs. The card and tool-def say so
  explicitly.
- **No live endpoint.** Phase A is a static, committed surface only — no server, no JSON-RPC/MCP
  endpoint, no authentication. `url` points at the repository. A live endpoint + machine-to-machine
  auth is **phase B**, deferred. The validator fails the build if the card claims a live transport
  while `STATUS.md` says phase A.
- **No slot math.** This repo holds no gambling math or real money (ADR-0001); the card advertises
  verification machinery, nothing about outcomes.

## Validate

```bash
npm run agent-card    # validator over the real files
npm run canary        # includes canaryAgentCard (proves the gate bites)
```
