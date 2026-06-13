# Repo Topology — the six-slot model + each repo's role

> **Phase: planning / learning.** Heavy documentation across these repos is **deliberate right
> now** — this is the period for over-documenting the system while it's still being figured out,
> not steady-state. The point of *this* doc is one mental model so we reason from the map instead
> of fine-tuning every repo ad hoc. Prune later (a distillation pass, its own PR) once it settles.

## The six-slot skeleton (every repo is the same skeleton)

Only the *fills* differ:

1. **Rules** — canonical contract (`AGENTS.md`) + pointer (`CLAUDE.md`) [+ cheat-sheet
   `GOLDEN_RULES.md` where it exists] + `SECURITY.md`.
2. **Memory** — `docs/LEARNINGS.md` (gotchas) + per-agent `docs/kb/journal/` + where present
   `STATUS.md` / `audit-history.ndjson`.
3. **Decisions** — `docs/adr/` (the "why" trail).
4. **Agent tooling** — `.claude/` (subagent roles, slash-commands, hooks, skills).
5. **Verification** — `scripts/` + `harnesses/` + CI workflows + the secret/PII gate.
6. **Product** — the actual code/engine, kept thin; everything above guards it.

A repo is just: *what fills each slot, and what was deliberately dropped (with a reason).*

## Each repo's role (operator-set)

| Repo | Role | Facing |
|---|---|---|
| **codex-speed-test** | **Private testing ground for rollout** — where techniques are proven before they go anywhere else. Highest-water-mark governance + verification; the reference repo. | private |
| **demo-math-slot-test-only** | **Front-facing: prove the slot math** — public RTP/RNG verification; the "show the math is honest" repo. | public |
| **testing-kits** | **Portable test library** — proof harnesses meant to be ported / referenced later for whatever a future project needs. | reference |
| **lostsouls-game** | **Co-designed game (Scott + son)** — fun first; a learning vehicle for both of them. Light *by design* — don't over-engineer it. | personal |
| **health-prototype** | **Future-facing, deliberately strict** — strict **by operator design, built ahead of current law**, not lax because today's rules are lax. | future / clinical |

## Where each sits on the autonomy ↔ human-gate axis

```
most autonomous ──────────────────────────────────────────────► most human-gated
  codex             demo-math          testing-kits       lostsouls         health-prototype
  self-audit        operator-gated     controls-as-code   light / "play it" librarian + stop-first
  (rollout ground)  (audit on word)    (ported later)     (ADR-0005 hybrid) (strict by design)
```

Each position is **ratified, not drift**:
- **codex** self-audits before every push (ADR-0007) — it's the rollout ground, so it runs hottest
  (preflight + drift + mutation + canary + file-guard; the only repo with a `SETTINGS-CHECKLIST`).
- **demo-math** waits for the operator to say "audit" — operator-gated because it's the
  front-facing math-proof repo (the math being honest is the whole point).
- **testing-kits has no `docs/adr/` because it predates the ADR convention** — historical, not a
  design choice. Its job is a portable proof-harness library to reference later; its decisions are
  encoded as `control-policy.json` + the reviewer docs (AI_CODE_POLICY, PROOF_TEST_STANDARD, …).
- **lostsouls** is light *on purpose* (ADR-0005): the Boundaries + Working Agreement still apply,
  but ceremony is kept minimal so it stays fun and teaches both of us. No kb, no cheat-sheet —
  dropped deliberately.
- **health-prototype** is the strictest **by deliberate operator design** — future-facing clinical
  tooling held to a higher bar than current law requires: the librarian rule (surface/count/cite,
  never score/rank/diagnose), stop-first / human-in-the-loop, evidence-graded claims, chat-only
  diary. Strict by choice, *not* by lax-law default.

## How to use this (instead of fine-tuning everything)

- New work? Find the repo's row, fill the six slots, drop what doesn't fit — **with an ADR**.
- **Fine-tune only when a repo needs to move on the axis**, and when it does, write the ADR. The
  map tells you where each one sits; you touch a slot when there's a reason, not continuously.
- Over-documentation now is correct — we're still learning the system. The map is the cheaper tool;
  the fine-tuning is the fun part you reach for when a repo genuinely needs to move.

---

*Planning-phase reference. The macro thesis behind the "Verification" slot is in
`docs/2026-directional-report.md` (and Anthropic's "When AI builds itself," 2026-06-04, frames the
same "verification is the bottleneck" point). Repo roles above are operator-stated; structures were
read from each repo on 2026-06-13.*
