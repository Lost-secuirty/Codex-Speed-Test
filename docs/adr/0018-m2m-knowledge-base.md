# ADR-0018: docs/kb — a machine-to-machine knowledge base (shared sheets + per-agent journals)

- **Status:** accepted
- **Date:** 2026-06-12
- **Decider:** Scott (structure: his 4-point design; format forks chosen via
  AskUserQuestion), with web evidence

## Context

Agents don't learn across sessions — anything not written down is re-derived
(or re-broken) next time. The repo already externalizes *project* memory
(LEARNINGS.md, ADRs), but *stack* knowledge — how Vite 8/Vitest 4/Biome 2/
Pixi 8 actually behave, post-training-cutoff — kept being rediscovered.

Scott proposed: (1) docs on external tools, (2) repo rules that point to and
permit editing them, (3) a folder named for fast machine-to-machine transfer,
(4) per-AI separation so different models' contributions don't run together.

Web evidence (2026-06-12): docs-in-context lifts coding-agent performance
83–220% **on less-common/fast-moving libraries, with working code examples
contributing most** (arXiv 2503.15231, "When LLMs Meet API Documentation");
context not visible in the codebase improves decision compliance ~49% (arXiv
2605.08112); versioned markdown folders are the emerging standard for agent
knowledge (AGENTS.md: Linux Foundation-backed, 60k+ repos; the "memory bank"
pattern separates semantic/episodic/procedural memory).

## Decision

`docs/kb/` — plain markdown, version-pinned, example-heavy crib sheets, one
tool per sheet, with an INDEX.md catalog + usage contract:

- **Hybrid separation** (Scott's fork choice): durable facts live in SHARED
  sheets with per-entry attribution tags `[agent · date · grade]`; each
  agent's session experience lives in `journal/<agent>.md`. Entries are
  append-only — supersede, never delete another agent's entry.
- **Grades carry over from EVIDENCE.md:** VERIFIED / SECONDARY / MYTH.
- **Progressive disclosure:** read INDEX, then only the needed sheet — never
  bulk-load the folder into context.
- **Scope line:** kb = the stack; ADRs = project decisions; LEARNINGS =
  project gotchas. Tool-facts found in LEARNINGS get distilled into kb.
- AGENTS.md gains a § Knowledge base contract and the source-of-truth order
  slots kb between ADRs and external docs.

## Consequences

- New sessions (any vendor's agent) bootstrap stack knowledge by reading
  2–3 small files instead of re-living the gotchas; transfer to another repo
  is `cp -r docs/kb`.
- Maintenance duty: sheets rot if not appended-to; the Working Agreement's
  learning rules now point here, and version-watch sections flag staleness.
- Rejected: PDFs in Drive (not greppable/diffable, needs a fetch every
  session); strict per-AI folders (fragments the shared truth — an agent
  would miss others' verified facts); a generic "how compilers work" doc
  (training already covers it; context is better spent on the code).
