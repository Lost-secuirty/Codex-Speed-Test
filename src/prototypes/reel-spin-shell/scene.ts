// The reel-spin-shell scene: 3 procedural reels, a spin button, GSAP spin
// driven by the pure reel-math module, sound hooks on start/stop/settle.
// Deliberately font-free — vector Graphics only — so the visual baseline
// compares deterministically across Chromium builds (ADR-0006).

import { Button } from '@pixi/ui';
import type { Application } from 'pixi.js';
import { Container, Graphics } from 'pixi.js';
import { playCue, playedCues } from '../../lib/audio/sound';
import { killTweens, pulse, reelSpinTo } from '../../lib/juice/tween';
import type { ProtoApi } from '../../lib/proto-contract';
import {
  cellOffsetY,
  settleDurationMs,
  spinDistance,
  stripWindow,
  wrapIndex,
} from '../../lib/reels/reel-math';
import { config, type SymbolName } from './config';

const SYMBOL_STYLES: Record<SymbolName, { color: number; draw: (g: Graphics, s: number) => void }> =
  {
    ruby: {
      color: 0xe5484d,
      draw: (g, s) => g.poly([s / 2, s * 0.12, s * 0.88, s / 2, s / 2, s * 0.88, s * 0.12, s / 2]),
    },
    emerald: {
      color: 0x46a758,
      draw: (g, s) => g.roundRect(s * 0.18, s * 0.18, s * 0.64, s * 0.64, s * 0.12),
    },
    sapphire: { color: 0x3e63dd, draw: (g, s) => g.circle(s / 2, s / 2, s * 0.34) },
    amber: {
      color: 0xffb224,
      draw: (g, s) => g.poly([s / 2, s * 0.14, s * 0.86, s * 0.82, s * 0.14, s * 0.82]),
    },
    pearl: {
      color: 0xeceef0,
      draw: (g, s) => {
        g.circle(s / 2, s / 2, s * 0.3);
        g.circle(s / 2, s / 2, s * 0.14);
      },
    },
  };

function drawCell(symbol: SymbolName, size: number): Graphics {
  const g = new Graphics();
  g.roundRect(0, 0, size, size, 12).fill(0x1d2030).stroke({ width: 2, color: 0x2c3048 });
  const style = SYMBOL_STYLES[symbol];
  style.draw(g, size);
  g.fill(style.color);
  return g;
}

interface Reel {
  /** masked viewport column */
  frame: Container;
  /** the moving strip inside the viewport */
  strip: Container;
  /** index of the symbol currently at the TOP visible cell */
  top: number;
}

export interface Scene {
  spin: () => void;
  isSpinning: () => boolean;
  playedCues: () => readonly string[];
  api: ProtoApi;
}

export function buildScene(app: Application): Scene {
  const { reels: rc, strip: symbols, canvas, button: bc } = config;
  const pitch = rc.cellSize + rc.cellGap;
  const reelsWidth = rc.count * rc.cellSize + (rc.count - 1) * rc.reelGap;
  const reelsHeight = rc.visible * rc.cellSize + (rc.visible - 1) * rc.cellGap;
  const originX = (canvas.width - reelsWidth) / 2;
  const originY = 48;

  let spinning = false;
  let spinCount = 0;
  let settled = 0;

  const reels: Reel[] = [];
  for (let i = 0; i < rc.count; i++) {
    const frame = new Container();
    frame.x = originX + i * (rc.cellSize + rc.reelGap);
    frame.y = originY;
    const mask = new Graphics().roundRect(0, 0, rc.cellSize, reelsHeight, 10).fill(0xffffff);
    frame.mask = mask;
    frame.addChild(mask);
    const strip = new Container();
    frame.addChild(strip);
    app.stage.addChild(frame);
    const reel: Reel = { frame, strip, top: wrapIndex(i * 2, symbols.length) };
    renderIdle(reel);
    reels.push(reel);
  }

  function renderIdle(reel: Reel): void {
    reel.strip.removeChildren();
    reel.strip.y = 0;
    const window = stripWindow(symbols, reel.top, rc.visible);
    window.forEach((symbol, row) => {
      const cell = drawCell(symbol as SymbolName, rc.cellSize);
      cell.y = cellOffsetY(row, rc.cellSize, rc.cellGap);
      reel.strip.addChild(cell);
    });
  }

  function renderSpinStrip(reel: Reel, distance: number): void {
    // Pre-build the whole travel strip (distance + visible cells), then one
    // GSAP tween slides it — no per-tick re-render. Row r holds the symbol
    // `top + r` and sits at (r - distance) * pitch, so the ORIGINAL window
    // shows at strip.y = +distance * pitch and the FINAL window at y = 0.
    reel.strip.removeChildren();
    const total = distance + rc.visible;
    const finalTop = wrapIndex(reel.top + distance, symbols.length);
    for (let row = 0; row < total; row++) {
      const symbol = symbols[wrapIndex(finalTop + row - distance, symbols.length)];
      if (symbol === undefined) continue;
      const cell = drawCell(symbol, rc.cellSize);
      cell.y = cellOffsetY(row, rc.cellSize, rc.cellGap) - distance * pitch;
      reel.strip.addChild(cell);
    }
  }

  function spin(): void {
    if (spinning) return;
    spinning = true;
    settled = 0;
    spinCount++;
    playCue('spin-start');
    reels.forEach((reel, i) => {
      // placeholder outcome: deterministic cycle — NOT slot math (ADR-0001)
      const target = wrapIndex(reel.top + spinCount + i * 3, symbols.length);
      const distance = spinDistance(reel.top, target, symbols.length, rc.turns);
      renderSpinStrip(reel, distance);
      reel.top = target;
      killTweens(reel.strip);
      // start at the pre-built offset (original window), travel to rest (0)
      reel.strip.y = distance * pitch;
      reelSpinTo(reel.strip, 0, settleDurationMs(rc.baseDurationMs, rc.staggerMs, i), () => {
        renderIdle(reel);
        playCue('reel-stop');
        settled++;
        if (settled === rc.count) {
          spinning = false;
          playCue('spin-settle');
        }
      });
    });
  }

  // spin button: vector play-triangle in a circle (no text — font rendering
  // varies across Chromium builds and would poison the baseline)
  const face = new Graphics();
  face.circle(bc.radius, bc.radius, bc.radius).fill(bc.color);
  face.poly([
    bc.radius * 0.72,
    bc.radius * 0.55,
    bc.radius * 0.72,
    bc.radius * 1.45,
    bc.radius * 1.5,
    bc.radius,
  ]);
  face.fill(0x14161f);
  const buttonView = new Container();
  buttonView.addChild(face);
  buttonView.x = (canvas.width - bc.radius * 2) / 2;
  buttonView.y = originY + reelsHeight + 36;
  const button = new Button(buttonView);
  button.onPress.connect(() => {
    pulse(buttonView);
    spin();
  });
  app.stage.addChild(buttonView);

  const api: ProtoApi = {
    ready: true,
    spin,
    state: () => ({ spinning }),
    playedCues,
  };

  return { spin, isSpinning: () => spinning, playedCues, api };
}
