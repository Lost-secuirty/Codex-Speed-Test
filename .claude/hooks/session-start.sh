#!/bin/bash
set -euo pipefail

# SessionStart hook for Claude Code on the web.
# Installs everything needed so builds, the linter, and the browser tests
# work out of the box in a fresh remote container.

# Only run in remote (web) sessions; local machines already have their setup.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

# JS dependencies. `npm install` (not `ci`) so the cached container state is
# reused and partial installs self-heal; it's idempotent.
npm install

# Browser for vitest browser mode + verify.mjs. The download is blocked when
# cdn.playwright.dev isn't in the container's network allowlist (LEARNINGS
# 2026-06-12) — in that case the pre-provisioned /opt/pw-browsers Chromium
# works via PW_CHROMIUM, so a failure here is non-fatal.
npx playwright install chromium || {
  echo "playwright install blocked — use PW_CHROMIUM=/opt/pw-browsers/chromium-*/chrome-linux/chrome (see docs/LEARNINGS.md)" >&2
}
exit 0
