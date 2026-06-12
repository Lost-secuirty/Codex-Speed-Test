// Pure outcome resolver (ADR-0010): computes the WHOLE spin synchronously as a
// typed, capped script. The presenter just plays the phases; nothing
// re-resolves mid-animation. PR1 handles base spins only; the hold&win feature
// phases (lock/respin/reveal/trigger) arrive in PR2. Placeholder outcomes only
// (ADR-0001).

import { mulberry32, pick } from '../../lib/rng';
import type { OutcomePhase, ResolvedOutcome } from './contract';
import { evaluateWays, type Paytable } from './ways';

export interface SpinParams {
  reels: number;
  rows: number;
  strip: readonly string[];
  paytable: Paytable;
  /** first reel's settle time; later reels add `reelStaggerMs` each. */
  reelDurationMs: number;
  reelStaggerMs: number;
  /** near-miss beat: when on, a one-short scatter slows the last reels (ADR-0014). */
  nearMiss: boolean;
  /** scatter symbol whose 5+ count would trigger the feature (PR2). */
  scatter: string;
}

/** Fill board[reel][row] from the seeded strip. */
export function drawBoard(
  rng: () => number,
  reels: number,
  rows: number,
  strip: readonly string[],
): string[][] {
  const board: string[][] = [];
  for (let r = 0; r < reels; r++) {
    const col: string[] = [];
    for (let row = 0; row < rows; row++) col.push(pick(rng, strip));
    board.push(col);
  }
  return board;
}

/** Count scatters on the board (PR2 uses this to trigger the feature). */
export function countScatter(board: readonly string[][], scatter: string): number {
  return board.reduce((n, reel) => n + reel.filter((s) => s === scatter).length, 0);
}

/** A near-miss = exactly one short of the feature-trigger scatter count. */
export function isNearMiss(scatterCount: number, triggerCount: number): boolean {
  return scatterCount === triggerCount - 1;
}

const TRIGGER_SCATTERS = 6;

export function resolveSpin(seed: number, p: SpinParams): ResolvedOutcome {
  const rng = mulberry32(seed);
  const board = drawBoard(rng, p.reels, p.rows, p.strip);
  const { total } = evaluateWays(board, p.paytable);
  const scatters = countScatter(board, p.scatter);
  const nearMiss = p.nearMiss && isNearMiss(scatters, TRIGGER_SCATTERS);

  const phases: OutcomePhase[] = [{ kind: 'spin', cue: 'spin-loop', durationMs: 280 }];
  for (let r = 0; r < p.reels; r++) {
    // Near-miss drags the last two reels (the classic slowdown, ADR-0014).
    const drag = nearMiss && r >= p.reels - 2 ? 1.8 : 1;
    phases.push({
      kind: 'spin',
      reels: [r],
      cue: nearMiss && r === p.reels - 1 ? 'near-miss' : 'reel-stop',
      durationMs: Math.round((p.reelDurationMs + r * p.reelStaggerMs) * drag),
    });
  }
  phases.push({
    kind: 'settle',
    cue: total > 0 ? 'win-celebrate' : undefined,
    durationMs: 200,
  });

  return { board, phases, total, accumulator: { locked: [], total }, seed };
}
