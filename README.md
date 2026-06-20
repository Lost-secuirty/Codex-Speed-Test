# Codex-Speed-Test

**Public** playground for fast prototyping of slot-game **frontends** — UI,
sound, animation, juice — and a live experiment in how far a long,
autonomous, one-prompt agent build can go while staying correct.

> **Growing, not frozen.** This repo keeps gaining prototypes, governance, and
> machine-readable surfaces until explicitly frozen — see [`STATUS.md`](STATUS.md)
> for the current lifecycle, visibility, and agent-interop phase.

> The slot **math** (RTP models, RNG proofs, pluggable engines) lives in the
> public `Demo-math-slot-test-only` repo and is deliberately NOT here
> (ADR-0001). Prototypes use placeholder outcomes. Play money only — no real
> wagering, ever.

## Quickstart

```bash
npm install
git config core.hooksPath .githooks   # activate the secret/PII pre-commit gate
npm run dev                            # index page lists the prototypes
```

## The gates

Everything installable is installed; every gate is exercised (the scaffold PR
tripped each one deliberately — see `docs/LEARNINGS.md`).

| Gate | Command | CI |
| --- | --- | --- |
| Lint + format + footgun plugins (Biome) | `npm run lint` | ci.yml `checks` |
| Typecheck (TS strict) | `npm run typecheck` | ci.yml `checks` |
| Unit tests (Vitest) | `npm test` | ci.yml `checks` |
| Mutation probe | `npm run mutation` | ci.yml `checks` |
| Determinism gate (order/clock invariance) | `npm run determinism` | ci.yml `checks` |
| Gate canary (every gate still bites) | `npm run canary` | ci.yml `checks` |
| File guard (sha256 freeze of safety machinery) | `npm run guard` | ci.yml `checks` |
| Build (Vite 8) | `npm run build` | ci.yml `checks` |
| Visual regression (Vitest Browser Mode) | `npm run test:browser` | ci.yml `browser` |
| E2E smoke (Playwright) | `npm run smoke` | ci.yml `smoke` |
| Drift audit | `npm run audit` | audit.yml (comments on every PR) |
| Secret/PII scan | pre-commit hook | scan.yml |
| Everything, strict (pre-push) | `npm run preflight` | — (local gate, WA #3) |

Plus: CodeQL (see the caveat in `SETTINGS-CHECKLIST.md`), dependency review,
Dependabot.

## Rules of the repo

- [`AGENTS.md`](AGENTS.md) — the canonical contract; auto-mode Working
  Agreement (security full stop, self-audit before every push, Scott merges).
- [`GOLDEN_RULES.md`](GOLDEN_RULES.md) — the cheat-sheet.
- [`SECURITY.md`](SECURITY.md) — data boundary, full-stop policy, scan gates.
- [`docs/adr/`](docs/adr/) — why things are the way they are.
- [`docs/LEARNINGS.md`](docs/LEARNINGS.md) — dated gotchas; grep it before
  editing a module.

## Prototypes

| Prototype | What it proves |
| --- | --- |
| [`reel-spin-shell`](src/prototypes/reel-spin-shell/) | The scaffold: 3 procedural reels, GSAP spin, sound hooks, visual baseline |
| [`spokey-lights-out`](src/prototypes/spokey-lights-out/) | LIGHTS OUT: 5×4 ways base + hold&win, darkness-as-data, proximity, synth audio |

Add a prototype: create `src/prototypes/<name>/{index.html,main.ts}`, register
it in `src/prototypes-manifest.ts`, give it a visual test in `test/browser/`.

## Repo map (the six-slot model)

Every connected repo is the same skeleton — **rules → memory → decisions →
agent-tooling → verification → product**. In this repo:

- **Rules** — [`AGENTS.md`](AGENTS.md) (contract) · [`CLAUDE.md`](CLAUDE.md) (pointer) · [`GOLDEN_RULES.md`](GOLDEN_RULES.md) (cheat-sheet) · [`SECURITY.md`](SECURITY.md) · [`SETTINGS-CHECKLIST.md`](SETTINGS-CHECKLIST.md)
- **Memory** — `docs/LEARNINGS.md` (gotchas) · `docs/kb/` (tool crib sheets + per-agent journal) · `docs/audit-history.ndjson` (the auditor's own memory)
- **Decisions** — `docs/adr/` (the "why" trail)
- **Agent tooling** — `.claude/` (auditor/explorer/planner roles · slash-commands · hooks)
- **Verification** — `scripts/` (preflight · drift audit · mutation · canary · determinism · file-guard) + `.github/workflows/` + the secret/PII gate
- **Product** — `src/lib/` (pure, strictly-tested) + `src/prototypes/` (thin render)

Full cross-repo version + each repo's role + the autonomy↔human-gate axis:
[`docs/REPO-TOPOLOGY.md`](docs/REPO-TOPOLOGY.md).

## Deeper reads

- [`docs/WALKTHROUGH.md`](docs/WALKTHROUGH.md) — plain-language **and** technical walk-through of this repo (what it is, how it works, the gates, honest limits).
- [`docs/REPO-TOPOLOGY.md`](docs/REPO-TOPOLOGY.md) — the six-slot model across every connected repo + each repo's role.
- [`docs/2026-directional-report.md`](docs/2026-directional-report.md) — why the verification layer matters (the "verification is the bottleneck" thesis, sourced; Anthropic's *When AI builds itself* frames the same point).
