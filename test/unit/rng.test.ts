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

describe('mulberry32 isolation (ADR-0022, A1)', () => {
  // The isolation property is an ABSENCE of coupling (no global RNG read/write),
  // not a mutable source line — so it carries no matching mutation-probe mutant;
  // the existing `randInt` mutant is rng.ts's probe teeth.

  it('replays a long identical sequence for the same seed', () => {
    const a = mulberry32(424242);
    const b = mulberry32(424242);
    expect(Array.from({ length: 64 }, () => a())).toEqual(Array.from({ length: 64 }, () => b()));
  });

  it('does not read or advance global Math.random state', () => {
    const ref = mulberry32(7);
    const refSeq = Array.from({ length: 32 }, () => ref());
    const probe = mulberry32(7);
    const probeSeq = Array.from({ length: 32 }, () => {
      Math.random(); // perturb the GLOBAL rng between every draw
      return probe();
    });
    // mulberry32's stream is identical whether or not Math.random ran.
    expect(probeSeq).toEqual(refSeq);
  });

  it('keeps two instances independent (no shared hidden state)', () => {
    const solo = mulberry32(99);
    const soloSeq = Array.from({ length: 16 }, () => solo());
    const a = mulberry32(99);
    const b = mulberry32(123);
    const interleaved: number[] = [];
    for (let i = 0; i < 16; i++) {
      interleaved.push(a());
      b(); // advance the other instance between a()'s draws
    }
    expect(interleaved).toEqual(soloSeq);
  });
});
