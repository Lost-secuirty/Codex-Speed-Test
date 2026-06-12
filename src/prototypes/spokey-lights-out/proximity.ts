// Figure proximity as seed-deterministic session state (ADR-0012). The thin
// figure on the road "arrives" across spins; `proximity` runs 0→1 and is
// advanced ONLY by spin outcomes — never wall-clock or a ticker — so a snapshot
// is reproducible and the trigger is race-free. The base resolver attaches the
// per-spin delta to its settle phase (`OutcomePhase.proximityStep`); the
// presenter accumulates it and, at 1, fires LIGHTS OUT. Audio reads the same
// scalar in PR3. Pure; mutation-probe prey.

import { clamp01 } from './visibility';

/** Proximity at which the figure has arrived and the feature is armed. */
export const ARRIVE = 1;

/** Sightings of the figure on one settled board — each is one step up the road. */
export function sightings(board: readonly string[][], figure: string): number {
  let n = 0;
  for (const reel of board) {
    for (const s of reel) if (s === figure) n += 1;
  }
  return n;
}

/** The 0..1 proximity delta one spin contributes, given its figure sightings. */
export function proximityStep(sightingCount: number, stepsToArrive: number): number {
  if (stepsToArrive <= 0) return ARRIVE;
  return sightingCount / stepsToArrive;
}

/** Accumulate a step into the session proximity, clamped to [0,1]. */
export function advanceProximity(current: number, step: number): number {
  return clamp01(current + step);
}

/** Has the figure arrived (feature armed)? */
export function figureArrived(proximity: number): boolean {
  return proximity >= ARRIVE;
}
