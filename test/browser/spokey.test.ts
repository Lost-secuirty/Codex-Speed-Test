// Visual regression for SPOKEY: LIGHTS OUT (ADR-0006, ADR-0011, ADR-0017).
// Three committed baselines: the `lit` frame (visibility forced to 1.0) is the
// load-bearing art proof; the `dark` frame guards the mood and only holds
// because structured-dark luminance anchors keep it diffable; the `feature`
// frame is the frozen LIGHTS OUT end-state with values shown (the visible-value
// variant, ADR-0013). All are deterministic at a fixed seed, nothing animating.

import { expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { createApp } from '../../src/lib/ui/app-shell';
import { config } from '../../src/prototypes/spokey-lights-out/config';
import { buildScene, type SceneOptions } from '../../src/prototypes/spokey-lights-out/scene';

async function mountScene(opts: SceneOptions) {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const app = await createApp(config.canvas);
  host.appendChild(app.canvas);
  const scene = buildScene(app, { seed: 7, ...opts });
  expect(scene.isSpinning()).toBe(false);
  await new Promise((resolve) => setTimeout(resolve, 300));
  return { app, host, scene };
}

it('lights-on idle scene matches the baseline (the art proof)', async () => {
  const { app, host } = await mountScene({ lightsOn: true });
  await expect(page.elementLocator(app.canvas)).toMatchScreenshot('spokey-idle-lit');
  app.destroy(true);
  host.remove();
});

it('dark idle scene matches the baseline (the mood, with anchors)', async () => {
  const { app, host } = await mountScene({ lightsOn: false });
  await expect(page.elementLocator(app.canvas)).toMatchScreenshot('spokey-idle-dark');
  app.destroy(true);
  host.remove();
});

it('LIGHTS OUT end-state matches the baseline (collectibles + visible values)', async () => {
  // seed 7 fills the board (the blackout jackpot) — every cell is a lit
  // collectible showing its captured value (ADR-0017).
  const { app, host } = await mountScene({ feature: true });
  await expect(page.elementLocator(app.canvas)).toMatchScreenshot('spokey-feature-visible');
  app.destroy(true);
  host.remove();
});

it('the figure-arrival feature triggers and settles (cue ordering)', async () => {
  // reducedMotion speeds the scripted feature so CI settles in budget. forceFeature
  // arms + plays it deterministically without driving proximity spin-by-spin.
  const { app, host, scene } = await mountScene({ reducedMotion: true });
  scene.forceFeature();
  expect(scene.isSpinning()).toBe(true);
  await expect.poll(() => scene.isSpinning(), { timeout: 15000, interval: 100 }).toBe(false);
  const cues = scene.playedCues();
  expect(cues).toContain('feature-trigger');
  expect(cues.indexOf('feature-trigger')).toBeLessThan(cues.indexOf('rollup')); // sweep after trigger
  expect(['jackpot', 'win-celebrate']).toContain(cues.at(-1)); // settled on a terminal cue
  app.destroy(true);
  host.remove();
});
