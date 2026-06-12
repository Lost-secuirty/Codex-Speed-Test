// Visual regression for SPOKEY: LIGHTS OUT (ADR-0006, ADR-0011, ADR-0017).
// Four committed baselines: the `lit` frame (visibility forced to 1.0) is the
// load-bearing art proof; the `dark` frame guards the mood and only holds
// because structured-dark luminance anchors keep it diffable; and TWO feature
// frames pin both ends of the hidden↔visible A/B (ADR-0013) — `visible` shows
// every captured value, `hidden` shows the covered "watch the count" state.
// All are deterministic at a fixed seed, nothing animating.

import { expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { createApp } from '../../src/lib/ui/app-shell';
import { config } from '../../src/prototypes/spokey-lights-out/config';
import { resolveFeature } from '../../src/prototypes/spokey-lights-out/resolver';
import {
  buildScene,
  featureParams,
  type SceneOptions,
} from '../../src/prototypes/spokey-lights-out/scene';

const BOARD = config.board.reels * config.board.rows;

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

/** First seed whose feature settles non-jackpot (locks < full board). */
function firstNonJackpotSeed(): number {
  for (let s = 1; s < 2000; s++) {
    if (resolveFeature(s, featureParams).accumulator.locked.length < BOARD) return s;
  }
  throw new Error('no non-jackpot seed found');
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

it('LIGHTS OUT end-state, values shown — the VISIBLE A/B baseline (ADR-0013)', async () => {
  // seed 7 fills the board (blackout jackpot); every cell is a lit collectible
  // showing its captured value.
  const { app, host } = await mountScene({ feature: true, hiddenValues: false });
  await expect(page.elementLocator(app.canvas)).toMatchScreenshot('spokey-feature-visible');
  app.destroy(true);
  host.remove();
});

it('LIGHTS OUT mid-feature, values covered — the HIDDEN A/B baseline (ADR-0013)', async () => {
  // same board, hiddenValues + 0 revealed: collectibles lit, values still hidden
  // (the "watch the count, not the worth" state).
  const { app, host } = await mountScene({ feature: true, hiddenValues: true, featureRevealed: 0 });
  await expect(page.elementLocator(app.canvas)).toMatchScreenshot('spokey-feature-hidden');
  app.destroy(true);
  host.remove();
});

it('the figure-arrival feature triggers, sweeps, and settles on a jackpot', async () => {
  const { app, host, scene } = await mountScene({ reducedMotion: true });
  scene.forceFeature(); // seed-7 advance → full-board jackpot
  expect(scene.isSpinning()).toBe(true);
  await expect.poll(() => scene.isSpinning(), { timeout: 15000, interval: 100 }).toBe(false);
  const cues = scene.playedCues();
  expect(cues).toContain('feature-trigger');
  expect(cues.indexOf('feature-trigger')).toBeLessThan(cues.indexOf('rollup')); // sweep after trigger
  expect(cues.at(-1)).toBe('jackpot');
  app.destroy(true);
  host.remove();
});

it('a non-jackpot feature settles on win-celebrate (the other settle branch)', async () => {
  const seed = firstNonJackpotSeed();
  const { app, host, scene } = await mountScene({ reducedMotion: true });
  scene.forceFeature(seed);
  await expect.poll(() => scene.isSpinning(), { timeout: 15000, interval: 100 }).toBe(false);
  expect(scene.playedCues().at(-1)).toBe('win-celebrate');
  app.destroy(true);
  host.remove();
});
