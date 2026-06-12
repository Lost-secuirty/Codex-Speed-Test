// LIGHTS OUT hold&win core (ADR-0009 feature; ADR-0001 placeholder values).
// The classic hold-and-spin state machine: value tiles lock and stay, each
// respin that lands a NEW tile resets the respin counter, the feature ends when
// respins run out or the board fills (blackout jackpot). Pure and synchronous —
// the resolver drives a seeded sequence of respins through it and emits the
// capped phase script; the presenter only animates. Mutation-probe prey.
//
// CELL INDEX CONVENTION (shared with the contract's `cells`/`accumulator.locked`
// and the scene): a flat index is `reel * rows + row`.

import { randInt } from '../../lib/rng';

/** Flatten a board coordinate to the shared cell index. */
export function cellIndex(reel: number, row: number, rows: number): number {
  return reel * rows + row;
}

/** Inverse of `cellIndex`: a flat index back to (reel, row). The presenter maps
 *  `accumulator.locked` indices back to board cells through this. */
export function cellCoord(index: number, rows: number): { reel: number; row: number } {
  return { reel: Math.floor(index / rows), row: index % rows };
}

/** A locked tile: its flat board index and its captured placeholder value. */
export interface HoldTile {
  index: number;
  value: number;
}

/** The hold&win machine's whole state — no animation, no Pixi. */
export interface HoldState {
  /** locked tiles, in capture order. */
  tiles: HoldTile[];
  /** respins remaining before the feature ends. */
  respinsLeft: number;
  /** total cells on the board; a full board is the blackout jackpot. */
  boardSize: number;
}

/** Flat indices of every cell currently holding a lockable value symbol. */
export function lockableCells(
  board: readonly string[][],
  holdSymbols: readonly string[],
  rows: number,
): number[] {
  const out: number[] = [];
  for (let reel = 0; reel < board.length; reel++) {
    const col = board[reel] ?? [];
    for (let row = 0; row < col.length; row++) {
      if (holdSymbols.includes(col[row] ?? '')) out.push(cellIndex(reel, row, rows));
    }
  }
  return out;
}

/** Roll a placeholder captured value for one tile (seeded; NOT RTP — ADR-0001). */
export function rollValue(rng: () => number, values: readonly number[]): number {
  if (values.length === 0) return 0;
  return values[randInt(rng, values.length)] ?? 0;
}

/** Open the feature: the entry board's value tiles lock, respins charged full. */
export function initHold(
  initial: readonly HoldTile[],
  respins: number,
  boardSize: number,
): HoldState {
  return { tiles: [...initial], respinsLeft: respins, boardSize };
}

/** True once every cell is locked — the blackout jackpot. */
export function isJackpot(state: HoldState): boolean {
  return state.tiles.length >= state.boardSize;
}

/** The feature is over when respins are exhausted or the board is full. */
export function isComplete(state: HoldState): boolean {
  return state.respinsLeft <= 0 || isJackpot(state);
}

/** The running captured total. */
export function holdTotal(state: HoldState): number {
  return state.tiles.reduce((sum, t) => sum + t.value, 0);
}

/**
 * Apply one respin. `landed` are tiles that newly appeared this respin; only
 * those on not-yet-locked cells stick. Landing at least one new tile RESETS the
 * respin counter (the classic hold&win hook); landing none decrements it.
 */
export function applyRespin(
  state: HoldState,
  landed: readonly HoldTile[],
  respins: number,
): HoldState {
  const held = new Set(state.tiles.map((t) => t.index));
  const fresh = landed.filter((t) => !held.has(t.index));
  const tiles = [...state.tiles, ...fresh];
  const respinsLeft = fresh.length > 0 ? respins : state.respinsLeft - 1;
  return { tiles, respinsLeft, boardSize: state.boardSize };
}
