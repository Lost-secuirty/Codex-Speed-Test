import { describe, expect, it } from 'vitest';
import { mulberry32, pick, randInt } from '../../src/lib/rng';

// Seeded determinism is load-bearing for reproducible boards + visual
// baselines (ADR-0012). Mutation-probe prey.

describe('mulberry32', () => {
  it('is deterministic for a given seed', () => {
    const a = mulberry32(12345);
    const b = mulberry32(12345);
    const seqA = [a(), a(), a(), a()];
    const seqB = [b(), b(), b(), b()];
    expect(seqA).toEqual(seqB);
  });

  it('produces different streams for different seeds', () => {
    const a = mulberry32(1);
    const b = mulberry32(2);
    expect(a()).not.toBe(b());
  });

  it('stays within [0, 1)', () => {
    const r = mulberry32(99);
    for (let i = 0; i < 1000; i++) {
      const v = r();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe('randInt', () => {
  it('stays within [0, n)', () => {
    const r = mulberry32(7);
    for (let i = 0; i < 500; i++) {
      const v = randInt(r, 5);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(5);
      expect(Number.isInteger(v)).toBe(true);
    }
  });
});

describe('pick', () => {
  it('returns an element of the array', () => {
    const r = mulberry32(3);
    const arr = ['a', 'b', 'c'] as const;
    for (let i = 0; i < 50; i++) expect(arr).toContain(pick(r, arr));
  });

  it('throws on an empty array instead of returning undefined', () => {
    expect(() => pick(mulberry32(1), [])).toThrow('empty');
  });
});
