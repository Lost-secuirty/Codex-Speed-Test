// =====================================================================
// FROZEN CONTRACT (PR0) — the outcome script + cue vocabulary that PR1
// (resolver/base game) and PR3 (audio) build against. Defining this BEFORE
// feature code is the meta-audit's #1 fix: the hold&win presenter's
// complexity explodes without a typed outcome shape (ADR-0010).
//
// Types only — no runtime, no Pixi, no WebAudio. Placeholder outcomes
// only; NO real RTP/math (ADR-0001).
// =====================================================================

/** One step the dumb presenter plays; the pure resolver emits a capped list. */
export type PhaseKind =
  | 'spin' // reels travel and settle
  | 'lock' // hold symbols snap and stay
  | 'respin' // held board respins the free cells
  | 'reveal' // flashlight sweep reveals held values (hidden-value path)
  | 'trigger' // figure arrives → LIGHTS OUT begins
  | 'settle'; // idle resolution

/** A single animation phase. The presenter never re-resolves mid-phase. */
export interface OutcomePhase {
  kind: PhaseKind;
  /** reel indices this phase acts on (e.g. which reels settle/respin). */
  reels?: number[];
  /** flat cell indices this phase acts on (e.g. which cells lock/reveal). */
  cells?: number[];
  /** delta added to figure proximity (0..1) when this phase plays (ADR-0012). */
  proximityStep?: number;
  /** the audio cue this phase fires, asserted by verify.mjs ordering (ADR-0015). */
  cue?: CueName;
  /** wall-clock budget for the phase; reducedMotion scales this via timeScale. */
  durationMs: number;
}

/** The complete, synchronously-computed result of one spin (ADR-0010). */
export interface ResolvedOutcome {
  /** final symbol layout, board[reel][row] — what the presenter renders. */
  board: string[][];
  phases: OutcomePhase[];
  /** total win for this outcome (placeholder, not RTP math — ADR-0001). */
  total: number;
  /** hold&win bookkeeping: which cells are locked and the running total. */
  accumulator: { locked: number[]; total: number };
  /** the seed that produced this outcome — reproducible for tests/baselines. */
  seed: number;
}

/** Synthesized audio cues (ADR-0015). The cue LOG asserts these by name/order;
 *  playback is a separate thin layer. ≥120ms attack on every one. */
export type CueName =
  | 'drone-start'
  | 'spin-loop'
  | 'reel-stop'
  | 'near-miss'
  | 'rollup'
  | 'win-celebrate'
  | 'ldw' // loss-disguised-as-win: extractive default
  | 'ldw-honest' // negative tone that unmasks the LDW (Dixon 2020; config toggle)
  | 'figure-near' // Shepard endless-rise step
  | 'swarm-tick' // one granular skitter grain
  | 'feature-trigger'
  | 'lights-out-tick' // one held tile captured during the feature
  | 'jackpot'; // full-board blackout
