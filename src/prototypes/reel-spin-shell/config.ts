// All tunables for the reel-spin-shell prototype live here (AGENTS.md ·
// Code style) — nothing hard-coded mid-module.

export const config = {
  canvas: { width: 480, height: 560, background: 0x14161f },
  reels: {
    count: 3,
    visible: 3,
    cellSize: 104,
    cellGap: 10,
    reelGap: 16,
    /** extra full strip loops per spin, for show */
    turns: 2,
    /** ms — first reel's travel time */
    baseDurationMs: 900,
    /** ms — added per reel index so reels settle left to right */
    staggerMs: 260,
  },
  // placeholder strip — real math stays in the demo-math repo (ADR-0001)
  strip: ['ruby', 'emerald', 'sapphire', 'amber', 'pearl'] as const,
  button: { radius: 44, color: 0x7cc4ff, pressColor: 0x4f8fd0 },
} as const;

export type SymbolName = (typeof config.strip)[number];
