import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

// Two projects (ADR-0006): "unit" runs pure logic in node; "browser" runs in
// real Chromium with visual-regression baselines committed under
// test/browser/__screenshots__/ (CI compares, never updates — update locally
// via `npm run test:visual:update` in a commit that names the change).
export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          environment: 'node',
          include: ['test/unit/**/*.test.ts'],
        },
      },
      {
        test: {
          name: 'browser',
          include: ['test/browser/**/*.test.ts'],
          browser: {
            enabled: true,
            headless: true,
            // PW_CHROMIUM: point at an already-present Chromium when the
            // pinned browser can't be downloaded (this dev container's
            // network policy blocks cdn.playwright.dev — LEARNINGS
            // 2026-06-12). CI leaves it unset, so default is unchanged.
            provider: playwright(
              process.env.PW_CHROMIUM
                ? { launchOptions: { executablePath: process.env.PW_CHROMIUM } }
                : {},
            ),
            instances: [{ browser: 'chromium', viewport: { width: 800, height: 600 } }],
            expect: {
              toMatchScreenshot: {
                comparatorName: 'pixelmatch',
                comparatorOptions: {
                  // Headless software-WebGL rasterization differs slightly
                  // across machines; threshold tuned at scaffold time
                  // (docs/LEARNINGS.md) — tighten only with evidence.
                  threshold: 0.2,
                  allowedMismatchedPixelRatio: 0.01,
                },
              },
            },
          },
        },
      },
    ],
  },
});
