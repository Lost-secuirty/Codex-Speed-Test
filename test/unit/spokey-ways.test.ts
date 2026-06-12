import { describe, expect, it } from 'vitest';
import {
  countWays,
  evaluateWays,
  MIN_REELS,
  type Paytable,
} from '../../src/prototypes/spokey-lights-out/ways';

// Ways-pays is the base-game pure core (ADR-0009). Mutation-probe prey.
// board[reel][row]; placeholder paytable.

const pt: Paytable = {
  eye: [0, 0, 0, 5, 10, 25], // pays at 3/4/5 reels
  mailbox: [0, 0, 0, 2, 4, 8],
};

describe('countWays', () => {
  it('counts consecutive reels from the left and multiplies per-reel counts', () => {
    const board = [
      ['eye', 'eye', 'x', 'x'], // reel 0: 2 eyes
      ['eye', 'x', 'x', 'x'], // reel 1: 1 eye
      ['eye', 'eye', 'eye', 'x'], // reel 2: 3 eyes
      ['x', 'x', 'x', 'x'], // reel 3: 0 — stops here
      ['eye', 'eye', 'eye', 'eye'],
    ];
    expect(countWays(board, 'eye')).toEqual({ reels: 3, ways: 6 }); // 2*1*3
  });

  it('stops at the first reel missing the symbol (gap does not pay through)', () => {
    const board = [['eye'], ['x'], ['eye'], ['eye'], ['eye']];
    expect(countWays(board, 'eye')).toEqual({ reels: 1, ways: 1 });
  });

  it('returns reels:0 when the leftmost reel lacks the symbol', () => {
    const board = [['x'], ['eye'], ['eye'], ['eye'], ['eye']];
    expect(countWays(board, 'eye')).toEqual({ reels: 0, ways: 1 });
  });
});

describe('evaluateWays', () => {
  it('pays a 3-reel ways win by the paytable times the ways count', () => {
    const board = [['eye', 'eye'], ['eye'], ['eye'], ['x'], ['x']];
    const { wins, total } = evaluateWays(board, pt);
    // 3 reels, ways = 2*1*1 = 2, pay = pt.eye[3] (5) * 2 = 10
    expect(wins).toEqual([{ symbol: 'eye', reels: 3, ways: 2, pay: 10 }]);
    expect(total).toBe(10);
  });

  it(`does not pay below ${MIN_REELS} reels`, () => {
    const board = [['eye'], ['eye'], ['x'], ['x'], ['x']];
    expect(evaluateWays(board, pt).total).toBe(0);
  });

  it(`enforces the ${MIN_REELS}-reel minimum even when the paytable would pay a 2-reel hit`, () => {
    // a paytable that pays at 2 reels must still be blocked by MIN_REELS
    const greedy = { eye: [0, 0, 99, 5, 10, 25] };
    const board = [['eye'], ['eye'], ['x'], ['x'], ['x']];
    expect(evaluateWays(board, greedy).total).toBe(0);
  });

  it('ignores symbols absent from the paytable', () => {
    const board = [['ghost'], ['ghost'], ['ghost'], ['ghost'], ['ghost']];
    expect(evaluateWays(board, pt).total).toBe(0);
  });

  it('sums multiple winning symbols', () => {
    const board = [
      ['eye', 'mailbox'],
      ['eye', 'mailbox'],
      ['eye', 'mailbox'],
      ['x', 'x'],
      ['x', 'x'],
    ];
    const { total } = evaluateWays(board, pt);
    // eye: 5 * (1*1*1)=5 ; mailbox: 2 * 1 = 2  → but each reel has 1 of each
    expect(total).toBe(5 + 2);
  });
});
