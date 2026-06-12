# PixiJS 8 (+ @pixi/ui, GSAP) — API shape & footguns

> PixiJS v8 broke from v7 in init, Graphics, and events — the exact area where
> stale training data writes plausible-but-wrong code. Pinned at:
> `pixi.js@8.19.x`, `@pixi/ui@2.3.x`, `gsap@3.15.x` · Created 2026-06-12 by claude.

## The 30-second model

v8 is async-init, WebGPU-ready, and Graphics is now build-then-paint: queue
shapes, then `.fill(...)`/`.stroke(...)` paints what's queued. Events use the
federated system; UI widgets come from `@pixi/ui` wrapping your own views.

## Verified facts & examples

- **Async init, deterministic canvas**:
  ```ts
  const app = new Application();
  await app.init({ width, height, background, antialias: true,
                   resolution: 1, autoDensity: false });
  host.appendChild(app.canvas); // .canvas, not .view
  ```
  `resolution: 1` keeps screenshots byte-comparable across machines.
  [claude · 2026-06-12 · VERIFIED]
- **Graphics chaining**: `g.roundRect(0,0,s,s,8).fill(0x12131a).stroke({width:1.5,color:0x262a38})`.
  Painting twice = draw the shape queue twice (rim-light trick: queue glyph →
  `.stroke()` → queue glyph again → `.fill()`). [claude · 2026-06-12 · VERIFIED]
- **@pixi/ui Button wraps a view you build**:
  ```ts
  const button = new Button(viewContainer);
  button.onPress.connect(() => spin());
  app.stage.addChild(viewContainer); // add the VIEW, not the Button
  ```
  [claude · 2026-06-12 · VERIFIED]
- **GSAP is fully free since 2025 (Webflow acquisition), Club plugins
  included** — no license gate on bonus plugins. [claude · 2026-06-12 · SECONDARY]
- **Deterministic motion scaling**: prefer one `motionScale`/`timeScale`
  factor over per-call duration math — reducedMotion = scale 6 here.
  [claude · 2026-06-12 · VERIFIED]

## Footguns

- **`generateTexture` with a plain-object `frame` silently misbehaves** →
  must be `new Rectangle(...)`. (Lint plugin enforces:
  `biome-plugins/pixi-generate-texture-region.grit`.) [claude · 2026-06-12 · VERIFIED]
- **`'pointermove'` only fires while the pointer is over the interactive
  object** → drags die when the pointer leaves → use `'globalpointermove'`.
  (Plugin enforces.) [claude · 2026-06-12 · VERIFIED]
- **Text/fonts rasterize differently across machines** → font-free vector
  glyphs (e.g. seven-segment digits drawn as rects) for anything inside a
  visual-regression snapshot. [claude · 2026-06-12 · VERIFIED]
- **`app.destroy(true)` in tests** — destroy the renderer AND remove the host
  node, or later mounts leak canvases into the screenshot viewport.
  [claude · 2026-06-12 · VERIFIED]

## Version watch

- pixi 8.x minor releases move fast; Graphics API is stable but check the
  release notes on minor bumps: https://github.com/pixijs/pixijs/releases
  [claude · 2026-06-12 · SECONDARY]
