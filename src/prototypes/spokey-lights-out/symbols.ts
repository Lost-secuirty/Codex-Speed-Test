// Procedural/vector symbol glyphs (no binary assets, no fonts — font
// rasterization breaks the visual gate). Each glyph gets a rim-lit silhouette
// so it clears the ≥3:1 contrast floor on the dark board (ADR-0011). Pure
// drawing; the scene tints the whole cell by its computed light value.

import { Graphics } from 'pixi.js';
import type { SymbolName } from './config';

interface Glyph {
  color: number;
  draw: (g: Graphics, s: number) => void;
}

const GLYPHS: Record<SymbolName, Glyph> = {
  // the swarm unit — two red eyes in the dark
  eye: {
    color: 0xe5484d,
    draw: (g, s) => {
      g.circle(s * 0.36, s * 0.46, s * 0.09).circle(s * 0.64, s * 0.46, s * 0.09);
    },
  },
  // the thin figure on the road — tall narrow silhouette
  figure: {
    color: 0xcfd2dc,
    draw: (g, s) => {
      g.circle(s * 0.5, s * 0.26, s * 0.08); // head
      g.roundRect(s * 0.45, s * 0.32, s * 0.1, s * 0.42, s * 0.04); // body
      g.rect(s * 0.36, s * 0.4, s * 0.28, s * 0.05); // arms
    },
  },
  // radiation trefoil
  rad: {
    color: 0xffb224,
    draw: (g, s) => {
      const cx = s * 0.5;
      const cy = s * 0.5;
      for (let i = 0; i < 3; i++) {
        const a = (i * 2 * Math.PI) / 3 - Math.PI / 2;
        const x = cx + Math.cos(a) * s * 0.26;
        const y = cy + Math.sin(a) * s * 0.26;
        g.moveTo(cx, cy).lineTo(x + Math.cos(a + 0.6) * s * 0.12, y + Math.sin(a + 0.6) * s * 0.12);
        g.lineTo(x + Math.cos(a - 0.6) * s * 0.12, y + Math.sin(a - 0.6) * s * 0.12).lineTo(cx, cy);
      }
      g.circle(cx, cy, s * 0.07);
    },
  },
  // Main St plate
  mainst: {
    color: 0x46a758,
    draw: (g, s) => g.roundRect(s * 0.18, s * 0.36, s * 0.64, s * 0.28, s * 0.04),
  },
  // alarm beacon (the scatter / blackout-jackpot marker)
  beacon: {
    color: 0xff4d4d,
    draw: (g, s) => {
      g.roundRect(s * 0.36, s * 0.5, s * 0.28, s * 0.22, s * 0.03); // base
      g.moveTo(s * 0.36, s * 0.5)
        .lineTo(s * 0.5, s * 0.26)
        .lineTo(s * 0.64, s * 0.5)
        .lineTo(s * 0.36, s * 0.5); // dome
    },
  },
  // toppled mailbox
  mailbox: {
    color: 0x8a8f9e,
    draw: (g, s) => {
      g.roundRect(s * 0.28, s * 0.42, s * 0.4, s * 0.2, s * 0.08); // box on its side
      g.rect(s * 0.62, s * 0.46, s * 0.06, s * 0.26); // post
    },
  },
  // dead porch light (lantern)
  porch: {
    color: 0x6b7280,
    draw: (g, s) => {
      g.poly([s * 0.4, s * 0.34, s * 0.6, s * 0.34, s * 0.64, s * 0.66, s * 0.36, s * 0.66]);
    },
  },
  // road webbing
  web: {
    color: 0x9aa0b5,
    draw: (g, s) => {
      const c = s * 0.5;
      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 4;
        g.moveTo(c - Math.cos(a) * s * 0.3, c - Math.sin(a) * s * 0.3);
        g.lineTo(c + Math.cos(a) * s * 0.3, c + Math.sin(a) * s * 0.3);
      }
    },
  },
};

/** A full cell: dark rounded tile + rim, then the rim-lit symbol glyph. */
export function drawCell(symbol: SymbolName, size: number): Graphics {
  const g = new Graphics();
  g.roundRect(0, 0, size, size, 8).fill(0x12131a).stroke({ width: 1.5, color: 0x262a38 });
  const glyph = GLYPHS[symbol];
  glyph.draw(g, size);
  // rim-light: a brighter thin stroke so the silhouette clears 3:1 on dark.
  g.stroke({ width: 2, color: glyph.color, alpha: 0.95 });
  glyph.draw(g, size);
  g.fill({ color: glyph.color, alpha: 0.85 });
  return g;
}
