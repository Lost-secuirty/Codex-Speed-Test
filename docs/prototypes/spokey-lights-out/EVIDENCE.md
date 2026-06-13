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

> **Round 2 (2026-06-12, before/after):** every SECONDARY row was re-verified
> against independent sources (PubMed, Frontiers, Sage, JASA, GREO, NN/g,
> trade press). Grades below show `OLD → NEW (R2)` where they moved. Tooling
> honesty: direct page fetches were globally 403-blocked in round 2, so
> promotions rest on abstract-level snippet reads from independent hosts —
> "VERIFIED (abstract)" per the rubric, no full texts. Outcome: 9 promotions,
> 3 honest holds, **3 citation errors found and fixed in place** (flagged
> "R2-corrected"), and no design decision contradicted. The round-2 record is
> at the bottom of this file.

> **Round 3 (2026-06-13, the research-ingestion arc):** the operator supplied
> seven research syntheses; this pass folds their mechanisms in as graded claims
> (the four new § sections below) and upgrades held rows where a primary now
> verifies. Honesty rule held: the docs are *syntheses*, so a claim is graded
> SECONDARY (synthesis-sourced) unless a primary abstract was independently
> read this round — four were (punishment-insensitivity, near-miss↔SOGS,
> excitation-transfer, the Machine Zone). The R3 record is at the bottom.

## Game design

| Claim (→ where it lands) | Source | Grade |
| --- | --- | --- |
| Near-misses recruit win-related circuitry, raise motivation | Clark et al. 2009, *Neuron* 61:481 (fMRI) | VERIFIED |
| Near-miss replication picture is **mixed** → demote to flavor/toggle (ADR-0014): the 2024 conceptual reps *replicated* motivation-to-continue, speed, and bet-size effects; the **valence** hypothesis flipped and long-run persistence stays contested | Palmer, Ferrari & Clark 2024, *Psych. Addict. Behav.* 38(6):716–727 (**R2-corrected** — round 1 misattributed this to Barton/Sescousse in *J. Gambling Studies* and overstated "fails to replicate") | SECONDARY → VERIFIED (abstract, R2) |
| Anticipatory dopamine peaks at **maximum uncertainty** (backs hidden-value engine) | Fiorillo, Tobler & Schultz 2003, *Science* | VERIFIED (abstract) |
| Stop buttons inflate illusion-of-control (87% believed they could influence symbols) | Ladouceur & Sévigny 2005, *J. Gambling Studies* | VERIFIED (abstract) |
| Faster play → worse inhibition / more harm; UK capped slots ≥2.5s | Harris & Griffiths 2018, *J. Gambling Studies* (review) | VERIFIED (abstract) |
| Hold&win is a huge, surging market (Lightning Link progenitor; values **shown**) | EKG Game Performance Report May 2024 via GGB Magazine: Dragon Link & Lightning Link **#1/#2 top-grossing premium-leased**, "highest-yielding game families in the industry"; "a must-have for all major suppliers" (R2). The granular Eilers & Krejcik mechanic-preference tables stay paywalled; "hundreds of clones" stays uncounted | SECONDARY → VERIFIED (trade-press, R2) |
| **No evidence hidden-value beats visible** → build it as A/B (ADR-0013) | (absence finding — searched, not found) | VERIFIED (null) |

## Horror / dread

