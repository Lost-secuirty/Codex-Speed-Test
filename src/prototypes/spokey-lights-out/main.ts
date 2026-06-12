// SPOKEY: LIGHTS OUT bootstrap. `?lightsOn=1` forces full brightness — the
// load-bearing visual baseline that proves the art (ADR-0011).

import { exposeProto } from '../../lib/proto-contract';
import { createApp, mount } from '../../lib/ui/app-shell';
import { config } from './config';
import { buildScene } from './scene';

const host = document.querySelector<HTMLElement>('#stage');
if (!host) throw new Error('missing #stage host');

const lightsOn = new URLSearchParams(window.location.search).has('lightsOn');

const app = await createApp(config.canvas);
mount(app, host);
const scene = buildScene(app, { lightsOn });
exposeProto(scene.api);
