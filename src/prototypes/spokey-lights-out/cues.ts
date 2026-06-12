// SPOKEY's cue→intent table (ADR-0015), typed against the FROZEN contract
// CueName so the compiler enforces completeness — a cue without an intent is a
// build error, not a silent beep. Prototype-local (ADR-0004): the vocabulary is
// this game's, only the machinery (cue-model/playback) is shared. Design rules
// the unit tests pin: every attack ≥120ms post-clamp; the trigger and jackpot
// escalate by SUBTRACTION (cut-swell), never a bright fanfare; win-family cues
// live on `events` so proximity can duck them as the figure nears.

import type { CueIntent } from '../../lib/audio/cue-model';
import type { CueName } from './contract';

export const SPOKEY_CUES: Record<CueName, CueIntent> = {
  // the bed ignites on the first gesture and never fully stops — sustained:
  // it swells over durationMs then HOLDS (audit H2); teardown is dispose/mute.
  'drone-start': {
    bus: 'bed',
    kind: 'drone',
    freq: 55,
    attackMs: 2400,
    durationMs: 6000,
    gain: 0.5,
    sustain: true,
  },
  // base game
  'spin-loop': {
    bus: 'events',
    kind: 'noise-tick',
    freq: 220,
    attackMs: 140,
    durationMs: 260,
    gain: 0.25,
  },
  'reel-stop': {
    bus: 'events',
    kind: 'blip',
    freq: 311,
    attackMs: 120,
    durationMs: 200,
    gain: 0.3,
  },
  'near-miss': { bus: 'mid', kind: 'glass', freq: 622, attackMs: 200, durationMs: 900, gain: 0.3 },
  rollup: { bus: 'events', kind: 'blip', freq: 415, attackMs: 120, durationMs: 180, gain: 0.32 },
  'win-celebrate': {
    bus: 'events',
    kind: 'arp',
    freq: 233,
    attackMs: 140,
    durationMs: 1400,
    gain: 0.5,
  },
  ldw: { bus: 'events', kind: 'arp', freq: 233, attackMs: 140, durationMs: 900, gain: 0.4 },
  'ldw-honest': {
    bus: 'events',
    kind: 'descend',
    freq: 247,
    attackMs: 160,
    durationMs: 700,
    gain: 0.35,
  },
  // the figure
  'figure-near': {
    bus: 'stingers',
    kind: 'shepard',
    freq: 110,
    attackMs: 300,
    durationMs: 2600,
    gain: 0.4,
  },
  // the feature
  'swarm-tick': {
    bus: 'mid',
    kind: 'grain',
    freq: 2400,
    attackMs: 120,
    durationMs: 350,
    gain: 0.28,
  },
  'feature-trigger': {
    bus: 'stingers',
    kind: 'cut-swell',
    freq: 66,
    attackMs: 900,
    durationMs: 2200,
    gain: 0.7,
  },
  'lights-out-tick': {
    bus: 'events',
    kind: 'blip',
    freq: 349,
    attackMs: 120,
    durationMs: 220,
    gain: 0.34,
  },
  jackpot: {
    bus: 'stingers',
    kind: 'cut-swell',
    freq: 44,
    attackMs: 1200,
    durationMs: 3600,
    gain: 0.85,
  },
};
