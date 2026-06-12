// reel-spin-shell bootstrap: deterministic app shell + scene + the
// window.__proto contract (verify.mjs drives prototypes through it).

import { exposeProto } from '../../lib/proto-contract';
import { createApp, mount } from '../../lib/ui/app-shell';
import { config } from './config';
import { buildScene } from './scene';

const host = document.querySelector<HTMLElement>('#stage');
if (!host) throw new Error('missing #stage host');

const app = await createApp(config.canvas);
mount(app, host);
const scene = buildScene(app);
exposeProto(scene.api);
