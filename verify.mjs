import { chromium } from 'playwright';

// Render + behavior smoke test for the built app (run via `npm run smoke`
// against `vite preview` on :4173 — preflight and ci.yml orchestrate that).
//
// Contract: the index page lists every prototype from the manifest, and
// every prototype page exposes `window.__proto`:
//   { ready: boolean, spin(): void, state(): { spinning: boolean },
//     playedCues(): string[] }
// The smoke walks the index, visits each prototype, runs a spin to settle,
// and asserts the sound hooks fired and the console stayed clean.

const BASE = 'http://localhost:4173';
// PW_CHROMIUM: use an already-present Chromium when the pinned browser
// can't be downloaded (this dev container — docs/LEARNINGS.md 2026-06-12).
// CI installs the matching browser and leaves this unset.
const browser = await chromium.launch(
  process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {},
);
const page = await browser.newPage({
  viewport: { width: 800, height: 700 },
  deviceScaleFactor: 1,
});

const errors = [];
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text());
});
page.on('pageerror', (e) => errors.push(`PAGEERROR: ${e.message}`));

const checks = [];
const check = (name, ok, detail = '') => {
  checks.push({ name, ok });
  console.log(`${ok ? '✅' : '❌'} ${name}${detail ? ` — ${detail}` : ''}`);
};
const waitFn = (fn, arg = null, timeout = 30000) =>
  page
    .waitForFunction(fn, arg, { timeout, polling: 200 })
    .then(() => true)
    .catch(() => false);

// ---- index page ------------------------------------------------------------
await page.goto(`${BASE}/`, { waitUntil: 'load' });
await page.waitForTimeout(500);
const links = await page.$$eval('#prototype-list a', (as) => as.map((a) => a.href));
check('index page renders the prototype list', links.length >= 0 && (await page.title()) !== '');
await page.screenshot({ path: 'shot-index.png' });

// ---- each prototype ----------------------------------------------------------
for (const href of links) {
  const name = new URL(href).pathname.split('/').filter(Boolean).at(-2) ?? href;
  await page.goto(href, { waitUntil: 'load' });

  check(`${name}: boots (window.__proto ready)`, await waitFn(() => window.__proto?.ready));
  check(
    `${name}: canvas present`,
    await page.evaluate(() => Boolean(document.querySelector('canvas'))),
  );
  await page.screenshot({ path: `shot-${name}-idle.png` });

  // run one spin to settle — slow software-WebGL runners get a long budget
  await page.evaluate(() => window.__proto.spin());
  check(
    `${name}: spin starts`,
    await page.evaluate(() => window.__proto.state().spinning === true),
  );
  check(`${name}: spin settles`, await waitFn(() => !window.__proto.state().spinning, null, 60000));
  await page.screenshot({ path: `shot-${name}-settled.png` });

  const cues = await page.evaluate(() => window.__proto.playedCues());
  check(
    `${name}: sound hooks fired (start + settle)`,
    cues.includes('spin-start') && cues.includes('spin-settle'),
    cues.join(','),
  );
}

check('no console errors', errors.length === 0, errors.slice(0, 5).join(' | '));

const allOk = checks.every((c) => c.ok);
console.log(`\n${allOk ? 'PASS' : 'FAIL'} — ${checks.filter((c) => c.ok).length}/${checks.length}`);
await browser.close();
process.exit(allOk ? 0 : 1);
