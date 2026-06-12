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
import { resolveSpin, type SpinParams } from './resolver';
import { drawCell } from './symbols';
import { cellLight, type LightSource } from './visibility';

export interface SceneOptions {
  /** force every cell to full brightness — the load-bearing baseline (ADR-0011). */
  lightsOn?: boolean;
  /** initial seed for the deterministic idle board. */
  seed?: number;
}

export interface Scene {
  spin: () => void;
  isSpinning: () => boolean;
  playedCues: () => readonly string[];
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
  /** cone position in grid columns (0..reels-1); the searched pocket. */
  let coneCol = 2;
  const cues: string[] = [];
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

  // --- the deterministic idle frame ---
  const idle = resolveSpin(seed, spinParams);
  for (let r = 0; r < B.reels; r++) renderReel(r, idle.board[r] ?? []);
  applyLight();
  drawCone();
  updateMeter();

  function coneToReel(r: number): void {
    coneCol = r;
    drawCone();
  }

  function spin(): void {
    if (spinning) return;
    spinning = true;
    seed = (seed + 0x9e3779b9) >>> 0;
    const outcome = resolveSpin(seed, spinParams);
    logCue('spin-start');
    const scale = config.flags.reducedMotion ? 6 : 1;
    let at = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const schedule = (fn: () => void, ms: number) => timers.push(setTimeout(fn, ms / scale));
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
          if (outcome.total > 0) setTimeout(() => updateMeter(false), 200 / scale);
          logCue('spin-settle');
          spinning = false;
        }, at);
      }
      at += phase.durationMs;
    }
  }

  const api: ProtoApi = {
    ready: true,
    spin,
    state: () => ({ spinning }),
    playedCues: () => cues,
  };
  return { spin, isSpinning: () => spinning, playedCues: () => cues, api };
}
