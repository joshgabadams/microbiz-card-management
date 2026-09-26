// Optional QA: PLAYWRIGHT_MODULE points to an installed Playwright package.
// Start Vite first; QA_BASE_URL and QA_OUTPUT customize the server and screenshots.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = process.env.QA_BASE_URL || 'http://127.0.0.1:5173';
const output = process.env.QA_OUTPUT;
if (output) fs.mkdirSync(output, { recursive: true });
(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1050 }, timezoneId: 'America/New_York' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const nav = name => page.getByRole('navigation', { name: 'Main navigation', exact: true }).getByRole('link', { name, exact: true }).click();
    const rows = page.locator('.data-table-desktop tbody tr');
    const count = async n => { await page.waitForFunction(n => document.querySelectorAll('.data-table-desktop tbody tr').length === n, n); };
    const clear = () => page.getByRole('button', { name: 'Clear filters', exact: true }).click();
    const noOverflow = async () => assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'document overflow');
    const screenshot = async name => { if (output) await page.screenshot({ path: path.join(output, name + '.png'), fullPage: !name.includes('detail') }); };
    await page.goto(base + '/activity');
    await page.getByRole('button', { name: 'Enter demo workspace', exact: true }).click();
    await count(10);
    await page.getByRole('button', { name: 'Next', exact: true }).click(); await count(4);
    await page.getByLabel('Reference', { exact: true }).fill('EVT-003'); await count(1);
    assert((await rows.innerText()).includes('24 Sept 2026, 14:10:00'));
    for (const [label, value] of [['Actor', 'Demo Operator'], ['Action', 'FROZEN'], ['Branch', 'Kubwa']]) await page.getByLabel(label, { exact: true }).selectOption(value);
    await page.getByLabel('From date (WAT)', { exact: true }).fill('2026-09-24');
    await page.getByLabel('To date (WAT)', { exact: true }).fill('2026-09-24'); await count(1);
    await page.getByLabel('Search events').fill('nobody');
    await page.getByRole('heading', { name: 'No matching events' }).waitFor();
    await clear(); await count(10);
    await page.getByLabel('From date (WAT)', { exact: true }).fill('2026-09-25');
    await page.getByLabel('To date (WAT)', { exact: true }).fill('2026-09-24');
    await page.getByRole('heading', { name: 'Check the date range' }).waitFor();
    assert.equal(await page.getByLabel('To date (WAT)', { exact: true }).getAttribute('aria-invalid'), 'true');
    await clear();
    await nav('Audit Trail'); await count(10);
    await page.getByLabel('Reference', { exact: true }).fill('EVT-003'); await count(1);
    const view = page.locator('.data-table-desktop').getByRole('button', { name: 'View audit event EVT-003' });
    await view.click();
    const dialog = page.getByRole('dialog');
    await dialog.waitFor();
    assert((await dialog.innerText()).includes('Customer request'));
    assert.equal(await dialog.locator('input,textarea,select').count(), 0);
    for (let i = 0; i < 8; i++) { await page.keyboard.press('Tab'); assert(await dialog.evaluate(node => node.contains(document.activeElement))); }
    await screenshot('audit-detail-desktop');
    await page.keyboard.press('Escape');
    assert(await view.evaluate(node => node === document.activeElement));
    await view.click();
    await dialog.getByRole('link', { name: 'S4D5688-Q8' }).click();
    await page.getByRole('heading', { name: 'Card Profile', exact: true }).waitFor();
    await nav('Approvals');
    for (const [value, title] of [['PENDING', 'Approval queue is not connected'], ['APPROVED', 'Approved history is not connected'], ['REJECTED', 'Rejected history is not connected']]) {
      await page.getByLabel('Queue status').selectOption(value);
      await page.getByRole('heading', { name: title }).waitFor();
    }
    // Prime both log caches, then use the actual issuance mutation to verify invalidation.
    await nav('Card Activity'); await count(10);
    await nav('Issue Card');
    await page.getByLabel('Find customer').fill('Musa');
    await page.getByRole('button', { name: 'Search', exact: true }).click();
    await page.getByRole('button', { name: /Select Musa/ }).click();
    await page.getByRole('radio', { name: /Business/ }).check();
    await page.getByRole('button', { name: 'Continue to card', exact: true }).click();
    await page.getByLabel('Available card', { exact: true }).selectOption('MBZ-002');
    await page.getByRole('button', { name: 'Continue to PIN setup', exact: true }).click();
    await page.getByRole('button', { name: 'Continue to review', exact: true }).click();
    await page.getByRole('button', { name: 'Confirm issuance', exact: true }).click();
    await page.getByRole('button', { name: 'Issue demo card', exact: true }).click();
    await page.getByRole('heading', { name: 'Demo card issued', exact: true }).waitFor();
    for (const name of ['Card Activity', 'Audit Trail']) {
      await nav(name);
      await page.getByLabel('Reference', { exact: true }).fill('S4D5681-P3'); await count(2);
      assert((await rows.first().innerText()).includes('ISSUED'));
    }
    await nav('Receive Cards');
    await page.getByLabel('Batch reference').fill('PHASE6-BATCH');
    await page.getByLabel('Card product').selectOption('Professional Debit');
    await page.getByLabel('Receiving branch').selectOption('Head Office');
    await page.getByRole('button', { name: 'Continue to card details' }).click();
    await page.getByLabel('Serial number').fill('PHASE6-SERIAL');
    await page.getByLabel('PAN last four digits').fill('8765');
    await page.getByLabel('Expiry month').fill('2028-10');
    await page.getByRole('button', { name: 'Review batch' }).click();
    await page.getByRole('button', { name: 'Confirm receipt' }).click();
    await page.getByRole('button', { name: 'Receive demo stock' }).click();
    await page.getByRole('heading', { name: 'Demo stock received' }).waitFor();
    for (const name of ['Card Activity', 'Audit Trail']) {
      await nav(name);
      await page.getByLabel('Reference', { exact: true }).fill('PHASE6-BATCH'); await count(1);
      assert((await rows.innerText()).includes('PHASE6-SERIAL'));
    }
    assert.equal(await page.evaluate(() => localStorage.length + sessionStorage.length), 0);
    // Fresh loads reset the demo and check all screens at each responsive breakpoint.
    for (const width of [1440, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 950 });
      for (const route of ['activity', 'audit', 'approvals']) {
        await page.goto(base + '/' + route);
    await page.getByRole('button', { name: 'Enter demo workspace', exact: true }).click();
        if (route === 'approvals') await page.getByRole('heading', { name: 'Approval queue is not connected' }).waitFor();
        else await page.getByRole('button', { name: 'Next', exact: true }).waitFor();
        await noOverflow();
        if ([1440, 390].includes(width)) await screenshot(route + '-' + width);
        if (route === 'audit') {
          await page.getByRole('button', { name: 'View audit event EVT-003' }).filter({ visible: true }).click();
          await dialog.waitFor();
          assert(await dialog.evaluate(node => node.scrollWidth <= node.clientWidth));
          if (width === 390) await screenshot('audit-detail-mobile');
          await page.keyboard.press('Escape');
        }
      }
      if (width <= 768) {
        await page.getByRole('button', { name: 'Open navigation' }).click();
        await dialog.getByRole('link', { name: 'Card Activity', exact: true }).click();
        await page.getByRole('heading', { name: 'Card Activity', exact: true }).waitFor();
        assert.equal(await dialog.count(), 0);
      }
    }
    // Inject adapter failures/delay only in this browser context to test shared UI recovery.
    await page.setViewportSize({ width: 1440, height: 1050 });
    await page.route('**/src/api/activity.api.js*', route => route.fulfill({ contentType: 'application/javascript', body: `
      import { activityStore } from '/src/data/activityStore.js';
      async function read(filters,audit) { await new Promise(resolve=>setTimeout(resolve,300)); if(window.__failEvents) throw Error('QA failure'); return window.__emptyEvents ? [] : activityStore.list(filters,audit); }
      export const activityApi={list:filters=>read(filters,false),audit:filters=>read(filters,true),options:async audit=>{if(window.__failOptions)throw Error('QA options');return activityStore.options(audit)},getEvent:async id=>activityStore.get(id)};
    ` }));
    await page.addInitScript(() => { window.__failEvents = true; window.__failOptions = false; });
    for (const route of ['activity', 'audit']) {
      await page.goto(base + '/' + route);
    await page.getByRole('button', { name: 'Enter demo workspace', exact: true }).click();
      await page.getByRole('status').filter({ hasText: /Loading .*events/ }).waitFor();
      await page.getByRole('heading', { name: 'Unable to load records' }).waitFor();
      await page.evaluate(() => { window.__failEvents = false; window.__emptyEvents = true; });
      await page.getByRole('button', { name: 'Try again' }).click();
      await page.getByRole('heading', { name: 'No matching events' }).waitFor();
      await page.evaluate(() => { window.__emptyEvents = false; });
      await page.getByRole('button', { name: 'Refresh', exact: true }).click(); await count(10);
    }
    await page.evaluate(() => { window.__failOptions = true; });
    await page.getByRole('button', { name: 'Refresh', exact: true }).click();
    await page.getByRole('heading', { name: 'Unable to load records' }).waitFor();
    assert(await page.getByLabel('Actor', { exact: true }).isDisabled());
    await page.evaluate(() => { window.__failOptions = false; });
    await page.getByRole('button', { name: 'Try again' }).click();
    await page.waitForFunction(() => !document.querySelector('select').disabled);
    assert.deepEqual(errors, []);
    console.log('PASS: Phase 6 routes, filters, pagination, dates/timezone, audit details/focus, approvals shell, issuance/intake log refresh, mobile navigation, 320/390/768/1440px layouts, loading/error/empty/retry, no storage or runtime errors.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
