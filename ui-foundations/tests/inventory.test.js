import test from 'node:test';
import assert from 'node:assert/strict';
import { createInventoryStore } from '../src/data/inventoryMock.js';
import { inventoryReference } from '../src/data/inventoryReference.js';
import { validateReceipt } from '../src/features/inventory/validateReceipt.js';
import { buildDashboardSnapshot } from '../src/data/dashboardMock.js';

const payload = () => ({ requestId: 'request-one', batch: 'test-batch', branch: 'Head Office', product: 'Professional Debit', scheme: 'Verve', receivedOn: '2026-09-24', quantity: 2, cards: [{ serial: 'serial-001', lastFour: '1234', expiry: '2028-09' }, { serial: 'serial-002', lastFour: '5678', expiry: '2028-10' }] });

test('receipt is atomic, masked, normalized and shared with dashboard aggregation', () => {
  const records = [];
  const store = createInventoryStore(records);
  const receipt = store.receive(payload());
  assert.equal(receipt.quantity, 2);
  assert.equal(receipt.batch, 'TEST-BATCH');
  assert.equal(records.length, 2);
  assert(records.every(card => card.status === 'AVAILABLE' && !card.issuedOn && !('lastFour' in card)));
  assert.equal(records[0].pan, '•••• •••• •••• 1234');
  assert.equal(records[0].serial, 'SERIAL-001');
  assert.equal(store.list().batches[0].available, 2);
  const dashboard = buildDashboardSnapshot({ reportingDate: '2026-09-24', branches: [{ name: 'Head Office', minimumAvailable: 1 }], cards: records });
  assert.equal(dashboard.metrics.available, 2);
  assert.equal(dashboard.metrics.issued, 0);
  assert.deepEqual(dashboard.attention, []);
});

test('retrying the same receipt request does not add duplicate stock', () => {
  const records = [];
  const store = createInventoryStore(records);
  assert.deepEqual(store.receive(payload()), store.receive(payload()));
  assert.equal(records.length, 2);
});

test('duplicate batch and existing serial are rejected case-insensitively without partial writes', () => {
  const records = [];
  const store = createInventoryStore(records);
  store.receive(payload());
  const duplicate = { ...payload(), requestId: 'second' };
  assert.throws(() => store.receive(duplicate), error => Boolean(error.fieldErrors.batch));
  duplicate.batch = 'another-batch';
  duplicate.cards[0].serial = 'unique-001';
  assert.throws(() => store.receive(duplicate), error => Boolean(error.fieldErrors['cards.1.serial']));
  assert.equal(records.length, 2);
});

test('duplicates within one batch reject every row', () => {
  const records = [];
  const store = createInventoryStore(records);
  const input = payload();
  input.cards[1].serial = 'SERIAL-001';
  assert.throws(() => store.receive(input));
  assert.equal(records.length, 0);
});

test('quantity mismatches, zero and manual-limit overflow are rejected', () => {
  for (const quantity of [0, 1, 2.5, 51, 'abc']) {
    assert(validateReceipt({ ...payload(), quantity }, inventoryReference).quantity);
  }
});

test('full PAN and invalid expiry are rejected before storage', () => {
  const records = [];
  const store = createInventoryStore(records);
  const input = payload();
  input.cards[0].lastFour = '1234567890123456';
  input.cards[1].expiry = '2026-08';
  assert.throws(() => store.receive(input), error => Boolean(error.fieldErrors['cards.0.lastFour'] && error.fieldErrors['cards.1.expiry']));
  assert.equal(records.length, 0);
});

test('invalid dates and reference options are rejected', () => {
  for (const receivedOn of ['2026-02-30', '2026-09-25', 'bad-date']) assert(validateReceipt({ ...payload(), receivedOn }, inventoryReference).receivedOn);
  for (const key of ['branch', 'product', 'scheme']) assert(validateReceipt({ ...payload(), [key]: 'unknown' }, inventoryReference)[key]);
});

test('list and receipt return copies that cannot modify stored records', () => {
  const records = [];
  const store = createInventoryStore(records);
  const receipt = store.receive(payload());
  receipt.quantity = 99;
  const result = store.list();
  result.cards[0].pan = 'changed';
  result.reference.branches.push('Unknown');
  assert.equal(records[0].pan, '•••• •••• •••• 1234');
  assert.equal(store.receive(payload()).quantity, 2);
  assert.equal(store.list().reference.branches.length, 4);
});
