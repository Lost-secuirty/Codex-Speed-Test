// Pure ways-pays evaluation for the 5×4 board (ADR-0009). Placeholder
// outcomes only — NO real RTP/math (ADR-0001); the paytable is decorative.
// board[reel][row]. A symbol pays when it appears on consecutive reels from
// the leftmost; the number of "ways" is the product of its per-reel counts.

export type Paytable = Record<string, number[]>; // pay[symbol][reelsMatched]

export interface WayWin {
  symbol: string;
  reels: number;
  ways: number;
  pay: number;
}

/** Consecutive reels (from reel 0) containing `symbol`, and the ways product. */
export function countWays(
  board: readonly string[][],
  symbol: string,
): { reels: number; ways: number } {
  let reels = 0;
  let ways = 1;
  for (const reel of board) {
    const c = reel.filter((s) => s === symbol).length;
    if (c === 0) break;
    ways *= c;
    reels += 1;
  }
  return { reels, ways };
}

/** Minimum consecutive reels a symbol must span to pay anything. */
export const MIN_REELS = 3;

/** Evaluate every distinct symbol on the board. */
export function evaluateWays(
  board: readonly string[][],
  paytable: Paytable,
): { wins: WayWin[]; total: number } {
  const symbols = new Set(board.flat());
  const wins: WayWin[] = [];
  let total = 0;
  for (const symbol of symbols) {
    const { reels, ways } = countWays(board, symbol);
    if (reels < MIN_REELS) continue;
    const per = paytable[symbol]?.[reels] ?? 0;
    if (per <= 0) continue;
    const pay = per * ways;
    wins.push({ symbol, reels, ways, pay });
    total += pay;
  }
  return { wins, total };
}
