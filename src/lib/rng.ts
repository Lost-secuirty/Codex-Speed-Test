// Generic seeded PRNG (mulberry32) — shared lib, strict-tested. Determinism
// is load-bearing: the same seed reproduces a board, a figure position, and a
// visual baseline (ADR-0012). No Math.random anywhere in game logic.

/** Returns a stateful generator producing floats in [0, 1). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Integer in [0, n). */
export function randInt(rng: () => number, n: number): number {
  return Math.floor(rng() * n);
}

/** Uniform pick from a non-empty array. */
export function pick<T>(rng: () => number, arr: readonly T[]): T {
  const v = arr[randInt(rng, arr.length)];
  if (v === undefined) throw new Error('pick from empty array');
  return v;
}
