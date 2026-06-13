# docs/kb — the machine-to-machine knowledge base

Curated, **version-pinned** crib sheets for the tools this repo uses that sit
outside (or past the cutoff of) an agent's training data. Plain markdown,
small files, one tool per sheet — built for fast agent-to-agent transfer:
copy this folder to another repo and it works there too.

Evidence basis (web-verified 2026-06-12): docs-in-context lifts coding-agent
performance 83–220% **for less-common / fast-moving libraries**, and *working
code examples* contribute the most — far more than prose (arXiv 2503.15231).
So: sheets lean on examples, skip what every model already knows.

## The contract (binds every agent — see AGENTS.md § Knowledge base)

1. **READ before working with a listed tool:** open this INDEX, then ONLY the
   sheet(s) you need (progressive disclosure — don't bulk-load the folder).
2. **WRITE what you verify:** new gotcha/fix/API fact → append to the matching
   sheet under the right section, tagged `[agent · date · grade]`. Grades as
   in EVIDENCE.md: `VERIFIED` (ran it / saw it here), `SECONDARY` (docs/blog,
   not reproduced), `MYTH` (tested and false — keep it, it prevents repeats).
3. **Never delete another agent's entry** — mark it `SUPERSEDED:` with a
   reason and your tag. History is part of the data.
4. **Your session story goes in `journal/<agent>.md`**, not in the sheets.
   Sheets hold durable facts; journals hold what *you* did, tried, and
   suspect (hybrid model: shared truth + per-agent perspective).
5. Sheets are **for the stack, not the project** — project decisions live in
   `docs/adr/`, project gotchas in `docs/LEARNINGS.md`. When a LEARNINGS
   entry is really a *tool* fact, distill it here and link back.

## Catalog

| Sheet | Covers | Pinned at |
| --- | --- | --- |
| [vite-8-rolldown.md](vite-8-rolldown.md) | Vite 8 (Rolldown core): multi-entry builds, preview server, config-file typing | vite 8.0.x |
| [vitest-4-browser-mode.md](vitest-4-browser-mode.md) | Vitest 4 projects, Browser Mode, visual regression (pixelmatch), v4 behavior changes | vitest 4.1.x |
| [biome-2-gritql.md](biome-2-gritql.md) | Biome 2 config, ci-vs-check, writing GritQL lint plugins | @biomejs/biome 2.4.x |
| [pixi-8-gsap.md](pixi-8-gsap.md) | PixiJS v8 API + footguns, @pixi/ui, GSAP licensing/timing | pixi.js 8.19.x · gsap 3.15.x |
| [environment-ci.md](environment-ci.md) | THIS container + GitHub CI: network policy, PW_CHROMIUM, actor guards, shell quirks | session-verified |
| [webaudio.md](webaudio.md) | Web Audio synthesis + OfflineAudioContext testing in CI, Shepard/missing-fundamental recipes | Chrome 141/148 |
| [gambling-psychology-mechanisms.md](gambling-psychology-mechanisms.md) | Behavioral-mechanism catalog: grade · wired · honest counter · declined; the safety-frame line | 2026-06-13 |

## Journals

| Agent | File |
| --- | --- |
| Claude (Claude Code sessions) | [journal/claude.md](journal/claude.md) |
| (new agent? copy the header convention from journal/README.md) | |

New sheet = copy [TEMPLATE.md](TEMPLATE.md), add a Catalog row here, done.