| Claim | Source | Grade |
| --- | --- | --- |
| Fear of the unknown is the fundamental fear ("perceived absence of information") | Carleton 2016, *J. Anxiety Disorders* 41:5–21 (R2: volume corrected from 39) | SECONDARY → VERIFIED (abstract, R2) |
| Uncertainty about future threat drives anticipatory anxiety | Grupe & Nitschke 2013, *Nat. Rev. Neuroscience* 14:488–501 (R2: UAMA model confirmed) | SECONDARY → VERIFIED (abstract, R2) |
| Suspense = a prediction state from instability/uncertainty | Lehne & Koelsch 2015, *Frontiers in Psychology* ("Toward a general psychological model of tension and suspense") | SECONDARY → VERIFIED (abstract, R2) |
| Recreational fear is an **inverted-U** (too little = boring) → restraint frames peaks | Andersen, Schjoedt, Clasen et al. 2020, *Psychological Science* "Playing With Fear" (Aarhus haunted house, N=110) | SECONDARY → VERIFIED (abstract, R2) |
| Amygdala response **decrements** with repetition → "one pair of eyes, not twenty" | Plichta et al. 2014, *NeuroImage* | VERIFIED (abstract) |
| Implied > shown monster; creeping dread ≠ startle | Martin 2019, *Frontiers in Psychology* 10:2298 (R2: review real, implied>shown sub-claim stayed unread; R3: excitation-transfer + threat-simulation corroborate the *direction* — anticipation maximises transfer — but the Martin-specific sub-claim still unread) | SECONDARY (held, R2/R3) |

## Player UX

| Claim | Source | Grade |
| --- | --- | --- |
| Non-text UI / meaningful graphics need ≥3:1 contrast (the silhouette floor) | WCAG 2.1 SC 1.4.11 (W3C / Deque) | VERIFIED (multi-source) |
| Dark-on-light reads faster than light-on-dark → dark UI starts at a deficit | Piepenbrock et al. 2013, *Ergonomics* 56(7) (R2: confirmed for acuity + proofreading, both age groups; companion 2014 pupil-size paper) | SECONDARY → VERIFIED (abstract, R2) |
| **Crowding**, not acuity, limits recognition in clutter → anti-dense-grid | Pelli & Tillman 2008; Bouma-law revisions | VERIFIED (abstract) |
| Win **sound** raises arousal + win-overestimation (24% vs 15%) | Dixon, Harrigan, Santesso, Graydon, Fugelsang & Collins 2013, *J. Gambling Studies* (R2: exact numbers confirmed via GREO synopsis + Springer abstract, n=96) | SECONDARY → VERIFIED (abstract, R2) |
| **Sound** makes losses-disguised-as-wins feel like wins; negative sound unmasks them | Dixon et al. 2010 / 2015 / 2020 (LDW series) | VERIFIED (venue) |
| HUD removal raises immersion **for experts** (diegetic framing, with a novice caveat) | Iacovides, Cox et al. 2015, CHI PLAY | VERIFIED |
| Pacing 2.2–2.6s was **craft lore**, not evidence → moved to ~2.5–3.0s | (flagged by FLOOR as unsupported) | LORE |

## Sound / psychoacoustics

