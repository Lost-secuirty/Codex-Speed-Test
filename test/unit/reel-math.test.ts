import { describe, expect, it } from 'vitest';
import {
  cellOffsetY,
  settleDurationMs,
  spinDistance,
  stripWindow,
  wrapIndex,
} from '../../src/lib/reels/reel-math';

// These tests are the mutation probe's prey (scripts/mutation-probe.mjs) —
// each planted fault in reel-math must kill at least one assertion here.

describe('wrapIndex', () => {
  it('passes through in-range indices', () => {
    expect(wrapIndex(0, 5)).toBe(0);
    expect(wrapIndex(4, 5)).toBe(4);
  });

  it('wraps past the end', () => {
    expect(wrapIndex(5, 5)).toBe(0);
    expect(wrapIndex(12, 5)).toBe(2);
  });

  it('wraps negatives onto the strip (the classic % footgun)', () => {
    expect(wrapIndex(-1, 5)).toBe(4);
    expect(wrapIndex(-7, 5)).toBe(3);
  });
});

describe('spinDistance', () => {
  it('travels exactly the wrapped delta with zero extra turns', () => {
    expect(spinDistance(1, 4, 10, 0)).toBe(3);
    expect(spinDistance(8, 2, 10, 0)).toBe(4); // wraps forward through 9, 0, 1, 2
  });

  it('adds full loops for show — turns are not cosmetic-only', () => {
    expect(spinDistance(1, 4, 10, 2)).toBe(23);
    expect(spinDistance(0, 0, 10, 3)).toBe(30); // same symbol still spins 3 loops
  });
});

describe('settleDurationMs', () => {
  it('staggers reels left to right', () => {
    expect(settleDurationMs(900, 250, 0)).toBe(900);
    expect(settleDurationMs(900, 250, 1)).toBe(1150);
    expect(settleDurationMs(900, 250, 2)).toBe(1400);
  });
});

describe('cellOffsetY', () => {
  it('accounts for the symbol gap, not just the cell height', () => {
    expect(cellOffsetY(0, 96, 8)).toBe(0);
    expect(cellOffsetY(1, 96, 8)).toBe(104);
    expect(cellOffsetY(3, 96, 8)).toBe(312);
  });
});

describe('stripWindow', () => {
  const strip = ['A', 'B', 'C', 'D', 'E'] as const;

  it('returns the visible slice from the top offset', () => {
    expect(stripWindow(strip, 1, 3)).toEqual(['B', 'C', 'D']);
  });

  it('wraps around the end of the strip', () => {
    expect(stripWindow(strip, 4, 3)).toEqual(['E', 'A', 'B']);
  });

  it('throws on an empty strip instead of returning holes', () => {
    expect(() => stripWindow([], 0, 1)).toThrow('empty strip');
  });
});
