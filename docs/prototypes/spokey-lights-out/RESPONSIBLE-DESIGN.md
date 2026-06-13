# SPOKEY: LIGHTS OUT — responsible-design record

> Governance artifact (ADR-0019). SPOKEY reproduces the psychology of extractive
> slot design *to study and counter it*, inside a hard no-stakes frame. This file
> is the ledger that keeps that honest: what we build and why it's safe, and —
> the part almost nobody ships — **what we deliberately refuse to build, and the
> harm rationale.** Evidence grades live in [`EVIDENCE.md`](EVIDENCE.md).

## The safety-frame doctrine

The research is blunt that gambling addiction and the *love of horror* run on the
same dopaminergic machinery (sensation-seeking, reward circuitry, frontocortico-
striatal risk evaluation — EVIDENCE.md § Recreational fear, § Individual
differences). The **only** thing separating an adaptive thrill from a captured
brain is an intact **cognitive safety frame**: horror delivers the neurochemical
hit *without* the destructive neuroplasticity, *because* the prefrontal cortex
keeps meta-awareness that the threat is simulated, and instrumental contingency
learning stays intact (Zillmann; the safety-frame synthesis). Collapse the frame
and the same stimulus codes as trauma or addiction.

SPOKEY is a responsible study instrument **iff all four hold**:

1. **No real stakes — ever.** No money, wagering, payment, or account data
   (ADR-0001, AGENTS.md). Outcomes are placeholder. This is the frame that can
   never be allowed to collapse; it is non-negotiable and not a toggle.
2. **The safety frame is preserved, not exploited.** We never try to dissolve the
   player's meta-awareness (that is the Machine Zone — declined below).
3. **Every mechanism is legible.** Each extractive lever is named, evidence-
   graded, and inspectable (`?debug=1`, the cue log, this file) — the opposite of
   a dark pattern, which depends on *not* being seen.
4. **Every extractive lever ships beside an honest counterpart.** The prototype
   must be able to demonstrate *both* sides of the research (ADR-0013/0014), so
   it is a study of the mechanism, never a delivery vehicle for it.

When a proposed lever cannot satisfy all four, it goes on the refuse-list.

## The lever matrix (what we DO build)

Every behavioral lever in the prototype, its default, its honest counter-toggle,
and the harm it models. All are reversible by config flag (ADR-0014: a future
build can flip to the fully responsible configuration with no code change).

| Lever | Default | Honest counter | Evidence | Harm it models | Reversible |
| --- | --- | --- | --- | --- | --- |
| **near-miss beat** (`nearMiss`) | ON (extractive) | OFF disables the late-reel drag/cue | Clark 2009 VERIFIED; Chase & Clark 2010 (severity↔midbrain) VERIFIED; replication *mixed* (Palmer 2024) | a structural loss dressed as "almost" — recruits win circuitry on a non-event | flag |
| **LDW celebration** (`ldwHonest`) | OFF = celebratory (extractive) | ON = a negative/quiet tone that *unmasks* the loss-disguised-as-win | Dixon LDW series VERIFIED | sound re-coding a net loss as a win (win-overestimation) | flag |
| **hidden held values** (`hiddenValues`) | ON = dread/uncertainty | OFF = values shown (market control) | Fiorillo 2003 (uncertainty peak) VERIFIED; "hidden beats visible" VERIFIED-null | anticipation engineered at maximum uncertainty | flag |
| **stop button** (`stopButton`) | ON, **diegetic only** (no mechanical effect) | config option; never wired to a real outcome | Ladouceur & Sévigny 2005 VERIFIED | the illusion of control | flag |
| **relief resolution** (`reliefResolves`, PR-B) | **ON = resolved ending** (the *responsible* default) | OFF = withheld resolution (the extractive variant, for study) | Zillmann excitation-transfer VERIFIED | trapped arousal that keeps a player seeking resolution | flag |

Note the deliberate inversion in the last row: for the relief beat the **honest
behavior is the default** and the extractive variant is the opt-in — because a
resolved ending completes the catharsis and lets the player put the game *down*
(the exposure-therapy framing), whereas withholding resolution is the stickier,
harm-aligned choice. Recorded in ADR-0020.

