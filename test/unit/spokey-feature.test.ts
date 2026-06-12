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

  it('reports locked cells in reveal (ascending index) order, no duplicates', () => {
    const out = resolveFeature(7, base);
    const locked = out.accumulator.locked;
    expect([...locked].sort((a, b) => a - b)).toEqual(locked); // ascending
    expect(new Set(locked).size).toBe(locked.length); // no duplicate locks
    expect(out.total).toBeGreaterThan(0);
  });

  it('matches the hand-traced seed-7 outcome (independent oracle, PR body)', () => {
    // The hand-trace executed in the PR body: seed 7 → 18 phases, a full-board
    // blackout jackpot, captured total 316. Pinned as literals so a wrong-but-
    // stable resolver cannot pass the determinism tests silently (the F5 oracle).
    const out = resolveFeature(7, base);
    expect(out.phases).toHaveLength(18);
    expect(out.accumulator.locked).toEqual(Array.from({ length: 20 }, (_, i) => i));
    expect(out.total).toBe(316);
    expect(out.accumulator.total).toBe(316);
    // values run parallel to locked and reconcile with the total (ADR-0017).
    expect(out.accumulator.values).toHaveLength(20);
    expect(out.accumulator.values.reduce((a, b) => a + b, 0)).toBe(316);
    expect(out.phases.at(-1)?.cue).toBe('jackpot');
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

  it('a board that cannot fill settles with win-celebrate, not jackpot', () => {
    // maxNewPerRespin 0 ⇒ respins never add tiles, so the board can only hold
    // the entry locks (always < 20 for this mixed strip) and the counter runs
    // out → non-jackpot. (The earlier "no-hold strip" premise was FALSE: respins
    // light free cells by RNG regardless of symbol, so that strip CAN jackpot on
    // seeds 49/63 — caught by the meta-audit, F3.)
    const noGrowth: FeatureParams = { ...base, maxNewPerRespin: 0 };
    const out = resolveFeature(3, noGrowth);
    expect(out.accumulator.locked.length).toBeLessThan(base.reels * base.rows);
    expect(out.phases.at(-1)?.cue).toBe('win-celebrate');
  });
});
