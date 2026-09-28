// Staged intake regression coverage using an existing Playwright installation.
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
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    await page.addInitScript(() => { Storage.prototype.setItem = () => { throw new Error('Unexpected persistent storage write'); }; });
    if (output) fs.mkdirSync(output, { recursive: true });
    const shot = async name => { if (output) await page.screenshot({ path: `${output}/${name}.png`, fullPage: true }); };
    const next = () => page.getByRole('button', { name: 'Continue to card details' }).click();
    const review = () => page.getByRole('button', { name: 'Review batch' }).click();
    const stage = async name => {
      assert.equal(await page.locator('[aria-label="Stock intake progress"] [aria-current="step"]').textContent(), name);
      await page.waitForFunction(() => document.activeElement?.tagName === 'H2');
    };
    const responsive = async name => {
      for (const width of [320, 390, 768, 1024, 1440]) {
        await page.setViewportSize({ width, height: 1000 });
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${name} overflows at ${width}`);
        if ([390, 1440].includes(width)) await shot(`intake-${name}-${width}`);
      }
    };
    await page.route('**/src/api/inventory.api.js*', route => route.fulfill({ contentType: 'application/javascript', body: `
      import { inventoryApi as demo } from '/src/api/demo/inventory.api.js';
      window.intakeCalls = 0;
      window.intakeRequests = [];
      export const inventoryApi = { ...demo, receive: async input => {
        window.intakeCalls++;
        window.intakeRequests.push(JSON.stringify(input));
        if (window.intakeCalls === 1) throw new Error('Simulated transport failure');
        return demo.receive(input);
      }};
    ` }));
    await page.goto(base + '/inventory/receive');
    await shot('brand-login-1440');
    await page.setViewportSize({ width: 390, height: 844 });
    await shot('brand-login-390');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.getByLabel('Batch reference').waitFor();
    await responsive('batch');
    assert.equal(await page.getByLabel('Serial number').count(), 0);
    await next();
    await page.locator('.form-error-summary').waitFor();
    assert(await page.locator('.form-error-summary').evaluate(node => node === document.activeElement));
    await page.getByLabel('Batch reference').fill('PHASE9-BATCH');
    await page.getByLabel('Card product').selectOption('Business Debit');
    await page.getByLabel('Receiving branch').selectOption('Mpape');
    await page.getByLabel('Expected quantity').fill('2');
    await next();
    await stage('2Card Details');
    await review();
    await page.locator('.form-error-summary').waitFor();
    assert.match(await page.locator('.form-error-summary').innerText(), /Quantity must match/);
    await page.getByLabel('Serial number').fill('PHASE9-SERIAL-1');
    await page.getByLabel('PAN last four digits').fill('4821');
    await page.getByLabel('Expiry month').fill('2028-10');
    await page.getByRole('button', { name: 'Add card row' }).click();
    await page.getByLabel('Serial number').nth(1).fill('PHASE9-SERIAL-1');
    await page.getByLabel('PAN last four digits').nth(1).fill('5822');
    await page.getByLabel('Expiry month').nth(1).fill('2028-11');
    await review();
    assert.match(await page.locator('.form-error-summary').innerText(), /Serial numbers must be unique/);
    await page.getByLabel('Serial number').nth(1).fill('PHASE9-SERIAL-2');
    await page.getByRole('button', { name: 'Back', exact: true }).click();
    await stage('1Batch Details');
    assert.equal(await page.getByLabel('Expected quantity').inputValue(), '2');
    assert.equal(await page.getByLabel('Batch reference').inputValue(), 'PHASE9-BATCH');
    await next();
    assert.equal(await page.getByLabel('Serial number').nth(1).inputValue(), 'PHASE9-SERIAL-2');
    await responsive('cards');
    await review();
    await stage('3Review');
    assert.equal(await page.getByRole('dialog').count(), 0);
    assert.match(await page.locator('.receipt-review-list').innerText(), /••••.*4821/);
    await responsive('review');
    await page.getByRole('button', { name: 'Edit batch details' }).click();
    await page.getByLabel('Receiving branch').selectOption('Head Office');
    await next(); await review();
    assert.match(await page.locator('.receipt-details').innerText(), /Head Office/);
    await page.getByRole('button', { name: 'Confirm receipt' }).click();
    await page.keyboard.press('Escape');
    assert(await page.getByRole('button', { name: 'Confirm receipt' }).evaluate(node => node === document.activeElement));
    await page.getByRole('button', { name: 'Cancel intake' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Cancel', exact: true }).click();
    assert.match(await page.locator('.receipt-details').innerText(), /PHASE9-BATCH/);
    // A transport failure must retain the reviewed payload and allow one safe retry.
    await page.getByRole('button', { name: 'Confirm receipt' }).click();
    await page.getByRole('button', { name: 'Receive demo stock' }).click();
    await page.locator('.form-error-summary').filter({ hasText: 'Stock was not received' }).waitFor();
    await page.getByRole('button', { name: 'Receive demo stock' }).click();
    await page.getByRole('heading', { name: 'Demo stock received' }).waitFor();
    assert.equal(await page.evaluate(() => window.intakeCalls), 2);
    assert(await page.evaluate(() => window.intakeRequests[0] === window.intakeRequests[1]), 'retry must preserve the reviewed payload and request ID');
    await stage('4Complete');
    await page.getByRole('status').filter({ hasText: '2 cards are now available at Head Office' }).waitFor();
    await responsive('complete');
    await page.getByRole('button', { name: 'Receive another batch' }).click();
    await stage('1Batch Details');
    assert.equal(await page.getByLabel('Batch reference').inputValue(), '');
    await page.getByLabel('Batch reference').fill('DISCARD-ME');
    await page.getByRole('button', { name: 'Cancel intake' }).click();
    await page.getByRole('button', { name: 'Discard details' }).click();
    assert.equal(await page.getByLabel('Batch reference').inputValue(), '');
    assert.deepEqual(errors, []);
    console.log('PASS: four intake stages at five widths, validation, preserved edits, masked review, cancel/discard, failed submission/retry, success and reset.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
