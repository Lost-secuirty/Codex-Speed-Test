// SPOKEY: LIGHTS OUT — the presenter (ADR-0010 resolve-then-present). A pure
// resolver emits the outcome script; this dumb player animates it. Darkness is
// data (ADR-0011): per-cell brightness from visibility.ts maps to alpha over a
// near-black board — no shaders. PR1 = base game; the hold&win feature is PR2,
// real synthesized audio is PR3 (here we reuse the scaffold's placeholder beep
// cues so verify.mjs's sound contract holds).

import { Button } from '@pixi/ui';
import type { Application } from 'pixi.js';
import { Container, Graphics } from 'pixi.js';
import { playCue } from '../../lib/audio/sound';
import type { ProtoApi } from '../../lib/proto-contract';
import { config } from './config';
import { cellCoord } from './holdwin';
import { advanceProximity, figureArrived } from './proximity';
import {
  countScatter,
  type FeatureParams,
  resolveFeature,
  resolveSpin,
  type SpinParams,
} from './resolver';
import { shownValue, visibleTotal } from './reveal';
import { drawCell } from './symbols';
import { cellLight, type LightSource } from './visibility';

export interface SceneOptions {
  /** force every cell to full brightness — the load-bearing baseline (ADR-0011). */
  lightsOn?: boolean;
  /** initial seed for the deterministic idle board. */
  seed?: number;
  /** render a frozen LIGHTS OUT end-state instead of the idle board — the
   *  visual baseline for the feature (ADR-0013/0017). */
  feature?: boolean;
  /** override config.flags.hiddenValues — pins both ends of the A/B baseline. */
  hiddenValues?: boolean;
  /** how many tiles are revealed in the static feature frame (default: all).
   *  0 with hiddenValues true is the covered "watch the count" state. */
  featureRevealed?: number;
  /** override config.flags.reducedMotion (tests speed the feature to settle). */
  reducedMotion?: boolean;
}

export interface Scene {
  spin: () => void;
  isSpinning: () => boolean;
  playedCues: () => readonly string[];
  /** debug/test: play LIGHTS OUT immediately at an optional explicit seed. */
  forceFeature: (seed?: number) => void;
  api: ProtoApi;
}

const { board: B, light: L, timing, cabinet, meter } = config;

const spinParams: SpinParams = {
  reels: B.reels,
  rows: B.rows,
  strip: config.strip,
  paytable: config.paytable,
  reelDurationMs: timing.reelDurationMs,
  reelStaggerMs: timing.reelStaggerMs,
  nearMiss: config.flags.nearMiss,
  scatter: config.scatter,
  // a base spin's figure sightings advance proximity (ADR-0012).
  figure: 'figure',
  stepsToArrive: config.feature.stepsToArrive,
};

export const featureParams: FeatureParams = {
  reels: B.reels,
  rows: B.rows,
  strip: config.strip,
  holdSymbols: config.feature.holdSymbols,
  respins: config.feature.respins,
  maxRespins: config.feature.maxRespins,
  values: config.feature.values,
  maxNewPerRespin: config.feature.maxNewPerRespin,
  durations: {
    trigger: config.feature.triggerMs,
    lock: config.feature.lockMs,
    respin: config.feature.respinMs,
    reveal: config.feature.revealMs,
    jackpot: config.feature.jackpotMs,
    settle: config.feature.settleMs,
  },
};

const pitch = B.cell + B.gap;
const reelPitch = B.cell * B.rows + B.gap * (B.rows - 1) + B.reelGap;
const boardWidth = B.reels * B.cell + B.reelGap * (B.reels - 1);
const originX = (config.canvas.width - boardWidth) / 2;

