// All tunables for SPOKEY: LIGHTS OUT (AGENTS.md · Code style — nothing
// hard-coded mid-module). Placeholder outcomes only (ADR-0001).

import type { Paytable } from './ways';

export const config = {
  canvas: { width: 520, height: 640, background: 0x0a0b10 },
  board: {
    reels: 5,
    rows: 4,
    cell: 78,
    gap: 6,
    reelGap: 8,
    originY: 150,
  },
  // placeholder strip — the swarm unit (eye) is rarest; aftermath + the figure
  // are mid; common filler fills the dark. Real weighting/math is NOT here.
  strip: ['eye', 'figure', 'rad', 'mainst', 'beacon', 'mailbox', 'porch', 'web'] as const,
  scatter: 'beacon',
  // decorative paytable (no RTP meaning) — drives the win/no-win presentation.
  paytable: {
    eye: [0, 0, 0, 20, 50, 200],
    figure: [0, 0, 0, 10, 25, 100],
    rad: [0, 0, 0, 8, 16, 50],
    mainst: [0, 0, 0, 5, 10, 30],
  } satisfies Paytable,
  timing: { reelDurationMs: 620, reelStaggerMs: 170 },
  // LIGHTS OUT hold&win feature (PR2). Placeholder values only — NO RTP
  // (ADR-0001). The figure "arrives" over `stepsToArrive` sightings (ADR-0012),
  // then value tiles lock and respin with the classic reset; `maxRespins` caps
  // the outcome script so the presenter stays inside the CI wall-clock budget.
  feature: {
    stepsToArrive: 6,
    holdSymbols: ['eye', 'mailbox', 'porch', 'web'],
    respins: 3,
    maxRespins: 8,
    values: [2, 5, 10, 25, 50],
    triggerScatters: 6,
    // per-phase presenter budgets (reducedMotion scales these via timeScale).
    triggerMs: 420,
    lockMs: 240,
    respinMs: 380,
    revealMs: 220,
    jackpotMs: 600,
    settleMs: 320,
    maxNewPerRespin: 3,
  },
  cabinet: { chrome: 0x1a1c24, rust: 0x3a2418, edge: 0x2c3048 },
  meter: { on: 0xffb000, dim: 0x4a3300 }, // phosphor amber (ADR-0011 readability)
  button: { idle: 0x6a1f1f, press: 0x3a1010, glyph: 0xe5484d },
  // structured-dark anchors (ADR-0011): the dark frame still has luminance so
  // it is diffable. ambient is the floor brightness every cell keeps.
  light: { ambient: 0.06, coneRadius: 2.6, coneIntensity: 1.0 },
  flags: {
    nearMiss: true,
    stopButton: true,
    reducedMotion: false,
    // PR2/PR3 land these; declared now so config is the single source of truth.
    hiddenValues: true,
    ldwHonest: false,
    swarmVoiceCap: 24,
  },
} as const;

export type SymbolName = (typeof config.strip)[number];
