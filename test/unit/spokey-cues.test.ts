import { describe, expect, it } from 'vitest';
import { MIN_ATTACK_MS } from '../../src/lib/audio/cue-model';
import type { CueName } from '../../src/prototypes/spokey-lights-out/contract';
import { SPOKEY_CUES } from '../../src/prototypes/spokey-lights-out/cues';

// The SPOKEY intent table (ADR-0015). Completeness is compiler-enforced
// (Record<CueName, CueIntent>); these tests pin the DESIGN LAWS the types
// can't: the attack floor, escalation-by-subtraction, and bus discipline.

const ALL_CUES = Object.keys(SPOKEY_CUES) as CueName[];

describe('SPOKEY_CUES design laws', () => {
  it('covers the full frozen cue vocabulary (13 cues)', () => {
    expect(ALL_CUES).toHaveLength(13);
  });

  it('every RAW attack value is ≥120ms — unease, never jump-scare', () => {
    // assert the TABLE, not clampAttack(table): composing the law with the
    // data can never fail and tests nothing (audit H4 — tautology).
    for (const name of ALL_CUES) {
      expect(SPOKEY_CUES[name].attackMs, `${name} attack`).toBeGreaterThanOrEqual(MIN_ATTACK_MS);
    }
  });

  it('only the bed sustains — everything else self-terminates', () => {
    for (const name of ALL_CUES) {
      const expected = name === 'drone-start';
      expect(SPOKEY_CUES[name].sustain ?? false, name).toBe(expected);
    }
  });

  it('the trigger and jackpot escalate by SUBTRACTION (cut-swell), never fanfare', () => {
    expect(SPOKEY_CUES['feature-trigger'].kind).toBe('cut-swell');
    expect(SPOKEY_CUES.jackpot.kind).toBe('cut-swell');
    // ramped, not instant: their attacks are far above the floor
    expect(SPOKEY_CUES['feature-trigger'].attackMs).toBeGreaterThanOrEqual(600);
    expect(SPOKEY_CUES.jackpot.attackMs).toBeGreaterThanOrEqual(600);
  });

  it('win-family cues live on the events bus so proximity can duck them', () => {
    for (const name of ['win-celebrate', 'ldw', 'ldw-honest', 'rollup'] as const) {
      expect(SPOKEY_CUES[name].bus, name).toBe('events');
    }
  });

  it('the figure rises on the stingers bus as a shepard layer', () => {
    expect(SPOKEY_CUES['figure-near'].bus).toBe('stingers');
    expect(SPOKEY_CUES['figure-near'].kind).toBe('shepard');
  });

  it('the honest LDW is a DIFFERENT sound (descend), not a quieter celebration', () => {
    expect(SPOKEY_CUES['ldw-honest'].kind).toBe('descend');
    expect(SPOKEY_CUES.ldw.kind).not.toBe('descend');
  });

  it('every gain is a sane pre-mix level (0..1] and durations are bounded', () => {
    for (const name of ALL_CUES) {
      const i = SPOKEY_CUES[name];
      expect(i.gain, `${name} gain`).toBeGreaterThan(0);
      expect(i.gain, `${name} gain`).toBeLessThanOrEqual(1);
      expect(i.durationMs, `${name} duration`).toBeLessThanOrEqual(6000);
    }
  });
});
