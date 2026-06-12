# SPOKEY: LIGHTS OUT — evidence record

The research trail behind the design. This is the demo-math PAR-SHEET equivalent
for a repo with no RTP math: instead of proving payout numbers, it grades the
*evidence* behind the design decisions. Every source was found during the design
session (2026-06-12). Grades: **VERIFIED** (read it / its abstract), **SECONDARY**
(via another source / press summary), **MYTH** (found and rejected), **LORE**
(craft practice, not a cited study).

> Honesty note carried from the panels: several primary PDFs (PMC, Frontiers,
> Sage, APA) returned HTTP 403 this session, so a number of psychology and
> psychoacoustics sources are graded SECONDARY (abstract/press only). The
> meta-audit's verdict: the design is *config-forgiving* — features are
> orthogonal to their justifications, so it survives the removal of almost any
> single source. Where a lever rests on weak evidence, it ships as a toggle.

## Game design

| Claim (→ where it lands) | Source | Grade |
| --- | --- | --- |
| Near-misses recruit win-related circuitry, raise motivation | Clark et al. 2009, *Neuron* 61:481 (fMRI) | VERIFIED |
| Near-miss **persistence** effect fails to replicate → demote to flavor (ADR-0014) | Barton/Sescousse et al. 2020, *J. Gambling Studies*; 2024 conceptual reps (1 of 3) | SECONDARY |
| Anticipatory dopamine peaks at **maximum uncertainty** (backs hidden-value engine) | Fiorillo, Tobler & Schultz 2003, *Science* | VERIFIED (abstract) |
| Stop buttons inflate illusion-of-control (87% believed they could influence symbols) | Ladouceur & Sévigny 2005, *J. Gambling Studies* | VERIFIED (abstract) |
| Faster play → worse inhibition / more harm; UK capped slots ≥2.5s | Harris & Griffiths 2018, *J. Gambling Studies* (review) | VERIFIED (abstract) |
| Hold&win is a huge, surging market (Lightning Link progenitor, hundreds of clones; values **shown**) | Aristocrat / trade trackers (SlotCatalog, CDC Gaming) | SECONDARY |
| **No evidence hidden-value beats visible** → build it as A/B (ADR-0013) | (absence finding — searched, not found) | VERIFIED (null) |

## Horror / dread

| Claim | Source | Grade |
| --- | --- | --- |
| Fear of the unknown is the fundamental fear ("perceived absence of information") | Carleton 2016, *J. Anxiety Disorders* 39 | SECONDARY |
| Uncertainty about future threat drives anticipatory anxiety | Grupe & Nitschke 2013, *Nat. Rev. Neuroscience* 14:488 | SECONDARY |
| Suspense = a prediction state from instability/uncertainty | Lehne & Koelsch 2015, *Frontiers in Psychology* | SECONDARY |
| Recreational fear is an **inverted-U** (too little = boring) → restraint frames peaks | Andersen/Clasen et al. 2020, *Psychological Science* (Aarhus haunted house, N=110) | SECONDARY |
| Amygdala response **decrements** with repetition → "one pair of eyes, not twenty" | Plichta et al. 2014, *NeuroImage* | VERIFIED (abstract) |
| Implied > shown monster; creeping dread ≠ startle | Martin 2019, *Frontiers in Psychology* | SECONDARY |

## Player UX

| Claim | Source | Grade |
| --- | --- | --- |
| Non-text UI / meaningful graphics need ≥3:1 contrast (the silhouette floor) | WCAG 2.1 SC 1.4.11 (W3C / Deque) | VERIFIED (multi-source) |
| Dark-on-light reads faster than light-on-dark → dark UI starts at a deficit | Piepenbrock et al. 2013, *Ergonomics* (via NN/g) | SECONDARY |
| **Crowding**, not acuity, limits recognition in clutter → anti-dense-grid | Pelli & Tillman 2008; Bouma-law revisions | VERIFIED (abstract) |
| Win **sound** raises arousal + win-overestimation (24% vs 15%) | Collins/Harrigan/Dixon 2013/14, *J. Gambling Studies* | SECONDARY (press numbers) |
| **Sound** makes losses-disguised-as-wins feel like wins; negative sound unmasks them | Dixon et al. 2010 / 2015 / 2020 (LDW series) | VERIFIED (venue) |
| HUD removal raises immersion **for experts** (diegetic framing, with a novice caveat) | Iacovides, Cox et al. 2015, CHI PLAY | VERIFIED |
| Pacing 2.2–2.6s was **craft lore**, not evidence → moved to ~2.5–3.0s | (flagged by FLOOR as unsupported) | LORE |

