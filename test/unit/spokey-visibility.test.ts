import { describe, expect, it } from 'vitest';
import {
  cellLight,
  clamp01,
  falloff,
  type LightSource,
} from '../../src/prototypes/spokey-lights-out/visibility';

// Darkness-as-data light model (ADR-0011). Mutation-probe prey.

describe('clamp01', () => {
  it('clamps below 0 and above 1, passes through the middle', () => {
    expect(clamp01(-0.5)).toBe(0);
    expect(clamp01(1.5)).toBe(1);
    expect(clamp01(0.3)).toBe(0.3);
  });
});

describe('falloff', () => {
  it('is full at the center and zero at/after the radius', () => {
    expect(falloff(0, 4)).toBe(1);
    expect(falloff(4, 4)).toBe(0);
    expect(falloff(5, 4)).toBe(0);
  });

  it('decreases linearly with distance', () => {
    expect(falloff(2, 4)).toBeCloseTo(0.5);
    expect(falloff(1, 4)).toBeCloseTo(0.75);
  });

  it('returns 0 for a non-positive radius', () => {
    expect(falloff(0, 0)).toBe(0);
  });
});

describe('cellLight', () => {
  const cone: LightSource = { x: 2, y: 1, radius: 3, intensity: 1 };

  it('returns ambient when no source reaches the cell', () => {
    expect(cellLight(10, 10, [cone], 0.05)).toBeCloseTo(0.05);
  });

  it('adds source contribution near the center', () => {
    // distance 0 → ambient + intensity, clamped
    expect(cellLight(2, 1, [cone], 0.05)).toBe(1);
  });

  it('accounts for the ambient floor, not just the cone', () => {
    // a cell just outside the cone keeps the ambient anchor (structured dark)
    expect(cellLight(6, 1, [cone], 0.06)).toBeCloseTo(0.06);
  });

  it('sums multiple sources before clamping', () => {
    const a: LightSource = { x: 0, y: 0, radius: 2, intensity: 0.4 };
    const b: LightSource = { x: 0, y: 0, radius: 2, intensity: 0.4 };
    expect(cellLight(0, 0, [a, b], 0)).toBeCloseTo(0.8);
  });
});
