// Pure outcome resolver (ADR-0010): computes the WHOLE spin synchronously as a
// typed, capped script. The presenter just plays the phases; nothing
// re-resolves mid-animation. PR1 handles base spins only; the hold&win feature
// phases (lock/respin/reveal/trigger) arrive in PR2. Placeholder outcomes only
// (ADR-0001).

import { mulberry32, pick, randInt } from '../../lib/rng';
import type { OutcomePhase, ResolvedOutcome } from './contract';
import {
  applyRespin,
  type HoldTile,
  holdTotal,
  initHold,
  isComplete,
  isJackpot,
  lockableCells,
  rollValue,
} from './holdwin';
import { proximityStep, sightings } from './proximity';
import { revealOrder } from './reveal';
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
  /** the figure symbol whose sightings advance proximity (ADR-0012). */
  figure?: string;
  /** figure sightings needed to arrive; drives the per-spin proximity step. */
  stepsToArrive?: number;
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
  // Figure proximity (ADR-0012): seed-deterministic, carried on the settle
  // phase for the presenter to accumulate. No figure param ⇒ step 0 (base game).
  const step = proximityStep(p.figure ? sightings(board, p.figure) : 0, p.stepsToArrive ?? 6);
  phases.push({
    kind: 'settle',
    cue: total > 0 ? 'win-celebrate' : undefined,
    proximityStep: step,
    durationMs: 200,
  });

  return { board, phases, total, accumulator: { locked: [], total }, seed };
}

// =====================================================================
// LIGHTS OUT feature path (ADR-0010 resolve-then-present). Computes the WHOLE
// hold&win sequence synchronously into a capped phase script; the presenter
// just plays it. Bounded by `maxRespins` so CI wall-clock stays in budget.
// =====================================================================

export interface FeatureParams {
  reels: number;
  rows: number;
  strip: readonly string[];
  holdSymbols: readonly string[];
  respins: number;
  /** hard cap on respins so the emitted script length is bounded. */
  maxRespins: number;
  values: readonly number[];
  /** most new tiles a single respin can land (keeps the climb gradual). */
  maxNewPerRespin: number;
  durations: {
    trigger: number;
    lock: number;
    respin: number;
    reveal: number;
    jackpot: number;
    settle: number;
  };
}

/** Seeded subset of currently-free cells that newly light up this respin. */
function rollRespin(
  rng: () => number,
  freeCells: readonly number[],
  values: readonly number[],
  maxNew: number,
): HoldTile[] {
  const pool = [...freeCells];
  const k = randInt(rng, Math.min(maxNew, pool.length) + 1); // 0..min(maxNew,free)
  // partial Fisher–Yates: pick k distinct free cells deterministically.
  for (let i = 0; i < k; i++) {
    const j = i + randInt(rng, pool.length - i);
    const tmp = pool[i] as number;
    pool[i] = pool[j] as number;
    pool[j] = tmp;
  }
  return pool.slice(0, k).map((index) => ({ index, value: rollValue(rng, values) }));
}

export function resolveFeature(seed: number, p: FeatureParams): ResolvedOutcome {
  const rng = mulberry32(seed);
  const board = drawBoard(rng, p.reels, p.rows, p.strip);
  const boardSize = p.reels * p.rows;
  const phases: OutcomePhase[] = [];

  // 1. the figure arrives → LIGHTS OUT.
  phases.push({
    kind: 'trigger',
    cue: 'feature-trigger',
    proximityStep: 0,
    durationMs: p.durations.trigger,
  });

  // 2. entry board's value tiles lock.
  const initialTiles: HoldTile[] = lockableCells(board, p.holdSymbols, p.rows).map((index) => ({
    index,
    value: rollValue(rng, p.values),
  }));
  let state = initHold(initialTiles, p.respins, boardSize);
  phases.push({
    kind: 'lock',
    cells: state.tiles.map((t) => t.index),
    cue: 'lights-out-tick',
    durationMs: p.durations.lock,
  });

  // 3. seeded, capped respin loop.
  let respins = 0;
  while (!isComplete(state) && respins < p.maxRespins) {
    respins += 1;
    const held = new Set(state.tiles.map((t) => t.index));
    const free: number[] = [];
    for (let i = 0; i < boardSize; i++) if (!held.has(i)) free.push(i);
    const landed = rollRespin(rng, free, p.values, p.maxNewPerRespin);
    const before = state.tiles.length;
    state = applyRespin(state, landed, p.respins);
    phases.push({ kind: 'respin', cue: 'swarm-tick', durationMs: p.durations.respin });
    if (state.tiles.length > before) {
      phases.push({
        kind: 'lock',
        cells: state.tiles.slice(before).map((t) => t.index),
        cue: 'lights-out-tick',
        durationMs: p.durations.lock,
      });
    }
  }

  // 4. flashlight reveal sweep over the held tiles (reading order).
  const ordered = revealOrder(state.tiles);
  phases.push({
    kind: 'reveal',
    cells: ordered.map((t) => t.index),
    cue: 'rollup',
    durationMs: p.durations.reveal,
  });

  // 5. settle — full board is the blackout jackpot.
  const jackpot = isJackpot(state);
  const total = holdTotal(state); // single summation source (the tested helper)
  phases.push({
    kind: 'settle',
    cue: jackpot ? 'jackpot' : 'win-celebrate',
    durationMs: jackpot ? p.durations.jackpot : p.durations.settle,
  });

  // The final board shows the locked tiles' symbol over the entry layout; the
  // accumulator carries the locked indices + captured total for the meters.
  return {
    board,
    phases,
    total,
    accumulator: { locked: ordered.map((t) => t.index), total },
    seed,
  };
}
