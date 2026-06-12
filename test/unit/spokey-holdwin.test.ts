import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../../src/lib/rng';
import {
  applyRespin,
  cellIndex,
  type HoldTile,
  holdTotal,
  initHold,
  isComplete,
  isJackpot,
  lockableCells,
  rollValue,
} from '../../src/prototypes/spokey-lights-out/holdwin';

// LIGHTS OUT hold&win state machine (ADR-0009). Mutation-probe prey.

describe('cellIndex', () => {
  it('flattens reel/row as reel*rows + row', () => {
    expect(cellIndex(0, 0, 4)).toBe(0);
    expect(cellIndex(2, 3, 4)).toBe(11);
    expect(cellIndex(4, 0, 4)).toBe(16);
  });
});

describe('lockableCells', () => {
  it('returns flat indices of every hold-symbol cell', () => {
    const board = [
      ['eye', 'x', 'x', 'x'], // reel 0 → index 0
      ['x', 'x', 'x', 'x'],
      ['x', 'x', 'mailbox', 'x'], // reel 2 row 2 → index 10
      ['x', 'x', 'x', 'x'],
      ['x', 'x', 'x', 'porch'], // reel 4 row 3 → index 19
    ];
    expect(lockableCells(board, ['eye', 'mailbox', 'porch', 'web'], 4)).toEqual([0, 10, 19]);
  });

  it('ignores non-hold symbols', () => {
    expect(lockableCells([['rad', 'mainst']], ['eye'], 4)).toEqual([]);
  });
});

describe('rollValue', () => {
  it('picks from the value table and is seed-deterministic', () => {
    const values = [2, 5, 10, 25, 50];
    expect(rollValue(mulberry32(1), values)).toBe(rollValue(mulberry32(1), values));
    expect(values).toContain(rollValue(mulberry32(99), values));
  });
  it('returns 0 for an empty table', () => {
    expect(rollValue(mulberry32(1), [])).toBe(0);
  });
});

describe('initHold / isJackpot / isComplete / holdTotal', () => {
  const tiles: HoldTile[] = [
    { index: 0, value: 5 },
    { index: 1, value: 10 },
  ];

  it('charges respins full and copies the entry tiles', () => {
    const s = initHold(tiles, 3, 20);
    expect(s.respinsLeft).toBe(3);
    expect(s.boardSize).toBe(20);
    expect(s.tiles).toEqual(tiles);
    expect(s.tiles).not.toBe(tiles); // defensive copy
  });

  it('sums the captured total', () => {
    expect(holdTotal(initHold(tiles, 3, 20))).toBe(15);
  });

  it('jackpot only when every cell is locked', () => {
    expect(isJackpot({ tiles, respinsLeft: 3, boardSize: 20 })).toBe(false);
    expect(isJackpot({ tiles, respinsLeft: 3, boardSize: 2 })).toBe(true);
  });

  it('completes when respins hit 0 or the board fills', () => {
    expect(isComplete({ tiles, respinsLeft: 1, boardSize: 20 })).toBe(false);
    expect(isComplete({ tiles, respinsLeft: 0, boardSize: 20 })).toBe(true);
    expect(isComplete({ tiles, respinsLeft: 3, boardSize: 2 })).toBe(true); // jackpot
  });
});

describe('applyRespin', () => {
  const base = initHold([{ index: 0, value: 5 }], 3, 20);

  it('locks new tiles and RESETS the respin counter', () => {
    const after = applyRespin({ ...base, respinsLeft: 1 }, [{ index: 4, value: 10 }], 3);
    expect(after.tiles.map((t) => t.index)).toEqual([0, 4]);
    expect(after.respinsLeft).toBe(3); // reset, not decremented
  });

  it('decrements the counter when nothing new lands', () => {
    const after = applyRespin(base, [], 3);
    expect(after.tiles).toHaveLength(1);
    expect(after.respinsLeft).toBe(2);
  });

  it('ignores a tile that lands on an already-held cell', () => {
    const after = applyRespin(base, [{ index: 0, value: 99 }], 3);
    expect(after.tiles).toHaveLength(1); // no duplicate lock
    expect(after.respinsLeft).toBe(2); // treated as "no new" → decrement
  });
});
