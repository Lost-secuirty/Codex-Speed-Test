import { describe, expect, it } from 'vitest';
import type { HoldTile } from '../../src/prototypes/spokey-lights-out/holdwin';
import {
  revealOrder,
  shownValue,
  visibleTotal,
} from '../../src/prototypes/spokey-lights-out/reveal';

// The hidden↔visible value reveal (ADR-0013). Mutation-probe prey.

const tiles: HoldTile[] = [
  { index: 10, value: 25 },
  { index: 2, value: 5 },
  { index: 7, value: 10 },
];

describe('revealOrder', () => {
  it('sweeps held tiles in ascending (reading-order) index', () => {
    expect(revealOrder(tiles).map((t) => t.index)).toEqual([2, 7, 10]);
  });
  it('does not mutate the input', () => {
    const copy = [...tiles];
    revealOrder(tiles);
    expect(tiles).toEqual(copy);
  });
});

describe('shownValue', () => {
  const tile: HoldTile = { index: 3, value: 50 };
  it('hides an un-swept tile only in hidden mode', () => {
    expect(shownValue(tile, false, true)).toBeNull(); // hidden + not revealed → covered
    expect(shownValue(tile, true, true)).toBe(50); // hidden + revealed → shown
    expect(shownValue(tile, false, false)).toBe(50); // visible mode → always shown
  });
});

describe('visibleTotal', () => {
  const ordered = revealOrder(tiles); // values 5,10,25

  it('visible mode shows the full total immediately', () => {
    expect(visibleTotal(ordered, 0, false)).toBe(40);
  });
  it('hidden mode accrues only the swept tiles', () => {
    expect(visibleTotal(ordered, 0, true)).toBe(0);
    expect(visibleTotal(ordered, 2, true)).toBe(15); // 5 + 10
    expect(visibleTotal(ordered, 3, true)).toBe(40);
    expect(visibleTotal(ordered, 99, true)).toBe(40); // clamps to length
  });
});
