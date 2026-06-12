---
description: Build, serve, and run the Playwright smoke test (verify.mjs).
allowed-tools: Bash(npm run build:*), Bash(npm run preview:*), Bash(node verify.mjs:*), Bash(npx playwright:*), Bash(npx vite:*)
---

Verify the app end-to-end:

1. `npm run build`
2. Start the preview server on :4173 in the background and wait until it
   responds.
3. `node verify.mjs`. If the pinned Chromium isn't installed and the download
   is blocked (this container — docs/LEARNINGS.md), set
   `PW_CHROMIUM=/opt/pw-browsers/chromium-*/chrome-linux/chrome`.

Report: build result, smoke-test result, and any console errors. Look at the
generated `shot-*.png` screenshots if something fails.
