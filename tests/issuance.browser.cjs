// Optional browser QA: set PLAYWRIGHT_MODULE to an installed Playwright package.
// Start Vite on port 5173 before running this script. No production API is used.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const base = process.env.QA_BASE_URL || 'http://127.0.0.1:5173';
const output = process.env.QA_OUTPUT;
if (output) fs.mkdirSync(output, { recursive: true });
(async () => {
  const browser = await chromium.launch({ headless: true });
  const errors = [];
  async function screenshot(page, name) { if (output) { await page.evaluate(() => window.scrollTo(0, 0)); await page.screenshot({ path: path.join(output, name + '.png'), fullPage: true }); } }
  async function noOverflow(page) {
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'document overflow');
  }
  async function goToReview(page) {
    await page.getByRole('radio', { name: /Business/ }).check();
    assert(await page.getByRole('radio', { name: /inactive/ }).isDisabled());
    await page.getByRole('button', { name: 'Continue to card', exact: true }).click();
    await page.getByLabel('Available card', { exact: true }).selectOption('MBZ-002');
    await page.getByRole('button', { name: 'Continue to PIN setup', exact: true }).click();
    assert.equal(await page.locator('input[type=password]').count(), 0);
    await page.getByRole('button', { name: 'Continue to review', exact: true }).click();
    await page.getByRole('button', { name: 'Confirm issuance', exact: true }).waitFor();
  }
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(base + '/customers');
    await page.getByRole('button', { name: 'Search', exact: true }).click();
    await page.getByText('Enter at least two characters.').waitFor();
    await page.getByLabel('Find customer').fill('nobody');
    await page.getByRole('button', { name: 'Search', exact: true }).click();
    await page.getByRole('heading', { name: 'No matching customers' }).waitFor();
    await page.getByLabel('Find customer').fill('CUS-10044');
    await page.getByRole('button', { name: 'Search', exact: true }).click();
    await page.getByRole('link', { name: 'View Musa Bello' }).click();
    await page.getByRole('heading', { name: 'Accounts', exact: true }).waitFor();
    await screenshot(page, 'phase04-customer-desktop');
    await page.locator('.page').getByRole('link', { name: 'Issue card', exact: true }).click();
    await goToReview(page);
    await noOverflow(page);
    await screenshot(page, 'phase04-review-desktop');
    await page.getByRole('button', { name: 'Confirm issuance', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await dialog.waitFor();
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press('Tab');
      assert(await dialog.evaluate(node => node.contains(document.activeElement)), 'dialog focus escaped');
    }
    await page.keyboard.press('Escape');
    assert(await page.getByRole('button', { name: 'Confirm issuance', exact: true }).evaluate(node => node === document.activeElement));
    await page.getByRole('button', { name: 'Confirm issuance', exact: true }).click();
    await page.getByRole('button', { name: 'Issue demo card', exact: true }).click();
    await page.getByRole('heading', { name: 'Demo card issued', exact: true }).waitFor();
    await page.getByRole('link', { name: 'View customer', exact: true }).click();
    await page.getByRole('link', { name: 'S4D5681-P3', exact: true }).first().waitFor();
    await page.getByRole('link', { name: 'Issuance History', exact: true }).click();
    await page.getByLabel('Search issuance').fill('S4D5681-P3');
    await page.getByRole('link', { name: 'S4D5681-P3', exact: true }).first().waitFor();
    assert.equal(await page.locator('.data-table-desktop tbody tr').count(), 1);
    await page.getByRole('link', { name: 'Overview', exact: true }).click();
    // Direct store snapshot also checks query-backed records shared by all routes.
    const state = await page.evaluate(async () => {
      const { issuanceApi } = await import('/src/api/issuance.api.js');
      const { inventoryApi } = await import('/src/api/inventory.api.js');
      return { history: await issuanceApi.history(), inventory: await inventoryApi.list() };
    });
    assert.equal(state.history.filter(row => row.cardId === 'MBZ-002').length, 1);
    assert.equal(state.inventory.cards.find(row => row.id === 'MBZ-002').status, 'ISSUED');
    assert.equal(await page.evaluate(() => localStorage.length + sessionStorage.length), 0);
    // Reload resets demo data and lets each viewport exercise the complete flow.
    for (const width of [320, 390, 768]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(base + '/issuance/new?customer=CUS-10044');
      await goToReview(page);
      await noOverflow(page);
      await screenshot(page, 'phase04-review-' + width);
      await page.getByRole('button', { name: 'Confirm issuance', exact: true }).click();
      await noOverflow(page);
      await page.getByRole('button', { name: 'Issue demo card', exact: true }).click();
      await page.getByRole('heading', { name: 'Demo card issued', exact: true }).waitFor();
      await noOverflow(page);
      await page.getByRole('link', { name: 'View customer', exact: true }).click();
      await page.getByRole('heading', { name: 'Accounts', exact: true }).waitFor();
      await noOverflow(page);
    }
    await page.goto(base + '/issuance/new?customer=CUS-10021');
    await page.getByRole('radio', { name: /Savings.*7891 Professional/ }).check();
    await page.getByRole('button', { name: 'Continue to card', exact: true }).click();
    await page.getByRole('heading', { name: 'No eligible cards available' }).waitFor();
    assert(await page.getByRole('button', { name: 'Continue to PIN setup', exact: true }).isDisabled());
    await page.getByRole('button', { name: 'Cancel issuance', exact: true }).click();
    await page.getByRole('button', { name: 'Discard selection', exact: true }).click();
    await page.getByLabel('Find customer').waitFor();
    await page.goto(base + '/customers/unknown');
    await page.getByRole('heading', { name: 'Customer not found', exact: true }).waitFor();
    // A card consumed after review must not issue again; recovery remains usable.
    await page.goto(base + '/issuance/new?customer=CUS-10044');
    await goToReview(page);
    await page.evaluate(async () => {
      const { cards } = await import('/src/data/mockData.js');
      cards.find(card => card.id === 'MBZ-002').status = 'BLOCKED';
    });
    await page.getByRole('button', { name: 'Confirm issuance', exact: true }).click();
    await page.getByRole('button', { name: 'Issue demo card', exact: true }).click();
    await page.getByText('Issuance was not completed.', { exact: false }).waitFor();
    await page.getByRole('button', { name: 'Close Confirm demo issuance', exact: true }).click();
    await page.getByRole('heading', { name: 'Selection is no longer available', exact: true }).waitFor();
    assert(await page.getByRole('button', { name: 'Confirm issuance', exact: true }).isDisabled());
    const failedHistory = await page.evaluate(async () => {
      const { issuanceApi } = await import('/src/api/issuance.api.js');
      return issuanceApi.history();
    });
    assert.equal(failedHistory.filter(row => row.cardId === 'MBZ-002').length, 0);
    assert.deepEqual(errors, []);
    console.log('PASS: lookup, profile, issuance, history, shared state, PIN exclusion, confirmation keyboard, cancellation, stale-stock rejection, missing/no-stock states and responsive widths 320/390/768/1440.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
