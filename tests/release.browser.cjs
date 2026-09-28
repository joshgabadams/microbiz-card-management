// Release QA using an existing Playwright installation; no production API needed.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const base = process.env.QA_BASE_URL || 'http://127.0.0.1:5173';
const output = process.env.QA_OUTPUT;
const routes = ['/overview', '/cards', '/cards/available', '/cards/issued', '/cards/frozen', '/cards/blocked', '/cards/expired', '/cards/MBZ-001', '/cards/missing', '/issuance/new', '/issuance/history', '/customers', '/customers/CUS-10021', '/customers/missing', '/inventory', '/inventory/receive', '/inventory/batches', '/inventory/transfers', '/inventory/reconciliation', '/activity', '/audit', '/approvals', '/admin/card-products', '/admin/branches', '/admin/users', '/settings', '/missing'];
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
    const navigate = async path => {
      await page.evaluate(path => { history.pushState({}, '', path); dispatchEvent(new PopStateEvent('popstate')); }, path);
      await page.waitForFunction(path => location.pathname === path && !document.querySelector('[aria-busy="true"]') && ![...document.querySelectorAll('[role="status"]')].some(node => /Loading/.test(node.textContent)), path);
      await page.locator('main').waitFor();
    };
    const noOverflow = async label => assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${label}: document overflow`);
    const auditSemantics = async path => {
      const problems = await page.evaluate(() => {
        const visible = node => node.getClientRects().length && getComputedStyle(node).visibility !== 'hidden';
        const problems = [];
        if (document.querySelectorAll('main').length !== 1) problems.push('exactly one main landmark required');
        if (document.querySelectorAll('h1').length !== 1) problems.push('exactly one page heading required');
        const ids = [...document.querySelectorAll('[id]')].map(node => node.id);
        if (new Set(ids).size !== ids.length) problems.push('duplicate IDs');
        const name = node => node.getAttribute('aria-label') || (node.getAttribute('aria-labelledby') || '').split(' ').map(id => document.getElementById(id)?.textContent || '').join('').trim() || [...(node.labels || [])].map(label => label.textContent).join('').trim() || (node.matches('button,a') ? node.textContent.trim() : '');
        for (const node of document.querySelectorAll('input:not([type=hidden]),select,textarea,button,a[href]')) if (visible(node) && !name(node)) problems.push(`unnamed ${node.tagName}`);
        for (const node of document.querySelectorAll('[aria-controls],[aria-describedby],[aria-labelledby]')) for (const attr of ['aria-controls','aria-describedby','aria-labelledby']) for (const id of (node.getAttribute(attr) || '').split(' ').filter(Boolean)) if (!document.getElementById(id)) problems.push(`missing ${attr} target`);
        // Automated contrast coverage is limited to opaque text on solid surfaces.
        const rgb = value => (value.match(/[\d.]+/g) || []).map(Number);
        const luminance = color => color.slice(0, 3).map(value => { value /= 255; return value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4; }).reduce((sum, value, index) => sum + value * [.2126, .7152, .0722][index], 0);
        for (const node of document.querySelectorAll('main *')) {
          if (!visible(node) || node.closest('[disabled],[aria-hidden="true"],.sr-only') || ![...node.childNodes].some(child => child.nodeType === 3 && child.textContent.trim())) continue;
          let background, gradient = false;
          for (let ancestor = node; ancestor; ancestor = ancestor.parentElement) {
            const style = getComputedStyle(ancestor);
            if (style.backgroundImage !== 'none' || Number(style.opacity) < 1) { gradient = true; break; }
            const color = rgb(style.backgroundColor);
            if (color.length === 3 || color[3] === 1) { background = color; break; }
          }
          if (gradient || !background) continue;
          const style = getComputedStyle(node), color = rgb(style.color);
          if (color.length === 4 && color[3] < 1) continue;
          const a = luminance(color), b = luminance(background);
          const ratio = (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
          const large = parseFloat(style.fontSize) >= 24 || parseFloat(style.fontSize) >= 18.66 && parseInt(style.fontWeight) >= 700;
          if (ratio < (large ? 3 : 4.5)) problems.push(`low contrast ${node.tagName}.${node.className}: ${ratio.toFixed(2)}`);
        }
        return problems;
      });
      assert.deepEqual(problems, [], path);
    };
    await page.goto(base + '/overview');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.getByRole('heading', { name: 'Cards Overview', exact: true }).waitFor();
    for (const width of [320, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const path of routes) {
        await navigate(path);
        await noOverflow(`${path} at ${width}`);
        await auditSemantics(path);
        if ([390, 1440].includes(width) && ['/inventory/receive','inventory/batches','/overview'].includes(path)) await shot(path.replaceAll('/', '-') + '-' + width);
      }
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    await navigate('/cards/MBZ-001');
    const firstTab = page.getByRole('tab', { name: 'Overview', exact: true });
    await firstTab.focus();
    await page.keyboard.press('ArrowRight');
    assert.equal(await page.getByRole('tab', { name: 'Activity', exact: true }).getAttribute('aria-selected'), 'true');
    await page.keyboard.press('End');
    assert.equal(await page.getByRole('tab', { name: 'Card Information', exact: true }).getAttribute('aria-selected'), 'true');
    await page.keyboard.press('Home');
    assert.equal(await firstTab.getAttribute('aria-selected'), 'true');
    const skip = page.getByRole('link', { name: 'Skip to content' });
    await skip.focus(); await page.keyboard.press('Enter');
    assert(await page.locator('main').evaluate(node => node === document.activeElement));
    await page.emulateMedia({ reducedMotion: 'reduce' });
    assert.equal(await page.evaluate(() => { const node = document.createElement('span'); node.className = 'brand-loader'; document.body.append(node); const animation = getComputedStyle(node).animationName; node.remove(); return animation; }), 'none');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole('button', { name: 'Open navigation' }).click();
    let dialog = page.getByRole('dialog');
    for (let i = 0; i < 35; i++) { await page.keyboard.press(i % 2 ? 'Tab' : 'Shift+Tab'); assert(await dialog.evaluate(node => node.contains(document.activeElement))); }
    await page.keyboard.press('Escape');
    assert(await page.getByRole('button', { name: 'Open navigation' }).evaluate(node => node === document.activeElement));
    await page.getByRole('button', { name: 'Open navigation' }).click();
    await dialog.getByRole('link', { name: 'Receive Cards', exact: true }).click();
    await page.getByRole('heading', { name: 'Receive Cards', exact: true }).waitFor();
    assert.equal(await dialog.count(), 0);
    await page.setViewportSize({ width: 1440, height: 1000 });
    // Inventory filter/pagination and intake cancel/validation/confirmation.
    await navigate('/inventory');
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.getByText('Page 2 of 2', { exact: true }).waitFor();
    await page.getByLabel('Search stock').fill('no-stock-match');
    await page.getByRole('heading', { name: 'No records found' }).waitFor();
    await page.getByRole('button', { name: 'Clear filters' }).click();
    await page.getByLabel('Branch', { exact: true }).selectOption('Mpape');
    await page.getByLabel('Product', { exact: true }).selectOption('Business Debit');
    await page.getByLabel('Status', { exact: true }).selectOption('AVAILABLE');
    assert.equal(await page.locator('.data-table-desktop tbody tr').count(), 1);
    await navigate('/inventory/receive');
    await page.getByRole('button', { name: 'Continue to card details' }).click();
    await page.getByRole('alert').filter({ hasText: 'Check the highlighted fields' }).waitFor();
    await page.waitForFunction(() => document.querySelector('.form-error-summary') === document.activeElement);
    await page.getByLabel('Batch reference').fill('RELEASE-BATCH');
    await page.getByLabel('Card product').selectOption('Professional Debit');
    await page.getByLabel('Receiving branch').selectOption('Head Office');
    await page.getByRole('button', { name: 'Continue to card details' }).click();
    await page.getByLabel('Serial number').fill('RELEASE-SERIAL');
    await page.getByLabel('PAN last four digits').fill('4821');
    await page.getByLabel('Expiry month').fill('2028-10');
    await page.getByRole('button', { name: 'Cancel intake' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Cancel', exact: true }).click();
    assert.equal(await page.getByLabel('Serial number').inputValue(), 'RELEASE-SERIAL');
    await page.getByRole('button', { name: 'Review batch' }).click();
    await page.getByRole('button', { name: 'Confirm receipt' }).click();
    dialog = page.getByRole('dialog');
    for (let i = 0; i < 8; i++) { await page.keyboard.press('Tab'); assert(await dialog.evaluate(node => node.contains(document.activeElement))); }
    await page.keyboard.press('Escape');
    assert(await page.getByRole('button', { name: 'Confirm receipt' }).evaluate(node => node === document.activeElement));
    await page.getByRole('button', { name: 'Confirm receipt' }).click();
    await dialog.getByRole('button', { name: 'Receive demo stock' }).click();
    await page.getByRole('heading', { name: 'Demo stock received' }).waitFor();
    await navigate('/inventory/batches');
    await page.getByLabel('Search batches').fill('RELEASE-BATCH');
    await page.getByRole('button', { name: 'View batch RELEASE-BATCH' }).filter({ visible: true }).click();
    dialog = page.getByRole('dialog');
    await dialog.getByText('RELEASE-SERIAL', { exact: true }).filter({ visible: true }).waitFor();
    await page.setViewportSize({ width: 320, height: 844 });
    assert(await dialog.evaluate(node => node.scrollWidth <= node.clientWidth));
    await shot('batch-drawer-mobile');
    await page.keyboard.press('Escape');
    await page.setViewportSize({ width: 1440, height: 1000 });
    await navigate('/overview');
    assert((await page.locator('.kpi').first().innerText()).includes('7'));
    await navigate('/inventory/transfers');
    await page.getByLabel('Source branch').selectOption('Head Office');
    await page.getByLabel('Destination branch').selectOption('Mpape');
    await page.getByLabel('Requested quantity').fill('1');
    await page.getByRole('status').filter({ hasText: 'Preview: 1 cards' }).waitFor();
    assert(await page.getByRole('button', { name: 'Submit transfer' }).isDisabled());
    await navigate('/inventory/reconciliation');
    await page.getByLabel('Count branch').selectOption('Head Office');
    await page.getByLabel('Physical count').fill('0');
    await page.getByRole('status').filter({ hasText: 'Discrepancy requires review' }).waitFor();
    assert(await page.getByRole('button', { name: 'Submit reconciliation' }).isDisabled());
    // A new session must remount local form state and dismiss prior dialogs.
    await navigate('/inventory/receive');
    await page.getByLabel('Batch reference').fill('PREVIOUS-OPERATOR');
    await page.getByRole('button', { name: 'Cancel intake' }).click();
    await page.getByRole('dialog').waitFor();
    await page.evaluate(async () => {
      const { sessionStore, normalizeSession } = await import('/src/services/session.js');
      sessionStore.set(normalizeSession({ user: { id: 'new-operator', name: 'New Operator' }, permissions: [...sessionStore.get().permissions] }));
    });
    await page.waitForFunction(() => !document.querySelector('dialog') && document.querySelector('#receipt-batch')?.value === '');
    assert.deepEqual(errors, []);
    console.log(`PASS: ${routes.length} routes at 5 widths, semantic checks, tabs, skip link, drawer keyboard, reduced motion, intake/batch/stock workflows and no storage/runtime errors.`);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
