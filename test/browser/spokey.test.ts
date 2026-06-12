// Visual regression for SPOKEY: LIGHTS OUT (ADR-0006, ADR-0011). Two
// committed baselines: the `lit` frame (visibility forced to 1.0) is the
// load-bearing art proof; the `dark` frame guards the mood and only holds
// because structured-dark luminance anchors keep it diffable. Both are the
// deterministic idle scene — nothing animating at capture, fixed seed.

import { expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { createApp } from '../../src/lib/ui/app-shell';
import { config } from '../../src/prototypes/spokey-lights-out/config';
import { buildScene } from '../../src/prototypes/spokey-lights-out/scene';

async function mountScene(lightsOn: boolean) {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const app = await createApp(config.canvas);
  host.appendChild(app.canvas);
  const scene = buildScene(app, { lightsOn, seed: 7 });
  expect(scene.isSpinning()).toBe(false);
  await new Promise((resolve) => setTimeout(resolve, 300));
  return { app, host };
}

it('lights-on idle scene matches the baseline (the art proof)', async () => {
  const { app, host } = await mountScene(true);
  await expect(page.elementLocator(app.canvas)).toMatchScreenshot('spokey-idle-lit');
  app.destroy(true);
  host.remove();
});

it('dark idle scene matches the baseline (the mood, with anchors)', async () => {
  const { app, host } = await mountScene(false);
  await expect(page.elementLocator(app.canvas)).toMatchScreenshot('spokey-idle-dark');
  app.destroy(true);
  host.remove();
});
