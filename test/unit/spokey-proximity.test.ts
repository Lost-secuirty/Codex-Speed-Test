import { describe, expect, it } from 'vitest';
import {
  ARRIVE,
  advanceProximity,
  figureArrived,
  proximityStep,
  sightings,
} from '../../src/prototypes/spokey-lights-out/proximity';

// Figure proximity = seed-deterministic session state (ADR-0012). Mutation prey.

describe('sightings', () => {
  it('counts the figure symbol across the whole board', () => {
    const board = [
      ['figure', 'x'],
      ['x', 'figure'],
      ['x', 'x'],
      ['figure', 'figure'],
      ['x', 'x'],
    ];
    expect(sightings(board, 'figure')).toBe(4);
  });

  it('is zero when the figure is absent', () => {
    expect(sightings([['x'], ['y']], 'figure')).toBe(0);
  });
});

describe('proximityStep', () => {
  it('is sightings over the steps-to-arrive', () => {
    expect(proximityStep(3, 6)).toBeCloseTo(0.5);
    expect(proximityStep(1, 4)).toBeCloseTo(0.25);
  });

  it('arrives in one step when stepsToArrive is non-positive (guard)', () => {
    expect(proximityStep(0, 0)).toBe(ARRIVE);
    expect(proximityStep(2, -1)).toBe(ARRIVE);
  });
});

describe('advanceProximity', () => {
  it('accumulates and clamps into [0,1]', () => {
    expect(advanceProximity(0.4, 0.3)).toBeCloseTo(0.7);
    expect(advanceProximity(0.9, 0.5)).toBe(1); // clamped, never overshoots
    expect(advanceProximity(0, -0.2)).toBe(0); // never negative
  });
});

describe('figureArrived', () => {
  it('arms at proximity ≥ 1 only', () => {
    expect(figureArrived(0.99)).toBe(false);
    expect(figureArrived(1)).toBe(true);
    expect(figureArrived(1.5)).toBe(true);
  });
});
