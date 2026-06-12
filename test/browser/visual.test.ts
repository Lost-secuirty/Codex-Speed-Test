// Visual regression for the reel-spin-shell scene (ADR-0006). Snapshots the
// IDLE scene only — nothing animating at capture, fixed canvas, resolution 1,
// font-free vector graphics — so the comparison stays deterministic.
// Baselines live in test/browser/__screenshots__/ (committed; CI compares,
// never updates — `npm run test:visual:update` / visual-baseline.yml update).

import { expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { createApp } from '../../src/lib/ui/app-shell';
import { config } from '../../src/prototypes/reel-spin-shell/config';
import { buildScene } from '../../src/prototypes/reel-spin-shell/scene';

it('reel-spin-shell idle scene matches the baseline', async () => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const app = await createApp(config.canvas);
  host.appendChild(app.canvas);
  const scene = buildScene(app);
  expect(scene.isSpinning()).toBe(false);

  // let the first frames render before capturing
  await new Promise((resolve) => setTimeout(resolve, 300));
  await expect(page.elementLocator(app.canvas)).toMatchScreenshot('reel-spin-shell-idle');

  app.destroy(true);
  host.remove();
});

it('spin runs to settle and fires the sound hooks', async () => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const app = await createApp(config.canvas);
  host.appendChild(app.canvas);
  const scene = buildScene(app);

  scene.spin();
  expect(scene.isSpinning()).toBe(true);
  await new Promise<void>((resolve, reject) => {
    const deadline = Date.now() + 30000;
    const poll = () => {
      if (!scene.isSpinning()) return resolve();
      if (Date.now() > deadline) return reject(new Error('spin never settled'));
      setTimeout(poll, 100);
    };
    poll();
  });

  const cues = scene.playedCues();
  expect(cues).toContain('spin-start');
  expect(cues.filter((c) => c === 'reel-stop')).toHaveLength(config.reels.count);
  expect(cues.at(-1)).toBe('spin-settle');

  app.destroy(true);
  host.remove();
});
