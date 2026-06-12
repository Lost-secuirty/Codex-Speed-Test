import { describe, expect, it } from 'vitest';
import {
  arousalLevel,
  clampAttack,
  MIN_ATTACK_MS,
  PUNCH_FLOOR_MS,
  settleCue,
  shepardLayerGain,
  swarmVoices,
  winGainForProximity,
} from '../../src/lib/audio/cue-model';

// The pure audio law layer (ADR-0015). Mutation-probe prey.

describe('clampAttack — the startle gate', () => {
  it('floors every attack at 120ms', () => {
    expect(clampAttack(0)).toBe(MIN_ATTACK_MS);
    expect(clampAttack(80)).toBe(MIN_ATTACK_MS);
    expect(clampAttack(120)).toBe(120);
    expect(clampAttack(500)).toBe(500);
  });
  it('the punch opt-in floors at 100ms and NEVER below', () => {
    expect(clampAttack(40, true)).toBe(PUNCH_FLOOR_MS);
    expect(clampAttack(110, true)).toBe(110);
    expect(PUNCH_FLOOR_MS).toBeGreaterThanOrEqual(100); // the law itself
  });
});

describe('winGainForProximity — dread outranks juice', () => {
  it('is full at safety, the floor at arrival, monotonic between', () => {
    expect(winGainForProximity(0)).toBe(1);
    expect(winGainForProximity(1)).toBeCloseTo(0.35);
    expect(winGainForProximity(0.5)).toBeLessThan(winGainForProximity(0.25));
    expect(winGainForProximity(0.75)).toBeLessThan(winGainForProximity(0.5));
  });
  it('clamps out-of-range proximity', () => {
    expect(winGainForProximity(-1)).toBe(1);
    expect(winGainForProximity(2)).toBeCloseTo(0.35);
  });
});

describe('arousalLevel — the pre-baked curve', () => {
  it('rises strictly across the feature phases and stays in [0,1]', () => {
    const phases = ['idle', 'lock', 'hold', 'approach', 'trigger'] as const;
    for (let i = 1; i < phases.length; i++) {
      expect(arousalLevel(phases[i] as (typeof phases)[number])).toBeGreaterThan(
        arousalLevel(phases[i - 1] as (typeof phases)[number]),
      );
    }
    for (const p of phases) {
      expect(arousalLevel(p)).toBeGreaterThanOrEqual(0);
      expect(arousalLevel(p)).toBeLessThanOrEqual(1);
    }
  });
});

describe('swarmVoices — the CPU budget is a hard cap', () => {
  it('caps wanted voices and floors at zero', () => {
    expect(swarmVoices(8, 24)).toBe(8);
    expect(swarmVoices(99, 24)).toBe(24);
    expect(swarmVoices(-3, 24)).toBe(0);
    expect(swarmVoices(5.9, 24)).toBe(5); // whole voices only
  });
});

describe('settleCue — the LDW law (ADR-0014)', () => {
  it('is silent on a true loss', () => {
    expect(settleCue(0, 10, false)).toBeUndefined();
    expect(settleCue(-5, 10, true)).toBeUndefined();
  });
  it('flags a below-threshold win as ldw (extractive default)', () => {
    expect(settleCue(5, 10, false)).toBe('ldw');
  });
  it('unmasks it in honest mode', () => {
    expect(settleCue(5, 10, true)).toBe('ldw-honest');
  });
  it('celebrates at/above threshold regardless of mode', () => {
    expect(settleCue(10, 10, false)).toBe('win-celebrate');
    expect(settleCue(50, 10, true)).toBe('win-celebrate');
  });
  it('threshold 0 disables LDW entirely (legacy behavior)', () => {
    expect(settleCue(1, 0, false)).toBe('win-celebrate');
  });
});

describe('shepardLayerGain — the raised-cosine window', () => {
  it('silences the spectral edges and peaks at center', () => {
    expect(shepardLayerGain(0)).toBeCloseTo(0);
    expect(shepardLayerGain(1)).toBeCloseTo(0);
    expect(shepardLayerGain(0.5)).toBeCloseTo(1);
    expect(shepardLayerGain(0.25)).toBeCloseTo(0.5);
  });
  it('clamps out-of-range positions', () => {
    expect(shepardLayerGain(-1)).toBeCloseTo(0);
    expect(shepardLayerGain(2)).toBeCloseTo(0);
  });
});
