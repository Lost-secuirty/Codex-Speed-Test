import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import { prototypes } from './src/prototypes-manifest';

// Multi-entry build (ADR-0004): the root index page plus one entry per
// prototype, driven by the single manifest.
const root = import.meta.dirname;
const input: Record<string, string> = {
  main: resolve(root, 'index.html'),
};
for (const proto of prototypes) {
  input[proto.id] = resolve(root, `src/prototypes/${proto.id}/index.html`);
}

export default defineConfig({
  base: './',
  build: {
    rollupOptions: { input },
  },
  preview: {
    port: 4173,
    strictPort: true,
  },
});
