// Pure audio cue model (ADR-0015): the math and types behind the synthesized
// soundscape, with ZERO WebAudio — fully unit/mutation testable. The thin
// WebAudio layer (playback.ts) consumes CueIntents; prototypes own their
// cue→intent tables (prototype-local, ADR-0004) and register them through
// sound.ts. Design laws encoded here:
//   - "unease, never jump-scare" = every attack ≥ MIN_ATTACK_MS (startle is
//     gated by rise-time); a 100ms punch floor exists but only via explicit
//     opt-in, never below (ADR-0015).
//   - wins scale DOWN as the figure nears (dread outranks juice, ADR-0014/15).
//   - the swarm is voice-capped (CPU budget is a design input, not a hope).
//   - LDW: a "win" below threshold is a loss-disguised-as-win; the extractive
//     default celebrates it, the honest toggle unmasks it (Dixon; ADR-0014).

/** The four buses (ADR-0015). */
export type BusName = 'bed' | 'mid' | 'events' | 'stingers';

/** What playback.ts knows how to synthesize. */
export type SynthKind =
  | 'drone' // detuned low oscs + missing-fundamental stack (bed)
  | 'glass' // sparse ambiguous mid layer
  | 'blip' // short tick (reel-stop, lights-out-tick, rollup steps)
  | 'arp' // cold minor arpeggio (win family)
  | 'descend' // falling minor 2nd — the honest LDW unmask
  | 'shepard' // endless-rise layer step (figure proximity)
  | 'grain' // granular skitter burst (the swarm)
  | 'cut-swell' // silence-then-swell (feature trigger / jackpot — escalate by subtraction)
  | 'noise-tick'; // filtered noise transient (spin loop start)

/** One cue's synthesis intent — everything playback needs, nothing it decides. */
export interface CueIntent {
  bus: BusName;
  kind: SynthKind;
  /** base frequency in Hz (interpretation depends on kind). */
  freq: number;
  /** attack in ms; playback applies clampAttack() — never below the floor. */
  attackMs: number;
  /** total duration in ms (bounded; nothing rings unbounded except the bed). */
  durationMs: number;
  /** 0..1 pre-mix gain; proximity/LDW scaling multiplies on top. */
  gain: number;
  /** sustained intents (the bed) hold at peak instead of decaying to silence;
   *  durationMs then only bounds the swell. Teardown is dispose/mute. */
  sustain?: boolean;
}

/** The startle gate: rise-times faster than ~120ms read as jump-scare. */
export const MIN_ATTACK_MS = 120;
/** The opt-in "punch floor" (ADR-0015): allowed only if play-feel is dull. */
export const PUNCH_FLOOR_MS = 100;

/** Clamp an intent's attack to the law. `punch` opts into the 100ms floor. */
export function clampAttack(attackMs: number, punch = false): number {
  const floor = punch ? PUNCH_FLOOR_MS : MIN_ATTACK_MS;
  return attackMs < floor ? floor : attackMs;
}

/**
 * Win-cue gain scaling by figure proximity (0..1): full juice in safety,
 * receding to `floor` as the figure arrives — the dark wins over the slot.
 */
export function winGainForProximity(proximity: number, floor = 0.35): number {
  const p = proximity < 0 ? 0 : proximity > 1 ? 1 : proximity;
  // a config floor outside [0,1] would silently INVERT the duck (audit L1).
  const f = floor < 0 ? 0 : floor > 1 ? 1 : floor;
  return 1 - (1 - f) * p;
}

/** Phases of the feature's pre-baked arousal curve (DREAD's upgrade). */
export type ArousalPhase = 'idle' | 'lock' | 'hold' | 'approach' | 'trigger';

const AROUSAL: Record<ArousalPhase, number> = {
  idle: 0.2,
  lock: 0.45,
  hold: 0.6,
  approach: 0.8,
  trigger: 1,
};

/** The bed/mid level for a feature phase — pre-baked, not realtime-modulated. */
export function arousalLevel(phase: ArousalPhase): number {
  return AROUSAL[phase];
}

/** Swarm grain voices for a wanted density, hard-capped (SYNTH's budget). */
export function swarmVoices(wanted: number, cap: number): number {
  if (wanted < 0) return 0;
  return wanted > cap ? cap : Math.floor(wanted);
}

/**
 * The settle cue for a base-game total (ADR-0014): nothing on a true loss,
 * `ldw`/`ldw-honest` on a below-threshold "win", celebration at/above it.
 */
export function settleCue(
  total: number,
  ldwThreshold: number,
  honest: boolean,
): 'win-celebrate' | 'ldw' | 'ldw-honest' | undefined {
  if (total <= 0) return undefined;
  if (total < ldwThreshold) return honest ? 'ldw-honest' : 'ldw';
  return 'win-celebrate';
}

/** Shepard layer descriptor: `count` octave-spaced layers, raised-cosine
 *  loudness over log-frequency position (the classic recipe). */
export function shepardLayerGain(position01: number): number {
  // raised cosine: 0 at both spectral edges, 1 at center.
  const p = position01 < 0 ? 0 : position01 > 1 ? 1 : position01;
  return 0.5 - 0.5 * Math.cos(2 * Math.PI * p);
}