export function buildScene(app: Application, opts: SceneOptions = {}): Scene {
  const lightsOn = opts.lightsOn ?? false;
  let seed = (opts.seed ?? 1) >>> 0;
  let spinning = false;
  let total = 0;
  /** figure proximity 0→1; at 1 the next spin fires LIGHTS OUT (ADR-0012). */
  let proximity = 0;
  let featureArmed = false;
  const hiddenValues = opts.hiddenValues ?? config.flags.hiddenValues;
  const motionScale = (opts.reducedMotion ?? config.flags.reducedMotion) ? 6 : 1;
  /** cone position in grid columns (0..reels-1); the searched pocket. */
  let coneCol = 2;
  const cues: string[] = [];
  // value badges for the feature's captured tiles (above the reels + cone).
  const badgeLayer = new Container();
  const logCue = (name: Parameters<typeof playCue>[0]) => {
    cues.push(name);
    playCue(name);
  };

  // --- structured-dark background: faint road lines keep the dark frame
  //     diffable (ADR-0011), never pure black. ---
  const bg = new Graphics();
  for (let i = 1; i < 5; i++) {
    const y = (config.canvas.height / 5) * i;
    bg.moveTo(0, y + 8).lineTo(config.canvas.width, y);
  }
  bg.stroke({ width: 1, color: 0x20242e, alpha: 0.5 });
  app.stage.addChild(bg);

  // --- cabinet chrome (diegetic frame) ---
  const cab = new Graphics();
  cab
    .roundRect(8, 8, config.canvas.width - 16, config.canvas.height - 16, 14)
    .stroke({ width: 6, color: cabinet.chrome })
    .roundRect(14, 14, config.canvas.width - 28, config.canvas.height - 28, 10)
    .stroke({ width: 2, color: cabinet.rust, alpha: 0.7 });
  app.stage.addChild(cab);

  // --- board: 5 masked reels of 4 cells ---
  interface Reel {
    container: Container;
    cells: Graphics[];
  }
  const reels: Reel[] = [];
  for (let r = 0; r < B.reels; r++) {
    const container = new Container();
    container.x = originX + r * (B.cell + B.reelGap);
    container.y = B.originY;
    app.stage.addChild(container);
    reels.push({ container, cells: [] });
  }

  function renderReel(r: number, symbols: string[]): void {
    const reel = reels[r];
    if (!reel) return;
    reel.container.removeChildren();
    reel.cells = [];
    for (let row = 0; row < B.rows; row++) {
      const sym = symbols[row] ?? config.strip[0];
      const cell = drawCell(sym as (typeof config.strip)[number], B.cell);
      cell.y = row * pitch;
      reel.container.addChild(cell);
      reel.cells.push(cell);
    }
  }

  // --- darkness as DATA: per-cell alpha from the light model ---
  function applyLight(): void {
    const cone: LightSource = {
      x: coneCol,
      y: (B.rows - 1) / 2,
      radius: L.coneRadius,
      intensity: L.coneIntensity,
    };
    for (let r = 0; r < reels.length; r++) {
      const reel = reels[r];
      if (!reel) continue;
      for (let row = 0; row < reel.cells.length; row++) {
        const b = lightsOn ? 1 : cellLight(r, row, [cone], L.ambient);
        const cell = reel.cells[row];
        if (cell) cell.alpha = b;
      }
    }
  }

  // --- flashlight cone (banded vector, ADR-0011), purely cosmetic over the
  //     data-driven lighting ---
  const coneG = new Graphics();
  function drawCone(): void {
    coneG.clear();
    if (lightsOn) return;
    const cx = originX + coneCol * (B.cell + B.reelGap) + B.cell / 2;
    const cy = B.originY + reelPitch / 2 - B.reelGap / 2;
    for (let band = 3; band >= 1; band--) {
      coneG.circle(cx, cy, B.cell * band * 0.7).fill({ color: 0xfff2d0, alpha: 0.04 * band });
    }
  }
  app.stage.addChild(coneG);
  app.stage.addChild(badgeLayer);

  // --- seven-segment phosphor-amber meter (font-free, ADR-0011) ---
  const meterG = new Graphics();
  meterG.x = originX;
  meterG.y = B.originY + reelPitch + 18;
  app.stage.addChild(meterG);
  const SEG: Record<string, number[]> = {
    // segments a,b,c,d,e,f,g present per digit 0-9
    '0': [1, 1, 1, 1, 1, 1, 0],
    '1': [0, 1, 1, 0, 0, 0, 0],
    '2': [1, 1, 0, 1, 1, 0, 1],
    '3': [1, 1, 1, 1, 0, 0, 1],
    '4': [0, 1, 1, 0, 0, 1, 1],
    '5': [1, 0, 1, 1, 0, 1, 1],
    '6': [1, 0, 1, 1, 1, 1, 1],
    '7': [1, 1, 1, 0, 0, 0, 0],
    '8': [1, 1, 1, 1, 1, 1, 1],
    '9': [1, 1, 1, 1, 0, 1, 1],
  };
  function drawDigit(g: Graphics, x: number, on: number[], color: number): void {
    const w = 16;
    const h = 28;
    const t = 3;
    const segs: [number, number, number, number][] = [
      [x + t, 0, w - 2 * t, t], // a
      [x + w - t, t, t, h / 2 - t], // b
      [x + w - t, h / 2, t, h / 2 - t], // c
      [x + t, h - t, w - 2 * t, t], // d
      [x, h / 2, t, h / 2 - t], // e
      [x, t, t, h / 2 - t], // f
      [x + t, h / 2 - t / 2, w - 2 * t, t], // g
    ];
    for (let i = 0; i < 7; i++) {
      const s = segs[i];
      if (!s) continue;
      g.rect(s[0], s[1], s[2], s[3]).fill({
        color: on[i] ? color : meter.dim,
        alpha: on[i] ? 1 : 0.5,
      });
    }
  }
  function updateMeter(flash = false): void {
    meterG.clear();
    const str = String(Math.min(total, 99999)).padStart(5, '0');
    for (let i = 0; i < str.length; i++) {
      drawDigit(meterG, i * 20, SEG[str[i] ?? '0'] ?? SEG['0']!, flash ? 0xffffff : meter.on);
    }
  }

  // --- LIGHTS OUT feature rendering (ADR-0017): once triggered the board is a
  //     respin grid of captured collectibles; the entry symbols are gone. ---
  function drawMiniDigit(g: Graphics, x: number, y: number, on: number[]): void {
    const w = 7;
    const h = 12;
    const t = 1.6;
    const segs: [number, number, number, number][] = [
      [x + t, y, w - 2 * t, t], // a
      [x + w - t, y + t, t, h / 2 - t], // b
      [x + w - t, y + h / 2, t, h / 2 - t], // c
      [x + t, y + h - t, w - 2 * t, t], // d
      [x, y + h / 2, t, h / 2 - t], // e
      [x, y + t, t, h / 2 - t], // f
      [x + t, y + h / 2 - t / 2, w - 2 * t, t], // g
    ];
    for (let i = 0; i < 7; i++) {
      const s = segs[i];
      if (s && on[i]) g.rect(s[0], s[1], s[2], s[3]).fill({ color: meter.on });
    }
  }

  function drawValue(g: Graphics, cx: number, cy: number, value: number): void {
    const str = String(value);
    const dw = 9;
    const startX = cx - (str.length * dw) / 2;
    for (let i = 0; i < str.length; i++) {
      drawMiniDigit(g, startX + i * dw, cy, SEG[str[i] ?? '0'] ?? SEG['0'] ?? []);
    }
  }

  function drawEmptyCell(size: number): Graphics {
    const g = new Graphics();
    g.roundRect(0, 0, size, size, 8).fill(0x0c0d12).stroke({ width: 1.5, color: 0x1a1d28 });
    return g;
  }

  /** Render a feature frame: `shown` cells are lit collectibles, the rest dark;
   *  the first `revealedCount` tiles (reveal order) show their value, the others
   *  stay covered in hidden mode (ADR-0013). The meter tracks the visible total. */
  function renderFeatureFrame(
    shown: ReadonlySet<number>,
    revealedCount: number,
    locked: readonly number[],
    values: readonly number[],
  ): void {
    const pos = new Map<number, number>();
    locked.forEach((idx, i) => {
      pos.set(idx, i);
    });
    badgeLayer.removeChildren();
    coneG.clear(); // the feature grid is self-lit; no flashlight pocket
    for (let r = 0; r < B.reels; r++) {
      const reel = reels[r];
      if (!reel) continue;
      reel.container.removeChildren();
      reel.cells = [];
      for (let row = 0; row < B.rows; row++) {
        const idx = r * B.rows + row; // shared cellIndex convention
        const isShown = shown.has(idx);
        const cell = isShown ? drawCell('eye', B.cell) : drawEmptyCell(B.cell);
        cell.y = row * pitch;
        cell.alpha = 1;
        reel.container.addChild(cell);
        reel.cells.push(cell);
        if (isShown) {
          const p = pos.get(idx) ?? 0;
          const badge = new Graphics();
          const { reel: rr, row: rw } = cellCoord(idx, B.rows);
          const bx = originX + rr * (B.cell + B.reelGap) + B.cell / 2;
          const by = B.originY + rw * pitch + B.cell * 0.56;
          // the tested+probed reveal.shownValue owns the cover/show decision
          // (one source of truth — ADR-0013).
          const shownVal = shownValue(
            { index: idx, value: values[p] ?? 0 },
            p < revealedCount,
            hiddenValues,
          );
          if (shownVal === null) {
            badge.rect(bx - 7, by + 3, 14, 3).fill({ color: meter.dim, alpha: 0.9 }); // covered
          } else {
            drawValue(badge, bx, by, shownVal);
          }
          badgeLayer.addChild(badge);
        }
      }
    }
    const ordered = locked.map((index, i) => ({ index, value: values[i] ?? 0 }));
    total = visibleTotal(ordered, revealedCount, hiddenValues);
    updateMeter(false);
  }

  // --- spin button (vector, font-free): the diegetic plunger ---
  const buttonView = new Container();
  const face = new Graphics();
  const br = 30;
  face
    .circle(br, br, br)
    .fill(config.button.idle)
    .stroke({ width: 2, color: 0x000000, alpha: 0.4 });
  face.poly([br * 0.72, br * 0.55, br * 0.72, br * 1.45, br * 1.5, br]).fill(config.button.glyph);
  buttonView.addChild(face);
  buttonView.x = config.canvas.width / 2 - br;
  buttonView.y = B.originY + reelPitch + 70;
  const button = new Button(buttonView);
  button.onPress.connect(() => spin());
  app.stage.addChild(buttonView);

  // --- the deterministic opening frame ---
  if (opts.feature) {
    // frozen LIGHTS OUT end-state. revealedCount defaults to all (the visible-
    // value baseline); 0 with hiddenValues=true is the covered baseline — the
    // two ends of the A/B (ADR-0013/0017).
    const fo = resolveFeature(seed, featureParams);
    renderFeatureFrame(
      new Set(fo.accumulator.locked),
      opts.featureRevealed ?? fo.accumulator.locked.length,
      fo.accumulator.locked,
      fo.accumulator.values,
    );
  } else {
    const idle = resolveSpin(seed, spinParams);
    for (let r = 0; r < B.reels; r++) renderReel(r, idle.board[r] ?? []);
    applyLight();
    drawCone();
    updateMeter();
  }

  function coneToReel(r: number): void {
    coneCol = r;
    drawCone();
  }

  function spin(): void {
    if (spinning) return;
    // the figure has arrived (or scatters triggered) → this spin is LIGHTS OUT.
    if (featureArmed) {
      seed = (seed + 0x9e3779b9) >>> 0;
      playFeature(seed);
      return;
    }
    spinning = true;
    seed = (seed + 0x9e3779b9) >>> 0;
    const outcome = resolveSpin(seed, spinParams);
    logCue('spin-start');
    let at = 0;
    const schedule = (fn: () => void, ms: number) => setTimeout(fn, ms / motionScale);
    for (const phase of outcome.phases) {
      if (phase.kind === 'spin' && phase.reels?.length === 1) {
        const i = phase.reels[0] ?? 0;
        schedule(() => {
          renderReel(i, outcome.board[i] ?? []);
          coneToReel(i);
          applyLight();
          logCue('reel-stop');
        }, at);
      } else if (phase.kind === 'settle') {
        schedule(() => {
          total += outcome.total;
          updateMeter(outcome.total > 0);
          if (outcome.total > 0) setTimeout(() => updateMeter(false), 200 / motionScale);
          logCue('spin-settle');
          // advance the figure; arm the feature for the NEXT spin (never this
          // one, so the first spin is always a clean base spin — ADR-0012).
          proximity = advanceProximity(proximity, phase.proximityStep ?? 0);
          if (
            figureArrived(proximity) ||
            countScatter(outcome.board, config.scatter) >= config.feature.triggerScatters
          ) {
            featureArmed = true;
          }
          spinning = false;
        }, at);
      }
      at += phase.durationMs;
    }
  }

  /** Play the LIGHTS OUT feature script: collectibles lock in, the flashlight
   *  sweeps the values, then settle (or blackout jackpot). Capped + motion-
   *  scaled so CI settles in budget. */
  function playFeature(featureSeed: number): void {
    spinning = true;
    featureArmed = false;
    const outcome = resolveFeature(featureSeed, featureParams);
    const locked = outcome.accumulator.locked;
    const values = outcome.accumulator.values;
    const shown = new Set<number>();
    let revealed = 0;
    renderFeatureFrame(shown, 0, locked, values); // dark grid at trigger
    let at = 0;
    const schedule = (fn: () => void, ms: number) => setTimeout(fn, ms / motionScale);
    for (const phase of outcome.phases) {
      const cells = phase.cells;
      if (phase.kind === 'trigger') {
        schedule(() => logCue('feature-trigger'), at);
      } else if (phase.kind === 'lock' && cells) {
        schedule(() => {
          for (const c of cells) shown.add(c);
          renderFeatureFrame(shown, revealed, locked, values);
          logCue('lights-out-tick');
        }, at);
      } else if (phase.kind === 'respin') {
        schedule(() => logCue('swarm-tick'), at);
      } else if (phase.kind === 'reveal' && cells) {
        const n = Math.max(cells.length, 1);
        for (let k = 1; k <= cells.length; k++) {
          const rc = k;
          schedule(
            () => {
              revealed = rc;
              renderFeatureFrame(shown, revealed, locked, values);
              if (rc === 1) logCue('rollup');
            },
            at + (phase.durationMs * (k - 1)) / n,
          );
        }
      } else if (phase.kind === 'settle') {
        schedule(() => {
          revealed = locked.length;
          renderFeatureFrame(shown, revealed, locked, values);
          total = outcome.total;
          updateMeter(true);
          // resolveFeature's settle cue is only ever jackpot or win-celebrate.
          logCue(phase.cue === 'jackpot' ? 'jackpot' : 'win-celebrate');
          proximity = 0; // the night resets after the figure passes
          spinning = false;
        }, at);
      }
      at += phase.durationMs;
    }
  }

  /** Debug/test hook: play the feature immediately at an explicit seed (so the
   *  jackpot AND non-jackpot settle branches are both reachable). */
  function forceFeature(featureSeed?: number): void {
    if (spinning) return;
    featureArmed = false;
    const s = featureSeed ?? (seed + 0x9e3779b9) >>> 0;
    seed = s;
    playFeature(s);
  }

  const api: ProtoApi = {
    ready: true,
    spin,
    state: () => ({ spinning }),
    playedCues: () => cues,
  };
  return { spin, isSpinning: () => spinning, playedCues: () => cues, forceFeature, api };
}
