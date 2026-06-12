// Pure spin geometry/timing — no Pixi imports, fully unit-tested, and the
// mutation probe's primary target (ADR-0004). All placeholder outcomes:
// real slot math stays in the public demo-math repo (ADR-0001).

/** Wrap any integer (including negatives) onto a strip of `count` symbols. */
export function wrapIndex(index: number, count: number): number {
  return ((index % count) + count) % count;
}

/**
 * How many symbol-steps a reel travels to land on `target`, spinning
 * forward through `turns` extra full loops for show.
 */
export function spinDistance(
  current: number,
  target: number,
  count: number,
  turns: number,
): number {
  const delta = wrapIndex(target - current, count);
  const distance = turns * count + delta;
  return distance;
}

/** Per-reel settle time: a base duration plus a stagger so reels stop left to right. */
export function settleDurationMs(base: number, stagger: number, reelIndex: number): number {
  return base + reelIndex * stagger;
}

/** Vertical pixel offset of the symbol cell at `index` in a strip column. */
export function cellOffsetY(index: number, cellHeight: number, gap: number): number {
  return index * (cellHeight + gap);
}

/** The `visible` symbols showing when the strip's top is at `top` (wraps). */
export function stripWindow(strip: readonly string[], top: number, visible: number): string[] {
  return Array.from({ length: visible }, (_, i) => {
    const symbol = strip[wrapIndex(top + i, strip.length)];
    if (symbol === undefined) throw new Error('empty strip');
    return symbol;
  });
}
