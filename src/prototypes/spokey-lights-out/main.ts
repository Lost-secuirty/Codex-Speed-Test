// SPOKEY: LIGHTS OUT bootstrap. `?lightsOn=1` forces full brightness — the
// load-bearing baseline that proves the art (ADR-0011); `?feature=1` renders the
// frozen LIGHTS OUT end-state — the visible-value baseline (ADR-0013/0017).

import { exposeProto } from '../../lib/proto-contract';
import { createApp, mount } from '../../lib/ui/app-shell';
import { config } from './config';
import { buildScene } from './scene';

const host = document.querySelector<HTMLElement>('#stage');
if (!host) throw new Error('missing #stage host');

const params = new URLSearchParams(window.location.search);
const lightsOn = params.has('lightsOn');
const feature = params.has('feature');

const app = await createApp(config.canvas);
mount(app, host);
const scene = buildScene(app, { lightsOn, feature });
exposeProto(scene.api);