## THE REFUSE-LIST (what we will NOT build)

These are levers the same research describes — each would make the prototype
*stickier* — that this repo **declines**. Documented here so the refusal is
legible and auditable, not a silent omission. For each: the mechanism, why
building it crosses from *studying* harm to *manufacturing* it, and what it would
technically take (so the line is concrete, not hand-waved).

### 1. The Machine-Zone trance loop — DECLINED

- **Mechanism:** a session-state feedback loop (cumulative arousal × pacing ×
  near-loss cadence) tuned to maximise dissociative immersion — the "zone" where
  time, self, and distress dissolve and the player continues *not to win but to
  keep playing* (Schüll 2012, VERIFIED).
- **Why it crosses the line:** engineering dissociation is the *core harm vector*
  of machine gambling, and it directly attacks safety-frame criterion #2. It
  doesn't model a mechanism for study — it *is* the trap.
- **Would require:** an across-spin `session` accumulator feeding a real-time
  arousal/pacing controller in `scene.ts`. We will not build the controller.
  (The pre-baked, *fixed* per-phase arousal curve we ship is bounded and
  legible — it is not a closed feedback loop on the player.)

### 2. Loss-chasing reinforcement — DECLINED

- **Mechanism:** detect a losing streak and escalate prompts/intensity/"so close"
  framing to pull the player back in after losses.
- **Why it crosses the line:** this directly exploits reversal-learning collapse
  and punishment-insensitivity — i.e. it targets the precise neurocognitive
  deficit that produces financial ruin (EVIDENCE.md § Addiction & persistence).
  Modelling the deficit in the literature is study; building a system to exploit
  it is the harm itself.
- **Would require:** session loss-tracking + a re-engagement scheduler. Not built.

### 3. Per-player reward-sensitivity / RDS tuning — DECLINED

- **Mechanism:** profile an individual's dopamine/response signature (a Reward-
  Deficiency proxy) and personalise pacing, payout cadence, or arousal to their
  vulnerability.
- **Why it crosses the line:** individualised exploitation — the inverse of care.
  It requires profiling the player to find and pull their specific lever; the
  evidence (RDS, sensation-seeking typologies) is documented to *understand*
  vulnerability, explicitly not to target it.
- **Would require:** per-player behavioral profiling + adaptive difficulty. Not
  built; SPOKEY treats every session identically and deterministically by seed.

### 4. Covert player-behavior measurement — DECLINED (and out of scope)

- **Mechanism:** wire the stop button (or any control) to a real effect and
  silently measure whether the player *believes* it works vs. how they behave —
  the live illusion-of-control / contingency-detection experiment.
- **Why it crosses the line:** that is **human-subjects research** and needs
  ethics oversight (IRB) and informed consent. A prototype must not quietly run
  experiments on people. The illusion-of-control mechanism stays *diegetic and
  legible*, never a covert instrument.
- **Would require:** functional control wiring + player-belief logging. Not built.
  (Any genuine study of real players belongs in a consented, IRB-approved
  protocol, not in shipped game code.)

### 5. Sensation-seeking typology targeting — DECLINED

- **Mechanism:** infer the player's horror/risk type (gore / thrill / white-
  knuckler) and tune the experience to their profile to maximise time-on-device.
- **Why it crosses the line:** same failure as #3 — turning a descriptive
  typology into a targeting system aims the design at the player's vulnerability.
- **Would require:** type inference + per-type content variants wired to a
  retention objective. The typologies stay in EVIDENCE.md as *understanding*, not
  a feature.

## Enforcement

- **Policy (ADR-0019):** a behavioral lever may ship only if it satisfies the
  four doctrine criteria *and* carries an honest counterpart + a graded source;
  any lever that would dissolve the safety frame, exploit a named deficit,
  profile the player, or measure real people goes on the refuse-list with its
  rationale.
- **Audit:** the standing pre-push meta-audit checks new levers against this file
  and verifies evidence grades against their actual sources (no overclaiming).
- **Reversibility:** the whole extractive default set flips to responsible by
  flag (ADR-0014) — the study can become the safe demo without a rewrite.
