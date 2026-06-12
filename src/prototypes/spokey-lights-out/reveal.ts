// The held-value reveal (ADR-0013, the hidden↔visible A/B). In the default
// hidden path the player watches the COUNT climb but not each tile's worth until
// the flashlight sweep reveals them — anticipatory dopamine peaks at maximum
// uncertainty (Fiorillo 2003). The visible path is the market-proven control.
// One `hiddenValues` flag flips between them; this module owns the pure logic so
// both presenter paths and the unit tests share one source of truth.

import type { HoldTile } from './holdwin';

/** The flashlight sweeps the held tiles in reading order: left→right by reel,
 *  top→bottom within a reel. With the shared `reel*rows+row` index, that is
 *  simply ascending index. */
export function revealOrder(tiles: readonly HoldTile[]): HoldTile[] {
  return [...tiles].sort((a, b) => a.index - b.index);
}

/**
 * What a held tile shows right now. In hidden mode a not-yet-swept tile shows
 * nothing (the flashlight hasn't reached it) — return `null` so the presenter
 * draws the covered state; otherwise the captured value.
 */
export function shownValue(tile: HoldTile, revealed: boolean, hidden: boolean): number | null {
  if (hidden && !revealed) return null;
  return tile.value;
}

/** The meter value mid-sweep: only revealed tiles count toward the shown total
 *  in hidden mode; in visible mode the full total shows from the start. */
export function visibleTotal(
  ordered: readonly HoldTile[],
  revealedCount: number,
  hidden: boolean,
): number {
  if (!hidden) return ordered.reduce((sum, t) => sum + t.value, 0);
  let sum = 0;
  for (let i = 0; i < revealedCount && i < ordered.length; i++) sum += ordered[i]?.value ?? 0;
  return sum;
}