## Sound / psychoacoustics

| Claim | Source | Grade |
| --- | --- | --- |
| Sensory dissonance/roughness peaks ~¼ critical band (the unease lever) | Plomp & Levelt 1965; Zwicker & Fastl | SECONDARY |
| Nonlinear/chaotic vocal features rate as fearful (scream signature) | Trevino/Blumstein 2020, *JASA* 147(6) | SECONDARY |
| Slow-onset drones engage sustained anxiety (BNST), not phasic startle | startle-reflex literature | SECONDARY |
| Startle is gated by **rise-time** → **≥120ms attack** rule | acoustic-reflex literature | SECONDARY |
| Shepard endless-rise = unresolved tension (→ figure-proximity cue) | Shepard 1964 | VERIFIED (illusion) / SECONDARY (anxiety) |
| Missing fundamental gives felt low-end on small speakers (replaces infrasound) | virtual-pitch perception | VERIFIED (perception) |
| **The 19Hz "fear frequency" is a myth** — single unreplicated anecdote; use missing fundamental instead | Tandy & Lawrence 1998 + skeptical replications; MacEwan 2026 found only subtle effects requiring a high-SPL subwoofer | MYTH (rejected) |

## Build feasibility (engineering evidence)

| Claim | Source | Grade |
| --- | --- | --- |
| Screenshots vary by GPU/OS/font/browser; compare in the env that made the baseline | Vitest visual-regression + Playwright snapshot docs | VERIFIED |
| pixelmatch ignores anti-aliased pixels by default → 0.05 doesn't drown in AA | pixelmatch README | VERIFIED |
| Cross-Chromium raster variance + dark-drift | in-repo `docs/LEARNINGS.md` 2026-06-12 | VERIFIED (first-party) |
| `prefers-reduced-motion` is a named accessibility requirement | WCAG 2.3.3 | VERIFIED |
| Command/queue pattern = resolve-then-present (decoupled producer/consumer, replay) | Nystrom, *Game Programming Patterns* | VERIFIED |
| AudioContext is suspended outside a gesture; resume on click | MDN Web Audio best practices | VERIFIED |
| Buffer sources are one-shot + auto-GC; granular swarm is CPU-bounded | MDN AudioBufferSourceNode; granular-synthesis writeups | VERIFIED |

## Meta-audit (the loop audits itself)

A ninth agent red-teamed all eight experts. Verdict: the design is **buildable,
not brittle, and operator-aware of trade-offs**; groupthink was moderate and
compartmented; the psychology is secondary-sourced but not core to the mechanics.
Three "incomplete-spec handoffs" were found and fixed in this plan:

1. **Outcome-script shape undefined** — the #1 one-shot failure risk → frozen as
   `OutcomePhase`/`ResolvedOutcome` in `contract.ts` before any feature code
   (ADR-0010).
2. **Proximity-variable ownership unspecified** (race risk) → decided as
   seed-deterministic session state, never wall-clock (ADR-0012).
3. **`?lightsOn=1` baseline didn't exist** (scaffold dark-only) → PR1 builds both
   baselines (ADR-0011).

Per-expert upgrades adopted: FREQ cites implementable facts not unread papers;
DREAD's arousal curve is mapped to audio phases; FOLEY's buses get named
contours; SYNTH's CPU tuning becomes a build-time checklist; JINGLE gets a 100ms
"punch floor"; the three live tensions are surfaced in SPEC.md.
