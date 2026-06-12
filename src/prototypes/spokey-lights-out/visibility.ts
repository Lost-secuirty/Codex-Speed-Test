// Pure per-cell light model (ADR-0011): darkness is DATA, not a shader. Each
// cell gets a brightness 0..1 from ambient + light sources; the renderer maps
// that to sprite tint/alpha (byte-stable across Chromium versions). The
// `?lightsOn=1` debug path forces brightness to 1.0 — the load-bearing visual
// baseline — without touching this model (the scene just skips it).

export interface LightSource {
  /** grid-space center (col, row units, fractional allowed). */
  x: number;
  y: number;
  /** reach in grid units; beyond this the source contributes nothing. */
  radius: number;
  /** peak contribution at the center (added, then clamped). */
  intensity: number;
}

export function clamp01(v: number): number {
  if (v < 0) return 0;
  if (v > 1) return 1;
  return v;
}

/** Linear falloff: full at the center, zero at/after the radius. */
export function falloff(dist: number, radius: number): number {
  if (radius <= 0 || dist >= radius) return 0;
  return 1 - dist / radius;
}

/** Brightness of a cell at grid (cx, cy) given ambient + sources. */
export function cellLight(
  cx: number,
  cy: number,
  sources: readonly LightSource[],
  ambient: number,
): number {
  let light = ambient;
  for (const s of sources) {
    const dist = Math.hypot(cx - s.x, cy - s.y);
    light += falloff(dist, s.radius) * s.intensity;
  }
  return clamp01(light);
}
