import { describe, expect, it } from 'vitest';
import {
  type FeatureParams,
  resolveFeature,
} from '../../src/prototypes/spokey-lights-out/resolver';

// LIGHTS OUT multi-phase resolution (ADR-0010). The presenter plays this script
// verbatim; here we prove it is deterministic, bounded, and contract-shaped.
// Mutation-probe prey.

const durations = { trigger: 420, lock: 240, respin: 380, reveal: 220, jackpot: 600, settle: 200 };

const base: FeatureParams = {
  reels: 5,
  rows: 4,
  strip: ['eye', 'figure', 'rad', 'mainst', 'beacon', 'mailbox', 'porch', 'web'],
  holdSymbols: ['eye', 'mailbox', 'porch', 'web'],
  respins: 3,
  maxRespins: 8,
  values: [2, 5, 10, 25, 50],
  maxNewPerRespin: 3,
  durations,
};

describe('resolveFeature', () => {
  it('is seed-deterministic', () => {
    expect(resolveFeature(2026, base)).toEqual(resolveFeature(2026, base));
  });

  it('opens on the trigger and closes on the settle', () => {
    const out = resolveFeature(7, base);
    expect(out.phases[0]?.kind).toBe('trigger');
    expect(out.phases[0]?.cue).toBe('feature-trigger');
    expect(out.phases.at(-1)?.kind).toBe('settle');
  });

  it('emits a bounded script (capped by maxRespins)', () => {
    // trigger + initial lock + per-respin(respin [+lock]) + reveal + settle.
    const max = 2 + 2 * base.maxRespins + 2;
    for (const seed of [1, 2, 3, 7, 11, 19, 23, 101, 999]) {
      const out = resolveFeature(seed, base);
      expect(out.phases.length).toBeLessThanOrEqual(max);
      expect(out.phases.length).toBeGreaterThanOrEqual(4); // trigger, lock, reveal, settle
    }
  });

  it('has exactly one reveal phase, after all locks and before settle', () => {
    const out = resolveFeature(7, base);
    const reveals = out.phases.filter((p) => p.kind === 'reveal');
    expect(reveals).toHaveLength(1);
    const revealAt = out.phases.findIndex((p) => p.kind === 'reveal');
    const lastLock = out.phases.map((p) => p.kind).lastIndexOf('lock');
    expect(revealAt).toBeGreaterThan(lastLock);
    expect(revealAt).toBe(out.phases.length - 2); // reveal then settle
  });

  it('reports locked cells in reveal (ascending index) order, total = sum', () => {
    const out = resolveFeature(7, base);
    const locked = out.accumulator.locked;
    expect([...locked].sort((a, b) => a - b)).toEqual(locked); // ascending
    expect(new Set(locked).size).toBe(locked.length); // no duplicate locks
    expect(out.accumulator.total).toBe(out.total);
    expect(out.total).toBeGreaterThan(0);
  });

  it('flags a full board as the blackout jackpot', () => {
    // a 2-cell board whose every strip symbol is lockable fills at init.
    const tiny: FeatureParams = {
      ...base,
      reels: 2,
      rows: 1,
      strip: ['eye'],
      holdSymbols: ['eye'],
    };
    const out = resolveFeature(1, tiny);
    expect(out.accumulator.locked.length).toBe(2);
    expect(out.phases.at(-1)?.cue).toBe('jackpot');
  });

  it('a non-full board settles with win-celebrate, not jackpot', () => {
    // no lockable symbols on the strip → the board can never fill.
    const noLocks: FeatureParams = { ...base, strip: ['rad', 'mainst', 'beacon', 'figure'] };
    const out = resolveFeature(3, noLocks);
    expect(out.phases.at(-1)?.cue).toBe('win-celebrate');
  });
});
