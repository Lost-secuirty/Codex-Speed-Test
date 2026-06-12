// Thin Pixi Application bootstrap (ADR-0005): fixed-size, deterministic
// canvases — resolution pinned to 1 so visual-regression snapshots compare
// byte-for-byte across machines (ADR-0006).

import { Application } from 'pixi.js';

export interface ShellOptions {
  width: number;
  height: number;
  background: number;
}

export async function createApp(options: ShellOptions): Promise<Application> {
  const app = new Application();
  await app.init({
    width: options.width,
    height: options.height,
    background: options.background,
    antialias: true,
    resolution: 1,
    autoDensity: false,
  });
  return app;
}

export function mount(app: Application, host: HTMLElement): void {
  host.appendChild(app.canvas);
}
