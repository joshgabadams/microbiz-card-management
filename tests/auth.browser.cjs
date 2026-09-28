// Optional Chromium QA: set PLAYWRIGHT_MODULE to a locally installed package.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const base = process.env.QA_BASE_URL || 'http://127.0.0.1:5173';
const output = process.env.QA_OUTPUT;
(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(() => {
      Storage.prototype.setItem = () => { throw new Error('Unexpected storage write'); };
    });
    if (output) fs.mkdirSync(output, { recursive: true });
    const screenshot = async name => { if (output) await page.screenshot({ path: `${output}/${name}.png`, fullPage: true }); };
    const enter = () => page.getByRole('button', { name: 'Sign in', exact: true }).click();
    const navigate = async path => page.evaluate(path => { history.pushState({}, '', path); dispatchEvent(new PopStateEvent('popstate')); }, path);
    const setSession = async permissions => page.evaluate(async permissions => {
      const { sessionStore, normalizeSession } = await import('/src/services/session.js');
      sessionStore.set(normalizeSession({ user: { id: 'qa-user', name: 'QA Operator' }, permissions }));
    }, permissions);
    if (process.env.QA_PRODUCTION === '1') {
      await page.goto(base + '/cards/MBZ-001');
      await page.getByRole('heading', { name: /Welcome to/ }).waitFor();
      assert(await page.getByRole('button', { name: 'Staff sign-in unavailable' }).isDisabled());
      assert.equal(await page.getByRole('button', { name: 'Sign in' }).count(), 0);
      assert.equal(await page.locator('.app-shell').count(), 0);
      await screenshot('production-closed');
      assert.deepEqual(errors, []);
      console.log('Production build browser checks passed: staff access closed, no demo entry or protected data.');
      return;
    }
    await page.goto(base + '/cards/MBZ-001');
    await page.getByRole('heading', { name: /Welcome to/ }).waitFor();
    assert.equal(await page.locator('input').count(), 0);
    assert.equal(await page.locator('.app-shell').count(), 0);
    await screenshot('entry-desktop');
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      if (width === 390) await screenshot('entry-mobile');
    }
    await enter();
    await page.getByRole('heading', { name: 'Card Profile', exact: true }).waitFor();
    assert(await page.getByRole('button', { name: 'Freeze this card', exact: true }).isDisabled());
    await page.getByRole('tab', { name: 'Customer', exact: true }).click();
    await page.getByRole('link', { name: 'View Full Profile' }).waitFor();
    assert(!(await page.locator('.card-tab-panel').innerText()).includes('234567891'));
    assert.equal(await page.locator('.topbar').getByText(/Demo workspace|Demo Operator|End demo/).count(), 0);
    assert.equal(await page.getByRole('button', { name: 'Sign out', exact: true }).locator('svg').count(), 1);
    for (const name of ['Activate this card', 'Freeze this card', 'Unfreeze this card', 'Block and hotlist this card', 'Unlink card from customer account', 'Reassign or replace this card']) {
      assert(await page.getByRole('button', { name, exact: true }).isDisabled());
    }
    await page.getByRole('tab', { name: 'Activity', exact: true }).click();
    await page.locator('.card-timeline-item').first().waitFor();
    assert.equal(await page.locator('.card-timeline').evaluate(node => getComputedStyle(node).listStyleType), 'none');
    assert.equal(await page.locator('.card-timeline-item').first().evaluate(node => getComputedStyle(node).display), 'grid');
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await screenshot(`profile-activity-${width}`);
    }
    await setSession(['cards.read']);
    await page.getByRole('heading', { name: 'Card Profile', exact: true }).waitFor();
    assert.equal(await page.getByRole('navigation', { name: 'Main navigation', exact: true }).getByRole('link', { name: 'Audit Trail' }).count(), 0);
    await navigate('/audit');
    await page.getByRole('heading', { name: 'Access restricted' }).waitFor();
    assert.equal(await page.locator('.event-log').count(), 0);
    await screenshot('restricted-desktop');
    await navigate('/cards/MBZ-001');
    await page.getByRole('heading', { name: 'Card Profile', exact: true }).waitFor();
    await page.evaluate(async () => {
      const { sessionStore } = await import('/src/services/session.js'); sessionStore.set(null, 'expired');
    });
    await page.getByRole('heading', { name: /Welcome to/ }).waitFor();
    await page.getByRole('alert').filter({ hasText: 'Your session has ended' }).waitFor();
    assert.equal(await page.locator('.app-shell').count(), 0);
    await enter();
    await page.getByRole('heading', { name: 'Card Profile', exact: true }).waitFor();
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      if (width === 390) await screenshot('session-mobile');
    }
    await page.getByRole('button', { name: 'Sign out', exact: true }).click();
    await page.getByRole('heading', { name: /Welcome to/ }).waitFor();
    await page.reload();
    await page.getByRole('heading', { name: /Welcome to/ }).waitFor();
    assert.equal(await page.locator('.app-shell').count(), 0);
    assert.deepEqual(errors, []);
    console.log('Auth browser checks passed: entry, deep link, masking, capability visibility, permissions, expiry, logout, reload, storage and responsive layouts.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
