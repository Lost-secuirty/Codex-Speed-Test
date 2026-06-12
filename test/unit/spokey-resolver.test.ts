import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../../src/lib/rng';
import {
  countScatter,
  drawBoard,
  isNearMiss,
  resolveSpin,
  type SpinParams,
} from '../../src/prototypes/spokey-lights-out/resolver';
import type { Paytable } from '../../src/prototypes/spokey-lights-out/ways';

// resolve-then-present base path (ADR-0010). Mutation-probe prey.

const strip = ['eye', 'mailbox', 'porch', 'web', 'mainst', 'rad', 'figure', 'beacon'] as const;
const paytable: Paytable = { eye: [0, 0, 0, 5, 10, 25] };
const params: SpinParams = {
  reels: 5,
  rows: 4,
  strip,
  paytable,
  reelDurationMs: 600,
  reelStaggerMs: 180,
  nearMiss: false,
  scatter: 'beacon',
};

describe('drawBoard', () => {
  it('fills reels×rows and is seed-deterministic', () => {
    const a = drawBoard(mulberry32(42), 5, 4, strip);
    const b = drawBoard(mulberry32(42), 5, 4, strip);
    expect(a).toEqual(b);
    expect(a).toHaveLength(5);
    expect(a.every((reel) => reel.length === 4)).toBe(true);
    expect(a.flat().every((s) => strip.includes(s as (typeof strip)[number]))).toBe(true);
  });
});

describe('countScatter / isNearMiss', () => {
  it('counts a symbol across the whole board', () => {
    const board = [
      ['beacon', 'x'],
      ['x', 'beacon'],
      ['x', 'x'],
      ['beacon', 'x'],
      ['x', 'x'],
    ];
    expect(countScatter(board, 'beacon')).toBe(3);
  });
  it('flags exactly one short of the trigger', () => {
    expect(isNearMiss(5, 6)).toBe(true);
    expect(isNearMiss(4, 6)).toBe(false);
    expect(isNearMiss(6, 6)).toBe(false);
  });
});

describe('resolveSpin', () => {
  it('returns a board, a capped phase script, and is deterministic', () => {
    const a = resolveSpin(2026, params);
    const b = resolveSpin(2026, params);
    expect(a).toEqual(b);
    expect(a.board).toHaveLength(5);
    // 1 spin-loop + 5 reel stops + 1 settle = 7 phases (bounded, never unbounded)
    expect(a.phases).toHaveLength(7);
    expect(a.phases[0]?.kind).toBe('spin');
    expect(a.phases.at(-1)?.kind).toBe('settle');
    expect(a.seed).toBe(2026);
  });

  it('staggers reel-stop durations left to right', () => {
    const { phases } = resolveSpin(1, params);
    const stops = phases.filter((p) => p.reels?.length === 1);
    expect(stops[0]?.durationMs).toBe(600);
    expect(stops[1]?.durationMs).toBe(780);
    expect(stops[4]?.durationMs).toBe(1320);
  });

  it('only emits the win-celebrate cue when total > 0', () => {
    // search a couple of seeds for a win vs a no-win and check the settle cue matches total
    for (const seed of [1, 2, 3, 7, 11, 19, 23]) {
      const out = resolveSpin(seed, params);
      const settle = out.phases.at(-1);
      if (out.total > 0) expect(settle?.cue).toBe('win-celebrate');
      else expect(settle?.cue).toBeUndefined();
    }
  });
});

describe('resolveSpin LDW settle cues (ADR-0014, PR3)', () => {
  it('marks a below-threshold win as ldw / ldw-honest by flag', () => {
    // find seeds for a small win and a big win under the greedy paytable
    let small = -1;
    let big = -1;
    const pt = { eye: [0, 0, 0, 5, 10, 25] };
    for (let s = 1; s < 3000 && (small < 0 || big < 0); s++) {
      const t = resolveSpin(s, { ...params, paytable: pt }).total;
      if (t > 0 && t < 20 && small < 0) small = s;
      if (t >= 20 && big < 0) big = s;
    }
    expect(small).toBeGreaterThan(0);
    expect(big).toBeGreaterThan(0);
    const ldwParams = { ...params, paytable: pt, ldwThreshold: 20 };
    expect(resolveSpin(small, ldwParams).phases.at(-1)?.cue).toBe('ldw');
    expect(resolveSpin(small, { ...ldwParams, ldwHonest: true }).phases.at(-1)?.cue).toBe(
      'ldw-honest',
    );
    expect(resolveSpin(big, ldwParams).phases.at(-1)?.cue).toBe('win-celebrate');
    expect(resolveSpin(big, { ...ldwParams, ldwHonest: true }).phases.at(-1)?.cue).toBe(
      'win-celebrate',
    );
  });

  // (the unset-threshold legacy path is already pinned by the PR1 test
  // 'only emits the win-celebrate cue when total > 0' above — audit L4.)
});