| Claim | Source | Grade |
| --- | --- | --- |
| Sensory dissonance/roughness peaks ~¼ critical band (the unease lever) | Plomp & Levelt 1965, *JASA* 38:548–560 (R2: confirmed; open PDF exists at mpi.nl); Zwicker & Fastl | SECONDARY → VERIFIED (abstract, R2) |
| Nonlinear/chaotic roughness = scream signature, mimicked by scary music | Trevor, Arnal & Frühholz 2020, *JASA* 147(6):EL540 (**R2-corrected** — round 1 misattributed to "Trevino/Blumstein"; Blumstein's related work is the 2010 *Biology Letters* nonlinear-soundtracks paper) | SECONDARY → VERIFIED (abstract, R2) |
| Slow-onset drones engage sustained anxiety (BNST), not phasic startle | startle-reflex literature (R2: no single primary BNST-drone source; R3: the parallel mechanism — sustained negative-reinforcement / affect-regulation, the Machine Zone, VERIFIED — is now sourced, but the specific BNST-drone attribution stays unverified) | SECONDARY (held, R2/R3) |
| Startle is gated by **rise-time** → **≥120ms attack** rule | Blumenthal 1986, *Psychophysiology* (R2: startle declines as rise-time grows; full mitigation needs ~141–220ms, so ≥120ms is sound and slightly conservative — note 140ms+ as the fully-no-startle floor) | SECONDARY → VERIFIED (abstract, R2) |
| Shepard endless-rise = unresolved tension (→ figure-proximity cue; **the relief beat resolves it**, PR-B) | Shepard 1964 (R2: anxiety half craft-corroborated only; R3: the *mechanism* — unresolved arousal stays trapped in negative affect, excitation-transfer/Zillmann, VERIFIED — is now sourced; a Shepard-specific anxiety study still didn't surface) | VERIFIED (illusion) / SECONDARY (anxiety, held R2/R3) |
| Missing fundamental gives felt low-end on small speakers (replaces infrasound) | virtual-pitch perception | VERIFIED (perception) |
| **The 19Hz "fear frequency" is a myth** — single unreplicated anecdote; use missing fundamental instead | Tandy & Lawrence 1998 + skeptical replications; MacEwan 2026 found only subtle effects requiring a high-SPL subwoofer | MYTH (rejected) |

## Addiction & persistence (R3)

Why people keep going back to what hurts them — the mechanism layer behind the
extractive levers. Load-bearing for the refuse-list (RESPONSIBLE-DESIGN.md) and
ADR-0019/0020, not for any shipped lever.

| Claim (→ where it lands) | Source | Grade |
| --- | --- | --- |
| **Punishment insensitivity = a failure of *instrumental contingency learning*, NOT numbness.** Insensitive subjects disliked the aversive outcome *equally* (Pavlovian fear intact) but failed to encode the action→punisher link, so they couldn't withhold the punished behaviour. The humane reframe: people feel the loss fully; the wiring that turns suffering into "change the choice" is what breaks. (→ ADR-0019 doctrine; the refuse-list's harm model) | Jean-Richard-dit-Bressel, Killcross & McNally, eLife 2021 (PMC8177883) + eLife 2018 9:e52765 ("impaired contingency detection, not aversion insensitivity or reward dominance") | VERIFIED (abstract) |
| Gambling **severity** (SOGS) predicts the dopaminergic-midbrain response to **near-misses** specifically — and is *not* associated with the response to actual wins | Chase & Clark 2010, *J. Neurosci.* 30(18):6180 (fMRI, n=20) | VERIFIED (abstract) |
| **The Machine Zone:** machine gambling pulls players into a dissociative trance; once in "the zone" they play *not to win but to keep playing* — affect-regulation / negative reinforcement, the money is the cover story. Addiction framed as human–machine interaction, the machine engineered for "continuous productivity." (→ the #1 declined lever; ADR-0020's anti-thesis) | Schüll, *Addiction by Design* (Princeton 2012), 15-yr Las Vegas ethnography | VERIFIED (book) |
| Loss chasing = compulsion to recover losses by escalating wagers after a loss (no stop-loss); the loss's pain flips from brake to accelerant under weakened prefrontal control | synthesis (cites neuroeconomics + reversal-learning literature, PMC3249486) | SECONDARY |
| Reversal-learning collapse / D2 down-regulation: addicted brains can't overwrite an ingrained "action = reward" rule when contingencies flip; variable-ratio exposure blunts D2 sensitivity → escalation | synthesis (cites frontocorticostriatal reversal-learning work) | SECONDARY |

## Individual differences (R3)

Who is most exposed — documented to *understand vulnerability*, explicitly NOT
to target it (that targeting is on the refuse-list).

| Claim | Source | Grade |
| --- | --- | --- |
| **Sensation seeking** (Zuckerman, 4 dims: thrill/experience/disinhibition/boredom-susceptibility) predicts BOTH a preference for horror/intense media AND substance-use vulnerability — a shared psychometric root (demand for intense input) | synthesis (Zuckerman SSS; foundational, not independently re-read this round) | SECONDARY |
| **Reward Deficiency Syndrome:** chronic hypodopaminergia (DRD2/Taq1A → lower striatal D2 density) → everyday rewards under-satisfy → biological pull toward high-arousal/risky stimuli; if steered off chemicals, the drive may channel into horror/extreme recreation instead | synthesis (Blum; RDS is a *contested* construct — graded accordingly) | SECONDARY (contested) |

## Recreational fear & the safety frame (R3)

The horror-side mechanism — and the exact line that makes a no-stakes horror
study instrument *responsible*. This section is the evidentiary spine of
RESPONSIBLE-DESIGN.md's safety-frame doctrine and of the relief beat (PR-B).

| Claim (→ where it lands) | Source | Grade |
| --- | --- | --- |
| **Excitation-transfer:** sympathetic arousal outlasts the cognitive appraisal that caused it, so residual fear-arousal *transfers* to the relief when the threat resolves — amplifying it. **Resolved/"happy" endings maximise the payoff;** unresolved endings leave arousal trapped in negative affect. (→ the relief beat: the Shepard resolves, a relief cue lands — `reliefResolves` default TRUE) | Zillmann, Excitation-Transfer Theory (1971+); rev. e.g. *Communication Research* 2017 44(1):29–53 | VERIFIED (abstract) |
| **The safety frame:** the entire neurochemical reward of horror is predicated on the PFC holding meta-awareness that the threat is simulated; collapse the frame (real danger) and excitation-transfer fails, coding the event as trauma. Horror fans retain *intact* instrumental contingency learning — they know the boundary. (→ the doctrine: no money + intact safety frame = study, not trap) | synthesis (recreational-fear / threat-simulation literature; Clasen/Andersen/Scrivner) | SECONDARY |
| **Benign masochism** (Rozin): learned hedonic reversal — pleasure from safely "tricking" ancient survival instincts (chili, horror); uniquely human | synthesis (Rozin; PubMed 35583224) | SECONDARY |
| Horror **viewer typologies** (gore / thrill / independent / white-knuckler) differ by empathy × sensation-seeking × distress-tolerance → no single audience; high-empathy "emotional contagion" viewers avoid gore | synthesis (Clasen/Scrivner morbid-minds typology) | SECONDARY |
| Horror as **self-directed exposure therapy:** externalise anxiety onto a fictional monster, feel the dread in a controlled frame, process it when it ends — emerging support for anxiety/depression | synthesis (recreational-fear/depression work, e.g. PMC12212089) | SECONDARY (emerging) |

## Market & popularity (R3)

| Claim | Source | Grade |
| --- | --- | --- |
| Gambling is **not** uniformly "recession-proof": casino/EGM spend is pro-cyclical (falls in downturns) while **lottery/scratch is recession-resistant and rises with personal financial hardship** (Iceland 2008 longitudinal: past-year gambling +10.7pp 2007→2011, driven by lotto/scratch; EGM the only type to fall) | synthesis (Icelandic longitudinal + US/Sweden/Ireland corroboration) | SECONDARY |
| Hold&win is the top-earning mechanic family (premium-leased) — see Game design row (EKG/GGB) | EKG GPR May 2024 via GGB | VERIFIED (trade-press) |

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

## Round 2 — before/after (2026-06-12)

Scott's "source findings from scientific studies and popularity polls, before
and after" rule, executed as a dedicated re-verification pass over every
SECONDARY row. Method honesty: direct page fetches were globally 403-blocked
this session, so promotions rest on abstract-level snippet reads from
independent hosts (PubMed, Frontiers, Sage, JASA, GREO, NN/g, GGB) — enough for
"VERIFIED (abstract)" per the rubric, no full texts.

**Outcome:** 9 promotions, 3 honest holds, 3 citation errors corrected in place.

- **Promoted to VERIFIED (abstract):** Carleton 2016 (vol. corrected to 41:5–21),
  Grupe & Nitschke 2013, Lehne & Koelsch 2015, Andersen/Schjoedt/Clasen 2020,
  Piepenbrock 2013, Dixon et al. 2013 (24% vs 15%, n=96 confirmed), Plomp &
  Levelt 1965, Trevor/Arnal/Frühholz 2020, Blumenthal 1986. **Promoted to
  VERIFIED (trade-press):** hold&win market dominance (EKG GPR May 2024 via GGB —
  Dragon/Lightning Link #1/#2 premium-leased).
- **Held SECONDARY (honest):** Martin 2019 (review real; the implied>shown
  sub-claim is section-level and stayed unread), slow-onset/BNST drone
  attribution, the Shepard *anxiety* half (craft-corroborated, no lab study).
- **Citation errors corrected:** (1) the scream-roughness JASA paper is
  **Trevor, Arnal & Frühholz 2020**, not "Trevino/Blumstein"; (2) the near-miss
  2024 reps are **Palmer, Ferrari & Clark 2024, *Psych. Addict. Behav.*
  38(6):716–727**, not Barton/Sescousse in *J. Gambling Studies*; (3) that row's
  "persistence fails to replicate" overstated it — Palmer 2024 *replicated*
  motivation/speed/bet-size; only the *valence* hypothesis flipped, so it now
  reads "mixed picture." None of this contradicts a design decision — the
  `nearMiss` A/B toggle is, if anything, better justified by mixed literature,
  and Blumenthal 1986 newly *quantifies* the ≥120ms attack rule (full startle
  mitigation ~141–220ms).
- **Popularity dimension (was thin):** hold&win is independently the top-earning
  mechanic family in the premium-leased category (EKG/GGB, VERIFIED trade-press);
  the granular Eilers & Krejcik mechanic-preference tables stay subscriber-
  paywalled, and dark/horror-slot "popularity" is affiliate-marketing LORE
  (directional only, not citable).

## Round 3 — research ingestion (2026-06-13)

The operator supplied seven research syntheses; this pass turns the
psychology/market layer into graded claims so none of it is wasted. Four new §
sections (Addiction & persistence; Individual differences; Recreational fear &
the safety frame; Market & popularity) and three held rows updated.

**Method honesty (unchanged rubric):** the docs are *syntheses of* primary
work, so a claim is SECONDARY unless its primary abstract was independently read
this round. **Four were independently verified** and graded VERIFIED:

- **Punishment insensitivity = failure of instrumental contingency learning**
  (eLife 2021 PMC8177883; eLife 2018 e52765) — the load-bearing humane reframe:
  felt pain is intact, the action→harm mapping is the deficit. Anchors ADR-0019
  and the refuse-list's harm model.
- **Near-miss ↔ SOGS severity** (Chase & Clark 2010, *J. Neurosci.* 30:6180) —
  midbrain near-miss response scales with gambling severity, win response does
  not. Strengthens the `nearMiss` A/B's importance.
- **Excitation-transfer** (Zillmann) — resolved endings maximise the relief
  payoff; unresolved leaves arousal trapped. Directly justifies the relief beat
  (PR-B) and upgrades the Shepard-anxiety *mechanism*.
- **The Machine Zone** (Schüll, *Addiction by Design* 2012) — the dissociative
  "play not to win but to keep playing" trance. Anchors ADR-0020's anti-thesis
  (horror resists the zone) and the #1 declined lever.

**Graded SECONDARY (synthesis-sourced, honest):** loss-chasing, reversal-
learning collapse, sensation-seeking (Zuckerman), Reward Deficiency Syndrome
(noted *contested*), the safety frame, benign masochism, horror typologies,
horror-as-exposure-therapy, recession/lottery-vs-EGM market data.

**No design decision was contradicted.** The research's main *additive* effect
is the new responsible-design artifacts (RESPONSIBLE-DESIGN.md, ADR-0019/0020)
and one evidence-backed lever (the relief beat) — plus the explicit refuse-list
of levers the same research describes that this repo will **not** build.
