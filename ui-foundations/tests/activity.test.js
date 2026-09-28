import test from 'node:test';
import assert from 'node:assert/strict';
import { createActivityStore, activityStore } from '../src/data/activityStore.js';
import { activityEvents } from '../src/data/activityMock.js';
import { createIssuanceStore } from '../src/data/issuanceMock.js';
import { createInventoryStore } from '../src/data/inventoryMock.js';
import { inventoryReference } from '../src/data/inventoryReference.js';
import { cards, customers } from '../src/data/mockData.js';
import { customerAccounts } from '../src/data/issuanceMock.js';
import { activityApi } from '../src/api/demo/activity.api.js';
import { cardsApi } from '../src/api/demo/cards.api.js';
import { formatEventTime } from '../src/utils/eventTime.js';

const fixture = () => createActivityStore(activityEvents);

test('activity is newest first and combines actor, action, branch, date and reference filters', () => {
  const store = fixture();
  const rows = store.list();
  assert.equal(rows.length, 14);
  assert(rows.every((row, index) => !index || Date.parse(rows[index - 1].timestamp) >= Date.parse(row.timestamp)));
  assert.deepEqual(store.list({ actor: 'Demo Operator', action: 'FROZEN', branch: 'Kubwa', from: '2026-09-24', to: '2026-09-24', reference: ' evt-003 ' }).map(row => row.id), ['EVT-003']);
  assert.deepEqual(store.list({ actor: 'System', action: 'FROZEN' }), []);
  assert.deepEqual(store.list({ from: '2026-09-25', to: '2026-09-24' }), []);
});

test('search and references find event, card, batch and issuance IDs case-insensitively', () => {
  const store = fixture();
  for (const audit of [false, true]) {
    for (const search of ['evt-003', 'ADA', '2901', 'S4D5688-Q8', 'mbz-003']) assert(store.list({ search }, audit).some(row => row.id === 'EVT-003'));
    assert.equal(store.list({ reference: 'historical-MBZ-001' }, audit)[0].id, 'EVT-002');
    assert.equal(store.list({ reference: 'mbz-b001' }, audit)[0].id, 'EVT-009');
    assert.deepEqual(store.list({ search: 'not-a-record' }, audit), []);
  }
});

test('date range includes the full Lagos calendar day independent of browser timezone', () => {
  const base = activityEvents[0];
  const store = createActivityStore([
    { ...base, id: 'before', timestamp: '2026-09-23T22:59:59Z' },
    { ...base, id: 'start', timestamp: '2026-09-23T23:00:00Z' },
    { ...base, id: 'end', timestamp: '2026-09-24T22:59:59Z' },
    { ...base, id: 'after', timestamp: '2026-09-24T23:00:00Z' },
  ]);
  assert.deepEqual(store.list({ from: '2026-09-24', to: '2026-09-24' }).map(row => row.id), ['end', 'start']);
  assert.match(formatEventTime('2026-09-23T23:00:00Z'), /24 Sept 2026, 00:00:00/);
  assert.equal(formatEventTime('invalid'), '—');
});

test('audit includes stock and sensitive mutations; metadata reflects its own scope', () => {
  const store = fixture();
  const audit = store.list({}, true);
  assert.equal(audit.length, 12);
  assert(audit.some(row => row.action === 'RECEIVED'));
  assert(!audit.some(row => ['ACTIVATED', 'EXPIRED'].includes(row.action)));
  assert.deepEqual(store.options(true).actor, ['Demo Operator']);
  assert.deepEqual(store.list({ actor: 'System' }, true), []);
});

test('event snapshots are isolated, masked, idempotent and exclude payload fields', () => {
  const store = createActivityStore();
  const input = { ...activityEvents[0], pan: '1234567890123456', pin: 'test-secret', cvv: 'test-secret', token: 'test-secret' };
  const event = store.append(input);
  input.customer = 'Changed'; event.customer = 'Changed'; store.list()[0].actor = 'Changed';
  store.options().actor.push('Changed');
  assert.equal(store.get(input.id).pan, '•••• •••• •••• 3456');
  assert.equal(store.get(input.id).customer, activityEvents[0].customer);
  assert.equal(store.get(input.id).actor, 'System');
  assert(!JSON.stringify(store.list()).includes('test-secret'));
  store.append({ ...input, action: 'BLOCKED' });
  assert.equal(store.list().length, 1);
  assert.equal(store.get(input.id).action, 'ACTIVATED');
  assert.equal(store.get('missing'), null);
});

test('completed issuance creates one immutable audit record; retries and failures add none', () => {
  const records = structuredClone(cards);
  const events = createActivityStore();
  const store = createIssuanceStore(records, customers, customerAccounts, inventoryReference.reportingDate, events);
  const input = { requestId: 'audit-issue', customerId: 'CUS-10044', accountId: 'CUS-10044-business', cardId: 'MBZ-002' };
  assert.throws(() => store.issue({ ...input, cardId: 'missing' }));
  assert.equal(events.list().length, 0);
  const receipt = store.issue(input);
  store.issue(input);
  assert.throws(() => store.issue({ ...input, requestId: 'duplicate' }));
  assert.throws(() => store.issue({ ...input, pin: 'secret' }));
  records.find(card => card.id === input.cardId).customer = 'Changed later';
  const [event] = events.list({}, true);
  assert.equal(events.list().length, 1);
  assert.equal(event.reference, receipt.id);
  assert.equal(event.customer, 'Musa Bello');
  assert.equal(event.action, 'ISSUED');
});

test('stock receipt records every card exactly once, and rejected batches add no events', () => {
  const events = createActivityStore();
  const store = createInventoryStore([], inventoryReference, events);
  const input = { requestId: 'receive-audit', batch: 'AUDIT-BATCH', branch: 'Head Office', product: 'Professional Debit', scheme: 'Verve', receivedOn: '2026-09-24', quantity: 2, cards: [{ serial: 'AUDIT-1', lastFour: '1234', expiry: '2028-09' }, { serial: 'AUDIT-2', lastFour: '5678', expiry: '2028-09' }] };
  assert.throws(() => store.receive({ ...input, quantity: 3 }));
  assert.equal(events.list().length, 0);
  store.receive(input); store.receive(input);
  assert.throws(() => store.receive({ ...input, requestId: 'another' }));
  assert.equal(events.list({ reference: 'AUDIT-BATCH' }, true).length, 2);
  assert(events.list().every(row => row.action === 'RECEIVED' && row.customer === '—'));
});

test('fixture card targets agree with stock and query adapter returns isolated audit records', async () => {
  for (const event of activityStore.list()) {
    const card = cards.find(item => item.id === event.cardId);
    assert.equal(event.serial, card.serial);
    assert.equal(event.pan, card.pan);
  }
  const audit = await activityApi.audit({ reference: 'EVT-003' });
  assert.equal(audit.length, 1);
  audit[0].note = 'Changed';
  assert.notEqual((await activityApi.getEvent('EVT-003')).note, 'Changed');
  const detail = await cardsApi.getDetail('MBZ-003');
  assert.equal(detail.timeline.length, 3);
  assert.equal(detail.timeline[0].event, 'FROZEN');
  assert.match(detail.timeline[0].timestamp, /WAT$/);
});
