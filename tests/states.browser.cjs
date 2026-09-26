// Browser-only failure injection: production code has no QA switches.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const base = process.env.QA_BASE_URL || 'http://127.0.0.1:5173';
(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    // Prewarm the transport module before connecting a page to Vite HMR.
    // Axios may otherwise trigger a first-use dependency rebuild mid-test.
    await page.request.get(base + '/src/api/http.js');
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/src/api/inventory.api.js*', route => route.fulfill({ contentType: 'application/javascript', body: `
      import { inventoryApi as demo } from '/src/api/demo/inventory.api.js';
      import { ApiError } from '/src/api/errors.js';
      export const inventoryApi = { ...demo, list: async () => {
        window.__reads = (window.__reads || 0) + 1;
        await new Promise(resolve => setTimeout(resolve, 350));
        if (window.__mode === 'network') throw new ApiError('NETWORK');
        if (window.__mode === 'forbidden') throw new ApiError('FORBIDDEN',403);
        if (window.__mode === 'unavailable') throw new ApiError('UNAVAILABLE');
        const data = await demo.list();
        return window.__mode === 'empty' ? {...data,cards:[],batches:[]} : data;
      } };
    ` }));
    await page.addInitScript(() => { window.__mode = 'network'; });
    const open = async mode => {
      await page.goto(base + '/inventory');
      await page.evaluate(mode => { window.__mode = mode; window.__reads = 0; }, mode);
      await page.getByRole('button', { name: 'Enter demo workspace' }).click();
      await page.getByRole('status').filter({ hasText: 'Loading inventory' }).waitFor();
    };
    await open('network');
    await page.getByRole('heading', { name: 'Unable to load records' }).waitFor();
    assert.equal(await page.evaluate(() => window.__reads), 2, 'transient query retries exactly once');
    await page.evaluate(() => { window.__mode = 'ok'; });
    await page.getByRole('button', { name: 'Try again' }).click();
    await page.getByLabel('Search stock').waitFor();
    assert.equal(await page.locator('.data-table-desktop tbody tr').count(), 5);
    await open('empty');
    await page.getByRole('heading', { name: 'No records found' }).waitFor();
    assert((await page.locator('.kpi').first().innerText()).includes('0'));
    for (const [mode, heading] of [['forbidden', 'Access restricted'], ['unavailable', 'Service unavailable']]) {
      await open(mode);
      await page.getByRole('heading', { name: heading, exact: true }).waitFor();
      assert.equal(await page.evaluate(() => window.__reads), 1);
      assert.equal(await page.getByRole('button', { name: 'Try again' }).count(), 0);
      assert.equal(await page.getByRole('button', { name: 'End demo' }).count(), 1);
    }
    // Real browser HTTP adapter: timeout, no mutation replay, 403 and 401 behavior.
    await open('ok');
    await page.getByLabel('Search stock').waitFor();
    let requests = 0;
    await page.route('**/qa-http/slow', async route => {
      requests += 1;
      await new Promise(resolve => setTimeout(resolve, 200));
      await route.fulfill({ json: {} }).catch(() => {});
    });
    const timeout = await page.evaluate(async () => {
      const { createHttpClient } = await import('/src/api/http.js');
      try { await createHttpClient({ baseURL: '/qa-http' }).post('slow', {}, { timeout: 40 }); }
      catch (error) { return { code: error.code, keys: Object.keys(error) }; }
    });
    assert.equal(timeout.code, 'TIMEOUT');
    assert(!timeout.keys.includes('config'));
    assert.equal(requests, 1);
    await page.route('**/qa-http/forbidden', route => route.fulfill({ status: 403, json: { message: 'DO-NOT-EXPOSE-SERVER-TOKEN' } }));
    const forbidden = await page.evaluate(async () => {
      const { createHttpClient } = await import('/src/api/http.js');
      try { await createHttpClient({ baseURL: '/qa-http' }).get('forbidden'); }
      catch (error) { return { code: error.code, message: error.message }; }
    });
    assert.equal(forbidden.code, 'FORBIDDEN');
    assert(!forbidden.message.includes('DO-NOT-EXPOSE'));
    assert.equal(await page.getByRole('button', { name: 'End demo' }).count(), 1);
    await page.route('**/qa-http/expired', route => route.fulfill({ status: 401, json: { message: 'DO-NOT-EXPOSE-SERVER-TOKEN' } }));
    await page.evaluate(async () => {
      const { createHttpClient } = await import('/src/api/http.js');
      await createHttpClient({ baseURL: '/qa-http' }).get('expired').catch(() => {});
    });
    await page.getByRole('heading', { name: /Welcome to/ }).waitFor();
    await page.getByRole('alert').filter({ hasText: 'Your session has ended' }).waitFor();
    assert(!(await page.locator('body').innerText()).includes('DO-NOT-EXPOSE'));
    assert.deepEqual(errors, []);
    console.log('PASS: loading, empty, retry/recovery, forbidden/unavailable, real HTTP timeout without replay, sanitized errors and 401 expiry.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
